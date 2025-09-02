"""
User endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.user import UserResponse, UserUpdate, UserProfile
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile."""
    # Update user fields
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.get("/{user_id}", response_model=UserProfile)
async def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if current user follows this user
    is_following = db.query(User.following).filter(
        User.id == current_user.id,
        User.following.any(following_id=user_id)
    ).first() is not None
    
    # Check if this user follows current user
    is_followed_by = db.query(User.followers).filter(
        User.id == user_id,
        User.followers.any(follower_id=current_user.id)
    ).first() is not None
    
    return UserProfile(
        **user.__dict__,
        is_following=is_following,
        is_followed_by=is_followed_by
    )


@router.get("/", response_model=List[UserResponse])
async def search_users(
    q: Optional[str] = Query(None, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Search users by username or full name."""
    query = db.query(User).filter(User.is_active == True)
    
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            (User.username.ilike(search_term)) |
            (User.full_name.ilike(search_term))
        )
    
    users = query.offset(offset).limit(limit).all()
    return users
