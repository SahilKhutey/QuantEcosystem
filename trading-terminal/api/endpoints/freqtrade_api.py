from flask import Blueprint, jsonify, request
import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from freqtrade.bot import FreqtradeBot
from freqtrade.strategy import SampleMACDStrategy
from freqtrade_clone.optimizer import HyperoptEngine

freqtrade_bp = Blueprint('freqtrade', __name__)

@freqtrade_bp.route('/run', methods=['POST'])
def run_freqtrade():
    """Simulates a Freqtrade bot dry-run and returns trades."""
    req = request.json or {}
    
    config = {
        'dry_run_wallet': req.get('start_balance', 5000.0),
        'stake_amount': req.get('stake_amount', 1000.0),
        'exchange': {
            'pair_whitelist': ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']
        }
    }
    
    bot = FreqtradeBot(config)
    bot.set_strategy(SampleMACDStrategy())
    
    # Run simulation for the past 60 days
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=60)
    
    bot.run_backtest(start_date, end_date)
    
    results = bot.get_results()
    
    return jsonify({
        "status": "success",
        "message": "Freqtrade simulation completed.",
        "results": results
    })

@freqtrade_bp.route('/hyperopt', methods=['POST'])
def run_hyperopt():
    """Generates an array of converged FreqAI genetic search epochs."""
    data_payload = request.json or {}
    epochs = int(data_payload.get('epochs', 100))
    
    try:
        engine = HyperoptEngine()
        result = engine.optimize(epochs=epochs)
        
        return jsonify({
            "status": "success",
            "message": f"FreqAI Hyperopt genetic search converged after {epochs} Epochs.",
            "results": result
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
