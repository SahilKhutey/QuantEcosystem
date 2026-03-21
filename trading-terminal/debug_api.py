import requests
import sys

def debug_api(symbol):
    url = f"http://localhost:5000/api/data/realtime/{symbol}?asset_type=stocks"
    print(f"Testing URL: {url}")
    try:
        r = requests.get(url)
        print(f"Status Code: {r.status_code}")
        print("Response Body:")
        print(r.text)
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    symbol = sys.argv[1] if len(sys.argv) > 1 else "AAPL"
    debug_api(symbol)
