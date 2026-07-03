import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDepartments,
  getDepartmentById,
  getDepartmentsBySchoolId,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "./departmentService.js";

// ==========================
// Async Thunks
// ==========================

// Get All Departments
export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      return await getDepartments();
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// Get Department By Id
export const fetchDepartmentById = createAsyncThunk(
  "departments/fetchDepartmentById",
  async (id, { rejectWithValue }) => {
    try {
      return await getDepartmentById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// Get Departments By School
export const fetchDepartmentsBySchool = createAsyncThunk(
  "departments/fetchDepartmentsBySchool",
  async (schoolId, { rejectWithValue }) => {
    try {
      return await getDepartmentsBySchoolId(schoolId);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// Create Department
export const addDepartment = createAsyncThunk(
  "departments/addDepartment",
  async (departmentData, { rejectWithValue }) => {
    try {
      return await createDepartment(departmentData);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// Update Department
export const editDepartment = createAsyncThunk(
  "departments/editDepartment",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateDepartment(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// Delete Department
export const removeDepartment = createAsyncThunk(
  "departments/removeDepartment",
  async (id, { rejectWithValue }) => {
    try {
      await deleteDepartment(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// ==========================
// Slice
// ==========================

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    departments: [],
    department: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearDepartment(state) {
      state.department = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ==========================
      // Fetch Departments
      // ==========================
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload.departments || action.payload || [];
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch departments";
      })

      // ==========================
      // Fetch Department By Id
      // ==========================
      .addCase(fetchDepartmentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.department = action.payload.department || action.payload;
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch department";
      })

      // ==========================
      // Fetch By School
      // ==========================
      .addCase(fetchDepartmentsBySchool.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDepartmentsBySchool.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload.departments || action.payload || [];
      })
      .addCase(fetchDepartmentsBySchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch departments";
      })

      // ==========================
      // Add Department
      // ==========================
      .addCase(addDepartment.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.loading = false;

        const newDepartment = action.payload.department || action.payload;

        state.departments.push(newDepartment);
      })
      .addCase(addDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create department";
      })

      // ==========================
      // Edit Department
      // ==========================
      .addCase(editDepartment.pending, (state) => {
        state.loading = true;
      })
      .addCase(editDepartment.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.department || action.payload;

        const index = state.departments.findIndex((d) => d.id === updated.id);

        if (index !== -1) {
          state.departments[index] = updated;
        }

        state.department = updated;
      })
      .addCase(editDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update department";
      })

      // ==========================
      // Delete Department
      // ==========================
      .addCase(removeDepartment.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeDepartment.fulfilled, (state, action) => {
        state.loading = false;

        state.departments = state.departments.filter(
          (d) => d.id !== action.payload,
        );
      })
      .addCase(removeDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete department";
      });
  },
});

export const { clearDepartment } = departmentSlice.actions;

export default departmentSlice.reducer;
