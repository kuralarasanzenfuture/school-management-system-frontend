import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllEmployeeSalaryComponents,
  getEmployeeSalaryComponentById,
  createEmployeeSalaryComponent,
  updateEmployeeSalaryComponent,
  updateEmployeeSalaryComponentStatus,
  deleteEmployeeSalaryComponent,
  checkExistingEmployeeSalaryComponent,
} from "./employeeSalaryComponent.service.js";

// ================= Fetch All =================

export const fetchEmployeeSalaryComponents = createAsyncThunk(
  "employeeSalaryComponents/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllEmployeeSalaryComponents(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch employee salary components",
      );
    }
  },
);

// ================= Fetch By Id =================

export const fetchEmployeeSalaryComponentById = createAsyncThunk(
  "employeeSalaryComponents/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getEmployeeSalaryComponentById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch employee salary component",
      );
    }
  },
);

// ================= Create =================

export const addEmployeeSalaryComponent = createAsyncThunk(
  "employeeSalaryComponents/create",
  async (data, { rejectWithValue }) => {
    try {
      return await createEmployeeSalaryComponent(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create employee salary component",
      );
    }
  },
);

// ================= Update =================

export const editEmployeeSalaryComponent = createAsyncThunk(
  "employeeSalaryComponents/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateEmployeeSalaryComponent(id, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update employee salary component",
      );
    }
  },
);

// ================= Toggle Status =================

export const toggleEmployeeSalaryComponentStatus = createAsyncThunk(
  "employeeSalaryComponents/toggleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await updateEmployeeSalaryComponentStatus(id, status);
      return { id, status, response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update employee salary component status",
      );
    }
  },
);

// ================= Delete =================

export const removeEmployeeSalaryComponent = createAsyncThunk(
  "employeeSalaryComponents/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteEmployeeSalaryComponent(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete employee salary component",
      );
    }
  },
);

// ================= Check Existing =================

export const checkEmployeeSalaryComponentExists = createAsyncThunk(
  "employeeSalaryComponents/checkExisting",
  async (data, { rejectWithValue }) => {
    try {
      return await checkExistingEmployeeSalaryComponent(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to check employee salary component",
      );
    }
  },
);

// ================= Initial State =================

const initialState = {
  employeeSalaryComponents: [],
  selectedEmployeeSalaryComponent: null,

  checking: false,
  checkResult: null,

  loading: false,
  submitting: false,

  error: null,
};

// ================= Slice =================

const employeeSalaryComponentSlice = createSlice({
  name: "employeeSalaryComponents",
  initialState,

  reducers: {
    clearEmployeeSalaryComponentError(state) {
      state.error = null;
    },

    clearSelectedEmployeeSalaryComponent(state) {
      state.selectedEmployeeSalaryComponent = null;
    },

    clearEmployeeSalaryComponentCheck(state) {
      state.checkResult = null;
      state.checking = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // ================= Fetch All =================

      .addCase(fetchEmployeeSalaryComponents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeSalaryComponents.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        if (Array.isArray(p)) {
          state.employeeSalaryComponents = p;
        } else if (Array.isArray(p?.data)) {
          state.employeeSalaryComponents = p.data;
        } else if (Array.isArray(p?.rows)) {
          state.employeeSalaryComponents = p.rows;
        } else if (Array.isArray(p?.salaryComponents)) {
          state.employeeSalaryComponents = p.salaryComponents;
        } else if (Array.isArray(p?.components)) {
          state.employeeSalaryComponents = p.components;
        } else {
          state.employeeSalaryComponents = [];
        }
      })
      .addCase(fetchEmployeeSalaryComponents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= Fetch By Id =================

      .addCase(fetchEmployeeSalaryComponentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployeeSalaryComponentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEmployeeSalaryComponent =
          action.payload?.data ||
          action.payload?.salaryComponent ||
          action.payload;
      })
      .addCase(fetchEmployeeSalaryComponentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= Create =================

      .addCase(addEmployeeSalaryComponent.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addEmployeeSalaryComponent.fulfilled, (state, action) => {
        state.submitting = false;

        const item =
          action.payload?.data ||
          action.payload?.salaryComponent ||
          action.payload;

        if (item) {
          state.employeeSalaryComponents.unshift(item);
        }
      })
      .addCase(addEmployeeSalaryComponent.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // ================= Update =================

      .addCase(editEmployeeSalaryComponent.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(editEmployeeSalaryComponent.fulfilled, (state, action) => {
        state.submitting = false;

        const updated =
          action.payload?.new_data ||
          action.payload?.updatedSalaryComponent ||
          action.payload?.salaryComponent ||
          action.payload?.data ||
          action.payload;

        if (updated?.id) {
          const index = state.employeeSalaryComponents.findIndex(
            (item) => item.id === updated.id,
          );

          if (index !== -1) {
            state.employeeSalaryComponents[index] = updated;
          }

          state.selectedEmployeeSalaryComponent = updated;
        }
      })
      .addCase(editEmployeeSalaryComponent.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // ================= Toggle Status =================

      .addCase(
        toggleEmployeeSalaryComponentStatus.fulfilled,
        (state, action) => {
          const { id, status } = action.payload;
          const item = state.employeeSalaryComponents.find((c) => c.id === id);
          if (item) {
            item.status = status;
          }
          if (state.selectedEmployeeSalaryComponent?.id === id) {
            state.selectedEmployeeSalaryComponent.status = status;
          }
        },
      )

      // ================= Delete =================

      .addCase(removeEmployeeSalaryComponent.pending, (state) => {
        state.submitting = true;
      })
      .addCase(removeEmployeeSalaryComponent.fulfilled, (state, action) => {
        state.submitting = false;

        state.employeeSalaryComponents = state.employeeSalaryComponents.filter(
          (item) => item.id !== action.payload,
        );
      })
      .addCase(removeEmployeeSalaryComponent.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // ================= Check Existing =================

      .addCase(checkEmployeeSalaryComponentExists.pending, (state) => {
        state.checking = true;
        state.checkResult = null;
      })
      .addCase(
        checkEmployeeSalaryComponentExists.fulfilled,
        (state, action) => {
          state.checking = false;
          state.checkResult = action.payload;
        },
      )
      .addCase(checkEmployeeSalaryComponentExists.rejected, (state, action) => {
        state.checking = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearEmployeeSalaryComponentError,
  clearSelectedEmployeeSalaryComponent,
  clearEmployeeSalaryComponentCheck,
} = employeeSalaryComponentSlice.actions;

export default employeeSalaryComponentSlice.reducer;
