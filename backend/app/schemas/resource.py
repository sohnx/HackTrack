# backend/app/schemas/resource.py

from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from app.models.resource import ResourceType

class ResourceCreate(BaseModel):
    hackathon_id: UUID
    title: str
    url: str | None = None
    description: str | None = None
    type: ResourceType = ResourceType.link

class ResourceUpdate(BaseModel):
    title: str | None = None
    url: str | None = None
    description: str | None = None
    type: ResourceType | None = None

class ResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    hackathon_id: UUID
    user_id: UUID
    title: str
    url: str | None
    description: str | None
    type: ResourceType
    created_at: datetime