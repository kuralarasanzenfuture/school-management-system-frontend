import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSubjectGroups,
  getSubjectGroupById,
  createSubjectGroup,
  updateSubjectGroup,
  deleteSubjectGroup,
  updateSubjectGroupStatus,
} from "./subject_group.service.js";

// Fetch All
export const fetchSubjectGroups = createAsyncThunk(
  "subjectGroups/fetchSubjectGroups",
  async (args = {}, { rejectWithValue }) => {
    try {
      let params = {};
      if (args && typeof args === "object") {
        params = args;
      } else if (args) {
        params = { school_id: args };
      }
      return await getSubjectGroups(params);
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

// Toggle Status
export const toggleSubjectGroupStatus = createAsyncThunk(
  "subjectGroups/toggleSubjectGroupStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await updateSubjectGroupStatus(id, status);
      return { id, status, res };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update subject group status",
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
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
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
        const p = action.payload;
        if (Array.isArray(p)) {
          state.subjectGroups = p;
          state.total = p.length;
        } else if (p && Array.isArray(p.subjectGroups)) {
          state.subjectGroups = p.subjectGroups;
          state.total = p.total ?? p.subjectGroups.length;
          state.page = p.page ?? 1;
          state.limit = p.limit ?? 20;
          state.totalPages = p.totalPages ?? 1;
        } else if (p && Array.isArray(p.data)) {
          state.subjectGroups = p.data;
          state.total = p.total ?? p.data.length;
          state.page = p.page ?? 1;
          state.limit = p.limit ?? 20;
          state.totalPages = p.totalPages ?? 1;
        } else {
          state.subjectGroups = [];
          state.total = 0;
        }
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
        const item = unwrap(action.payload);
        if (item) {
          state.subjectGroups.unshift(item);
        }
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
        if (updated && updated.id) {
          const index = state.subjectGroups.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.subjectGroups[index] = {
              ...state.subjectGroups[index],
              ...updated,
            };
          }
        }
        state.subjectGroup = updated;
      })
      .addCase(updateSubjectGroupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Status
      .addCase(toggleSubjectGroupStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const target = state.subjectGroups.find((s) => String(s.id) === String(id));
        if (target) {
          target.status = status;
        }
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
