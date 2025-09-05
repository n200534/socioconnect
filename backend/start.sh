#!/bin/bash

# Run database migrations with error handling
echo "Running database migrations..."

# Try to stamp base first
echo "Attempting to stamp base..."
alembic stamp base || echo "Stamping base failed, continuing..."

# Try to upgrade
echo "Attempting to upgrade head..."
alembic upgrade head || echo "Migration failed, continuing..."

# Start the application
echo "Starting FastAPI application..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT