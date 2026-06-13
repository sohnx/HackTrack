# backend/app/api/routes/sync.py

from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.hackathon import Hackathon, HackathonStatus
from app.models.milestone import Milestone
from app.models.discovered_hackathon import DiscoveredHackathon
from app.schemas.discovered_hackathon import DiscoveredHackathonOut
from app.schemas.hackathon import HackathonOut
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


@router.post("/discovered/{discovered_id}/track", response_model=HackathonOut, status_code=201)
def track_discovered_hackathon(
    discovered_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a discovered hackathon as 'yes' — copies it into the user's
    tracked hackathon list and auto-creates a deadline milestone."""
    discovered = db.query(DiscoveredHackathon).filter(DiscoveredHackathon.id == discovered_id).first()
    if not discovered:
        raise HTTPException(404, "Discovered hackathon not found")

    existing = db.query(Hackathon).filter(
        Hackathon.owner_id == current_user.id,
        Hackathon.source == discovered.source,
        Hackathon.url == discovered.url,
    ).first()
    if existing:
        return existing

    hackathon = Hackathon(
        owner_id=current_user.id,
        title=discovered.title,
        description=discovered.description,
        url=discovered.url,
        banner_url=discovered.banner_url,
        source=discovered.source,
        status=HackathonStatus.upcoming,
        location=discovered.location,
        is_online=discovered.is_online,
        prize_pool=discovered.prize_pool,
        team_size=discovered.team_size,
        start_date=discovered.start_date,
        end_date=discovered.end_date,
        deadline=discovered.deadline,
    )
    db.add(hackathon)
    db.flush()

    if discovered.deadline:
        db.add(Milestone(
            hackathon_id=hackathon.id,
            title="Submission Deadline",
            description="Auto-created from discovered hackathon",
            due_date=discovered.deadline,
        ))

    db.commit()
    db.refresh(hackathon)
    return hackathon