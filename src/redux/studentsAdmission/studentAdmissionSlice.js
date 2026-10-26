import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getStudentAdmissions,
  getAllStudentAdmissions,
  getStudentAdmissionById,
  createStudentAdmission,
  updateStudentAdmission,
  deleteStudentAdmission,
  getClassStudentSummaryByToken,
  getAllStudentAdmissionsReport,
} from "./studentAdmission.service";

// Fetch Admissions (Token-scoped by default, accepts query filters)
export const fetchStudentAdmissions = createAsyncThunk(
  "studentAdmissions/fetchStudentAdmissions",
  async (filters, { rejectWithValue }) => {
    try {
      return await getStudentAdmissions(filters);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch student admissions",
      );
    }
  },
);

// Fetch All Admissions (Direct query)
export const fetchAllStudentAdmissions = createAsyncThunk(
  "studentAdmissions/fetchAllStudentAdmissions",
  async (filters, { rejectWithValue }) => {
    try {
      return await getAllStudentAdmissions(filters);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all student admissions",
      );
    }
  },
);

// Fetch By Id
export const fetchStudentAdmissionById = createAsyncThunk(
  "studentAdmissions/fetchStudentAdmissionById",
  async (id, { rejectWithValue }) => {
    try {
      return await getStudentAdmissionById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch student admission",
      );
    }
  },
);

// Create
export const createStudentAdmissionThunk = createAsyncThunk(
  "studentAdmissions/createStudentAdmission",
  async (studentData, { rejectWithValue }) => {
    try {
      return await createStudentAdmission(studentData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create student admission",
      );
    }
  },
);

// Update
export const updateStudentAdmissionThunk = createAsyncThunk(
  "studentAdmissions/updateStudentAdmission",
  async ({ id, studentData }, { rejectWithValue }) => {
    try {
      return await updateStudentAdmission(id, studentData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update student admission",
      );
    }
  },
);

// Delete
export const deleteStudentAdmissionThunk = createAsyncThunk(
  "studentAdmissions/deleteStudentAdmission",
  async (id, { rejectWithValue }) => {
    try {
      await deleteStudentAdmission(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete student admission",
      );
    }
  },
);

// Class Student Summary & Roster
export const fetchClassStudentSummaryByToken = createAsyncThunk(
  "studentAdmissions/fetchClassStudentSummaryByToken",
  async (filters, { rejectWithValue }) => {
    try {
      return await getClassStudentSummaryByToken(filters);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch class student summary",
      );
    }
  },
);

// Admissions Report
export const fetchStudentAdmissionsReport = createAsyncThunk(
  "studentAdmissions/fetchStudentAdmissionsReport",
  async (filters, { rejectWithValue }) => {
    try {
      return await getAllStudentAdmissionsReport(filters);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch student admissions report",
      );
    }
  },
);

const unwrap = (payload) => payload?.data ?? payload;

const studentAdmissionSlice = createSlice({
  name: "studentAdmissions",
  initialState: {
    studentAdmissions: [],
    classStudentSummary: [],
    classSummaryDetails: null,
    admissionsReport: [],
    admissionsReportStats: null,
    studentAdmission: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearStudentAdmission(state) {
      state.studentAdmission = null;
    },
    clearClassStudentSummary(state) {
      state.classStudentSummary = [];
      state.classSummaryDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admissions (Token)
      .addCase(fetchStudentAdmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAdmissions.fulfilled, (state, action) => {
        state.loading = false;
        const data = unwrap(action.payload);
        state.studentAdmissions = Array.isArray(data) ? data : (data?.data ?? []);
      })
      .addCase(fetchStudentAdmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Admissions (Direct)
      .addCase(fetchAllStudentAdmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStudentAdmissions.fulfilled, (state, action) => {
        state.loading = false;
        const data = unwrap(action.payload);
        state.studentAdmissions = Array.isArray(data) ? data : (data?.data ?? []);
      })
      .addCase(fetchAllStudentAdmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Id
      .addCase(fetchStudentAdmissionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudentAdmissionById.fulfilled, (state, action) => {
        state.loading = false;
        state.studentAdmission = unwrap(action.payload);
      })
      .addCase(fetchStudentAdmissionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createStudentAdmissionThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStudentAdmissionThunk.fulfilled, (state, action) => {
        state.loading = false;
        const newRecord = unwrap(action.payload);
        if (newRecord && typeof newRecord === "object") {
          state.studentAdmissions.unshift(newRecord);
        }
      })
      .addCase(createStudentAdmissionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateStudentAdmissionThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStudentAdmissionThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = unwrap(action.payload);
        if (updated?.id) {
          const index = state.studentAdmissions.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.studentAdmissions[index] = updated;
          }
        }
        state.studentAdmission = updated;
      })
      .addCase(updateStudentAdmissionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteStudentAdmissionThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteStudentAdmissionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.studentAdmissions = state.studentAdmissions.filter(
          (item) => item.id !== action.payload,
        );
      })
      .addCase(deleteStudentAdmissionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Class Student Summary & Roster
      .addCase(fetchClassStudentSummaryByToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassStudentSummaryByToken.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        // Backend returns: { school_id, academic_year_id, total_classes, summary, students }
        state.classSummaryDetails = payload;
        state.classStudentSummary = Array.isArray(payload)
          ? payload
          : (payload?.students || payload?.data || []);
      })
      .addCase(fetchClassStudentSummaryByToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.classStudentSummary = [];
      })

      // Admissions Report
      .addCase(fetchStudentAdmissionsReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAdmissionsReport.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        const data = unwrap(payload);
        if (Array.isArray(data)) {
          state.admissionsReport = data;
          state.admissionsReportStats = payload?.stats || null;
        } else if (data && typeof data === "object") {
          state.admissionsReport = Array.isArray(data.admissions)
            ? data.admissions
            : Array.isArray(data.data)
              ? data.data
              : [];
          state.admissionsReportStats = data.stats || payload?.stats || null;
        } else {
          state.admissionsReport = [];
          state.admissionsReportStats = null;
        }
      })
      .addCase(fetchStudentAdmissionsReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStudentAdmission, clearClassStudentSummary } =
  studentAdmissionSlice.actions;

export default studentAdmissionSlice.reducer;
