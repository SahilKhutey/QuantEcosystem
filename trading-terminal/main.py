import logging
from flask import Flask, jsonify
from flask_cors import CORS
from api.endpoints.market import market_bp

app = Flask(__name__)
CORS(app)

# Register Blueprints
app.register_blueprint(market_bp, url_prefix='/api')

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "service": "trading-terminal-api"})

if __name__ == "__main__":
    print("FLASK SERVER STARTING - ASYNC SUPPORT ENABLED")
    import asyncio
    logging.basicConfig(level=logging.INFO)
    app.run(host='0.0.0.0', port=5000)
