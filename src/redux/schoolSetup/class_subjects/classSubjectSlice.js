// src/redux/classSubject/classSubjectSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllClassSubjects,
  getClassSubjectById,
  createClassSubject,
  bulkAssignSubjects,
  updateClassSubject,
  deleteClassSubject,
} from "./classSubject.service.js";

// Fetch All
export const fetchClassSubjects = createAsyncThunk(
  "classSubjects/fetchClassSubjects",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllClassSubjects();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch class subjects",
      );
    }
  },
);

// Fetch By Id
export const fetchClassSubjectById = createAsyncThunk(
  "classSubjects/fetchClassSubjectById",
  async (id, { rejectWithValue }) => {
    try {
      return await getClassSubjectById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch class subject",
      );
    }
  },
);

// Create
export const createClassSubjectThunk = createAsyncThunk(
  "classSubjects/createClassSubject",
  async (classSubjectData, { rejectWithValue }) => {
    try {
      return await createClassSubject(classSubjectData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create class subject",
      );
    }
  },
);

export const addBulkAssignSubjects = createAsyncThunk(
  "classSections/bulkAssignSubjects",
  async (data, { rejectWithValue }) => {
    try {
      return await bulkAssignSubjects(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create class section",
      );
    }
  },
);

// Update
export const updateClassSubjectThunk = createAsyncThunk(
  "classSubjects/updateClassSubject",
  async ({ id, classSubjectData }, { rejectWithValue }) => {
    try {
      return await updateClassSubject(id, classSubjectData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update class subject",
      );
    }
  },
);

// Delete
export const deleteClassSubjectThunk = createAsyncThunk(
  "classSubjects/deleteClassSubject",
  async (id, { rejectWithValue }) => {
    try {
      await deleteClassSubject(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete class subject",
      );
    }
  },
);

const unwrap = (payload) => payload?.data ?? payload;

const classSubjectSlice = createSlice({
  name: "classSubjects",
  initialState: {
    classSubjects: [],
    classSubject: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearClassSubject(state) {
      state.classSubject = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchClassSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.classSubjects = unwrap(action.payload);
      })
      .addCase(fetchClassSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Id
      .addCase(fetchClassSubjectById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClassSubjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.classSubject = unwrap(action.payload);
      })
      .addCase(fetchClassSubjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createClassSubjectThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createClassSubjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.classSubjects.push(unwrap(action.payload));
      })
      .addCase(createClassSubjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addBulkAssignSubjects
      .addCase(addBulkAssignSubjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBulkAssignSubjects.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(addBulkAssignSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateClassSubjectThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateClassSubjectThunk.fulfilled, (state, action) => {
        state.loading = false;

        const updated = unwrap(action.payload);

        const index = state.classSubjects.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.classSubjects[index] = updated;
        }

        state.classSubject = updated;
      })
      .addCase(updateClassSubjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteClassSubjectThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteClassSubjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.classSubjects = state.classSubjects.filter(
          (item) => item.id !== action.payload,
        );
      })
      .addCase(deleteClassSubjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearClassSubject } = classSubjectSlice.actions;

export default classSubjectSlice.reducer;
