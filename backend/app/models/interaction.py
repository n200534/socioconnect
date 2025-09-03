"""
Interaction models for likes, comments, reposts, and follows.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Like(Base):
    """Like model."""
    
    __tablename__ = "likes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")
    
    # Ensure one like per user per post
    __table_args__ = (UniqueConstraint('user_id', 'post_id', name='unique_user_post_like'),)
    
    def __repr__(self):
        return f"<Like(user_id={self.user_id}, post_id={self.post_id})>"


class Comment(Base):
    """Comment model."""
    
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(500), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)  # For nested comments
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    author = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")
    replies = relationship("Comment", backref="parent", remote_side=[id])
    
    def __repr__(self):
        return f"<Comment(id={self.id}, author_id={self.author_id}, post_id={self.post_id})>"


class Repost(Base):
    """Repost model."""
    
    __tablename__ = "reposts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="reposts")
    post = relationship("Post", back_populates="reposts")
    
    # Ensure one repost per user per post
    __table_args__ = (UniqueConstraint('user_id', 'post_id', name='unique_user_post_repost'),)
    
    def __repr__(self):
        return f"<Repost(user_id={self.user_id}, post_id={self.post_id})>"


class Follow(Base):
    """Follow model."""
    
    __tablename__ = "follows"
    
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    following_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    follower = relationship("User", foreign_keys=[follower_id])
    following = relationship("User", foreign_keys=[following_id])
    
    # Ensure one follow relationship per pair
    __table_args__ = (UniqueConstraint('follower_id', 'following_id', name='unique_follow_relationship'),)
    
    def __repr__(self):
        return f"<Follow(follower_id={self.follower_id}, following_id={self.following_id})>"
