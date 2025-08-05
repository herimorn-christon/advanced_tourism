import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  vrViews: number;
  avgRating: number;
}

interface RecentBooking {
  id: string;
  booking_reference: string;
  total_price: number;
  status: string;
  created_at: string;
  hotel_name?: string;
  tour_title?: string;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface AnalyticsState {
  stats: DashboardStats;
  recentBookings: RecentBooking[];
  monthlyRevenue: MonthlyRevenue[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  stats: {
    totalBookings: 0,
    totalRevenue: 0,
    vrViews: 0,
    avgRating: 0,
  },
  recentBookings: [],
  monthlyRevenue: [],
  isLoading: false,
  error: null,
};

export const fetchDashboardAnalytics = createAsyncThunk(
  'analytics/fetchDashboard',
  async (_, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await fetch('/api/analytics/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  }
);

export const trackEvent = createAsyncThunk(
  'analytics/track',
  async (eventData: {
    eventType: string;
    entityType?: string;
    entityId?: string;
    metadata?: any;
  }) => {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) throw new Error('Failed to track event');
    return response.json();
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.recentBookings = action.payload.recentBookings;
        state.monthlyRevenue = action.payload.monthlyRevenue;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch analytics';
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;