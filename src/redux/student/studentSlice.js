import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import studentService from "./studentService";

const initialState = {
  students: [],
  student: null,
  loading: false,
  success: false,
  error: null,
};

// ================= GET ALL =================
export const getStudents = createAsyncThunk(
  "students/getAll",
  async (_, thunkAPI) => {
    try {
      return await studentService.getStudents();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

// ================= GET BY ID =================
export const getStudentById = createAsyncThunk(
  "students/getById",
  async (id, thunkAPI) => {
    try {
      return await studentService.getStudentById(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

// ================= CREATE =================
export const createStudent = createAsyncThunk(
  "students/create",
  async (studentData, thunkAPI) => {
    try {
      return await studentService.createStudent(studentData);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

// ================= UPDATE =================
export const updateStudent = createAsyncThunk(
  "students/update",
  async ({ id, formData }, thunkAPI) => {
    try {
      return await studentService.updateStudent({ id, formData });
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// ================= DELETE =================
export const deleteStudent = createAsyncThunk(
  "students/delete",
  async (id, thunkAPI) => {
    try {
      await studentService.deleteStudent(id);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

const studentSlice = createSlice({
  name: "student",
  initialState,

  reducers: {
    resetStudentState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.student = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ================= GET ALL =================

      .addCase(getStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(getStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })

      .addCase(getStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= GET BY ID =================

      .addCase(getStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getStudentById.fulfilled, (state, action) => {
        state.loading = false;
        state.student = action.payload;
      })

      .addCase(getStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= CREATE =================

      .addCase(createStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.students.unshift(action.payload);
      })

      .addCase(createStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= UPDATE =================

      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.students = state.students.map((student) =>
          student.id === action.payload.id ? action.payload : student,
        );

        state.student = action.payload;
      })

      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= DELETE =================

      .addCase(deleteStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.students = state.students.filter(
          (student) => student.id !== action.payload,
        );
      })

      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetStudentState } = studentSlice.actions;

export default studentSlice.reducer;
