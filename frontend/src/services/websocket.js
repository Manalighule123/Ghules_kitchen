export class WebSocketClient {
  constructor(kitchenId = 1, onMessageCallback = null) {
    this.kitchenId = kitchenId;
    this.onMessageCallback = onMessageCallback;
    this.ws = null;
    this.reconnectTimer = null;
    this.isConnecting = false;
  }

  connect() {
    if (this.ws || this.isConnecting) return;
    this.isConnecting = true;

    try {
      const wsUrl = `ws://localhost:8000/ws/orders/${this.kitchenId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`[WS] Connected to Ghules Kitchen WS gateway (Kitchen #${this.kitchenId})`);
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        } catch (e) {
          console.error('[WS] Error parsing message:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[WS] Error encountered, using API polling fallback.');
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('[WS] Connection closed, scheduling reconnect...');
        this.ws = null;
        this.isConnecting = false;
        this.reconnectTimer = setTimeout(() => this.connect(), 5000);
      };
    } catch (e) {
      console.warn('[WS] WebSocket failed to initialize, relying on polling fallback:', e);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
