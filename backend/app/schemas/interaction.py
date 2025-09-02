"""
Interaction Pydantic schemas for likes, comments, reposts, and follows.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, validator
from app.schemas.user import UserResponse
from app.schemas.post import PostResponse


class CommentBase(BaseModel):
    """Base comment schema."""
    content: str
    parent_id: Optional[int] = None
    
    @validator('content')
    def validate_content(cls, v):
        if len(v.strip()) == 0:
            raise ValueError('Comment content cannot be empty')
        if len(v) > 500:
            raise ValueError('Comment content must be less than 500 characters')
        return v.strip()


class CommentCreate(CommentBase):
    """Schema for comment creation."""
    post_id: int


class CommentResponse(CommentBase):
    """Schema for comment response."""
    id: int
    author_id: int
    post_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CommentWithAuthor(CommentResponse):
    """Schema for comment with author information."""
    author: UserResponse
    replies: List["CommentWithAuthor"] = []


class LikeResponse(BaseModel):
    """Schema for like response."""
    id: int
    user_id: int
    post_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class RepostResponse(BaseModel):
    """Schema for repost response."""
    id: int
    user_id: int
    post_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class FollowCreate(BaseModel):
    """Schema for follow creation."""
    following_id: int


class FollowResponse(BaseModel):
    """Schema for follow response."""
    id: int
    follower_id: int
    following_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class FollowWithUser(FollowResponse):
    """Schema for follow with user information."""
    follower: UserResponse
    following: UserResponse


class UserFollowStats(BaseModel):
    """Schema for user follow statistics."""
    followers_count: int
    following_count: int
    is_following: Optional[bool] = None
    is_followed_by: Optional[bool] = None


class InteractionStats(BaseModel):
    """Schema for interaction statistics."""
    total_likes: int
    total_comments: int
    total_reposts: int
    total_follows: int
