import aiohttp
import asyncio
from datetime import datetime
from typing import List, Dict
from bs4 import BeautifulSoup
import re

class NewsService:
    def __init__(self):
        self.news_sources = [
            "https://feeds.reuters.com/reuters/businessNews",
            "https://feeds.reuters.com/reuters/topNews"
        ]
    
    async def fetch_news(self, keywords: List[str] = None) -> List[Dict]:
        """Fetch news from various sources"""
        all_news = []
        
        for source in self.news_sources:
            try:
                news_items = await self.fetch_rss_feed(source, keywords)
                all_news.extend(news_items)
            except Exception as e:
                print(f"Error fetching from {source}: {e}")
        
        # Sort by date and return
        all_news.sort(key=lambda x: x.get('published_at', datetime.min), reverse=True)
        return all_news[:50]  # Return top 50
    
    async def fetch_rss_feed(self, feed_url: str, keywords: List[str] = None) -> List[Dict]:
        """Fetch and parse RSS feed"""
        async with aiohttp.ClientSession() as session:
            async with session.get(feed_url) as response:
                if response.status == 200:
                    content = await response.text()
                    return self.parse_rss_feed(content, keywords)
                return []
    
    def parse_rss_feed(self, content: str, keywords: List[str] = None) -> List[Dict]:
        """Parse RSS feed content"""
        # Using lxml-xml if available, otherwise html.parser
        soup = BeautifulSoup(content, 'xml')
        items = soup.find_all('item')
        
        news_items = []
        for item in items:
            title = item.find('title').text if item.find('title') else ""
            description = item.find('description').text if item.find('description') else ""
            link = item.find('link').text if item.find('link') else ""
            pub_date = item.find('pubDate').text if item.find('pubDate') else ""
            
            # Basic keyword filtering
            if keywords:
                content_text = f"{title} {description}".lower()
                if not any(keyword.lower() in content_text for keyword in keywords):
                    continue
            
            news_item = {
                "title": title,
                "description": description,
                "link": link,
                "published_at": self.parse_date(pub_date),
                "source": "Reuters",
                "symbols_mentioned": self.extract_symbols(f"{title} {description}")
            }
            
            news_items.append(news_item)
        
        return news_items
    
    def extract_symbols(self, text: str) -> List[str]:
        """Extract stock symbols from text using simple patterns"""
        # Common stock symbols pattern
        common_symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NFLX', 
                         'NVDA', 'AMD', 'INTC', 'JPM', 'GS', 'BAC', 'WFC']
        
        found_symbols = []
        for symbol in common_symbols:
            # Use word boundaries for better matching
            if re.search(rf'\b{symbol}\b', text):
                found_symbols.append(symbol)
        
        return found_symbols
    
    def parse_date(self, date_str: str) -> datetime:
        """Parse various date formats"""
        try:
            # Handle standard RSS date format
            # Example: Wed, 10 Mar 2021 15:30:00 GMT
            formats = [
                "%a, %d %b %Y %H:%M:%S %Z",
                "%a, %d %b %Y %H:%M:%S %z",
                "%Y-%m-%dT%H:%M:%SZ"
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
            
            return datetime.utcnow()
        except:
            return datetime.utcnow()
