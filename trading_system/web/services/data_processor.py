import pandas as pd
import numpy as np
import logging
from datetime import datetime

logger = logging.getLogger('DataProcessor')

class DataProcessor:
    """Processes API data for dashboard visualization"""
    
    def __init__(self):
        self.logger = logger
    
    def process_performance_data(self, data):
        """Process system performance data for visualization"""
        if not data:
            return None
        
        # Calculate additional metrics
        data['win_rate'] = data.get('winning_trades', 0) / data.get('total_trades', 1)
        data['profit_factor'] = (data.get('total_wins', 0) / 
                               (data.get('total_losses', 1) or 1))
        
        return data
    
    def process_risk_metrics(self, data):
        """Process risk metrics for dashboard display"""
        if not data:
            return None
        
        # Calculate derived metrics
        data['daily_loss_pct'] = data.get('daily_loss', 0) / data.get('current_capital', 1)
        data['position_risk'] = data.get('position_risk', 0) / data.get('current_capital', 1)
        
        # Format for display
        data['daily_loss'] = f"${data['daily_loss']:.2f}"
        data['daily_loss_pct'] = f"{data['daily_loss_pct']:.2%}"
        data['drawdown'] = f"{data['drawdown']:.2%}"
        
        return data
    
    def process_market_data(self, data):
        """Process market data for global market view"""
        if not data:
            return None
        
        # Process regions for map visualization
        if 'regions' in data:
            for region in data['regions']:
                region['market_cap'] = region.get('market_cap', 0) / 1e9  # Convert to billions
                region['change'] = region.get('change', 0) * 100  # Convert to percentage
        
        return data
    
    def process_signal_data(self, data):
        """Process signal data for visualization"""
        if not data:
            return None
        
        # Add derived signal metrics
        for signal in data:
            signal['strength'] = min(5, max(1, int(signal['confidence'] * 5)))
        
        return data
    
    def process_portfolio_data(self, data):
        """Process portfolio data for visualization"""
        if not data:
            return None
        
        # Process allocation data
        if 'allocations' in data:
            total = sum(data['allocations'].values())
            for symbol, allocation in data['allocations'].items():
                data['allocations'][symbol] = allocation / total
            
            # Calculate portfolio metrics
            data['total_return'] = sum(
                allocation * data.get('returns', {}).get(symbol, 0)
                for symbol, allocation in data['allocations'].items()
            )
        
        return data
    
    def process_order_book(self, data):
        """Process order book data for visualization"""
        if not data:
            return None
        
        # Convert to format for visualization
        if 'bids' in data and 'asks' in data:
            bids = [[bid[0], bid[1]] for bid in data['bids']]
            asks = [[ask[0], ask[1]] for ask in data['asks']]
            
            # Create cumulative quantity
            bid_cumulative = 0
            ask_cumulative = 0
            cumulative_bids = []
            cumulative_asks = []
            
            for price, size in reversed(bids):
                bid_cumulative += size
                cumulative_bids.append([price, bid_cumulative])
            
            for price, size in asks:
                ask_cumulative += size
                cumulative_asks.append([price, ask_cumulative])
            
            data['bids'] = cumulative_bids
            data['asks'] = cumulative_asks
        
        return data
    
    def process_risk_allocation(self, data):
        """Process risk allocation data for visualization"""
        if not data:
            return None
        
        # Format data for display
        allocation_data = {}
        for symbol, metrics in data.items():
            allocation_data[symbol] = {
                'risk_allocation': metrics['risk_allocation'],
                'position_size': metrics['position_size'],
                'max_allocation': 0.15  # 15% max
            }
        
        return allocation_data
    
    def process_performance_history(self, data):
        """Process performance history for charting"""
        if not data:
            return None
        
        # Convert to list of dictionaries for easy processing
        history = []
        if isinstance(data, dict):
            for date, value in data.items():
                try:
                    history.append({
                        'date': datetime.strptime(date, '%Y-%m-%d'),
                        'value': value
                    })
                except ValueError:
                    continue
        elif isinstance(data, list):
            history = data
        
        # Sort by date
        history.sort(key=lambda x: x.get('date', datetime.now()))
        
        # Calculate returns
        for i in range(1, len(history)):
            if 'value' in history[i] and 'value' in history[i-1] and history[i-1]['value'] != 0:
                history[i]['return'] = (history[i]['value'] / history[i-1]['value']) - 1
        
        return history
