#!/usr/bin/env python3
"""
Database seeding script for SocioConnect
Run this after deploying to populate the database with sample data
"""

import os
import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from werkzeug.security import generate_password_hash

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import get_db
from app.models.user import User
from app.models.post import Post
from app.models.interaction import Like, Comment, Repost, Follow
from app.models.notification import Notification
from app.core.config import settings

def create_sample_users(db: Session):
    """Create sample users"""
    users_data = [
        {
            "email": "john@example.com",
            "username": "john_doe",
            "full_name": "John Doe",
            "bio": "Software developer passionate about technology and innovation. Building the future one line of code at a time! 🚀",
            "location": "San Francisco, CA",
            "website": "https://johndoe.dev",
            "is_verified": True,
        },
        {
            "email": "jane@example.com",
            "username": "jane_smith",
            "full_name": "Jane Smith",
            "bio": "UX Designer & Product Manager. Creating beautiful, user-centered experiences. Coffee enthusiast ☕",
            "location": "New York, NY",
            "website": "https://janesmith.design",
            "is_verified": True,
        },
        {
            "email": "mike@example.com",
            "username": "mike_wilson",
            "full_name": "Mike Wilson",
            "bio": "Full-stack developer | React & Node.js enthusiast | Open source contributor",
            "location": "Austin, TX",
            "website": "https://mikewilson.dev",
            "is_verified": False,
        },
        {
            "email": "sarah@example.com",
            "username": "sarah_jones",
            "full_name": "Sarah Jones",
            "bio": "Digital marketer | Content creator | Travel blogger 🌍 | Always exploring new places",
            "location": "Miami, FL",
            "website": "https://sarahjones.com",
            "is_verified": False,
        },
        {
            "email": "alex@example.com",
            "username": "alex_chen",
            "full_name": "Alex Chen",
            "bio": "Data scientist | Machine learning engineer | Python lover 🐍 | Making data tell stories",
            "location": "Seattle, WA",
            "website": "https://alexchen.ai",
            "is_verified": False,
        },
        {
            "email": "emma@example.com",
            "username": "emma_brown",
            "full_name": "Emma Brown",
            "bio": "Graphic designer | Illustrator | Art lover 🎨 | Creating visual stories that inspire",
            "location": "Portland, OR",
            "website": "https://emmabrown.art",
            "is_verified": False,
        }
    ]
    
    users = []
    for user_data in users_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            users.append(existing_user)
            continue
            
        user = User(
            email=user_data["email"],
            username=user_data["username"],
            full_name=user_data["full_name"],
            bio=user_data["bio"],
            location=user_data["location"],
            website=user_data["website"],
            is_verified=user_data["is_verified"],
            hashed_password=generate_password_hash("password123"),
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        users.append(user)
    
    db.commit()
    return users

def create_sample_posts(db: Session, users):
    """Create sample posts"""
    posts_data = [
        {
            "author_id": 1,  # John Doe
            "content": "Just shipped a new feature that I've been working on for weeks! The feeling of seeing your code in production is unmatched. 🚀 #coding #webdev",
            "media_url": None,
            "is_reply": False,
            "is_repost": False,
            "parent_id": None,
            "original_post_id": None
        },
        {
            "author_id": 2,  # Jane Smith
            "content": "Design is not just what it looks like and feels like. Design is how it works. Working on some exciting UX improvements today! ✨ #design #ux",
            "media_url": None,
            "is_reply": False,
            "is_repost": False,
            "parent_id": None,
            "original_post_id": None
        },
        {
            "author_id": 1,  # John Doe
            "content": "Coffee and code - the perfect combination for a productive day! ☕ What's your favorite coding setup?",
            "media_url": None,
            "is_reply": False,
            "is_repost": False,
            "parent_id": None,
            "original_post_id": None
        },
        {
            "author_id": 3,  # Mike Wilson
            "content": "Just discovered this amazing React library that's going to save me hours of development time. The open source community never ceases to amaze me! 🙌",
            "media_url": None,
            "is_reply": False,
            "is_repost": False,
            "parent_id": None,
            "original_post_id": None
        },
        {
            "author_id": 4,  # Sarah Jones
            "content": "Travel tip: Always pack light and leave room for memories! Just got back from an incredible trip to Japan. The culture, the food, the people - everything was perfect! 🇯🇵",
            "media_url": None,
            "is_reply": False,
            "is_repost": False,
            "parent_id": None,
            "original_post_id": None
        },
        {
            "author_id": 2,  # Jane Smith
            "content": "User research is the foundation of great design. Spent the day talking to users and the insights were incredible! Always listen to your users. 👥 #userresearch",
            "media_url": None,
            "is_reply": False,
            "is_repost": False,
            "parent_id": None,
            "original_post_id": None
        },
        {
            "author_id": 5,  # Alex Chen
            "content": "Machine learning model just hit 95% accuracy! The data preprocessing was the key. Sometimes the boring stuff makes all the difference. 📊 #machinelearning #datascience",
            "media_url": None,
            "is_reply": False,
            "is_repost": False,
            "parent_id": None,
            "original_post_id": None
        },
        {
            "author_id": 6,  # Emma Brown
            "content": "Art is everywhere if you know how to look. Just finished this illustration and I'm really happy with how it turned out! 🎨 #illustration #art",
            "media_url": None,
            "is_reply": False,
            "is_repost": False,
            "parent_id": None,
            "original_post_id": None
        }
    ]
    
    posts = []
    for i, post_data in enumerate(posts_data):
        # Get the actual user ID from the users list
        author_id = users[post_data["author_id"] - 1].id
        
        post = Post(
            author_id=author_id,
            content=post_data["content"],
            media_url=post_data["media_url"],
            is_reply=post_data["is_reply"],
            is_repost=post_data["is_repost"],
            parent_id=post_data["parent_id"],
            original_post_id=post_data["original_post_id"],
            created_at=datetime.utcnow() - timedelta(hours=i*2)
        )
        db.add(post)
        posts.append(post)
    
    db.commit()
    return posts

def create_sample_interactions(db: Session, users, posts):
    """Create sample likes, comments, reposts, and follows"""
    
    # Create likes
    like_data = [
        (2, 1), (3, 1), (4, 1), (5, 1), (6, 1),  # Likes for John's first post
        (1, 2), (3, 2), (4, 2), (5, 2),  # Likes for Jane's first post
        (2, 3), (4, 3), (6, 3),  # Likes for John's second post
        (1, 4), (2, 4), (5, 4), (6, 4),  # Likes for Mike's post
        (1, 5), (2, 5), (3, 5), (6, 5),  # Likes for Sarah's post
        (1, 6), (3, 6), (5, 6),  # Likes for Jane's second post
        (1, 7), (2, 7), (4, 7), (6, 7),  # Likes for Alex's post
        (1, 8), (2, 8), (3, 8), (4, 8), (5, 8),  # Likes for Emma's post
    ]
    
    for user_idx, post_idx in like_data:
        if user_idx <= len(users) and post_idx <= len(posts):
            like = Like(
                user_id=users[user_idx-1].id,
                post_id=posts[post_idx-1].id,
                created_at=datetime.utcnow()
            )
            db.add(like)
    
    # Create comments
    comment_data = [
        (2, 1, "Amazing work! The attention to detail really shows. 👏"),
        (3, 1, "This is exactly what I needed to see today! Keep up the great work!"),
        (4, 1, "Love the energy in this post! 🚀"),
        (1, 2, "Design principles that never get old. Thanks for sharing!"),
        (3, 2, "This is so true! UX is everything."),
        (5, 2, "Great insights! User-centered design is the way to go."),
        (2, 3, "Coffee and code - my daily routine! ☕"),
        (4, 3, "I have the same setup! What's your favorite coffee?"),
        (1, 4, "Open source is the best! What library was it?"),
        (2, 4, "The community is incredible! Always learning something new."),
        (1, 5, "Japan is on my bucket list! Any recommendations?"),
        (3, 5, "Sounds like an amazing trip! The culture there is incredible."),
        (1, 6, "User research is so important! Great reminder."),
        (5, 6, "Data-driven design decisions are the best!"),
        (1, 7, "95% accuracy is impressive! What kind of model?"),
        (2, 7, "Data preprocessing is often overlooked but so crucial!"),
        (1, 8, "Beautiful illustration! The colors are amazing."),
        (3, 8, "Art really is everywhere! Great perspective."),
    ]
    
    for user_idx, post_idx, content in comment_data:
        if user_idx <= len(users) and post_idx <= len(posts):
            comment = Comment(
                author_id=users[user_idx-1].id,
                post_id=posts[post_idx-1].id,
                content=content,
                created_at=datetime.utcnow()
            )
            db.add(comment)
    
    # Create reposts
    repost_data = [
        (3, 1), (5, 1),  # Reposts of John's first post
        (1, 2), (4, 2),  # Reposts of Jane's first post
        (2, 4), (6, 4),  # Reposts of Mike's post
        (1, 5), (3, 5),  # Reposts of Sarah's post
        (2, 6), (5, 6),  # Reposts of Jane's second post
        (1, 7), (4, 7),  # Reposts of Alex's post
        (2, 8), (3, 8), (5, 8),  # Reposts of Emma's post
    ]
    
    for user_idx, post_idx in repost_data:
        if user_idx <= len(users) and post_idx <= len(posts):
            repost = Repost(
                user_id=users[user_idx-1].id,
                post_id=posts[post_idx-1].id,
                created_at=datetime.utcnow()
            )
            db.add(repost)
    
    # Create follows
    follow_data = [
        (2, 1), (3, 1), (4, 1), (5, 1), (6, 1),  # Everyone follows John
        (1, 2), (3, 2), (4, 2), (5, 2), (6, 2),  # Everyone follows Jane
        (1, 3), (2, 3), (4, 3), (5, 3), (6, 3),  # Everyone follows Mike
        (1, 4), (2, 4), (3, 4), (5, 4), (6, 4),  # Everyone follows Sarah
        (1, 5), (2, 5), (3, 5), (4, 5), (6, 5),  # Everyone follows Alex
        (1, 6), (2, 6), (3, 6), (4, 6), (5, 6),  # Everyone follows Emma
    ]
    
    for follower_idx, following_idx in follow_data:
        if follower_idx <= len(users) and following_idx <= len(users):
            follow = Follow(
                follower_id=users[follower_idx-1].id,
                following_id=users[following_idx-1].id,
                created_at=datetime.utcnow()
            )
            db.add(follow)
    
    db.commit()

def main():
    """Main seeding function"""
    print("🌱 Starting database seeding...")
    
    # Get database session
    db = next(get_db())
    
    try:
        # Create users
        print("👥 Creating sample users...")
        users = create_sample_users(db)
        print(f"✅ Created {len(users)} users")
        
        # Create posts
        print("📝 Creating sample posts...")
        posts = create_sample_posts(db, users)
        print(f"✅ Created {len(posts)} posts")
        
        # Create interactions
        print("💬 Creating sample interactions...")
        create_sample_interactions(db, users, posts)
        print("✅ Created likes, comments, reposts, and follows")
        
        print("🎉 Database seeding completed successfully!")
        print("\n📋 Sample users created:")
        for user in users:
            print(f"  - {user.username} ({user.email}) - Password: password123")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
