import { useEffect, useState } from "react";
import { wsManager, ConnectionStatus, WebSocketMessage } from "@/lib/websocket";
import { useBookingStore } from "@/lib/bookingStore";

export const useWebSocket = () => {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const {
    syncAddBooking,
    syncUpdateBooking,
    syncDeleteBooking,
    syncCancelBooking,
  } = useBookingStore();

  useEffect(() => {
    const handleStatusChange = (newStatus: ConnectionStatus) => {
      setStatus(newStatus);
    };

    const handleMessage = (message: WebSocketMessage) => {
      switch (message.type) {
        case "booking_created":
          syncAddBooking(message.data);
          break;
        case "booking_updated":
          syncUpdateBooking(message.data.bookingId, message.data.updates);
          break;
        case "booking_deleted":
          syncDeleteBooking(message.data.bookingId);
          break;
        case "booking_cancelled":
          syncCancelBooking(message.data.bookingId);
          break;
      }
    };

    wsManager.on("status", handleStatusChange);
    wsManager.on("message", handleMessage);

    // Подключаемся к WebSocket
    setStatus("connecting");
    wsManager.connect().catch(() => {
      setStatus("error");
    });

    return () => {
      wsManager.off("status", handleStatusChange);
      wsManager.off("message", handleMessage);
    };
  }, [syncAddBooking, syncUpdateBooking, syncDeleteBooking, syncCancelBooking]);

  const sendMessage = (message: Omit<WebSocketMessage, "timestamp">) => {
    wsManager.send({
      ...message,
      timestamp: Date.now(),
    });
  };

  return {
    status,
    sendMessage,
  };
};
