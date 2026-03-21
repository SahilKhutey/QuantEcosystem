import os
import sys
from flask import Blueprint, jsonify, request

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))
from marketplace.strategy_marketplace import StrategyRegistry

marketplace_bp = Blueprint('marketplace', __name__)
registry = StrategyRegistry()

@marketplace_bp.route('/catalog', methods=['GET'])
def get_catalog():
    """Serves the marketplace repository list to the React grid."""
    try:
        catalog = registry.get_catalog()
        return jsonify({
            "status": "success",
            "message": f"Retrieved {len(catalog)} proprietary algorithms.",
            "results": catalog
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@marketplace_bp.route('/deploy', methods=['POST'])
def deploy_algo():
    """Simulates deploying a selected strategy into the master orchestrator."""
    data = request.json or {}
    strategy_id = data.get('strategy_id')
    
    if not strategy_id:
         return jsonify({"status": "error", "message": "Missing strategy id parameter"}), 400
         
    try:
        deployment = registry.deploy_strategy(strategy_id)
        return jsonify({
            "status": "success",
            "message": f"Successfully procured license for {deployment['strategy']}",
            "results": deployment
        })
    except Exception as e:
         return jsonify({"status": "error", "message": str(e)}), 400
