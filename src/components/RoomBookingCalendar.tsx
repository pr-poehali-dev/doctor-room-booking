import { useState } from "react";
import { useBookingStore } from "@/lib/bookingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";

const RoomBookingCalendar = () => {
  const { bookings, rooms, doctors } = useBookingStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">
          Календарь бронирований
        </h2>
        <div className="flex items-center gap-2 justify-center">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Icon name="ChevronLeft" size={18} />
          </button>
          <span className="text-sm sm:text-lg font-medium text-center">
            {format(weekStart, "d MMM", { locale: ru })} -{" "}
            {format(addDays(weekStart, 6), "d MMM yyyy", { locale: ru })}
          </span>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Icon name="ChevronRight" size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((day) => {
          const dayBookings = getBookingsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <Card
              key={day.toISOString()}
              className={`cursor-pointer transition-all hover:shadow-md min-h-[120px] sm:min-h-[140px] ${
                isToday ? "ring-1 sm:ring-2 ring-blue-500" : ""
              } ${
                selectedDay && isSameDay(selectedDay, day)
                  ? "ring-1 sm:ring-2 ring-green-500 bg-green-50"
                  : ""
              }`}
              onClick={() =>
                setSelectedDay(isSameDay(selectedDay, day) ? null : day)
              }
            >
              <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-4">
                <CardTitle className="text-xs sm:text-sm text-center">
                  <div
                    className={`font-medium ${isToday ? "text-blue-600" : ""}`}
                  >
                    {format(day, "EEE", { locale: ru })}
                  </div>
                  <div
                    className={`text-sm sm:text-lg ${isToday ? "text-blue-600 font-bold" : ""}`}
                  >
                    {format(day, "d")}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 sm:space-y-2 p-1 sm:p-3 pt-0">
                {dayBookings.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-1 sm:py-2">
                    Нет записей
                  </div>
                ) : (
                  dayBookings
                    .sort(
                      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
                    )
                    .slice(0, 3)
                    .map((booking, index) => (
                      <div
                        key={booking.id}
                        className={`p-1 sm:p-2 rounded border text-xs ${getStatusColor(booking.status)}`}
                      >
                        <div className="font-medium text-xs">
                          {format(booking.startTime, "HH:mm")}
                        </div>
                        <div className="truncate text-xs">
                          {getRoomName(booking.roomId).split(" ")[0]}
                        </div>
                      </div>
                    ))
                )}
                {dayBookings.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{dayBookings.length - 3} еще
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedDay && (
        <Card className="mt-4 sm:mt-6 border-2 border-green-200">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={20} />
                <span className="text-base sm:text-xl">
                  {format(selectedDay, "d MMMM yyyy", { locale: ru })}
                </span>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="ml-auto p-1 hover:bg-gray-100 rounded-lg self-start sm:self-center"
              >
                <Icon name="X" size={18} />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {getBookingsForDay(selectedDay).length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <Icon
                  name="CalendarX"
                  size={36}
                  className="mx-auto mb-3 text-gray-300 sm:size-12"
                />
                <p className="text-base sm:text-lg">
                  На этот день нет бронирований
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {getBookingsForDay(selectedDay)
                  .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 ${getStatusColor(booking.status)}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Icon name="Clock" size={20} />
                          <span className="text-lg sm:text-2xl font-bold">
                            {format(booking.startTime, "HH:mm")} -{" "}
                            {format(booking.endTime, "HH:mm")}
                          </span>
                        </div>
                        <div
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(booking.status)} self-start`}
                        >
                          {booking.status === "confirmed" && "Подтверждено"}
                          {booking.status === "pending" && "В ожидании"}
                          {booking.status === "cancelled" && "Отменено"}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Icon name="MapPin" size={18} className="mt-0.5" />
                            <div>
                              <p className="text-xs sm:text-sm text-gray-600">
                                Кабинет
                              </p>
                              <p className="text-sm sm:text-lg font-semibold">
                                {getRoomName(booking.roomId)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 sm:gap-3">
                            <Icon
                              name="UserCheck"
                              size={18}
                              className="mt-0.5"
                            />
                            <div>
                              <p className="text-xs sm:text-sm text-gray-600">
                                Врач
                              </p>
                              <p className="text-sm sm:text-lg font-semibold">
                                {getDoctorName(booking.doctorId)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {booking.patientName && (
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <Icon name="User" size={18} className="mt-0.5" />
                              <div>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  Пациент
                                </p>
                                <p className="text-sm sm:text-lg font-semibold">
                                  {booking.patientName}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-200 border border-green-300 rounded"></div>
          <span>Подтверждено</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
          <span>В ожидании</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-200 border border-red-300 rounded"></div>
          <span>Отменено</span>
        </div>
      </div>
    </div>
  );
};

export default RoomBookingCalendar;
