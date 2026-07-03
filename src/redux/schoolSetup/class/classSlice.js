import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getClasses,
  getClassById,
  getClassesBySchoolId,
  createClass,
  updateClass,
  deleteClass,
} from "./classService.js";

// ==============================
// Fetch All Classes
// ==============================
export const fetchClasses = createAsyncThunk(
  "classes/fetchClasses",
  async (_, { rejectWithValue }) => {
    try {
      return await getClasses();
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: err.message }
      );
    }
  }
);

// ==============================
// Fetch Class By ID
// ==============================
export const fetchClassById = createAsyncThunk(
  "classes/fetchClassById",
  async (id, { rejectWithValue }) => {
    try {
      return await getClassById(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: err.message }
      );
    }
  }
);

// ==============================
// Fetch Classes By School
// ==============================
export const fetchClassesBySchool = createAsyncThunk(
  "classes/fetchClassesBySchool",
  async (schoolId, { rejectWithValue }) => {
    try {
      return await getClassesBySchoolId(schoolId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: err.message }
      );
    }
  }
);

// ==============================
// Add Class
// ==============================
export const addClass = createAsyncThunk(
  "classes/addClass",
  async (classData, { rejectWithValue }) => {
    try {
      return await createClass(classData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: err.message }
      );
    }
  }
);

// ==============================
// Edit Class
// ==============================
export const editClass = createAsyncThunk(
  "classes/editClass",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateClass(id, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: err.message }
      );
    }
  }
);

// ==============================
// Delete Class
// ==============================
export const removeClass = createAsyncThunk(
  "classes/removeClass",
  async (id, { rejectWithValue }) => {
    try {
      await deleteClass(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: err.message }
      );
    }
  }
);

const classSlice = createSlice({
  name: "classes",
  initialState: {
    classes: [],
    classDetails: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearClass(state) {
      state.classDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ==============================
      // Fetch All
      // ==============================
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes =
          action.payload.classes || action.payload || [];
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch classes";
      })

      // ==============================
      // Fetch By ID
      // ==============================
      .addCase(fetchClassById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClassById.fulfilled, (state, action) => {
        state.loading = false;
        state.classDetails =
          action.payload.class || action.payload;
      })
      .addCase(fetchClassById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch class";
      })

      // ==============================
      // Fetch By School
      // ==============================
      .addCase(fetchClassesBySchool.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClassesBySchool.fulfilled, (state, action) => {
        state.loading = false;
        state.classes =
          action.payload.classes || action.payload || [];
      })
      .addCase(fetchClassesBySchool.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch classes";
      })

      // ==============================
      // Add
      // ==============================
      .addCase(addClass.pending, (state) => {
        state.loading = true;
      })
      .addCase(addClass.fulfilled, (state, action) => {
        state.loading = false;

        const newClass =
          action.payload.class || action.payload;

        state.classes.push(newClass);
      })
      .addCase(addClass.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to create class";
      })

      // ==============================
      // Edit
      // ==============================
      .addCase(editClass.pending, (state) => {
        state.loading = true;
      })
      .addCase(editClass.fulfilled, (state, action) => {
        state.loading = false;

        const updated =
          action.payload.class || action.payload;

        const index = state.classes.findIndex(
          (item) => item.id === updated.id
        );

        if (index !== -1) {
          state.classes[index] = updated;
        }

        state.classDetails = updated;
      })
      .addCase(editClass.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update class";
      })

      // ==============================
      // Delete
      // ==============================
      .addCase(removeClass.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeClass.fulfilled, (state, action) => {
        state.loading = false;

        state.classes = state.classes.filter(
          (item) => item.id !== action.payload
        );
      })
      .addCase(removeClass.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to delete class";
      });
  },
});

export const { clearClass } = classSlice.actions;

export default classSlice.reducer;