import streamlit as st
import plotly.graph_objects as go
import pandas as pd
from datetime import datetime
import json
from typing import List, Dict, Any
import os
import sys

# Add parent directory to path to allow imports from agents/api
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.agent_orchestrator import AgentOrchestrator

class RealTimeDashboard:
    def __init__(self):
        self.setup_page_config()
        
    def setup_page_config(self):
        st.set_page_config(
            page_title="AI Trading Agent Dashboard",
            page_icon="🤖",
            layout="wide",
            initial_sidebar_state="expanded"
        )
        
        # Custom CSS
        st.markdown("""
        <style>
        .main-header {
            font-size: 2.5rem;
            color: #1f77b4;
            text-align: center;
            margin-bottom: 2rem;
        }
        .signal-card {
            border-left: 5px solid #4CAF50;
            padding: 1rem;
            margin: 0.5rem 0;
            background-color: #1e2130;
            color: white;
            border-radius: 5px;
        }
        .alert-high {
            border-left-color: #ff4b4b;
        }
        </style>
        """, unsafe_allow_html=True)
    
    def display_header(self):
        """Display dashboard header"""
        st.markdown('<h1 class="main-header">🤖 AI Trading Agent Dashboard</h1>', 
                   unsafe_allow_html=True)
        
        # Status indicators
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("System Status", "ONLINE", delta="Active")
        with col2:
            st.metric("Agents Running", "6/6", delta="100%")
        with col3:
            st.metric("Signals Today", "24", delta="+3")
        with col4:
            st.metric("Accuracy", "76%", delta="2.1%")
    
    def display_ai_analyst_panel(self, recommendations: List[Dict]):
        """Display AI analyst recommendations"""
        st.header("🎯 AI Trading Recommendations")
        
        if not recommendations:
            st.info("No active recommendations. Analyzing market...")
            return

        for i, rec in enumerate(recommendations):
            with st.expander(f"{rec['symbol']} - {rec['recommendation']} ({rec['confidence']:.0%})", 
                          expanded=i==0):
                
                # Create columns for different information
                col1, col2 = st.columns([2, 1])
                
                with col1:
                    st.write(f"**Reasoning:** {rec['reasoning']}")
                    st.write(f"**Key Factors:** {', '.join(rec.get('key_factors', []))}")
                    
                    # Risk assessment
                    risk_level = rec.get('risk_assessment', 'MEDIUM')
                    risk_color = {
                        'LOW': '🟢', 'MEDIUM': '🟡', 'HIGH': '🔴'
                    }.get(risk_level, '🟡')
                    st.write(f"**Risk:** {risk_color} {risk_level}")
                    
                with col2:
                    # Confidence gauge
                    fig = go.Figure(go.Indicator(
                        mode = "gauge+number+delta",
                        value = rec['confidence'] * 100,
                        domain = {'x': [0, 1], 'y': [0, 1]},
                        title = {'text': "Confidence"},
                        gauge = {
                            'axis': {'range': [0, 100]},
                            'bar': {'color': "darkblue"},
                            'steps': [
                                {'range': [0, 50], 'color': "lightgray"},
                                {'range': [50, 80], 'color': "yellow"},
                                {'range': [80, 100], 'color': "lightgreen"}
                            ],
                            'threshold': {
                                'line': {'color': "red", 'width': 4},
                                'thickness': 0.75,
                                'value': 90
                            }
                        }
                    ))
                    fig.update_layout(height=200, margin=dict(l=10, r=10, t=30, b=10))
                    st.plotly_chart(fig, use_container_width=True)
    
    def display_market_overview(self, market_data: Dict):
        """Display real-time market overview"""
        st.header("🌍 Live Market Overview")
        
        if not market_data:
            st.warning("Waiting for market data...")
            return
        
        # Market heatmap
        col1, col2 = st.columns([3, 1])
        
        with col1:
            if 'sector_performance' in market_data:
                fig = go.Figure(data=go.Heatmap(
                    z=market_data['sector_performance']['values'],
                    x=market_data['sector_performance']['sectors'],
                    y=['Returns', 'Momentum', 'Sentiment', 'Volume'],
                    colorscale='RdYlGn',
                    zmid=0
                ))
                fig.update_layout(
                    title="Sector Performance Heatmap",
                    xaxis_title="Sectors",
                    yaxis_title="Metrics",
                    height=400
                )
                st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("Top Movers")
            if 'top_movers' in market_data:
                for mover in market_data['top_movers'][:5]:
                    change_color = "green" if mover['change'] > 0 else "red"
                    st.markdown(f"""
                    **{mover['symbol']}**: <span style='color:{change_color}'>{mover['change']:+.2f}%</span>
                    """, unsafe_allow_html=True)
    
    def display_alert_feed(self, alerts: List[Dict]):
        """Display real-time alert feed"""
        st.header("🚨 Live Alerts")
        
        for alert in alerts[-10:]:  # Show last 10 alerts
            urgency_color = {
                'LOW': 'blue', 'MEDIUM': 'orange', 'HIGH': 'red', 'CRITICAL': 'darkred'
            }.get(alert.get('urgency', 'MEDIUM'), 'gray')
            
            st.markdown(f"""
            <div class="signal-card" style="border-left-color: {urgency_color}">
                <strong>{alert.get('symbol', 'UNKNOWN')}</strong> - {alert.get('recommendation', 'HOLD')}<br>
                <small>Confidence: {alert.get('confidence', 0):.0%} | {alert.get('timestamp', '')}</small><br>
                {alert.get('reasoning', '')}
            </div>
            """, unsafe_allow_html=True)

