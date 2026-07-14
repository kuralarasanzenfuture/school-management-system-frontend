import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllEmployeeAttendances as fetchAttendanceRecords,
  fetchAttendanceRange,
  getEmployeeAttendanceById as fetchAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "./employeeAttendance.service.js";

// ─────────────────────────── Async Thunks ────────────────────────────

// Fetch all records (supports ?date, ?school_id, ?employee_id, ?status)
export const getAttendanceRecords = createAsyncThunk(
  "employeeAttendance/getRecords",
  async (params, { rejectWithValue }) => {
    try {
      return await fetchAttendanceRecords(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
  },
);

// Fetch daily summary counts (present / absent / late / etc.)
export const getAttendanceSummary = createAsyncThunk(
  "employeeAttendance/getSummary",
  async (params, { rejectWithValue }) => {
    try {
      return await fetchAttendanceRange(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
  },
);

// Fetch single record by id
export const getAttendanceById = createAsyncThunk(
  "employeeAttendance/getById",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchAttendanceById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
  },
);

// Mark attendance (single or bulk array)
export const markAttendance = createAsyncThunk(
  "employeeAttendance/mark",
  async (payload, { rejectWithValue }) => {
    try {
      return await createAttendance(payload);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
  },
);

// Update an existing record
export const editAttendance = createAsyncThunk(
  "employeeAttendance/edit",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateAttendance(id, payload);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
  },
);

// Delete a record
export const removeAttendance = createAsyncThunk(
  "employeeAttendance/remove",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAttendance(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
  },
);

// ─────────────────────────── Initial State ────────────────────────────

const initialState = {
  records: [], // attendance rows for the selected date / filters
  summary: null, // { present, absent, late, half_day, leave, holiday, week_off, total }
  record: null, // single record being viewed / edited
  loading: false,
  summaryLoading: false,
  error: null,
};

// ─────────────────────────── Slice ────────────────────────────────────

const employeeAttendanceSlice = createSlice({
  name: "employeeAttendance",
  initialState,

  reducers: {
    clearAttendanceError(state) {
      state.error = null;
    },
    clearAttendanceRecord(state) {
      state.record = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ── Fetch records ──────────────────────────────────────────────
      .addCase(getAttendanceRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttendanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records ?? action.payload ?? [];
      })
      .addCase(getAttendanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch attendance";
      })

      // ── Fetch summary ──────────────────────────────────────────────
      .addCase(getAttendanceSummary.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(getAttendanceSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload.summary ?? action.payload ?? null;
      })
      .addCase(getAttendanceSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.error = action.payload ?? "Failed to fetch summary";
      })

      // ── Fetch by id ────────────────────────────────────────────────
      .addCase(getAttendanceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAttendanceById.fulfilled, (state, action) => {
        state.loading = false;
        state.record = action.payload.record ?? action.payload ?? null;
      })
      .addCase(getAttendanceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch record";
      })

      // ── Mark attendance ────────────────────────────────────────────
      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
        // Backend may return a single record or an array (bulk)
        const incoming = action.payload.record ?? action.payload;
        const newRecords = Array.isArray(incoming) ? incoming : [incoming];

        newRecords.forEach((newRecord) => {
          const existingIndex = state.records.findIndex(
            (existingRecord) => existingRecord.id === newRecord.id,
          );
          if (existingIndex !== -1) {
            state.records[existingIndex] = newRecord;
          } else {
            state.records.push(newRecord);
          }
        });
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to mark attendance";
      })

      // ── Edit attendance ────────────────────────────────────────────
      .addCase(editAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const updatedRecord = action.payload.record ?? action.payload;
        const existingIndex = state.records.findIndex(
          (existingRecord) => existingRecord.id === updatedRecord.id,
        );
        if (existingIndex !== -1) {
          state.records[existingIndex] = updatedRecord;
        }
        state.record = updatedRecord;
      })
      .addCase(editAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update attendance";
      })

      // ── Remove attendance ──────────────────────────────────────────
      .addCase(removeAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = state.records.filter(
          (existingRecord) => existingRecord.id !== action.payload,
        );
      })
      .addCase(removeAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to delete record";
      });
  },
});

export const { clearAttendanceError, clearAttendanceRecord } =
  employeeAttendanceSlice.actions;

export default employeeAttendanceSlice.reducer;
