#!/usr/bin/env python3
"""
Migration management script for SocioConnect.
This script provides easy commands for managing database migrations.
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully!")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed!")
        print(f"Error: {e.stderr}")
        return False

def check_environment():
    """Check if we're in the right environment."""
    if not os.path.exists('.env'):
        print("⚠️  No .env file found!")
        print("📝 Please copy env.example to .env and update your database credentials")
        return False
    
    if not os.path.exists('alembic.ini'):
        print("⚠️  No alembic.ini found!")
        print("📝 Please run 'alembic init alembic' first")
        return False
    
    return True

def main():
    """Main migration management function."""
    print("🚀 SocioConnect Migration Manager")
    print("=" * 40)
    
    if not check_environment():
        return
    
    if len(sys.argv) < 2:
        print("Usage: python migrate.py <command>")
        print("\nAvailable commands:")
        print("  init        - Initialize migration system")
        print("  create      - Create a new migration")
        print("  upgrade     - Apply all pending migrations")
        print("  downgrade   - Rollback last migration")
        print("  history     - Show migration history")
        print("  current     - Show current migration")
        print("  status      - Show migration status")
        return
    
    command = sys.argv[1].lower()
    
    if command == "init":
        print("🔧 Initializing migration system...")
        if not os.path.exists('alembic'):
            run_command("alembic init alembic", "Creating Alembic directory")
        else:
            print("✅ Alembic already initialized")
    
    elif command == "create":
        if len(sys.argv) < 3:
            print("Usage: python migrate.py create <message>")
            return
        message = " ".join(sys.argv[2:])
        run_command(f'alembic revision --autogenerate -m "{message}"', f"Creating migration: {message}")
    
    elif command == "upgrade":
        run_command("alembic upgrade head", "Applying migrations")
    
    elif command == "downgrade":
        run_command("alembic downgrade -1", "Rolling back last migration")
    
    elif command == "history":
        run_command("alembic history", "Showing migration history")
    
    elif command == "current":
        run_command("alembic current", "Showing current migration")
    
    elif command == "status":
        run_command("alembic show head", "Showing migration status")
    
    else:
        print(f"❌ Unknown command: {command}")
        print("Run 'python migrate.py' to see available commands")

if __name__ == "__main__":
    main()
