# backend/app/models/tag.py

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base

class Tag(Base):
    __tablename__ = "tags"

    id   = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False, index=True)

    hackathons = relationship("HackathonTag", back_populates="tag", cascade="all, delete")

class HackathonTag(Base):
    __tablename__ = "hackathon_tags"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hackathon_id = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"), nullable=False)
    tag_id       = Column(UUID(as_uuid=True), ForeignKey("tags.id"), nullable=False)

    hackathon = relationship("Hackathon", back_populates="tags")
    tag       = relationship("Tag", back_populates="hackathons")