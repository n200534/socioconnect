"""
User Pydantic schemas for request/response validation.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, validator


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    username: str
    full_name: str
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    is_private: bool = False
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 50:
            raise ValueError('Username must be less than 50 characters')
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v.lower()
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if len(v) < 1:
            raise ValueError('Full name is required')
        if len(v) > 100:
            raise ValueError('Full name must be less than 100 characters')
        return v


class UserCreate(UserBase):
    """Schema for user creation."""
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserUpdate(BaseModel):
    """Schema for user updates."""
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    is_private: Optional[bool] = None
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if v is not None and len(v) > 100:
            raise ValueError('Full name must be less than 100 characters')
        return v


class UserResponse(UserBase):
    """Schema for user response."""
    id: int
    avatar_url: Optional[str] = None
    cover_url: Optional[str] = None
    is_active: bool
    is_verified: bool
    followers_count: int
    following_count: int
    posts_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserProfile(UserResponse):
    """Schema for user profile with additional info."""
    is_following: Optional[bool] = None  # Whether current user follows this user
    is_followed_by: Optional[bool] = None  # Whether this user follows current user


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserPasswordChange(BaseModel):
    """Schema for password change."""
    current_password: str
    new_password: str
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('New password must be at least 8 characters long')
        return v


class Token(BaseModel):
    """Schema for token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenRefresh(BaseModel):
    """Schema for token refresh."""
    refresh_token: str
