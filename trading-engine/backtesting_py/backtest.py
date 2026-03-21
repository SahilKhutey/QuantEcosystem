import pandas as pd
import numpy as np

class Trade:
    def __init__(self, size, entry_price, entry_time):
        self.size = size
        self.entry_price = entry_price
        self.entry_time = entry_time
        self.exit_price = 0.0
        self.exit_time = None
        self.pl = 0.0
        self.pl_pct = 0.0

    def close(self, exit_price, exit_time):
        self.exit_price = exit_price
        self.exit_time = exit_time
        
        if self.size > 0:
            self.pl = (self.exit_price - self.entry_price) * self.size
            self.pl_pct = (self.exit_price / self.entry_price) - 1.0
        else:
            self.pl = (self.entry_price - self.exit_price) * abs(self.size)
            self.pl_pct = (self.entry_price / self.exit_price) - 1.0


class _Broker:
    def __init__(self, cash):
        self.cash = cash
        self.starting_cash = cash
        self.equity = cash
        
        self.position_size = 0
        self.position_price = 0.0
        
        self.orders = []
        self.trades = []
        
        # We'll need the current open/close per row
        self.current_time = None
        self.current_open = 0.0
        self.current_close = 0.0

    def submit_order(self, size, is_buy):
        self.orders.append({'size': size, 'is_buy': is_buy})

    def process_orders(self):
        """Simplistic execution at the current bar's OPEN price"""
        if not self.orders: return
        
        for p_order in self.orders:
             # Simplistic logic: close current position, then open new
             # In backtesting.py, `buy()` usually reverses short positions completely or adds to long
             exec_price = self.current_open
             
             # If we are reversing position
             if p_order['is_buy'] and self.position_size < 0:
                  self.close_position(exec_price)
             elif not p_order['is_buy'] and self.position_size > 0:
                  self.close_position(exec_price)
                  
             # After closing any opposite direction, open new
             direction = 1 if p_order['is_buy'] else -1
             trade_size = p_order['size'] * direction
             
             # Calculate allocable cash (simplified)
             alloc_cost = abs(trade_size) * exec_price
             if self.cash >= alloc_cost:
                  self.cash -= alloc_cost
                  self.position_size += trade_size
                  
                  # Create Trade
                  self.trades.append(Trade(trade_size, exec_price, self.current_time))
             
        self.orders.clear()

    def close_position(self, exec_price):
        if self.position_size == 0: return
        
        # Find the open trade
        open_trade = next((t for t in self.trades if t.exit_time is None), None)
        if open_trade:
             open_trade.close(exec_price, self.current_time)
             self.cash += (abs(open_trade.size) * exec_price) + open_trade.pl
             
        self.position_size = 0


class Backtest:
    """
    Main Orchestrator representing the Backtesting.py engine loop.
    Returns standard Pandas Series statistics.
    """
    def __init__(self, data, strategy, cash=10000.0, commission=0.0):
        self.data = data
        self.strategy_cls = strategy
        self.cash = cash
        self.commission = commission

    def run(self):
        broker = _Broker(self.cash)
        strategy = self.strategy_cls(broker, self.data)
        
        # Execute vectorized self.I() calls
        strategy.init()
        
        equity_curve = []
        
        # Main highly-vectorized-like row iteration loop
        # But done procedurally for user logic
        closes = self.data['Close'].values
        opens = self.data['Open'].values
        dates = self.data.index
        
        for i in range(len(self.data)):
             broker.current_time = dates[i]
             broker.current_open = opens[i]
             broker.current_close = closes[i]
             
             # 1. Process pending orders at current OPEN
             broker.process_orders()
             
             # 2. Update M2M Equity
             open_pl = 0
             if broker.position_size != 0:
                  open_trade = next((t for t in broker.trades if t.exit_time is None), None)
                  if open_trade:
                      if broker.position_size > 0:
                           open_pl = (closes[i] - open_trade.entry_price) * open_trade.size
                      else:
                           open_pl = (open_trade.entry_price - closes[i]) * abs(open_trade.size)
                           
             equity = broker.cash + open_pl + (abs(broker.position_size) * open_trade.entry_price if broker.position_size != 0 else 0)
             broker.equity = equity
             equity_curve.append(equity)
             
             # Update strategy references
             strategy._update_index(i)
             strategy.position.size = broker.position_size
             strategy.position.pl = open_pl
             
             # 3. Trigger next() logic execution
             strategy.next()
             
        # Cleanup at end
        broker.close_position(closes[-1])
        
        return self._compute_stats(broker, equity_curve)

    def _compute_stats(self, broker, equity_curve):
        """Construct the famous series of parameters outputs."""
        equity_series = pd.Series(equity_curve, index=self.data.index)
        
        start_val = self.cash
        end_val = broker.equity
        ret_total = (end_val / start_val) - 1.0
        
        # Calculate max drawdown
        roll_max = equity_series.cummax()
        drawdown = equity_series / roll_max - 1.0
        max_drawdown = drawdown.min()
        
        closed_trades = [t for t in broker.trades if t.exit_time is not None]
        win_trades = [t for t in closed_trades if t.pl > 0]
        
        win_rate = len(win_trades) / len(closed_trades) if closed_trades else 0.0
        best_trade = max([t.pl_pct for t in closed_trades] + [0])
        worst_trade = min([t.pl_pct for t in closed_trades] + [0])
        
        stats = pd.Series({
             'Start': self.data.index[0],
             'End': self.data.index[-1],
             'Duration': self.data.index[-1] - self.data.index[0],
             'Equity Final [$]': float(end_val),
             'Equity Peak [$]': float(equity_series.max()),
             'Return [%]': float(ret_total * 100),
             'Max. Drawdown [%]': float(max_drawdown * 100),
             '# Trades': len(closed_trades),
             'Win Rate [%]': float(win_rate * 100),
             'Best Trade [%]': float(best_trade * 100),
             'Worst Trade [%]': float(worst_trade * 100)
        })
        
        return stats
