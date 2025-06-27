export interface WebSocketMessage {
  type:
    | "booking_created"
    | "booking_updated"
    | "booking_deleted"
    | "booking_cancelled";
  data: any;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.emit("status", "connected");
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.emit("message", message);
          } catch (error) {
            console.error("Ошибка парсинга WebSocket сообщения:", error);
          }
        };

        this.ws.onclose = () => {
          this.emit("status", "disconnected");
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket ошибка:", error);
          this.emit("status", "error");
          reject(error);
        };
      } catch (error) {
        this.emit("status", "error");
        reject(error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.emit("status", "connecting");

      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch(() => {
          // Попытка переподключения не удалась
        });
      }, this.config.reconnectInterval);
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Создаем singleton экземпляр
export const wsManager = new WebSocketManager({
  url: "wss://demo-websocket-server.com/booking", // Демо сервер
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
});
