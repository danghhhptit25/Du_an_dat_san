export interface TimeSlot {
  startTime: string;
  endTime: string;
  price: number;
  isBooked: boolean;
}

export interface Booking {
  _id: string;
  customerId: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  createdAt: string;
}

export interface RevenueStat {
  _id: string;
  totalRevenue: number;
  totalBookings: number;
}