from flask import Blueprint, jsonify, request
import sys
import os
import yfinance as yf

yfinance_bp = Blueprint('yfinance_framework', __name__)

@yfinance_bp.route('/run', methods=['POST'])
def run_yfinance():
    """Download Actual Live History Market Data utilizing Yahoo standard schema."""
    data_payload = request.json or {}
    symbol = data_payload.get('symbol', 'AAPL')
    period = data_payload.get('period', '3mo')
    
    try:
        # 1. Initialize True Ticker
        ticker = yf.Ticker(symbol)
        
        # 2. Extract Dataframe
        df = ticker.history(period=period)
        
        # 3. Format payload for UI (Recharts expects arrays of objects)
        timeseries = []
        for index, row in df.iterrows():
            timeseries.append({
                'date': index.strftime('%Y-%m-%d'),
                'open': float(row['Open']),
                'high': float(row['High']),
                'low': float(row['Low']),
                'close': float(row['Close']),
                'volume': int(row['Volume']),
                'dividend': float(row['Dividends'])
            })
            
        return jsonify({
            "status": "success",
            "message": f"Successfully pulled {period} history for {symbol} natively using yfinance wrapper.",
            "metadata": ticker.info,
            "history": timeseries
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
