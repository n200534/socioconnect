#!/usr/bin/env python3
"""
PostgreSQL setup script for SocioConnect.
This script helps you set up the database connection and create tables.
"""

import os
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.database import create_tables, engine

def test_connection():
    """Test the database connection."""
    try:
        # Test connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Successfully connected to PostgreSQL!")
            print(f"📊 Database version: {version}")
            return True
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Make sure your DATABASE_URL is correct in .env file")
        print("2. Check if your Neon database is running")
        print("3. Verify your credentials are correct")
        print("4. Ensure your IP is whitelisted in Neon dashboard")
        return False

def create_database_tables():
    """Create all database tables."""
    try:
        create_tables()
        print("✅ Database tables created successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        return False

def main():
    """Main setup function."""
    print("🚀 SocioConnect PostgreSQL Setup")
    print("=" * 40)
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        print("⚠️  No .env file found!")
        print("📝 Please copy env.example to .env and update your database credentials")
        print("   cp env.example .env")
        return
    
    print(f"🔗 Database URL: {settings.database_url}")
    print()
    
    # Test connection
    if not test_connection():
        return
    
    print()
    
    # Create tables
    print("📋 Creating database tables...")
    if create_database_tables():
        print()
        print("🎉 Setup completed successfully!")
        print("🚀 You can now start the FastAPI server with: python run.py")
    else:
        print("❌ Setup failed!")

if __name__ == "__main__":
    main()
