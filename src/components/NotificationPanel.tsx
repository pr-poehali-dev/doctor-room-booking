import { useBookingStore } from "@/lib/bookingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const NotificationPanel = () => {
  const { notifications, clearNotifications } = useBookingStore();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_created":
        return "Plus";
      case "booking_cancelled":
        return "X";
      case "booking_updated":
        return "Edit";
      default:
        return "Bell";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking_created":
        return "bg-green-100 text-green-800";
      case "booking_cancelled":
        return "bg-red-100 text-red-800";
      case "booking_updated":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Bell" size={20} />
            Уведомления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            <Icon
              name="BellOff"
              size={32}
              className="mx-auto mb-2 opacity-50"
            />
            <p>Нет новых уведомлений</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Bell" size={20} />
            Уведомления
            <Badge variant="secondary">{notifications.length}</Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearNotifications}
            className="text-xs"
          >
            <Icon name="X" size={14} className="mr-1" />
            Очистить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border"
          >
            <div
              className={`p-1 rounded-full ${getNotificationColor(notification.type)}`}
            >
              <Icon name={getNotificationIcon(notification.type)} size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {format(notification.timestamp, "d MMMM, HH:mm", {
                  locale: ru,
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;
