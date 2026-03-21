import streamlit as st
import pandas as pd
import numpy as np
import time
import datetime
import plotly.express as px
import plotly.graph_objects as go
from data_engine.data_aggregator import DataAggregator
from config.settings import API_KEYS
import random

def real_time_monitoring_dashboard():
    """Real-time monitoring dashboard for data quality and system health"""
    
    # Page configuration
    st.set_page_config(
        page_title="Real-Time Data Monitoring",
        page_icon="📈",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Initialize data aggregator
    aggregator = DataAggregator(API_KEYS)
    
    # Custom CSS for enhanced UI
    st.markdown("""
    <style>
    .metric-card {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 10px;
        padding: 20px;
        margin: 10px 0;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .metric-title {
        font-size: 14px;
        color: #999;
        margin-bottom: 5px;
    }
    .metric-value {
        font-size: 24px;
        font-weight: bold;
        color: #00cc66;
    }
    .metric-status {
        font-size: 12px;
        margin-top: 5px;
    }
    .status-card {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 10px;
        padding: 15px;
        margin: 15px 0;
    }
    .data-quality-plot {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 10px;
        padding: 15px;
        margin: 15px 0;
    }
    .alert-item {
        background: #2a2a2a;
        border-left: 4px solid #ff3333;
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Main title and description
    st.title("📈 Real-Time Data Monitoring")
    st.markdown("Comprehensive dashboard for monitoring data quality, system health, and market status")
    
    # Create tabs for different monitoring views
    tab1, tab2, tab3, tab4 = st.tabs([
        "Data Quality", 
        "System Health", 
        "Market Status", 
        "Alerts"
    ])
    
    # Data Quality Tab
    with tab1:
        data_quality_monitoring(aggregator)
    
    # System Health Tab
    with tab2:
        system_health_monitoring(aggregator)
    
    # Market Status Tab
    with tab3:
        market_status_monitoring(aggregator)
    
    # Alerts Tab
    with tab4:
        alert_monitoring(aggregator)

def data_quality_monitoring(aggregator):
    """Monitor data quality metrics"""
    st.header("Data Quality Dashboard")
    
    # Data freshness section
    st.subheader("Data Freshness")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">AAPL Data Freshness</div>
            <div class="metric-value">5 minutes</div>
            <div class="metric-status" style="color: #00cc66;">Healthy</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">EUR/USD Data Freshness</div>
            <div class="metric-value">3 minutes</div>
            <div class="metric-status" style="color: #00cc66;">Healthy</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">GDP Data Freshness</div>
            <div class="metric-value">7 days</div>
            <div class="metric-status" style="color: #ffcc00;">Acceptable</div>
        </div>
        """, unsafe_allow_html=True)
    
    # Data quality metrics
    st.subheader("Data Quality Metrics")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Missing data percentage
        st.markdown("""
        <div class="data-quality-plot">
            <h3 style="margin-top: 0;">Missing Data Percentage</h3>
        </div>
        """, unsafe_allow_html=True)
        
        # Generate mock data for missing data percentage
        metrics = {
            'AAPL': 0.2,
            'MSFT': 0.1,
            'TSLA': 0.5,
            'EUR/USD': 0.3,
            'GDP': 1.2,
            'Inflation': 0.8,
            'News': 0.1
        }
        
        fig = go.Figure()
        fig.add_trace(go.Bar(
            x=list(metrics.keys()),
            y=list(metrics.values()),
            marker_color=['#00cc66' if v < 0.5 else '#ffcc00' if v < 1.5 else '#ff3333' for v in metrics.values()]
        ))
        
        fig.update_layout(
            height=300,
            margin=dict(l=50, r=50, t=30, b=50),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#ccc'),
            yaxis_title='Percentage',
            xaxis_tickangle=-45
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        # Data consistency
        st.markdown("""
        <div class="data-quality-plot">
            <h3 style="margin-top: 0;">Data Consistency</h3>
        </div>
        """, unsafe_allow_html=True)
        
        # Generate mock data for data consistency
        metrics = {
            'AAPL': 0.99,
            'MSFT': 0.98,
            'TSLA': 0.95,
            'EUR/USD': 0.97,
            'GDP': 0.99,
            'Inflation': 0.98,
            'News': 0.96
        }
        
        fig = go.Figure()
        fig.add_trace(go.Bar(
            x=list(metrics.keys()),
            y=[v * 100 for v in metrics.values()],
            marker_color=['#00cc66' if v > 0.97 else '#ffcc00' if v > 0.95 else '#ff3333' for v in metrics.values()]
        ))
        
        fig.update_layout(
            height=300,
            margin=dict(l=50, r=50, t=30, b=50),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#ccc'),
            yaxis_title='Percentage',
            yaxis_range=[80, 100],
            xaxis_tickangle=-45
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    # Data quality over time
    st.subheader("Data Quality Over Time")
    
    # Generate mock data for data quality over time
    dates = [datetime.datetime.now() - datetime.timedelta(days=x) for x in range(30, 0, -1)]
    data_quality = [95 + random.uniform(-2, 2) for _ in range(30)]
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=dates,
        y=data_quality,
        mode='lines+markers',
        line=dict(color='#00cc66', width=2),
        marker=dict(size=6)
    ))
    
    fig.add_hrect(y0=90, y1=100, line_width=0, fillcolor="#00cc66", opacity=0.1)
    fig.add_hrect(y0=85, y1=90, line_width=0, fillcolor="#ffcc00", opacity=0.1)
    fig.add_hrect(y0=0, y1=85, line_width=0, fillcolor="#ff3333", opacity=0.1)
    
    fig.update_layout(
        height=300,
        margin=dict(l=50, r=50, t=30, b=50),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='#ccc'),
        yaxis_title='Data Quality (%)',
        xaxis_title='Date'
    )
    
    st.plotly_chart(fig, use_container_width=True)

