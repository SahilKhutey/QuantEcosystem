import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime
from freqtrade.strategy import IStrategy
from freqtrade.exchange import Exchange

class Trade:
    """Tracks a single Round-Trip trade lifecycle in Freqtrade."""
    def __init__(self, pair: str, open_rate: float, amount: float, open_date: datetime):
        self.pair = pair
        self.open_rate = open_rate
        self.amount = amount
        self.open_date = open_date
        self.close_rate = 0.0
        self.close_date = None
        self.is_open = True
        self.exit_reason = ""
        self.profit_ratio = 0.0
        self.profit_abs = 0.0

    def update(self, current_price: float):
        self.profit_ratio = (current_price - self.open_rate) / self.open_rate
        self.profit_abs = (current_price - self.open_rate) * self.amount

    def close(self, close_rate: float, close_date: datetime, reason: str):
        self.close_rate = close_rate
        self.close_date = close_date
        self.exit_reason = reason
        self.update(close_rate)
        self.is_open = False

class FreqtradeBot:
    """
    The orchestrator playing the role of the Freqtrade worker daemon.
    Downloads data, evaluates the `IStrategy`, and maintains a ledger of Trades.
    """
    def __init__(self, config: Dict):
        self.config = config
        self.exchange = Exchange(config)
        self.strategy: IStrategy = None
        self.trades: List[Trade] = []
        self.starting_balance = config.get('dry_run_wallet', 1000.0)
        self.current_balance = self.starting_balance
        self.stake_amount = config.get('stake_amount', 100.0) # Fixed stake size per trade
        
        self.whitelist = config.get('exchange', {}).get('pair_whitelist', ['BTC/USDT'])

    def set_strategy(self, strategy: IStrategy):
        self.strategy = strategy

    def process_pair(self, pair: str, df: pd.DataFrame):
        """Processes dataframe signals sequentially to simulate live backtesting/trading."""
        open_trade: Optional[Trade] = next((t for t in self.trades if t.is_open and t.pair == pair), None)
        
        for index, row in df.iterrows():
            current_date = row['date']
            current_price = row['close']
            
            # If trade is open, check ROI or Stoploss or Exit Signal
            if open_trade:
                open_trade.update(current_price)
                
                # 1. Stoploss check
                if open_trade.profit_ratio <= self.strategy.stoploss:
                    open_trade.close(current_price, current_date, "stop_loss")
                    self.current_balance += open_trade.profit_abs
                    open_trade = None
                    continue
                    
                # 2. ROI Check (Simplistic immediate minimal_roi check)
                min_roi = float(self.strategy.minimal_roi.get("0", 999.0))
                if open_trade.profit_ratio >= min_roi:
                    open_trade.close(current_price, current_date, "roi")
                    self.current_balance += open_trade.profit_abs
                    open_trade = None
                    continue
                    
                # 3. Strategy Exit Signal (exit_long == 1)
                if row.get('exit_long') == 1:
                    open_trade.close(current_price, current_date, "sell_signal")
                    self.current_balance += open_trade.profit_abs
                    open_trade = None
                    continue

            # If no trade is open, check Entry Signal
            else:
                if row.get('enter_long') == 1 and self.current_balance >= self.stake_amount:
                    amount = self.stake_amount / current_price
                    # Mock exchange execution
                    order = self.exchange.create_order(pair, 'limit', 'buy', amount, current_price)
                    
                    if order['status'] == 'closed':
                         new_trade = Trade(pair, current_price, amount, current_date)
                         self.trades.append(new_trade)
                         open_trade = new_trade

    def run_backtest(self, start_date: datetime, end_date: datetime):
        """Simulates Freqtrade backtesting command loop for all pairs"""
        for pair in self.whitelist:
             # Fetch data
             df = self.exchange.get_historical_data(pair, self.strategy.timeframe, start_date, end_date)
             
             # Populate Strategy Logic
             df = self.strategy.populate_indicators(df, {'pair': pair})
             df = self.strategy.populate_entry_trend(df, {'pair': pair})
             df = self.strategy.populate_exit_trend(df, {'pair': pair})
             
             # Process Data Row by Row
             self.process_pair(pair, df)

    def get_results(self) -> Dict:
        """Returns statistics of the bot's execution."""
        closed_trades = [t for t in self.trades if not t.is_open]
        total_profit = sum(t.profit_abs for t in closed_trades)
        win_count = len([t for t in closed_trades if t.profit_abs > 0])
        loss_count = len([t for t in closed_trades if t.profit_abs <= 0])
        
        formatted_trades = []
        for t in closed_trades:
            formatted_trades.append({
                'pair': t.pair,
                'open_date': t.open_date.strftime('%Y-%m-%d %H:%M'),
                'close_date': t.close_date.strftime('%Y-%m-%d %H:%M'),
                'open_rate': t.open_rate,
                'close_rate': t.close_rate,
                'profit_ratio': f"{t.profit_ratio * 100:.2f}%",
                'profit_abs': f"${t.profit_abs:.2f}",
                'exit_reason': t.exit_reason
            })
            
        return {
            'starting_balance': self.starting_balance,
            'current_balance': self.current_balance,
            'total_profit_abs': total_profit,
            'total_profit_pct': (self.current_balance / self.starting_balance) - 1.0,
            'win_rate': (win_count / len(closed_trades) if closed_trades else 0.0),
            'total_closed_trades': len(closed_trades),
            'trades': formatted_trades
        }
