from flask import Blueprint, jsonify, request
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from openbb_clone.platform import obbb

openbb_bp = Blueprint('openbb_framework', __name__)

@openbb_bp.route('/run', methods=['POST'])
def run_openbb():
    """Dynamically routes requests through the OpenBB unified namespace tree."""
    data_payload = request.json or {}
    
    # E.g. "stocks", "crypto", "economy"
    module = data_payload.get('module', 'stocks')
    symbol = data_payload.get('symbol', 'AAPL')
    
    try:
        # 1. Unified OpenBB Endpoint Routing
        if module == 'stocks':
            # Simulates: obbb.stocks.load("AAPL")
            result = obbb.stocks.load(symbol=symbol)
            msg = f"Fetched Equities via obbb.stocks.load({symbol})"
            
        elif module == 'crypto':
            # Simulates: obbb.crypto.load("BTC-USD")
            result = obbb.crypto.load(symbol=symbol)
            msg = f"Fetched Digital Assets via obbb.crypto.load({symbol})"
            
        elif module == 'economy':
            # Simulates: obbb.economy.macro("OIS")
            result = obbb.economy.macro(parameter=symbol)
            msg = f"Fetched Macroeconomics via obbb.economy.macro({symbol})"
            
        else:
            raise ValueError(f"Unknown OpenBB module tier: {module}")
        
        return jsonify({
            "status": "success",
            "message": msg,
            "provider": result["provider"],
            "type": result["type"],
            "dataset": result["dataset"]
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
