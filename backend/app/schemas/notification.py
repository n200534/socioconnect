"""
Notification schemas for API requests and responses.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.notification import NotificationType


class NotificationBase(BaseModel):
    """Base notification schema."""
    type: NotificationType
    title: str = Field(..., max_length=255)
    message: str
    post_id: Optional[int] = None
    comment_id: Optional[int] = None


class NotificationCreate(NotificationBase):
    """Schema for creating a notification."""
    user_id: int
    actor_id: Optional[int] = None


class NotificationResponse(NotificationBase):
    """Schema for notification response."""
    id: int
    user_id: int
    actor_id: Optional[int] = None
    is_read: bool
    is_archived: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class NotificationWithActor(NotificationResponse):
    """Notification with actor information."""
    actor: Optional[dict] = None  # Will contain actor user info


class NotificationWithPost(NotificationResponse):
    """Notification with post information."""
    post: Optional[dict] = None  # Will contain post info


class NotificationStats(BaseModel):
    """Notification statistics."""
    total: int
    unread: int
    recent: int  # Notifications from last 24 hours


class NotificationMarkRead(BaseModel):
    """Schema for marking notifications as read."""
    notification_ids: list[int]


class NotificationFilter(BaseModel):
    """Schema for filtering notifications."""
    type: Optional[NotificationType] = None
    is_read: Optional[bool] = None
    is_archived: Optional[bool] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
