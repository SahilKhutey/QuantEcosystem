#!/bin/bash
# deploy-ai-agent.sh

echo "🚀 Deploying AI Trading Agent System..."
echo "==========================================="

# 1. Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# 2. Set up environment
echo "🔧 Setting up environment..."
export OPENAI_API_KEY="your-openai-key-here"
export BROKER_API_KEY="your-broker-key-here"

# 3. Start the system components
echo "🚀 Starting system components..."

# Start WebSocket messaging server in background
echo "📡 Starting Messaging Server (ws://localhost:8765)..."
python -c "import asyncio; from communication.real_time_messaging import RealTimeMessagingSystem; sys.path.append('.'); asyncio.run(RealTimeMessagingSystem().start_server())" &

# Start Dashboard in foreground
echo "📊 Launching Dashboard (http://localhost:8501)..."
streamlit run dashboard/real_time_dashboard.py

echo "✅ AI Trading Agent deployment process initiated!"
echo ""
echo "🌐 Access Points:"
echo "   Dashboard: http://localhost:8501"
echo "   WebSocket: ws://localhost:8765"
echo ""
echo "📊 Monitoring:"
echo "   Use the dashboard to monitor system health and live signals."
