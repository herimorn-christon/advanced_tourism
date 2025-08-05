import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  destination_name: string;
  total_rooms: number;
  vr_rooms: number;
  avg_rating: number;
  rooms?: Room[];
  media?: Media[];
}

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  description: string;
  capacity: number;
  price_per_night: number;
  has_vr: boolean;
  media?: Media[];
}

interface Media {
  id: string;
  file_path: string;
  vr_file_path?: string;
  file_type: string;
  is_vr: boolean;
  is_primary: boolean;
}

interface HotelState {
  hotels: Hotel[];
  currentHotel: Hotel | null;
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: HotelState = {
  hotels: [],
  currentHotel: null,
  currentRoom: null,
  isLoading: false,
  error: null,
};

export const fetchHotels = createAsyncThunk(
  'hotel/fetchHotels',
  async (params: { destination?: string; hasVr?: boolean; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params.destination) queryParams.append('destination', params.destination);
    if (params.hasVr) queryParams.append('hasVr', 'true');
    if (params.page) queryParams.append('page', params.page.toString());

    const response = await fetch(`/api/hotels?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch hotels');
    return response.json();
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotel/fetchHotelById',
  async (id: string) => {
    const response = await fetch(`/api/hotels/${id}`);
    if (!response.ok) throw new Error('Failed to fetch hotel');
    return response.json();
  }
);

export const fetchRoomById = createAsyncThunk(
  'hotel/fetchRoomById',
  async (id: string) => {
    const response = await fetch(`/api/rooms/${id}`);
    if (!response.ok) throw new Error('Failed to fetch room');
    return response.json();
  }
);

const hotelSlice = createSlice({
  name: 'hotel',
  initialState,
  reducers: {
    clearCurrentHotel: (state) => {
      state.currentHotel = null;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hotels = action.payload;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch hotels';
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.currentHotel = action.payload;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.currentRoom = action.payload;
      });
  },
});

export const { clearCurrentHotel, clearCurrentRoom, clearError } = hotelSlice.actions;
export default hotelSlice.reducer;