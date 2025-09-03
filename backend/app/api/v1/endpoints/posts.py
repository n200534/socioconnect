"""
Post endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.post import PostCreate, PostResponse, PostWithAuthor, PostFeed
from app.models.post import Post
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new post."""
    # Check if parent post exists (for replies)
    if post_data.parent_id:
        parent_post = db.query(Post).filter(Post.id == post_data.parent_id).first()
        if not parent_post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent post not found"
            )
    
    # Create new post
    db_post = Post(
        content=post_data.content,
        author_id=current_user.id,
        parent_id=post_data.parent_id,
        media_url=post_data.media_url,
        media_type=post_data.media_type,
        is_reply=post_data.parent_id is not None
    )
    
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    return db_post


@router.get("/", response_model=PostFeed)
async def get_posts(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get posts feed (following + recent posts)."""
    offset = (page - 1) * size
    
    # Get posts from users that current user follows + recent posts
    following_ids = [f.following_id for f in current_user.following]
    following_ids.append(current_user.id)  # Include current user's posts
    
    posts = db.query(Post).filter(
        Post.author_id.in_(following_ids)
    ).order_by(Post.created_at.desc()).offset(offset).limit(size).all()
    
    # Get total count
    total = db.query(Post).filter(
        Post.author_id.in_(following_ids)
    ).count()
    
    # Convert to response format
    post_responses = []
    for post in posts:
        post_dict = {
            'id': post.id,
            'content': post.content,
            'media_url': post.media_url,
            'media_type': post.media_type,
            'author_id': post.author_id,
            'parent_id': post.parent_id,
            'is_reply': post.is_reply,
            'is_repost': post.is_repost,
            'original_post_id': post.original_post_id,
            'likes_count': post.likes_count,
            'comments_count': post.comments_count,
            'reposts_count': post.reposts_count,
            'total_engagement': post.total_engagement,
            'created_at': post.created_at,
            'updated_at': post.updated_at,
            'author': post.author
        }
        post_responses.append(PostWithAuthor(**post_dict))
    
    return PostFeed(
        posts=post_responses,
        total=total,
        page=page,
        size=size,
        has_next=(offset + size) < total,
        has_prev=page > 1
    )


@router.get("/{post_id}", response_model=PostWithAuthor)
async def get_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific post by ID."""
    post = db.query(Post).filter(Post.id == post_id).first()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    post_dict = post.__dict__.copy()
    post_dict['author'] = post.author
    
    return PostWithAuthor(**post_dict)


@router.get("/user/{user_id}", response_model=PostFeed)
async def get_user_posts(
    user_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get posts by a specific user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    offset = (page - 1) * size
    
    posts = db.query(Post).filter(
        Post.author_id == user_id
    ).order_by(Post.created_at.desc()).offset(offset).limit(size).all()
    
    total = db.query(Post).filter(Post.author_id == user_id).count()
    
    post_responses = []
    for post in posts:
        post_dict = post.__dict__.copy()
        post_dict['author'] = post.author
        post_responses.append(PostWithAuthor(**post_dict))
    
    return PostFeed(
        posts=post_responses,
        total=total,
        page=page,
        size=size,
        has_next=(offset + size) < total,
        has_prev=page > 1
    )
