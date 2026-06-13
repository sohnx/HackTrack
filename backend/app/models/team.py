# backend/app/models/team.py

from sqlalchemy import Column, String, Text, Enum, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from app.db.base import Base

class TeamRole(str, enum.Enum):
    owner  = "owner"
    admin  = "admin"
    member = "member"

class Team(Base):
    __tablename__ = "teams"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hackathon_id = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"), nullable=False)
    name         = Column(String, nullable=False)
    description  = Column(Text, nullable=True)
    invite_code  = Column(String, unique=True, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    hackathon = relationship("Hackathon", back_populates="teams")
    members   = relationship("TeamMember", back_populates="team", cascade="all, delete")

class TeamMember(Base):
    __tablename__ = "team_members"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id    = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role       = Column(Enum(TeamRole), default=TeamRole.member)
    joined_at  = Column(DateTime(timezone=True), server_default=func.now())

    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="team_members")