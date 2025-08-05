import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface MediaFile {
  id: string;
  file_path: string;
  vr_file_path?: string;
  file_type: string;
  is_vr: boolean;
  is_primary: boolean;
  original_name: string;
}

interface MediaState {
  files: MediaFile[];
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

const initialState: MediaState = {
  files: [],
  isUploading: false,
  uploadProgress: 0,
  error: null,
};

export const uploadMedia = createAsyncThunk(
  'media/upload',
  async ({ 
    files, 
    entityType, 
    entityId, 
    isVRConversion = false 
  }: { 
    files: FileList; 
    entityType: string; 
    entityId: string; 
    isVRConversion?: boolean; 
  }, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('isVRConversion', isVRConversion.toString());

    const response = await fetch(`/api/media/upload/${entityType}/${entityId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }
);

export const fetchMedia = createAsyncThunk(
  'media/fetch',
  async ({ entityType, entityId }: { entityType: string; entityId: string }) => {
    const response = await fetch(`/api/media/${entityType}/${entityId}`);
    if (!response.ok) throw new Error('Failed to fetch media');
    return response.json();
  }
);

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetUpload: (state) => {
      state.isUploading = false;
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadMedia.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadMedia.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.files = [...state.files, ...action.payload.files];
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.error.message || 'Upload failed';
      })
      .addCase(fetchMedia.fulfilled, (state, action) => {
        state.files = action.payload;
      });
  },
});

export const { clearError, resetUpload } = mediaSlice.actions;
export default mediaSlice.reducer;