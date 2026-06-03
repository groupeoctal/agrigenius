#!/bin/bash
# CloudPanel startup script for AgriGenius Backend
# This script starts the FastAPI application with Gunicorn

cd "$(dirname "$0")"

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install/update dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p uploads/diagnostics
mkdir -p uploads/profile_photos
mkdir -p uploads/marketplace
mkdir -p uploads/formation

# Start with Gunicorn (production)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:9000 --timeout 120 --access-logfile - --error-logfile -
