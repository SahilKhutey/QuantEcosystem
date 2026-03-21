from flask import Blueprint, request, jsonify
import sys
import os
import hmac
import hashlib
import json
from datetime import datetime

# Standardize pathing to import core trading engines
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

tradingview_bp = Blueprint('tradingview_framework', __name__)

# Security: In production, this should be stored securely in .env
TV_WEBHOOK_SECRET = os.environ.get('TV_WEBHOOK_SECRET', 'antigravity_quant_secret_2026')

def verify_tradingview_signature(payload_body: bytes, signature: str) -> bool:
    """Validate that the incoming HTTP POST actually originated from TradingView.com"""
    # TradingView sends plain text/json, security is often handled via a secret token in the payload
    # or IP whitelisting. For advanced setups, HMAC is used.
    # We will simulate a local token verification architecture.
    try:
        data = json.loads(payload_body)
        if data.get('passphrase') == TV_WEBHOOK_SECRET:
            return True
        return False
    except:
        return False

@tradingview_bp.route('/webhook', methods=['POST'])
def tradingview_webhook():
    """Real-Time Endpoint parsing live PineScript alerts into master execution pipelines."""
    
    # 1. Security Check (Whitelisting / Token Validation)
    if not verify_tradingview_signature(request.data, request.headers.get('X-Signature', '')):
        # Reject unauthorized requests immediately
        return jsonify({"status": "error", "message": "Unauthorized Webhook Origin"}), 401
        
    try:
        # 2. Parse the TradingView JSON payload
        # Expected Example: {"passphrase": "...", "action": "buy", "ticker": "AAPL", "price": 145.20, "exchange": "NASDAQ"}
        alert_data = request.json
        
        action = alert_data.get('action', '').upper()
        ticker = alert_data.get('ticker', '')
        price = alert_data.get('price', 0.0)
        
        # 3. Route to the Master Orchestrator Signal Engine
        print(f"\n[TRADINGVIEW ALERT] Received highly-secured signal targeting {ticker}")
        print(f"|--- Action: Execute {action} at ${price}")
        
        # (In reality, we would pass this `alert_data` directly into `trading-engine/execution/broker_ib.py` or `ccxt_api.py`)
        
        return jsonify({
            "status": "success",
            "message": f"Successfully parsed {action} signal for {ticker}.",
            "executed_timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": f"Webhook parsing failure: {str(e)}"}), 400
