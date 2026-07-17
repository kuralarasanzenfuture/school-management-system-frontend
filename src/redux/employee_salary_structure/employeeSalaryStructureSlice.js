import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllEmployeeSalaryStructures,
  getEmployeeSalaryStructureById,
  createEmployeeSalaryStructure,
  updateEmployeeSalaryStructure,
  deleteEmployeeSalaryStructure,
} from "./employeeSalaryStructure.service.js";

// ================= GET ALL =================
export const fetchEmployeeSalaryStructures = createAsyncThunk(
  "employeeSalaryStructure/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllEmployeeSalaryStructures();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch employee salary structures",
      );
    }
  },
);

// ================= GET BY ID =================
export const fetchEmployeeSalaryStructureById = createAsyncThunk(
  "employeeSalaryStructure/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getEmployeeSalaryStructureById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch employee salary structure",
      );
    }
  },
);

// ================= CREATE =================
export const addEmployeeSalaryStructure = createAsyncThunk(
  "employeeSalaryStructure/create",
  async (data, { rejectWithValue }) => {
    try {
      return await createEmployeeSalaryStructure(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create employee salary structure",
      );
    }
  },
);

// ================= UPDATE =================
export const editEmployeeSalaryStructure = createAsyncThunk(
  "employeeSalaryStructure/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateEmployeeSalaryStructure(id, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update employee salary structure",
      );
    }
  },
);

// ================= DELETE =================
export const removeEmployeeSalaryStructure = createAsyncThunk(
  "employeeSalaryStructure/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteEmployeeSalaryStructure(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete employee salary structure",
      );
    }
  },
);

const initialState = {
  employeeSalaryStructures: [],
  employeeSalaryStructure: null,
  loading: false,
  error: null,
};

const employeeSalaryStructureSlice = createSlice({
  name: "employeeSalaryStructure",
  initialState,
  reducers: {
    clearEmployeeSalaryStructureError(state) {
      state.error = null;
    },
    clearEmployeeSalaryStructure(state) {
      state.employeeSalaryStructure = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ================= FETCH ALL =================
      .addCase(fetchEmployeeSalaryStructures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeSalaryStructures.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeSalaryStructures = action.payload.data ?? action.payload;
      })
      .addCase(fetchEmployeeSalaryStructures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= FETCH BY ID =================
      .addCase(fetchEmployeeSalaryStructureById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployeeSalaryStructureById.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeSalaryStructure = action.payload.data ?? action.payload;
      })
      .addCase(fetchEmployeeSalaryStructureById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= CREATE =================
      .addCase(addEmployeeSalaryStructure.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEmployeeSalaryStructure.fulfilled, (state, action) => {
        state.loading = false;

        const newItem = action.payload.data ?? action.payload;

        if (newItem?.id) {
          state.employeeSalaryStructures.unshift(newItem);
        }
      })
      .addCase(addEmployeeSalaryStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= UPDATE =================
      .addCase(editEmployeeSalaryStructure.pending, (state) => {
        state.loading = true;
      })
      .addCase(editEmployeeSalaryStructure.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data ?? action.payload;

        const index = state.employeeSalaryStructures.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.employeeSalaryStructures[index] = updated;
        }

        state.employeeSalaryStructure = updated;
      })
      .addCase(editEmployeeSalaryStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= DELETE =================
      .addCase(removeEmployeeSalaryStructure.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeEmployeeSalaryStructure.fulfilled, (state, action) => {
        state.loading = false;

        state.employeeSalaryStructures = state.employeeSalaryStructures.filter(
          (item) => item.id !== action.payload,
        );
      })
      .addCase(removeEmployeeSalaryStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearEmployeeSalaryStructureError,
  clearEmployeeSalaryStructure,
} = employeeSalaryStructureSlice.actions;

export default employeeSalaryStructureSlice.reducer;
