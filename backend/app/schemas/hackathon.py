# backend/app/schemas/hackathon.py

from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime
from uuid import UUID
from app.models.hackathon import HackathonStatus, HackathonSource

class HackathonBase(BaseModel):
    title: str
    description: str | None = None
    url: str | None = None
    banner_url: str | None = None
    source: HackathonSource = HackathonSource.manual
    location: str | None = None
    is_online: bool = True
    prize_pool: str | None = None
    team_size: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    deadline: datetime | None = None

class HackathonCreate(HackathonBase):
    tags: list[str] | None = None

class HackathonUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    url: str | None = None
    banner_url: str | None = None
    source: HackathonSource | None = None
    status: HackathonStatus | None = None
    location: str | None = None
    is_online: bool | None = None
    prize_pool: str | None = None
    team_size: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    deadline: datetime | None = None
    is_saved: bool | None = None
    tags: list[str] | None = None

class HackathonOut(HackathonBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_id: UUID
    status: HackathonStatus
    is_saved: bool
    created_at: datetime
    tags: list[str] = []

    @field_validator("tags", mode="before")
    @classmethod
    def flatten_tags(cls, v):
        if v and hasattr(v[0], "tag"):
            return [ht.tag.name for ht in v]
        return v or []