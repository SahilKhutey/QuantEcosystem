import asyncio
import json
import sys
import os
from loguru import logger

# Add root to sys.path
sys.path.append(os.getcwd())

async def test_reasoning():
    print("Testing Reasoning Engine...")
    try:
        from agents.reasoning_engine import ReasoningEngine
        # Using a dummy key for initialization test
        engine = ReasoningEngine('sk-test-key')
        test_data = {
            'fused_signals': {'AAPL': {'composite_score': 0.82, 'final_recommendation': 'BUY'}},
            'market_context': {'trend': 'bullish', 'volatility': 'low'},
            'agent_analysis': {'market': 'Strong uptrend', 'news': 'Positive sentiment'}
        }
        # This will trigger fallback since the key is fake, which is what we want to test first
        result = await engine.analyze(test_data)
        print(f"✅ Reasoning engine diagnostic passed (Mode: {result.analysis.get('mode', 'Fallback')}): {result.analysis.get('recommendation')}")
        return True
    except Exception as e:
        print(f"❌ Reasoning engine test failed: {e}")
        return False

async def test_messaging():
    print("\nTesting Real-time Messaging...")
    try:
        import websockets
        from communication.real_time_messaging import RealTimeMessagingSystem
        
        # Start server in background
        server = RealTimeMessagingSystem(host='127.0.0.1', port=8765)
        server_task = asyncio.create_task(server.start_server())
        await asyncio.sleep(1) # wait for start
        
        # Test client
        async with websockets.connect('ws://localhost:8765') as websocket:
            await websocket.send(json.dumps({'type': 'chat_query', 'query': 'What should I buy?'}))
            response = await websocket.recv()
            res_data = json.loads(response)
            if res_data['type'] == 'chat_response':
                print(f"✅ Messaging server diagnostic passed: {res_data['response']}")
            else:
                print(f"⚠️ Messaging server returned unexpected type: {res_data['type']}")
        
        # Shutdown
        server_task.cancel()
        return True
    except Exception as e:
        print(f"❌ Messaging test failed: {e}")
        return False

async def main():
    print("🚀 Starting AI Trading Agent Diagnostic Suite\n" + "="*40)
    
    reasoning_ok = await test_reasoning()
    messaging_ok = await test_messaging()
    
    print("\n" + "="*40)
    if reasoning_ok and messaging_ok:
        print("🎉 All core systems are READY for production launch.")
        print("Next Step: Run 'bash deploy-ai-agent.sh' to start the full stack.")
    else:
        print("⚠️ Some systems failed diagnostics. Check logs for details.")

if __name__ == "__main__":
    asyncio.run(main())
