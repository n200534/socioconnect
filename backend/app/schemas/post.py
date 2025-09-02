"""
Post Pydantic schemas for request/response validation.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, validator
from app.schemas.user import UserResponse


class PostBase(BaseModel):
    """Base post schema."""
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    
    @validator('content')
    def validate_content(cls, v):
        if len(v.strip()) == 0:
            raise ValueError('Post content cannot be empty')
        if len(v) > 280:
            raise ValueError('Post content must be less than 280 characters')
        return v.strip()
    
    @validator('media_type')
    def validate_media_type(cls, v):
        if v is not None and v not in ['image', 'video', 'gif']:
            raise ValueError('Media type must be image, video, or gif')
        return v


class PostCreate(PostBase):
    """Schema for post creation."""
    parent_id: Optional[int] = None  # For replies


class PostUpdate(BaseModel):
    """Schema for post updates."""
    content: Optional[str] = None
    
    @validator('content')
    def validate_content(cls, v):
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError('Post content cannot be empty')
            if len(v) > 280:
                raise ValueError('Post content must be less than 280 characters')
            return v.strip()
        return v


class PostResponse(PostBase):
    """Schema for post response."""
    id: int
    author_id: int
    parent_id: Optional[int] = None
    is_reply: bool
    is_repost: bool
    original_post_id: Optional[int] = None
    likes_count: int
    comments_count: int
    reposts_count: int
    total_engagement: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PostWithAuthor(PostResponse):
    """Schema for post with author information."""
    author: UserResponse
    is_liked: Optional[bool] = None
    is_reposted: Optional[bool] = None


class PostWithReplies(PostWithAuthor):
    """Schema for post with replies."""
    replies: List[PostWithAuthor] = []


class PostFeed(BaseModel):
    """Schema for post feed response."""
    posts: List[PostWithAuthor]
    total: int
    page: int
    size: int
    has_next: bool
    has_prev: bool


class PostStats(BaseModel):
    """Schema for post statistics."""
    total_posts: int
    total_likes: int
    total_comments: int
    total_reposts: int
    avg_engagement: float
