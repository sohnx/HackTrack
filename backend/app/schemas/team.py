# backend/app/schemas/team.py

from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from app.models.team import TeamRole

class TeamCreate(BaseModel):
    hackathon_id: UUID
    name: str
    description: str | None = None

class TeamUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class TeamMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    role: TeamRole
    joined_at: datetime

class TeamOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    hackathon_id: UUID
    name: str
    description: str | None
    invite_code: str | None
    created_at: datetime
    members: list[TeamMemberOut] = []