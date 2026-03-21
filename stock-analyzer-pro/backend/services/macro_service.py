import aiohttp
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd
import numpy as np

class MacroIntelligenceService:
    def __init__(self, fred_api_key: str = "your_fred_api_key"):
        self.fred_api_key = fred_api_key
        self.economic_indicators = {}
        self.correlations_cache = {}
        
    async def fetch_economic_data(self) -> Dict:
        """Fetch economic indicators from FRED and other sources"""
        tasks = [
            self._fetch_fed_funds_rate(),
            self._fetch_cpi_data(),
            self._fetch_gdp_data(),
            self._fetch_unemployment_rate(),
            self._fetch_commodity_prices()
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        economic_data = {}
        for result in results:
            if isinstance(result, dict):
                economic_data.update(result)
            elif isinstance(result, Exception):
                print(f"Error fetching economic data: {result}")
                
        return economic_data
        
    async def _fetch_fred_series(self, series_id: str) -> Optional[float]:
        """Generic FRED API fetcher"""
        url = "https://api.stlouisfed.org/fred/series/observations"
        params = {
            'series_id': series_id,
            'api_key': self.fred_api_key,
            'file_type': 'json',
            'sort_order': 'desc',
            'limit': 1
        }
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        val = data['observations'][0]['value']
                        return float(val) if val != "." else None
            except Exception:
                return None
        return None

    async def _fetch_fed_funds_rate(self) -> Dict:
        rate = await self._fetch_fred_series('FEDFUNDS')
        return {'fed_funds_rate': rate, 'last_updated': datetime.utcnow()}
        
    async def _fetch_cpi_data(self) -> Dict:
        cpi = await self._fetch_fred_series('CPIAUCSL')
        return {'cpi': cpi}

    async def _fetch_gdp_data(self) -> Dict:
        gdp = await self._fetch_fred_series('GDP')
        return {'gdp': gdp}

    async def _fetch_unemployment_rate(self) -> Dict:
        unrate = await self._fetch_fred_series('UNRATE')
        return {'unemployment_rate': unrate}

    async def _fetch_commodity_prices(self) -> Dict:
        """Fetch basic commodity prices (Stubs for direct API integration)"""
        # In a real app, use a provider like Alpha Vantage or Yahoo Finance
        commodities = { 'gold': 2000.0, 'silver': 23.0, 'crude_oil': 75.0 }
        return {'commodities': commodities}
        
    def calculate_risk_on_off(self, market_data: Dict) -> float:
        """Calculate composite risk sentiment score (0-1)"""
        factors = []
        
        # VIX factor
        if 'vix' in market_data:
            vix_score = max(0.0, 1.0 - (market_data['vix'] / 50.0))
            factors.append(vix_score)
            
        # Treasury yields factor
        if '10y_yield' in market_data:
            yield_score = min(1.0, market_data['10y_yield'] / 0.05)
            factors.append(yield_score)
            
        # Gold factor
        if 'gold' in market_data:
            gold_score = max(0.0, 1.0 - (market_data['gold'] / 2500.0))
            factors.append(gold_score)
            
        return float(np.mean(factors)) if factors else 0.5
        
    def calculate_cross_asset_correlations(self, assets_data: Dict[str, List[float]]) -> pd.DataFrame:
        """Calculate correlation matrix across different assets"""
        returns_data = {}
        for asset, prices in assets_data.items():
            if len(prices) > 1:
                returns_data[asset] = np.diff(prices) / prices[:-1]
                
        df = pd.DataFrame(returns_data)
        return df.corr()
        
    def detect_sector_rotation(self, sector_returns: Dict[str, List[float]]) -> Dict:
        """Identify leading and lagging sectors based on momentum"""
        sector_momentum = {}
        for sector, returns in sector_returns.items():
            if len(returns) >= 20:
                momentum = returns[-1] / np.mean(returns[-20:]) - 1
                sector_momentum[sector] = float(momentum)
                
        sorted_sectors = sorted(sector_momentum.items(), key=lambda x: x[1], reverse=True)
        
        return {
            'leading_sectors': sorted_sectors[:3],
            'lagging_sectors': sorted_sectors[-3:],
            'rotation_strength': float(np.std(list(sector_momentum.values()))) if sector_momentum else 0.0
        }
        
    async def get_economic_calendar(self, start_date: datetime = None,
                                  end_date: datetime = None) -> List[Dict]:
        """Fetch weekly economic calendar events"""
        if not start_date: start_date = datetime.utcnow()
        if not end_date: end_date = start_date + timedelta(days=7)
            
        url = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url) as response:
                    data = await response.json()
            except Exception:
                return []
                
        events = []
        for event in data:
            try:
                event_date = datetime.strptime(event['date'], '%Y-%m-%dT%H:%M:%S')
                if start_date <= event_date <= end_date:
                    events.append({
                        'date': event_date,
                        'country': event['country'],
                        'event': event['title'],
                        'importance': event.get('impact', 'Low'),
                        'actual': event.get('actual'),
                        'forecast': event.get('forecast'),
                        'previous': event.get('previous')
                    })
            except Exception: continue
                
        return sorted(events, key=lambda x: x['date'])
