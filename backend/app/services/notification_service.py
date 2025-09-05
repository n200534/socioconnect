"""
Notification service for creating and managing notifications.
"""
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.models.post import Post
from app.models.interaction import Comment


class NotificationService:
    """Service for managing notifications."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_notification(
        self,
        user_id: int,
        type: NotificationType,
        title: str,
        message: str,
        actor_id: int = None,
        post_id: int = None,
        comment_id: int = None
    ) -> Notification:
        """Create a new notification."""
        # Don't create notification if user is trying to notify themselves
        if actor_id and actor_id == user_id:
            return None
        
        notification = Notification(
            user_id=user_id,
            actor_id=actor_id,
            type=type,
            title=title,
            message=message,
            post_id=post_id,
            comment_id=comment_id
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        return notification
    
    def create_like_notification(self, post: Post, actor: User) -> Notification:
        """Create a like notification."""
        if post.author_id == actor.id:
            return None  # Don't notify self
        
        return self.create_notification(
            user_id=post.author_id,
            type=NotificationType.LIKE,
            title="New Like",
            message=f"{actor.full_name or actor.username} liked your post",
            actor_id=actor.id,
            post_id=post.id
        )
    
    def create_comment_notification(self, post: Post, comment: Comment, actor: User) -> Notification:
        """Create a comment notification."""
        if post.author_id == actor.id:
            return None  # Don't notify self
        
        return self.create_notification(
            user_id=post.author_id,
            type=NotificationType.COMMENT,
            title="New Comment",
            message=f"{actor.full_name or actor.username} commented on your post",
            actor_id=actor.id,
            post_id=post.id,
            comment_id=comment.id
        )
    
    def create_repost_notification(self, post: Post, actor: User) -> Notification:
        """Create a repost notification."""
        if post.author_id == actor.id:
            return None  # Don't notify self
        
        return self.create_notification(
            user_id=post.author_id,
            type=NotificationType.REPOST,
            title="New Repost",
            message=f"{actor.full_name or actor.username} reposted your post",
            actor_id=actor.id,
            post_id=post.id
        )
    
    def create_follow_notification(self, user: User, actor: User) -> Notification:
        """Create a follow notification."""
        if user.id == actor.id:
            return None  # Don't notify self
        
        return self.create_notification(
            user_id=user.id,
            type=NotificationType.FOLLOW,
            title="New Follower",
            message=f"{actor.full_name or actor.username} started following you",
            actor_id=actor.id
        )
    
    def create_mention_notification(self, user: User, actor: User, post: Post) -> Notification:
        """Create a mention notification."""
        if user.id == actor.id:
            return None  # Don't notify self
        
        return self.create_notification(
            user_id=user.id,
            type=NotificationType.MENTION,
            title="You were mentioned",
            message=f"{actor.full_name or actor.username} mentioned you in a post",
            actor_id=actor.id,
            post_id=post.id
        )
    
    def create_system_notification(self, user_id: int, title: str, message: str) -> Notification:
        """Create a system notification."""
        return self.create_notification(
            user_id=user_id,
            type=NotificationType.SYSTEM,
            title=title,
            message=message
        )
    
    def get_user_notifications(
        self,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
        unread_only: bool = False
    ) -> list[Notification]:
        """Get notifications for a user."""
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        return query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
    
    def mark_as_read(self, notification_id: int, user_id: int) -> bool:
        """Mark a notification as read."""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            notification.is_read = True
            self.db.commit()
            return True
        
        return False
    
    def mark_all_as_read(self, user_id: int) -> int:
        """Mark all notifications as read for a user."""
        updated_count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({'is_read': True})
        
        self.db.commit()
        return updated_count
    
    def get_unread_count(self, user_id: int) -> int:
        """Get unread notification count for a user."""
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
