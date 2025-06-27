import { create } from "zustand";
import { Room, Doctor, Booking, NotificationData } from "@/types/booking";

interface BookingStore {
  rooms: Room[];
  doctors: Doctor[];
  bookings: Booking[];
  notifications: NotificationData[];

  // Actions
  addBooking: (booking: Omit<Booking, "id">) => void;
  cancelBooking: (bookingId: string) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  addNotification: (
    notification: Omit<NotificationData, "id" | "timestamp">,
  ) => void;
  clearNotifications: () => void;
  getRoomBookings: (roomId: string) => Booking[];
  getDoctorBookings: (doctorId: string) => Booking[];
}

// Mock data
const mockRooms: Room[] = [
  {
    id: "1",
    name: "Малый",
  },
  {
    id: "2",
    name: "Большой",
  },
  {
    id: "3",
    name: "Оранжерея",
  },
  {
    id: "4",
    name: "зал",
  },
];

const mockDoctors: Doctor[] = [
  { id: "1", name: "Иванов И.И.", specialization: "Терапевт" },
  { id: "2", name: "Петрова А.С.", specialization: "Кардиолог" },
  { id: "3", name: "Сидоров П.М.", specialization: "Хирург" },
];

const mockBookings: Booking[] = [
  {
    id: "1",
    roomId: "1",
    doctorId: "1",
    startTime: new Date(2025, 5, 27, 9, 0),
    endTime: new Date(2025, 5, 27, 10, 0),
    patientName: "Иванов Петр",
    status: "confirmed",
  },
  {
    id: "2",
    roomId: "2",
    doctorId: "2",
    startTime: new Date(2025, 5, 27, 14, 0),
    endTime: new Date(2025, 5, 27, 15, 30),
    patientName: "Сидорова Мария",
    status: "confirmed",
  },
];

export const useBookingStore = create<BookingStore>((set, get) => ({
  rooms: mockRooms,
  doctors: mockDoctors,
  bookings: mockBookings,
  notifications: [],

  addBooking: (bookingData) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
    };

    const doctor = get().doctors.find((d) => d.id === bookingData.doctorId);
    const room = get().rooms.find((r) => r.id === bookingData.roomId);

    set((state) => ({
      bookings: [...state.bookings, newBooking],
    }));

    get().addNotification({
      type: "booking_created",
      message: `Кабинет ${room?.name} забронирован для ${doctor?.name}`,
      bookingId: newBooking.id,
    });
  },

  cancelBooking: (bookingId) => {
    const booking = get().bookings.find((b) => b.id === bookingId);
    const doctor = get().doctors.find((d) => d.id === booking?.doctorId);
    const room = get().rooms.find((r) => r.id === booking?.roomId);

    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" as const } : b,
      ),
    }));

    get().addNotification({
      type: "booking_cancelled",
      message: `Бронирование кабинета ${room?.name} отменено для ${doctor?.name}`,
      bookingId,
    });
  },

  updateBooking: (bookingId, updates) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, ...updates } : b,
      ),
    }));

    get().addNotification({
      type: "booking_updated",
      message: `Бронирование обновлено`,
      bookingId,
    });
  },

  addNotification: (notificationData) => {
    const notification: NotificationData = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 10),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  getRoomBookings: (roomId) => {
    return get().bookings.filter(
      (b) => b.roomId === roomId && b.status !== "cancelled",
    );
  },

  getDoctorBookings: (doctorId) => {
    return get().bookings.filter(
      (b) => b.doctorId === doctorId && b.status !== "cancelled",
    );
  },
}));
