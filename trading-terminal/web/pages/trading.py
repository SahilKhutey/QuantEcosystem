import streamlit as st
from components.dashboard.execution_engine import render_execution_engine
from components.terminal.trading_terminal import render_terminal

st.title("⚡ Execution & Trading")
st.markdown("---")

render_execution_engine()
st.markdown("---")
render_terminal()
