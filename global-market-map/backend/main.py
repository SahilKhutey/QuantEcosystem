import asyncio
import json
import random
import uuid
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from geo_parser.logic import extract_geocoordinates, extract_geocoordinates_async, engine as geo_engine
from sentiment_engine.logic import analyze_sentiment, analyze_sentiment_async
from impact_model.logic import calculate_impact, calculate_impact_async

app = FastAPI(title="Global Market Intelligence Map API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TradeSignal(BaseModel):
    id: str
    lat: float
    lng: float
    asset: str
    sentiment: float
    impact: float
    signal_type: str  # BUY, SELL, NEUTRAL
    timestamp: str
    news_snippet: str

# Sample news snippets for data generation
NEWS_SAMPLES = [
    "US Federal Reserve signals interest rate hike in coming months.",
    "China reports higher than expected GDP growth for Q1.",
    "UK inflation reaches 10-year high as energy prices surge.",
    "Germany warns of potential energy shortage during winter.",
    "Japan's central bank maintains ultra-low interest rates.",
    "Russia and India sign new trade agreements for oil imports.",
    "Brazil's agricultural output hits record levels this season.",
    "Canada announces new investments in green energy technology.",
    "Australia's mining sector sees unprecedented growth in exports.",
    "France and Italy push for new EU fiscal rules.",
    "Saudi Arabia increases oil production to meet global demand.",
    "UAE launches new initiative for tech startups in Dubai.",
    "South Korea's tech giants face new regulatory challenges."
]

# Mock data generation for real-time stream
async def generate_mock_data():
    assets = ["BTC/USD", "EUR/USD", "GOLD", "S&P 500", "OIL", "NASDAQ"]
    while True:
        news = random.choice(NEWS_SAMPLES)
        news_item = {"id": str(uuid.uuid4()), "title": news, "description": ""}
        
        # Parallel analysis
        geo_entities_task = geo_engine.extract_geo_entities(news)
        sentiment_task = analyze_sentiment_async(news)
        
        geo_entities = await geo_entities_task
        lat, lng = (0.0, 0.0)
        if geo_entities and geo_entities[0].geo_coordinates:
            lat, lng = geo_entities[0].geo_coordinates
        else:
            # Fallback for lat/lng if no entities found
            lat, lng = (random.uniform(-60, 80), random.uniform(-170, 180))

        sentiment_score = await sentiment_task
        
        # Calculate impact using the new engine
        # We need to pass a dict of sentiment and a list of entities
        sentiment_dict = {'label': 'neutral' if abs(sentiment_score) < 0.2 else ('bullish' if sentiment_score > 0 else 'bearish'), 
                         'impact_magnitude': 0.5, 'confidence': 0.8}
        impact_score = await calculate_impact_async(news_item, sentiment_dict, [e.__dict__ for e in geo_entities if hasattr(e, '__dict__')])
        
        # Determine signal type based on sentiment
        if sentiment_score > 0.1:
            signal_type = "BUY"
        elif sentiment_score < -0.1:
            signal_type = "SELL"
        else:
            signal_type = "NEUTRAL"

        signal = {
            "id": str(uuid.uuid4())[:8],
            "lat": lat,
            "lng": lng,
            "asset": random.choice(assets),
            "sentiment": round(sentiment_score, 2),
            "impact": round(impact_score, 1),
            "signal_type": signal_type,
            "timestamp": datetime.now().isoformat(),
            "news_snippet": news
        }
        yield signal
        await asyncio.sleep(4)

from fastapi.responses import FileResponse
import os

@app.get("/")
async def root():
    # Serve the demo.html file from the parent directory
    demo_path = os.path.join(os.path.dirname(os.getcwd()), "demo.html")
    if os.path.exists(demo_path):
        return FileResponse(demo_path)
    return {"message": "Global Market Intelligence Map API is running, but demo.html was not found."}

@app.websocket("/ws/signals")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        async for signal in generate_mock_data():
            await websocket.send_json(signal)
    except WebSocketDisconnect:
        print("Client disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
