#!/bin/bash
# deploy-strategy-engine.sh

echo "🚀 Deploying Strategy Engine Layer..."
echo "======================================"

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p strategy-engine/{strategies,allocator,simulator,execution,tracker,api}

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements-strategy.txt

# Start services
echo "🚀 Starting Strategy Engine services..."
docker-compose -f docker-compose-strategy.yml up -d

echo "⏳ Waiting for services to start..."
sleep 20

# Test API endpoints
echo "🧪 Testing API endpoints..."
curl -X POST http://localhost:8001/api/v1/strategies/sip/create \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_amount": 10000,
    "frequency": "monthly",
    "start_date": "2023-01-01T00:00:00",
    "duration_months": 60,
    "expected_return": 0.12
  }'

echo ""
echo "✅ Strategy Engine deployed successfully!"
echo ""
echo "🌐 API Endpoints:"
echo "   SIP Creation:    POST http://localhost:8001/api/v1/strategies/sip/create"
echo "   SWP Creation:    POST http://localhost:8001/api/v1/strategies/swp/create"
echo "   Portfolio:       POST http://localhost:8001/api/v1/strategies/portfolio/allocate"
echo "   Simulation:      POST http://localhost:8001/api/v1/strategies/simulate"
echo "   Execution:       POST http://localhost:8001/api/v1/strategies/execute/simulate"
echo "   Performance:     POST http://localhost:8001/api/v1/strategies/track/performance"
echo ""
echo "📊 Next steps:"
echo "   1. Configure your investment goals"
echo "   2. Create SIP/SWP strategies"
echo "   3. Run simulations"
echo "   4. Track performance"
