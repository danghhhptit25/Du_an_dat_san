import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TimeSlot } from '../types/booking';

interface BookingState {
  selectedCourtId: string;
  selectedDate: string;
  cartSlots: TimeSlot[];
}

const initialState: BookingState = {
  selectedCourtId: 'san_bong_A',
  selectedDate: '2026-11-18',
  cartSlots: [],
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCourtId: (state, action: PayloadAction<string>) => {
      state.selectedCourtId = action.payload;
      state.cartSlots = [];
    },
    setDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
      state.cartSlots = [];
    },
    toggleSlot: (state, action: PayloadAction<TimeSlot>) => {
      const exists = state.cartSlots.some(
        (s) => s.startTime === action.payload.startTime
      );
      if (exists) {
        state.cartSlots = state.cartSlots.filter(
          (s) => s.startTime !== action.payload.startTime
        );
      } else {
        state.cartSlots.push(action.payload);
      }
    },
    clearCart: (state) => {
      state.cartSlots = [];
    },
  },
});

export const { setCourtId, setDate, toggleSlot, clearCart } = bookingSlice.actions;
export default bookingSlice.reducer;
