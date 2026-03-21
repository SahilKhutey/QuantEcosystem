class SimplePosition:
    def __init__(self, asset):
        self.asset = asset
        self.amount = 0
        self.cost_basis = 0.0
        self.last_sale_price = 0.0

class Portfolio:
    """Provides Zipline contextual portfolio states."""
    def __init__(self, start_cash=10000.0):
        self.cash = start_cash
        self.starting_cash = start_cash
        self.positions = {}
        self.portfolio_value = start_cash
        self.returns = 0.0
        self.pnl = 0.0

    def update_value(self):
        """Re-evaluates portfolio from current prices in positions."""
        val = self.cash
        for pos in self.positions.values():
            val += pos.amount * pos.last_sale_price
        self.portfolio_value = val
        self.returns = (val / self.starting_cash) - 1.0
        self.pnl = val - self.starting_cash

class Context:
    """The Zipline execution context passed to initialize and handle_data."""
    def __init__(self, start_cash=10000.0):
        self.portfolio = Portfolio(start_cash)
        # Allows user to attach any arbitrary attributes
        self.__dict__['portfolio'] = self.portfolio

    def set_attribute(self, name, value):
        setattr(self, name, value)


class TradingAlgorithm:
    """
    Simulates the Zipline Algorithm runner.
    Takes initialize, handle_data and executes over a data-stream.
    """
    def __init__(self, initialize=None, handle_data=None, capital_base=10000.0):
        self.initialize = initialize
        self.handle_data = handle_data
        
        self.context = Context(start_cash=capital_base)
        self.recorded_vars = {}
        
        self.current_dt = None
        self._pipelines = {}
        self._pipeline_outputs = {}
        self._history_portal_df = None # Used for pipeline engine injection
        
        # We will track daily returns for PyFolio mimic
        self.daily_values = []
        self.daily_dates = []

    def attach_pipeline(self, pipeline, name):
        self._pipelines[name] = pipeline

    def pipeline_output(self, name):
         """Returns the latest evaluated pipeline dataframe."""
         return self._pipeline_outputs.get(name)

    def get_portfolio_value(self):
         self.context.portfolio.update_value()
         return self.context.portfolio.portfolio_value

    def run(self, data_portal):
        """
        Executes the algorithm across the given data portal.
        """
        import trading_engine.zipline.api as zipline_api
        
        # Bind this algorithm globally so api commands work!
        zipline_api._algo = self
        
        if self.initialize:
            self.initialize(self.context)
            
        print(f"Zipline Initialization Complete. Starting Cash: {self.context.portfolio.cash}")

        # Iterate over days in portal
        # data_portal provides (timestamp, BarData)
        for timestamp, bar_data in data_portal.iterrows():
            self.current_dt = timestamp
            
            # Update all positions to current price
            for asset, pos in self.context.portfolio.positions.items():
                if asset in bar_data.current_raw:
                    pos.last_sale_price = bar_data.current_raw[asset]['close']
                    
            self.context.portfolio.update_value()

            # Execute attached pipelines for the day
            if self._pipelines and data_portal.df is not None:
                from trading_engine.zipline.pipeline import PipelineEngine
                # Very simple extraction of the close prices for the Pipeline Engine history
                close_df = pd.DataFrame({asset: data_portal.df['Close'] for asset in bar_data.current_raw.keys()})
                engine = PipelineEngine(close_df)
                
                for name, pipe in self._pipelines.items():
                     self._pipeline_outputs[name] = engine.run_pipeline(pipe, timestamp)

            if self.handle_data:
                self.handle_data(self.context, bar_data)
                
            # Log end of day value
            self.daily_dates.append(timestamp)
            self.daily_values.append(self.context.portfolio.portfolio_value)

        # Unbind global API
        zipline_api._algo = None
        
        import pandas as pd
        returns_df = pd.DataFrame({'value': self.daily_values}, index=self.daily_dates)
        returns_df['returns'] = returns_df['value'].pct_change().fillna(0)
        
        return returns_df, self.recorded_vars
