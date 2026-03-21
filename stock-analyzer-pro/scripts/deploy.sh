#!/bin/bash
# scripts/deploy.sh

echo "🚀 Starting Stock Analyzer Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose down
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are healthy
echo "🔍 Checking service health..."
curl -f http://localhost:8000/health || echo "❌ Backend service not healthy"
curl -f http://localhost:3000 || echo "❌ Frontend service not healthy"

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"
