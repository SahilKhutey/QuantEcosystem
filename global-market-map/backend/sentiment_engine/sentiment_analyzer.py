import asyncio
from transformers import pipeline
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import numpy as np

class SentimentLabel(Enum):
    VERY_BULLISH = "very_bullish"
    BULLISH = "bullish"
    NEUTRAL = "neutral"
    BEARISH = "bearish"
    VERY_BEARISH = "very_bearish"

@dataclass
class SentimentResult:
    label: SentimentLabel
    confidence: float
    raw_score: float
    keywords: List[str]
    impact_magnitude: float

class FinancialSentimentEngine:
    def __init__(self):
        # Load pre-trained financial sentiment model
        try:
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis"
            )
        except Exception as e:
            print(f"Error loading hf model: {e}. Falling back to default pipeline.")
            self.sentiment_pipeline = pipeline("sentiment-analysis")
        
        # Financial keyword dictionaries
        self.bullish_keywords = [
            'growth', 'profit', 'surge', 'rally', 'boom', 'expansion',
            'beat estimates', 'earnings up', 'dividend increase', 'buyback'
        ]
        
        self.bearish_keywords = [
            'decline', 'loss', 'drop', 'fall', 'slump', 'recession',
            'miss estimates', 'earnings down', 'layoff', 'bankruptcy'
        ]
        
        self.high_impact_keywords = [
            'fed', 'interest rates', 'inflation', 'gdp', 'earnings',
            'merger', 'acquisition', 'lawsuit', 'regulation'
        ]
    
    async def analyze_sentiment(self, text: str) -> SentimentResult:
        """Analyze financial sentiment with enhanced features"""
        
        # Basic sentiment analysis
        try:
            sentiment_result = self.sentiment_pipeline(text[:512])[0]  # Limit text length
            # Convert to our sentiment scale
            sentiment_score = self._convert_to_score(sentiment_result)
            confidence = sentiment_result['score']
        except Exception as e:
            print(f"Transformers error: {e}")
            sentiment_score = 0.0
            confidence = 0.5
        
        # Keyword analysis
        keywords = self._extract_keywords(text)
        keyword_impact = self._calculate_keyword_impact(keywords)
        
        # Combine scores
        final_score = sentiment_score * 0.7 + keyword_impact * 0.3
        sentiment_label = self._score_to_label(final_score)
        
        # Calculate impact magnitude
        impact_magnitude = self._calculate_impact_magnitude(text, keywords)
        
        return SentimentResult(
            label=sentiment_label,
            confidence=confidence,
            raw_score=final_score,
            keywords=keywords,
            impact_magnitude=impact_magnitude
        )
    
    def _convert_to_score(self, sentiment_result: Dict) -> float:
        """Convert sentiment result to numerical score (-1 to 1)"""
        label = sentiment_result['label'].lower()
        score = sentiment_result['score']
        
        if label == 'positive' or label == 'label_1' or 'bull' in label:
            return score  # 0 to 1
        elif label == 'negative' or label == 'label_0' or 'bear' in label:
            return -score  # -1 to 0
        else:
            return 0
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract relevant financial keywords"""
        text_lower = text.lower()
        found_keywords = []
        
        # Check bullish keywords
        for keyword in self.bullish_keywords:
            if keyword in text_lower:
                found_keywords.append(keyword)
        
        # Check bearish keywords
        for keyword in self.bearish_keywords:
            if keyword in text_lower:
                found_keywords.append(keyword)
        
        # Check high-impact keywords
        for keyword in self.high_impact_keywords:
            if keyword in text_lower:
                found_keywords.append(f"high_impact:{keyword}")
        
        return found_keywords
    
    def _calculate_keyword_impact(self, keywords: List[str]) -> float:
        """Calculate impact based on keywords"""
        impact = 0
        
        for keyword in keywords:
            if keyword in self.bullish_keywords:
                impact += 0.1
            elif keyword in self.bearish_keywords:
                impact -= 0.1
            elif keyword.startswith('high_impact:'):
                impact *= 1.5  # Amplify impact for important keywords
        
        return max(-1.0, min(1.0, impact))
    
    def _score_to_label(self, score: float) -> SentimentLabel:
        """Convert numerical score to sentiment label"""
        if score > 0.6:
            return SentimentLabel.VERY_BULLISH
        elif score > 0.2:
            return SentimentLabel.BULLISH
        elif score > -0.2:
            return SentimentLabel.NEUTRAL
        elif score > -0.6:
            return SentimentLabel.BEARISH
        else:
            return SentimentLabel.VERY_BEARISH
    
    def _calculate_impact_magnitude(self, text: str, keywords: List[str]) -> float:
        """Calculate the magnitude of impact"""
        magnitude = 0.5  # Base magnitude
        
        # Increase based on high-impact keywords
        high_impact_count = sum(1 for k in keywords if k.startswith('high_impact:'))
        magnitude += high_impact_count * 0.2
        
        # Increase based on text length (longer articles might be more important)
        magnitude += min(len(text) / 1000, 0.3)  # Cap at 0.3
        
        return min(magnitude, 1.0)  # Cap at 1.0
    
    async def analyze_news_batch(self, news_items: List[Dict]) -> List[Dict]:
        """Analyze sentiment for multiple news items"""
        tasks = []
        for news in news_items:
            text = f"{news.get('title', '')} {news.get('description', '')}"
            task = self.analyze_sentiment(text)
            tasks.append((news, task))
        
        results = []
        for news, task in tasks:
            try:
                sentiment = await task
                results.append({
                    'news_id': news.get('id'),
                    'sentiment': sentiment.__dict__ if hasattr(sentiment, '__dict__') else str(sentiment),
                    'timestamp': asyncio.get_event_loop().time()
                })
            except Exception as e:
                print(f"Sentiment analysis failed for news {news.get('id')}: {e}")
        
        return results
