import datetime
import pandas as pd
from typing import Dict, List, Optional
from core.events import FillEvent, OrderEvent, SignalEvent
from data.feed import DataHandler

class Portfolio:
    """
    The Portfolio class handles the positions and market
    value of all instruments at a resolution of a "bar",
    i.e. secondly, minutely, 5-min, 30-min, 60-min or EOD.
    """

    def __init__(self, data_handler: DataHandler, events_queue, initial_capital: float = 100000.0):
        self.data_handler = data_handler
        self.events = events_queue
        self.symbol_list = self.data_handler.symbol_list
        self.initial_capital = initial_capital
        
        # Position tracking over time
        self.all_positions = self.construct_all_positions()
        # Current positions
        self.current_positions = {s: 0 for s in self.symbol_list}

        # Holdings tracking over time (values in base currency)
        self.all_holdings = self.construct_all_holdings()
        # Current holdings
        self.current_holdings = self.construct_current_holdings()

    def construct_all_positions(self) -> List[Dict]:
        """
        Constructs the positions list using the start_date
        to determine when the time index will begin.
        """
        d = dict((k, v) for k, v in [(s, 0) for s in self.symbol_list])
        d['datetime'] = datetime.datetime.utcnow() # Should be set to backtest start really
        return [d]

    def construct_all_holdings(self) -> List[Dict]:
        """
        Constructs the holdings list using the start_date
        to determine when the time index will begin.
        """
        d = dict((k, v) for k, v in [(s, 0.0) for s in self.symbol_list])
        d['datetime'] = datetime.datetime.utcnow()
        d['cash'] = self.initial_capital
        d['commission'] = 0.0
        d['total'] = self.initial_capital
        return [d]

    def construct_current_holdings(self) -> Dict:
        """
        Constructs the dictionary which will hold the instantaneous
        value of the portfolio across all symbols.
        """
        d = dict((k, v) for k, v in [(s, 0.0) for s in self.symbol_list])
        d['cash'] = self.initial_capital
        d['commission'] = 0.0
        d['total'] = self.initial_capital
        return d

    def update_timeindex(self, event):
        """
        Adds a new record to the positions matrix for the current 
        market data bar. This reflects the PREVIOUS bar, i.e. all
        current market data at this stage is known (OHLCV).
        """
        latest_datetime = self.data_handler.get_latest_bar_datetime(self.symbol_list[0])
        
        # Update positions
        dp = dict((k,v) for k, v in [(s, 0) for s in self.symbol_list])
        dp['datetime'] = latest_datetime
        for s in self.symbol_list:
            dp[s] = self.current_positions[s]
        
        # Append the current positions
        self.all_positions.append(dp)

        # Update holdings
        dh = dict((k,v) for k, v in [(s, 0.0) for s in self.symbol_list])
        dh['datetime'] = latest_datetime
        dh['cash'] = self.current_holdings['cash']
        dh['commission'] = self.current_holdings['commission']
        dh['total'] = self.current_holdings['cash']
        
        for s in self.symbol_list:
            # Approximation to the real value
            market_value = 0.0
            if self.current_positions[s] != 0:
                try:
                    price = self.data_handler.get_latest_bar_value(s, 'close')
                    market_value = self.current_positions[s] * price
                except Exception:
                    # Ignore missing data
                    pass
            dh[s] = market_value
            dh['total'] += market_value
            
        self.all_holdings.append(dh)

    def update_positions_from_fill(self, fill: FillEvent):
        """
        Takes a Fill object and updates the position matrix.
        """
        fill_dir = 1
        if fill.direction == 'SELL':
            fill_dir = -1

        self.current_positions[fill.symbol] += fill_dir * fill.quantity

    def update_holdings_from_fill(self, fill: FillEvent):
        """
        Takes a Fill object and updates the holdings matrix.
        """
        fill_dir = 1
        if fill.direction == 'SELL':
            fill_dir = -1

        fill_cost = self.data_handler.get_latest_bar_value(fill.symbol, "close")
        cost = fill_dir * fill_cost * fill.quantity

        self.current_holdings[fill.symbol] += cost
        self.current_holdings['commission'] += fill.commission
        self.current_holdings['cash'] -= (cost + fill.commission)
        # Total is calculated dynamically in update_timeindex

    def update_fill(self, event: FillEvent):
        """
        Updates the portfolio current positions and holdings 
        from a FillEvent.
        """
        if event.type == 'FILL':
            self.update_positions_from_fill(event)
            self.update_holdings_from_fill(event)

    def generate_naive_order(self, signal: SignalEvent) -> Optional[OrderEvent]:
        """
        Simply transacts an OrderEvent object as a constant quantity,
        irrespective of current portfolio balance.
        """
        order = None
        symbol = signal.symbol
        direction = signal.signal_type
        strength = signal.strength # E.g., fraction of portfolio to use

        mkt_quantity = 100 # Constant for now
        
        # Determine actual quantity based on current pos
        cur_quantity = self.current_positions[symbol]
        order_type = 'MKT'

        if direction == 'LONG' and cur_quantity == 0:
            order = OrderEvent(symbol, order_type, mkt_quantity, 'BUY')
        elif direction == 'SHORT' and cur_quantity == 0:
            order = OrderEvent(symbol, order_type, mkt_quantity, 'SELL')
        elif direction == 'EXIT' and cur_quantity > 0:
            order = OrderEvent(symbol, order_type, abs(cur_quantity), 'SELL')
        elif direction == 'EXIT' and cur_quantity < 0:
            order = OrderEvent(symbol, order_type, abs(cur_quantity), 'BUY')

        return order

    def update_signal(self, event: SignalEvent):
        """
        Acts on a SignalEvent to generate new orders 
        based on the portfolio logic.
        """
        if event.type == 'SIGNAL':
            order_event = self.generate_naive_order(event)
            if order_event is not None:
                self.events.put(order_event)

    def create_equity_curve_dataframe(self):
        """
        Creates a pandas DataFrame from the all_holdings
        list of dictionaries.
        """
        curve = pd.DataFrame(self.all_holdings)
        curve.set_index('datetime', inplace=True)
        curve['returns'] = curve['total'].pct_change()
        curve['equity_curve'] = (1.0 + curve['returns']).cumprod()
        self.equity_curve = curve
        return curve

    def output_summary_stats(self):
        """
        Creates a list of summary statistics for the portfolio.
        """
        if not hasattr(self, 'equity_curve'):
            self.create_equity_curve_dataframe()
            
        total_return = self.equity_curve['equity_curve'].iloc[-1]
        returns = self.equity_curve['returns']
        
        # Assume 252 trading days per year
        daily_rf = 0.0 # 0% risk free rate for simplicity
        sharpe = 0.0
        if returns.std() != 0:
            sharpe = np.sqrt(252) * (returns.mean() - daily_rf) / returns.std()
            
        # Max Drawdown
        cum_ret = self.equity_curve['equity_curve']
        high_water_marks = cum_ret.cummax()
        drawdowns = (cum_ret - high_water_marks) / high_water_marks
        max_drawdown = drawdowns.min()

        stats = [
            ("Total Return", f"{(total_return - 1.0) * 100:.2f}%"),
            ("Sharpe Ratio", f"{sharpe:.2f}"),
            ("Max Drawdown", f"{max_drawdown * 100:.2f}%")
        ]
        
        return stats
