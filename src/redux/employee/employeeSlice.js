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

// Helper to extract clean error message
const extractErrorMessage = (error, fallback = "An unexpected error occurred") => {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallback
  );
};

// ---------------- Fetch All (Supports backend get filters) ----------------
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getEmployees(params);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to fetch employees"));
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
      return rejectWithValue(extractErrorMessage(error, "Failed to fetch employee"));
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
      return rejectWithValue(extractErrorMessage(error, "Failed to create employee"));
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
      return rejectWithValue(extractErrorMessage(error, "Failed to update employee"));
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
      return rejectWithValue(extractErrorMessage(error, "Failed to delete employee"));
    }
  },
);

// ---------------- Assign User To Employee ----------------
export const assignEmployeeUser = createAsyncThunk(
  "employees/assignUser",
  async (payload, { rejectWithValue }) => {
    try {
      const employeeId =
        payload?.employee_id ?? payload?.employeeId ?? payload?.id;
      const userId =
        payload?.user_id ?? payload?.userId;
      return await assignUserToEmployee({ employee_id: employeeId, user_id: userId });
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to assign user"));
    }
  },
);

// ---------------- Unassign User From Employee ----------------
export const unassignEmployeeUser = createAsyncThunk(
  "employees/unassignUser",
  async (payload, { rejectWithValue }) => {
    try {
      const employeeId =
        typeof payload === "object" && payload !== null
          ? payload?.employee_id ?? payload?.employeeId ?? payload?.id
          : payload;
      return await unassignUserFromEmployee(employeeId);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to unassign user"));
    }
  },
);

// ---------------- Initial State ----------------
const initialState = {
  employees: [],
  employee: null,
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
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
        const payload = action.payload || {};
        const rawList =
          payload.data?.employees ||
          payload.employees ||
          payload.data ||
          payload;

        state.employees = Array.isArray(rawList) ? rawList : [];

        if (payload.total !== undefined) {
          state.total = payload.total;
          state.page = payload.page || 1;
          state.limit = payload.limit || 20;
          state.totalPages = payload.totalPages || 1;
        } else {
          state.total = state.employees.length;
        }
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
        state.employee = action.payload?.data || action.payload;
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
        const newEmp = action.payload?.data || action.payload;
        if (newEmp && newEmp.id) {
          state.employees.unshift(newEmp);
          state.total += 1;
        }
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
        const updated = action.payload?.data || action.payload;
        if (updated && updated.id) {
          const index = state.employees.findIndex(
            (emp) => Number(emp.id) === Number(updated.id),
          );
          if (index !== -1) {
            state.employees[index] = { ...state.employees[index], ...updated };
          }
          if (state.employee && state.employee.id === updated.id) {
            state.employee = { ...state.employee, ...updated };
          }
        }
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
          (emp) => Number(emp.id) !== Number(action.payload),
        );
        state.total = Math.max(0, state.total - 1);
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
        const updated =
          action.payload?.data?.employee ||
          action.payload?.employee ||
          action.payload?.data ||
          action.payload;

        if (updated && updated.id) {
          const index = state.employees.findIndex(
            (emp) => Number(emp.id) === Number(updated.id),
          );
          if (index !== -1) {
            state.employees[index] = { ...state.employees[index], ...updated };
          }
          if (state.employee && state.employee.id === updated.id) {
            state.employee = { ...state.employee, ...updated };
          }
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
        const updated =
          action.payload?.data?.employee ||
          action.payload?.employee ||
          action.payload?.data ||
          action.payload;

        if (updated && updated.id) {
          const index = state.employees.findIndex(
            (emp) => Number(emp.id) === Number(updated.id),
          );
          if (index !== -1) {
            state.employees[index] = { ...state.employees[index], ...updated };
          }
          if (state.employee && state.employee.id === updated.id) {
            state.employee = { ...state.employee, ...updated };
          }
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
