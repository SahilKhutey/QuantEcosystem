from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
import json
import asyncio
from api.agent_orchestrator import AgentOrchestrator
from loguru import logger

app = FastAPI()
orchestrator = AgentOrchestrator()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{symbol}")
async def websocket_endpoint(websocket: WebSocket, symbol: str):
    await manager.connect(websocket)
    try:
        while True:
            # Poll for updates every 10 seconds (for demo)
            signal_data = await orchestrator.generate_unified_signal(symbol.replace('_', '/'))
            await websocket.send_text(json.dumps(signal_data))
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.get("/api/signal/{symbol}")
async def get_signal(symbol: str):
    result = await orchestrator.generate_unified_signal(symbol.replace('_', '/'))
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
