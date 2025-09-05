#!/bin/bash

# Run database migrations with error handling
echo "Running database migrations..."
alembic upgrade head || {
    echo "Migration failed, trying to stamp head..."
    alembic stamp head
    echo "Stamped head, trying upgrade again..."
    alembic upgrade head
}

# Start the application
echo "Starting FastAPI application..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT