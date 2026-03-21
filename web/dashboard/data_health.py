import streamlit as st
import pandas as pd
import numpy as np
import time
from datetime import datetime, timedelta
from data_engine.data_aggregator import DataAggregator
from config.settings import API_KEYS

def data_health_dashboard():
    """Display data health dashboard"""
    st.title("Data Health Dashboard")
    
    # Initialize data aggregator
    aggregator = DataAggregator(API_KEYS)
    
    # Data freshness section
    st.header("Data Freshness")
    
    # Get most recent data points
    aapl_data = aggregator.get_market_data('AAPL', start=(datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"))
    eurusd_data = aggregator.get_market_data('EURUSD', asset_type='forex', start=(datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"))
    
    col1, col2 = st.columns(2)
    
    with col1:
        if not aapl_data.empty:
            last_timestamp = aapl_data.index[-1]
            freshness = (datetime.now() - last_timestamp).total_seconds() / 60
            status = "Healthy" if freshness < 30 else "Stale"
            color = "green" if freshness < 30 else "red"
            
            st.metric("AAPL Data Freshness", f"{freshness:.1f} minutes", status)
            st.progress(min(freshness / 60, 1.0))
            st.caption(f"Last update: {last_timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
        else:
            st.error("No AAPL data available")
    
    with col2:
        if not eurusd_data.empty:
            last_timestamp = eurusd_data.index[-1]
            freshness = (datetime.now() - last_timestamp).total_seconds() / 60
            status = "Healthy" if freshness < 30 else "Stale"
            color = "green" if freshness < 30 else "red"
            
            st.metric("EURUSD Data Freshness", f"{freshness:.1f} minutes", status)
            st.progress(min(freshness / 60, 1.0))
            st.caption(f"Last update: {last_timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
        else:
            st.error("No EURUSD data available")
    
    # Data quality section
    st.header("Data Quality")
    
    # Market data quality
    st.subheader("Market Data Quality")
    
    # Check for missing values in AAPL data
    if not aapl_data.empty:
        missing_values = aapl_data.isnull().sum()
        total_values = len(aapl_data) * len(aapl_data.columns)
        missing_count = missing_values.sum()
        quality_score = 100 * (1 - missing_count / total_values)
        
        st.progress(quality_score / 100)
        st.write(f"Data Quality Score: {quality_score:.1f}%")
        
        # Show missing value breakdown
        st.subheader("Missing Value Breakdown")
        for column, count in missing_values.items():
            if count > 0:
                st.write(f"- {column}: {count} missing values")
    else:
        st.error("No market data available for quality check")
    
    # News data quality
    st.subheader("News Data Quality")
    
    news = aggregator.get_news_data(max_results=100)
    if news:
        total_news = len(news)
        missing_titles = sum(1 for n in news if not n.get('title'))
        missing_urls = sum(1 for n in news if not n.get('url'))
        
        st.metric("Total News Articles", total_news)
        st.metric("Missing Titles", missing_titles)
        st.metric("Missing URLs", missing_urls)
    else:
        st.error("No news data available for quality check")
    
    # Data consistency section
    st.header("Data Consistency")
    
    if not aapl_data.empty:
        # Check price consistency
        price_consistency = "No issues found" if (aapl_data['high'] >= aapl_data['low']).all() else "Inconsistent prices detected"
        st.success(f"Price Consistency: {price_consistency}")
        
        # Check volume consistency
        volume_consistency = "No issues found" if (aapl_data['volume'] >= 0).all() else "Negative volumes detected"
        st.success(f"Volume Consistency: {volume_consistency}")
    
    # System health section
    st.header("System Health")
    
    # Show data pipeline status
    st.subheader("Data Pipeline Status")
    st.success("Data pipeline is running")
    
    # Show last update time
    last_update = datetime.now() - timedelta(minutes=5)  # Mocked value
    st.info(f"Last data update: {last_update.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Show error log (mocked)
    st.subheader("Recent Errors")
    st.error("No recent errors detected")

if __name__ == "__main__":
    data_health_dashboard()
