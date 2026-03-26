import streamlit as st
from components.terminal.trading_terminal import render_terminal
from config import APP_NAME

st.set_page_config(
    page_title=APP_NAME,
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

def main():
    st.sidebar.title(f"🚀 {APP_NAME}")
    st.sidebar.markdown("---")
    
    # Navigation is handled by Streamlit's pages/ directory automatically
    # but we can add global sidebar elements here
    
    st.title("Welcome to the Trading Terminal")
    st.info("Select a page from the sidebar to begin.")
    
    render_terminal()

if __name__ == "__main__":
    main()
