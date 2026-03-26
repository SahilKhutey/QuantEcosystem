import streamlit as st
from components.dashboard.market_view import render_market_view
from components.dashboard.risk_management import render_risk_management
from components.dashboard.signal_generator import render_signal_generator

st.title("📊 Integrated Market Dashboard")
st.markdown("---")

col1, col2 = st.columns([2, 1])

with col1:
    render_market_view()
    st.markdown("---")
    render_signal_generator()

with col2:
    render_risk_management()
    st.info("System Alerts: 0 Active")
