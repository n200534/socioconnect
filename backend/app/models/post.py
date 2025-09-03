"""
Post model and related functionality.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Post(Base):
    """Post model."""
    
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("posts.id"), nullable=True)  # For replies
    media_url = Column(String(500), nullable=True)
    media_type = Column(String(50), nullable=True)  # image, video, etc.
    is_reply = Column(Boolean, default=False)
    is_repost = Column(Boolean, default=False)
    original_post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    author = relationship("User", back_populates="posts")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    reposts = relationship("Repost", back_populates="post", cascade="all, delete-orphan")
    
    # Self-referential relationships for replies and reposts
    replies = relationship("Post", backref="parent", remote_side=[id], foreign_keys=[parent_id])
    original_post = relationship("Post", backref="original_reposts", remote_side=[id], foreign_keys=[original_post_id])
    
    def __repr__(self):
        return f"<Post(id={self.id}, author_id={self.author_id}, content='{self.content[:50]}...')>"
    
    @property
    def likes_count(self) -> int:
        """Get likes count."""
        return len(self.likes)
    
    @property
    def comments_count(self) -> int:
        """Get comments count."""
        return len(self.comments)
    
    @property
    def reposts_count(self) -> int:
        """Get reposts count."""
        return len(self.reposts)
    
    @property
    def total_engagement(self) -> int:
        """Get total engagement count."""
        return self.likes_count + self.comments_count + self.reposts_count
