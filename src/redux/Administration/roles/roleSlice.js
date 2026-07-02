import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getRoles, createRole, updateRole, deleteRole } from "./roleService.js";

// Get Roles
export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      return await getRoles();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Create Role
export const addRole = createAsyncThunk(
  "roles/addRole",
  async (roleData, { rejectWithValue }) => {
    try {
      return await createRole(roleData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  },
);

// Update Role
export const editRole = createAsyncThunk(
  "roles/editRole",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateRole({ id, formData });
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Delete Role
export const removeRole = createAsyncThunk(
  "roles/removeRole",
  async (id, { rejectWithValue }) => {
    try {
      await deleteRole(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const roleSlice = createSlice({
  name: "roles",
  initialState: {
    roles: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearRoleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.data || action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(addRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(addRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.unshift(action.payload.data || action.payload);
      })
      .addCase(addRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(editRole.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload;

        const index = state.roles.findIndex((role) => role.id === updated.id);

        if (index !== -1) {
          state.roles[index] = updated;
        }
      })

      // Delete
      .addCase(removeRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((role) => role.id !== action.payload);
      });
  },
});

export const { clearRoleError } = roleSlice.actions;

export default roleSlice.reducer;
