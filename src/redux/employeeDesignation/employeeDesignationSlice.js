import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getEmployeeDesignations,
  getEmployeeDesignationById,
  createEmployeeDesignation,
  updateEmployeeDesignation,
  deleteEmployeeDesignation,
} from "./employeeDesignation.service.js";

// ---------------- Fetch All ----------------

export const fetchEmployeeDesignations = createAsyncThunk(
  "employeeDesignations/fetchEmployeeDesignations",
  async (_, { rejectWithValue }) => {
    try {
      return await getEmployeeDesignations();
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
        state.employeeDesignations = action.payload;
        // state.employeeDesignations = action.payload.designations; or use in page
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

export const { clearEmployeeDesignation, clearEmployeeDesignationError } =
  employeeDesignationSlice.actions;

export default employeeDesignationSlice.reducer;
