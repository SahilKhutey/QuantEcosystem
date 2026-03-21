from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
import uvicorn
import os
from datetime import datetime

from backend.core.database import get_db, StockData, NewsArticle
from backend.services.market_data_service import MarketDataService
from backend.services.news_service import NewsService

app = FastAPI(
    title="Stock Analyzer API",
    description="Real-time stock analysis with AI-powered insights",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Services initialization
market_service = MarketDataService()
news_service = NewsService()

@app.get("/")
async def root():
    return {"message": "Stock Analyzer API", "status": "running", "timestamp": datetime.utcnow()}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.get("/api/stocks/{symbol}")
async def get_stock_data(symbol: str, db: Session = Depends(get_db)):
    """Get latest stock data for a symbol"""
    try:
        data = market_service.get_latest_data(symbol, db)
        return {"symbol": symbol, "data": data}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/news")
async def get_news(limit: int = 10, db: Session = Depends(get_db)):
    """Get latest news articles"""
    news = db.query(NewsArticle).order_by(NewsArticle.published_at.desc()).limit(limit).all()
    return {"news": news}

@app.post("/api/analyze/{symbol}")
async def analyze_stock(symbol: str, background_tasks: BackgroundTasks):
    """Trigger analysis for a stock"""
    background_tasks.add_task(market_service.analyze_symbol, symbol)
    return {"message": f"Analysis started for {symbol}", "status": "processing"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
