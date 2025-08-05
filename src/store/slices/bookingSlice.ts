import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Booking {
  id: string;
  booking_type: string;
  check_in_date?: string;
  check_out_date?: string;
  tour_date?: string;
  guests: number;
  total_price: number;
  status: string;
  payment_status: string;
  booking_reference: string;
  room_number?: string;
  hotel_name?: string;
  tour_title?: string;
  destination_name?: string;
}

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,
};

export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData: {
    bookingType: string;
    roomId?: string;
    tourId?: string;
    checkInDate?: string;
    checkOutDate?: string;
    tourDate?: string;
    guests: number;
    specialRequests?: string;
  }, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }

    return response.json();
  }
);

export const fetchMyBookings = createAsyncThunk(
  'booking/fetchMy',
  async (_, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await fetch('/api/bookings/my-bookings', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create booking';
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
      });
  },
});

export const { clearCurrentBooking, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;