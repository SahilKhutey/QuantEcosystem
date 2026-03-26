import requests
from config import API_BASE_URL

class APIClient:
    def __init__(self, base_url=API_BASE_URL):
        self.base_url = base_url

    def get_market_data(self, symbol):
        # Example call to the Flask backend
        try:
            response = requests.get(f"{self.base_url}/market/{symbol}", timeout=5)
            return response.json()
        except Exception as e:
            return {"error": str(e)}

    def place_order(self, order_data):
        try:
            response = requests.post(f"{self.base_url}/trade/order", json=order_data, timeout=5)
            return response.json()
        except Exception as e:
            return {"error": str(e)}
