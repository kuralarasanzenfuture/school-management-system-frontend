import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getClasses,
  getClassById,
  getClassesBySchoolId,
  createClass,
  updateClass,
  updateClassStatus,
  deleteClass,
} from "./class.service.js";

// ==============================
// Fetch All Classes
// ==============================
export const fetchClasses = createAsyncThunk(
  "classes/fetchClasses",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getClasses(params);
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
  async (arg, { rejectWithValue }) => {
    try {
      const schoolId = typeof arg === "object" ? arg.schoolId : arg;
      const params = typeof arg === "object" ? arg.params : {};
      return await getClassesBySchoolId(schoolId, params);
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
// Toggle/Update Class Status
// ==============================
export const toggleClassStatus = createAsyncThunk(
  "classes/toggleClassStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await updateClassStatus(id, status);
      return res.data || res.class || res;
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
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
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
        const p = action.payload;
        if (Array.isArray(p)) {
          state.classes = p;
          state.total = p.length;
        } else if (Array.isArray(p?.data)) {
          state.classes = p.data;
          state.total = p.total ?? p.data.length;
          state.page = p.page ?? 1;
          state.limit = p.limit ?? 20;
          state.totalPages = p.totalPages ?? 1;
        } else if (Array.isArray(p?.classes)) {
          state.classes = p.classes;
          state.total = p.total ?? p.classes.length;
          state.page = p.page ?? 1;
          state.limit = p.limit ?? 20;
          state.totalPages = p.totalPages ?? 1;
        } else {
          state.classes = [];
        }
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
          action.payload?.class || action.payload?.data || action.payload;
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
        const p = action.payload;
        if (Array.isArray(p)) {
          state.classes = p;
          state.total = p.length;
        } else if (Array.isArray(p?.data)) {
          state.classes = p.data;
          state.total = p.total ?? p.data.length;
        } else if (Array.isArray(p?.classes)) {
          state.classes = p.classes;
          state.total = p.total ?? p.classes.length;
        } else {
          state.classes = [];
        }
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
          action.payload?.class || action.payload?.data || action.payload;
        if (newClass && newClass.id) {
          state.classes.push(newClass);
          state.total = (state.total || 0) + 1;
        }
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
          action.payload?.class || action.payload?.data || action.payload;
        if (updated && updated.id) {
          const index = state.classes.findIndex(
            (item) => item.id === updated.id
          );
          if (index !== -1) {
            state.classes[index] = updated;
          }
          state.classDetails = updated;
        }
      })
      .addCase(editClass.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update class";
      })

      // ==============================
      // Toggle Status
      // ==============================
      .addCase(toggleClassStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;
        const index = state.classes.findIndex((item) => item.id === updated.id);
        if (index !== -1) {
          state.classes[index] = {
            ...state.classes[index],
            ...updated,
          };
        }
        if (state.classDetails?.id === updated.id) {
          state.classDetails = { ...state.classDetails, ...updated };
        }
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
        state.total = Math.max(0, (state.total || 1) - 1);
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