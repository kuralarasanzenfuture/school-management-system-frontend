import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  updateRoleStatus,
  deleteRole,
  checkRoleName,
} from "./roleService.js";

// Helper to extract clean error message
const extractErrorMessage = (err, fallback = "An unexpected error occurred") => {
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    fallback
  );
};

// Check Role Name Availability (GET /roles/check-name)
export const verifyRoleName = createAsyncThunk(
  "roles/verifyRoleName",
  async ({ name, excludeId = null }, { rejectWithValue }) => {
    try {
      return await checkRoleName(name, excludeId);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to verify role name"));
    }
  },
);

// Get Roles (supports search, filters, pagination, sorting)
export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getRoles(params);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to fetch roles"));
    }
  },
);

// Get Role By ID
export const fetchRoleById = createAsyncThunk(
  "roles/fetchRoleById",
  async (id, { rejectWithValue }) => {
    try {
      return await getRoleById(id);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to fetch role details"));
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
      return rejectWithValue(extractErrorMessage(err, "Failed to create role"));
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
      return rejectWithValue(extractErrorMessage(err, "Failed to update role"));
    }
  },
);

// Toggle/Update Role Status (PATCH /roles/status/:id)
export const toggleRoleStatus = createAsyncThunk(
  "roles/toggleRoleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await updateRoleStatus({ id, status });
      return { id, status, data: response.data || response };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to update role status"));
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
      return rejectWithValue(extractErrorMessage(err, "Failed to delete role"));
    }
  },
);

const roleSlice = createSlice({
  name: "roles",
  initialState: {
    roles: [],
    selectedRole: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
    loading: false,
    actionLoading: false,
    error: null,
    nameCheck: {
      checking: false,
      available: null,
      exists: null,
      role: null,
      error: null,
    },
  },
  reducers: {
    clearRoleError: (state) => {
      state.error = null;
    },
    resetNameCheck: (state) => {
      state.nameCheck = {
        checking: false,
        available: null,
        exists: null,
        role: null,
        error: null,
      };
    },
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = Array.isArray(action.payload?.data)
          ? action.payload.data
          : Array.isArray(action.payload)
          ? action.payload
          : [];

        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        } else if (Array.isArray(state.roles)) {
          state.pagination.total = state.roles.length;
          state.pagination.totalPages = Math.ceil(state.roles.length / state.pagination.limit) || 1;
        }
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Role By ID
      .addCase(fetchRoleById.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedRole = action.payload.data || action.payload;
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Create Role
      .addCase(addRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        const newRole = action.payload.data || action.payload;
        if (newRole && newRole.id) {
          state.roles.unshift(newRole);
          state.pagination.total += 1;
        }
      })
      .addCase(addRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Edit Role
      .addCase(editRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(editRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload.data || action.payload;
        if (updated && updated.id) {
          const index = state.roles.findIndex((role) => role.id === updated.id);
          if (index !== -1) {
            state.roles[index] = { ...state.roles[index], ...updated };
          }
          if (state.selectedRole?.id === updated.id) {
            state.selectedRole = { ...state.selectedRole, ...updated };
          }
        }
      })
      .addCase(editRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Toggle Role Status (PATCH /roles/status/:id)
      .addCase(toggleRoleStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(toggleRoleStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { id, status, data } = action.payload;
        const updatedRole = data?.data || data;
        const index = state.roles.findIndex((role) => role.id === Number(id));
        if (index !== -1) {
          if (updatedRole && updatedRole.id) {
            state.roles[index] = { ...state.roles[index], ...updatedRole };
          } else {
            state.roles[index].status = status;
          }
        }
        if (state.selectedRole?.id === Number(id)) {
          state.selectedRole.status = status;
        }
      })
      .addCase(toggleRoleStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete Role
      .addCase(removeRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(removeRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.roles = state.roles.filter((role) => role.id !== action.payload);
        if (state.pagination.total > 0) {
          state.pagination.total -= 1;
        }
      })
      .addCase(removeRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Verify Role Name (GET /roles/check-name)
      .addCase(verifyRoleName.pending, (state) => {
        state.nameCheck.checking = true;
        state.nameCheck.error = null;
      })
      .addCase(verifyRoleName.fulfilled, (state, action) => {
        state.nameCheck.checking = false;
        state.nameCheck.available = action.payload?.available ?? null;
        state.nameCheck.exists = action.payload?.exists ?? null;
        state.nameCheck.role = action.payload?.role ?? null;
        state.nameCheck.error = null;
      })
      .addCase(verifyRoleName.rejected, (state, action) => {
        state.nameCheck.checking = false;
        state.nameCheck.available = null;
        state.nameCheck.exists = null;
        state.nameCheck.role = null;
        state.nameCheck.error = action.payload;
      });
  },
});

export const {
  clearRoleError,
  resetNameCheck,
  setSelectedRole,
  setPage,
  setLimit,
} = roleSlice.actions;

export default roleSlice.reducer;

