from .market_data import MarketDataService
from .news_data import NewsData
from config.logging import logger

class DataPipeline:
    def __init__(self, alpaca_api):
        self.market_data = MarketDataService(alpaca_api=alpaca_api)
        self.news_data = NewsData()

    async def process_incoming(self, symbol, price):
        # Feature engineering pipeline
        sentiment_score = 0.5 # Default neutral
        # logger.debug(f"Data Pipeline: Received {symbol} at {price}")
        return {
            "symbol": symbol,
            "price": price,
            "sentiment": sentiment_score,
            "timestamp": "now"
        }
