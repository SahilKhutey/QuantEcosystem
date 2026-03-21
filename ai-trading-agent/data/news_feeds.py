import requests
import feedparser
from typing import List, Dict
from textblob import TextBlob
from loguru import logger

class NewsIntelligence:
    def __init__(self):
        self.feeds = [
            'https://cointelegraph.com/rss/tag/bitcoin',
            'https://www.coindesk.com/arc/outboundfeeds/rss/'
        ]

    def fetch_latest_news(self) -> List[Dict]:
        """Fetch news from RSS feeds."""
        all_news = []
        for url in self.feeds:
            try:
                feed = feedparser.parse(url)
                for entry in feed.entries[:5]:
                    sentiment = self._analyze_sentiment(entry.summary if 'summary' in entry else entry.title)
                    all_news.append({
                        'title': entry.title,
                        'link': entry.link,
                        'published': entry.published,
                        'sentiment': sentiment
                    })
            except Exception as e:
                logger.error(f"Error fetching from {url}: {e}")
        return all_news

    def _analyze_sentiment(self, text: str) -> float:
        """Returns polarity score: -1 (negative) to 1 (positive)."""
        analysis = TextBlob(text)
        return analysis.sentiment.polarity

if __name__ == "__main__":
    ni = NewsIntelligence()
    news = ni.fetch_latest_news()
    for item in news:
        print(f"[{item['sentiment']:.2f}] {item['title']}")
