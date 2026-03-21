import time
import numpy as np

class Exchange:
    """
    Simulates the core CCXT Normalizer Base Class.
    Enforces absolutely identical data structures across any child exchange.
    """
    def __init__(self, config=None):
        self.id = 'base'
        self.name = 'Base Exchange'
        self.config = config or {}
        
    def fetch_ticker(self, symbol: str):
        """Must return a normalized dict matching CCXT specifications."""
        raw_response = self._api_fetch_ticker(symbol)
        return self._parse_ticker(raw_response, symbol)

    def fetch_order_book(self, symbol: str, limit: int = 20):
        """Must return normalized { bids: [[price, qty]], asks: [[price, qty]] }"""
        raw_response = self._api_fetch_order_book(symbol, limit)
        return self._parse_order_book(raw_response, symbol)

    # To be overriden by child classes simulating distinct messy APIs
    def _api_fetch_ticker(self, symbol: str): raise NotImplementedError
    def _parse_ticker(self, ticker, symbol: str): raise NotImplementedError
    def _api_fetch_order_book(self, symbol: str, limit: int): raise NotImplementedError
    def _parse_order_book(self, orderbook, symbol: str): raise NotImplementedError


class Binance(Exchange):
    def __init__(self, config=None):
        super().__init__(config)
        self.id = 'binance'
        self.name = 'Binance'
        
    # Simulated chaotic raw Binance API Response
    def _api_fetch_ticker(self, symbol: str):
        # Binance typically returns symbol without slash
        binance_sym = symbol.replace('/', '')
        np.random.seed(int(time.time() * 1000) % 1000)
        price = 65000.0 if 'BTC' in symbol else 3500.0
        drift = np.random.normal(0, price * 0.005)
        
        return {
            "symbol": binance_sym,
            "priceChange": f"{drift:.2f}",
            "priceChangePercent": f"{(drift/price)*100:.3f}",
            "lastPrice": f"{price + drift:.2f}",
            "volume": f"{np.random.uniform(500, 2000):.2f}",
            "quoteVolume": f"{np.random.uniform(50000000, 150000000):.2f}",
            "closeTime": int(time.time() * 1000)
        }
        
    # CCXT Normalizer parsing Binance into the universal schema
    def _parse_ticker(self, ticker, symbol: str):
        last = float(ticker['lastPrice'])
        change = float(ticker['priceChange'])
        return {
            'symbol': symbol,
            'timestamp': ticker['closeTime'],
            'datetime': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime(ticker['closeTime']/1000)),
            'last': last,
            'change': change,
            'percentage': float(ticker['priceChangePercent']),
            'baseVolume': float(ticker['volume']),
            'quoteVolume': float(ticker['quoteVolume']),
            'info': ticker # Original raw response kept in 'info'
        }

    # Simulated chaotic raw Binance Order Book
    def _api_fetch_order_book(self, symbol: str, limit: int):
        binance_sym = symbol.replace('/', '')
        price = 65000.0 if 'BTC' in symbol else 3500.0
        
        bids = [[f"{price - (i * 5):.2f}", f"{np.random.uniform(0.1, 2.5):.4f}"] for i in range(1, limit+1)]
        asks = [[f"{price + (i * 5):.2f}", f"{np.random.uniform(0.1, 2.5):.4f}"] for i in range(1, limit+1)]
        
        return {
            "lastUpdateId": int(time.time()),
            "bids": bids,
            "asks": asks
        }

    # CCXT Normalizer
    def _parse_order_book(self, orderbook, symbol: str):
        return {
            'symbol': symbol,
            'bids': [[float(p), float(q)] for p, q in orderbook['bids']],
            'asks': [[float(p), float(q)] for p, q in orderbook['asks']],
            'timestamp': int(time.time() * 1000),
            'nonce': orderbook['lastUpdateId']
        }


class Kraken(Exchange):
    def __init__(self, config=None):
        super().__init__(config)
        self.id = 'kraken'
        self.name = 'Kraken'
        
    # Simulated chaotic raw Kraken API Response (Very different from Binance)
    def _api_fetch_ticker(self, symbol: str):
        kraken_sym = symbol.replace('/', '')
        kraken_sym = f"X{kraken_sym[:3]}Z{kraken_sym[3:]}" if 'BTC' in symbol else kraken_sym
        
        np.random.seed(int(time.time() * 100) % 1000)
        price = 64995.0 if 'BTC' in symbol else 3498.0
        drift = np.random.normal(0, price * 0.005)
        
        # Kraken returns arrays deep inside object keys
        return {
            "error": [],
            "result": {
                kraken_sym: {
                    "a": [f"{price + drift + 2:.2f}", "1", "1.000"],
                    "b": [f"{price + drift - 2:.2f}", "1", "1.000"],
                    "c": [f"{price + drift:.2f}", "0.08"],
                    "v": ["1200.5", "1500.2"],
                    "p": [f"{price:.2f}", f"{price-10:.2f}"]
                }
            }
        }
        
    # CCXT Normalizer parsing Kraken into the SAME EXACT universal schema
    def _parse_ticker(self, ticker, symbol: str):
        raw_sym = list(ticker['result'].keys())[0]
        data = ticker['result'][raw_sym]
        
        last = float(data['c'][0])
        vwap = float(data['p'][0])
        
        return {
            'symbol': symbol,
            'timestamp': int(time.time() * 1000),
            'datetime': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime()),
            'last': last,
            'change': last - vwap, # Fake change mapping
            'percentage': ((last - vwap)/vwap) * 100,
            'baseVolume': float(data['v'][0]),
            'quoteVolume': float(data['v'][0]) * last,
            'info': ticker
        }

    def _api_fetch_order_book(self, symbol: str, limit: int):
        kraken_sym = list(self._api_fetch_ticker(symbol)['result'].keys())[0]
        price = 64995.0 if 'BTC' in symbol else 3498.0
        
        bids = [[f"{price - (i * 4):.1f}", f"{np.random.uniform(0.1, 2.5):.3f}", int(time.time())] for i in range(1, limit+1)]
        asks = [[f"{price + (i * 4):.1f}", f"{np.random.uniform(0.1, 2.5):.3f}", int(time.time())] for i in range(1, limit+1)]
        
        return {
            "error": [],
            "result": {
                kraken_sym: {
                    "asks": asks,
                    "bids": bids
                }
            }
        }

    def _parse_order_book(self, orderbook, symbol: str):
        raw_sym = list(orderbook['result'].keys())[0]
        data = orderbook['result'][raw_sym]
        return {
            'symbol': symbol,
            'bids': [[float(p), float(q)] for p, q, t in data['bids']],
            'asks': [[float(p), float(q)] for p, q, t in data['asks']],
            'timestamp': int(time.time() * 1000),
            'nonce': None
        }
