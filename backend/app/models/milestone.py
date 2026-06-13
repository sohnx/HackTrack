# backend/app/models/milestone.py

from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from app.db.base import Base

class MilestoneStatus(str, enum.Enum):
    todo        = "todo"
    in_progress = "in_progress"
    done        = "done"

class Milestone(Base):
    __tablename__ = "milestones"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hackathon_id  = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"), nullable=False)
    title         = Column(String, nullable=False)
    description   = Column(Text, nullable=True)
    status        = Column(Enum(MilestoneStatus), default=MilestoneStatus.todo)
    due_date      = Column(DateTime(timezone=True), nullable=True)
    is_completed  = Column(Boolean, default=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    hackathon = relationship("Hackathon", back_populates="milestones")