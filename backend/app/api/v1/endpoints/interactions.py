"""
Interaction endpoints for likes, comments, reposts, and follows.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.interaction import (
    CommentCreate, CommentResponse, CommentWithAuthor,
    FollowCreate, FollowResponse, UserFollowStats
)
from app.models.user import User
from app.models.post import Post
from app.models.interaction import Like, Comment, Repost, Follow
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


# Like endpoints
@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like or unlike a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if already liked
    existing_like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.post_id == post_id
    ).first()
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        db.commit()
        return {"message": "Post unliked", "liked": False}
    else:
        # Like
        new_like = Like(user_id=current_user.id, post_id=post_id)
        db.add(new_like)
        db.commit()
        return {"message": "Post liked", "liked": True}


# Comment endpoints
@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a comment on a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    comment = Comment(
        content=comment_data.content,
        author_id=current_user.id,
        post_id=post_id,
        parent_id=comment_data.parent_id
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return comment


@router.get("/posts/{post_id}/comments", response_model=List[CommentWithAuthor])
async def get_post_comments(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comments for a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    comments = db.query(Comment).filter(
        Comment.post_id == post_id,
        Comment.parent_id.is_(None)  # Only top-level comments
    ).order_by(Comment.created_at.asc()).all()
    
    comment_responses = []
    for comment in comments:
        comment_dict = comment.__dict__.copy()
        comment_dict['author'] = comment.author
        comment_responses.append(CommentWithAuthor(**comment_dict))
    
    return comment_responses


# Repost endpoints
@router.post("/posts/{post_id}/repost")
async def repost(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Repost or un-repost a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if already reposted
    existing_repost = db.query(Repost).filter(
        Repost.user_id == current_user.id,
        Repost.post_id == post_id
    ).first()
    
    if existing_repost:
        # Un-repost - delete both the Repost record and the repost Post entry
        db.delete(existing_repost)
        
        # Find and delete the repost post entry
        repost_post = db.query(Post).filter(
            Post.author_id == current_user.id,
            Post.is_repost == True,
            Post.original_post_id == post_id
        ).first()
        
        if repost_post:
            db.delete(repost_post)
        
        db.commit()
        return {"message": "Post un-reposted", "reposted": False}
    else:
        # Repost - create both a Repost record and a new Post entry
        new_repost = Repost(user_id=current_user.id, post_id=post_id)
        db.add(new_repost)
        
        # Create a new post entry for the repost
        repost_post = Post(
            author_id=current_user.id,
            content="Reposted",  # Give reposts a default content
            is_repost=True,
            original_post_id=post_id
        )
        db.add(repost_post)
        db.commit()
        
        return {"message": "Post reposted", "reposted": True}


# Follow endpoints
@router.post("/users/{user_id}/follow", response_model=FollowResponse, status_code=status.HTTP_201_CREATED)
async def follow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Follow or unfollow a user."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself"
        )
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already following
    existing_follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()
    
    if existing_follow:
        # Unfollow
        db.delete(existing_follow)
        db.commit()
        return {"message": "User unfollowed", "following": False}
    else:
        # Follow
        new_follow = Follow(follower_id=current_user.id, following_id=user_id)
        db.add(new_follow)
        db.commit()
        db.refresh(new_follow)
        return new_follow


@router.get("/users/{user_id}/followers", response_model=List[UserFollowStats])
async def get_user_followers(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's followers."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # This is a simplified version - in a real app you'd want pagination
    return [UserFollowStats(followers_count=user.followers_count, following_count=user.following_count)]


@router.get("/users/{user_id}/following", response_model=List[UserFollowStats])
async def get_user_following(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get users that this user follows."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # This is a simplified version - in a real app you'd want pagination
    return [UserFollowStats(followers_count=user.followers_count, following_count=user.following_count)]
