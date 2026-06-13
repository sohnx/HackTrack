# backend/app/api/routes/__init__.py

from fastapi import APIRouter
from .auth import router as auth_router
from .hackathons import router as hackathons_router
from .milestones import router as milestones_router
from .teams import router as teams_router
from .resources import router as resources_router
from .notifications import router as notifications_router
from .sync import router as sync_router
from .telegram import router as telegram_router

api_router = APIRouter()
api_router.include_router(auth_router,          prefix="/auth",          tags=["Auth"])
api_router.include_router(hackathons_router,    prefix="/hackathons",    tags=["Hackathons"])
api_router.include_router(milestones_router,    prefix="/milestones",    tags=["Milestones"])
api_router.include_router(teams_router,         prefix="/teams",         tags=["Teams"])
api_router.include_router(resources_router,     prefix="/resources",     tags=["Resources"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(sync_router,          prefix="/sync",          tags=["Sync"])
api_router.include_router(telegram_router,      prefix="/telegram",      tags=["Telegram"])
