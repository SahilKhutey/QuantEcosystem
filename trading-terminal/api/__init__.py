from flask import Flask, jsonify
from flask_cors import CORS
import logging

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Register Blueprints
    from api.endpoints.market import market_bp
    app.register_blueprint(market_bp, url_prefix='/api')
    
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "service": "trading-terminal-api"})
        
    return app
