import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { CartItem } from '../types/booking';

interface BookingState {
  items: CartItem[];
}

const initialState: BookingState = { items: [] };

export function slotKey(item: Pick<CartItem, 'courtId' | 'date' | 'startTime'>): string {
  return `${item.courtId}|${item.date}|${item.startTime}`;
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    addSlot(state, action: PayloadAction<CartItem>) {
      const exists = state.items.some((item) => slotKey(item) === slotKey(action.payload));
      if (!exists) state.items.push(action.payload);
    },
    removeSlot(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => slotKey(item) !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addSlot, removeSlot, clearCart } = bookingSlice.actions;
export default bookingSlice.reducer;

export const selectCartItems = (state: RootState): CartItem[] => state.booking.items;
export const selectCartCount = (state: RootState): number => state.booking.items.length;
export const selectCartTotal = (state: RootState): number =>
  state.booking.items.reduce((sum, item) => sum + item.price, 0);