# backend/app/api/routes/hackathons.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.tag import Tag, HackathonTag
from app.schemas.hackathon import HackathonCreate, HackathonUpdate, HackathonOut

router = APIRouter()

def _load(q):
    return q.options(joinedload(Hackathon.tags).joinedload(HackathonTag.tag))

def _sync_tags(db: Session, hackathon: Hackathon, names: list[str]):
    db.query(HackathonTag).filter(HackathonTag.hackathon_id == hackathon.id).delete()
    for name in {n.strip() for n in names if n.strip()}:
        tag = db.query(Tag).filter(Tag.name == name).first()
        if not tag:
            tag = Tag(name=name)
            db.add(tag); db.flush()
        db.add(HackathonTag(hackathon_id=hackathon.id, tag_id=tag.id))

@router.get("", response_model=list[HackathonOut])
def list_hackathons(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _load(db.query(Hackathon)).filter(Hackathon.owner_id == current_user.id).all()

@router.post("", response_model=HackathonOut, status_code=201)
def create_hackathon(payload: HackathonCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = payload.model_dump(exclude={"tags"})
    hackathon = Hackathon(owner_id=current_user.id, **data)
    db.add(hackathon); db.flush()
    if payload.tags:
        _sync_tags(db, hackathon, payload.tags)
    db.commit(); db.refresh(hackathon)
    return _load(db.query(Hackathon)).filter(Hackathon.id == hackathon.id).first()

@router.get("/{hackathon_id}", response_model=HackathonOut)
def get_hackathon(hackathon_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    hackathon = _load(db.query(Hackathon)).filter(
        Hackathon.id == hackathon_id, Hackathon.owner_id == current_user.id
    ).first()
    if not hackathon:
        raise HTTPException(404, "Hackathon not found")
    return hackathon

@router.patch("/{hackathon_id}", response_model=HackathonOut)
def update_hackathon(hackathon_id: UUID, payload: HackathonUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    hackathon = db.query(Hackathon).filter(
        Hackathon.id == hackathon_id, Hackathon.owner_id == current_user.id
    ).first()
    if not hackathon:
        raise HTTPException(404, "Hackathon not found")
    data = payload.model_dump(exclude={"tags"}, exclude_unset=True)
    for k, v in data.items():
        setattr(hackathon, k, v)
    if payload.tags is not None:
        _sync_tags(db, hackathon, payload.tags)
    db.commit(); db.refresh(hackathon)
    return _load(db.query(Hackathon)).filter(Hackathon.id == hackathon.id).first()

@router.delete("/{hackathon_id}", status_code=204)
def delete_hackathon(hackathon_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    hackathon = db.query(Hackathon).filter(
        Hackathon.id == hackathon_id, Hackathon.owner_id == current_user.id
    ).first()
    if not hackathon:
        raise HTTPException(404, "Hackathon not found")
    db.delete(hackathon); db.commit()