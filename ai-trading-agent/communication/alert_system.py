import asyncio
import json
from typing import Dict, List, Set
from loguru import logger
import pandas as pd
from websockets.server import serve, WebSocketServerProtocol

class RealTimeCommunicationAgent:
    def __init__(self, host: str = "0.0.0.0", port: int = 8765):
        self.host = host
        self.port = port
        self.connected_clients: Set[WebSocketServerProtocol] = set()
        self.alert_queue = asyncio.Queue()
        logger.info(f"RealTimeCommunicationAgent initialized on {host}:{port}")

    async def start_server(self):
        """Start the WebSocket server."""
        async with serve(self.ws_handler, self.host, self.port):
            logger.info(f"WebSocket server started on ws://{self.host}:{self.port}")
            await asyncio.Future()  # run forever

    async def ws_handler(self, websocket: WebSocketServerProtocol):
        """Handle incoming WebSocket connections."""
        self.connected_clients.add(websocket)
        logger.info(f"New client connected. Total: {len(self.connected_clients)}")
        try:
            async for message in websocket:
                # Handle potential incoming queries from clients
                await self.handle_incoming_message(websocket, message)
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
        finally:
            self.connected_clients.remove(websocket)
            logger.info(f"Client disconnected. Total: {len(self.connected_clients)}")

    async def broadcast_signal(self, signal: Dict):
        """Broadcast trading signal to all connected clients."""
        message = {
            'type': 'trading_signal',
            'timestamp': pd.Timestamp.now().isoformat(),
            'symbol': signal.get('symbol', 'UNKNOWN'),
            'recommendation': signal.get('recommendation', 'HOLD'),
            'confidence': signal.get('confidence', 0),
            'reasoning': signal.get('reasoning', ''),
            'urgency': signal.get('urgency', 'medium')
        }
        
        if not self.connected_clients:
            logger.debug("No clients connected for broadcast")
            return

        payload = json.dumps(message)
        tasks = [asyncio.create_task(client.send(payload)) for client in self.connected_clients]
        await asyncio.gather(*tasks, return_exceptions=True)
        logger.info(f"Broadcasted signal to {len(self.connected_clients)} clients")

    async def handle_incoming_message(self, websocket: WebSocketServerProtocol, message: str):
        """Handle messages sent by clients (e.g., chat queries)."""
        try:
            data = json.loads(message)
            if data.get('type') == 'chat_query':
                query = data.get('query')
                # Placeholder for context gathering
                response = await self.handle_chat_query(query, {})
                await websocket.send(json.dumps({
                    'type': 'chat_response',
                    'data': response
                }))
        except Exception as e:
            logger.error(f"Error handling incoming message: {e}")

    async def handle_chat_query(self, query: str, context: Dict) -> Dict:
        """Handle natural language queries from users."""
        logger.info(f"Handling chat query: {query}")
        return {
            'query': query,
            'response': f"Analyzing your query about '{query}'...",
            'supporting_data': {},
            'timestamp': pd.Timestamp.now().isoformat()
        }

# Legacy AlertSystem wrapper for backward compatibility if needed
class AlertSystem(RealTimeCommunicationAgent):
    def __init__(self):
        super().__init__()

if __name__ == "__main__":
    agent = RealTimeCommunicationAgent()
    asyncio.run(agent.start_server())
