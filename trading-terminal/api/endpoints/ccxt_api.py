from flask import Blueprint, jsonify, request
import sys
import os
import ccxt

ccxt_bp = Blueprint('ccxt_framework', __name__)

@ccxt_bp.route('/run', methods=['POST'])
def run_ccxt():
    """Fetch identical datasets through the dynamic unified live CCXT wrapper"""
    data_payload = request.json or {}
    exchange_id = data_payload.get('exchange', 'binance').lower()
    symbol = data_payload.get('symbol', 'BTC/USDT').upper()
    
    # 1. Dynamic class initialization (Standard python CCXT methodology)
    try:
        exchange_class = getattr(ccxt, exchange_id)
        exchange = exchange_class()
    except AttributeError:
        return jsonify({"status": "error", "message": f"Exchange {exchange_id} is not supported by CCXT."}), 400
        
    try:
        # 2. Invoke Universal Methods
        # Because of normalization, the identical syntax works symmetrically across exchanges!
        ticker = exchange.fetch_ticker(symbol)
        orderbook = exchange.fetch_order_book(symbol, limit=20)
        
        # 3. Format Data for the UI React Interface
        # Converting the pure 2D array Orderbooks into cumulative Market Depth objects
        depth = []
        
        # Process Bids (Accumulate Volume downwards)
        acc_bid_vol = 0
        for price, qty in orderbook['bids']:
            acc_bid_vol += qty
            depth.append({
                'price': float(price),
                'bidQty': qty,
                'bidDepth': acc_bid_vol,
                'askQty': 0,
                'askDepth': 0,
                'type': 'BID'
            })
            
        # Process Asks (Accumulate Volume upwards)
        # We unshift asks to keep prices ascending on the graph
        acc_ask_vol = 0
        for price, qty in orderbook['asks']:
            acc_ask_vol += qty
            depth.append({
                'price': float(price),
                'askQty': qty,
                'askDepth': acc_ask_vol,
                'bidQty': 0,
                'bidDepth': 0,
                'type': 'ASK'
            })
            
        # Sort completely by price
        depth = sorted(depth, key=lambda x: x['price'])
        
        # 4. Return standard normalized response
        return jsonify({
            "status": "success",
            "message": f"Successfully pulled CCXT Unified data from {exchange.name}.",
            "exchange": exchange.name,
            "symbol": symbol,
            "normalized_ticker": {
                 "last": ticker['last'],
                 "change24h": ticker['change'],
                 "percent24h": ticker['percentage'],
                 "baseVolume": ticker['baseVolume']
            },
            "market_depth": depth,
            "raw_payload_snippet": ticker['info'] # Proof of the distinct messiness underlying
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
