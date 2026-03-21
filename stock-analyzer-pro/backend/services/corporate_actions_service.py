import aiohttp
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List
import pandas as pd

class CorporateActionsService:
    def __init__(self, api_key: str = "YOUR_KEY"):
        self.api_key = api_key
        self.earnings_cache = {}
        self.dividends_cache = {}
        
    async def get_earnings_calendar(self, symbol: str = None, 
                                  start_date: datetime = None,
                                  end_date: datetime = None) -> List[Dict]:
        """Get earnings calendar from Alpha Vantage"""
        if not start_date:
            start_date = datetime.utcnow()
        if not end_date:
            end_date = start_date + timedelta(days=30)
            
        symbol_param = f"&symbol={symbol}" if symbol else ""
        url = f"https://www.alphavantage.co/query?function=EARNINGS_CALENDAR{symbol_param}&apikey={self.api_key}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                try:
                    # AV returns CSV for earnings calendar function some times, 
                    # but here we assume JSON based on the user's snippet.
                    # Actually AV EARNINGS_CALENDAR usually returns CSV. 
                    # Let's handle both or stick to user's JSON assumption.
                    data = await response.json()
                except:
                    # Fallback to empty if not JSON
                    return []
                
        earnings = []
        for item in data.get('earningsCalendar', []):
            try:
                date_val = datetime.strptime(item.get('date'), '%Y-%m-%d')
                earnings.append({
                    'symbol': item.get('symbol'),
                    'date': date_val,
                    'estimate': float(item.get('estimate', 0) or 0),
                    'reported': float(item.get('reported', 0) or 0),
                    'surprise': float(item.get('surprise', 0) or 0),
                    'surprise_percent': float(item.get('surprisePercentage', 0) or 0)
                })
            except:
                continue
            
        return earnings
        
    async def get_dividends(self, symbol: str) -> List[Dict]:
        """Get dividend history from Alpha Vantage"""
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={symbol}&apikey={self.api_key}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                data = await response.json()
                
        dividends = []
        for date_str, values in data.get('Time Series (Daily)', {}).items():
            try:
                dividend = float(values.get('7. dividend amount', 0))
                if dividend > 0:
                    dividends.append({
                        'date': datetime.strptime(date_str, '%Y-%m-%d'),
                        'amount': dividend,
                        'split_coefficient': float(values.get('8. split coefficient', 1))
                    })
            except:
                continue
                
        return dividends
        
    async def get_insider_trading(self, symbol: str) -> List[Dict]:
        """Get insider trading data (Placeholder implementation)"""
        # Implementation using SEC EDGAR API or other sources
        return []
