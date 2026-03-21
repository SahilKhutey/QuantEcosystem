import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from typing import Dict, List, Optional

class ChartingEngine:
    def create_candlestick_chart(self, df: pd.DataFrame, indicators: Dict = None) -> go.Figure:
        """Create candlestick chart with indicators using Plotly"""
        if df.empty:
            return go.Figure()
            
        fig = make_subplots(
            rows=3, cols=1,
            shared_xaxes=True,
            vertical_spacing=0.05,
            row_heights=[0.6, 0.2, 0.2]
        )
        
        # Candlesticks
        fig.add_trace(
            go.Candlestick(
                x=df.index,
                open=df['open'],
                high=df['high'],
                low=df['low'],
                close=df['close'],
                name="Price"
            ),
            row=1, col=1
        )
        
        # Volume
        # Simple color logic for volume bars
        colors = ['red' if row['close'] < row['open'] else 'green' 
                 for _, row in df.iterrows()]
        
        fig.add_trace(
            go.Bar(
                x=df.index,
                y=df['volume'],
                name="Volume",
                marker_color=colors
            ),
            row=2, col=1
        )
        
        # RSI
        # If df has rsi column (calculated elsewhere or inside this method)
        if 'rsi' in df.columns:
            fig.add_trace(
                go.Scatter(
                    x=df.index,
                    y=df['rsi'],
                    name="RSI",
                    line=dict(color='purple', width=2)
                ),
                row=3, col=1
            )
            # Add RSI bands
            fig.add_hline(y=70, line_dash="dash", line_color="red", row=3, col=1)
            fig.add_hline(y=30, line_dash="dash", line_color="green", row=3, col=1)
            
        # Update layout
        fig.update_layout(
            template="plotly_dark",
            title="Stock Analysis Dashboard",
            yaxis_title="Price",
            xaxis_rangeslider_visible=False,
            height=800,
            showlegend=True
        )
        
        return fig
        
    def create_heatmap(self, sector_data: Dict) -> go.Figure:
        """Create sector performance heatmap"""
        if not sector_data:
            return go.Figure()
            
        sectors = list(sector_data.keys())
        # Handling potential missing keys
        returns = [sector_data[s].get('return', 0) for s in sectors]
        
        fig = go.Figure(data=go.Heatmap(
            z=[returns],
            x=sectors,
            y=['Performance (%)'],
            colorscale='RdYlGn',
            showscale=True
        ))
        
        fig.update_layout(
            template="plotly_dark",
            title="Sector Performance Heatmap",
            height=400
        )
        
        return fig
        
    def create_correlation_matrix(self, symbols: List[str], 
                                correlation_matrix: pd.DataFrame) -> go.Figure:
        """Create interactive correlation matrix heatmap"""
        if correlation_matrix.empty:
            return go.Figure()
            
        fig = go.Figure(data=go.Heatmap(
            z=correlation_matrix.values,
            x=symbols,
            y=symbols,
            colorscale='RdBu',
            zmin=-1,
            zmax=1,
            text=correlation_matrix.values.round(2),
            texttemplate='%{text}',
            textfont={"size": 10}
        ))
        
        fig.update_layout(
            template="plotly_dark",
            title="Asset Correlation Matrix",
            height=600,
            width=800
        )
        
        return fig
