"""
File upload endpoints for media and profile pictures.
"""
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import aiofiles
from PIL import Image
import io

from app.db.database import get_db
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

# Configuration
UPLOAD_DIR = "uploads"
PROFILE_PICS_DIR = os.path.join(UPLOAD_DIR, "profile_pics")
MEDIA_DIR = os.path.join(UPLOAD_DIR, "media")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]

# Create upload directories if they don't exist
os.makedirs(PROFILE_PICS_DIR, exist_ok=True)
os.makedirs(MEDIA_DIR, exist_ok=True)


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename while preserving the extension."""
    file_extension = os.path.splitext(original_filename)[1]
    unique_id = str(uuid.uuid4())
    return f"{unique_id}{file_extension}"


def validate_file(file: UploadFile, allowed_types: List[str]) -> bool:
    """Validate uploaded file type and size."""
    if file.content_type not in allowed_types:
        return False
    return True


async def process_image(file_content: bytes, max_size: tuple = (1920, 1080)) -> bytes:
    """Process and optimize image."""
    try:
        image = Image.open(io.BytesIO(file_content))
        
        # Convert to RGB if necessary
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        
        # Resize if too large
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save as JPEG with optimization
        output = io.BytesIO()
        image.save(output, format="JPEG", quality=85, optimize=True)
        return output.getvalue()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process image: {str(e)}"
        )


@router.post("/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload profile picture."""
    # Validate file
    if not validate_file(file, ALLOWED_IMAGE_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
        )
    
    # Check file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB."
        )
    
    try:
        # Process image
        processed_content = await process_image(file_content, (400, 400))
        
        # Generate unique filename
        filename = generate_unique_filename(file.filename)
        file_path = os.path.join(PROFILE_PICS_DIR, filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(processed_content)
        
        # Update user profile
        avatar_url = f"/api/v1/uploads/profile-pictures/{filename}"
        current_user.avatar_url = avatar_url
        db.commit()
        
        return {
            "message": "Profile picture uploaded successfully",
            "avatar_url": avatar_url,
            "filename": filename
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload profile picture: {str(e)}"
        )


@router.post("/media")
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload media file for posts."""
    # Validate file
    allowed_types = ALLOWED_IMAGE_TYPES + ALLOWED_VIDEO_TYPES
    if not validate_file(file, allowed_types):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only images and videos are allowed."
        )
    
    # Check file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB."
        )
    
    try:
        # Generate unique filename
        filename = generate_unique_filename(file.filename)
        file_path = os.path.join(MEDIA_DIR, filename)
        
        # Process if it's an image
        if file.content_type in ALLOWED_IMAGE_TYPES:
            processed_content = await process_image(file_content, (1920, 1080))
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(processed_content)
        else:
            # For videos, save as-is
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(file_content)
        
        # Determine media type
        media_type = "image" if file.content_type in ALLOWED_IMAGE_TYPES else "video"
        media_url = f"/api/v1/uploads/media/{filename}"
        
        return {
            "message": "Media uploaded successfully",
            "media_url": media_url,
            "media_type": media_type,
            "filename": filename
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload media: {str(e)}"
        )


@router.get("/profile-pictures/{filename}")
async def get_profile_picture(filename: str):
    """Serve profile picture files."""
    file_path = os.path.join(PROFILE_PICS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile picture not found"
        )
    return FileResponse(file_path)


@router.get("/media/{filename}")
async def get_media(filename: str):
    """Serve media files."""
    file_path = os.path.join(MEDIA_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file not found"
        )
    return FileResponse(file_path)


@router.delete("/profile-picture")
async def delete_profile_picture(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete current user's profile picture."""
    if not current_user.avatar_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile picture found"
        )
    
    try:
        # Extract filename from URL
        filename = current_user.avatar_url.split("/")[-1]
        file_path = os.path.join(PROFILE_PICS_DIR, filename)
        
        # Delete file if it exists
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Update user profile
        current_user.avatar_url = None
        db.commit()
        
        return {"message": "Profile picture deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete profile picture: {str(e)}"
        )
