import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "./subject.service.js";

// Fetch All
export const fetchSubjects = createAsyncThunk(
  "subjects/fetchSubjects",
  async (schoolId, { rejectWithValue }) => {
    try {
      return await getSubjects(schoolId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subjects",
      );
    }
  },
);

// Fetch By Id
export const fetchSubjectById = createAsyncThunk(
  "subjects/fetchSubjectById",
  async (id, { rejectWithValue }) => {
    try {
      return await getSubjectById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subject",
      );
    }
  },
);

// Create
export const createSubjectThunk = createAsyncThunk(
  "subjects/createSubject",
  async (subjectData, { rejectWithValue }) => {
    try {
      return await createSubject(subjectData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create subject",
      );
    }
  },
);

// Update
export const updateSubjectThunk = createAsyncThunk(
  "subjects/updateSubject",
  async ({ id, subjectData }, { rejectWithValue }) => {
    try {
      return await updateSubject(id, subjectData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update subject",
      );
    }
  },
);

// Delete
export const deleteSubjectThunk = createAsyncThunk(
  "subjects/deleteSubject",
  async (id, { rejectWithValue }) => {
    try {
      await deleteSubject(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete subject",
      );
    }
  },
);

const unwrap = (payload) => payload?.data ?? payload;

const subjectSlice = createSlice({
  name: "subjects",
  initialState: {
    subjects: [],
    subject: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSubject(state) {
      state.subject = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = unwrap(action.payload);
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Id
      .addCase(fetchSubjectById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.subject = unwrap(action.payload);
      })
      .addCase(fetchSubjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createSubjectThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSubjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects.push(unwrap(action.payload));
      })
      .addCase(createSubjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateSubjectThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSubjectThunk.fulfilled, (state, action) => {
        state.loading = false;

        const updated = unwrap(action.payload);

        const index = state.subjects.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.subjects[index] = updated;
        }

        state.subject = updated;
      })
      .addCase(updateSubjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteSubjectThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSubjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = state.subjects.filter(
          (item) => item.id !== action.payload,
        );
      })
      .addCase(deleteSubjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubject } = subjectSlice.actions;

export default subjectSlice.reducer;
