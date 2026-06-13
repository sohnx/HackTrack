# backend/app/api/routes/teams.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from uuid import UUID
import secrets
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.team import Team, TeamMember, TeamRole
from app.schemas.team import TeamCreate, TeamUpdate, TeamOut

router = APIRouter()

def _load(q):
    return q.options(joinedload(Team.members))

def _owned_hackathon(db: Session, hackathon_id: UUID, user: User) -> Hackathon:
    h = db.query(Hackathon).filter(Hackathon.id == hackathon_id, Hackathon.owner_id == user.id).first()
    if not h:
        raise HTTPException(404, "Hackathon not found")
    return h

def _accessible_team(db: Session, team_id: UUID, user: User) -> Team:
    team = _load(db.query(Team)).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(404, "Team not found")
    is_owner = db.query(Hackathon).filter(Hackathon.id == team.hackathon_id, Hackathon.owner_id == user.id).first()
    is_member = db.query(TeamMember).filter(TeamMember.team_id == team.id, TeamMember.user_id == user.id).first()
    if not is_owner and not is_member:
        raise HTTPException(404, "Team not found")
    return team

@router.get("", response_model=list[TeamOut])
def list_teams(hackathon_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _owned_hackathon(db, hackathon_id, current_user)
    return _load(db.query(Team)).filter(Team.hackathon_id == hackathon_id).all()

@router.post("", response_model=TeamOut, status_code=201)
def create_team(payload: TeamCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _owned_hackathon(db, payload.hackathon_id, current_user)
    team = Team(**payload.model_dump(), invite_code=secrets.token_hex(4))
    db.add(team); db.flush()
    db.add(TeamMember(team_id=team.id, user_id=current_user.id, role=TeamRole.owner))
    db.commit(); db.refresh(team)
    return _load(db.query(Team)).filter(Team.id == team.id).first()

@router.patch("/{team_id}", response_model=TeamOut)
def update_team(team_id: UUID, payload: TeamUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    team = _accessible_team(db, team_id, current_user)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(team, k, v)
    db.commit(); db.refresh(team)
    return _load(db.query(Team)).filter(Team.id == team.id).first()

@router.delete("/{team_id}", status_code=204)
def delete_team(team_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    team = _accessible_team(db, team_id, current_user)
    db.delete(team); db.commit()

@router.post("/join/{invite_code}", response_model=TeamOut)
def join_team(invite_code: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    team = db.query(Team).filter(Team.invite_code == invite_code).first()
    if not team:
        raise HTTPException(404, "Invalid invite code")
    exists = db.query(TeamMember).filter(TeamMember.team_id == team.id, TeamMember.user_id == current_user.id).first()
    if not exists:
        db.add(TeamMember(team_id=team.id, user_id=current_user.id, role=TeamRole.member))
        db.commit()
    return _load(db.query(Team)).filter(Team.id == team.id).first()

@router.delete("/{team_id}/members/{user_id}", status_code=204)
def remove_member(team_id: UUID, user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    team = _accessible_team(db, team_id, current_user)
    member = db.query(TeamMember).filter(TeamMember.team_id == team.id, TeamMember.user_id == user_id).first()
    if not member:
        raise HTTPException(404, "Member not found")
    db.delete(member); db.commit()