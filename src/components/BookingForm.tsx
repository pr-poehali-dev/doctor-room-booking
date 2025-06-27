import { useState } from "react";
import { useBookingStore } from "@/lib/bookingStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

const BookingForm = () => {
  const { rooms, doctors, addBooking } = useBookingStore();
  const [formData, setFormData] = useState({
    roomId: "",
    doctorId: "",
    date: "",
    startTime: "",
    endTime: "",
    patientName: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.roomId ||
      !formData.doctorId ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    addBooking({
      roomId: formData.roomId,
      doctorId: formData.doctorId,
      startTime: startDateTime,
      endTime: endDateTime,
      patientName: formData.patientName,
      status: "confirmed",
      notes: formData.notes,
    });

    toast.success("Бронирование успешно создано!");

    // Reset form
    setFormData({
      roomId: "",
      doctorId: "",
      date: "",
      startTime: "",
      endTime: "",
      patientName: "",
      notes: "",
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Calendar" size={24} />
          Новое бронирование
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room">Кабинет *</Label>
              <Select
                value={formData.roomId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, roomId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите кабинет" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} - {room.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">Врач *</Label>
              <Select
                value={formData.doctorId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, doctorId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите врача" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Дата *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Время начала *</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Время окончания *</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientName">Пациент</Label>
            <Input
              placeholder="Имя пациента"
              value={formData.patientName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  patientName: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания</Label>
            <Input
              placeholder="Дополнительная информация"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>

          <Button type="submit" className="w-full">
            <Icon name="Check" size={16} className="mr-2" />
            Создать бронирование
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
