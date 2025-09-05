"""
API v1 router configuration.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, posts, interactions, uploads, notifications

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(posts.router, prefix="/posts", tags=["posts"])
api_router.include_router(interactions.router, prefix="/interactions", tags=["interactions"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
