import { ConnectionStatus as Status } from "@/lib/websocket";
import Icon from "@/components/ui/icon";

interface ConnectionStatusProps {
  status: Status;
}

const ConnectionStatus = ({ status }: ConnectionStatusProps) => {
  const getStatusConfig = (status: Status) => {
    switch (status) {
      case "connected":
        return {
          color: "text-green-500",
          bgColor: "bg-green-100",
          icon: "Wifi" as const,
          text: "Подключено",
          pulse: false,
        };
      case "connecting":
        return {
          color: "text-yellow-500",
          bgColor: "bg-yellow-100",
          icon: "Loader2" as const,
          text: "Подключение...",
          pulse: true,
        };
      case "disconnected":
        return {
          color: "text-gray-500",
          bgColor: "bg-gray-100",
          icon: "WifiOff" as const,
          text: "Отключено",
          pulse: false,
        };
      case "error":
        return {
          color: "text-red-500",
          bgColor: "bg-red-100",
          icon: "AlertCircle" as const,
          text: "Ошибка подключения",
          pulse: false,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bgColor}`}
    >
      <div className={`${config.color} ${config.pulse ? "animate-spin" : ""}`}>
        <Icon name={config.icon} size={16} />
      </div>
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
};

export default ConnectionStatus;
