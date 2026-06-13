# backend/app/api/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, TokenOut

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