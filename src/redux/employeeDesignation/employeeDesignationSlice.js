import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getEmployeeDesignations,
  getEmployeeDesignationById,
  createEmployeeDesignation,
  updateEmployeeDesignation,
  updateEmployeeDesignationStatus,
  deleteEmployeeDesignation,
} from "./employeeDesignation.service.js";

// ---------------- Fetch All ----------------

export const fetchEmployeeDesignations = createAsyncThunk(
  "employeeDesignations/fetchEmployeeDesignations",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getEmployeeDesignations(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch employee designations",
      );
    }
  },
);

// ---------------- Fetch By Id ----------------

export const fetchEmployeeDesignationById = createAsyncThunk(
  "employeeDesignations/fetchEmployeeDesignationById",
  async (id, { rejectWithValue }) => {
    try {
      return await getEmployeeDesignationById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee designation",
      );
    }
  },
);

// ---------------- Create ----------------

export const addEmployeeDesignation = createAsyncThunk(
  "employeeDesignations/addEmployeeDesignation",
  async (designationData, { rejectWithValue }) => {
    try {
      return await createEmployeeDesignation(designationData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create employee designation",
      );
    }
  },
);

// ---------------- Update ----------------

export const editEmployeeDesignation = createAsyncThunk(
  "employeeDesignations/editEmployeeDesignation",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateEmployeeDesignation(id, formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update employee designation",
      );
    }
  },
);

// ---------------- Toggle Status ----------------

export const toggleEmployeeDesignationStatus = createAsyncThunk(
  "employeeDesignations/toggleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await updateEmployeeDesignationStatus(id, status);
      return { id, status, response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update employee designation status",
      );
    }
  },
);

// ---------------- Delete ----------------

export const removeEmployeeDesignation = createAsyncThunk(
  "employeeDesignations/removeEmployeeDesignation",
  async (id, { rejectWithValue }) => {
    try {
      await deleteEmployeeDesignation(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete employee designation",
      );
    }
  },
);

// ---------------- Initial State ----------------

const initialState = {
  employeeDesignations: [],
  employeeDesignation: null,
  filters: {
    search: "",
    school_id: "",
    status: "",
  },
  loading: false,
  error: null,
};

// ---------------- Slice ----------------

const employeeDesignationSlice = createSlice({
  name: "employeeDesignations",
  initialState,

  reducers: {
    clearEmployeeDesignation(state) {
      state.employeeDesignation = null;
    },

    clearEmployeeDesignationError(state) {
      state.error = null;
    },

    setDesignationFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetDesignationFilters(state) {
      state.filters = {
        search: "",
        school_id: "",
        status: "",
      };
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchEmployeeDesignations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeDesignations.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        if (Array.isArray(p)) {
          state.employeeDesignations = p;
        } else if (Array.isArray(p?.data)) {
          state.employeeDesignations = p.data;
        } else if (Array.isArray(p?.rows)) {
          state.employeeDesignations = p.rows;
        } else if (Array.isArray(p?.designations)) {
          state.employeeDesignations = p.designations;
        } else {
          state.employeeDesignations = [];
        }
      })
      .addCase(fetchEmployeeDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Id
      .addCase(fetchEmployeeDesignationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployeeDesignationById.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeDesignation = action.payload;
      })
      .addCase(fetchEmployeeDesignationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(addEmployeeDesignation.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEmployeeDesignation.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeDesignations.push(action.payload);
      })
      .addCase(addEmployeeDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(editEmployeeDesignation.pending, (state) => {
        state.loading = true;
      })
      .addCase(editEmployeeDesignation.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.employeeDesignations.findIndex(
          (designation) => designation.id === action.payload.id,
        );

        if (index !== -1) {
          state.employeeDesignations[index] = action.payload;
        }

        state.employeeDesignation = action.payload;
      })
      .addCase(editEmployeeDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Status
      .addCase(toggleEmployeeDesignationStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const item = state.employeeDesignations.find((d) => d.id === id);
        if (item) {
          item.status = status;
        }
        if (state.employeeDesignation?.id === id) {
          state.employeeDesignation.status = status;
        }
      })

      // Delete
      .addCase(removeEmployeeDesignation.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeEmployeeDesignation.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeDesignations = state.employeeDesignations.filter(
          (designation) => designation.id !== action.payload,
        );
      })
      .addCase(removeEmployeeDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearEmployeeDesignation,
  clearEmployeeDesignationError,
  setDesignationFilters,
  resetDesignationFilters,
} = employeeDesignationSlice.actions;

export default employeeDesignationSlice.reducer;
