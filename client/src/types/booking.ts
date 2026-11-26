export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export interface Booking {
  _id: string;
  customerId: string;
  courtId: string;
  date: string; 
  startTime: string; 
  endTime: string; 
  totalPrice: number;
  status: BookingStatus;
  createdAt?: string;
}

export interface Slot {
  startTime: string;
  endTime: string;
  price: number;
  isBooked: boolean;
}

export interface CartItem {
  courtId: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface CreateBookingPayload {
  customerId: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
}

export interface Pagination {
  total: number;
  page: number;
  totalPages: number;
}

export interface BookingHistoryResponse {
  data: Booking[];
  pagination: Pagination;
}

export type StatsGroupBy = 'court' | 'day' | 'month';

export interface RevenueStat {
  _id: string;
  totalRevenue: number;
  totalBookings: number;
}