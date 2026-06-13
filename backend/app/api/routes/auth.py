# backend/app/api/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from app.db.session import get_db
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, TokenOut, GoogleAuthPayload

router = APIRouter()

@router.post("/register", response_model=TokenOut, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(400, "Username taken")
    user = User(email=payload.email, username=payload.username,
                password=hash_password(payload.password))
    db.add(user); db.commit(); db.refresh(user)
    return TokenOut(access_token=create_access_token(str(user.id)),
                    user=UserOut.model_validate(user))

@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(401, "Invalid credentials")
    return TokenOut(access_token=create_access_token(str(user.id)),
                    user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/google", response_model=TokenOut)
def google_auth(payload: GoogleAuthPayload, db: Session = Depends(get_db)):
    try:
        idinfo = google_id_token.verify_oauth2_token(
            payload.credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(401, "Invalid Google token")

    google_sub = idinfo["sub"]
    email = idinfo.get("email")
    name = idinfo.get("name") or (email.split("@")[0] if email else "user")
    picture = idinfo.get("picture")

    user = db.query(User).filter(User.google_id == google_sub).first()
    if not user and email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_sub

    if not user:
        base_username = "".join(ch for ch in name if ch.isalnum()) or "user"
        username = base_username
        suffix = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{suffix}"
            suffix += 1

        user = User(
            email=email,
            username=username,
            password=None,
            google_id=google_sub,
            avatar_url=picture,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    return TokenOut(access_token=create_access_token(str(user.id)),
                    user=UserOut.model_validate(user))