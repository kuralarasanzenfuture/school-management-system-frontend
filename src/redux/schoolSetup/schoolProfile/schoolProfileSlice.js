import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSchool,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
} from "./schoolService";

// Get All Schools
export const fetchSchools = createAsyncThunk(
  "school/fetchSchools",
  async (_, thunkAPI) => {
    try {
      return await getSchool();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

// Get School By ID
export const fetchSchoolById = createAsyncThunk(
  "school/fetchSchoolById",
  async (id, thunkAPI) => {
    try {
      return await getSchoolById(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

// Create School
export const addSchool = createAsyncThunk(
  "school/addSchool",
  async (schoolData, thunkAPI) => {
    try {
      return await createSchool(schoolData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

// Update School
export const editSchool = createAsyncThunk(
  "school/editSchool",
  async ({ id, formData }, thunkAPI) => {
    try {
      return await updateSchool(id, formData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

// Delete School
export const removeSchool = createAsyncThunk(
  "school/removeSchool",
  async (id, thunkAPI) => {
    try {
      await deleteSchool(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

const initialState = {
  schools: [],
  school: null,
  loading: false,
  success: false,
  error: null,
};

const schoolProfileSlice = createSlice({
  name: "schoolProfile",
  initialState,
  reducers: {
    resetSchoolState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.school = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch Schools
      .addCase(fetchSchools.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // Supports both:
        // { schools: [...] }
        // or directly [...]
        state.schools = Array.isArray(action.payload)
          ? action.payload
          : action.payload.schools || [];
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch School By ID
      .addCase(fetchSchoolById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSchoolById.fulfilled, (state, action) => {
        state.loading = false;
        state.school = action.payload;
      })
      .addCase(fetchSchoolById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create School
      .addCase(addSchool.pending, (state) => {
        state.loading = true;
      })
      .addCase(addSchool.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const school = action.payload.school || action.payload;
        state.schools.push(school);
      })
      .addCase(addSchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update School
      .addCase(editSchool.pending, (state) => {
        state.loading = true;
      })
      .addCase(editSchool.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const updatedSchool = action.payload.school || action.payload;

        state.schools = state.schools.map((school) =>
          school.id === updatedSchool.id ? updatedSchool : school,
        );

        state.school = updatedSchool;
      })
      .addCase(editSchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete School
      .addCase(removeSchool.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeSchool.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.schools = state.schools.filter(
          (school) => school.id !== action.payload,
        );
      })
      .addCase(removeSchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSchoolState } = schoolProfileSlice.actions;

export default schoolProfileSlice.reducer;
