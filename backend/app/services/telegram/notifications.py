# backend/app/services/telegram/notifications.py
# Proactive push notifications — called by the scheduler.

import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.hackathon import Hackathon, HackathonStatus
from app.services.telegram.bot import get_application
from app.utils.date import days_until

logger = logging.getLogger(__name__)


async def send_message(chat_id: str, text: str) -> bool:
    app = get_application()
    if not app:
        return False
    try:
        await app.bot.send_message(chat_id=int(chat_id), text=text, parse_mode="MarkdownV2")
        return True
    except Exception as e:
        logger.warning("Failed to send Telegram message to %s: %s", chat_id, e)
        return False


async def send_deadline_reminders():
    """Called by scheduler. Sends reminders for hackathons with deadlines in 1 or 3 days."""
    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        thresholds = [1, 3]  # days

        users = db.query(User).filter(User.telegram_chat_id.isnot(None)).all()
        for user in users:
            hackathons = (
                db.query(Hackathon)
                .filter(
                    Hackathon.owner_id == user.id,
                    Hackathon.status.in_([HackathonStatus.upcoming, HackathonStatus.ongoing]),
                    Hackathon.deadline.isnot(None),
                )
                .all()
            )
            messages = []
            for h in hackathons:
                d = days_until(h.deadline)
                if d in thresholds:
                    urgency = "🔴" if d == 1 else "🟡"
                    title = h.title.replace(".", "\\.").replace("-", "\\-").replace("(", "\\(").replace(")", "\\)")
                    messages.append(f"{urgency} *{title}* deadline in *{d} day{'s' if d != 1 else ''}*\\!")

            if messages:
                text = "*HackTrack Deadline Reminder*\n\n" + "\n".join(messages)
                await send_message(user.telegram_chat_id, text)
    finally:
        db.close()
