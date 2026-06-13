# backend/app/api/routes/milestones.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.milestone import Milestone
from app.schemas.milestone import MilestoneCreate, MilestoneUpdate, MilestoneOut

router = APIRouter()

def _owned_hackathon(db: Session, hackathon_id: UUID, user: User) -> Hackathon:
    h = db.query(Hackathon).filter(Hackathon.id == hackathon_id, Hackathon.owner_id == user.id).first()
    if not h:
        raise HTTPException(404, "Hackathon not found")
    return h

def _owned_milestone(db: Session, milestone_id: UUID, user: User) -> Milestone:
    m = (
        db.query(Milestone)
        .join(Hackathon, Hackathon.id == Milestone.hackathon_id)
        .filter(Milestone.id == milestone_id, Hackathon.owner_id == user.id)
        .first()
    )
    if not m:
        raise HTTPException(404, "Milestone not found")
    return m

@router.get("", response_model=list[MilestoneOut])
def list_milestones(hackathon_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _owned_hackathon(db, hackathon_id, current_user)
    return db.query(Milestone).filter(Milestone.hackathon_id == hackathon_id).all()

@router.post("", response_model=MilestoneOut, status_code=201)
def create_milestone(payload: MilestoneCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _owned_hackathon(db, payload.hackathon_id, current_user)
    milestone = Milestone(**payload.model_dump())
    db.add(milestone); db.commit(); db.refresh(milestone)
    return milestone

@router.patch("/{milestone_id}", response_model=MilestoneOut)
def update_milestone(milestone_id: UUID, payload: MilestoneUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    milestone = _owned_milestone(db, milestone_id, current_user)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(milestone, k, v)
    db.commit(); db.refresh(milestone)
    return milestone

@router.delete("/{milestone_id}", status_code=204)
def delete_milestone(milestone_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    milestone = _owned_milestone(db, milestone_id, current_user)
    db.delete(milestone); db.commit()