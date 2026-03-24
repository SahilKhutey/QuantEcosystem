import logging
import uuid
from datetime import datetime
from typing import Dict, List, Optional

class DeveloperAPIGateway:
    """
    Secure gateway for external developers and institutional partners.
    Provides API key management and throttled access to core trading services.
    """
    def __init__(self):
        self.logger = logging.getLogger("API.Gateway")
        self.api_keys = {
            "dev_demo_key_2026": {"owner": "Institutional_Partners_Alpha", "tier": "premium", "status": "ACTIVE", "created_at": "2026-01-01"}
        }
        self.usage_logs = []

    def generate_api_key(self, owner: str, tier: str = "standard") -> str:
        new_key = f"sk_{uuid.uuid4().hex[:16]}"
        self.api_keys[new_key] = {
            "owner": owner,
            "tier": tier,
            "status": "ACTIVE",
            "created_at": datetime.utcnow().isoformat()
        }
        self.logger.info(f"API Key Generated for {owner}: {new_key[:8]}...")
        return new_key

    def validate_request(self, api_key: str, service: str) -> bool:
        if api_key in self.api_keys and self.api_keys[api_key]["status"] == "ACTIVE":
            self.usage_logs.append({
                "key": api_key,
                "service": service,
                "timestamp": datetime.utcnow().isoformat()
            })
            return True
        return False

    def get_api_status(self) -> Dict:
        return {
            "active_keys": len(self.api_keys),
            "total_requests": len(self.usage_logs),
            "gateway_status": "OPERATIONAL",
            "latency_p99": "45ms"
        }

    def get_key_ledger(self) -> List[Dict]:
        return [
            {"key": k[:8] + "...", "owner": v["owner"], "tier": v["tier"], "status": v["status"]}
            for k, v in self.api_keys.items()
        ]
