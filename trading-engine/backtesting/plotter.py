import matplotlib
matplotlib.use('Agg') # Safe for server environments without GUI
import matplotlib.pyplot as plt
import pandas as pd
import io
import base64

class CerebroPlotter:
    """
    Renders the execution history from a Cerebro instance into a chart.
    """
    def __init__(self, cerebro):
        self.cerebro = cerebro

    def plot(self, style='candle'):
        """
        Generates a plot similar to Backtrader's default plot.
        Returns a base64 encoded image string if running headlessly.
        """
        # We assume the first strategy and first data feed for simplicity in this mockup
        if not self.cerebro.strats or not self.cerebro.datas:
            return None

        strat = self.cerebro.strats[0][0] 
        # Actually in cerebro.run we returned the instanced strats.
        # But if we plot after run(), cerebro lacks the instanced strats by default unless stored.
        # For this design, let's assume we pass the *run* output.
        pass

    def plot_strategy(self, strategy_instance):
        """
        Plot using a specific executed strategy instance.
        """
        if not strategy_instance.datas:
            return None

        data = strategy_instance.datas[0]
        
        # Reconstruct DataFrame from lines
        # In a real Backtrader this is complex, but for our LineIterator it's easy:
        df = pd.DataFrame({
            'Open': data.lines_dict['open'].array,
            'High': data.lines_dict['high'].array,
            'Low': data.lines_dict['low'].array,
            'Close': data.lines_dict['close'].array,
            'Volume': data.lines_dict['volume'].array
        }, index=data.lines_dict['datetime'].array)

        # Plotting Setup
        fig, (ax1, ax2) = plt.subplots(2, 1, gridspec_kw={'height_ratios': [3, 1]}, figsize=(10, 8))
        fig.suptitle('Backtrader Cerebro Simulation')
        
        # Price Line
        ax1.plot(df.index, df['Close'], label='Close Price', color='blue', linewidth=1)
        ax1.set_ylabel('Price')
        ax1.grid(True, alpha=0.3)
        ax1.legend()

        # Extract TimeReturn analyzer if present
        equity_curve = None
        for a in strategy_instance.analyzers:
            if hasattr(a, 'rets') and 'df' in a.rets:
                equity_curve = a.rets['df']

        if equity_curve is not None:
            ax2.plot(equity_curve.index, equity_curve['value'], label='Portfolio Value', color='green', linewidth=1.5)
            ax2.set_ylabel('Value')
            ax2.grid(True, alpha=0.3)
            ax2.legend()
        else:
            # Fallback to volume if no equity curve analyzer
            ax2.bar(df.index, df['Volume'], color='grey', alpha=0.5)
            ax2.set_ylabel('Volume')

        plt.tight_layout()

        # Render to base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        buf.seek(0)
        image_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)
        
        return image_base64
