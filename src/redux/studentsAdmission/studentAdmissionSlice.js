import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getStudentAdmissions,
  getStudentAdmissionById,
  createStudentAdmission,
  updateStudentAdmission,
  deleteStudentAdmission,
} from "./studentAdmission.service";

// Fetch All
export const fetchStudentAdmissions = createAsyncThunk(
  "studentAdmissions/fetchStudentAdmissions",
  async (_, { rejectWithValue }) => {
    try {
      return await getStudentAdmissions();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch student admissions"
      );
    }
  }
);

// Fetch By Id
export const fetchStudentAdmissionById = createAsyncThunk(
  "studentAdmissions/fetchStudentAdmissionById",
  async (id, { rejectWithValue }) => {
    try {
      return await getStudentAdmissionById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch student admission"
      );
    }
  }
);

// Create
export const createStudentAdmissionThunk = createAsyncThunk(
  "studentAdmissions/createStudentAdmission",
  async (studentData, { rejectWithValue }) => {
    try {
      return await createStudentAdmission(studentData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create student admission"
      );
    }
  }
);

// Update
export const updateStudentAdmissionThunk = createAsyncThunk(
  "studentAdmissions/updateStudentAdmission",
  async ({ id, studentData }, { rejectWithValue }) => {
    try {
      return await updateStudentAdmission(id, studentData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update student admission"
      );
    }
  }
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
        error.response?.data?.message || "Failed to delete student admission"
      );
    }
  }
);

const unwrap = (payload) => payload?.data ?? payload;

const studentAdmissionSlice = createSlice({
  name: "studentAdmissions",
  initialState: {
    studentAdmissions: [],
    studentAdmission: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearStudentAdmission(state) {
      state.studentAdmission = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchStudentAdmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAdmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.studentAdmissions = unwrap(action.payload);
      })
      .addCase(fetchStudentAdmissions.rejected, (state, action) => {
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
        state.studentAdmissions.push(unwrap(action.payload));
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

        const index = state.studentAdmissions.findIndex(
          (item) => item.id === updated.id
        );

        if (index !== -1) {
          state.studentAdmissions[index] = updated;
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
          (item) => item.id !== action.payload
        );
      })
      .addCase(deleteStudentAdmissionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStudentAdmission } = studentAdmissionSlice.actions;

export default studentAdmissionSlice.reducer;