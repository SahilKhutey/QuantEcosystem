class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
  }

  connect(url = 'wss://stream.trading.com/ws') {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Connected to Trading WebSocket');
      this.subscribe(['ticker', 'trades']);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.listeners.forEach((listener) => listener(data));
    };

    this.ws.onclose = () => {
      console.log('Disconnected. Reconnecting...');
      setTimeout(() => this.connect(url), 5000);
    };
  }

  subscribe(channels) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', channels }));
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const wsService = new WebSocketService();
export default wsService;
