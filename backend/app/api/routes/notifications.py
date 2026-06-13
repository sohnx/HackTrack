# backend/app/api/routes/notifications.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationOut, NotificationUpdate

router = APIRouter()


@router.get("", response_model=list[NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.patch("/{notification_id}", response_model=NotificationOut)
def update_notification(notification_id: UUID, payload: NotificationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not n:
        raise HTTPException(404, "Notification not found")
    n.is_read = payload.is_read
    db.commit(); db.refresh(n)
    return n


@router.post("/read-all", status_code=204)
def read_all(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()


@router.delete("/{notification_id}", status_code=204)
def delete_notification(notification_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not n:
        raise HTTPException(404, "Notification not found")
    db.delete(n); db.commit()


# ── Dev / test endpoints ──────────────────────────────────────────────────────

@router.post("/test-telegram")
async def test_telegram(current_user: User = Depends(get_current_user)):
    """Send a quick test message to verify Telegram link is working."""
    if not current_user.telegram_chat_id:
        raise HTTPException(400, "No Telegram account linked. Go to Settings → Connect Telegram.")
    from app.services.telegram.notifications import send_message
    ok = await send_message(
        current_user.telegram_chat_id,
        "✅ *HackTrack* Telegram connection is working\\!",
    )
    if not ok:
        raise HTTPException(500, "Failed to send message — check TELEGRAM_BOT_TOKEN in .env")
    return {"ok": True, "chat_id": current_user.telegram_chat_id}


@router.post("/test-deadline-reminders")
async def test_deadline_reminders(current_user: User = Depends(get_current_user)):
    """Manually trigger the deadline reminder job (normally runs at 9am daily)."""
    from app.services.telegram.notifications import send_deadline_reminders
    await send_deadline_reminders()
    return {"triggered": True}
