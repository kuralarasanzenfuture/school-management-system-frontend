import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getEmployeeLeaveTypes,
  getEmployeeLeaveTypeById,
  createEmployeeLeaveType,
  updateEmployeeLeaveType,
  updateEmployeeLeaveTypeStatus,
  deleteEmployeeLeaveType,
} from "./employeeLeaveType.service.js";

// ======================
// Async Thunks
// ======================

export const fetchEmployeeLeaveTypes = createAsyncThunk(
  "employeeLeaveTypes/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getEmployeeLeaveTypes(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave types",
      );
    }
  },
);

export const fetchEmployeeLeaveTypeById = createAsyncThunk(
  "employeeLeaveTypes/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getEmployeeLeaveTypeById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave type",
      );
    }
  },
);

export const addEmployeeLeaveType = createAsyncThunk(
  "employeeLeaveTypes/create",
  async (data, { rejectWithValue }) => {
    try {
      return await createEmployeeLeaveType(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create leave type",
      );
    }
  },
);

export const editEmployeeLeaveType = createAsyncThunk(
  "employeeLeaveTypes/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateEmployeeLeaveType(id, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update leave type",
      );
    }
  },
);

export const toggleEmployeeLeaveTypeStatus = createAsyncThunk(
  "employeeLeaveTypes/toggleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await updateEmployeeLeaveTypeStatus(id, status);
      return { id, status, response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update employee leave type status",
      );
    }
  },
);

export const removeEmployeeLeaveType = createAsyncThunk(
  "employeeLeaveTypes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteEmployeeLeaveType(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete leave type",
      );
    }
  },
);

// ======================
// Initial State
// ======================

const initialState = {
  employeeLeaveTypes: [],
  selectedEmployeeLeaveType: null,
  loading: false,
  submitting: false,
  error: null,
};

// ======================
// Slice
// ======================

const employeeLeaveTypeSlice = createSlice({
  name: "employeeLeaveTypes",
  initialState,
  reducers: {
    clearEmployeeLeaveTypeError(state) {
      state.error = null;
    },
    clearSelectedEmployeeLeaveType(state) {
      state.selectedEmployeeLeaveType = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ======================
      // Fetch All
      // ======================
      .addCase(fetchEmployeeLeaveTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeLeaveTypes.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        if (Array.isArray(p)) {
          state.employeeLeaveTypes = p;
        } else if (Array.isArray(p?.data)) {
          state.employeeLeaveTypes = p.data;
        } else if (Array.isArray(p?.rows)) {
          state.employeeLeaveTypes = p.rows;
        } else if (Array.isArray(p?.leaveTypes)) {
          state.employeeLeaveTypes = p.leaveTypes;
        } else {
          state.employeeLeaveTypes = [];
        }
      })
      .addCase(fetchEmployeeLeaveTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ======================
      // Fetch By Id
      // ======================
      .addCase(fetchEmployeeLeaveTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeLeaveTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEmployeeLeaveType =
          action.payload?.data || action.payload?.leaveType || action.payload;
      })
      .addCase(fetchEmployeeLeaveTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ======================
      // Create
      // ======================
      .addCase(addEmployeeLeaveType.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addEmployeeLeaveType.fulfilled, (state, action) => {
        state.submitting = false;

        const newItem =
          action.payload?.leaveType ||
          action.payload?.data ||
          action.payload;

        if (newItem) {
          state.employeeLeaveTypes.unshift(newItem);
        }
      })
      .addCase(addEmployeeLeaveType.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // ======================
      // Update
      // ======================
      .addCase(editEmployeeLeaveType.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(editEmployeeLeaveType.fulfilled, (state, action) => {
        state.submitting = false;

        const updated =
          action.payload?.new_data ||
          action.payload?.updatedLeaveType ||
          action.payload?.leaveType ||
          action.payload?.data ||
          action.payload;

        if (updated?.id) {
          const index = state.employeeLeaveTypes.findIndex(
            (item) => item.id === updated.id,
          );

          if (index !== -1) {
            state.employeeLeaveTypes[index] = updated;
          }

          state.selectedEmployeeLeaveType = updated;
        }
      })
      .addCase(editEmployeeLeaveType.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // ======================
      // Toggle Status
      // ======================
      .addCase(toggleEmployeeLeaveTypeStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const item = state.employeeLeaveTypes.find((lt) => lt.id === id);
        if (item) {
          item.status = status;
        }
        if (state.selectedEmployeeLeaveType?.id === id) {
          state.selectedEmployeeLeaveType.status = status;
        }
      })

      // ======================
      // Delete
      // ======================
      .addCase(removeEmployeeLeaveType.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(removeEmployeeLeaveType.fulfilled, (state, action) => {
        state.submitting = false;

        state.employeeLeaveTypes = state.employeeLeaveTypes.filter(
          (item) => item.id !== action.payload,
        );
      })
      .addCase(removeEmployeeLeaveType.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearEmployeeLeaveTypeError, clearSelectedEmployeeLeaveType } =
  employeeLeaveTypeSlice.actions;

export default employeeLeaveTypeSlice.reducer;
