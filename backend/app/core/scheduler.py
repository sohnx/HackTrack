# backend/app/core/scheduler.py

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.sync import run_sync

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

async def _scheduled_sync():
    logger.info("Running scheduled hackathon sync")
    summary = await run_sync()
    logger.info("Sync complete: %s", summary)

async def _deadline_reminders():
    from app.services.telegram.notifications import send_deadline_reminders
    await send_deadline_reminders()

def start_scheduler():
    scheduler.add_job(_scheduled_sync,      "interval", hours=6,  id="hackathon_sync",       replace_existing=True)
    scheduler.add_job(_deadline_reminders,  "cron",     hour=9,   id="deadline_reminders",   replace_existing=True)
    scheduler.start()

def stop_scheduler():
    scheduler.shutdown(wait=False)
