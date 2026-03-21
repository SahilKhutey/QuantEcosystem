#!/bin/bash
# install.sh for Stock Analyzer Professional

echo "🚀 Stock Analyzer Pro - Deployment Orchestrator"
echo "=============================================="

# Check for Docker and Docker Compose
command -v docker >/dev/null 2>&1 || { echo "❌ Error: Docker is not installed."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Error: Docker Compose is not installed."; exit 1; }

# Create persistent storage directories
echo "📁 Creating operational directories (data, logs, config)..."
mkdir -p data/db logs/api config/grafana exports/backtests

# Initialize Environment configuration
if [ ! -f .env ]; then
    echo "🔧 Initializing .env configuration..."
    cat > .env << EOF
# --- API CONFIGURATION ---
OPENAI_API_KEY=sk-placeholder
ALPHA_VANTAGE_KEY=AV-placeholder
NEWS_API_KEY=NEWS-placeholder

# --- DATABASE CONFIGURATION ---
POSTGRES_DB=stockdb
POSTGRES_USER=user
POSTGRES_PASSWORD=password

# --- SYSTEM CONFIGURATION ---
DEBUG=true
LOG_LEVEL=INFO
REDIS_URL=redis://redis:6379
EOF
    echo "⚠️  ACTION REQUIRED: Update .env with real API keys before continuing."
fi

# Orchestrate the build and startup
echo "📦 Build-in-progress: Orchestrating container images..."
docker-compose build --parallel

echo "🚀 Launching professional infrastructure..."
docker-compose up -d

echo "⏳ Verifying service health (30s cooldown)..."
sleep 30

echo "✅ Deployment Successful!"
echo "----------------------------------------------"
echo "🌐 Frontend Dashboard: http://localhost:3000"
echo "📑 API Documentation:  http://localhost:8000/docs"
echo "📊 System Metrics:     http://localhost:3001 (Admin: admin)"
echo "🐰 Message Queue:       http://localhost:15672"
echo "----------------------------------------------"
