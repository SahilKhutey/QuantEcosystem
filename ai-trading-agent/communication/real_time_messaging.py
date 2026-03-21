import asyncio
import websockets
import json
from typing import Set, Dict, List, Any
from dataclasses import dataclass
from datetime import datetime
import pandas as pd
from loguru import logger

@dataclass
class TradingAlert:
    alert_id: str
    symbol: str
    recommendation: str
    confidence: float
    reasoning: str
    urgency: str  # LOW, MEDIUM, HIGH, CRITICAL
    timestamp: datetime
    data: Dict[str, Any]

class RealTimeMessagingSystem:
    def __init__(self, host: str = '0.0.0.0', port: int = 8765):
        self.host = host
        self.port = port
        self.connected_clients: Set[websockets.WebSocketServerProtocol] = set()
        self.alert_queue = asyncio.Queue()
        self.message_history = []
        logger.info(f"RealTimeMessagingSystem initialized on {host}:{port}")
        
    async def start_server(self):
        """Start WebSocket server"""
        async with websockets.serve(self.handle_client, self.host, self.port):
            logger.info(f"WebSocket Messaging Server started on ws://{self.host}:{self.port}")
            # Start alert processing task
            asyncio.create_task(self.process_alerts())
            await asyncio.Future() # run forever
    
    async def handle_client(self, websocket):
        """Handle client connections"""
        self.connected_clients.add(websocket)
        logger.info(f"New client connected: {websocket.remote_address}. Total: {len(self.connected_clients)}")
        try:
            # Send connection confirmation
            await websocket.send(json.dumps({
                'type': 'connection_established',
                'timestamp': datetime.now().isoformat(),
                'message': 'Connected to AI Trading Agent Real-Time Messaging'
            }))
            
            # Send recent alerts
            recent_alerts = self.message_history[-10:]  # Last 10 alerts
            for alert in recent_alerts:
                await websocket.send(json.dumps(alert))
            
            # Listen for client messages
            async for message in websocket:
                await self.handle_client_message(message, websocket)
                
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Client connection closed: {websocket.remote_address}")
        finally:
            self.connected_clients.remove(websocket)
            logger.info(f"Client disconnected. Total: {len(self.connected_clients)}")
    
    async def handle_client_message(self, message: str, websocket):
        """Handle messages from clients"""
        try:
            data = json.loads(message)
            message_type = data.get('type')
            
            if message_type == 'chat_query':
                response = await self.handle_chat_query(data['query'], data.get('context', {}))
                await websocket.send(json.dumps(response))
                
            elif message_type == 'subscription_update':
                # Simplified subscription handling
                await websocket.send(json.dumps({'type': 'subscription_status', 'status': 'updated'}))
                
        except json.JSONDecodeError:
            await websocket.send(json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    async def broadcast_alert(self, alert_data: Dict[str, Any]):
        """Queue a trading alert for broadcasting"""
        # Add to history
        self.message_history.append(alert_data)
        if len(self.message_history) > 100:  # Keep last 100 messages
            self.message_history.pop(0)
        
        # Add to queue for processing
        await self.alert_queue.put(alert_data)

    async def process_alerts(self):
        """Process alerts from the queue and broadcast them"""
        while True:
            alert_data = await self.alert_queue.get()
            
            # Broadcast to all clients
            if not self.connected_clients:
                self.alert_queue.task_done()
                continue

            disconnected_clients = []
            payload = json.dumps(alert_data)
            
            tasks = []
            for client in self.connected_clients:
                tasks.append(asyncio.create_task(self._send_to_client(client, payload, disconnected_clients)))
            
            if tasks:
                await asyncio.gather(*tasks)
            
            # Clean up disconnected clients
            for client in disconnected_clients:
                if client in self.connected_clients:
                    self.connected_clients.remove(client)
            
            self.alert_queue.task_done()

    async def _send_to_client(self, client, payload, disconnected_list):
        try:
            await client.send(payload)
        except websockets.exceptions.ConnectionClosed:
            disconnected_list.append(client)

    async def handle_chat_query(self, query: str, context: Dict) -> Dict:
        """Handle natural language queries from users"""
        # Simple response system - in production, integrate with reasoning engine
        response_templates = {
            'what should i buy': "Based on current analysis, technology and banking sectors show strong momentum.",
            'market outlook': "The market is currently in a bullish regime with moderate volatility.",
            'risk assessment': "Overall risk level is medium with some sector-specific opportunities.",
            'portfolio advice': "Consider diversifying across sectors with emphasis on momentum leaders."
        }
        
        query_lower = query.lower()
        response = "I need more context to provide specific advice. Please ask about specific stocks or sectors."
        
        for pattern, template_response in response_templates.items():
            if pattern in query_lower:
                response = template_response
                break
        
        return {
            'type': 'chat_response',
            'query': query,
            'response': response,
            'timestamp': datetime.now().isoformat(),
            'context_used': context
        }
