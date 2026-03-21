import asyncio
import random
from .sentiment_analyzer import FinancialSentimentEngine, SentimentLabel

# Initialize the engine
engine = FinancialSentimentEngine()

async def analyze_sentiment_async(text: str) -> float:
    """
    Analyze sentiment using the advanced FinancialSentimentEngine.
    Returns a float between -1.0 and 1.0.
    """
    try:
        result = await engine.analyze_sentiment(text)
        return float(result.raw_score)
    except Exception as e:
        print(f"Error in advanced sentiment analysis: {e}")
        return 0.0

def analyze_sentiment(text: str) -> float:
    """
    Synchronous wrapper for analyze_sentiment_async.
    """
    try:
        # This is a bit hacky but works for a demo
        return asyncio.run(analyze_sentiment_async(text))
    except:
        # Simple fallback
        positive_words = ["surge", "gain", "profit", "up", "bullish", "record", "high", "growth", "investment", "increase"]
        negative_words = ["crash", "drop", "loss", "down", "bearish", "low", "war", "crisis", "shortage", "challenge"]
        score = 0
        text_lower = text.lower()
        for word in positive_words:
            if word in text_lower: score += 0.2
        for word in negative_words:
            if word in text_lower: score -= 0.2
        return max(-1.0, min(1.0, score))
