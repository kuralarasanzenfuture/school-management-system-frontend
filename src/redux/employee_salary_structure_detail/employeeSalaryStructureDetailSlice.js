import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getEmployeeSalaryStructureDetail,
  getAllEmployeeSalaryStructureDetails,
  createEmployeeSalaryStructureDetail,
  updateEmployeeSalaryStructureDetail,
  deleteEmployeeSalaryStructureDetail,
  getEmployeeSalaryStructureDetailByEmployeeId,
} from "./employeeSalaryStructureDetail.service.js";

// ================= GET ALL =================
export const fetchEmployeeSalaryStructureDetails = createAsyncThunk(
  "employeeSalaryStructureDetails/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllEmployeeSalaryStructureDetails();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch salary structure details",
      );
    }
  },
);

// ================= GET BY ID =================
export const fetchEmployeeSalaryStructureDetailById = createAsyncThunk(
  "employeeSalaryStructureDetails/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getEmployeeSalaryStructureDetail(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch salary structure detail",
      );
    }
  },
);

// ================= CREATE =================
export const addEmployeeSalaryStructureDetail = createAsyncThunk(
  "employeeSalaryStructureDetails/create",
  async (data, { rejectWithValue }) => {
    try {
      return await createEmployeeSalaryStructureDetail(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create salary structure detail",
      );
    }
  },
);

// ================= UPDATE =================
export const editEmployeeSalaryStructureDetail = createAsyncThunk(
  "employeeSalaryStructureDetails/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateEmployeeSalaryStructureDetail(id, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update salary structure detail",
      );
    }
  },
);

// ================= DELETE =================
export const removeEmployeeSalaryStructureDetail = createAsyncThunk(
  "employeeSalaryStructureDetails/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteEmployeeSalaryStructureDetail(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete salary structure detail",
      );
    }
  },
);

// ================= SLICE =================
export const fetchEmployeeSalaryStructureDetailsByEmployeeId = createAsyncThunk(
  "employeeSalaryStructureDetails/fetchByEmployeeId",
  async (employeeId, { rejectWithValue }) => {
    try {
      return await getEmployeeSalaryStructureDetailByEmployeeId(employeeId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch salary details by employee",
      );
    }
  },
);

const initialState = {
  employeeSalaryStructureDetails: [],
  employeeSalaryStructureDetail: null,

  employeeDetailsByEmployee: [],

  loading: false,
  submitting: false,
  error: null,
};

const employeeSalaryStructureDetailSlice = createSlice({
  name: "employeeSalaryStructureDetails",
  initialState,
  reducers: {
    clearEmployeeSalaryStructureDetailError(state) {
      state.error = null;
    },
    clearEmployeeSalaryStructureDetail(state) {
      state.employeeSalaryStructureDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ================= FETCH ALL =================
      .addCase(fetchEmployeeSalaryStructureDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchEmployeeSalaryStructureDetails.fulfilled,
        (state, action) => {
          state.loading = false;
          state.employeeSalaryStructureDetails =
            action.payload.data ?? action.payload;
        },
      )
      .addCase(
        fetchEmployeeSalaryStructureDetails.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        },
      )

      // ================= FETCH BY ID =================
      .addCase(fetchEmployeeSalaryStructureDetailById.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchEmployeeSalaryStructureDetailById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.employeeSalaryStructureDetail =
            action.payload.data ?? action.payload;
        },
      )
      .addCase(
        fetchEmployeeSalaryStructureDetailById.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        },
      )

      // ================= FETCH BY EMPLOYEE ID =================
      .addCase(
        fetchEmployeeSalaryStructureDetailsByEmployeeId.pending,
        (state) => {
          state.loading = true;
        },
      )
      .addCase(
        fetchEmployeeSalaryStructureDetailsByEmployeeId.fulfilled,
        (state, action) => {
          state.loading = false;
          state.employeeDetailsByEmployee =
            action.payload.data ?? action.payload;
        },
      )
      .addCase(
        fetchEmployeeSalaryStructureDetailsByEmployeeId.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        },
      )

      // ================= CREATE =================
      .addCase(addEmployeeSalaryStructureDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEmployeeSalaryStructureDetail.fulfilled, (state, action) => {
        state.loading = false;

        const newItem = action.payload.data ?? action.payload;

        if (newItem?.id) {
          state.employeeSalaryStructureDetails.unshift(newItem);
        }
      })
      .addCase(addEmployeeSalaryStructureDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= UPDATE =================
      .addCase(editEmployeeSalaryStructureDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(editEmployeeSalaryStructureDetail.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data ?? action.payload;

        const index = state.employeeSalaryStructureDetails.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.employeeSalaryStructureDetails[index] = updated;
        }

        state.employeeSalaryStructureDetail = updated;
      })
      .addCase(editEmployeeSalaryStructureDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= DELETE =================
      .addCase(removeEmployeeSalaryStructureDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        removeEmployeeSalaryStructureDetail.fulfilled,
        (state, action) => {
          state.loading = false;

          state.employeeSalaryStructureDetails =
            state.employeeSalaryStructureDetails.filter(
              (item) => item.id !== action.payload,
            );
        },
      )
      .addCase(
        removeEmployeeSalaryStructureDetail.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export const {
  clearEmployeeSalaryStructureDetailError,
  clearEmployeeSalaryStructureDetail,
} = employeeSalaryStructureDetailSlice.actions;

export default employeeSalaryStructureDetailSlice.reducer;
