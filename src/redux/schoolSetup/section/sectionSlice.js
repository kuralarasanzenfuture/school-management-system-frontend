import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSections,
  getSectionsTree,
  getSectionById,
  getSectionByClassId,
  createSection,
  updateSection,
  deleteSection,
  updateSectionStatus,
} from "./section.service.js";

// ==============================
// Fetch Sections
// ==============================
export const fetchSections = createAsyncThunk(
  "sections/fetchSections",
  async (args = {}, { rejectWithValue }) => {
    try {
      let params = {};
      if (args && typeof args === "object") {
        params = args.schoolId || args.classId
          ? {
              school_id: args.schoolId,
              class_id: args.classId,
              ...args,
            }
          : args;
      } else if (args) {
        params = { school_id: args };
      }
      return await getSections(params);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// ==============================
// Toggle Section Status
// ==============================
export const toggleSectionStatus = createAsyncThunk(
  "sections/toggleSectionStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const data = await updateSectionStatus(id, status);
      return { id, status, data };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// ==============================
// Fetch Sections Tree
// ==============================
export const fetchSectionsTree = createAsyncThunk(
  "sections/fetchSectionsTree",
  async ({ schoolId, classId }, { rejectWithValue }) => {
    try {
      return await getSectionsTree(schoolId, classId);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// ==============================
// Fetch Section By Id
// ==============================
export const fetchSectionById = createAsyncThunk(
  "sections/fetchSectionById",
  async (id, { rejectWithValue }) => {
    try {
      return await getSectionById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// ==============================
// Fetch Sections By Class
// ==============================
export const fetchSectionsByClass = createAsyncThunk(
  "sections/fetchSectionsByClass",
  async (classId, { rejectWithValue }) => {
    try {
      return await getSectionByClassId(classId);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// ==============================
// Add Section
// ==============================
export const addSection = createAsyncThunk(
  "sections/addSection",
  async (sectionData, { rejectWithValue }) => {
    try {
      return await createSection(sectionData);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// ==============================
// Edit Section
// ==============================
export const editSection = createAsyncThunk(
  "sections/editSection",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateSection(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

// ==============================
// Delete Section
// ==============================
export const removeSection = createAsyncThunk(
  "sections/removeSection",
  async (id, { rejectWithValue }) => {
    try {
      await deleteSection(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

const sectionSlice = createSlice({
  name: "sections",
  initialState: {
    sections: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    sectionsTree: [],
    section: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearSection(state) {
      state.section = null;
    },
    clearSectionsTree(state) {
      state.sectionsTree = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // ==============================
      // Fetch Sections
      // ==============================
      .addCase(fetchSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        if (Array.isArray(p)) {
          state.sections = p;
          state.total = p.length;
        } else if (p && Array.isArray(p.sections)) {
          state.sections = p.sections;
          state.total = p.total ?? p.sections.length;
          state.page = p.page ?? 1;
          state.limit = p.limit ?? 20;
          state.totalPages = p.totalPages ?? 1;
        } else if (p && Array.isArray(p.data)) {
          state.sections = p.data;
          state.total = p.total ?? p.data.length;
          state.page = p.page ?? 1;
          state.limit = p.limit ?? 20;
          state.totalPages = p.totalPages ?? 1;
        } else {
          state.sections = [];
          state.total = 0;
        }
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch sections";
      })

      // ==============================
      // Toggle Status
      // ==============================
      .addCase(toggleSectionStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const target = state.sections.find((s) => String(s.id) === String(id));
        if (target) {
          target.status = status;
        }
      })

      // ==============================
      // Fetch Sections Tree
      // ==============================
      .addCase(fetchSectionsTree.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSectionsTree.fulfilled, (state, action) => {
        state.loading = false;
        state.sectionsTree = action.payload.sections || action.payload || [];
      })
      .addCase(fetchSectionsTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch section tree";
      })

      // ==============================
      // Fetch By Id
      // ==============================
      .addCase(fetchSectionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSectionById.fulfilled, (state, action) => {
        state.loading = false;
        state.section = action.payload.section || action.payload;
      })
      .addCase(fetchSectionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch section";
      })

      // ==============================
      // Fetch By Class
      // ==============================
      .addCase(fetchSectionsByClass.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSectionsByClass.fulfilled, (state, action) => {
        state.loading = false;
        state.sections = action.payload.sections || action.payload || [];
      })
      .addCase(fetchSectionsByClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch sections";
      })

      // ==============================
      // Add Section
      // ==============================
      .addCase(addSection.pending, (state) => {
        state.loading = true;
      })
      .addCase(addSection.fulfilled, (state, action) => {
        state.loading = false;

        const newSection = action.payload.section || action.payload;

        state.sections.push(newSection);
      })
      .addCase(addSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create section";
      })

      // ==============================
      // Edit Section
      // ==============================
      .addCase(editSection.pending, (state) => {
        state.loading = true;
      })
      .addCase(editSection.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.section || action.payload;

        const index = state.sections.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.sections[index] = updated;
        }

        state.section = updated;
      })
      .addCase(editSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update section";
      })

      // ==============================
      // Delete Section
      // ==============================
      .addCase(removeSection.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeSection.fulfilled, (state, action) => {
        state.loading = false;

        state.sections = state.sections.filter(
          (item) => item.id !== action.payload,
        );
      })
      .addCase(removeSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete section";
      });
  },
});

export const { clearSection, clearSectionsTree } = sectionSlice.actions;

export default sectionSlice.reducer;
