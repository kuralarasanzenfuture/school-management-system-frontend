import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAcademicYears,
  getAcademicYearById,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from "./academicYear.service.js";

// ================= Fetch All =================
export const fetchAcademicYears = createAsyncThunk(
  "academicYears/fetchAcademicYears",
  async (_, { rejectWithValue }) => {
    try {
      return await getAcademicYears();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch academic years",
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
        error.response?.data?.message || "Failed to fetch academic year",
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
        error.response?.data?.message || "Failed to create academic year",
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
        error.response?.data?.message || "Failed to update academic year",
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
        error.response?.data?.message || "Failed to delete academic year",
      );
    }
  },
);

// ================= Initial State =================
const initialState = {
  academicYears: [],
  academicYear: null,
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
        state.academicYears = action.payload;
      })
      .addCase(fetchAcademicYears.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Id
      .addCase(fetchAcademicYearById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAcademicYearById.fulfilled, (state, action) => {
        state.loading = false;
        state.academicYear = action.payload;
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
        state.academicYears.push(action.payload);
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

        const index = state.academicYears.findIndex(
          (item) => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.academicYears[index] = action.payload;
        }

        state.academicYear = action.payload;
      })
      .addCase(editAcademicYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
