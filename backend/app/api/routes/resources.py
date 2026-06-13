# backend/app/api/routes/resources.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceOut

router = APIRouter()

def _owned_hackathon(db: Session, hackathon_id: UUID, user: User) -> Hackathon:
    h = db.query(Hackathon).filter(Hackathon.id == hackathon_id, Hackathon.owner_id == user.id).first()
    if not h:
        raise HTTPException(404, "Hackathon not found")
    return h

def _owned_resource(db: Session, resource_id: UUID, user: User) -> Resource:
    r = (
        db.query(Resource)
        .join(Hackathon, Hackathon.id == Resource.hackathon_id)
        .filter(Resource.id == resource_id, Hackathon.owner_id == user.id)
        .first()
    )
    if not r:
        raise HTTPException(404, "Resource not found")
    return r

@router.get("", response_model=list[ResourceOut])
def list_resources(hackathon_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _owned_hackathon(db, hackathon_id, current_user)
    return db.query(Resource).filter(Resource.hackathon_id == hackathon_id).all()

@router.post("", response_model=ResourceOut, status_code=201)
def create_resource(payload: ResourceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _owned_hackathon(db, payload.hackathon_id, current_user)
    resource = Resource(**payload.model_dump(), user_id=current_user.id)
    db.add(resource); db.commit(); db.refresh(resource)
    return resource

@router.patch("/{resource_id}", response_model=ResourceOut)
def update_resource(resource_id: UUID, payload: ResourceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = _owned_resource(db, resource_id, current_user)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(resource, k, v)
    db.commit(); db.refresh(resource)
    return resource

@router.delete("/{resource_id}", status_code=204)
def delete_resource(resource_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = _owned_resource(db, resource_id, current_user)
    db.delete(resource); db.commit()