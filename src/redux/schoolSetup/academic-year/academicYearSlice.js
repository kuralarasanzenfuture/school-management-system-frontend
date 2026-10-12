import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAcademicYears,
  getAcademicYearById,
  getAcademicYearsBySchool,
  createAcademicYear,
  updateAcademicYear,
  updateAcademicYearStatus,
  deleteAcademicYear,
} from "./academicYear.service.js";

// ================= Fetch All =================
export const fetchAcademicYears = createAsyncThunk(
  "academicYears/fetchAcademicYears",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAcademicYears(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch academic years",
      );
    }
  },
);

// ================= Fetch By School =================
export const fetchAcademicYearsBySchool = createAsyncThunk(
  "academicYears/fetchAcademicYearsBySchool",
  async (arg, { rejectWithValue }) => {
    try {
      const schoolId = typeof arg === "object" ? arg.schoolId : arg;
      const params = typeof arg === "object" ? arg.params : {};
      return await getAcademicYearsBySchool(schoolId, params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch academic years",
      );
    }
  },
);

// ================= Fetch By ID =================
export const fetchAcademicYearById = createAsyncThunk(
  "academicYears/fetchAcademicYearById",
  async (id, { rejectWithValue }) => {
    try {
      return await getAcademicYearById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch academic year",
      );
    }
  },
);

// ================= Create =================
export const addAcademicYear = createAsyncThunk(
  "academicYears/addAcademicYear",
  async (academicYearData, { rejectWithValue }) => {
    try {
      return await createAcademicYear(academicYearData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create academic year",
      );
    }
  },
);

// ================= Update =================
export const editAcademicYear = createAsyncThunk(
  "academicYears/editAcademicYear",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateAcademicYear(id, formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update academic year",
      );
    }
  },
);

// ================= Toggle / Update Status =================
export const toggleAcademicYearStatus = createAsyncThunk(
  "academicYears/toggleAcademicYearStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await updateAcademicYearStatus(id, status);
      return res.data || res.academicYear || res;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update status",
      );
    }
  },
);

// ================= Delete =================
export const removeAcademicYear = createAsyncThunk(
  "academicYears/removeAcademicYear",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAcademicYear(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete academic year",
      );
    }
  },
);

// ================= Initial State =================
const initialState = {
  academicYears: [],
  academicYear: null,
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  loading: false,
  error: null,
};

// ================= Slice =================
const academicYearSlice = createSlice({
  name: "academicYears",
  initialState,
  reducers: {
    clearAcademicYearError: (state) => {
      state.error = null;
    },
    clearAcademicYear: (state) => {
      state.academicYear = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchAcademicYears.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAcademicYears.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        if (Array.isArray(p)) {
          state.academicYears = p;
          state.total = p.length;
        } else if (Array.isArray(p?.data)) {
          state.academicYears = p.data;
          state.total = p.total ?? p.data.length;
          state.page = p.page ?? 1;
          state.limit = p.limit ?? 20;
          state.totalPages = p.totalPages ?? 1;
        } else if (Array.isArray(p?.academicYears)) {
          state.academicYears = p.academicYears;
          state.total = p.total ?? p.academicYears.length;
          state.page = p.page ?? 1;
          state.limit = p.limit ?? 20;
          state.totalPages = p.totalPages ?? 1;
        } else {
          state.academicYears = [];
        }
      })
      .addCase(fetchAcademicYears.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By School
      .addCase(fetchAcademicYearsBySchool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAcademicYearsBySchool.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        if (Array.isArray(p)) {
          state.academicYears = p;
          state.total = p.length;
        } else if (Array.isArray(p?.data)) {
          state.academicYears = p.data;
          state.total = p.total ?? p.data.length;
        } else if (Array.isArray(p?.academicYears)) {
          state.academicYears = p.academicYears;
          state.total = p.total ?? p.academicYears.length;
        } else {
          state.academicYears = [];
        }
      })
      .addCase(fetchAcademicYearsBySchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Id
      .addCase(fetchAcademicYearById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAcademicYearById.fulfilled, (state, action) => {
        state.loading = false;
        state.academicYear =
          action.payload?.academicYear || action.payload?.data || action.payload;
      })
      .addCase(fetchAcademicYearById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(addAcademicYear.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAcademicYear.fulfilled, (state, action) => {
        state.loading = false;
        const newYear =
          action.payload?.data || action.payload?.academicYear || action.payload;
        if (newYear && newYear.id) {
          state.academicYears.push(newYear);
          state.total = (state.total || 0) + 1;
        }
      })
      .addCase(addAcademicYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(editAcademicYear.pending, (state) => {
        state.loading = true;
      })
      .addCase(editAcademicYear.fulfilled, (state, action) => {
        state.loading = false;
        const updated =
          action.payload?.data || action.payload?.academicYear || action.payload;
        if (updated && updated.id) {
          const index = state.academicYears.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.academicYears[index] = updated;
          }
          state.academicYear = updated;
        }
      })
      .addCase(editAcademicYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Status
      .addCase(toggleAcademicYearStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;
        const index = state.academicYears.findIndex(
          (item) => item.id === updated.id,
        );
        if (index !== -1) {
          state.academicYears[index] = {
            ...state.academicYears[index],
            ...updated,
          };
        }
        if (state.academicYear?.id === updated.id) {
          state.academicYear = { ...state.academicYear, ...updated };
        }
      })

      // Delete
      .addCase(removeAcademicYear.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeAcademicYear.fulfilled, (state, action) => {
        state.loading = false;
        state.academicYears = state.academicYears.filter(
          (item) => item.id !== action.payload,
        );
        state.total = Math.max(0, (state.total || 1) - 1);
      })
      .addCase(removeAcademicYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAcademicYearError, clearAcademicYear } =
  academicYearSlice.actions;

export default academicYearSlice.reducer;
