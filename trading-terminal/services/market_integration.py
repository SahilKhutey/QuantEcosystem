import asyncio
import pandas as pd
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import logging
from services.data.market_data_service import MarketDataService
import datetime
import pytz
import numpy as np

@dataclass
class MarketRegion:
    name: str
    country_code: str
    timezone: str
    market_hours: Dict
    primary_index: str
    currency: str
    region: str
    economic_indicators: List[str] = None
    trading_hours: str = None

class MarketIntegrationService:
    def __init__(self, market_data: MarketDataService):
        self.market_data = market_data
        self.regions = self._load_market_regions()
        self.logger = logging.getLogger('MarketIntegration')
        self.current_market_state = {}
        self.region_sentiment = {}
        self.correlation_matrix = None
        self.last_correlation_update = None
    
    def _load_market_regions(self) -> Dict[str, MarketRegion]:
        """Load global market regions and their characteristics"""
        return {
            'united_states': MarketRegion(
                name="United States",
                country_code="US",
                timezone="America/New_York",
                market_hours={
                    'open': '9:30',
                    'close': '16:00',
                    'pre_open': '4:00',
                    'after_hours': '16:30'
                },
                primary_index="S&P 500",
                currency="USD",
                region="North America",
                economic_indicators=["FEDFUNDS", "CPIAUCSL", "UNRATE"],
                trading_hours="9:30 AM - 4:00 PM ET"
            ),
            'united_kingdom': MarketRegion(
                name="United Kingdom",
                country_code="GB",
                timezone="Europe/London",
                market_hours={
                    'open': '8:00',
                    'close': '16:30',
                    'pre_open': '7:00',
                    'after_hours': '17:00'
                },
                primary_index="FTSE 100",
                currency="GBP",
                region="Europe",
                economic_indicators=["UKINFL", "UKGDP", "UKUNEMP"],
                trading_hours="8:00 AM - 4:30 PM GMT"
            ),
            'europe': MarketRegion(
                name="European Union",
                country_code="EU",
                timezone="Europe/Berlin",
                market_hours={
                    'open': '9:00',
                    'close': '17:30',
                    'pre_open': '8:00',
                    'after_hours': '18:30'
                },
                primary_index="STOXX 50",
                currency="EUR",
                region="Europe",
                economic_indicators=["EUEMP", "EUGDP", "EUCPI"],
                trading_hours="9:00 AM - 5:30 PM CET"
            ),
            'japan': MarketRegion(
                name="Japan",
                country_code="JP",
                timezone="Asia/Tokyo",
                market_hours={
                    'open': '9:00',
                    'close': '15:00',
                    'pre_open': '8:30',
                    'after_hours': '15:30'
                },
                primary_index="Nikkei 225",
                currency="JPY",
                region="Asia",
                economic_indicators=["JPNINFL", "JPNEMP", "JPNGDP"],
                trading_hours="9:00 AM - 3:00 PM JST"
            ),
            'india': MarketRegion(
                name="India",
                country_code="IN",
                timezone="Asia/Kolkata",
                market_hours={
                    'open': '9:15',
                    'close': '15:30',
                    'pre_open': '9:00',
                    'after_hours': '16:00'
                },
                primary_index="Nifty 50",
                currency="INR",
                region="Asia",
                economic_indicators=["INFCPI", "INGDP", "INEMP"],
                trading_hours="9:15 AM - 3:30 PM IST"
            ),
            'china': MarketRegion(
                name="China",
                country_code="CN",
                timezone="Asia/Shanghai",
                market_hours={
                    'open': '9:30',
                    'close': '15:00',
                    'pre_open': '9:15',
                    'after_hours': '15:30'
                },
                primary_index="SSE Composite",
                currency="CNY",
                region="Asia",
                economic_indicators=["CHNCPI", "CHNGDP", "CHNEMP"],
                trading_hours="9:30 AM - 3:00 PM CST"
            ),
            'australia': MarketRegion(
                name="Australia",
                country_code="AU",
                timezone="Australia/Sydney",
                market_hours={
                    'open': '10:00',
                    'close': '16:00',
                    'pre_open': '9:00',
                    'after_hours': '16:30'
                },
                primary_index="ASX 200",
                currency="AUD",
                region="Oceania",
                economic_indicators=["AUSINFL", "AUSGDP", "AUSEMP"],
                trading_hours="10:00 AM - 4:00 PM AEST"
            ),
            'brazil': MarketRegion(
                name="Brazil",
                country_code="BR",
                timezone="America/Sao_Paulo",
                market_hours={
                    'open': '10:00',
                    'close': '17:00',
                    'pre_open': '9:30',
                    'after_hours': '17:30'
                },
                primary_index="Ibovespa",
                currency="BRL",
                region="South America",
                economic_indicators=["BRACPI", "BRAGDP", "BRAEMP"],
                trading_hours="10:00 AM - 5:00 PM BRT"
            )
        }
    
    async def get_market_status(self, region: str = None) -> Dict:
        """Get current status of all markets or a specific region"""
        if region and region in self.regions:
            return await self._get_single_region_status(region)
        else:
            return {r: await self._get_single_region_status(r) for r in list(self.regions.keys())}
    
    async def _get_single_region_status(self, region_id: str) -> Dict:
        """Get current status for a single market region"""
        region = self.regions[region_id]
        current_time = datetime.datetime.now(pytz.timezone(region.timezone))
        market_open = self._is_market_open(current_time, region)
        
        # Get current market data
        market_data = await self._get_region_market_data(region)
        
        # Analyze sentiment
        sentiment = await self._analyze_region_sentiment(region)
        
        # Check economic indicators
        economic_data = await self._get_economic_data(region)
        
        # Market status
        status = self._determine_market_status(market_data, sentiment, economic_data)
        
        return {
            'region': region.name,
            'country_code': region.country_code,
            'timezone': region.timezone,
            'current_time': current_time.strftime("%Y-%m-%d %H:%M:%S"),
            'is_open': market_open,
            'market_hours': region.trading_hours,
            'primary_index': region.primary_index,
            'market_data': market_data,
            'sentiment': sentiment,
            'economic_indicators': economic_data,
            'status': status,
            'currency': region.currency
        }
    
    def _is_market_open(self, current_time: datetime, region: MarketRegion) -> bool:
        """Check if market is currently open"""
        open_time = datetime.time(*map(int, region.market_hours['open'].split(':')))
        close_time = datetime.time(*map(int, region.market_hours['close'].split(':')))
        
        return open_time <= current_time.time() < close_time
    
    async def _get_region_market_data(self, region: MarketRegion) -> Dict:
        """Get current market data for a region"""
        try:
            index_symbol = self._get_index_symbol(region.primary_index)
            data = await self.market_data.get_historical_data(
                symbol=index_symbol,
                asset_type='stocks',
                timeframe='1D',
                end=datetime.datetime.now().strftime("%Y-%m-%d")
            )
            
            if not data.empty:
                latest = data.iloc[-1]
                prev = data.iloc[-2] if len(data) > 1 else latest
                return {
                    'index': region.primary_index,
                    'symbol': index_symbol,
                    'open': float(latest['open']),
                    'high': float(latest['high']),
                    'low': float(latest['low']),
                    'close': float(latest['close']),
                    'volume': int(latest['volume']),
                    'change': ((latest['close'] - prev['close']) / prev['close']) * 100 if len(data) > 1 else 0
                }
        except Exception as e:
            self.logger.error(f"Error getting market data for {region.name}: {str(e)}")
        
        return {
            'index': region.primary_index,
            'status': 'unavailable'
        }
    
    def _get_index_symbol(self, index_name: str) -> str:
        """Convert index name to symbol format for data sources"""
        index_symbols = {
            "S&P 500": "SPY",
            "FTSE 100": "IQQQ",
            "STOXX 50": "FEZ",
            "Nikkei 225": "EWJ",
            "Nifty 50": "INDA",
            "SSE Composite": "MCHI",
            "ASX 200": "EWA",
            "Ibovespa": "EWZ"
        }
        return index_symbols.get(index_name, index_name)
    
    async def _analyze_region_sentiment(self, region: MarketRegion) -> Dict:
        """Analyze sentiment for a market region"""
        news = await self._get_region_news(region)
        sentiment_score = 0
        positive_count = 0
        negative_count = 0
        
        for article in news[:5]:
            score = self._analyze_article_sentiment(article.get('description', '') or article.get('title', ''))
            sentiment_score += score
            if score > 0: positive_count += 1
            elif score < 0: negative_count += 1
        
        normalized_score = sentiment_score / 5 if news else 0
        
        return {
            'score': normalized_score,
            'positive_count': positive_count,
            'negative_count': negative_count,
            'total_articles': len(news),
            'sentiment': self._convert_score_to_sentiment(normalized_score),
            'news': news[:3]
        }
    
    def _analyze_article_sentiment(self, content: str) -> float:
        """Simple sentiment analysis for demonstration"""
        positive_words = ['strong', 'growth', 'positive', 'buy', 'rally', 'outlook', 'recovery', 'upward']
        negative_words = ['weak', 'decline', 'negative', 'sell', 'downturn', 'crisis', 'downward', 'recession']
        content = content.lower()
        positive_count = sum(1 for word in positive_words if word in content)
        negative_count = sum(1 for word in negative_words if word in content)
        if positive_count + negative_count == 0: return 0
        return (positive_count - negative_count) / (positive_count + negative_count)
    
    def _convert_score_to_sentiment(self, score: float) -> str:
        """Convert sentiment score to label"""
        if score > 0.3: return "BULLISH"
        elif score > 0.1: return "MODERATELY_BULLISH"
        elif score > -0.1: return "NEUTRAL"
        elif score > -0.3: return "MODERATELY_BEARISH"
        else: return "BEARISH"
    
    async def _get_region_news(self, region: MarketRegion) -> List[Dict]:
        """Get news relevant to a market region"""
        region_query = f"({region.name} OR {region.country_code})"
        if region.economic_indicators:
            region_query += " OR " + " OR ".join(region.economic_indicators)
        return await self.market_data.get_news(query=region_query)
    
    async def _get_economic_data(self, region: MarketRegion) -> List[Dict]:
        """Get economic data for a region"""
        economic_data = []
        for indicator_id in (region.economic_indicators or []):
            try:
                indicator_data = await self.market_data.get_historical_data(
                    symbol=indicator_id,
                    asset_type='economic',
                    timeframe='1D',
                    end=datetime.datetime.now().strftime("%Y-%m-%d")
                )
                if not indicator_data.empty:
                    latest = indicator_data.iloc[-1]
                    prev = indicator_data.iloc[-2] if len(indicator_data) > 1 else latest
                    economic_data.append({
                        'id': indicator_id,
                        'value': float(latest['close']),
                        'date': latest.name.date() if hasattr(latest.name, 'date') else latest.name,
                        'change': ((latest['close'] - prev['close']) / prev['close']) * 100 if len(indicator_data) > 1 else 0
                    })
            except Exception as e:
                self.logger.error(f"Error getting economic data for {indicator_id}: {str(e)}")
        return economic_data
    
    def _determine_market_status(self, market_data: Dict, sentiment: Dict, economic_data: List[Dict]) -> str:
        """Determine overall market status"""
        status = "STABLE"
        change = market_data.get('change', 0)
        if change > 2: status = "STRONG_UP"
        elif change < -2: status = "STRONG_DOWN"
        elif change > 1: status = "MODERATE_UP"
        elif change < -1: status = "MODERATE_DOWN"
        
        if sentiment['sentiment'] == "BULLISH" and status in ["MODERATE_UP", "STRONG_UP", "STABLE"]:
            status = "BULLISH" if status == "STABLE" else status + "_BULLISH"
        elif sentiment['sentiment'] == "BEARISH" and status in ["MODERATE_DOWN", "STRONG_DOWN", "STABLE"]:
            status = "BEARISH" if status == "STABLE" else status + "_BEARISH"
        return status
    
    async def get_global_market_view(self) -> Dict:
        """Get comprehensive global market view"""
        market_statuses = await self.get_market_status()
        return {
            'timestamp': datetime.datetime.now().isoformat(),
            'regions': market_statuses,
            'correlation_matrix': await self.get_market_correlation(),
            'global_sentiment': self._calculate_global_sentiment(market_statuses),
            'global_economic_indicators': await self._get_global_economic_data()
        }
    
    async def get_market_correlation(self) -> Dict:
        """Get correlation between global markets"""
        if self.correlation_matrix is None or (datetime.datetime.now() - self.last_correlation_update).total_seconds() > 3600:
            self.correlation_matrix = await self._calculate_market_correlation()
            self.last_correlation_update = datetime.datetime.now()
        return {
            'matrix': self.correlation_matrix,
            'last_updated': self.last_correlation_update.isoformat()
        }
    
    async def _calculate_market_correlation(self) -> Dict:
        """Calculate correlation between global markets"""
        index_data = {}
        for region_id, region in self.regions.items():
            try:
                index_symbol = self._get_index_symbol(region.primary_index)
                data = await self.market_data.get_historical_data(
                    symbol=index_symbol,
                    asset_type='stocks',
                    timeframe='1D',
                    start=(datetime.datetime.now() - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
                )
                if not data.empty:
                    index_data[region_id] = data['close'].pct_change().dropna()
            except Exception as e:
                self.logger.error(f"Error getting data for {region.primary_index}: {str(e)}")
        
        correlation_matrix = {}
        for region1 in index_data:
            correlation_matrix[region1] = {}
            for region2 in index_data:
                if region1 == region2:
                    correlation_matrix[region1][region2] = 1.0
                else:
                    try:
                        corr = np.corrcoef(index_data[region1], index_data[region2])[0, 1]
                        correlation_matrix[region1][region2] = float(corr)
                    except:
                        correlation_matrix[region1][region2] = 0.0
        return correlation_matrix
    
    def _calculate_global_sentiment(self, market_statuses: Dict) -> Dict:
        """Calculate global market sentiment"""
        bullish = sum(1 for s in market_statuses.values() if "BULLISH" in s['status'])
        bearish = sum(1 for s in market_statuses.values() if "BEARISH" in s['status'])
        total = len(market_statuses)
        if bullish > bearish * 1.5: sentiment = "BULLISH"
        elif bearish > bullish * 1.5: sentiment = "BEARISH"
        else: sentiment = "NEUTRAL"
        return {'sentiment': sentiment, 'score': (bullish - bearish) / total}
    
    async def _get_global_economic_data(self) -> List[Dict]:
        """Get economic data for all regions"""
        economic_data = []
        for region_id, region in self.regions.items():
            region_data = await self._get_economic_data(region)
            for data in region_data:
                economic_data.append({
                    'region': region.name,
                    'indicator': data['id'],
                    'value': data['value'],
                    'date': str(data['date']),
                    'change': data['change'],
                    'currency': region.currency
                })
        return economic_data

    async def get_market_impact(self, news: Dict) -> Dict:
        """Analyze how news impacts global markets"""
        impacted_regions = self._identify_impacted_regions(news.get('description', '') or news.get('title', ''))
        impact_score = (self._analyze_article_sentiment(news.get('description', '') or news.get('title', '')) + 1) / 2
        return {
            'news_title': news['title'],
            'impacted_regions': impacted_regions,
            'impact_score': impact_score,
            'confidence': 0.8
        }
    
    def _identify_impacted_regions(self, content: str) -> List[Dict]:
        """Identify which market regions are impacted by news"""
        impacted = []
        for region_id, region in self.regions.items():
            if any(k in content.lower() for k in [region.name.lower(), region.country_code.lower()]):
                impacted.append({'region_id': region_id, 'region_name': region.name, 'impact_score': 0.8})
        return impacted

    async def get_global_trade_opportunities(self) -> List[Dict]:
        """Identify high-confidence trade opportunities"""
        return [] # Placeholder
