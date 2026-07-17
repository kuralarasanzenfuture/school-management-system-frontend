import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProfileApi,
  updateProfileApi,
  uploadAvatarApi,
} from "./profile.service.js";

// ================= Fetch Profile =================
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await getProfileApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

// ================= Update Profile =================
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      return await updateProfileApi(profileData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile",
      );
    }
  },
);

// ================= Upload Avatar =================
export const uploadAvatar = createAsyncThunk(
  "profile/uploadAvatar",
  async (file, { rejectWithValue }) => {
    try {
      return await uploadAvatarApi(file);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload avatar",
      );
    }
  },
);

const initialState = {
  profile: null,
  loading: false,
  updating: false,
  uploadingAvatar: false,
  error: null,
  updateSuccess: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data || action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        state.profile = action.payload.data || action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })

      // Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadingAvatar = true;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.uploadingAvatar = false;
        state.profile = action.payload.data || action.payload;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileError, clearUpdateSuccess } = profileSlice.actions;

export default profileSlice.reducer;

// TODO: register this reducer in your root store, e.g.:
//   profile: profileSlice.reducer
// ProfilePage.jsx below reads from state.profile — rename there too if
// you pick a different key. It also reads state.auth.user directly to
// pre-fill the form, so fetchProfile is optional if your authUser
// already carries everything the form needs.
