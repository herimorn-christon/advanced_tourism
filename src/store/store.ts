import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import bookingSlice from './slices/bookingSlice';
import hotelSlice from './slices/hotelSlice';
import mediaSlice from './slices/mediaSlice';
import analyticsSlice from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    booking: bookingSlice,
    hotel: hotelSlice,
    media: mediaSlice,
    analytics: analyticsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;