import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllEmployeeAttendances as fetchAttendanceRecords,
  fetchAttendanceRange,
  getEmployeeAttendanceById as fetchAttendanceById,
  getEmployeeAttendanceByEmployeeId as fetchAttendanceByEmployeeId,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getTodayAttendance,
  checkOutAttendance,
  checkInAttendance,
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

// Fetch records for a specific employee
// NOTE: This thunk writes to the *myAttendance* namespace (myRecords,
// myLoading, myError, mySummary) so that it never collides with the
// admin-wide records loaded by getAttendanceRecords.
export const getEmployeeAttendanceByEmployeeId = createAsyncThunk(
  "employeeAttendance/getEmployeeAttendanceByEmployeeId",
  async ({ employeeId, filters }, { rejectWithValue }) => {
    try {
      return await fetchAttendanceByEmployeeId(employeeId, filters);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const employeeCheckIn = createAsyncThunk(
  "employeeAttendance/checkIn",
  async (payload, { rejectWithValue }) => {
    try {
      return await checkInAttendance(payload);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const employeeCheckOut = createAsyncThunk(
  "employeeAttendance/checkOut",
  async (payload, { rejectWithValue }) => {
    try {
      return await checkOutAttendance(payload);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const fetchTodayAttendance = createAsyncThunk(
  "employeeAttendance/today",
  async (_, { rejectWithValue }) => {
    try {
      return await getTodayAttendance();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// ─────────────────────────── Initial State ────────────────────────────

const initialState = {
  // Admin-wide records (loaded by getAttendanceRecords)
  records: [], // attendance rows for the selected date / filters
  summary: null, // { present, absent, late, half_day, leave, holiday, week_off, total }
  record: null, // single record being viewed / edited

  // Employee-specific records (loaded by getEmployeeAttendanceByEmployeeId)
  // Kept separate so that loading one employee's attendance never
  // overwrites another employee's (or the admin's) data.
  myRecords: [],
  mySummary: null,
  myLoading: false,
  myError: null,

  // Legacy / misc
  employeeAttendance: [],
  todayAttendance: null,
  loading: false,
  summaryLoading: false,
  error: null,
};

// ─────────────────────────── Helpers ──────────────────────────────────

/**
 * Upsert a single record into an array (by id).
 * Mutates the array in place (Immer handles immutability).
 */
function upsertRecord(arr, newRecord) {
  const idx = arr.findIndex((r) => r.id === newRecord.id);
  if (idx !== -1) {
    arr[idx] = newRecord;
  } else {
    arr.push(newRecord);
  }
}

/**
 * Remove a record (by id) from an array.
 */
function removeRecordById(arr, id) {
  return arr.filter((r) => r.id !== id);
}

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

      // ── Fetch records (admin-wide) ────────────────────────────────
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

      // ── Fetch summary ────────────────────────────────────────────
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

      // ── Fetch by id ──────────────────────────────────────────────
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

      // ── Mark attendance ──────────────────────────────────────────
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
          // Update admin-wide records
          upsertRecord(state.records, newRecord);
          // Also update employee-specific records so both views stay in sync
          upsertRecord(state.myRecords, newRecord);
        });
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to mark attendance";
      })

      // ── Edit attendance ──────────────────────────────────────────
      .addCase(editAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const updatedRecord = action.payload.record ?? action.payload;

        // Update admin-wide records
        const existingIndex = state.records.findIndex(
          (existingRecord) => existingRecord.id === updatedRecord.id,
        );
        if (existingIndex !== -1) {
          state.records[existingIndex] = updatedRecord;
        }

        // Also update employee-specific records
        const myExistingIndex = state.myRecords.findIndex(
          (existingRecord) => existingRecord.id === updatedRecord.id,
        );
        if (myExistingIndex !== -1) {
          state.myRecords[myExistingIndex] = updatedRecord;
        }

        state.record = updatedRecord;
      })
      .addCase(editAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update attendance";
      })

      // ── Remove attendance ────────────────────────────────────────
      .addCase(removeAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeAttendance.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from admin-wide records
        state.records = removeRecordById(state.records, action.payload);
        // Also remove from employee-specific records
        state.myRecords = removeRecordById(state.myRecords, action.payload);
      })
      .addCase(removeAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to delete record";
      })

      // ── Fetch by employee id (employee-specific) ─────────────────
      // Writes to myRecords / myLoading / myError / mySummary so it
      // never collides with the admin-wide records state.
      .addCase(getEmployeeAttendanceByEmployeeId.pending, (state) => {
        state.myLoading = true;
        state.myError = null;
      })
      // .addCase(getEmployeeAttendanceByEmployeeId.fulfilled, (state, action) => {
      //   state.myLoading = false;
      //   state.myError = null;

      //   const rawPayload = action.payload;

      //   // Handle multiple response shapes:
      //   //   Shape A: { data: [...], summary: {...} }
      //   //   Shape B: { logs: [...], summary: {...} }
      //   //   Shape C: [...]  (plain array)
      //   const records = rawPayload?.data ?? rawPayload?.logs ?? rawPayload;
      //   state.myRecords = Array.isArray(records) ? records : [];
      //   state.employeeAttendance = state.myRecords;

      //   // Extract summary from the *raw* payload (before extracting data),
      //   // so it is captured regardless of the response shape.
      //   if (rawPayload?.summary) state.mySummary = rawPayload.summary;
      // })
      .addCase(getEmployeeAttendanceByEmployeeId.fulfilled, (state, action) => {
        state.myLoading = false;
        state.myError = null;

        const rawPayload = action.payload;

        // Unpack nested payload structures correctly
        let records = [];
        let summary = null;

        if (Array.isArray(rawPayload)) {
          // Plain array response
          records = rawPayload;
        } else if (rawPayload && typeof rawPayload === "object") {
          // Check if logs are nested under rawPayload.data.logs or rawPayload.logs
          if (Array.isArray(rawPayload.data)) {
            records = rawPayload.data;
          } else if (rawPayload.data && Array.isArray(rawPayload.data.logs)) {
            records = rawPayload.data.logs;
            summary = rawPayload.data.summary;
          } else if (Array.isArray(rawPayload.logs)) {
            records = rawPayload.logs;
          }

          // Capture summary if present at root or inside data
          summary =
            summary || rawPayload.summary || rawPayload.data?.summary || null;
        }

        state.myRecords = records;
        state.employeeAttendance = records;
        state.mySummary = summary;
      })
      .addCase(getEmployeeAttendanceByEmployeeId.rejected, (state, action) => {
        state.myLoading = false;
        state.myError = action.payload;
      })

      // ── Check in ──────────────────────────────────────
      .addCase(employeeCheckIn.pending, (state) => {
        state.loading = true;
      })
      .addCase(employeeCheckIn.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(employeeCheckIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Check out ──────────────────────────────────────
      .addCase(employeeCheckOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(employeeCheckOut.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(employeeCheckOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTodayAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAttendance = action.payload;
      })
      .addCase(fetchTodayAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttendanceError, clearAttendanceRecord } =
  employeeAttendanceSlice.actions;

export default employeeAttendanceSlice.reducer;
