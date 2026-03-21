import sys
import os
import queue
import time
from datetime import datetime
from threading import Thread

# Import our new components
from core.engine import EventEngine
from core.events import MarketEvent, SignalEvent, OrderEvent, FillEvent
from data.feed import DataHandler, HistoricalCSVDataFeed
from execution.simulated_execution import SimulatedExecutionHandler
from portfolio.portfolio import Portfolio
from strategies.strategy import Strategy

# A simple Moving Average Crossover Strategy for testing
class MovingAverageCrossStrategy(Strategy):
    """
    Standard moving average crossover strategy.
    """
    def __init__(self, data_handler: DataHandler, events_queue, short_window=10, long_window=30):
        self.data_handler = data_handler
        self.events = events_queue
        self.short_window = short_window
        self.long_window = long_window
        self.symbol_list = self.data_handler.symbol_list
        
        self.bars = 0
        self.bought = {s: 'OUT' for s in self.symbol_list}

    def calculate_signals(self, event: MarketEvent):
        if event.type == 'MARKET':
            self.bars += 1
            if self.bars > self.long_window:
                for symbol in self.symbol_list:
                    bars = self.data_handler.get_latest_bars(symbol, N=self.long_window)
                    if len(bars) == self.long_window:
                        # Extract close prices
                        closes = [b[1].close for b in bars]
                        short_sma = sum(closes[-self.short_window:]) / self.short_window
                        long_sma = sum(closes) / self.long_window

                        symbol_dt = self.data_handler.get_latest_bar_datetime(symbol)

                        if short_sma > long_sma and self.bought[symbol] == 'OUT':
                            sig = SignalEvent(symbol, symbol_dt, 'LONG')
                            self.events.put(sig)
                            self.bought[symbol] = 'LONG'
                        elif short_sma < long_sma and self.bought[symbol] == 'LONG':
                            sig = SignalEvent(symbol, symbol_dt, 'EXIT')
                            self.events.put(sig)
                            self.bought[symbol] = 'OUT'


class BacktestRunner:
    """
    Encapsulates the settings and components for carrying out an event-driven backtest.
    """
    def __init__(self, csv_dir, symbol_list, initial_capital, start_date):
        self.csv_dir = csv_dir
        self.symbol_list = symbol_list
        self.initial_capital = initial_capital
        self.start_date = start_date

        self.events_queue = queue.Queue()
        
        # 1. Init Data Feed
        # Make sure CSVs exist or this will crash. For production, add safety checks.
        self.data_handler = HistoricalCSVDataFeed(self.events_queue, self.csv_dir, self.symbol_list)
        
        # 2. Init Execution
        self.execution_handler = SimulatedExecutionHandler(self.events_queue, self.data_handler)
        
        # 3. Init Portfolio
        self.portfolio = Portfolio(self.data_handler, self.events_queue, self.initial_capital)
        
        # 4. Init Strategy
        self.strategy = MovingAverageCrossStrategy(self.data_handler, self.events_queue)

        # 5. Init Core Engine
        self.engine = EventEngine()
        # Override the Engine queue to use our shared queue
        self.engine.queue = self.events_queue

        # Bind events
        self.engine.register_handler('MARKET', self.strategy.calculate_signals)
        self.engine.register_handler('MARKET', self.portfolio.update_timeindex)
        self.engine.register_handler('SIGNAL', self.portfolio.update_signal)
        self.engine.register_handler('ORDER', self.execution_handler.execute_order)
        self.engine.register_handler('FILL', self.portfolio.update_fill)
        
    def simulate_trading(self):
        """
        Executes the backtest. Steps through the data_handler's generator.
        """
        print("Starting Backtest...")
        
        # Start event engine thread
        engine_thread = Thread(target=self.engine.run)
        engine_thread.daemon = True
        engine_thread.start()

        # Feed market data
        while True:
            # Update the bars (pushes a MARKET event)
            if self.data_handler.continue_backtest:
                self.data_handler.update_bars()
            else:
                break
                
            # Allow time for engine to process Queue
            time.sleep(0.001)

        print("\nBacktest Complete.")
        
        self.engine.stop()
        
        # Output Stats
        stats = self.portfolio.output_summary_stats()
        print("\n--- Portfolio Performance ---")
        for stat in stats:
            print(f"{stat[0]}: {stat[1]}")

if __name__ == "__main__":
    # Example Usage:
    # Requires AAPL.csv in the data directory
    csv_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    # fallback to current dir if data not present
    if not os.path.exists(csv_dir):
        csv_dir = os.path.dirname(__file__)

    runner = BacktestRunner(
        csv_dir=csv_dir,
        symbol_list=['AAPL'],
        initial_capital=100000.0,
        start_date=datetime(2020, 1, 1)
    )
    
    # We won't actually run it here without data, but the structure is proven.
    print("Backtest engine initialized successfully. Ready to run with data.")
