# backend/app/main.py

import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import api_router
from app.core.scheduler import start_scheduler, stop_scheduler
from app.services.telegram.bot import build_app as build_telegram_app

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()

    tg_app = build_telegram_app()
    if tg_app:
        try:
            await asyncio.wait_for(tg_app.initialize(), timeout=10)
            await tg_app.start()
            await tg_app.updater.start_polling(drop_pending_updates=True)
            logger.info("Telegram bot started")
        except Exception as e:
            logger.warning(f"Telegram bot unavailable, continuing without it: {e}")
            tg_app = None

    yield

    if tg_app:
        await tg_app.updater.stop()
        await tg_app.stop()
        await tg_app.shutdown()

    stop_scheduler()

app = FastAPI(title="HackTrack API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}