import streamlit as st

def render_portfolio_optimizer():
    st.subheader("Portfolio Optimizer")
    st.write("Current Allocation vs. Target")
    # Placeholder for chart
    st.bar_chart({"Tech": 0.4, "Finance": 0.2, "Energy": 0.1, "Crypto": 0.3})
    if st.button("Optimize Allocation"):
        st.write("Rebalancing... (Black-Litterman optimization in progress)")
