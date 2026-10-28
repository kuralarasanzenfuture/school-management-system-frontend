import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAuditLogs, getAuditLogById } from "./auditLogService.js";

const extractErrorMessage = (err, fallback = "An unexpected error occurred") => {
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    fallback
  );
};

export const fetchAuditLogs = createAsyncThunk(
  "auditLogs/fetchAuditLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getAuditLogs(params);
      return response;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to fetch audit logs"));
    }
  }
);

export const fetchAuditLogDetails = createAsyncThunk(
  "auditLogs/fetchAuditLogDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getAuditLogById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to fetch audit log details"));
    }
  }
);

const initialFilters = {
  search: "",
  action: "",
  module: "",
  entity_type: "",
  entity_id: "",
  status: "",
  startDate: "",
  endDate: "",
  school_id: "",
  user_id: "",
  sortBy: "id",
  sortOrder: "DESC",
  page: 1,
  limit: 20,
};

const auditLogSlice = createSlice({
  name: "auditLogs",
  initialState: {
    logs: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    selectedLog: null,
    loading: false,
    detailsLoading: false,
    error: null,
    detailsError: null,
    filters: initialFilters,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
    clearSelectedLog: (state) => {
      state.selectedLog = null;
      state.detailsError = null;
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    setLimit: (state, action) => {
      state.filters.limit = action.payload;
      state.filters.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAuditLogs
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload?.data || [];
        const pagination = action.payload?.pagination || {};
        state.total = Number(pagination.total ?? 0);
        state.page = Number(pagination.page ?? 1);
        state.limit = Number(pagination.limit ?? 20);
        state.totalPages = Number(pagination.totalPages ?? 1);
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchAuditLogDetails
      .addCase(fetchAuditLogDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchAuditLogDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedLog = action.payload;
      })
      .addCase(fetchAuditLogDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload;
      });
  },
});

export const {
  setFilters,
  resetFilters,
  clearSelectedLog,
  setPage,
  setLimit,
} = auditLogSlice.actions;

export default auditLogSlice.reducer;
