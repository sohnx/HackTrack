# backend/app/models/notification.py

from sqlalchemy import Column, String, Text, Boolean, Enum, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from app.db.base import Base

class NotificationType(str, enum.Enum):
    deadline   = "deadline"
    milestone  = "milestone"
    team       = "team"
    system     = "system"

class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title      = Column(String, nullable=False)
    message    = Column(Text, nullable=False)
    type       = Column(Enum(NotificationType), default=NotificationType.system)
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")