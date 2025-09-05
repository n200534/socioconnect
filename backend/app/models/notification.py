"""
Notification model and related functionality.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class NotificationType(str, enum.Enum):
    """Notification types."""
    LIKE = "like"
    COMMENT = "comment"
    REPOST = "repost"
    FOLLOW = "follow"
    MENTION = "mention"
    SYSTEM = "system"


class Notification(Base):
    """Notification model."""
    
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Who receives the notification
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Who performed the action
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    
    # Optional references to related entities
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="notifications")
    actor = relationship("User", foreign_keys=[actor_id])
    post = relationship("Post", back_populates="notifications")
    comment = relationship("Comment", back_populates="notifications")
    
    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, type={self.type}, is_read={self.is_read})>"
    
    @property
    def is_recent(self) -> bool:
        """Check if notification is recent (within last 24 hours)."""
        from datetime import datetime, timedelta
        return self.created_at > datetime.utcnow() - timedelta(hours=24)
