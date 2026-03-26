import streamlit as st
from components.dashboard.portfolio_optimizer import render_portfolio_optimizer

st.title("💼 Portfolio Intelligence")
st.markdown("---")

render_portfolio_optimizer()
st.write("Asset Allocation Performance & Attribution.")
