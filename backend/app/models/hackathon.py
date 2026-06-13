# backend/app/models/hackathon.py

from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from app.db.base import Base

class HackathonStatus(str, enum.Enum):
    upcoming   = "upcoming"
    ongoing    = "ongoing"
    completed  = "completed"
    saved      = "saved"

class HackathonSource(str, enum.Enum):
    devfolio   = "devfolio"
    devpost    = "devpost"
    unstop     = "unstop"
    hack2skill = "hack2skill"
    ethglobal  = "ethglobal"
    mlh        = "mlh"
    hackerearth= "hackerearth"
    kaggle     = "kaggle"
    reskilll   = "reskilll"
    manual     = "manual"

class Hackathon(Base):
    __tablename__ = "hackathons"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id     = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title        = Column(String, nullable=False)
    description  = Column(Text, nullable=True)
    url          = Column(String, nullable=True)
    banner_url   = Column(String, nullable=True)
    source       = Column(Enum(HackathonSource), default=HackathonSource.manual)
    status       = Column(Enum(HackathonStatus), default=HackathonStatus.upcoming)
    location     = Column(String, nullable=True)
    is_online    = Column(Boolean, default=True)
    prize_pool   = Column(String, nullable=True)
    team_size    = Column(String, nullable=True)
    start_date   = Column(DateTime(timezone=True), nullable=True)
    end_date     = Column(DateTime(timezone=True), nullable=True)
    deadline     = Column(DateTime(timezone=True), nullable=True)
    is_saved     = Column(Boolean, default=False)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    owner      = relationship("User", back_populates="hackathons")
    milestones = relationship("Milestone", back_populates="hackathon", cascade="all, delete")
    teams      = relationship("Team", back_populates="hackathon", cascade="all, delete")
    resources  = relationship("Resource", back_populates="hackathon", cascade="all, delete")
    tags       = relationship("HackathonTag", back_populates="hackathon", cascade="all, delete")