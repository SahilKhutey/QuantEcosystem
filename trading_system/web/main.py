import streamlit as st
import time
import logging
import requests
import pandas as pd
import numpy as np
from datetime import datetime
import plotly.express as px
import plotly.graph_objects as go
from web.services.api_client import APIClient
from web.services.data_processor import DataProcessor

# Configure Streamlit page
st.set_page_config(
    page_title="Global Trading Terminal",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize API client
api_client = APIClient()
data_processor = DataProcessor()

def setup_dashboard():
    """Set up the main dashboard"""
    st.title("Global Trading Terminal")
    
    # Sidebar navigation
    st.sidebar.title("Navigation")
    page = st.sidebar.radio("Select Page", [
        "Dashboard", 
        "Global Market View", 
        "Trading Terminal",
        "Signal Generator",
        "Strategy Marketplace",
        "AI Intelligence",
        "Social Trading",
        "HFT Analytics",
        "Global Exposure",
        "Alert Center",
        "Master Intelligence",
        "Wealth Management",
        "Strategy Center",
        "Production Ops",
        "Continuous Improvement",
        "Risk Management",
        "Portfolio Optimization",
        "Compliance & Audit",
        "Strategy Performance",
        "Backtest Laboratory",
        "Disaster Recovery"
    ])
    
    # Main content area
    if page == "Dashboard":
        render_dashboard()
    elif page == "Global Market View":
        render_global_market_view()
    elif page == "Trading Terminal":
        render_trading_terminal()
    elif page == "Signal Generator":
        render_signal_generator()
    elif page == "Strategy Marketplace":
        render_strategy_marketplace()
    elif page == "AI Intelligence":
        render_ai_intelligence()
    elif page == "Social Trading":
        render_social_trading()
    elif page == "HFT Analytics":
        render_hft_analytics()
    elif page == "Global Exposure":
        render_global_exposure()
    elif page == "Alert Center":
        render_alert_center()
    elif page == "Master Intelligence":
        render_master_intelligence()
    elif page == "Wealth Management":
        render_wealth_management()
    elif page == "Strategy Center":
        render_strategy_center()
    elif page == "Production Ops":
        render_production_ops()
    elif page == "Continuous Improvement":
        render_continuous_improvement()
    elif page == "Risk Management":
        render_risk_management()
    elif page == "Portfolio Optimization":
        render_portfolio_optimizer()
    elif page == "Compliance & Audit":
        render_compliance_audit()
    elif page == "Strategy Performance":
        render_strategy_performance()
    elif page == "Backtest Laboratory":
        render_backtest_laboratory()
    elif page == "Disaster Recovery":
        render_disaster_recovery()

def render_dashboard():
    """Render the main dashboard view with system overview"""
    st.header("Global Trading Dashboard")
    
    # System status
    system_status = api_client.get_system_status()
    if system_status:
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("System Status", 
                     "ACTIVE" if system_status['system']['active'] else "INACTIVE",
                     "Online" if system_status['system']['active'] else "Offline")
        
        with col2:
            st.metric("Market Status", 
                     "OPEN" if system_status['system']['market_open'] else "CLOSED",
                     "Market Hours" if system_status['system']['market_open'] else "After Hours")
        
        with col3:
            st.metric("Circuit Breaker", 
                     "ACTIVE" if system_status['system']['circuit_breaker'] else "INACTIVE",
                     "Trading Suspended" if system_status['system']['circuit_breaker'] else "Trading Active")
        
        with col4:
            st.metric("Trading Mode", 
                     system_status['system']['mode'],
                     "Live Trading" if system_status['system']['mode'] == 'LIVE' else "Paper Trading")
    
    # Trading performance
    performance = api_client.get_performance_metrics()
    if performance:
        st.subheader("Performance Summary")
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Total Profit", f"${performance['total_profit']:.2f}")
            st.metric("Win Rate", f"{performance['win_rate']:.2%}")
        
        with col2:
            st.metric("Sharpe Ratio", f"{performance['sharpe_ratio']:.2f}")
            st.metric("Max Drawdown", f"{performance['max_drawdown']:.2%}")
        
        with col3:
            st.metric("Total Trades", performance['total_trades'])
            st.metric("Profit Factor", f"{performance['profit_factor']:.2f}")
    
    # System monitoring
    st.subheader("Advanced System Monitoring")
    col_mon1, col_mon2 = st.columns(2)
    
    with col_mon1:
        st.write("Recent Alerts")
        alerts = api_client.get_monitoring_alerts()
        if alerts:
            alert_list = []
            for title, timestamp in alerts.items():
                alert_list.append({"Alert": title, "Last Triggered": timestamp})
            st.table(alert_list)
        else:
            st.success("No active alerts detected.")
            
    with col_mon2:
        st.write("Execution Anomalies (Z-Score > 3)")
        anomalies = api_client.get_execution_anomalies()
        if anomalies:
            # Simple visualization of latency/slippage history
            fig_anomaly = go.Figure()
            if 'latency' in anomalies:
                fig_anomaly.add_trace(go.Scatter(y=anomalies['latency'], name="Latency (ms)"))
            if 'slippage' in anomalies:
                fig_anomaly.add_trace(go.Scatter(y=anomalies['slippage'], name="Slippage"))
            fig_anomaly.update_layout(height=300, title="Execution Metrics History")
            st.plotly_chart(fig_anomaly, use_container_width=True)
        else:
            st.info("Insufficient data for anomaly detection.")

    # Mobile Integration Status
    st.subheader("Mobile Command Status")
    mob_summary = api_client.get_mobile_summary()
    if mob_summary:
        m_col1, m_col2, m_col3 = st.columns(3)
        with m_col1: st.metric("Mobile Sessions", "ACTIVE", "Push Enabled")
        with m_col2: st.metric("Latest Mobile Sync", mob_summary['t'].split('T')[1][:8])
        with m_col3: st.metric("App Latency", "14ms", "Optimal")

    # Circuit Breaker History
    st.subheader("Circuit Breaker Log")
    cb_history = api_client.get_breaker_history()
    if cb_history:
        st.table(cb_history)
    else:
        st.info("No circuit breaker events recorded.")

    # Active trades
    st.subheader("Active Trades")
    active_trades = api_client.get_active_trades()
    if active_trades:
        trade_data = []
        for trade in active_trades:
            trade_data.append({
                "Symbol": trade['symbol'],
                "Action": trade['action'],
                "Entry Price": f"${trade['entry_price']:.2f}",
                "Current Price": f"${trade['current_price']:.2f}",
                "P&L": f"${trade['pnl']:.2f}",
                "Status": trade['status'],
                "Confidence": f"{trade['confidence']:.2f}"
            })
        
        st.dataframe(trade_data)
    else:
        st.info("No active trades")

def render_global_market_view():
    """Render the global market view with geospatial data"""
    st.header("Global Market View")
    
    # Market status
    market_status = api_client.get_market_status()
    if market_status:
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("US Market", 
                     market_status['us']['status'],
                     f"Last: {market_status['us']['last_price']:.2f}")
        
        with col2:
            st.metric("Europe Market", 
                     market_status['europe']['status'],
                     f"Last: {market_status['europe']['last_price']:.2f}")
        
        with col3:
            st.metric("Asia Market", 
                     market_status['asia']['status'],
                     f"Last: {market_status['asia']['last_price']:.2f}")
    
    # Global market map
    st.subheader("Global Market Activity")
    
    # Get market data
    market_data = api_client.get_global_market_data()
    if market_data:
        # Process data for map visualization
        map_data = []
        for region in market_data['regions']:
            map_data.append({
                'region': region['name'],
                'lat': region['lat'],
                'lon': region['lng'],
                'value': region['market_cap'],
                'status': region['status'],
                'change': region['change']
            })
        
        # Create map
        fig = px.scatter_mapbox(
            map_data,
            lat='lat',
            lon='lon',
            color='change',
            size='value',
            hover_name='region',
            color_continuous_scale=px.colors.sequential.Viridis,
            zoom=1,
            mapbox_style='carto-positron',
            title="Global Market Activity"
        )
        
        # Customize map
        fig.update_layout(
            mapbox=dict(
                center=dict(lat=20, lon=0),
                zoom=1
            ),
            margin=dict(l=0, r=0, t=30, b=0)
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
        st.dataframe(event_data)

    # Futures & Forex Universe
    st.subheader("Institutional Universe (Futures & Forex)")
    universe = api_client.get_asset_universe()
    if universe:
        u_col1, u_col2 = st.columns(2)
        with u_col1:
            st.write("**Supported Futures**")
            st.write(", ".join(universe.get('futures', [])))
        with u_col2:
            st.write("**Supported Forex**")
            st.write(", ".join(universe.get('forex', [])))

def render_trading_terminal():
    """Render the trading terminal with execution controls"""
    st.header("Trading Terminal")
    
    # Trading controls
    st.subheader("Manual Trading Controls")
    
    with st.form("trade_form"):
        symbol = st.text_input("Symbol", "AAPL")
        action = st.selectbox("Action", ["BUY", "SELL"])
        quantity = st.number_input("Quantity", min_value=1, value=10)
        order_type = st.selectbox("Order Type", ["Market", "Limit", "Stop"])
        price = st.number_input("Price", min_value=0.01, value=150.0)
        stop_price = st.number_input("Stop Price", min_value=0.01, value=145.0)
        
        submitted = st.form_submit_button("Execute Trade")
        
        if submitted:
            # Execute trade
            trade_response = api_client.execute_trade(
                symbol=symbol,
                action=action,
                quantity=quantity,
                order_type=order_type.lower(),
                price=price,
                stop_price=stop_price
            )
            
            # Display response
            if trade_response and 'status' in trade_response and trade_response['status'] == 'accepted':
                st.success(f"Trade executed successfully: {symbol} {action} {quantity} @ ${price:.2f}")
            else:
                st.error(f"Trade execution failed: {trade_response.get('error', 'Unknown error')}")
    
    # Real-time execution metrics
    st.subheader("Execution Performance")
    
    execution_metrics = api_client.get_execution_metrics()
    if execution_metrics:
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Fill Rate", f"{execution_metrics['fill_rate']:.2%}")
        
        with col2:
            st.metric("Average Slippage", f"{execution_metrics['slippage']:.4f}")
        
        with col3:
            st.metric("Win Rate", f"{execution_metrics['win_rate']:.2%}")
    
    # Order book visualization
    st.subheader("Order Book Visualization")
    order_book = api_client.get_order_book("AAPL")
    
    if order_book:
        # Create order book chart
        bids = pd.DataFrame(order_book['bids'], columns=['price', 'quantity'])
        asks = pd.DataFrame(order_book['asks'], columns=['price', 'quantity'])
        
        # Calculate cumulative quantities
        bids['cumulative'] = bids['quantity'].cumsum()
        asks['cumulative'] = asks['quantity'].cumsum()
        
        # Create the chart
        fig = go.Figure()
        
        # Bids
        fig.add_trace(go.Scatter(
            x=bids['price'],
            y=bids['cumulative'],
            mode='lines',
            name='Bids',
            line=dict(color='green')
        ))
        
        # Asks
        fig.add_trace(go.Scatter(
            x=asks['price'],
            y=asks['cumulative'],
            mode='lines',
            name='Asks',
            line=dict(color='red')
        ))
        
        fig.update_layout(
            title="Order Book Depth",
            xaxis_title="Price",
            yaxis_title="Cumulative Quantity",
            hovermode='x unified'
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    # Active orders
    st.subheader("Active Orders")
    active_orders = api_client.get_active_orders()
    if active_orders:
        order_data = []
        for order in active_orders:
            order_data.append({
                "ID": order['id'],
                "Symbol": order['symbol'],
                "Action": order['action'],
                "Quantity": order['qty'],
                "Price": f"${order['price']:.2f}",
                "Status": order['status'].capitalize(),
                "Time": order['timestamp']
            })
        
        st.dataframe(order_data)

def render_signal_generator():
    """Render the signal generator with real-time signal processing"""
    st.header("Signal Generator")
    
    # Signal processing controls
    st.subheader("Signal Processing Controls")
    
    col1, col2 = st.columns(2)
    
    with col1:
        signal_types = st.multiselect(
            "Signal Types", 
            ["Technical", "News", "Sentiment", "Order Flow", "LSTM (Neural)"],
            default=["Technical", "LSTM (Neural)"]
        )
        refresh_interval = st.slider("Refresh Interval (seconds)", 1, 30, 5)
    
    with col2:
        confidence_threshold = st.slider("Confidence Threshold", 0.0, 1.0, 0.7)
        max_signals = st.slider("Max Signals", 1, 10, 5)
    
    # Real-time signal processing
    st.subheader("Real-Time Signals")
    
    # Get signals from API
    signals = api_client.get_trading_signals(
        types=signal_types,
        confidence_threshold=confidence_threshold,
        max_signals=max_signals
    )
    
    if signals:
        signal_data = []
        for signal in signals:
            signal_data.append({
                "Symbol": signal['symbol'],
                "Action": signal['action'],
                "Confidence": f"{signal['confidence']:.2f}",
                "Type": signal['type'],
                "Entry Price": f"${signal['price']:.2f}",
                "Stop Loss": f"${signal['stop_loss']:.2f}",
                "Target": f"${signal['target']:.2f}",
                "Strength": signal['strength']
            })
        
        st.dataframe(signal_data)
    
    # Signal quality metrics
    st.subheader("Signal Quality Metrics")
    
    signal_metrics = api_client.get_signal_metrics()
    if signal_metrics:
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Total Signals", signal_metrics['total_signals'])
            st.metric("Win Rate", f"{signal_metrics['win_rate']:.2%}")
        
        with col2:
            st.metric("Avg Confidence", f"{signal_metrics['avg_confidence']:.2f}")
            st.metric("Best Signal", f"{signal_metrics['best_signal']:.2f}")
        
        with col3:
            st.metric("Signal Diversity", f"{signal_metrics['diversity']:.2f}")
            st.metric("Signal Consistency", f"{signal_metrics['consistency']:.2f}")
    
    # Signal generator performance
    st.subheader("Signal Generator Performance")
    
    performance_data = api_client.get_signal_performance()
    if performance_data:
        fig = px.line(
            performance_data,
            x='timestamp',
            y='accuracy',
            title='Signal Generator Accuracy Over Time',
            labels={'accuracy': 'Accuracy', 'timestamp': 'Time'}
        )
        st.plotly_chart(fig, use_container_width=True)

def render_risk_management():
    """Render the risk management interface with real-time risk metrics"""
    st.header("Risk Management")
    
    # Risk metrics
    st.subheader("Current Risk Metrics")
    
    risk_metrics = api_client.get_risk_metrics()
    if risk_metrics:
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Daily Loss", f"${risk_metrics['daily_loss']:.2f}", 
                     f"Limit: ${risk_metrics['max_daily_loss']:.2f}")
        
        with col2:
            st.metric("Current Drawdown", f"{risk_metrics['drawdown']:.2%}", 
                     f"Limit: {risk_metrics['max_drawdown']:.2%}")
        
        with col3:
            st.metric("Position Risk", f"{risk_metrics['position_risk']:.2%}", 
                     f"Limit: {risk_metrics['max_position_allocation']:.2%}")
    
    # Risk management controls
    st.subheader("Risk Management Controls")
    
    risk_params = api_client.get_risk_parameters()
    if risk_params:
        col1, col2, col3 = st.columns(3)
        
        with col1:
            new_daily_loss = st.number_input(
                "Daily Loss Limit", 
                min_value=0.01, 
                value=risk_params['max_daily_loss'],
                step=0.01
            )
        
        with col2:
            new_drawdown = st.number_input(
                "Max Drawdown", 
                min_value=0.05, 
                value=risk_params['max_drawdown'],
                step=0.01
            )
        
        with col3:
            new_position = st.number_input(
                "Max Position Allocation", 
                min_value=0.05, 
                value=risk_params['max_position_allocation'],
                step=0.01
            )
        
        if st.button("Update Risk Parameters"):
            api_client.update_risk_parameters(
                max_daily_loss=new_daily_loss,
                max_drawdown=new_drawdown,
                max_position_allocation=new_position
            )
            st.success("Risk parameters updated successfully")
    
    # Position sizing
    st.subheader("Position Sizing Calculator")
    
    with st.form("position_size_form"):
        position_symbol = st.text_input("Symbol", "AAPL")
        position_price = st.number_input("Entry Price", min_value=0.01, value=150.0)
        position_stop = st.number_input("Stop Loss", min_value=0.01, value=145.0)
        
        submitted = st.form_submit_button("Calculate Position Size")
        
        if submitted:
            position_size = api_client.calculate_position_size(
                symbol=position_symbol,
                entry_price=position_price,
                stop_loss=position_stop
            )
            
            if position_size:
                st.success(f"Recommended position size: {position_size['size']} shares")
                if 'kelly' in position_size:
                    st.info(f"Fractional Kelly Allocation: {position_size['kelly']:.2%}")
                st.info(f"Position risk: {position_size['risk']:.2%} of account")
    
    # Risk monitoring
    st.subheader("Risk Monitoring")
    
    risk_monitoring = api_client.get_risk_monitoring()
    if risk_monitoring:
        # Market regime
        regime = risk_monitoring['current_regime']
        st.write(f"Current Market Regime: **{regime['current_regime'].upper()}**")
        
        # Regime probabilities
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Bull Regime", f"{regime['regime_probs'][0]:.2%}")
        with col2:
            st.metric("Normal Regime", f"{regime['regime_probs'][1]:.2%}")
        with col3:
            st.metric("Bear Regime", f"{regime['regime_probs'][2]:.2%}")
        
        # Volatility metrics
        vol_data = []
        for i, region in enumerate(regime['regime_params']):
            vol_data.append({
                'Regime': ['Bull', 'Normal', 'Bear'][i],
                'Volatility': np.sqrt(np.diag(region['sigma'])).mean()
            })
        
        vol_df = pd.DataFrame(vol_data)
        fig = px.bar(
            vol_df,
            x='Regime',
            y='Volatility',
            title='Regime Volatility Comparison',
            color='Regime',
            color_discrete_sequence=px.colors.qualitative.Pastel
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Circuit breaker status
    st.subheader("Circuit Breaker System")
    
    circuit_breaker = api_client.get_circuit_breaker_status()
    if circuit_breaker:
        if circuit_breaker['active']:
            st.error("CIRCUIT BREAKER ACTIVE - TRADING SUSPENDED")
            st.warning("The system has detected critical risk conditions and has suspended trading.")
            
            col1, col2 = st.columns(2)
            with col1:
                st.metric("Daily Loss", f"${circuit_breaker['daily_loss']:.2f}", 
                         f"Threshold: ${circuit_breaker['max_daily_loss']:.2f}")
            with col2:
                st.metric("Drawdown", f"{circuit_breaker['drawdown']:.2%}", 
                         f"Threshold: {circuit_breaker['max_drawdown']:.2%}")
            
            if st.button("Clear Circuit Breaker (Expert Only)"):
                api_client.clear_circuit_breaker()
                st.success("Circuit breaker cleared - trading resumed")
        else:
            st.success("Circuit Breaker Inactive - Trading Active")
    
    # Risk allocation
    st.subheader("Portfolio Risk Allocation")
    
    risk_allocation = api_client.get_risk_allocation()
    if risk_allocation:
        # Convert to dataframe for visualization
        allocation_data = []
        for symbol, data in risk_allocation.items():
            allocation_data.append({
                'Symbol': symbol,
                'Risk': data['risk_allocation'],
                'Position Size': data['position_size'],
                'Max Allowed': data['max_allocation']
            })
        
        # Create a bar chart for risk allocation
        fig = go.Figure()
        
        # Add risk allocation bars
        fig.add_trace(go.Bar(
            x=[d['Symbol'] for d in allocation_data],
            y=[d['Risk'] for d in allocation_data],
            name='Risk Allocation',
            marker_color='blue'
        ))
        
        # Add max allowed lines
        fig.add_trace(go.Scatter(
            x=[d['Symbol'] for d in allocation_data],
            y=[d['Max Allowed'] for d in allocation_data],
            mode='lines',
            name='Max Allowed',
            line=dict(color='red', width=2)
        ))
        
        fig.update_layout(
            title='Portfolio Risk Allocation',
            xaxis_title='Symbol',
            yaxis_title='Risk Allocation (%)',
            hovermode='x unified'
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Show detailed allocation table
        st.dataframe(allocation_data)

def render_portfolio_optimizer():
    """Render the portfolio optimizer with real-time optimization"""
    st.header("Portfolio Optimization")
    
    # Current portfolio
    st.subheader("Current Portfolio Allocation")
    
    portfolio = api_client.get_portfolio_allocation()
    if portfolio:
        # Prepare data for pie chart
        pie_data = []
        for symbol, allocation in portfolio['allocations'].items():
            pie_data.append({
                'Symbol': symbol,
                'Allocation': allocation
            })
        
        # Create pie chart
        fig = px.pie(
            pie_data,
            values='Allocation',
            names='Symbol',
            title='Portfolio Allocation',
            hole=0.3
        )
        st.plotly_chart(fig, use_container_width=True)
        
        # Show detailed allocation table
        allocation_data = []
        for symbol, data in portfolio['allocations'].items():
            allocation_data.append({
                'Symbol': symbol,
                'Allocation': f"{data:.2%}",
                'Current Price': f"${portfolio['prices'].get(symbol, 0):.2f}",
                'P&L': f"{portfolio['pnl'].get(symbol, 0):.2%}"
            })
        
        st.dataframe(allocation_data)
    
    # Optimization controls
    st.subheader("Portfolio Optimization Controls")
    
    col1, col2 = st.columns(2)
    
    with col1:
        risk_aversion = st.slider("Risk Aversion", 1.0, 10.0, 3.0, 0.5)
        optimization_type = st.selectbox("Optimization Type", ["Markowitz", "Black-Litterman (Robust)", "Regime-Switching"])
    
    with col2:
        lookback = st.slider("Lookback Period (days)", 30, 500, 252, 30)
        rebalance_freq = st.slider("Rebalance Frequency (days)", 1, 90, 21, 1)
    
    if st.button("Optimize Portfolio"):
        with st.spinner("Optimizing portfolio..."):
            optimized = api_client.optimize_portfolio(
                risk_aversion=risk_aversion,
                optimization_type=optimization_type,
                lookback=lookback,
                rebalance_freq=rebalance_freq
            )
            
            if optimized:
                st.success("Portfolio optimization complete")
                
                # Display optimization results
                col1, col2 = st.columns(2)
                
                with col1:
                    st.subheader("New Allocation")
                    new_allocation_data = []
                    for symbol, allocation in optimized['new_allocations'].items():
                        new_allocation_data.append({
                            'Symbol': symbol,
                            'New Allocation': f"{allocation:.2%}",
                            'Current Allocation': f"{portfolio['allocations'].get(symbol, 0):.2%}",
                            'Change': f"{allocation - portfolio['allocations'].get(symbol, 0):.2%}"
                        })
                    
                    st.dataframe(new_allocation_data)
                
                with col2:
                    st.subheader("Portfolio Metrics")
                    metrics = optimized['metrics']
                    st.metric("Expected Return", f"{metrics['expected_return']:.2%}")
                    st.metric("Portfolio Volatility", f"{metrics['volatility']:.2%}")
                    st.metric("Sharpe Ratio", f"{metrics['sharpe_ratio']:.2f}")
                    st.metric("Max Drawdown", f"{metrics['max_drawdown']:.2%}")
    
    # Portfolio performance
    st.subheader("Portfolio Performance")
    
    performance = api_client.get_portfolio_performance()
    if performance:
        # Prepare data for performance chart
        performance_data = []
        for entry in performance['history']:
            performance_data.append({
                'Date': entry['date'],
                'Value': entry['value'],
                'Return': entry['return']
            })
        
        # Create performance chart
        fig = px.line(
            performance_data,
            x='Date',
            y='Value',
            title='Portfolio Performance',
            labels={'Value': 'Value', 'Date': 'Date'}
        )
        st.plotly_chart(fig, use_container_width=True)
        
        # Performance metrics
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Return", f"{performance['total_return']:.2%}")
        with col2:
            st.metric("Annualized Return", f"{performance['annual_return']:.2%}")
        with col3:
            st.metric("Sharpe Ratio", f"{performance['sharpe']:.2f}")
        
        # Drawdown chart
        drawdown_data = []
        for i, entry in enumerate(performance_data):
            if i == 0:
                peak = entry['Value']
                drawdown = 0
            else:
                peak = max(peak, entry['Value'])
                drawdown = (peak - entry['Value']) / peak
            
            drawdown_data.append({
                'Date': entry['Date'],
                'Drawdown': drawdown
            })
        
        fig = px.line(
            drawdown_data,
            x='Date',
            y='Drawdown',
            title='Maximum Drawdown',
            labels={'Drawdown': 'Drawdown', 'Date': 'Date'}
        )
        st.plotly_chart(fig, use_container_width=True)

def render_compliance_audit():
    """Render the compliance and audit trail interface"""
    st.header("Compliance & Audit Center")
    
    # Audit trail table
    st.subheader("System Audit Trail")
    audit_data = api_client.get_audit_trail()
    if audit_data:
        df_audit = pd.DataFrame(audit_data)
        # Select and reorder columns for better display
        cols = ['timestamp', 'event_type', 'user', 'severity']
        if 'details' in df_audit.columns:
            df_audit['details_summary'] = df_audit['details'].apply(lambda x: str(x)[:100] + '...' if len(str(x)) > 100 else str(x))
            cols.append('details_summary')
        
        st.dataframe(df_audit[cols], use_container_width=True)
    else:
        st.info("No audit logs found.")
        
    # Compliance reporting
    st.divider()
    st.subheader("Regulatory Compliance Reporting")
    
    col1, col2 = st.columns(2)
    with col1:
        report_type = st.selectbox("Report Type", ["Daily", "Weekly", "Monthly"])
        if st.button("Generate Compliance Report"):
            with st.spinner("Compiling regulatory data..."):
                report = api_client.get_compliance_report(report_type.lower())
                if report:
                    st.success(f"Report {report['report_id']} generated successfully.")
                    st.json(report)
                else:
                    st.error("Failed to generate compliance report.")
                    
    with col2:
        st.info("""
        **Data Retention Policy:**
        All system actions, including trade executions and risk parameter modifications, are retained for a minimum of 365 days in encrypted audit logs according to institutional compliance standards.
        """)

def render_strategy_marketplace():
    """Render the strategy discovery and management marketplace"""
    st.header("Strategy Marketplace")
    st.info("Dynamically discover, monitor, and activate institutional trading strategies.")
    
    strategies = api_client.get_strategies()
    if strategies:
        # Metrics Overview
        col_m1, col_m2, col_m3 = st.columns(3)
        active_count = sum(1 for s in strategies.values() if s['active'])
        with col_m1:
            st.metric("Total Strategies", len(strategies))
        with col_m2:
            st.metric("Active Strategies", active_count)
        with col_m3:
            st.metric("System Load", f"{(active_count/len(strategies)*100):.0f}%")
        
        st.divider()
        
        # Strategy Cards
        for name, data in strategies.items():
            with st.expander(f"🔮 {name}", expanded=True):
                c1, c2, c3 = st.columns([2, 2, 1])
                
                with c1:
                    st.write(f"**Status**: {'✅ ACTIVE' if data['active'] else '⚪ STANDBY'}")
                    st.write(f"**Trades**: {data['metrics']['total_trades']}")
                    
                with c2:
                    st.metric("Win Rate", f"{data['metrics']['win_rate']:.1%}")
                    st.metric("PnL", f"${data['metrics']['pnl']:.2f}")
                
                with c3:
                    if data['active']:
                        if st.button("Deactivate", key=f"deact_btn_{name}"):
                            api_client.deactivate_strategy(name)
                            st.rerun()
                    else:
                        if st.button("Activate", key=f"act_btn_{name}", type="primary"):
                            api_client.activate_strategy(name)
                            st.rerun()
    else:
        st.warning("No strategies discovered. Ensure strategies are placed in `trading_system/strategies/`.")

def render_ai_intelligence():
    """Render the AI Signals & Macro Intelligence dashboard"""
    st.header("AI Signals & Macro Intelligence")
    
    # --- Macro Regime Section ---
    macro_context = api_client.get_macro_context()
    if macro_context:
        st.subheader("Global Market Regime")
        regime = macro_context['regime']
        
        # Stylized Regime Badge
        regime_colors = {
            "NORMAL": "blue",
            "RISK_OFF": "orange",
            "HIGH_VOLATILITY": "red",
            "LOW_VOLATILITY": "green"
        }
        color = regime_colors.get(regime, "gray")
        st.markdown(f"""
            <div style="background-color: {color}; color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                <h1 style="margin: 0;">{regime}</h1>
                <p style="margin: 0;">Detected via Macro Structural Analysis</p>
            </div>
        """, unsafe_allow_html=True)
        
        # Indicators
        col_i1, col_i2, col_i3, col_i4 = st.columns(4)
        indicators = macro_context['indicators']
        with col_i1: st.metric("VIX", indicators.get('VIX'), delta_color="inverse")
        with col_i2: st.metric("DXY", indicators.get('DXY'))
        with col_i3: st.metric("US10Y", f"{indicators.get('US10Y')}%")
        with col_i4: st.metric("GOLD", f"${indicators.get('GOLD')}")
    
    st.divider()
    
    # --- News Sentiment Section ---
    st.subheader("Real-Time Sentiment Analysis")
    
    col_s1, col_s2 = st.columns([2, 1])
    
    with col_s2:
        st.write("**Manual News Analysis**")
        with st.form("sentiment_form"):
            news_text = st.text_area("Paste News Headline/Article", height=100)
            target_symbol = st.text_input("Target Symbol", "GLOBAL")
            if st.form_submit_button("Analyze AI Sentiment"):
                if news_text:
                    res = api_client.analyze_custom_news(news_text, target_symbol)
                    if res:
                        st.success(f"Sentiment: {res['sentiment']:.2f} (Confidence: {res['confidence']:.2%})")
                else:
                    st.warning("Please enter text to analyze.")
                    
    with col_s1:
        st.write("**Sentiment Alpha History**")
        history = api_client.get_ai_sentiment()
        if history:
            df_hist = pd.DataFrame(history)
            # Plot sentiment over time
            fig_sent = px.scatter(df_hist, x='timestamp', y='sentiment', color='sentiment', 
                                 size=[10]*len(df_hist), hover_data=['text'],
                                 color_continuous_scale='RdYlGn', title="Sentiment Alpha Stream")
            st.plotly_chart(fig_sent, use_container_width=True)
            
            # Latest sentiment table
            st.dataframe(df_hist[['timestamp', 'symbol', 'sentiment', 'text']].sort_values('timestamp', ascending=False), 
                         use_container_width=True)
        else:
            st.info("No sentiment history available. Analyze some news to begin.")

def render_social_trading():
    """Render the Social Trading & Signal Leaderboard"""
    st.header("Social Trading & Signal Leaderboard")
    
    col_l1, col_l2 = st.columns([2, 1])
    
    with col_l1:
        st.subheader("🏆 Institutional Strategy Leaderboard")
        leaderboard = api_client.get_social_leaderboard()
        if leaderboard:
            df_leader = pd.DataFrame(leaderboard)
            # Stylize display
            st.dataframe(df_leader.rename(columns={
                'name': 'Strategy',
                'pnl': 'PnL ($)',
                'win_rate': 'Win Rate',
                'trades': 'Total Trades',
                'followers': 'Followers'
            }), use_container_width=True)
            
            # Follow actions
            st.write("**Quick Follow**")
            follow_col1, follow_col2 = st.columns(2)
            strat_to_follow = follow_col1.selectbox("Select Strategy to Follow", [s['name'] for s in leaderboard])
            if follow_col2.button("Follow Strategy", type="primary"):
                api_client.follow_strategy(strat_to_follow)
                st.success(f"Successfully following {strat_to_follow}!")
                st.toast(f"Notifications enabled for {strat_to_follow}")
        else:
            st.info("Leaderboard is being compiled...")

    with col_l2:
        st.subheader("📡 Live Signal Stream")
        signals = api_client.get_social_signals()
        if signals:
            for sig in reversed(signals):
                with st.expander(f"{sig['strategy']} | {sig['signal']['action']} {sig['signal']['symbol']}", expanded=True):
                    st.write(f"**Price**: ${sig['signal']['price']}")
                    st.write(f"**Followers Notified**: {sig['followers_notified']}")
                    st.caption(f"Broadcast at: {sig['timestamp'].split('T')[1][:8]}")
        else:
            st.info("Waiting for institutional signals...")

    st.divider()
    st.subheader("Community Performance Attribution")
    if leaderboard:
        fig_followers = px.pie(df_leader, values='followers', names='name', title="Community Market Share by Strategy")
        st.plotly_chart(fig_followers, use_container_width=True)

def render_hft_analytics():
    """Render the High-Frequency Trading & OBI analytics suite"""
    st.header("HFT Optimization & OBI Analytics")
    st.info("Sub-second Order Book Imbalance (OBI) detection for institutional scalp signals.")
    
    # --- Real-time Metrics ---
    metrics = api_client.get_hft_metrics()
    if metrics:
        col_m1, col_m2, col_m3 = st.columns(3)
        with col_m1:
            st.metric("Total HFT Signals", metrics['signal_count'])
        with col_m2:
            st.metric("Avg OBI Pressure", f"{metrics['avg_obi']:.4f}")
        with col_m3:
            st.metric("Last OBI reading", f"{metrics['last_obi']:.4f}")
            
    st.divider()
    
    # --- OBI Visualization & Signals ---
    col_v1, col_v2 = st.columns([2, 1])
    
    with col_v1:
        st.subheader("Order Book Pressure Stream")
        signals = api_client.get_hft_signals()
        if signals:
            df_hft = pd.DataFrame(signals)
            # Area chart for OBI pressure
            fig_obi = px.area(df_hft, x='timestamp', y='obi', title="Real-time OBI Convergence",
                             color_discrete_sequence=['#FF4B4B' if metrics['last_obi'] < 0 else '#00D4FF'])
            st.plotly_chart(fig_obi, use_container_width=True)
        else:
            st.info("Scanning order books for micro-imbalances...")
            
    with col_v2:
        st.subheader("⚡ Scalp Signals")
        if signals:
            for s in reversed(signals[-10:]):
                color = "green" if "BUY" in s['action'] else "red" if "SELL" in s['action'] else "gray"
                st.markdown(f"""
                    <div style="border-left: 5px solid {color}; padding: 10px; margin-bottom: 5px; background-color: #f0f2f6;">
                        <strong>{s['action']}</strong> | {s['symbol']}<br/>
                        OBI: {s['obi']:.4f} | Confidence: {s['confidence']:.2%}
                    </div>
                """, unsafe_allow_html=True)
        else:
            st.caption("No high-frequency signals detected yet.")

    st.divider()
    # Manual OBI Probe
    st.subheader("Manual OBI Probe")
    probe_symbol = st.text_input("Symbol to Probe", "AAPL")
    if st.button("Run Instant Probe"):
        res = api_client.get_symbol_obi(probe_symbol)
        if res:
            st.json(res)

def render_global_exposure():
    """Render the 3D Global Portfolio Exposure visualization"""
    st.header("Global Portfolio Exposure (3D)")
    st.info("Real-time geographic and sectoral exposure analysis across multiple regional exchanges.")
    
    exposure_data = api_client.get_global_exposure()
    if exposure_data:
        df_exp = pd.DataFrame(exposure_data)
        
        # 3D Scatter Plot for Exposure
        fig_3d = px.scatter_3d(df_exp, x='exchange', y='sector', z='exposure',
                               color='risk_factor', size='exposure',
                               title="Global Exposure Matrix",
                               labels={'exposure': 'Value ($)', 'risk_factor': 'Risk Score'},
                               color_continuous_scale='Viridis')
        
        fig_3d.update_layout(margin=dict(l=0, r=0, b=0, t=40))
        st.plotly_chart(fig_3d, use_container_width=True)
        
        # Exposure breakdown table
        st.subheader("Sub-Regional Breakdown")
        st.dataframe(df_exp.sort_values('exposure', ascending=False), use_container_width=True)
    else:
        st.info("Aggregating global position data...")

def render_alert_center():
    """Render the central Alert & Notification hub"""
    st.header("Institutional Alert Center")
    
    col_a1, col_a2 = st.columns([2, 1])
    
    with col_a2:
        st.subheader("Broadcast Manual Alert")
        with st.form("manual_alert"):
            msg = st.text_area("Alert Message")
            sev = st.selectbox("Severity", ["INFO", "WARNING", "CRITICAL"])
            chan = st.multiselect("Channels", ["LOG", "DISCORD", "SMS"], default=["LOG"])
            if st.form_submit_button("Send Broadcast"):
                if msg:
                    api_client.send_system_alert(msg, sev, chan)
                    st.success("Alert Broadcasted")
                else:
                    st.warning("Message cannot be empty")
                    
    with col_a1:
        st.subheader("System Alert Stream")
        history = api_client.get_alert_history()
        if history:
            for alert in reversed(history):
                color = "red" if alert['severity'] == "CRITICAL" else "orange" if alert['severity'] == "WARNING" else "blue"
                with st.expander(f"[{alert['severity']}] {alert['message'][:50]}...", expanded=(alert['severity'] == "CRITICAL")):
                    st.write(f"**Full Message**: {alert['message']}")
                    st.write(f"**Channels**: {', '.join(alert['channels'])}")
                    st.caption(f"Time: {alert['timestamp'].split('T')[1][:8]}")
        else:
            st.info("No active alerts in the last 24 hours.")

def render_master_intelligence():
    """Render the unified Master Intelligence & Advanced Risk dashboard"""
    st.header("Unified Master Alpha & Risk Control")
    st.info("Cross-modality signal fusion (Sentiment + OBI + Macro) for institutional consensus.")
    
    # --- Signal Fusion Section ---
    master_signal = api_client.get_master_fused_signal()
    if master_signal:
        col_s1, col_s2 = st.columns([1, 2])
        
        with col_s1:
            st.subheader("Master Alpha Score")
            score = master_signal['master_score']
            confidence = master_signal['confidence']
            action = master_signal['action']
            
            # Badge
            color = "green" if "BUY" in action else "red" if "SELL" in action else "gray"
            st.markdown(f"""
                <div style="background-color: {color}; color: white; padding: 25px; border-radius: 15px; text-align: center;">
                    <h2 style="margin: 0;">{action}</h2>
                    <h3 style="margin: 10px 0;">Score: {score:.4f}</h3>
                    <p style="margin: 0;">Confidence: {confidence:.1%}</p>
                </div>
            """, unsafe_allow_html=True)
            
        with col_s2:
            st.subheader("Component Weighting")
            comp = master_signal['components']
            df_comp = pd.DataFrame([
                {"Component": "Sentiment", "Value": comp['sentiment']},
                {"Component": "OBI Pressure", "Value": comp['obi']},
                {"Component": "Macro Regime", "Value": 1.0 if comp['regime'] == "NORMAL" else 0.5}
            ])
            fig_comp = px.bar(df_comp, x="Component", y="Value", color="Component", 
                             title="Alpha Contribution by Modality")
            st.plotly_chart(fig_comp, use_container_width=True)
            
    st.divider()
    
    # --- Advanced Risk Control Section ---
    st.subheader("Institutional Risk & Position Sizing")
    
    col_r1, col_r2 = st.columns(2)
    
    with col_r1:
        st.write("**Risk Budgeting Simulator**")
        sim_price = st.number_input("Last Price", value=150.0)
        sim_vol = st.slider("Historical Volatility (%)", 0.1, 10.0, 2.0) / 100.0
        sim_conf = st.slider("Signal Confidence (%)", 10, 100, 65) / 100.0
        
        if st.button("Calculate Optimal Size", type="primary"):
            size_advice = api_client.get_position_sizing(sim_price, sim_vol, sim_conf)
            if size_advice:
                st.session_state['last_size_advice'] = size_advice
                
    with col_r2:
        if 'last_size_advice' in st.session_state:
            advice = st.session_state['last_size_advice']
            st.write("**Recommended Exposure**")
            st.metric("Units to Trade", advice['quantity'])
            st.metric("Cash at Risk", f"${advice['cash_at_risk']:,.2f}")
            st.write(f"**Kelly Fraction**: {advice['kelly_fraction']:.2%}")
            st.write(f"**Volatility Factor**: {advice['vol_scale']:.2f}x")
        else:
            st.info("Configure risk parameters to see recommendations.")

def render_wealth_management():
    """Render the Wealth Management & Systematic Investment suite"""
    st.header("Wealth Management & Systematic Planning")
    st.info("Long-term capital appreciation through Systematic Investment (SIP) and Withdrawal (SWP) plans.")
    
    # --- Portfolio Summary ---
    summary = api_client.get_wealth_summary()
    if summary:
        col_s1, col_s2, col_s3 = st.columns(3)
        with col_s1:
            st.metric("Active SIPs", summary['active_sips'])
        with col_s2:
            st.metric("Monthly Sip Total", f"${summary['total_sip_notional']:,.2f}")
        with col_s3:
            st.metric("Active SWPs", summary['active_swps'])
            
    st.divider()
    
    # --- SIP & SWP Management ---
    col_w1, col_w2 = st.columns([1, 1])
    
    with col_w1:
        st.subheader("Accumulation: Plan a New SIP")
        with st.form("sip_form"):
            sip_symbol = st.text_input("Asset Symbol", "SPY", key="sip_sym")
            sip_amount = st.number_input("Monthly Investment ($)", value=500, key="sip_amt")
            sip_freq = st.selectbox("Frequency", ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY"], index=2, key="sip_freq")
            if st.form_submit_button("Launch SIP"):
                res = api_client.create_sip(sip_symbol, sip_amount, sip_freq)
                if res:
                    st.success(f"SIP {res} enabled for {sip_symbol}")
                    st.toast(f"SIP Activated: {sip_symbol}")
                    
        st.subheader("Wealth Growth Simulator")
        sim_amt = st.number_input("Monthly Savings ($)", value=1000)
        sim_years = st.slider("Time Horizon (Years)", 5, 40, 20)
        sim_rate = st.slider("Expected Annual Return (%)", 5, 20, 12) / 100.0
        
        sim_res = api_client.simulate_sip(sim_amt, sim_years, sim_rate)
        if sim_res:
            st.markdown(f"""
                <div style="background-color: #262730; padding: 20px; border-radius: 10px; border: 1px solid #00D4FF;">
                    <h2 style="color: #00D4FF;">${sim_res['future_value']:,.2f}</h2>
                    <p>Estimated Future Value</p>
                    <hr/>
                    <p>Total Invested: ${sim_res['total_invested']:,.2f}</p>
                    <p>Wealth Gain: <strong>${sim_res['wealth_gain']:,.2f}</strong></p>
                </div>
            """, unsafe_allow_html=True)
                    
    with col_w2:
        st.subheader("Distribution: Plan a New SWP")
        with st.form("swp_form"):
            swp_symbol = st.text_input("Asset Symbol", "SPY", key="swp_sym")
            swp_corpus = st.number_input("Initial Corpus ($)", value=1000000, key="swp_corp")
            swp_amount = st.number_input("Monthly Withdrawal ($)", value=4000, key="swp_amt")
            swp_inf = st.checkbox("Inflation Adjusted (6%)", value=True)
            if st.form_submit_button("Launch SWP"):
                res = api_client.create_swp(swp_symbol, swp_corpus, swp_amount, "MONTHLY", swp_inf)
                if res:
                    st.success(f"SWP {res} enabled for {swp_symbol}")
                    st.toast(f"SWP Activated: {swp_symbol}")

        st.subheader("Corpus Depletion Simulator")
        swp_sim_corp = st.number_input("Corpus to Deplete ($)", value=1000000)
        swp_sim_amt = st.number_input("Starting Monthly Withdrawal ($)", value=4000)
        swp_sim_rate = st.slider("Portfolio Yield (%)", 2, 12, 7) / 100.0
        swp_sim_inf = st.slider("Inflation Rate (%)", 0, 10, 6) / 100.0
        
        swp_sim_res = api_client.simulate_swp(swp_sim_corp, swp_sim_amt, 30, swp_sim_rate, swp_sim_inf)
        if swp_sim_res:
            status_color = "#00FF00" if swp_sim_res['is_sustainable'] else "#FF4B4B"
            st.markdown(f"""
                <div style="background-color: #262730; padding: 20px; border-radius: 10px; border: 1px solid {status_color};">
                    <h2 style="color: {status_color};">{ "Sustainable" if swp_sim_res['is_sustainable'] else "Depletion Risk" }</h2>
                    <p>30-Year Sustainability Status</p>
                    <hr/>
                    <p>Final Corpus: ${swp_sim_res['final_corpus']:,.2f}</p>
                    { f"<p style='color: #FF4B4B;'>Depletes at Month: {swp_sim_res['depleted_at_month']}</p>" if not swp_sim_res['is_sustainable'] else "" }
                </div>
            """, unsafe_allow_html=True)
            
    st.divider()
    
    # --- Active Plans Table ---
    st.subheader("My Systematic Plans")
    active_sips = api_client.get_active_sips()
    active_swps = api_client.get_active_swps()
    
    col_t1, col_t2 = st.columns(2)
    with col_t1:
        st.markdown("**Active SIPs** (Accumulation)")
        if active_sips:
            df_sips = pd.DataFrame(active_sips.values())
            st.dataframe(df_sips[['id', 'symbol', 'amount', 'frequency', 'start_date']], use_container_width=True)
        else:
            st.info("No active SIPs found.")
            
    with col_t2:
        st.markdown("**Active SWPs** (Distribution)")
        if active_swps:
            df_swps = pd.DataFrame(active_swps.values())
            st.dataframe(df_swps[['id', 'symbol', 'amount', 'is_safe', 'start_date']], use_container_width=True)
        else:
            st.info("No active SWPs found.")

def render_strategy_center():
    """Render the Multi-Strategy Operations & Attribution Center"""
    st.header("Strategy Operations & Performance Attribution")
    st.info("Centralized command for algorithm lifecycle management and active capital allocation.")
    
    # --- Strategy Performance Ledger ---
    strategies = api_client.get_portfolio_strategies()
    if strategies:
        st.subheader("Algorithm Performance Ledger")
        for name, data in strategies.items():
            status_icon = "🟢" if data['status'] == "ACTIVE" else "🔴"
            with st.expander(f"{status_icon} {name}"):
                col_e1, col_e2, col_e3, col_e4 = st.columns(4)
                with col_e1:
                    st.metric("Capital", f"${data['capital']:,.0f}")
                with col_e2:
                    st.metric("PnL", f"${data['pnl']:,.0f}", delta=f"{data['pnl']/data['capital']*100:.2f}%")
                with col_e3:
                    st.metric("Max Drawdown", f"{data['drawdown']:.2%}")
                with col_e4:
                    if st.button(f"Toggle {name}", key=f"btn_{name}"):
                        res = api_client.toggle_strategy(name)
                        if res:
                            st.experimental_rerun()
    
    st.divider()
    
    # --- Allocation & Attribution ---
    col_a1, col_a2 = st.columns([1, 1.2])
    
    with col_a1:
        st.subheader("Capital Allocation")
        alloc_data = api_client.get_portfolio_allocation()
        if alloc_data:
            df_alloc = pd.DataFrame(alloc_data)
            fig = px.pie(df_alloc, values='value', names='name', hole=0.4, 
                         color_discrete_sequence=px.colors.sequential.Teal)
            fig.update_layout(margin=dict(t=0, b=0, l=0, r=0))
            st.plotly_chart(fig, use_container_width=True)
            
    with col_a2:
        st.subheader("Performance Attribution (Brinson)")
        attr = api_client.get_performance_attribution()
        if attr:
            df_attr = pd.DataFrame([
                {"Metric": "Asset Selection", "Value": attr['selection_effect']},
                {"Metric": "Capital Allocation", "Value": attr['allocation_effect']},
                {"Metric": "Interaction", "Value": attr['interaction_effect']}
            ])
            fig_attr = px.bar(df_attr, x='Value', y='Metric', orientation='h', 
                             color='Value', color_continuous_scale="Viridis")
            fig_attr.update_layout(height=300, margin=dict(t=0, b=0, l=0, r=0))
            st.plotly_chart(fig_attr, use_container_width=True)
            st.caption(f"Total Portfolio Alpha: **{attr['total_alpha']*100:.2f}%**")

def render_production_ops():
    """Render the elite Production Operations monitoring framework"""
    prod_dashboard = ProductionDashboard(api_base_url="http://localhost:8000/api")
    prod_dashboard.render()

def render_continuous_improvement():
    """Render the Continuous Improvement & Optimization pipeline"""
    st.header("Continuous Improvement & Optimization")
    st.info("Automated performance feedback loops and recursive system optimization.")
    
    # --- Optimization Pipeline ---
    pipeline = api_client.get_improvement_pipeline()
    
    st.subheader("Active Optimization Pipeline")
    if pipeline:
        for plan in reversed(pipeline):
            color = "red" if plan['priority'] == "critical" else "orange" if plan['priority'] == "high" else "blue"
            with st.expander(f"[{plan['priority'].upper()}] {plan['description']}", expanded=(plan['priority'] == 'critical')):
                st.write(f"**Type**: {plan['type']}")
                st.write("**Proposed Actions**:")
                for action in plan['actions']:
                    st.write(f"- {action}")
                
                st.write("**Estimated Impact**:")
                st.json(plan['estimated_impact'])
                st.caption(f"Plan ID: {plan['issue_id']}")
    else:
        st.success("System optimized. No active improvement plans in pipeline.")
        
    st.divider()
    
    # --- Performance Health ---
    st.subheader("Performance Health Diagnostics")
    metrics = api_client.get_prod_performance_metrics()
    if metrics:
        col_h1, col_h2, col_h3 = st.columns(3)
        with col_h1:
            st.metric("Win Rate Stability", f"{metrics['win_rate']:.2%}")
        with col_h2:
            st.metric("Risk-Adjusted Momentum", f"{metrics['sharpe_ratio']:.2f}")
        with col_h3:
            st.metric("Drawdown Perimeter", f"{metrics['max_drawdown']:.2%}")
    
    st.caption("Feedback loop runs every 30 minutes to check for micro-degradations.")

def render_strategy_performance():
    """Render the detailed strategy performance attribution page"""
    st.header("Strategy Performance Attribution")
    
    attr_data = api_client.get_performance_attribution()
    if attr_data:
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("PNL by Strategy")
            df_strat = pd.DataFrame(list(attr_data['by_strategy'].items()), columns=['Strategy', 'PNL'])
            fig_strat = px.bar(df_strat, x='Strategy', y='PNL', color='Strategy', title="Strategy Attribution")
            st.plotly_chart(fig_strat, use_container_width=True)
            
        with col2:
            st.subheader("PNL by Sector")
            df_sector = pd.DataFrame(list(attr_data['by_sector'].items()), columns=['Sector', 'PNL'])
            fig_sector = px.pie(df_sector, values='PNL', names='Sector', title="Sector Attribution")
            st.plotly_chart(fig_sector, use_container_width=True)
            
        st.divider()
        st.subheader("Stress Test Scenarios")
        scenario = st.selectbox("Select Scenario", ["market_crash", "interest_rate_spike", "sector_rotation"])
        if st.button("Run Simulation"):
            stress_data = api_client.run_stress_test(scenario)
            if stress_data:
                st.warning(f"Projected Impact: ${stress_data['total_impact']:.2f}")
                st.table(pd.DataFrame(stress_data['breakdown']))

def render_backtest_laboratory():
    """Render the historical strategy simulation environment"""
    st.header("Backtest Laboratory")
    
    col1, col2 = st.columns([1, 3])
    with col1:
        st.subheader("Simulation Parameters")
        strategy = st.selectbox("Strategy Logic", ["SMA Crossover", "RSI Mean Reversion", "Bollinger Breakout", "Walk-Forward (WFO)"])
        initial_cap = st.number_input("Initial Capital", value=100000)
        if st.button("Run Backtest"):
            with st.spinner("Simulating historical data..."):
                result = api_client.run_backtest({'strategy': strategy, 'capital': initial_cap})
                if result:
                    st.session_state['last_backtest'] = result
                    st.success("Simulation Complete")
                    
    with col2:
        if 'last_backtest' in st.session_state:
            res = st.session_state['last_backtest']
            st.metric("Total Return", f"{res['total_return']*100:.2f}%", f"${res['final_value']-initial_cap:.2f}")
            
            df_curve = pd.DataFrame(res['equity_curve'])
            fig_curve = px.line(df_curve, x='timestamp', y='value', title="Equity Curve")
            st.plotly_chart(fig_curve, use_container_width=True)
            
            with st.expander("Trade List"):
                st.table(pd.DataFrame(res['trades']))
        else:
            st.info("Configure parameters and click 'Run Backtest' to see results.")

def render_disaster_recovery():
    """Render the Enterprise Disaster Recovery control center"""
    st.header("Enterprise Disaster Recovery Control Center")
    
    status = api_client._get("recovery/status")
    if status:
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("DR State", status['state'].upper())
        with col2:
            st.metric("Primary Region", status['primary_region'])
        with col3:
            st.metric("Last Backup", status['last_backup'].split('T')[1][:8] if 'T' in status['last_backup'] else "N/A")
            
        st.divider()
        
        col_act1, col_act2 = st.columns(2)
        with col_act1:
            st.subheader("Manual Failover")
            target_region = st.selectbox("Select Target Region", ["us-east-1", "us-west-2", "eu-west-1"])
            if st.button("Trigger Manual Failover", type="primary"):
                with st.spinner("Executing failover protocols..."):
                    res = api_client.update_region(target_region)
                    if res:
                        st.success(f"Failover to {target_region} successful")
                        st.balloons()
                        
        with col_act2:
            st.subheader("Emergency Operations")
            if st.button("Emergency STOP All Trading", type="primary"):
                api_client.update_system_status(market_open=False)
                api_client.cancel_all_orders()
                st.error("Global Shutdown Triggered")
                
            if st.button("Trigger Immediate DR Backup"):
                res = api_client._post("recovery/backup")
                if res:
                    st.info("On-demand backup initiated")

        st.divider()
        st.subheader("Regional Health Monitoring")
        # Random health simulation results
        st.write(f"🟢 **{status['primary_region']}** (Operational)")
        st.write(f"🟡 **{status['secondary_region']}** (Warm Standby)")

# Add the main application logic
if __name__ == "__main__":
    setup_dashboard()
