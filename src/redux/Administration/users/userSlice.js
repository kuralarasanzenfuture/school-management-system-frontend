import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
} from "./userService.js";

// Helper to extract clean error messages from backend responses
const extractErrorMessage = (err, fallback = "An unexpected error occurred") => {
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    fallback
  );
};

// Fetch Users (supports query params: search, status, role_id, school_id, page, limit, sortBy, sortOrder)
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getUsers(params);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to fetch users"));
    }
  },
);

// Fetch User by ID
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      return await getUserById(id);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to fetch user details"));
    }
  },
);

// Create User
export const addUser = createAsyncThunk(
  "users/addUser",
  async (userData, { rejectWithValue }) => {
    try {
      return await createUser(userData);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to create user"));
    }
  },
);

// Update User
export const editUser = createAsyncThunk(
  "users/editUser",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateUser({ id, formData });
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to update user"));
    }
  },
);

// Update / Toggle User Status (PATCH /users/status/:id)
export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await updateUserStatus({ id, status });
      return { id, status, data: response.data || response };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to update user status"));
    }
  },
);

// Delete User
export const removeUser = createAsyncThunk(
  "users/removeUser",
  async (id, { rejectWithValue }) => {
    try {
      await deleteUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to delete user"));
    }
  },
);

const initialState = {
  users: [],
  selectedUser: null,
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  loading: false,
  actionLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const rawList = payload.users || payload.data || payload;
        state.users = Array.isArray(rawList) ? rawList : [];

        if (payload.total !== undefined) {
          state.total = payload.total;
          state.page = payload.page || 1;
          state.limit = payload.limit || 20;
          state.totalPages = payload.totalPages || 1;
        } else {
          state.total = state.users.length;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User by ID
      .addCase(fetchUserById.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedUser = action.payload?.data || action.payload?.user || action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Create User
      .addCase(addUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        const newUser = action.payload?.user || action.payload?.data || action.payload;
        if (newUser && typeof newUser === "object" && newUser.id) {
          state.users.unshift(newUser);
          state.total += 1;
        }
      })
      .addCase(addUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(editUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.error = null;
        const updatedUser =
          action.payload?.updatedUser ||
          action.payload?.data ||
          action.payload?.user ||
          action.payload;

        if (updatedUser && updatedUser.id) {
          const index = state.users.findIndex(
            (user) => Number(user.id) === Number(updatedUser.id),
          );
          if (index !== -1) {
            state.users[index] = { ...state.users[index], ...updatedUser };
          }
          if (state.selectedUser?.id === updatedUser.id) {
            state.selectedUser = { ...state.selectedUser, ...updatedUser };
          }
        }
      })
      .addCase(editUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Toggle / Update User Status
      .addCase(toggleUserStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { id, status } = action.payload;
        const index = state.users.findIndex((user) => Number(user.id) === Number(id));
        if (index !== -1) {
          state.users[index].status = status;
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(removeUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.error = null;
        state.users = state.users.filter(
          (user) => Number(user.id) !== Number(action.payload),
        );
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError, setSelectedUser } = userSlice.actions;

export default userSlice.reducer;