# Main application
def main():
    dashboard = RealTimeDashboard()
    dashboard.display_header()
    
    # Sidebar controls
    symbol = st.sidebar.text_input("Enter Ticker Symbol", value="BTC/USDT")
    run_btn = st.sidebar.button("Execute High-Fidelity Analysis")
    
    if run_btn:
        with st.spinner(f"Analyzing {symbol}..."):
            import asyncio
            async def get_analysis():
                orchestrator = AgentOrchestrator()
                return await orchestrator.analyze_market(symbol)
            
            result = asyncio.run(get_analysis())
            
            # Format display data
            rec = result.get('reasoning_data', {})
            recommendations = [{
                'symbol': symbol,
                'recommendation': rec.get('recommendation', 'HOLD'),
                'confidence': rec.get('confidence', 0.5),
                'reasoning': rec.get('reasoning', result.get('final_reasoning', {}).reason if result.get('final_reasoning') else 'N/A'),
                'key_factors': rec.get('key_factors', []),
                'risk_assessment': rec.get('risk_assessment', 'MEDIUM')
            }]
            dashboard.display_ai_analyst_panel(recommendations)

    # Sample market data
    sample_market_data = {
        'sector_performance': {
            'sectors': ['Technology', 'Banking', 'Energy', 'Pharma', 'Auto'],
            'values': [
                [2.5, 1.8, -0.5, 3.2, 1.1],  # Returns
                [0.8, 0.6, -0.3, 0.9, 0.4],   # Momentum
                [0.7, 0.5, 0.3, 0.8, 0.6],    # Sentiment
                [1.2, 0.9, 0.5, 1.1, 0.7]     # Volume
            ]
        },
        'top_movers': [
            {'symbol': 'TECHM', 'change': 4.2},
            {'symbol': 'HDFC', 'change': 3.1},
            {'symbol': 'ONGC', 'change': -2.3}
        ]
    }
    
    dashboard.display_market_overview(sample_market_data)
    
    # Placeholder for alert feed
    dashboard.display_alert_feed([
        {'symbol': 'BTC/USDT', 'recommendation': 'BUY', 'confidence': 0.8, 'urgency': 'HIGH', 'timestamp': '2026-03-19 12:00', 'reasoning': 'Momentum breakout confirmed.'}
    ])

if __name__ == "__main__":
    main()
