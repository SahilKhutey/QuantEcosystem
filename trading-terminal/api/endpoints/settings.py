from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid

settings_bp = Blueprint('settings', __name__)

# Mock database
api_keys = [
    {
        "id": "1",
        "name": "Alpaca Production",
        "keyId": "AKIP...",
        "description": "Main trading account for Falcon strategies.",
        "permissions": ["read", "trade"],
        "createdAt": "2026-01-15T10:00:00Z",
        "expiry": None,
        "expired": False
    },
    {
        "id": "2",
        "name": "IBKR Read-Only",
        "keyId": "IB...",
        "description": "Portfolio monitoring for long-term holdings.",
        "permissions": ["read"],
        "createdAt": "2026-02-20T14:30:00Z",
        "expiry": "2026-12-31T23:59:59Z",
        "expired": False
    }
]

alerts = [
    {
        "id": "1",
        "name": "BTC Flash Crash",
        "description": "Alert if BTC drops more than 5% in 1 hour.",
        "type": "volatility",
        "condition": ">",
        "threshold": "5%",
        "asset": "BTC/USD",
        "channels": ["email", "push"],
        "enabled": True
    },
    {
        "id": "2",
        "name": "SPY Target",
        "description": "Alert when SPY hits $550.",
        "type": "price",
        "condition": ">=",
        "threshold": "550",
        "asset": "SPY",
        "channels": ["email"],
        "enabled": False
    }
]

system_config = {
    "maxLeverage": 2.0,
    "circuitBreakerThreshold": 10.0,
    "defaultPositionSize": 5.0,
    "maintenanceMode": False,
    "logLevel": "INFO",
    "timezone": "UTC"
}

user_profile = {
    "username": "quant_trader_01",
    "email": "trader@quantech.io",
    "fullName": "Sahil Khutey",
    "role": "Senior Quantitative Engineer",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sahil"
}

notification_prefs = {
    "email": True,
    "sms": False,
    "push": True,
    "webhook": False,
    "telegram": True,
    "types": ["trade", "security", "system"]
}

# API Key Endpoints
@settings_bp.route('/api-keys', methods=['GET'])
def get_api_keys():
    return jsonify({"status": "success", "data": api_keys})

@settings_bp.route('/api-keys', methods=['POST'])
def create_api_key():
    data = request.json
    new_key = {
        "id": str(uuid.uuid4()),
        "name": data.get('name'),
        "keyId": f"{data.get('name')[:4].upper()}...",
        "description": data.get('description', ''),
        "permissions": data.get('permissions', ['read']),
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "expiry": data.get('expiry'),
        "expired": False
    }
    api_keys.append(new_key)
    return jsonify({"status": "success", "data": new_key})

@settings_bp.route('/api-keys/<key_id>', methods=['DELETE'])
def delete_api_key(key_id):
    global api_keys
    api_keys = [k for k in api_keys if k['id'] != key_id]
    return jsonify({"status": "success", "message": "Key deleted"})

# Alert Endpoints
@settings_bp.route('/alerts', methods=['GET'])
def get_alerts():
    return jsonify({"status": "success", "data": alerts})

@settings_bp.route('/alerts', methods=['POST'])
def create_alert():
    data = request.json
    new_alert = {
        "id": str(uuid.uuid4()),
        "name": data.get('name'),
        "description": data.get('description', ''),
        "type": data.get('type'),
        "condition": data.get('condition'),
        "threshold": data.get('threshold'),
        "asset": data.get('asset'),
        "channels": data.get('channels', ['email']),
        "enabled": True
    }
    alerts.append(new_alert)
    return jsonify({"status": "success", "data": new_alert})

@settings_bp.route('/alerts/<alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    global alerts
    alerts = [a for a in alerts if a['id'] != alert_id]
    return jsonify({"status": "success", "message": "Alert deleted"})

# System/Profile Endpoints
@settings_bp.route('/system', methods=['GET', 'PUT'])
def handle_system_config():
    if request.method == 'GET':
        return jsonify({"status": "success", "data": system_config})
    global system_config
    system_config.update(request.json)
    return jsonify({"status": "success", "data": system_config})

@settings_bp.route('/profile', methods=['GET', 'PUT'])
def handle_profile():
    if request.method == 'GET':
        return jsonify({"status": "success", "data": user_profile})
    global user_profile
    user_profile.update(request.json)
    return jsonify({"status": "success", "data": user_profile})

@settings_bp.route('/notifications', methods=['GET', 'PUT'])
def handle_notifications():
    if request.method == 'GET':
        return jsonify({"status": "success", "data": notification_prefs})
    global notification_prefs
    notification_prefs.update(request.json)
    return jsonify({"status": "success", "data": notification_prefs})
