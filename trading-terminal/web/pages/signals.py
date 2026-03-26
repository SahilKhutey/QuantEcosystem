import streamlit as st
from components.dashboard.signal_generator import render_signal_generator

st.title("📡 Signal Intelligence")
st.markdown("---")

render_signal_generator()
st.write("Technical Indicators & AI Confidence Scores.")
