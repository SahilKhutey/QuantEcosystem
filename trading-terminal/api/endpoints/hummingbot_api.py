from flask import Blueprint, jsonify, request
import sys
import os
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from hummingbot_clone.strategy.market_making import PureMarketMakingStrategy

hummingbot_bp = Blueprint('hummingbot_framework', __name__)

@hummingbot_bp.route('/run', methods=['POST'])
def run_hummingbot():
    """Generates instantaneous state representing a live Hummingbot market making HFT cycle."""
    data_payload = request.json or {}
    
    bid_spread = float(data_payload.get('bid_spread', 0.002))   # 0.2%
    ask_spread = float(data_payload.get('ask_spread', 0.002))   # 0.2%
    order_amount = float(data_payload.get('order_amount', 0.05)) # BTC volume blocks
    
    try:
        pmm = PureMarketMakingStrategy(bid_spread=bid_spread, ask_spread=ask_spread, order_amount=order_amount)
        
        # Simulating live mid price of BTC
        mid_price = 65000.0 + np.random.normal(0, 50) 
        
        # 1. Generate core array tracking robot limits
        depth_chart, best_bid, best_ask = pmm.generate_depth_chart(mid_price)
        
        # 2. Check internal inventory constraints
        inventory = pmm.get_inventory_status(mid_price)
        
        # 3. Compile synthetic log output representing python terminal
        terminal_msg = (
            f"INFO: Mid Price {mid_price:.2f} | "
            f"Best Bid/Ask: {best_bid:.2f}/{best_ask:.2f} | "
            f"Spread Enforced!"
        )
        
        return jsonify({
            "status": "success",
            "message": terminal_msg,
            "metrics": {
                "Mid Price": f"${mid_price:,.2f}",
                "Best Bid / Best Ask": f"${best_bid:,.2f} / ${best_ask:,.2f}",
                "Absolute Spread": f"${(best_ask - best_bid):.2f} ({(bid_spread+ask_spread)*100:.2f}%)",
                "Total Value Locked": f"${inventory['total_value']:,.2f}"
            },
            "inventory": inventory,
            "depth_chart": depth_chart
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
