import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import asyncio

class ImpactLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

@dataclass
class MarketImpact:
    level: ImpactLevel
    confidence: float
    affected_assets: List[str]
    expected_movement: float  # Percentage
    time_horizon: str  # immediate, short_term, long_term

class MarketImpactEngine:
    def __init__(self):
        self.asset_country_mapping = self._load_asset_mapping()
        self.sector_impact_matrix = self._load_sector_impact()
    
    def _load_asset_mapping(self) -> Dict[str, str]:
        """Map assets to their primary countries"""
        return {
            # US Assets
            'SPY': 'United States', 'QQQ': 'United States', 'DIA': 'United States',
            'AAPL': 'United States', 'MSFT': 'United States', 'GOOGL': 'United States',
            
            # Indian Assets
            'NIFTY': 'India', 'SENSEX': 'India', 'RELIANCE': 'India',
            'TCS': 'India', 'INFY': 'India',
            
            # Chinese Assets
            'BABA': 'China', 'TCEHY': 'China', 'PDD': 'China',
            
            # European Assets
            'VGK': 'Europe', 'EWG': 'Germany', 'EWU': 'United Kingdom',
            
            # Commodities
            'USO': 'Global', 'GLD': 'Global', 'SLV': 'Global'
        }
    
    def _load_sector_impact(self) -> Dict[str, Dict[str, float]]:
        """How different news types impact sectors"""
        return {
            'interest_rate': {
                'financials': 0.8, 'real_estate': 0.7, 'technology': -0.3
            },
            'inflation': {
                'commodities': 0.6, 'consumer_staples': -0.4, 'technology': -0.5
            },
            'earnings': {
                'specific_company': 0.9, 'sector_peers': 0.4
            },
            'regulation': {
                'affected_industry': -0.7, 'competitors': 0.3
            },
            'geopolitical': {
                'energy': 0.6, 'defense': 0.7, 'travel': -0.8
            }
        }
    
    async def calculate_impact(self, news_item: Dict, 
                             sentiment: Dict,
                             geo_entities: List[Dict]) -> MarketImpact:
        """Calculate market impact of news"""
        
        # Base impact from sentiment
        sentiment_label = sentiment.get('label', 'neutral')
        if isinstance(sentiment_label, Enum):
            sentiment_label = sentiment_label.value
            
        sentiment_score = self._sentiment_to_score(sentiment_label)
        impact_magnitude = sentiment.get('impact_magnitude', 0.5)
        base_impact = sentiment_score * impact_magnitude
        
        # Amplify based on geography
        geo_amplifier = self._calculate_geo_amplifier(geo_entities)
        amplified_impact = base_impact * geo_amplifier
        
        # Identify affected assets
        affected_assets = self._identify_affected_assets(news_item, geo_entities)
        
        # Determine impact level
        impact_level = self._score_to_impact_level(abs(amplified_impact))
        
        # Calculate expected movement
        expected_movement = amplified_impact * 0.05  # 5% max movement per unit impact
        
        return MarketImpact(
            level=impact_level,
            confidence=min(sentiment.get('confidence', 0.5) * geo_amplifier, 1.0),
            affected_assets=affected_assets,
            expected_movement=round(float(expected_movement), 4),
            time_horizon=self._determine_time_horizon(news_item)
        )
    
    def _sentiment_to_score(self, sentiment_label: str) -> float:
        """Convert sentiment label to numerical score"""
        mapping = {
            'very_bullish': 1.0,
            'bullish': 0.6,
            'neutral': 0.0,
            'bearish': -0.6,
            'very_bearish': -1.0
        }
        return mapping.get(sentiment_label, 0.0)
    
    def _calculate_geo_amplifier(self, geo_entities: List[Dict]) -> float:
        """Amplify impact based on geographical importance"""
        if not geo_entities:
            return 0.5  # Reduced impact for non-geo-specific news
        
        # Major financial centers have higher impact
        major_centers = ['United States', 'China', 'Japan', 'Germany', 'United Kingdom']
        
        amplifier = 1.0  # Base amplifier
        
        for entity in geo_entities:
            country = entity.get('text', '')
            if country in major_centers:
                amplifier *= 1.5
            elif entity.get('importance_score', 0) > 0.7:
                amplifier *= 1.3
        
        return min(amplifier, 3.0)  # Cap at 3x
    
    def _identify_affected_assets(self, news_item: Dict, 
                                 geo_entities: List[Dict]) -> List[str]:
        """Identify which assets are affected by the news"""
        affected_assets = set()
        text = f"{news_item.get('title', '')} {news_item.get('description', '')}".lower()
        
        # Check for specific asset mentions
        for asset, country in self.asset_country_mapping.items():
            if asset.lower() in text:
                affected_assets.add(asset)
        
        # Add assets based on geography
        for entity in geo_entities:
            country = entity.get('text', '')
            # Find assets from this country
            country_assets = [asset for asset, asset_country in self.asset_country_mapping.items() 
                            if asset_country == country]
            affected_assets.update(country_assets)
        
        # Add sector-based assets
        sector_assets = self._identify_sector_assets(text)
        affected_assets.update(sector_assets)
        
        return list(affected_assets)
    
    def _identify_sector_assets(self, text: str) -> List[str]:
        """Identify assets based on sector mentions"""
        sector_keywords = {
            'tech': ['AAPL', 'MSFT', 'GOOGL', 'TSM', 'NVDA'],
            'finance': ['JPM', 'BAC', 'WFC', 'GS'],
            'energy': ['XOM', 'CVX', 'BP', 'SHEL', 'COP'],
            'retail': ['WMT', 'AMZN', 'COST', 'TGT']
        }
        
        found_assets = []
        for sector, assets in sector_keywords.items():
            if sector in text:
                found_assets.extend(assets)
        return found_assets

    def _score_to_impact_level(self, score: float) -> ImpactLevel:
        if score > 0.8: return ImpactLevel.VERY_HIGH
        if score > 0.5: return ImpactLevel.HIGH
        if score > 0.2: return ImpactLevel.MEDIUM
        return ImpactLevel.LOW

    def _determine_time_horizon(self, news_item: Dict) -> str:
        text = news_item.get('title', '').lower()
        if any(w in text for w in ['immediate', 'now', 'today']): return 'immediate'
        if any(w in text for w in ['quarter', 'year', 'outlook']): return 'long_term'
        return 'short_term'
