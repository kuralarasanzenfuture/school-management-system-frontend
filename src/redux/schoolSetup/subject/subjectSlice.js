import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  updateSubjectStatus,
} from "./subject.service.js";

// Fetch All
export const fetchSubjects = createAsyncThunk(
  "subjects/fetchSubjects",
  async (args = {}, { rejectWithValue }) => {
    try {
      let params = {};
      if (args && typeof args === "object") {
        params = args;
      } else if (args) {
        params = { school_id: args };
      }
      return await getSubjects(params);
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

// Toggle Status
export const toggleSubjectStatus = createAsyncThunk(
  "subjects/toggleSubjectStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await updateSubjectStatus(id, status);
      return { id, status, res };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update subject status",
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
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
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
        const p = action.payload;
        if (Array.isArray(p)) {
          state.subjects = p;
          state.total = p.length;
        } else if (p && Array.isArray(p.subjects)) {
          state.subjects = p.subjects;
          state.total = p.total ?? p.subjects.length;
          state.page = p.page ?? 1;
          state.limit = p.limit ?? 20;
          state.totalPages = p.totalPages ?? 1;
        } else if (p && Array.isArray(p.data)) {
          state.subjects = p.data;
          state.total = p.total ?? p.data.length;
          state.page = p.page ?? 1;
          state.limit = p.limit ?? 20;
          state.totalPages = p.totalPages ?? 1;
        } else {
          state.subjects = [];
          state.total = 0;
        }
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
        const item = unwrap(action.payload);
        if (item) {
          state.subjects.unshift(item);
        }
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
        if (updated && updated.id) {
          const index = state.subjects.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.subjects[index] = {
              ...state.subjects[index],
              ...updated,
            };
          }
        }
        state.subject = updated;
      })
      .addCase(updateSubjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Status
      .addCase(toggleSubjectStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const target = state.subjects.find((s) => String(s.id) === String(id));
        if (target) {
          target.status = status;
        }
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
