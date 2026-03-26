import streamlit as st

def render_button(label, key=None):
    return st.button(label, key=key)

def ticker_input(label="Enter Symbol", default="AAPL"):
    return st.text_input(label, value=default).upper()
