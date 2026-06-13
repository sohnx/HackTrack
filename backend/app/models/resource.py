# backend/app/models/resource.py

from sqlalchemy import Column, String, Text, Enum, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from app.db.base import Base

class ResourceType(str, enum.Enum):
    link     = "link"
    file     = "file"
    note     = "note"
    github   = "github"
    figma    = "figma"
    notion   = "notion"
    other    = "other"

class Resource(Base):
    __tablename__ = "resources"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hackathon_id = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"), nullable=False)
    user_id      = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title        = Column(String, nullable=False)
    url          = Column(String, nullable=True)
    description  = Column(Text, nullable=True)
    type         = Column(Enum(ResourceType), default=ResourceType.link)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    hackathon = relationship("Hackathon", back_populates="resources")
    user      = relationship("User", back_populates="resources")