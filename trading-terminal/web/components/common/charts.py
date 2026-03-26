import streamlit as st
import pandas as pd
import numpy as np

def render_line_chart(title, data):
    st.write(f"### {title}")
    st.line_chart(data)

def render_ohlc_chart(symbol):
    st.write(f"### OHLC: {symbol}")
    st.caption("Candlestick chart placeholder using standard streamlit charting.")
    # In production, use Plotly or Altair for better candlesticks
    chart_data = pd.DataFrame(
       np.random.randn(20, 3),
       columns=['a', 'b', 'c'])
    st.line_chart(chart_data)
