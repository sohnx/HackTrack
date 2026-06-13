# backend/app/models/discovered_hackathon.py

from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db.base import Base
from app.models.hackathon import HackathonSource

class DiscoveredHackathon(Base):
    """Global, deduplicated hackathon listings pulled in by scrapers."""
    __tablename__ = "discovered_hackathons"
    __table_args__ = (UniqueConstraint("source", "url", name="uq_discovered_source_url"),)

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title        = Column(String, nullable=False)
    description  = Column(Text, nullable=True)
    url          = Column(String, nullable=True)
    banner_url   = Column(String, nullable=True)
    source       = Column(Enum(HackathonSource), nullable=False)
    location     = Column(String, nullable=True)
    is_online    = Column(Boolean, default=True)
    prize_pool   = Column(String, nullable=True)
    team_size    = Column(String, nullable=True)
    start_date   = Column(DateTime(timezone=True), nullable=True)
    end_date     = Column(DateTime(timezone=True), nullable=True)
    deadline     = Column(DateTime(timezone=True), nullable=True)
    tags         = Column(String, nullable=True)  # comma-separated
    last_synced  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at   = Column(DateTime(timezone=True), server_default=func.now())