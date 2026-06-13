# backend/app/services/telegram/bot.py

import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User
from app.models.hackathon import Hackathon, HackathonStatus
from app.utils.telegram_tokens import verify_link_token
from app.utils.date import days_until

logger = logging.getLogger(__name__)

_app: Application | None = None


def get_application() -> Application | None:
    return _app


def build_app() -> Application:
    global _app
    if not settings.TELEGRAM_BOT_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN not set — Telegram bot disabled")
        return None
    _app = (
        Application.builder()
        .token(settings.TELEGRAM_BOT_TOKEN)
        .build()
    )
    _app.add_handler(CommandHandler("start", cmd_start))
    _app.add_handler(CommandHandler("hackathons", cmd_hackathons))
    _app.add_handler(CommandHandler("deadlines", cmd_deadlines))
    _app.add_handler(CommandHandler("help", cmd_help))
    _app.add_handler(CallbackQueryHandler(handle_callback))
    return _app


# ── helpers ──────────────────────────────────────────────────────────────────

def _get_user_by_chat(chat_id: int) -> User | None:
    db = SessionLocal()
    try:
        return db.query(User).filter(User.telegram_chat_id == str(chat_id)).first()
    finally:
        db.close()


def _active_hackathons(user_id) -> list[Hackathon]:
    db = SessionLocal()
    try:
        return (
            db.query(Hackathon)
            .filter(
                Hackathon.owner_id == user_id,
                Hackathon.status.in_([HackathonStatus.upcoming, HackathonStatus.ongoing]),
            )
            .order_by(Hackathon.deadline)
            .all()
        )
    finally:
        db.close()


# ── commands ─────────────────────────────────────────────────────────────────

async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    args = ctx.args  # /start <token>
    chat_id = update.effective_chat.id

    if args:
        token = args[0]
        db = SessionLocal()
        try:
            user = verify_link_token(db, token)
            if not user:
                await update.message.reply_text("❌ Invalid or expired link. Generate a new one from HackTrack.")
                return
            user.telegram_chat_id = str(chat_id)
            db.commit()
            await update.message.reply_text(
                f"✅ Linked! Welcome, *{user.username}*\\.\n\n"
                "Use /hackathons to see your active hackathons\\.\n"
                "Use /deadlines for upcoming deadlines\\.\n"
                "Use /help for all commands\\.",
                parse_mode="MarkdownV2",
            )
        finally:
            db.close()
        return

    # Not linked yet
    await update.message.reply_text(
        "👋 Welcome to *HackTrack Bot*\\!\n\n"
        "To link your account, go to HackTrack → Settings → Connect Telegram\\.",
        parse_mode="MarkdownV2",
    )


async def cmd_hackathons(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user = _get_user_by_chat(update.effective_chat.id)
    if not user:
        await update.message.reply_text("⚠️ Account not linked. Use /start with your link token.")
        return

    hackathons = _active_hackathons(user.id)
    if not hackathons:
        await update.message.reply_text("No active hackathons. Go discover some on HackTrack!")
        return

    lines = ["*Your Active Hackathons*\n"]
    for h in hackathons[:10]:
        status_icon = "🟢" if h.status == HackathonStatus.ongoing else "🔵"
        d = days_until(h.deadline)
        deadline_str = f"  ⏰ {d}d left" if d is not None else ""
        title = h.title.replace(".", "\\.").replace("-", "\\-").replace("(", "\\(").replace(")", "\\)")
        lines.append(f"{status_icon} *{title}*{deadline_str}")

    await update.message.reply_text("\n".join(lines), parse_mode="MarkdownV2")


async def cmd_deadlines(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    user = _get_user_by_chat(update.effective_chat.id)
    if not user:
        await update.message.reply_text("⚠️ Account not linked. Use /start with your link token.")
        return

    hackathons = _active_hackathons(user.id)
    with_deadlines = [(h, days_until(h.deadline)) for h in hackathons if h.deadline]
    with_deadlines.sort(key=lambda x: x[1] if x[1] is not None else 9999)

    if not with_deadlines:
        await update.message.reply_text("No upcoming deadlines found.")
        return

    lines = ["*Upcoming Deadlines*\n"]
    for h, d in with_deadlines[:10]:
        urgency = "🔴" if d is not None and d <= 3 else "🟡" if d is not None and d <= 7 else "⚪"
        label = f"{d} day{'s' if d != 1 else ''}" if d is not None else "unknown"
        title = h.title.replace(".", "\\.").replace("-", "\\-").replace("(", "\\(").replace(")", "\\)")
        lines.append(f"{urgency} *{title}* — {label}")

    await update.message.reply_text("\n".join(lines), parse_mode="MarkdownV2")


async def cmd_help(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "*HackTrack Bot Commands*\n\n"
        "/hackathons — List your active hackathons\n"
        "/deadlines — Upcoming deadlines sorted by urgency\n"
        "/help — Show this message",
        parse_mode="MarkdownV2",
    )


async def handle_callback(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.callback_query.answer()
