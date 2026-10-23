import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllClassSections,
  getClassSectionById,
  createClassSection,
  updateClassSection,
  deleteClassSection,
  updateClassSectionStatus,
} from "./classSection.service.js";

// Fetch All
export const fetchClassSections = createAsyncThunk(
  "classSections/fetchClassSections",
  async (params = {}, { rejectWithValue }) => {
    try {
      let queryParams = {};
      if (params && typeof params === "object") {
        queryParams = { paginate: false, ...params };
      } else if (params) {
        queryParams = { school_id: params, paginate: false };
      } else {
        queryParams = { paginate: false };
      }
      return await getAllClassSections(queryParams);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch class sections",
      );
    }
  },
);

// Fetch By Id
export const fetchClassSectionById = createAsyncThunk(
  "classSections/fetchClassSectionById",
  async (id, { rejectWithValue }) => {
    try {
      return await getClassSectionById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch class section",
      );
    }
  },
);

// Create
export const addClassSection = createAsyncThunk(
  "classSections/addClassSection",
  async (data, { rejectWithValue }) => {
    try {
      return await createClassSection(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create class section",
      );
    }
  },
);

// Update
export const editClassSection = createAsyncThunk(
  "classSections/editClassSection",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateClassSection(id, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update class section",
      );
    }
  },
);

// Toggle Status
export const toggleClassSectionStatus = createAsyncThunk(
  "classSections/toggleClassSectionStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await updateClassSectionStatus(id, status);
      return { id, status, res };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status",
      );
    }
  },
);

// Delete
export const removeClassSection = createAsyncThunk(
  "classSections/removeClassSection",
  async (id, { rejectWithValue }) => {
    try {
      await deleteClassSection(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete class section",
      );
    }
  },
);

const initialState = {
  classSections: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  classSection: null,
  loading: false,
  error: null,
};

const classSectionSlice = createSlice({
  name: "classSections",
  initialState,
  reducers: {
    clearClassSection(state) {
      state.classSection = null;
    },
    clearClassSectionError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchClassSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassSections.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        if (Array.isArray(p)) {
          state.classSections = p;
          state.total = p.length;
        } else if (p && Array.isArray(p.classSections)) {
          state.classSections = p.classSections;
          state.total = p.total ?? p.classSections.length;
          state.page = p.page ?? 1;
          state.limit = p.limit ?? 20;
          state.totalPages = p.totalPages ?? 1;
        } else if (p && Array.isArray(p.data)) {
          state.classSections = p.data;
          state.total = p.total ?? p.data.length;
          state.page = p.page ?? 1;
          state.limit = p.limit ?? 20;
          state.totalPages = p.totalPages ?? 1;
        } else {
          state.classSections = [];
          state.total = 0;
        }
      })
      .addCase(fetchClassSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Id
      .addCase(fetchClassSectionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClassSectionById.fulfilled, (state, action) => {
        state.loading = false;
        state.classSection = action.payload.data || action.payload;
      })
      .addCase(fetchClassSectionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(addClassSection.pending, (state) => {
        state.loading = true;
      })
      .addCase(addClassSection.fulfilled, (state, action) => {
        state.loading = false;
        const newItem = action.payload.data || action.payload;
        state.classSections.unshift(newItem);
      })
      .addCase(addClassSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(editClassSection.pending, (state) => {
        state.loading = true;
      })
      .addCase(editClassSection.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload;
        if (updated && updated.id) {
          const index = state.classSections.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.classSections[index] = {
              ...state.classSections[index],
              ...updated,
            };
          }
        }
      })
      .addCase(editClassSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Status
      .addCase(toggleClassSectionStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const item = state.classSections.find((cs) => String(cs.id) === String(id));
        if (item) {
          item.status = status;
        }
      })

      // Delete
      .addCase(removeClassSection.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeClassSection.fulfilled, (state, action) => {
        state.loading = false;
        state.classSections = state.classSections.filter(
          (item) => item.id !== action.payload,
        );
      })
      .addCase(removeClassSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearClassSection, clearClassSectionError } =
  classSectionSlice.actions;

export default classSectionSlice.reducer;
