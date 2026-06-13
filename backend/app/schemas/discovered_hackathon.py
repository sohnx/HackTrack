# backend/app/schemas/discovered_hackathon.py

from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime
from uuid import UUID
from app.models.hackathon import HackathonSource

class DiscoveredHackathonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str | None
    url: str | None
    banner_url: str | None
    source: HackathonSource
    location: str | None
    is_online: bool
    prize_pool: str | None
    team_size: str | None
    start_date: datetime | None
    end_date: datetime | None
    deadline: datetime | None
    tags: list[str] = []

    @field_validator("tags", mode="before")
    @classmethod
    def split_tags(cls, v):
        if isinstance(v, str):
            return [t for t in v.split(",") if t]
        return v or []