def system_health_monitoring(aggregator):
    """Monitor system health metrics"""
    st.header("System Health Dashboard")
    
    # System metrics
    st.subheader("System Metrics")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">Data Pipeline Status</div>
            <div class="metric-value">Running</div>
            <div class="metric-status" style="color: #00cc66;">Healthy</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">Uptime</div>
            <div class="metric-value">99.95%</div>
            <div class="metric-status" style="color: #00cc66;">Healthy</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">API Request Rate</div>
            <div class="metric-value">4.2/s</div>
            <div class="metric-status" style="color: #00cc66;">Optimal</div>
        </div>
        """, unsafe_allow_html=True)
    
    # API usage
    st.subheader("API Usage")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        <div class="data-quality-plot">
            <h3 style="margin-top: 0;">API Request Rate</h3>
        </div>
        """, unsafe_allow_html=True)
        
        # Generate mock data for API request rate
        times = [datetime.datetime.now() - datetime.timedelta(minutes=x) for x in range(60, 0, -1)]
        request_rates = [4.2 + random.uniform(-1, 1) for _ in range(60)]
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=times,
            y=request_rates,
            mode='lines',
            line=dict(color='#00cc66', width=2)
        ))
        
        fig.add_hrect(y0=5.5, y1=10, line_width=0, fillcolor="#ff3333", opacity=0.1)
        fig.add_hrect(y0=4.5, y1=5.5, line_width=0, fillcolor="#ffcc00", opacity=0.1)
        
        fig.update_layout(
            height=300,
            margin=dict(l=50, r=50, t=30, b=50),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#ccc'),
            yaxis_title='Requests/s',
            xaxis_title='Time'
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.markdown("""
        <div class="data-quality-plot">
            <h3 style="margin-top: 0;">API Usage Percentage</h3>
        </div>
        """, unsafe_allow_html=True)
        
        # Generate mock data for API usage
        api_sources = {
            'Alpha Vantage': 75,
            'Yahoo Finance': 60,
            'GDELT': 30,
            'News API': 45
        }
        
        fig = go.Figure()
        fig.add_trace(go.Pie(
            labels=list(api_sources.keys()),
            values=list(api_sources.values()),
            hole=0.3,
            marker_colors=['#00cc66', '#007acc', '#ffcc00', '#ff3333']
        ))
        
        fig.update_layout(
            height=300,
            margin=dict(l=50, r=50, t=30, b=50),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#ccc'),
            showlegend=True
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    # System resource usage
    st.subheader("System Resource Usage")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        <div class="data-quality-plot">
            <h3 style="margin-top: 0;">CPU Usage</h3>
        </div>
        """, unsafe_allow_html=True)
        
        # Generate mock data for CPU usage
        times = [datetime.datetime.now() - datetime.timedelta(minutes=x) for x in range(60, 0, -1)]
        cpu_usage = [65 + random.uniform(-10, 10) for _ in range(60)]
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=times,
            y=cpu_usage,
            mode='lines',
            line=dict(color='#00cc66', width=2)
        ))
        
        fig.add_hrect(y0=80, y1=100, line_width=0, fillcolor="#ff3333", opacity=0.1)
        fig.add_hrect(y0=60, y1=80, line_width=0, fillcolor="#ffcc00", opacity=0.1)
        
        fig.update_layout(
            height=300,
            margin=dict(l=50, r=50, t=30, b=50),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#ccc'),
            yaxis_title='CPU Usage (%)',
            xaxis_title='Time'
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.markdown("""
        <div class="data-quality-plot">
            <h3 style="margin-top: 0;">Memory Usage</h3>
        </div>
        """, unsafe_allow_html=True)
        
        # Generate mock data for memory usage
        times = [datetime.datetime.now() - datetime.timedelta(minutes=x) for x in range(60, 0, -1)]
        memory_usage = [70 + random.uniform(-15, 15) for _ in range(60)]
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=times,
            y=memory_usage,
            mode='lines',
            line=dict(color='#007acc', width=2)
        ))
        
        fig.add_hrect(y0=90, y1=100, line_width=0, fillcolor="#ff3333", opacity=0.1)
        fig.add_hrect(y0=75, y1=90, line_width=0, fillcolor="#ffcc00", opacity=0.1)
        
        fig.update_layout(
            height=300,
            margin=dict(l=50, r=50, t=30, b=50),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#ccc'),
            yaxis_title='Memory Usage (%)',
            xaxis_title='Time'
        )
        
        st.plotly_chart(fig, use_container_width=True)

def market_status_monitoring(aggregator):
    """Monitor market status across regions"""
    st.header("Global Market Status")
    
    # Market status summary
    st.subheader("Market Status Summary")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">US Market</div>
            <div class="metric-value" style="color: #00cc66;">Bullish</div>
            <div class="metric-status">Open</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">European Market</div>
            <div class="metric-value" style="color: #00cc66;">Bullish</div>
            <div class="metric-status">Closed</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">Asian Market</div>
            <div class="metric-value" style="color: #ffcc00;">Neutral</div>
            <div class="metric-status">Open</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">Emerging Markets</div>
            <div class="metric-value" style="color: #ff3333;">Bearish</div>
            <div class="metric-status">Open</div>
        </div>
        """, unsafe_allow_html=True)
    
    # Market heat map
    st.subheader("Global Market Heat Map")
    
    # Generate mock data for market heatmap
    regions = ['US', 'Europe', 'Japan', 'India', 'China', 'Brazil', 'Australia']
    sectors = ['Tech', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrials']
    
    # Create a correlation matrix
    heatmap_data = []
    for region in regions:
        for sector in sectors:
            heatmap_data.append({
                'region': region,
                'sector': sector,
                'value': random.uniform(-5, 5)
            })
    
    # Create heatmap
    fig = px.density_heatmap(
        heatmap_data,
        x="sector",
        y="region",
        z="value",
        color_continuous_scale="RdYlGn",
        range_color=[-5, 5]
    )
    
    fig.update_layout(
        height=400,
        margin=dict(l=50, r=50, t=30, b=50),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='#ccc'),
        coloraxis_colorbar=dict(
            title='Performance (%)',
            tickvals=[-5, -2.5, 0, 2.5, 5],
            ticktext=['-5%', '-2.5%', '0%', '2.5%', '5%']
        )
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Market correlations
    st.subheader("Market Correlations")
    
    # Generate mock correlation data
    markets = ['US', 'EU', 'Japan', 'India', 'China', 'Brazil', 'Australia']
    correlations = []
    
    for m1 in markets:
        row = []
        for m2 in markets:
            if m1 == m2:
                row.append(1.0)
            else:
                row.append(random.uniform(0.6, 0.9))
        correlations.append(row)
    
    # Create correlation matrix visualization
    fig = go.Figure(data=go.Heatmap(
        z=correlations,
        x=markets,
        y=markets,
        colorscale='RdBu',
        zmin=0.5,
        zmax=1.0
    ))
    
    fig.update_layout(
        height=400,
        margin=dict(l=50, r=50, t=30, b=50),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='#ccc'),
        title="Market Correlation Matrix (1 = perfect correlation)"
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Sector performance
    st.subheader("Sector Performance")
    
    sectors = ['Technology', 'Financials', 'Energy', 'Healthcare', 'Consumer', 'Industrials', 'Real Estate']
    sector_performance = {sector: random.uniform(-3, 5) for sector in sectors}
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=list(sector_performance.keys()),
        y=list(sector_performance.values()),
        marker_color=['#00cc66' if v > 0 else '#ff3333' for v in sector_performance.values()]
    ))
    
    fig.update_layout(
        height=300,
        margin=dict(l=50, r=50, t=30, b=50),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='#ccc'),
        yaxis_title='Performance (%)',
        xaxis_tickangle=-45
    )
    
    st.plotly_chart(fig, use_container_width=True)

