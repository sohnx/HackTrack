# backend/app/utils/telegram_tokens.py
# Short-lived tokens for linking a Telegram chat to a HackTrack account.
# Stored in-memory (per-process). Fine for single-instance deployments.

import secrets
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.user import User

TOKEN_TTL_MINUTES = 15
_store: dict[str, tuple[str, datetime]] = {}  # token -> (user_id, expires_at)


def generate_link_token(user_id: str) -> str:
    token = secrets.token_urlsafe(24)
    expires = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_TTL_MINUTES)
    _store[token] = (user_id, expires)
    return token


def verify_link_token(db: Session, token: str) -> User | None:
    entry = _store.pop(token, None)
    if not entry:
        return None
    user_id, expires = entry
    if datetime.now(timezone.utc) > expires:
        return None
    return db.query(User).filter(User.id == user_id).first()
