import aiohttp
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
try:
    import openai
except ImportError:
    openai = None
from collections import defaultdict
import re

class NewsSentimentEngine:
    def __init__(self, openai_api_key: str = "your-openai-key"):
        # Initialize models
        # Note: These will download models on first run
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis"
        )
        
        self.entity_recognizer = pipeline(
            "ner",
            model="dslim/bert-base-NER"
        )
        
        # OpenAI for advanced analysis
        if openai:
            openai.api_key = openai_api_key
        
    async def fetch_news_sources(self) -> List[Dict]:
        """Fetch news from multiple high-signal sources"""
        sources = [
            self._fetch_reuters,
            self._fetch_bloomberg,
            self._fetch_yahoo_finance,
            self._fetch_twitter
        ]
        
        tasks = [source() for source in sources]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_news = []
        for result in results:
            if isinstance(result, list):
                all_news.extend(result)
            elif isinstance(result, Exception):
                print(f"Error fetching from source: {result}")
                
        return sorted(all_news, key=lambda x: x.get('published_at', datetime.min), reverse=True)
        
    async def _fetch_reuters(self) -> List[Dict]:
        """Fetch Reuters business news via public API endpoint"""
        url = "https://www.reuters.com/pf/api/v3/content/fetch/articles-by-section-alias-or-id-v1"
        
        params = {
            "query": '{"sectionAlias":"/business/","size":20}',
            "d": 132,
            "_website": "reuters"
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                    else:
                        return []
            except Exception:
                return []
                
        articles = []
        for item in data.get('result', {}).get('articles', []):
            articles.append({
                'title': item.get('title', ''),
                'description': item.get('description', ''),
                'url': item.get('canonical_url', ''),
                'published_at': datetime.fromisoformat(item.get('published_time', '').replace('Z', '+00:00')) if item.get('published_time') else datetime.utcnow(),
                'source': 'Reuters',
                'symbols': self._extract_symbols(item.get('title', '') + ' ' + item.get('description', ''))
            })
            
        return articles
        
    async def _fetch_twitter(self) -> List[Dict]:
        """Fetch tweets (Placeholder for Twitter API v2)"""
        return []
        
    async def _fetch_bloomberg(self) -> List[Dict]: return []
    async def _fetch_yahoo_finance(self) -> List[Dict]: return []
        
    def _extract_symbols(self, text: str) -> List[str]:
        """Extract stock symbols using regex"""
        symbols = re.findall(r'\$([A-Z]{1,5})', text)
        # Also check for common ticker-like patterns in uppercase
        patterns = re.findall(r'\b[A-Z]{3,5}\b', text)
        return list(set(symbols + patterns))

    def analyze_sentiment_batch(self, texts: List[str]) -> List[Dict]:
        """Batch analyze sentiment using financial-RoBERTa"""
        if not texts:
            return []
            
        results = self.sentiment_analyzer(texts)
        
        analyzed_texts = []
        for text, result in zip(texts, results):
            analyzed_texts.append({
                'text': text[:500],
                'sentiment': result['label'],
                'confidence': float(result['score']),
                'impact_score': float(self._calculate_impact_score(text, result['label'], result['score']))
            })
            
        return analyzed_texts
        
    def _calculate_impact_score(self, text: str, sentiment: str, 
                               confidence: float) -> float:
        """Calculate market impact score based on keywords and sentiment"""
        base_score = confidence
        
        keywords = {
            'earnings': 1.5,
            'merger': 1.8,
            'acquisition': 1.8,
            'lawsuit': 2.0,
            'scandal': 2.2,
            'bankruptcy': 2.5,
            'fda approval': 2.0,
            'clinical trial': 1.8
        }
        
        text_lower = text.lower()
        for keyword, multiplier in keywords.items():
            if keyword in text_lower:
                base_score *= multiplier
                break
                
        if sentiment == 'positive':
            base_score *= 1.2
        elif sentiment == 'negative':
            base_score *= 1.5
            
        return min(base_score, 10.0)
        
    def extract_entities(self, text: str) -> Dict:
        """Extract financial entities (Companies, People) using BERT NER"""
        entities = self.entity_recognizer(text)
        
        categorized = {
            'companies': [],
            'people': [],
            'locations': [],
            'dates': [],
            'money': []
        }
        
        for entity in entities:
            word = entity['word'].replace('##', '')
            if entity['entity'] in ['B-ORG', 'I-ORG']:
                categorized['companies'].append(word)
            elif entity['entity'] in ['B-PER', 'I-PER']:
                categorized['people'].append(word)
            elif entity['entity'] in ['B-LOC', 'I-LOC']:
                categorized['locations'].append(word)
                
        return categorized
        
    async def generate_ai_summary(self, articles: List[Dict]) -> str:
        """Summarize financial news using OpenAI GPT-3.5"""
        if not openai or not articles:
            return "No significant news today or OpenAI not configured."
            
        texts = [f"{a['title']}. {a['description']}" for a in articles[:5]]
        combined_text = " ".join(texts)[:4000]
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a financial analyst summarizing market news."},
                    {"role": "user", "content": f"Summarize this financial news:\n\n{combined_text}"}
                ],
                max_tokens=300,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Summary unavailable: {str(e)}"
            
    def map_news_to_stocks(self, news_items: List[Dict], 
                          stock_symbols: List[str]) -> Dict:
        """Map generic news items to specific stock symbols"""
        stock_news = defaultdict(list)
        
        for news in news_items:
            # Direct mentions
            for symbol in stock_symbols:
                if symbol in news.get('title', '') or symbol in news.get('description', ''):
                    stock_news[symbol].append(news)
                    
        return dict(stock_news)
