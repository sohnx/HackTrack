# backend/app/schemas/milestone.py

from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from app.models.milestone import MilestoneStatus

class MilestoneCreate(BaseModel):
    hackathon_id: UUID
    title: str
    description: str | None = None
    status: MilestoneStatus = MilestoneStatus.todo
    due_date: datetime | None = None

class MilestoneUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: MilestoneStatus | None = None
    due_date: datetime | None = None
    is_completed: bool | None = None

class MilestoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    hackathon_id: UUID
    title: str
    description: str | None
    status: MilestoneStatus
    due_date: datetime | None
    is_completed: bool
    created_at: datetime