import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllClassSections,
  getClassSectionById,
  createClassSection,
  updateClassSection,
  deleteClassSection,
} from "./classSection.service.js";

// Fetch All
export const fetchClassSections = createAsyncThunk(
  "classSections/fetchClassSections",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllClassSections();
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
        state.classSections =
          action.payload.classSections ||
          action.payload.data ||
          action.payload ||
          [];
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

        const index = state.classSections.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.classSections[index] = updated;
        }

        state.classSection = updated;
      })
      .addCase(editClassSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
