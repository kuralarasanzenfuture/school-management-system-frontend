import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { changePasswordByUser } from "./changePassword.service.js";

// ================= Change Password =================
export const changePassword = createAsyncThunk(
  "changePassword/changePassword",
  async (
    { currentPassword, newPassword, confirmPassword },
    { rejectWithValue },
  ) => {
    try {
      return await changePasswordByUser({
        currentPassword,
        newPassword,
        confirmPassword,
      });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change password",
      );
    }
  },
);

const initialState = {
  loading: false,
  error: null,
  success: false,
};

const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState,
  reducers: {
    clearChangePasswordState: (state) => {
      state.error = null;
      state.success = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearChangePasswordState } = changePasswordSlice.actions;

export default changePasswordSlice.reducer;

// TODO (you mentioned you'll fill this in): register this reducer in your
// root store under whatever key you prefer, e.g.:
//   changePassword: changePasswordSlice.reducer
// The modal below reads from state.changePassword — rename there too if
// you pick a different key.
