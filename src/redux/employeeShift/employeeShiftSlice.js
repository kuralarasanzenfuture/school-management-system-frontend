// src/redux/employeeShift/employeeShiftSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllEmployeeShifts,
  getEmployeeShiftById,
  createEmployeeShift,
  updateEmployeeShift,
  deleteEmployeeShift,
} from "./employeeShift.service.js";

// Fetch All
export const fetchEmployeeShifts = createAsyncThunk(
  "employeeShifts/fetchEmployeeShifts",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllEmployeeShifts();
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

const unwrap = (payload) => payload?.data ?? payload;

const employeeShiftSlice = createSlice({
  name: "employeeShifts",
  initialState: {
    employeeShifts: [],
    employeeShift: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearEmployeeShift(state) {
      state.employeeShift = null;
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
        state.employeeShifts = unwrap(action.payload);
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
        state.employeeShift = unwrap(action.payload);
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
        state.employeeShifts.push(unwrap(action.payload));
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

        const updated = unwrap(action.payload);

        const index = state.employeeShifts.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.employeeShifts[index] = updated;
        }

        state.employeeShift = updated;
      })
      .addCase(updateEmployeeShiftThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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

export const { clearEmployeeShift } = employeeShiftSlice.actions;

export default employeeShiftSlice.reducer;
