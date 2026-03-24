import logging
from datetime import datetime
import random

class GlobalExposureTracker:
    """
    Tracks portfolio exposure across different asset classes and geographic regions.
    Provides data for 3D visualization.
    """
    def __init__(self):
        self.logger = logging.getLogger("Analytics.GlobalExposure")
        self.exchanges = ["NYSE", "NASDAQ", "LSE", "TSE", "NSE", "BINANCE"]
        self.sectors = ["Tech", "Finance", "Energy", "Healthcare", "Materials"]

    def get_exposure_map(self) -> list:
        """
        Generates a 3D exposure map: [Region/Exchange, Sector, Exposure_Value]
        In production, this calculates real position weights.
        """
        data = []
        for exchange in self.exchanges:
            for sector in self.sectors:
                # Simulated exposure value
                exposure = random.uniform(0, 100000) if random.random() > 0.3 else 0
                data.append({
                    'exchange': exchange,
                    'sector': sector,
                    'exposure': round(exposure, 2),
                    'risk_factor': round(random.uniform(0.5, 2.5), 2),
                    'timestamp': datetime.utcnow().isoformat()
                })
        return data

    def get_aggregated_risk(self) -> dict:
        exposure = self.get_exposure_map()
        total = sum(e['exposure'] for e in exposure)
        return {
            'total_global_exposure': total,
            'high_risk_positions': sum(1 for e in exposure if e['risk_factor'] > 2.0),
            'last_updated': datetime.utcnow().isoformat()
        }
