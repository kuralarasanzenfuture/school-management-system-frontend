import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSubjectGroups,
  getSubjectGroupById,
  createSubjectGroup,
  updateSubjectGroup,
  deleteSubjectGroup,
} from "./subject_group.service.js";

// Fetch All
export const fetchSubjectGroups = createAsyncThunk(
  "subjectGroups/fetchSubjectGroups",
  async (schoolId, { rejectWithValue }) => {
    try {
      return await getSubjectGroups(schoolId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subject groups",
      );
    }
  },
);

// Fetch By Id
export const fetchSubjectGroupById = createAsyncThunk(
  "subjectGroups/fetchSubjectGroupById",
  async (id, { rejectWithValue }) => {
    try {
      return await getSubjectGroupById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subject group",
      );
    }
  },
);

// Create
export const createSubjectGroupThunk = createAsyncThunk(
  "subjectGroups/createSubjectGroup",
  async (subjectGroupData, { rejectWithValue }) => {
    try {
      return await createSubjectGroup(subjectGroupData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create subject group",
      );
    }
  },
);

// Update
export const updateSubjectGroupThunk = createAsyncThunk(
  "subjectGroups/updateSubjectGroup",
  async ({ id, subjectGroupData }, { rejectWithValue }) => {
    try {
      return await updateSubjectGroup(id, subjectGroupData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update subject group",
      );
    }
  },
);

// Delete
export const deleteSubjectGroupThunk = createAsyncThunk(
  "subjectGroups/deleteSubjectGroup",
  async (id, { rejectWithValue }) => {
    try {
      await deleteSubjectGroup(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete subject group",
      );
    }
  },
);

const unwrap = (payload) => payload?.data ?? payload;

const subjectGroupSlice = createSlice({
  name: "subjectGroups",
  initialState: {
    subjectGroups: [],
    subjectGroup: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSubjectGroup(state) {
      state.subjectGroup = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchSubjectGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjectGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.subjectGroups = unwrap(action.payload);
      })
      .addCase(fetchSubjectGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Id
      .addCase(fetchSubjectGroupById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubjectGroupById.fulfilled, (state, action) => {
        state.loading = false;
        state.subjectGroup = unwrap(action.payload);
      })
      .addCase(fetchSubjectGroupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createSubjectGroupThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSubjectGroupThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.subjectGroups.push(unwrap(action.payload));
      })
      .addCase(createSubjectGroupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateSubjectGroupThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSubjectGroupThunk.fulfilled, (state, action) => {
        state.loading = false;

        const updated = unwrap(action.payload);

        const index = state.subjectGroups.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.subjectGroups[index] = updated;
        }

        state.subjectGroup = updated;
      })
      .addCase(updateSubjectGroupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteSubjectGroupThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSubjectGroupThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.subjectGroups = state.subjectGroups.filter(
          (item) => item.id !== action.payload,
        );
      })
      .addCase(deleteSubjectGroupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubjectGroup } = subjectGroupSlice.actions;

export default subjectGroupSlice.reducer;
