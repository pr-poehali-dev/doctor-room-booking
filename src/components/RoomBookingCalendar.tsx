import { useState } from "react";
import { useBookingStore } from "@/lib/bookingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";

const RoomBookingCalendar = () => {
  const { bookings, rooms, doctors } = useBookingStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getBookingsForDay = (date: Date) => {
    return bookings.filter(
      (booking) =>
        isSameDay(booking.startTime, date) && booking.status === "confirmed",
    );
  };

  const getDoctorName = (doctorId: string) => {
    return (
      doctors.find((doctor) => doctor.id === doctorId)?.name ||
      "Неизвестный врач"
    );
  };

  const getRoomName = (roomId: string) => {
    return (
      rooms.find((room) => room.id === roomId)?.name || "Неизвестный кабинет"
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Календарь бронирований</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
          <span className="text-lg font-medium">
            {format(weekStart, "d MMMM", { locale: ru })} -{" "}
            {format(addDays(weekStart, 6), "d MMMM yyyy", { locale: ru })}
          </span>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayBookings = getBookingsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <Card
              key={day.toISOString()}
              className={`${isToday ? "ring-2 ring-blue-500" : ""}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-center">
                  <div
                    className={`font-medium ${isToday ? "text-blue-600" : ""}`}
                  >
                    {format(day, "EEE", { locale: ru })}
                  </div>
                  <div
                    className={`text-lg ${isToday ? "text-blue-600 font-bold" : ""}`}
                  >
                    {format(day, "d")}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 pt-0">
                {dayBookings.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-2">
                    Нет бронирований
                  </div>
                ) : (
                  dayBookings
                    .sort(
                      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
                    )
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className={`p-2 rounded-lg border text-xs ${getStatusColor(booking.status)}`}
                      >
                        <div className="font-medium">
                          {format(booking.startTime, "HH:mm")} -{" "}
                          {format(booking.endTime, "HH:mm")}
                        </div>
                        <div className="truncate">
                          {getRoomName(booking.roomId)}
                        </div>
                        <div className="truncate">
                          {getDoctorName(booking.doctorId)}
                        </div>
                        {booking.patientName && (
                          <div className="truncate text-gray-600">
                            {booking.patientName}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
          <span>Подтверждено</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
          <span>В ожидании</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
          <span>Отменено</span>
        </div>
      </div>
    </div>
  );
};

export default RoomBookingCalendar;
