"""
Notification endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timedelta

from app.db.database import get_db
from app.schemas.notification import (
    NotificationResponse, NotificationWithActor, NotificationStats,
    NotificationMarkRead, NotificationFilter
)
from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.get("/test")
async def test_notifications_endpoint():
    """Test endpoint to verify notifications API is working."""
    return {"message": "Notifications API is working", "status": "success"}


@router.get("/", response_model=List[NotificationWithActor])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    type: Optional[NotificationType] = None,
    is_read: Optional[bool] = None,
    is_archived: Optional[bool] = None
):
    """Get user's notifications with filtering."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    # Apply filters
    if type:
        query = query.filter(Notification.type == type)
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)
    if is_archived is not None:
        query = query.filter(Notification.is_archived == is_archived)
    
    # Get notifications with actor information
    notifications = query.options(
        joinedload(Notification.actor)
    ).order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
    
    # Convert to response format
    result = []
    for notification in notifications:
        notification_dict = {
            'id': notification.id,
            'user_id': notification.user_id,
            'actor_id': notification.actor_id,
            'type': notification.type,
            'title': notification.title,
            'message': notification.message,
            'is_read': notification.is_read,
            'is_archived': notification.is_archived,
            'post_id': notification.post_id,
            'comment_id': notification.comment_id,
            'created_at': notification.created_at,
            'updated_at': notification.updated_at,
            'actor': None
        }
        
        # Add actor information if available
        if notification.actor:
            notification_dict['actor'] = {
                'id': notification.actor.id,
                'username': notification.actor.username,
                'full_name': notification.actor.full_name,
                'avatar_url': notification.actor.avatar_url,
                'is_verified': notification.actor.is_verified
            }
        
        result.append(NotificationWithActor(**notification_dict))
    
    return result


@router.get("/stats", response_model=NotificationStats)
async def get_notification_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notification statistics for the current user."""
    try:
        # Total notifications
        total = db.query(Notification).filter(Notification.user_id == current_user.id).count()
        
        # Unread notifications
        unread = db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        ).count()
        
        # Recent notifications (last 24 hours)
        recent_cutoff = datetime.utcnow() - timedelta(hours=24)
        recent = db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.created_at >= recent_cutoff
        ).count()
        
        return NotificationStats(
            total=total,
            unread=unread,
            recent=recent
        )
    except Exception as e:
        print(f"Error in get_notification_stats: {e}")
        # Return default stats if there's an error
        return NotificationStats(
            total=0,
            unread=0,
            recent=0
        )


@router.patch("/mark-read", response_model=dict)
async def mark_notifications_read(
    mark_data: NotificationMarkRead,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark specific notifications as read."""
    # Verify notifications belong to current user
    notifications = db.query(Notification).filter(
        Notification.id.in_(mark_data.notification_ids),
        Notification.user_id == current_user.id
    ).all()
    
    if not notifications:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No notifications found"
        )
    
    # Mark as read
    for notification in notifications:
        notification.is_read = True
        notification.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": f"Marked {len(notifications)} notifications as read"}


@router.patch("/mark-all-read", response_model=dict)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for the current user."""
    updated_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({
        'is_read': True,
        'updated_at': datetime.utcnow()
    })
    
    db.commit()
    
    return {"message": f"Marked {updated_count} notifications as read"}


@router.delete("/{notification_id}", response_model=dict)
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific notification."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}


@router.delete("/", response_model=dict)
async def clear_all_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all notifications for the current user."""
    deleted_count = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).delete()
    
    db.commit()
    
    return {"message": f"Cleared {deleted_count} notifications"}


@router.patch("/{notification_id}/archive", response_model=dict)
async def archive_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Archive a specific notification."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_archived = True
    notification.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Notification archived successfully"}
