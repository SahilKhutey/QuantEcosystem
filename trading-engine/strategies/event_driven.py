import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import asyncio
import aiohttp
from transformers import pipeline

class EventType(Enum):
    EARNINGS = "earnings"
    MERGER = "merger"
    ACQUISITION = "acquisition"
    DIVIDEND = "dividend"
    SPLIT = "split"
    IPO = "ipo"
    REGULATORY = "regulatory"
    MANAGEMENT = "management"
    PRODUCT = "product"
    PARTNERSHIP = "partnership"

class EventSentiment(Enum):
    VERY_POSITIVE = "very_positive"
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    VERY_NEGATIVE = "very_negative"

@dataclass
class CorporateEvent:
    event_id: str
    symbol: str
    event_type: EventType
    event_date: datetime
    description: str
    expected_impact: float  # -1 to 1
    actual_impact: Optional[float] = None
    sentiment: Optional[EventSentiment] = None
    confidence: float = 0.5
    source: str = ""
    related_symbols: List[str] = None

class EventDrivenStrategy:
    def __init__(self):
        self.events = {}
        self.positions = {}
        self.trade_history = []
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis"
        )
        
    async def fetch_events(self, symbols: List[str], 
                          days_ahead: int = 7) -> List[CorporateEvent]:
        """Fetch upcoming corporate events"""
        events = []
        
        for symbol in symbols:
            # Fetch earnings calendar
            earnings_events = await self._fetch_earnings_calendar(symbol, days_ahead)
            events.extend(earnings_events)
            
            # Fetch dividend events
            dividend_events = await self._fetch_dividend_events(symbol, days_ahead)
            events.extend(dividend_events)
            
            # Fetch other corporate actions
            corporate_events = await self._fetch_corporate_actions(symbol, days_ahead)
            events.extend(corporate_events)
        
        # Sort by date
        events.sort(key=lambda x: x.event_date)
        
        # Store events
        for event in events:
            self.events[event.event_id] = event
        
        return events
    
    async def _fetch_earnings_calendar(self, symbol: str, 
                                     days_ahead: int) -> List[CorporateEvent]:
        """Fetch earnings calendar events"""
        events = []
        
        # Using Alpha Vantage or similar API
        url = f"https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&symbol={symbol}&horizon=3month&apikey=YOUR_KEY"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        for item in data.get('earningsCalendar', []):
                            event_date = datetime.strptime(item['date'], '%Y-%m-%d')
                            
                            # Only include upcoming events
                            if event_date <= datetime.utcnow() + timedelta(days=days_ahead):
                                event = CorporateEvent(
                                    event_id=f"earnings_{symbol}_{item['date']}",
                                    symbol=symbol,
                                    event_type=EventType.EARNINGS,
                                    event_date=event_date,
                                    description=f"Q{item.get('quarter', '')} {item.get('fiscalDateEnding', '')} Earnings",
                                    expected_impact=self._estimate_earnings_impact(item),
                                    source="Alpha Vantage"
                                )
                                events.append(event)
                                
        except Exception as e:
            print(f"Error fetching earnings for {symbol}: {e}")
        
        return events
    
    def _estimate_earnings_impact(self, earnings_data: Dict) -> float:
        """Estimate earnings impact based on estimates vs actual"""
        estimate = earnings_data.get('estimate', 0)
        reported = earnings_data.get('reported', 0)
        
        if estimate == 0:
            return 0
        
        # Calculate surprise percentage
        surprise_pct = (reported - estimate) / abs(estimate)
        
        # Map to impact score (-1 to 1)
        if surprise_pct > 0.10:  # 10% beat
            return 0.8
        elif surprise_pct > 0.05:  # 5% beat
            return 0.5
        elif surprise_pct > 0.02:  # 2% beat
            return 0.2
        elif surprise_pct < -0.10:  # 10% miss
            return -0.8
        elif surprise_pct < -0.05:  # 5% miss
            return -0.5
        elif surprise_pct < -0.02:  # 2% miss
            return -0.2
        else:
            return 0
    
    async def analyze_event_sentiment(self, event: CorporateEvent, 
                                    news_articles: List[Dict]) -> CorporateEvent:
        """Analyze sentiment for an event"""
        if not news_articles:
            return event
        
        # Combine news text
        combined_text = " ".join([article.get('title', '') + " " + 
                                article.get('description', '') 
                                for article in news_articles[:5]])
        
        # Analyze sentiment
        try:
            sentiment_result = self.sentiment_analyzer(combined_text[:1000])[0]
            
            # Map to our sentiment enum
            sentiment_map = {
                'POSITIVE': EventSentiment.POSITIVE,
                'NEGATIVE': EventSentiment.NEGATIVE,
                'NEUTRAL': EventSentiment.NEUTRAL
            }
            
            event.sentiment = sentiment_map.get(sentiment_result['label'], EventSentiment.NEUTRAL)
            event.confidence = sentiment_result['score']
            
            # Adjust expected impact based on sentiment
            if event.sentiment == EventSentiment.POSITIVE:
                event.expected_impact = min(1, event.expected_impact + 0.2)
            elif event.sentiment == EventSentiment.NEGATIVE:
                event.expected_impact = max(-1, event.expected_impact - 0.2)
                
        except Exception as e:
            print(f"Error analyzing sentiment: {e}")
        
        return event
    
    def calculate_event_impact(self, event: CorporateEvent, 
                             historical_volatility: float) -> Dict:
        """Calculate expected impact of an event"""
        
        # Base impact from event type
        base_impacts = {
            EventType.EARNINGS: 0.3,
            EventType.MERGER: 0.4,
            EventType.ACQUISITION: 0.35,
            EventType.DIVIDEND: 0.1,
            EventType.SPLIT: 0.15,
            EventType.IPO: 0.25,
            EventType.REGULATORY: 0.2,
            EventType.MANAGEMENT: 0.15,
            EventType.PRODUCT: 0.2,
            EventType.PARTNERSHIP: 0.15
        }
        
        base_impact = base_impacts.get(event.event_type, 0.2)
        
        # Adjust based on sentiment
        sentiment_multipliers = {
            EventSentiment.VERY_POSITIVE: 1.5,
            EventSentiment.POSITIVE: 1.2,
            EventSentiment.NEUTRAL: 1.0,
            EventSentiment.NEGATIVE: 0.8,
            EventSentiment.VERY_NEGATIVE: 0.5
        }
        
        multiplier = sentiment_multipliers.get(event.sentiment, 1.0)
        
        # Calculate expected price move
        expected_move = base_impact * multiplier * historical_volatility
        
        # Direction based on expected_impact
        direction = 1 if event.expected_impact >= 0 else -1
        expected_move *= direction
        
        # Calculate confidence
        confidence = event.confidence * (1 - abs(event.event_date - datetime.utcnow()).days / 7)
        
        return {
            'expected_move_pct': expected_move * 100,
            'direction': 'up' if expected_move > 0 else 'down',
            'confidence': confidence,
            'base_impact': base_impact,
            'sentiment_multiplier': multiplier,
            'days_until_event': (event.event_date - datetime.utcnow()).days
        }
    
    def generate_event_trade(self, event: CorporateEvent,
                           impact_analysis: Dict,
                           capital: float,
                           current_price: float) -> Optional[Dict]:
        """Generate trade based on event analysis"""
        
        if impact_analysis['confidence'] < 0.3:
            return None
        
        expected_move = impact_analysis['expected_move_pct'] / 100
        direction = impact_analysis['direction']
        
        # Calculate position size (smaller for event-driven due to higher risk)
        max_risk = 0.01  # 1% risk for event-driven
        risk_per_trade = capital * max_risk
        
        # Stop loss wider for event-driven (events can be volatile)
        stop_loss_pct = abs(expected_move) * 1.5  # 1.5x expected move
        stop_loss_distance = current_price * stop_loss_pct
        
        position_size = risk_per_trade / stop_loss_distance
        
        # Entry, stop loss, target
        if direction == 'up':
            entry = current_price
            stop_loss = current_price * (1 - stop_loss_pct)
            target = current_price * (1 + abs(expected_move) * 2)  # 1:2 risk-reward
        else:
            entry = current_price
            stop_loss = current_price * (1 + stop_loss_pct)
            target = current_price * (1 - abs(expected_move) * 2)
        
        trade = {
            'trade_id': f"event_{event.event_id}",
            'symbol': event.symbol,
            'event_type': event.event_type.value,
            'event_date': event.event_date,
            'signal': 'BUY' if direction == 'up' else 'SELL',
            'entry_price': entry,
            'position_size': position_size,
            'stop_loss': stop_loss,
            'target': target,
            'expected_move_pct': impact_analysis['expected_move_pct'],
            'confidence': impact_analysis['confidence'],
            'risk_reward_ratio': abs(target - entry) / abs(entry - stop_loss),
            'days_until_event': impact_analysis['days_until_event'],
            'sentiment': event.sentiment.value if event.sentiment else 'neutral',
            'timestamp': datetime.utcnow(),
            'exit_strategy': 'exit_day_before_event'  # Exit before event if trading anticipation
        }
        
        self.trade_history.append(trade)
        return trade
        
    def _trade_sentiment_gap(self, event: CorporateEvent, pre_market_price: float,
                             yesterday_close: float) -> Optional[Dict]:
        """
        Asymmetrical Gap Arbitrage: Uses rigorous NLP classification mapping.
        If overnight news acts contrarian to retail open panic, instantly generate High-Confidence Synthetics.
        For example: Earnings NLP is VERY_POSITIVE, but stock gaps down > 2% due to general macro flutter. 
        It systematically synthetically buys the gap for intra-day mean reversion.
        """
        gap_pct = (pre_market_price - yesterday_close) / yesterday_close
        
        # NLP Divergence: VERY POSITIVE event but panicked retail GAP DOWN
        if event.sentiment == EventSentiment.VERY_POSITIVE and gap_pct < -0.02:
            return {
                'trade_id': f"gap_fade_buy_{event.event_id}",
                'symbol': event.symbol,
                'event_type': "NLP_GAP_ARBITRAGE",
                'signal': 'STRONG_BUY',
                'confidence': 0.95,
                'entry_price': pre_market_price,
                'target': yesterday_close, # Mean revert gap fill
                'stop_loss': pre_market_price * 0.98,
                'reasoning': "Strong NLP Sentiment countered by illogical retail pre-market drop."
            }
            
        # NLP Divergence: VERY NEGATIVE event but irrational FOMO GAP UP
        if event.sentiment == EventSentiment.VERY_NEGATIVE and gap_pct > 0.02:
            return {
                'trade_id': f"gap_fade_short_{event.event_id}",
                'symbol': event.symbol,
                'event_type': "NLP_GAP_ARBITRAGE",
                'signal': 'STRONG_SELL',
                'confidence': 0.95,
                'entry_price': pre_market_price,
                'target': yesterday_close, # Mean revert gap fill
                'stop_loss': pre_market_price * 1.02,
                'reasoning': "Weak NLP Sentiment countered by illogical algorithmic short-squeeze up."
            }
            
        return None
    
    def post_event_analysis(self, event: CorporateEvent,
                          price_data: pd.DataFrame) -> Dict:
        """Analyze actual impact after event"""
        
        event_date = event.event_date
        pre_event_price = price_data[price_data.index < event_date]['close'].iloc[-1] if len(price_data[price_data.index < event_date]) > 0 else 0
        post_event_price = price_data[price_data.index > event_date]['close'].iloc[0] if len(price_data[price_data.index > event_date]) > 0 else 0
        
        if pre_event_price == 0 or post_event_price == 0:
            return {}
        
        actual_move = (post_event_price - pre_event_price) / pre_event_price * 100
        
        # Compare with expected
        expected_move = event.expected_impact * 100  # Assuming expected_impact is in percentage terms
        
        accuracy = 1 - abs(actual_move - expected_move) / abs(expected_move) if expected_move != 0 else 0
        
        return {
            'event_id': event.event_id,
            'symbol': event.symbol,
            'event_type': event.event_type.value,
            'pre_event_price': pre_event_price,
            'post_event_price': post_event_price,
            'actual_move_pct': actual_move,
            'expected_move_pct': expected_move,
            'accuracy': accuracy,
            'direction_correct': (actual_move > 0 and expected_move > 0) or (actual_move < 0 and expected_move < 0),
            'analysis_timestamp': datetime.utcnow()
        }
