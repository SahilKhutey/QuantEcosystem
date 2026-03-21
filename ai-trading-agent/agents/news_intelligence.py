import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
from .base_agent import BaseTradingAgent, AgentType, AgentOutput
from transformers import pipeline
import aiohttp
import asyncio
import re
from loguru import logger

class NewsIntelligenceAgent(BaseTradingAgent):
    def __init__(self):
        super().__init__(AgentType.NEWS_INTELLIGENCE, confidence_threshold=0.65)
        # Using a financial news sentiment model
        try:
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis"
            )
        except Exception as e:
            logger.error(f"Failed to load transformer model: {e}")
            self.sentiment_analyzer = None
        self.entity_cache = {}
        
    async def analyze(self, data: Dict) -> AgentOutput:
        """Analyze news sentiment, impact, and sector influence"""
        news_items = data.get('news_items', [])
        market_context = data.get('market_context', {})
        
        if not news_items:
            return AgentOutput(
                agent_type=self.agent_type,
                confidence=0.1,
                signal=0,
                reason='No news data',
                analysis={'error': 'No news data'},
                timestamp=pd.Timestamp.now()
            )
        
        # Analyze sentiment for each news item
        sentiment_results = await self._analyze_news_sentiment(news_items)
        
        # Extract entities and impact
        entity_analysis = await self._extract_entities_and_impact(news_items)
        
        # Calculate overall market sentiment
        overall_sentiment = self._calculate_overall_sentiment(sentiment_results)
        
        # Sector impact analysis
        sector_impact = self._analyze_sector_impact(entity_analysis, market_context)
        
        confidence = self._calculate_news_confidence(sentiment_results, entity_analysis)
        
        # Determine signal
        signal = 0
        if overall_sentiment['score'] > 0.1: signal = 1
        elif overall_sentiment['score'] < -0.1: signal = -1

        analysis = {
            'overall_sentiment': overall_sentiment,
            'sector_impact': sector_impact,
            'key_entities': entity_analysis['important_entities'],
            'sentiment_distribution': sentiment_results['distribution'],
            'news_volume': len(news_items),
            'impact_score': entity_analysis['impact_score'],
            'trending_topics': self._identify_trending_topics(news_items)
        }
        
        return AgentOutput(
            agent_type=self.agent_type,
            confidence=confidence,
            signal=signal,
            reason=f"Sentiment: {overall_sentiment['label']} ({overall_sentiment['score']:.2f}) | Impact: {entity_analysis['impact_score']:.2f}",
            analysis=analysis,
            timestamp=pd.Timestamp.now(),
            raw_data=sentiment_results
        )
    
    async def _analyze_news_sentiment(self, news_items: List[Dict]) -> Dict:
        """Analyze sentiment for news items"""
        sentiments = []
        
        for news in news_items:
            text = f"{news.get('title', '')} {news.get('description', '')}"
            if len(text.strip()) < 10:
                continue
                
            try:
                # Truncate very long texts
                truncated_text = text[:1000]
                if self.sentiment_analyzer:
                    sentiment_result = self.sentiment_analyzer(truncated_text)[0]
                    label = sentiment_result['label'].upper()
                    score = sentiment_result['score']
                else:
                    # Fallback to TextBlob if transformer failed
                    from textblob import TextBlob
                    blob = TextBlob(text)
                    label = "POSITIVE" if blob.sentiment.polarity > 0 else "NEGATIVE" if blob.sentiment.polarity < 0 else "NEUTRAL"
                    score = abs(blob.sentiment.polarity)

                sentiments.append({
                    'text': text[:200],  # Store snippet
                    'sentiment': label,
                    'confidence': score,
                    'source': news.get('source', 'unknown'),
                    'timestamp': news.get('published_at', pd.Timestamp.now())
                })
            except Exception as e:
                logger.error(f"Sentiment analysis failed: {e}")
                continue
        
        # Calculate overall sentiment metrics
        positive_count = sum(1 for s in sentiments if s['sentiment'] == 'POSITIVE')
        negative_count = sum(1 for s in sentiments if s['sentiment'] == 'NEGATIVE')
        total_count = len(sentiments)
        
        if total_count > 0:
            positive_ratio = positive_count / total_count
            negative_ratio = negative_count / total_count
            net_sentiment = positive_ratio - negative_ratio
        else:
            net_sentiment = 0
        
        return {
            'individual_sentiments': sentiments,
            'net_sentiment': net_sentiment,
            'positive_ratio': positive_ratio if total_count > 0 else 0,
            'negative_ratio': negative_ratio if total_count > 0 else 0,
            'distribution': {
                'positive': positive_count,
                'negative': negative_count,
                'neutral': total_count - positive_count - negative_count
            }
        }

    def _calculate_overall_sentiment(self, sentiment_results: Dict) -> Dict:
        """Calculate weighted aggregate sentiment."""
        score = sentiment_results['net_sentiment']
        return {
            'score': score,
            'label': 'BULLISH' if score > 0.1 else 'BEARISH' if score < -0.1 else 'NEUTRAL'
        }

    def _analyze_sector_impact(self, entity_analysis: Dict, market_context: Dict) -> Dict:
        """Map entities to sectors and estimate impact."""
        # Simple mapping for demo
        return {"technology": 0.5, "finance": 0.3}

    def _calculate_news_confidence(self, sentiment_results, entity_analysis) -> float:
        """Estimate confidence based on news volume and impact."""
        volume_factor = min(len(sentiment_results['individual_sentiments']) / 10, 1.0)
        impact_factor = entity_analysis['impact_score']
        return (volume_factor * 0.4 + impact_factor * 0.6)

    def _identify_trending_topics(self, news_items: List[Dict]) -> List[str]:
        """Identify common themes in news."""
        return ["AI Adoption", "Rate Hikes"] # Placeholder
    
    async def _extract_entities_and_impact(self, news_items: List[Dict]) -> Dict:
        """Extract entities and assess their impact"""
        entities = {}
        
        for news in news_items:
            text = f"{news.get('title', '')} {news.get('description', '')}"
            
            # Simple entity extraction (in production, use NER)
            found_entities = self._extract_financial_entities(text)
            
            for entity in found_entities:
                if entity not in entities:
                    entities[entity] = {
                        'count': 0,
                        'sentiments': [],
                        'sources': set(),
                        'latest_mention': news.get('published_at')
                    }
                
                entities[entity]['count'] += 1
                entities[entity]['sources'].add(news.get('source', 'unknown'))
                
                # Handle potential None published_at
                pub_at = news.get('published_at')
                if pub_at is None: pub_at = pd.Timestamp.min

                entities[entity]['latest_mention'] = max(
                    entities[entity]['latest_mention'] or pd.Timestamp.min,
                    pub_at
                )
        
        # Calculate impact scores
        important_entities = []
        for entity, data in entities.items():
            impact_score = self._calculate_entity_impact_score(entity, data)
            important_entities.append({
                'entity': entity,
                'impact_score': impact_score,
                'mention_count': data['count'],
                'sources': list(data['sources'])
            })
        
        # Sort by impact
        important_entities.sort(key=lambda x: x['impact_score'], reverse=True)
        
        total_impact = sum(x['impact_score'] for x in important_entities) / max(len(important_entities), 1)
        
        return {
            'all_entities': entities,
            'important_entities': important_entities[:10],  # Top 10
            'impact_score': total_impact
        }
    
    def _extract_financial_entities(self, text: str) -> List[str]:
        """Extract financial entities using pattern matching"""
        entities = set()
        text_lower = text.lower()
        
        # Company names
        company_patterns = [
            r'\bReliance\b', r'\bTata\b', r'\bInfosys\b', r'\bTCS\b',
            r'\bHDFC\b', r'\bICICI\b', r'\bSBI\b', r'\bApple\b',
            r'\bMicrosoft\b', r'\bGoogle\b', r'\bTesla\b', r'\bBitcoin\b', r'\bEthereum\b'
        ]
        
        for pattern in company_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities.add(match.group())
        
        # Stock indices
        index_patterns = [r'\bNifty\b', r'\bSensex\b', r'\bNASDAQ\b', r'\bS&P\b']
        for pattern in index_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities.add(match.group())
        
        # Economic terms
        economic_terms = ['GDP', 'inflation', 'interest rates', 'budget', 'earnings']
        for term in economic_terms:
            if term.lower() in text_lower:
                entities.add(term)
        
        return list(entities)
    
    def _calculate_entity_impact_score(self, entity: str, entity_data: Dict) -> float:
        """Calculate impact score for an entity"""
        base_score = min(entity_data['count'] * 0.2, 1.0)  # Frequency
        
        # Source diversity bonus
        source_bonus = min(len(entity_data['sources']) * 0.1, 0.3)
        
        # Recency bonus
        if entity_data['latest_mention'] and entity_data['latest_mention'] != pd.Timestamp.min:
            recency_hours = (pd.Timestamp.now() - entity_data['latest_mention']).total_seconds() / 3600
            recency_bonus = max(0, 0.2 - recency_hours / 100)
        else:
            recency_bonus = 0
        
        # Entity importance multiplier
        importance_multiplier = self._get_entity_importance_multiplier(entity)
        
        total_score = (base_score + source_bonus + recency_bonus) * importance_multiplier
        return min(total_score, 1.0)
    
    def _get_entity_importance_multiplier(self, entity: str) -> float:
        """Get importance multiplier for different entity types"""
        # Higher multiplier for more important entities
        importance_map = {
            'GDP': 1.5, 'inflation': 1.4, 'interest rates': 1.4,
            'Reliance': 1.3, 'Tata': 1.2, 'Nifty': 1.3, 'Sensex': 1.3,
            'Bitcoin': 1.4, 'Ethereum': 1.3
        }
        return importance_map.get(entity, 1.0)
