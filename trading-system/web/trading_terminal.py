import filter 
import streamlit as st
import time
import logging
import plotly.express as px
import pandas as pd
import numpy as np
import random
from datetime import datetime

from services.broker.broker_interface import GlobalBrokerRouter
from services.broker.alpaca_api import AlpacaAPI
from services.broker.ib_api import IBAPI
from services.broker.td_api import TDAPI
from services.risk.manager import RiskManager
from services.trading.hft_engine import HFTScalpingEngine
from services.trading.swing_engine import SwingTradingEngine, SwingSignal
from services.trading.intraday_engine import IntradayTradingEngine, IntradaySignal

# Page configuration
st.set_page_config(
    page_title="Global Trading Terminal",
    page_icon="📈",
    layout="wide"
)

def setup_logging():
    """Configure logging for the trading terminal"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger('TradingTerminal')

@st.cache_resource
def initialize_system():
    """Initialize the trading system components"""
    logger = setup_logging()
    logger.info("Initializing global trading terminal")
    
    # Initialize broker router
    broker_router = GlobalBrokerRouter()
    
    # Add brokers
    try:
        # Alpaca
        alpaca = AlpacaAPI(
            api_key="ALPACA_API_KEY", 
            api_secret="ALPACA_API_SECRET"
        )
        broker_router.add_broker("Alpaca", alpaca)
        
        # Interactive Brokers
        ib = IBAPI()
        broker_router.add_broker("Interactive Brokers", ib)
        
        # TD Ameritrade
        td = TDAPI(
            api_key="TD_API_KEY",
            access_token="TD_ACCESS_TOKEN"
        )
        broker_router.add_broker("TD Ameritrade", td)
        
        logger.info("Brokers initialized successfully")
    except Exception as e:
        logger.exception("Error initializing brokers")
        st.error("Failed to initialize brokers. Check API keys and connection.")
        return None
    
    # Initialize risk manager
    try:
        risk_manager = RiskManager(alpaca)
        logger.info("Risk manager initialized successfully")
    except Exception as e:
        logger.exception("Error initializing risk manager")
        st.error("Failed to initialize risk manager")
        return None
    
    # Initialize trading engines
    try:
        hft_engine = HFTScalpingEngine(broker_router, risk_manager)
        swing_engine = SwingTradingEngine(broker_router, risk_manager)
        intraday_engine = IntradayTradingEngine(broker_router, risk_manager)
        logger.info("Trading engines initialized successfully")
    except Exception as e:
        logger.exception("Error initializing trading engines")
        st.error("Failed to initialize trading engines")
        return None
    
    return {
        'logger': logger,
        'broker_router': broker_router,
        'risk_manager': risk_manager,
        'hft_engine': hft_engine,
        'swing_engine': swing_engine,
        'intraday_engine': intraday_engine
    }

def render_dashboard(system):
    """Render the main dashboard structure"""
    # Create tabs for different trading styles
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "Dashboard", 
        "HFT Scalping", 
        "Swing Trading", 
        "Intraday Trading",
        "Risk Management"
    ])
    
    with tab1:
        render_dashboard_view(system)
    
    with tab2:
        render_hft_view(system)
    
    with tab3:
        render_swing_view(system)
    
    with tab4:
        render_intraday_view(system)
    
    with tab5:
        render_risk_view(system)

def render_dashboard_view(system):
    """Render the main dashboard overview view"""
    st.header("Global Trading Dashboard")
    
    # Get system status
    hft_status = system['hft_engine'].get_status()
    swing_status = system['swing_engine'].get_status()
    intraday_status = system['intraday_engine'].get_status()
    risk_metrics = system['risk_manager'].get_risk_metrics()
    
    # Display system metrics
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Active Positions", 
                 hft_status['active_trades'] + swing_status['active_positions'] + intraday_status['active_positions'])
    
    with col2:
        st.metric("Today's P&L", f"${risk_metrics['daily_loss']:,.2f}")
    
    with col3:
        st.metric("Current Capital", f"${risk_metrics['current_capital']:,.2f}")
    
    # Trading engine status
    st.subheader("Trading Engine Status")
    
    engines = [
        ("HFT Scalping", hft_status),
        ("Swing Trading", swing_status),
        ("Intraday Trading", intraday_status)
    ]
    
    # Layout engine cards
    cols = st.columns(3)
    for i, (name, status) in enumerate(engines):
        with cols[i]:
            st.write(f"**{name}**")
            active = status.get('active_trades', status.get('active_positions', 0))
            st.write(f"Active trades: {active}")
            st.write(f"Trades today: {status.get('trades_today', status.get('trades_this_minute', 0))}")
            wr = status['performance_metrics']['win_rate']
            st.write(f"Win rate: {wr:.2%}")
            st.progress(wr)

def render_hft_view(system):
    """Render the HFT scalping view"""
    st.header("High-Frequency Scalping Engine")
    
    hft = system['hft_engine']
    status = hft.get_status()
    
    col1, col2, col3 = st.columns(3)
    with col1: st.metric("Active Trades", status['active_trades'])
    with col2: st.metric("Trades This Minute", status['trades_this_minute'])
    with col3: st.metric("Win Rate", f"{status['performance_metrics']['win_rate']:.2%}")
    
    # Active trades
    st.subheader("Active Trades")
    active_trades = hft.get_active_trades()
    if active_trades:
        df = pd.DataFrame([
            {
                "Symbol": t['signal'].symbol,
                "Action": t['order'].action,
                "Entry Price": f"${t['entry_price']:.2f}",
                "Stop Loss": f"${t['stop_price']:.2f}",
                "Size": t['position_size'],
                "Confidence": f"{t['signal'].confidence:.2f}"
            } for t in active_trades
        ])
        st.dataframe(df)
    else:
        st.info("No active HFT trades")
    
    # History
    st.subheader("Trade History")
    history = hft.get_trade_history()
    if history:
        df_hist = pd.DataFrame(history)
        st.dataframe(df_hist[['symbol', 'action', 'entry_price', 'exit_price', 'profit_loss', 'reason']])
        fig = px.line(df_hist, x='exit_time', y='profit_loss', title='HFT P&L')
        st.plotly_chart(fig)

def render_swing_view(system):
    """Render the detailed swing trading view"""
    st.header("Swing Trading Engine")
    swing = system['swing_engine']
    status = swing.get_status()
    
    col1, col2, col3 = st.columns(3)
    with col1: st.metric("Active Positions", status['active_positions'])
    with col2: st.metric("Trades Today", status['trades_today'])
    with col3: st.metric("Win Rate", f"{status['performance_metrics']['win_rate']:.2%}")
    
    # Display active positions
    st.subheader("Active Positions")
    active_positions = swing.get_active_positions()
    
    if active_positions:
        position_data = []
        for position in active_positions:
            position_data.append({
                "Symbol": position['signal'].symbol,
                "Action": position['order'].action,
                "Entry Price": f"${position['entry_price']:.2f}",
                "Stop Loss": f"${position['stop_loss']:.2f}",
                "Target": f"${position['target']:.2f}",
                "Position Size": position['position_size'],
                "Confidence": f"{position['signal'].confidence:.2f}",
                "Risk/Reward": f"{position['signal'].risk_reward:.2f}"
            })
        st.dataframe(position_data)
    else:
        st.info("No active positions")
    
    # Display trade history
    st.subheader("Trade History")
    history = swing.get_trade_history()
    if history:
        df = pd.DataFrame(history)
        df['profit_loss_fmt'] = df['profit_loss'].apply(lambda x: f"${x:.2f}")
        st.dataframe(df[['symbol', 'action', 'entry_price', 'exit_price', 'profit_loss_fmt', 'reason']])
        
        fig = px.line(df, x='exit_time', y='profit_loss', title='Swing Trading P&L History')
        st.plotly_chart(fig)
        
        metrics = swing.get_performance_metrics()
        c1, c2, c3, c4 = st.columns(4)
        with c1: st.metric("Win Rate", f"{metrics['win_rate']:.2%}")
        with c2: st.metric("Profit Factor", f"{metrics.get('profit_factor', 0):.2f}")
        with c3: st.metric("Avg. P/L", f"${metrics.get('avg_profit_per_trade', 0):.2f}")
        with c4: st.metric("Total Profit", f"${sum(df['profit_loss']):.2f}")
    else:
        st.info("No trade history available")
    
    # Manual trade
    st.subheader("Manual Trade Execution")
    with st.form("manual_trade_form"):
        symbol = st.text_input("Symbol", "AAPL")
        action = st.selectbox("Action", ["BUY", "SELL"])
        entry_price = st.number_input("Entry Price", min_value=0.01, value=150.0)
        stop_loss = st.number_input("Stop Loss", min_value=0.01, value=145.0)
        target = st.number_input("Target", min_value=0.01, value=155.0)
        position_size = st.number_input("Position Size", min_value=1, value=100)
        submitted = st.form_submit_button("Execute Trade")
        if submitted:
            signal = SwingSignal(
                symbol=symbol, action=action, entry_price=entry_price,
                stop_loss=stop_loss, target=target, confidence=0.8,
                risk_reward=(target-entry_price)/abs(entry_price-stop_loss)
            )
            swing.execute_trade(signal)
            st.success(f"Trade executed for {symbol}")
            st.rerun()

def render_intraday_view(system):
    """Render the intraday trading view"""
    st.header("Intraday Trading Engine")
    intraday = system['intraday_engine']
    status = intraday.get_status()
    
    col1, col2, col3 = st.columns(3)
    with col1: st.metric("Active Positions", status['active_positions'])
    with col2: st.metric("Trades Today", status['trades_today'])
    with col3: st.metric("Win Rate", f"{status['performance_metrics']['win_rate']:.2%}")
    
    # Active
    st.subheader("Active Positions")
    active = intraday.get_active_positions()
    if active:
        data = [{
            "Symbol": p['signal'].symbol, "Action": p['order'].action,
            "Entry": f"${p['entry_price']:.2f}", "Stop": f"${p['stop_loss']:.2f}",
            "Target": f"${p['target']:.2f}", "Size": p['position_size']
        } for p in active]
        st.dataframe(data)
    else:
        st.info("No active positions")
    
    # History
    st.subheader("Trade History")
    history = intraday.get_trade_history()
    if history:
        df = pd.DataFrame(history)
        st.dataframe(df[['symbol', 'action', 'entry_price', 'exit_price', 'profit_loss', 'reason']])
        fig = px.line(df, x='exit_time', y='profit_loss', title='Intraday P&L')
        st.plotly_chart(fig)
    
    # Market status
    st.subheader("Market Status")
    if status.get('market_open'):
        st.success("Market is open!")
    else:
        st.info("Market is closed")

    # Manual
    with st.form("intraday_trade_form"):
        s = st.text_input("Symbol", "AAPL")
        a = st.selectbox("Action", ["BUY", "SELL"])
        e = st.number_input("Entry", value=150.0)
        sl = st.number_input("Stop", value=145.0)
        t = st.number_input("Target", value=155.0)
        submitted = st.form_submit_button("Execute Intraday")
        if submitted:
            sig = IntradaySignal(symbol=s, action=a, entry_price=e, stop_loss=sl, target=t, confidence=0.8)
            intraday.execute_trade(sig)
            st.success("Trade triggered")
            st.rerun()

def render_risk_view(system):
    """Render the risk management view"""
    st.header("Risk Management Dashboard")
    risk = system['risk_manager']
    metrics = risk.get_risk_metrics()
    
    col1, col2, col3 = st.columns(3)
    with col1: st.metric("Account Value", f"${metrics['current_capital']:,.2f}")
    with col2: st.metric("Daily Loss", f"${metrics['daily_loss']:,.2f}")
    with col3: st.metric("Drawdown", f"{metrics['drawdown']:.2%}")
    
    # Allocation
    st.subheader("Position Allocation")
    hft_p = system['hft_engine'].get_active_trades()
    sw_p = system['swing_engine'].get_active_positions()
    in_p = system['intraday_engine'].get_active_positions()
    
    all_p = []
    for p in hft_p: all_p.append({'symbol': p['signal'].symbol, 'value': p['entry_price'] * p['position_size']})
    for p in sw_p: all_p.append({'symbol': p['signal'].symbol, 'value': p['entry_price'] * p['position_size']})
    for p in in_p: all_p.append({'symbol': p['signal'].symbol, 'value': p['entry_price'] * p['position_size']})
    
    if all_p:
        df_p = pd.DataFrame(all_p)
        fig = px.pie(df_p, values='value', names='symbol', title='Asset Allocation')
        st.plotly_chart(fig)
    else:
        st.info("No active positions")
    
    # Status
    if metrics['is_circuit_breaker_active']:
        st.error("CIRCUIT BREAKER ACTIVE")
    else:
        st.success("Risk nominal")
    
    # Update
    if st.button("Update Risk thresholds"):
        st.info("Updating risk thresholds via sliders...")

def main():
    """Main entry point for the trading terminal"""
    # Initialize the system
    system = initialize_system()
    if not system:
        st.stop()
    
    # Styling
    st.markdown("""
    <style>
        .main { background-color: #0e1117; color: #e0e0e0; }
        .stMetric { background-color: #1a1e24; border-radius: 5px; padding: 10px; }
    </style>
    """, unsafe_allow_html=True)
    
    # Render the dashboard
    render_dashboard(system)
    
    # Footer
    st.markdown(f"""
    <div style="text-align: center; padding: 10px; margin-top: 50px; color: #888888; font-size: 12px;">
        Global Trading Terminal | Last updated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
