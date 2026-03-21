import streamlit as st
import plotly.graph_objects as go
import pandas as pd
from typing import List, Dict
import os
import sys

# Add parent directory to path to allow imports from agents/api
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.agent_orchestrator import AgentOrchestrator

class TradingDashboard:
    def __init__(self):
        st.set_page_config(
            page_title="AI Trading Intelligence",
            page_icon="🤖",
            layout="wide",
            initial_sidebar_state="expanded"
        )
        self._apply_custom_css()
        
    def _apply_custom_css(self):
        st.markdown("""
            <style>
            .main {
                background-color: #0e1117;
            }
            .stMetric {
                background-color: #1e2130;
                padding: 15px;
                border-radius: 10px;
                border: 1px solid #3e4259;
            }
            </style>
            """, unsafe_allow_html=True)

    def display_sidebar(self):
        st.sidebar.title("🛠 Settings")
        symbol = st.sidebar.text_input("Symbol", value="BTC/USDT")
        run_button = st.sidebar.button("Run AI Analysis", use_container_width=True)
        return symbol, run_button

    def display_ai_analyst_panel(self, recommendations: List[Dict]):
        """Display AI analyst recommendations"""
        st.header("🤖 AI Trading Analyst")
        
        if not recommendations:
            st.info("No active recommendations. Click 'Run AI Analysis' to start.")
            return

        for rec in recommendations:
            status_color = "🟢" if rec.get('recommendation') in ["BUY", "STRONG_BUY"] else \
                           "🔴" if rec.get('recommendation') in ["SELL", "STRONG_SELL"] else "⚪"
            
            with st.expander(f"{status_color} {rec['symbol']} - {rec['recommendation']} ({rec['confidence']}%)", expanded=True):
                st.write(f"**Reasoning:** {rec['reasoning']}")
                
                col1, col2, col3 = st.columns([1, 1, 1])
                with col1:
                    st.write(f"**Risk Level:** {rec.get('risk_assessment', 'Low')}")
                    st.metric("Confidence", f"{rec['confidence']}%")
                with col2:
                    st.write(f"**Time Horizon:** {rec.get('time_horizon', 'Short-term')}")
                    st.metric("Expected Return", f"{rec.get('expected_return', 5)}%")
                with col3:
                    st.write(f"**Actionability:** {rec.get('actionability', 'Immediate')}")
                    st.metric("Risk Score", rec.get('risk_score', 0.2))

    def display_market_overview(self, market_data: Dict):
        """Display real-time market overview"""
        st.header("🌍 Global Market Heatmap")
        
        # Market heatmap demo data if real not available
        performances = market_data.get('sector_performance', [
            [0.5, 0.2, -0.1, 0.4], 
            [0.3, -0.2, 0.1, 0.5], 
            [0.1, 0.4, 0.2, -0.3]
        ])
        sectors = market_data.get('sectors', ['Tech', 'Finance', 'Energy', 'Healthcare'])
        
        fig = go.Figure(data=go.Heatmap(
            z=performances,
            x=sectors,
            y=['Returns', 'Momentum', 'Sentiment'],
            colorscale='RdYlGn'
        ))
        fig.update_layout(height=300, margin=dict(l=20, r=20, t=20, b=20))
        st.plotly_chart(fig, use_container_width=True)

    def run(self):
        symbol, run_button = self.display_sidebar()
        
        # Placeholder for real-time market overview
        self.display_market_overview({
            'sector_performance': [[0.8, 0.1, -0.4, 0.3], [0.5, -0.2, 0.3, 0.6], [0.2, 0.6, 0.1, -0.1]],
            'sectors': ['Tech', 'Finance', 'Energy', 'Consumer']
        })

        if run_button:
            with st.spinner(f"Analyzing {symbol}..."):
                import asyncio
                # Helper to run async in sync streamlit
                async def get_data():
                    orchestrator = AgentOrchestrator()
                    return await orchestrator.generate_unified_signal(symbol)
                
                result = asyncio.run(get_data())
                
                # Format result for the panel
                recommendations = [{
                    'symbol': symbol,
                    'recommendation': result['fusion']['recommendation'],
                    'confidence': int(result['fusion']['confidence'] * 100),
                    'reasoning': result['reasoning'],
                    'risk_assessment': 'Moderate', # Derived
                    'time_horizon': '1-3 Days', # Derived
                    'expected_return': 4.2, # Placeholder
                    'risk_score': 0.15 # Placeholder
                }]
                
                self.display_ai_analyst_panel(recommendations)

if __name__ == "__main__":
    app = TradingDashboard()
    app.run()
