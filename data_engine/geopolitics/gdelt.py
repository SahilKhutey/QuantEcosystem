import requests
import pandas as pd
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
import time

class GDELTAPI:
    """GDELT Project API integration for real-time global event data"""
    
    def __init__(self):
        self.base_url = "https://api.gdeltproject.org/api/v2/doc/doc"
        self.logger = logging.getLogger('GDELT')
        self.rate_limit = 1  # seconds between requests
        self.last_request = 0
    
    def _check_rate_limit(self):
        """Enforce rate limiting"""
        current_time = time.time()
        
        if current_time - self.last_request < self.rate_limit:
            time.sleep(self.rate_limit - (current_time - self.last_request))
        
        self.last_request = current_time
    
    def _make_request(self, params: Dict) -> Optional[Dict]:
        """Make API request with error handling"""
        self._check_rate_limit()
        
        try:
            response = requests.get(self.base_url, params=params)
            
            if response.status_code == 200:
                return response.json()
            else:
                self.logger.error(f"GDELT API error: HTTP {response.status_code}")
                return None
        except Exception as e:
            self.logger.error(f"Error making GDELT request: {str(e)}")
            return None
    
    def get_events(self, 
                  query: str = "market",
                  start_date: Optional[str] = None,
                  end_date: Optional[str] = None,
                  max_results: int = 250) -> List[Dict]:
        """Get global event data from GDELT"""
        self._check_rate_limit()
        
        try:
            # Format dates
            if not start_date:
                start_date = (datetime.now() - timedelta(days=1)).strftime("%Y%m%d")
            if not end_date:
                end_date = datetime.now().strftime("%Y%m%d")
            
            # Format dates as GDELT expects
            start_date = start_date.replace("-", "")
            end_date = end_date.replace("-", "")
            
            params = {
                'query': query,
                'mode': 'artlist',
                'format': 'json',
                'maxrecords': str(max_results),
                'startdatetime': f"{start_date}000000",
                'enddatetime': f"{end_date}235959",
                'sort': 'dateasc',
                'timespan': '14d'
            }
            
            data = self._make_request(params)
            
            if not data or 'articles' not in data:
                return []
            
            # Process and format results
            events = []
            for article in data['articles']:
                # Extract event data
                event = {
                    'title': article.get('title', ''),
                    'url': article.get('url', ''),
                    'source': article.get('source', ''),
                    'language': article.get('language', ''),
                    'domain': article.get('domain', ''),
                    'seendate': article.get('seendate', ''),
                    'socialimage': article.get('socialimage', ''),
                    'tone': article.get('tone', 0),
                    'location': article.get('location', {}),
                    'themes': article.get('themes', []),
                    'locations': article.get('locations', []),
                    'people': article.get('people', []),
                    'organizations': article.get('organizations', [])
                }
                
                # Add sentiment score (simplified)
                event['sentiment_score'] = self._calculate_sentiment(event)
                
                events.append(event)
            
            return events
        except Exception as e:
            self.logger.error(f"Error fetching GDELT events: {str(e)}")
            return []
    
    def get_event_count(self, 
                      query: str = "market",
                      start_date: Optional[str] = None,
                      end_date: Optional[str] = None) -> int:
        """Get event count from GDELT"""
        self._check_rate_limit()
        
        try:
            # Format dates
            if not start_date:
                start_date = (datetime.now() - timedelta(days=1)).strftime("%Y%m%d")
            if not end_date:
                end_date = datetime.now().strftime("%Y%m%d")
            
            # Format dates as GDELT expects
            start_date = start_date.replace("-", "")
            end_date = end_date.replace("-", "")
            
            params = {
                'query': query,
                'mode': 'count',
                'format': 'json',
                'startdatetime': f"{start_date}000000",
                'enddatetime': f"{end_date}235959",
                'timespan': '14d'
            }
            
            data = self._make_request(params)
            
            if data and 'count' in data:
                return int(data['count'])
            
            return 0
        except Exception as e:
            self.logger.error(f"Error fetching GDELT event count: {str(e)}")
            return 0
    
    def get_event_trends(self, 
                        query: str = "market",
                        time_window: str = "1d") -> List[Dict]:
        """Get event trends from GDELT"""
        self._check_rate_limit()
        
        try:
            # Format time window
            params = {
                'query': query,
                'mode': 'timeline',
                'format': 'json',
                'timespan': time_window,
                'count': '50'
            }
            
            data = self._make_request(params)
            
            if data and 'timeline' in data:
                return data['timeline']
            
            return []
        except Exception as e:
            self.logger.error(f"Error fetching GDELT event trends: {str(e)}")
            return []
    
    def _calculate_sentiment(self, event: Dict) -> float:
        """Calculate sentiment score based on event data"""
        # This is a simplified sentiment calculation
        # In production, use more sophisticated NLP
        
        # Base on tone score from GDELT
        tone = float(event.get('tone', 0))
        
        # Normalize to -1 to 1 range
        normalized = max(min(tone / 100, 1), -1)
        
        # Adjust based on themes
        negative_themes = ['war', 'conflict', 'crisis', 'sanction', 'attack']
        positive_themes = ['agreement', 'cooperation', 'peace', 'treaty', 'solution']
        
        for theme in event.get('themes', []):
            theme_lower = theme.lower()
            if any(neg in theme_lower for neg in negative_themes):
                normalized -= 0.2
            if any(pos in theme_lower for pos in positive_themes):
                normalized += 0.2
        
        return max(min(normalized, 1), -1)
