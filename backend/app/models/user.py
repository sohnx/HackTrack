# backend/app/models/user.py

from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email             = Column(String, unique=True, nullable=False, index=True)
    username          = Column(String, unique=True, nullable=False)
    password          = Column(String, nullable=False)
    avatar_url        = Column(String, nullable=True)
    is_active         = Column(Boolean, default=True)
    telegram_chat_id  = Column(String, nullable=True)  # Telegram chat ID after linking
    created_at        = Column(DateTime(timezone=True), server_default=func.now())
    updated_at        = Column(DateTime(timezone=True), onupdate=func.now())

    hackathons    = relationship("Hackathon", back_populates="owner")
    team_members  = relationship("TeamMember", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    resources     = relationship("Resource", back_populates="user")
