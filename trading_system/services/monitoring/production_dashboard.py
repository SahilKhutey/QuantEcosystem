import streamlit as st
import time
import logging
import requests
from datetime import datetime, timedelta
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd

class ProductionDashboard:
    """Real-time production monitoring dashboard for live trading operations"""
    
    def __init__(self, api_base_url="http://localhost:8000/api"):
        self.api_base_url = api_base_url
        self.logger = logging.getLogger("ProductionDashboard")
    
    def render(self):
        """Render the production monitoring dashboard"""
        st.title("Global Trading Terminal - Production Operations")
        
        # System status
        self._render_system_status()
        
        # Risk management
        self._render_risk_monitoring()
        
        # Performance metrics
        self._render_performance_metrics()
        
        # Execution quality
        self._render_execution_quality()
        
        # Compliance status
        self._render_compliance_status()
        
        # System health
        self._render_system_health()
    
    def _get_system_status(self):
        """Get current system status from API"""
        try:
            response = requests.get(
                f"{self.api_base_url}/system/status",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Error getting system status: {str(e)}")
        return None
    
    def _get_risk_metrics(self):
        """Get current risk metrics from API"""
        try:
            response = requests.get(
                f"{self.api_base_url}/risk/metrics",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Error getting risk metrics: {str(e)}")
        return None
    
    def _get_performance_metrics(self):
        """Get current performance metrics from API"""
        try:
            response = requests.get(
                f"{self.api_base_url}/system/performance",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Error getting performance metrics: {str(e)}")
        return None
    
    def _get_execution_metrics(self):
        """Get current execution metrics from API"""
        try:
            response = requests.get(
                f"{self.api_base_url}/trading/execution-metrics",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Error getting execution metrics: {str(e)}")
        return None
    
    def _get_compliance_status(self):
        """Get current compliance status from API"""
        try:
            response = requests.get(
                f"{self.api_base_url}/compliance/status",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Error getting compliance status: {str(e)}")
        return None
    
    def _get_system_health(self):
        """Get current system health from API"""
        try:
            response = requests.get(
                f"{self.api_base_url}/monitoring/health",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Error getting system health: {str(e)}")
        return None
    
    def _render_system_status(self):
        """Render the system status section"""
        st.header("System Status")
        
        status = self._get_system_status()
        if not status:
            st.error("System status unavailable - check connectivity")
            return
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            active = status['system']['active']
            status_text = "ACTIVE" if active else "INACTIVE"
            status_color = "normal" if active else "inverse"
            st.metric("System Status", status_text)
        
        with col2:
            market_open = status['system']['market_open']
            status_text = "OPEN" if market_open else "CLOSED"
            st.metric("Market Status", status_text)
        
        with col3:
            circuit_breaker = status['system']['circuit_breaker']
            status_text = "ACTIVE" if circuit_breaker else "INACTIVE"
            st.metric("Circuit Breaker", status_text)
        
        with col4:
            current_mode = status['system']['mode']
            st.metric("Trading Mode", current_mode)
    
    def _render_risk_monitoring(self):
        """Render the risk monitoring section"""
        st.header("Risk Monitoring")
        
        metrics = self._get_risk_metrics()
        if not metrics:
            st.error("Risk metrics unavailable")
            return
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            daily_loss = metrics['daily_loss']
            max_daily_loss = metrics['max_daily_loss']
            percentage = (daily_loss / max_daily_loss) * 100 if max_daily_loss > 0 else 0
            st.metric("Daily Loss", f"${daily_loss:,.2f}", f"Limit: ${max_daily_loss:,.2f}")
            self._render_gauge(percentage, "Daily Loss (%)", 100)
        
        with col2:
            drawdown = metrics['drawdown']
            max_drawdown = metrics['max_drawdown']
            percentage = (drawdown / max_drawdown) * 100 if max_drawdown > 0 else 0
            st.metric("Current Drawdown", f"{drawdown:.2%}", f"Limit: {max_drawdown:.2%}")
            self._render_gauge(percentage, "Drawdown (%)", 100)
        
        with col3:
            position_risk = metrics['position_risk']
            max_position_risk = metrics['max_position_allocation']
            percentage = (position_risk / max_position_risk) * 100 if max_position_risk > 0 else 0
            st.metric("Position Risk", f"{position_risk:.2%}", f"Limit: {max_position_risk:.2%}")
            self._render_gauge(percentage, "Position Risk (%)", 100)
    
    def _render_gauge(self, value, title, max_val):
        """Render a gauge chart for risk metrics"""
        fig = go.Figure(go.Indicator(
            mode = "gauge+number",
            value = value,
            domain = {'x': [0, 1], 'y': [0, 1]},
            title = {'text': title, 'font': {'size': 24}},
            gauge = {
                'axis': {'range': [None, max_val], 'tickwidth': 1, 'tickcolor': "darkblue"},
                'bar': {'color': "#00D4FF"},
                'bgcolor': "white",
                'borderwidth': 2,
                'bordercolor': "gray",
                'steps': [
                    {'range': [0, 70], 'color': 'rgba(0, 255, 0, 0.3)'},
                    {'range': [70, 90], 'color': 'rgba(255, 255, 0, 0.3)'},
                    {'range': [90, 100], 'color': 'rgba(255, 0, 0, 0.3)'}],
                'threshold': {
                    'line': {'color': "red", 'width': 4},
                    'thickness': 0.75,
                    'value': 90}}))
        
        fig.update_layout(height=250, margin=dict(l=20, r=20, t=30, b=20))
        st.plotly_chart(fig, use_container_width=True)
    
    def _render_performance_metrics(self):
        """Render the performance metrics section"""
        st.header("Performance Metrics")
        
        metrics = self._get_performance_metrics()
        if not metrics:
            st.error("Performance metrics unavailable")
            return
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Total Profit", f"${metrics['total_profit']:,.2f}")
            st.metric("Win Rate", f"{metrics['win_rate']:.2%}")
        
        with col2:
            st.metric("Sharpe Ratio", f"{metrics['sharpe_ratio']:.2f}")
            st.metric("Max Drawdown", f"{metrics['max_drawdown']:.2%}")
        
        with col3:
            st.metric("Total Trades", metrics['total_trades'])
            st.metric("Profit Factor", f"{metrics['profit_factor']:.2f}")
        
        # Performance chart
        st.subheader("Performance History")
        performance_data = self._get_performance_history()
        
        if performance_data:
            df_perf = pd.DataFrame(performance_data)
            fig = px.line(
                df_perf,
                x='date',
                y='value',
                title='Portfolio Value History',
                labels={'value': 'Value', 'date': 'Date'}
            )
            fig.update_traces(line_color='#00D4FF')
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No performance history available")
    
    def _get_performance_history(self):
        """Get performance history for charting"""
        try:
            response = requests.get(
                f"{self.api_base_url}/system/performance/history",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Error getting performance history: {str(e)}")
        return []
    
    def _render_execution_quality(self):
        """Render the execution quality section"""
        st.header("Execution Quality")
        
        metrics = self._get_execution_metrics()
        if not metrics:
            st.error("Execution metrics unavailable")
            return
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Fill Rate", f"{metrics['fill_rate']:.2%}")
            st.metric("Order Processing Time", f"{metrics['order_processing_time']:.2f}s")
        
        with col2:
            st.metric("Slippage", f"{metrics['slippage']:.4f}")
            st.metric("Execution Quality Score", f"{metrics['quality_score']:.2f}")
        
        with col3:
            st.metric("Order Success Rate", f"{metrics['success_rate']:.2%}")
            st.metric("Average P&L per Trade", f"${metrics['avg_profit_per_trade']:.2f}")
        
        # Order book visualization
        st.subheader("Real-time Order Book")
        order_book = self._get_order_book("AAPL")
        
        if order_book:
            self._render_order_book(order_book)
        else:
            st.info("Order book data unavailable")
    
    def _get_order_book(self, symbol):
        """Get order book data for a symbol"""
        try:
            response = requests.get(
                f"{self.api_base_url}/trading/order-book/{symbol}",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Error getting order book: {str(e)}")
        return None
    
    def _render_order_book(self, order_book):
        """Render order book visualization"""
        if 'bids' in order_book and 'asks' in order_book:
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
                line=dict(color='green', width=3),
                fill='tozeroy'
            ))
            
            # Asks
            fig.add_trace(go.Scatter(
                x=asks['price'],
                y=asks['cumulative'],
                mode='lines',
                name='Asks',
                line=dict(color='red', width=3),
                fill='tozeroy'
            ))
            
            fig.update_layout(
                title="Order Book Depth",
                xaxis_title="Price",
                yaxis_title="Cumulative Quantity",
                hovermode='x unified',
                template="plotly_dark"
            )
            
            st.plotly_chart(fig, use_container_width=True)
    
    def _render_compliance_status(self):
        """Render the compliance status section"""
        st.header("Compliance Status")
        
        status = self._get_compliance_status()
        if not status:
            st.error("Compliance status unavailable")
            return
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Last Audit", status['last_audit'])
            st.metric("Compliance Score", f"{status['compliance_score']:.2f}/100")
        
        with col2:
            st.metric("Active Policies", status['active_policies'])
            st.metric("Pending Issues", status['pending_issues'])
        
        with col3:
            st.metric("Next Audit Due", status['next_audit_due'])
            st.metric("Regulatory Changes", status['regulatory_changes'])
    
    def _render_system_health(self):
        """Render the system health section"""
        st.header("System Health")
        
        health = self._get_system_health()
        if not health:
            st.error("System health data unavailable")
            return
        
        # System health metrics
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("API Latency", f"{health['api_latency']:.2f}ms", f"Target: <200ms")
            st.metric("Error Rate", f"{health['error_rate']:.2%}", f"Target: <0.1%")
        
        with col2:
            st.metric("Data Freshness", f"{health['data_freshness']:.1f}s", f"Target: <5s")
            st.metric("System Uptime", f"{health['uptime']:.2%}", "100% target")
        
        with col3:
            st.metric("Memory Usage", f"{health['memory_usage']:.2f}GB", "Max: 8GB")
            st.metric("CPU Load", f"{health['cpu_load']:.1f}%", "Max: 70%")
        
        # Health timeline
        st.subheader("System Health Timeline")
        health_data = self._get_health_timeline()
        
        if health_data:
            fig = go.Figure()
            
            # Add health status timeline
            fig.add_trace(go.Scatter(
                x=health_data['timestamps'],
                y=health_data['health_scores'],
                mode='lines+markers',
                name='System Health',
                line=dict(color='#00D4FF', width=2),
                marker=dict(size=8, color='#FF4B4B')
            ))
            
            fig.update_layout(
                title="System Health Score (24h Window)",
                xaxis_title="Time",
                yaxis_title="Health Score (0-100)",
                template="plotly_dark"
            )
            
            st.plotly_chart(fig, use_container_width=True)
    
    def _get_health_timeline(self):
        """Get system health timeline data"""
        try:
            response = requests.get(
                f"{self.api_base_url}/monitoring/health-timeline",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            self.logger.error(f"Error getting health timeline: {str(e)}")
        return None
