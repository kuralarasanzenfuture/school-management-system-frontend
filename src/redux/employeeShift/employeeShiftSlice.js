import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllEmployeeShifts,
  getEmployeeShiftById,
  createEmployeeShift,
  updateEmployeeShift,
  updateEmployeeShiftStatus,
  deleteEmployeeShift,
} from "./employeeShift.service.js";

// Fetch All
export const fetchEmployeeShifts = createAsyncThunk(
  "employeeShifts/fetchEmployeeShifts",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllEmployeeShifts(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee shifts",
      );
    }
  },
);

// Fetch By Id
export const fetchEmployeeShiftById = createAsyncThunk(
  "employeeShifts/fetchEmployeeShiftById",
  async (id, { rejectWithValue }) => {
    try {
      return await getEmployeeShiftById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee shift",
      );
    }
  },
);

// Create
export const createEmployeeShiftThunk = createAsyncThunk(
  "employeeShifts/createEmployeeShift",
  async (shiftData, { rejectWithValue }) => {
    try {
      return await createEmployeeShift(shiftData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create employee shift",
      );
    }
  },
);

// Update
export const updateEmployeeShiftThunk = createAsyncThunk(
  "employeeShifts/updateEmployeeShift",
  async ({ id, shiftData }, { rejectWithValue }) => {
    try {
      return await updateEmployeeShift(id, shiftData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update employee shift",
      );
    }
  },
);

// Toggle Status
export const toggleEmployeeShiftStatus = createAsyncThunk(
  "employeeShifts/toggleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await updateEmployeeShiftStatus(id, status);
      return { id, status, response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update employee shift status",
      );
    }
  },
);

// Delete
export const deleteEmployeeShiftThunk = createAsyncThunk(
  "employeeShifts/deleteEmployeeShift",
  async (id, { rejectWithValue }) => {
    try {
      await deleteEmployeeShift(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete employee shift",
      );
    }
  },
);

const initialState = {
  employeeShifts: [],
  employeeShift: null,
  filters: {
    search: "",
    school_id: "",
    status: "",
  },
  loading: false,
  error: null,
};

const employeeShiftSlice = createSlice({
  name: "employeeShifts",
  initialState,
  reducers: {
    clearEmployeeShift(state) {
      state.employeeShift = null;
    },
    clearEmployeeShiftError(state) {
      state.error = null;
    },
    setShiftFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetShiftFilters(state) {
      state.filters = {
        search: "",
        school_id: "",
        status: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchEmployeeShifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeShifts.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        if (Array.isArray(p)) {
          state.employeeShifts = p;
        } else if (Array.isArray(p?.data)) {
          state.employeeShifts = p.data;
        } else if (Array.isArray(p?.rows)) {
          state.employeeShifts = p.rows;
        } else if (Array.isArray(p?.shifts)) {
          state.employeeShifts = p.shifts;
        } else {
          state.employeeShifts = [];
        }
      })
      .addCase(fetchEmployeeShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Id
      .addCase(fetchEmployeeShiftById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployeeShiftById.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeShift = action.payload?.data ?? action.payload;
      })
      .addCase(fetchEmployeeShiftById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createEmployeeShiftThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEmployeeShiftThunk.fulfilled, (state, action) => {
        state.loading = false;
        const created =
          action.payload?.data || action.payload?.shift || action.payload;
        if (created) {
          state.employeeShifts.push(created);
        }
      })
      .addCase(createEmployeeShiftThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateEmployeeShiftThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEmployeeShiftThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated =
          action.payload?.new_data ||
          action.payload?.updatedShift ||
          action.payload?.data ||
          action.payload;

        if (updated?.id) {
          const index = state.employeeShifts.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.employeeShifts[index] = updated;
          }
          state.employeeShift = updated;
        }
      })
      .addCase(updateEmployeeShiftThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Status
      .addCase(toggleEmployeeShiftStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const item = state.employeeShifts.find((s) => s.id === id);
        if (item) {
          item.status = status;
        }
        if (state.employeeShift?.id === id) {
          state.employeeShift.status = status;
        }
      })

      // Delete
      .addCase(deleteEmployeeShiftThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEmployeeShiftThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeShifts = state.employeeShifts.filter(
          (item) => item.id !== action.payload,
        );
      })
      .addCase(deleteEmployeeShiftThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearEmployeeShift,
  clearEmployeeShiftError,
  setShiftFilters,
  resetShiftFilters,
} = employeeShiftSlice.actions;

export default employeeShiftSlice.reducer;

