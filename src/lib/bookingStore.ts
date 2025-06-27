import { create } from "zustand";
import { Room, Doctor, Booking, NotificationData } from "@/types/booking";
import { wsManager } from "./websocket";

interface BookingStore {
  rooms: Room[];
  doctors: Doctor[];
  bookings: Booking[];
  notifications: NotificationData[];

  // Actions
  addBooking: (booking: Omit<Booking, "id">) => void;
  cancelBooking: (bookingId: string) => void;
  deleteBooking: (bookingId: string) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  addNotification: (
    notification: Omit<NotificationData, "id" | "timestamp">,
  ) => void;
  clearNotifications: () => void;
  getRoomBookings: (roomId: string) => Booking[];
  getDoctorBookings: (doctorId: string) => Booking[];
  // WebSocket синхронизация
  syncAddBooking: (booking: Omit<Booking, "id">) => void;
  syncUpdateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  syncDeleteBooking: (bookingId: string) => void;
  syncCancelBooking: (bookingId: string) => void;
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
  { id: "1", name: "Цветкова Светлана Геннадиевна", specialization: "Врач" },
  { id: "2", name: "Юнина Светлана Владимировна", specialization: "Врач" },
  { id: "3", name: "Иржаева Ланна Николаевна", specialization: "Врач" },
  { id: "4", name: "Иржаев Денис Игоревич", specialization: "Врач" },
  { id: "5", name: "Буланова Анна Сергеевна", specialization: "Врач" },
  { id: "6", name: "Цветков Алексей Николаевич", specialization: "Врач" },
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

    // Отправляем изменение через WebSocket
    wsManager.send({
      type: "booking_created",
      data: newBooking,
      timestamp: Date.now(),
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

    // Отправляем изменение через WebSocket
    wsManager.send({
      type: "booking_cancelled",
      data: { bookingId },
      timestamp: Date.now(),
    });
  },

  deleteBooking: (bookingId) => {
    const booking = get().bookings.find((b) => b.id === bookingId);
    const doctor = get().doctors.find((d) => d.id === booking?.doctorId);
    const room = get().rooms.find((r) => r.id === booking?.roomId);

    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== bookingId),
    }));

    get().addNotification({
      type: "booking_cancelled",
      message: `Запись в кабинет ${room?.name} удалена для ${doctor?.name}`,
      bookingId,
    });

    // Отправляем изменение через WebSocket
    wsManager.send({
      type: "booking_deleted",
      data: { bookingId },
      timestamp: Date.now(),
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

    // Отправляем изменение через WebSocket
    wsManager.send({
      type: "booking_updated",
      data: { bookingId, updates },
      timestamp: Date.now(),
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

  // WebSocket методы для синхронизации без отправки обратно
  syncAddBooking: (bookingData) => {
    const newBooking: Booking = {
      ...bookingData,
      id: bookingData.id || Date.now().toString(),
    };

    set((state) => ({
      bookings: [...state.bookings, newBooking],
    }));
  },

  syncUpdateBooking: (bookingId, updates) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, ...updates } : b,
      ),
    }));
  },

  syncDeleteBooking: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== bookingId),
    }));
  },

  syncCancelBooking: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" as const } : b,
      ),
    }));
  },
}));
