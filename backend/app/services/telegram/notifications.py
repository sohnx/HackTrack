# backend/app/services/telegram/notifications.py
# Proactive push notifications — called by the scheduler.

import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.hackathon import Hackathon, HackathonStatus
from app.models.notification import Notification, NotificationType
from app.services.telegram.bot import get_application
from app.utils.date import days_until

logger = logging.getLogger(__name__)

THRESHOLDS = [0, 1, 3]  # days before deadline to send reminders


async def send_message(chat_id: str, text: str) -> bool:
    app = get_application()
    if not app:
        logger.warning("Telegram app not initialised — skipping send")
        return False
    try:
        await app.bot.send_message(chat_id=int(chat_id), text=text, parse_mode="MarkdownV2")
        return True
    except Exception as e:
        logger.warning("Failed to send Telegram message to %s: %s", chat_id, e)
        return False


def _escape_md(text: str) -> str:
    """Escape all MarkdownV2 special characters."""
    for ch in r"\.-()|!|[]{+=#><":
        text = text.replace(ch, f"\\{ch}")
    return text


async def send_deadline_reminders():
    """Called by scheduler at 9am daily.
    - Creates in-app Notification rows for ALL users (deduped).
    - Sends Telegram message only if user.telegram_chat_id is set.
    Covers deadlines 0 (today), 1, and 3 days away.
    """
    db: Session = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            hackathons = (
                db.query(Hackathon)
                .filter(
                    Hackathon.owner_id == user.id,
                    Hackathon.status.notin_([HackathonStatus.completed]),
                    Hackathon.deadline.isnot(None),
                )
                .all()
            )

            telegram_lines = []

            for h in hackathons:
                d = days_until(h.deadline)
                if d not in THRESHOLDS:
                    continue

                label = "today" if d == 0 else f"in {d} day{'s' if d != 1 else ''}"

                # ── In-app notification (dedup: same user + same title + same label) ──
                dedup_title = f"Deadline {label}"
                existing = (
                    db.query(Notification)
                    .filter(
                        Notification.user_id == user.id,
                        Notification.title == dedup_title,
                        Notification.message.contains(h.title[:40]),
                    )
                    .first()
                )
                if not existing:
                    db.add(Notification(
                        user_id=user.id,
                        title=dedup_title,
                        message=f"'{h.title}' deadline is {label}!",
                        type=NotificationType.deadline,
                        is_read=False,
                    ))

                # ── Telegram line ──
                if user.telegram_chat_id:
                    urgency = "🔴" if d <= 1 else "🟡"
                    tg_label = "TODAY" if d == 0 else f"in {d} day{'s' if d != 1 else ''}"
                    telegram_lines.append(
                        f"{urgency} *{_escape_md(h.title)}* — deadline {tg_label}\\!"
                    )

            db.commit()

            if telegram_lines and user.telegram_chat_id:
                text = "*HackTrack Deadline Reminder*\n\n" + "\n".join(telegram_lines)
                await send_message(user.telegram_chat_id, text)

    except Exception as e:
        logger.error("send_deadline_reminders failed: %s", e, exc_info=True)
        db.rollback()
    finally:
        db.close()
