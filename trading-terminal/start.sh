#!/bin/bash

# Production server startup script
echo "🚀 Starting Professional Trading Terminal production server..."

# Set environment variables
export FLASK_APP=main.py
export FLASK_ENV=production

# Start Gunicorn with 4 workers for high concurrency
echo "Starting Gunicorn on port 5000..."
gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
