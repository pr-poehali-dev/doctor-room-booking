import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingForm from "@/components/BookingForm";
import RoomList from "@/components/RoomList";
import RoomBookingCalendar from "@/components/RoomBookingCalendar";
import NotificationPanel from "@/components/NotificationPanel";
import ConnectionStatus from "@/components/ConnectionStatus";
import Icon from "@/components/ui/icon";
import { useWebSocket } from "@/hooks/useWebSocket";

const Index = () => {
  const { status } = useWebSocket();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Система бронирования кабинетов
            </h1>
            <p className="text-gray-600">
              Управление медицинскими кабинетами и расписанием врачей
            </p>
          </div>
          <ConnectionStatus status={status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="calendar" className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger
                  value="calendar"
                  className="flex items-center gap-2"
                >
                  <Icon name="Calendar" size={16} />
                  Календарь
                </TabsTrigger>
                <TabsTrigger value="rooms" className="flex items-center gap-2">
                  <Icon name="Building" size={16} />
                  Кабинеты
                </TabsTrigger>
                <TabsTrigger
                  value="booking"
                  className="flex items-center gap-2"
                >
                  <Icon name="Plus" size={16} />
                  Бронирование
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar">
                <RoomBookingCalendar />
              </TabsContent>

              <TabsContent value="rooms">
                <RoomList />
              </TabsContent>

              <TabsContent value="booking">
                <div className="flex justify-center">
                  <BookingForm />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <NotificationPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
