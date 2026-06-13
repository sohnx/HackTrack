# backend/app/api/routes/telegram.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.utils.telegram_tokens import generate_link_token
from pydantic import BaseModel

router = APIRouter()


class TelegramLinkOut(BaseModel):
    link: str
    token: str


class TelegramStatusOut(BaseModel):
    connected: bool


@router.get("/status", response_model=TelegramStatusOut)
def telegram_status(current_user: User = Depends(get_current_user)):
    return {"connected": current_user.telegram_chat_id is not None}


@router.post("/link", response_model=TelegramLinkOut)
def generate_link(current_user: User = Depends(get_current_user)):
    token = generate_link_token(str(current_user.id))
    bot_username = settings.TELEGRAM_BOT_USERNAME or "hacktrack_bot"
    link = f"https://t.me/{bot_username}?start={token}"
    return {"link": link, "token": token}


@router.post("/disconnect", status_code=204)
def disconnect(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.telegram_chat_id = None
    db.commit()
