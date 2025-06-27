export interface Room {
  id: string;
  name: string;
  type: "examination" | "surgery" | "consultation";
  capacity: number;
  equipment: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  avatar?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  doctorId: string;
  startTime: Date;
  endTime: Date;
  patientName?: string;
  status: "confirmed" | "pending" | "cancelled";
  notes?: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  isAvailable: boolean;
  bookingId?: string;
}

export interface NotificationData {
  id: string;
  type: "booking_created" | "booking_cancelled" | "booking_updated";
  message: string;
  timestamp: Date;
  bookingId: string;
}
