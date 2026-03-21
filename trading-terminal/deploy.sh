#!/bin/bash
# deploy.sh
echo "🚀 Deploying Trading Terminal to production..."

# Build Docker image
echo "Building Docker image..."
docker build -t trading-terminal:latest .

# Push to container registry
echo "Pushing to container registry..."
# Note: User should replace 'your-registry' with actual registry URI
REGISTRY_URI=${REGISTRY_URI:-"your-registry"}
docker tag trading-terminal:latest ${REGISTRY_URI}/trading-terminal:latest
docker push ${REGISTRY_URI}/trading-terminal:latest

# Update Kubernetes deployment
echo "Updating Kubernetes deployment..."
kubectl set image deployment/trading-terminal-api api=${REGISTRY_URI}/trading-terminal:latest --record
kubectl set image deployment/trading-terminal-frontend frontend=${REGISTRY_URI}/trading-terminal:latest --record
kubectl set image deployment/trading-terminal-ws ws=${REGISTRY_URI}/trading-terminal:latest --record

# Verify deployment
echo "Verifying deployment..."
kubectl rollout status deployment/trading-terminal-api
kubectl rollout status deployment/trading-terminal-frontend
kubectl rollout status deployment/trading-terminal-ws

echo "✅ Deployment complete!"
