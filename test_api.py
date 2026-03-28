import requests
try:
    r = requests.get("http://127.0.0.1:5000/health")
    print(f"Health: {r.status_code} {r.json()}")
    r = requests.get("http://127.0.0.1:5000/api/ping")
    print(f"Ping: {r.status_code} {r.json() if r.status_code == 200 else r.text[:100]}")
    r = requests.get("http://127.0.0.1:5000/api/research/analyze?symbol=NVDA")
    print(f"Analyze: {r.status_code} {r.json() if r.status_code == 200 else r.text[:100]}")
except Exception as e:
    print(f"Error: {e}")