def alert_monitoring(aggregator):
    """Monitor and display system alerts"""
    st.header("Alerts & Notifications")
    
    # Get active alerts
    active_alerts = [
        {
            "id": "alert-1",
            "type": "warning",
            "title": "Data Freshness Issue",
            "description": "EUR/USD data is 45 minutes old. Check data source connection.",
            "timestamp": "2023-06-15 14:30:00",
            "severity": "medium",
            "source": "Data Pipeline"
        },
        {
            "id": "alert-2",
            "type": "critical",
            "title": "API Rate Limit Exceeded",
            "description": "Alpha Vantage API rate limit exceeded. Switching to fallback data source.",
            "timestamp": "2023-06-15 14:25:12",
            "severity": "high",
            "source": "Alpha Vantage"
        },
        {
            "id": "alert-3",
            "type": "info",
            "title": "New Economic Data Available",
            "description": "Q2 GDP data has been released. Check economic indicators.",
            "timestamp": "2023-06-15 14:15:45",
            "severity": "low",
            "source": "FRED"
        },
        {
            "id": "alert-4",
            "type": "warning",
            "title": "News Data Anomaly Detected",
            "description": "Unusually high news volume for technology sector. Monitor for market impact.",
            "timestamp": "2023-06-15 14:00:30",
            "severity": "medium",
            "source": "GDELT"
        }
    ]
    
    # Filter alerts
    col1, col2 = st.columns(2)
    
    with col1:
        alert_type = st.selectbox("Filter by Type", ["All", "Critical", "Warning", "Info"])
    
    with col2:
        severity_filter = st.selectbox("Filter by Severity", ["All", "High", "Medium", "Low"])
    
    # Apply filters
    filtered_alerts = active_alerts
    
    if alert_type != "All":
        filtered_alerts = [a for a in filtered_alerts if a["type"].upper() == alert_type.upper()]
    
    if severity_filter != "All":
        filtered_alerts = [a for a in filtered_alerts if a["severity"].upper() == severity_filter.upper()]
    
    # Display alerts
    if not filtered_alerts:
        st.info("No active alerts")
    
    for alert in filtered_alerts:
        alert_color = "ff3333" if alert["type"] == "critical" else "ffcc00" if alert["type"] == "warning" else "00cc66"
        
        st.markdown(f"""
        <div class="alert-item" style="border-left-color: #{alert_color};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <h4 style="color: #{alert_color}; margin: 0;">{alert["title"]}</h4>
                <span style="background: #{alert_color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">{alert["severity"].upper()}</span>
            </div>
            <p style="margin: 5px 0; font-size: 14px;">{alert["description"]}</p>
            <div style="display: flex; justify-content: space-between; color: #999; font-size: 11px;">
                <span>{alert["timestamp"]}</span>
                <span>Source: {alert["source"]}</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    # Alert history
    st.subheader("Alert History")
    
    # Generate mock alert history data
    alert_history = []
    for i in range(10):
        days_ago = random.randint(1, 30)
        alert_history.append({
            "timestamp": (datetime.datetime.now() - datetime.timedelta(days=days_ago)).strftime("%Y-%m-%d %H:%M:%S"),
            "type": random.choice(["critical", "warning", "info"]),
            "title": random.choice([
                "Data Freshness Issue",
                "API Rate Limit Exceeded",
                "New Economic Data Available",
                "News Data Anomaly Detected",
                "Market Volatility Spike"
            ]),
            "severity": random.choice(["high", "medium", "low"]),
            "source": random.choice(["Data Pipeline", "Alpha Vantage", "FRED", "GDELT"])
        })
    
    # Create alert history table
    alert_df = pd.DataFrame(alert_history)
    alert_df = alert_df.sort_values("timestamp", ascending=False)
    
    st.dataframe(alert_df, use_container_width=True)
    
    # Alert statistics
    st.subheader("Alert Statistics")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">Total Alerts</div>
            <div class="metric-value">4</div>
            <div class="metric-status">Last 24 hours</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">Critical Alerts</div>
            <div class="metric-value">1</div>
            <div class="metric-status">Requiring immediate action</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">Resolution Time</div>
            <div class="metric-value">2.5 hours</div>
            <div class="metric-status">Average</div>
        </div>
        """, unsafe_allow_html=True)

if __name__ == "__main__":
    real_time_monitoring_dashboard()
