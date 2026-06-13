# backend/app/schemas/notification.py

from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from app.models.notification import NotificationType

class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime

class NotificationUpdate(BaseModel):
    is_read: bool