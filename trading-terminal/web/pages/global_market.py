import streamlit as st
from components.common.charts import render_ohlc_chart

st.title("🌐 Global Market Heatmap")
st.markdown("---")

st.write("Visualizing correlation and flow across global markets.")
render_ohlc_chart("SPY")
render_ohlc_chart("BTC")
