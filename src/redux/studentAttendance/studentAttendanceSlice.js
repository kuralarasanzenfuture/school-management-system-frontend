import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllAttendance,
  getAllAttendanceByToken,
  markAttendance,
  getAttendanceBySessionId,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  lockAttendanceSession,
  unlockAttendanceSession,
  getAttendanceByStudentId,
} from "./studentAttendance.service.js";

// ================= GET ALL =================

export const fetchAttendance = createAsyncThunk(
  "attendance/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await getAllAttendance(filters);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch attendance",
      );
    }
  },
);

// ================= TOKEN =================

export const fetchAttendanceByToken = createAsyncThunk(
  "attendance/fetchToken",
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await getAllAttendanceByToken(filters);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch attendance",
      );
    }
  },
);

// ================= SESSION =================

export const fetchAttendanceBySession = createAsyncThunk(
  "attendance/fetchSession",
  async (id, { rejectWithValue }) => {
    try {
      return await getAttendanceBySessionId(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch session",
      );
    }
  },
);

// ================= STUDENT =================

export const fetchAttendanceByStudent = createAsyncThunk(
  "attendance/fetchStudent",
  async (id, { rejectWithValue }) => {
    try {
      return await getAttendanceByStudentId(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch student attendance",
      );
    }
  },
);

// ================= SINGLE =================

export const fetchAttendanceById = createAsyncThunk(
  "attendance/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getAttendanceById(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch attendance",
      );
    }
  },
);

// ================= CREATE =================

export const addAttendance = createAsyncThunk(
  "attendance/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await markAttendance(payload);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark attendance",
      );
    }
  },
);

// ================= UPDATE =================

export const editAttendance = createAsyncThunk(
  "attendance/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateAttendance(id, payload);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update attendance",
      );
    }
  },
);

// ================= DELETE =================

export const removeAttendance = createAsyncThunk(
  "attendance/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAttendance(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete attendance",
      );
    }
  },
);

// ================= LOCK =================

export const lockSession = createAsyncThunk(
  "attendance/lock",
  async (id, { rejectWithValue }) => {
    try {
      return await lockAttendanceSession(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to lock session",
      );
    }
  },
);

// ================= UNLOCK =================

export const unlockSession = createAsyncThunk(
  "attendance/unlock",
  async (id, { rejectWithValue }) => {
    try {
      return await unlockAttendanceSession(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to unlock session",
      );
    }
  },
);

const initialState = {
  attendances: [],
  tokenAttendances: [],
  attendance: null,
  attendanceBySession: [],
  attendanceByStudent: [],

  loading: false,
  submitting: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,

  reducers: {
    clearAttendance(state) {
      state.attendance = null;
    },

    clearAttendanceError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ================= FETCH =================

      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload.data ?? action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= TOKEN =================

      .addCase(fetchAttendanceByToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceByToken.fulfilled, (state, action) => {
        state.loading = false;
        state.tokenAttendances = action.payload.data ?? action.payload;
      })
      .addCase(fetchAttendanceByToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= SESSION =================

      .addCase(fetchAttendanceBySession.fulfilled, (state, action) => {
        state.attendanceBySession = action.payload.data ?? action.payload;
      })

      // ================= STUDENT =================

      .addCase(fetchAttendanceByStudent.fulfilled, (state, action) => {
        state.attendanceByStudent = action.payload.data ?? action.payload;
      })

      // ================= SINGLE =================

      .addCase(fetchAttendanceById.fulfilled, (state, action) => {
        state.attendance = action.payload.data ?? action.payload;
      })

      // ================= CREATE =================

      .addCase(addAttendance.pending, (state) => {
        state.submitting = true;
      })
      .addCase(addAttendance.fulfilled, (state, action) => {
        state.submitting = false;

        const item = action.payload.data ?? action.payload;

        if (item?.id) {
          state.attendances.unshift(item);
        }
      })
      .addCase(addAttendance.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // ================= UPDATE =================

      .addCase(editAttendance.pending, (state) => {
        state.submitting = true;
      })
      .addCase(editAttendance.fulfilled, (state, action) => {
        state.submitting = false;

        const updated = action.payload.data ?? action.payload;

        const index = state.attendances.findIndex((a) => a.id === updated.id);

        if (index !== -1) {
          state.attendances[index] = updated;
        }

        state.attendance = updated;
      })
      .addCase(editAttendance.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // ================= DELETE =================

      .addCase(removeAttendance.fulfilled, (state, action) => {
        state.attendances = state.attendances.filter(
          (a) => a.id !== action.payload,
        );
      })

      // ================= LOCK =================

      .addCase(lockSession.fulfilled, (state, action) => {
        state.attendance = action.payload.data ?? action.payload;
      })

      // ================= UNLOCK =================

      .addCase(unlockSession.fulfilled, (state, action) => {
        state.attendance = action.payload.data ?? action.payload;
      });
  },
});

export const { clearAttendance, clearAttendanceError } =
  attendanceSlice.actions;

export default attendanceSlice.reducer;
