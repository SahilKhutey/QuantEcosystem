import streamlit as st
from components.dashboard.risk_management import render_risk_management

st.title("🛡️ Risk & Compliance")
st.markdown("---")

render_risk_management()
st.write("Scenario Analysis & Stress Testing Reports.")
