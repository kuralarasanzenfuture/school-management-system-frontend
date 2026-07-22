import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  assignUserToEmployee,
  unassignUserFromEmployee,
} from "./employee.service";

// ---------------- Fetch All ----------------

export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      return await getEmployees();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employees",
      );
    }
  },
);

// ---------------- Fetch By Id ----------------

export const fetchEmployeeById = createAsyncThunk(
  "employees/fetchEmployeeById",
  async (id, { rejectWithValue }) => {
    try {
      return await getEmployeeById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee",
      );
    }
  },
);

// ---------------- Create ----------------

export const addEmployee = createAsyncThunk(
  "employees/addEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      return await createEmployee(employeeData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create employee",
      );
    }
  },
);

// ---------------- Update ----------------

export const editEmployee = createAsyncThunk(
  "employees/editEmployee",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateEmployee(id, formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update employee",
      );
    }
  },
);

// ---------------- Delete ----------------

export const removeEmployee = createAsyncThunk(
  "employees/removeEmployee",
  async (id, { rejectWithValue }) => {
    try {
      await deleteEmployee(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete employee",
      );
    }
  },
);

// ---------------- Assign User To Employee ----------------
export const assignEmployeeUser = createAsyncThunk(
  "employees/assignUser",
  async ({ employeeId, userId }, { rejectWithValue }) => {
    try {
      return await assignUserToEmployee(employeeId, userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign user",
      );
    }
  },
);

// ---------------- Unassign User From Employee ----------------

export const unassignEmployeeUser = createAsyncThunk(
  "employees/unassignUser",
  async (employeeId, { rejectWithValue }) => {
    try {
      return await unassignUserFromEmployee(employeeId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unassign user",
      );
    }
  },
);

// ---------------- Initial State ----------------

const initialState = {
  employees: [],
  employee: null,
  loading: false,
  error: null,
};

// ---------------- Slice ----------------

const employeeSlice = createSlice({
  name: "employees",
  initialState,

  reducers: {
    clearEmployee(state) {
      state.employee = null;
    },
    clearEmployeeError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Employee By Id
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Employee
      .addCase(addEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.push(action.payload);
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Employee
      .addCase(editEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(editEmployee.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.employees.findIndex(
          (emp) => emp.id === action.payload.id,
        );

        if (index !== -1) {
          state.employees[index] = action.payload;
        }

        state.employee = action.payload;
      })
      .addCase(editEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Employee
      .addCase(removeEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter(
          (emp) => emp.id !== action.payload,
        );
      })
      .addCase(removeEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Assign User
      .addCase(assignEmployeeUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignEmployeeUser.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data ?? action.payload;

        const index = state.employees.findIndex((emp) => emp.id === updated.id);

        if (index !== -1) {
          state.employees[index] = updated;
        }

        if (state.employee && state.employee.id === updated.id) {
          state.employee = updated;
        }
      })
      .addCase(assignEmployeeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Unassign User
      .addCase(unassignEmployeeUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(unassignEmployeeUser.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data ?? action.payload;

        const index = state.employees.findIndex((emp) => emp.id === updated.id);

        if (index !== -1) {
          state.employees[index] = updated;
        }

        if (state.employee && state.employee.id === updated.id) {
          state.employee = updated;
        }
      })
      .addCase(unassignEmployeeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEmployee, clearEmployeeError } = employeeSlice.actions;

export default employeeSlice.reducer;
