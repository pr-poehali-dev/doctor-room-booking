import { useBookingStore } from "@/lib/bookingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const RoomList = () => {
  const { rooms, bookings, doctors } = useBookingStore();

  const getCurrentBooking = (roomId: string) => {
    const now = new Date();
    return bookings.find(
      (booking) =>
        booking.roomId === roomId &&
        booking.status === "confirmed" &&
        booking.startTime <= now &&
        booking.endTime > now,
    );
  };

  const getNextBooking = (roomId: string) => {
    const now = new Date();
    return bookings
      .filter(
        (booking) =>
          booking.roomId === roomId &&
          booking.status === "confirmed" &&
          booking.startTime > now,
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0];
  };

  const getDoctorName = (doctorId: string) => {
    return (
      doctors.find((doctor) => doctor.id === doctorId)?.name ||
      "Неизвестный врач"
    );
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case "examination":
        return "bg-blue-100 text-blue-800";
      case "surgery":
        return "bg-red-100 text-red-800";
      case "consultation":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case "examination":
        return "Stethoscope";
      case "surgery":
        return "Scissors";
      case "consultation":
        return "MessageCircle";
      default:
        return "Building";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Кабинеты</h2>
      <div className="grid gap-4">
        {rooms.map((room) => {
          const currentBooking = getCurrentBooking(room.id);
          const nextBooking = getNextBooking(room.id);
          const isOccupied = Boolean(currentBooking);

          return (
            <Card
              key={room.id}
              className={`transition-all ${isOccupied ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name={getRoomTypeIcon(room.type)} size={20} />
                    {room.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoomTypeColor(room.type)}>
                      {room.type}
                    </Badge>
                    <Badge variant={isOccupied ? "destructive" : "default"}>
                      {isOccupied ? "Занят" : "Свободен"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="Users" size={16} />
                  Вместимость: {room.capacity} человек
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="Package" size={16} />
                  Оборудование: {room.equipment.join(", ")}
                </div>

                {currentBooking && (
                  <div className="bg-red-100 p-3 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-800 font-medium">
                      <Icon name="User" size={16} />
                      {getDoctorName(currentBooking.doctorId)}
                    </div>
                    <div className="text-sm text-red-600 mt-1">
                      До{" "}
                      {format(currentBooking.endTime, "HH:mm", { locale: ru })}
                      {currentBooking.patientName &&
                        ` • Пациент: ${currentBooking.patientName}`}
                    </div>
                  </div>
                )}

                {!currentBooking && nextBooking && (
                  <div className="bg-yellow-100 p-3 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 text-yellow-800 font-medium">
                      <Icon name="Clock" size={16} />
                      Следующее бронирование
                    </div>
                    <div className="text-sm text-yellow-700 mt-1">
                      {format(nextBooking.startTime, "HH:mm", { locale: ru })} -{" "}
                      {getDoctorName(nextBooking.doctorId)}
                    </div>
                  </div>
                )}

                {!currentBooking && !nextBooking && (
                  <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-800 font-medium">
                      <Icon name="CheckCircle" size={16} />
                      Кабинет свободен
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RoomList;
