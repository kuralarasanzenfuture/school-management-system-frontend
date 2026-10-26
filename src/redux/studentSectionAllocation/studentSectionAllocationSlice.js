import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllSectionAllocationsByToken,
  getAllSectionAllocations,
  checkExistingSectionAllocationByToken,
  getSectionAllocationById,
  createSectionAllocation,
  updateSectionAllocation,
  deleteSectionAllocation,
  getClassStudentsForAllocation,
  bulkCreateSectionAllocations,
} from "./studentSectionAllocation.service";

// Fetch Class Students for Section Allocation
export const fetchClassStudentsForAllocationThunk = createAsyncThunk(
  "studentSectionAllocations/fetchClassStudents",
  async (filters, { rejectWithValue }) => {
    try {
      return await getClassStudentsForAllocation(filters);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch class students for section allocation",
      );
    }
  },
);

// Bulk Create / Transfer Section Allocations
export const bulkCreateSectionAllocationThunk = createAsyncThunk(
  "studentSectionAllocations/bulkCreateSectionAllocation",
  async (data, { rejectWithValue }) => {
    try {
      return await bulkCreateSectionAllocations(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to perform bulk section allocation",
      );
    }
  },
);

// Fetch Allocations (Token-based)
export const fetchSectionAllocations = createAsyncThunk(
  "studentSectionAllocations/fetchSectionAllocations",
  async (filters, { rejectWithValue }) => {
    try {
      return await getAllSectionAllocationsByToken(filters);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch student section allocations",
      );
    }
  },
);

// Check Existing Allocation (Token-based)
export const checkSectionAllocationThunk = createAsyncThunk(
  "studentSectionAllocations/checkSectionAllocation",
  async (params, { rejectWithValue }) => {
    try {
      return await checkExistingSectionAllocationByToken(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to check section allocation",
      );
    }
  },
);

// Fetch Allocation By ID
export const fetchSectionAllocationById = createAsyncThunk(
  "studentSectionAllocations/fetchSectionAllocationById",
  async (id, { rejectWithValue }) => {
    try {
      return await getSectionAllocationById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch section allocation details",
      );
    }
  },
);

// Create Allocation
export const createSectionAllocationThunk = createAsyncThunk(
  "studentSectionAllocations/createSectionAllocation",
  async (data, { rejectWithValue }) => {
    try {
      return await createSectionAllocation(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create section allocation",
      );
    }
  },
);

// Update Allocation
export const updateSectionAllocationThunk = createAsyncThunk(
  "studentSectionAllocations/updateSectionAllocation",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateSectionAllocation(id, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update section allocation",
      );
    }
  },
);

// Delete Allocation
export const deleteSectionAllocationThunk = createAsyncThunk(
  "studentSectionAllocations/deleteSectionAllocation",
  async (id, { rejectWithValue }) => {
    try {
      await deleteSectionAllocation(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete section allocation",
      );
    }
  },
);

const unwrap = (payload) => payload?.data ?? payload;

const studentSectionAllocationSlice = createSlice({
  name: "studentSectionAllocations",
  initialState: {
    allocations: [],
    currentAllocation: null,
    loading: false,
    error: null,
    classStudents: [],
    classStudentsLoading: false,
    classStudentsError: null,
    bulkLoading: false,
    bulkError: null,
  },
  reducers: {
    clearCurrentAllocation(state) {
      state.currentAllocation = null;
    },
    clearClassStudents(state) {
      state.classStudents = [];
      state.classStudentsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchSectionAllocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSectionAllocations.fulfilled, (state, action) => {
        state.loading = false;
        const data = unwrap(action.payload);
        state.allocations = Array.isArray(data) ? data : (data?.data ?? []);
      })
      .addCase(fetchSectionAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.allocations = [];
      })

      // Fetch By Id
      .addCase(fetchSectionAllocationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSectionAllocationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAllocation = unwrap(action.payload);
      })
      .addCase(fetchSectionAllocationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createSectionAllocationThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSectionAllocationThunk.fulfilled, (state, action) => {
        state.loading = false;
        const created = unwrap(action.payload);
        if (created && typeof created === "object") {
          state.allocations.unshift(created);
        }
      })
      .addCase(createSectionAllocationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateSectionAllocationThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSectionAllocationThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = unwrap(action.payload);
        if (updated?.id) {
          const index = state.allocations.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.allocations[index] = { ...state.allocations[index], ...updated };
          }
        }
        state.currentAllocation = updated;
      })
      .addCase(updateSectionAllocationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteSectionAllocationThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSectionAllocationThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.allocations = state.allocations.filter(
          (item) => item.id !== action.payload,
        );
      })
      .addCase(deleteSectionAllocationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Class Students for Allocation
      .addCase(fetchClassStudentsForAllocationThunk.pending, (state) => {
        state.classStudentsLoading = true;
        state.classStudentsError = null;
      })
      .addCase(fetchClassStudentsForAllocationThunk.fulfilled, (state, action) => {
        state.classStudentsLoading = false;
        const data = unwrap(action.payload);
        state.classStudents = Array.isArray(data) ? data : (data?.data ?? []);
      })
      .addCase(fetchClassStudentsForAllocationThunk.rejected, (state, action) => {
        state.classStudentsLoading = false;
        state.classStudentsError = action.payload;
        state.classStudents = [];
      })

      // Bulk Create Section Allocations
      .addCase(bulkCreateSectionAllocationThunk.pending, (state) => {
        state.bulkLoading = true;
        state.bulkError = null;
      })
      .addCase(bulkCreateSectionAllocationThunk.fulfilled, (state) => {
        state.bulkLoading = false;
      })
      .addCase(bulkCreateSectionAllocationThunk.rejected, (state, action) => {
        state.bulkLoading = false;
        state.bulkError = action.payload;
      });
  },
});

export const { clearCurrentAllocation, clearClassStudents } = studentSectionAllocationSlice.actions;

export default studentSectionAllocationSlice.reducer;
