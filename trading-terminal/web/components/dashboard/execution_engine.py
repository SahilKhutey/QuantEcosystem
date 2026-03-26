import streamlit as st

def render_execution_engine():
    st.subheader("Execution Engine")
    st.info("OMS Status: OPERATIONAL")
    st.write("Active Orders:")
    st.write("- BUY 100 MSFT @ $420.00 (PENDING)")
    st.button("Cancel All Orders", type="secondary")
