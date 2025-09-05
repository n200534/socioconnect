#!/usr/bin/env python3
"""
Reset migrations for production deployment
"""
import os
import sys
from sqlalchemy import create_engine, text
from alembic import command
from alembic.config import Config

def reset_migrations():
    """Reset migrations and create fresh database schema"""
    try:
        # Get database URL from environment
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            print("ERROR: DATABASE_URL not found in environment")
            return False
        
        # Create engine
        engine = create_engine(database_url)
        
        # Drop all tables if they exist
        with engine.connect() as conn:
            conn.execute(text("DROP SCHEMA public CASCADE"))
            conn.execute(text("CREATE SCHEMA public"))
            conn.commit()
        
        print("✅ Database schema reset successfully")
        
        # Run fresh migrations
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        
        print("✅ Fresh migrations applied successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error resetting migrations: {e}")
        return False

if __name__ == "__main__":
    success = reset_migrations()
    sys.exit(0 if success else 1)
