import logging
from datetime import datetime
import random

class SentimentEngine:
    """
    Processes real-time news and social media feeds to generate sentiment alpha.
    """
    def __init__(self):
        self.logger = logging.getLogger("AI.SentimentEngine")
        self.history = []
        # Keywords for simple sentiment analysis (mocking LLM extraction)
        self.sentiment_lexicon = {
            'bullish': 0.8, 'bearish': -0.8, 'growth': 0.5, 'recession': -0.9,
            'rate cut': 0.7, 'rate hike': -0.6, 'inflation': -0.4, 'surplus': 0.4,
            'deficit': -0.3, 'outperform': 0.6, 'underperform': -0.6
        }

    def analyze_text(self, text: str, symbol: str) -> dict:
        """
        Analyzes text and returns a sentiment score.
        In production, this would call GPT-4 or a specialized FinBERT model.
        """
        score = 0.0
        words = text.lower().split()
        for word, weight in self.sentiment_lexicon.items():
            if word in text.lower():
                score += weight
        
        # Clamp score between -1 and 1
        final_score = max(-1.0, min(1.0, score))
        
        result = {
            'symbol': symbol,
            'text': text,
            'sentiment': final_score,
            'timestamp': datetime.utcnow().isoformat(),
            'confidence': 0.85 if abs(final_score) > 0 else 0.5
        }
        
        self.history.append(result)
        if len(self.history) > 100: self.history.pop(0)
        
        return result

    def get_aggregate_sentiment(self, symbol: str) -> float:
        """Returns average sentiment for a symbol over recent history."""
        recent = [h['sentiment'] for h in self.history if h['symbol'] == symbol]
        if not recent: return 0.0
        return sum(recent) / len(recent)
