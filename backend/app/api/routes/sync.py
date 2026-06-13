# backend/app/api/routes/sync.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.discovered_hackathon import DiscoveredHackathon
from app.schemas.discovered_hackathon import DiscoveredHackathonOut
from app.services.sync import run_sync
from app.services.scrapers import SCRAPERS

router = APIRouter()

@router.post("/run")
async def trigger_sync(
    sources: list[str] | None = Query(default=None),
    current_user: User = Depends(get_current_user),
):
    return await run_sync(sources)

@router.get("/sources")
def list_sources(current_user: User = Depends(get_current_user)):
    return list(SCRAPERS.keys())

@router.get("/discovered", response_model=list[DiscoveredHackathonOut])
def list_discovered(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(DiscoveredHackathon).order_by(DiscoveredHackathon.last_synced.desc()).all()