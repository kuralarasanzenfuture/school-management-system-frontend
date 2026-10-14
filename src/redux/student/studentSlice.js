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
  async (params = {}, thunkAPI) => {
    try {
      return await studentService.getStudents(params);
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
        err.response?.data?.message || err.message,
      );
    }
  },
);

// ================= UPDATE STATUS =================
export const updateStudentStatus = createAsyncThunk(
  "students/updateStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      return await studentService.updateStudentStatus({ id, status });
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
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
        const payload = action.payload;
        state.students = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        state.total = payload?.total ?? state.students.length;
        state.page = payload?.page ?? 1;
        state.limit = payload?.limit ?? 20;
        state.totalPages = payload?.totalPages ?? 1;
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

      // ================= UPDATE STATUS =================

      .addCase(updateStudentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateStudentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updated = action.payload?.data || action.payload;
        if (updated?.id) {
          state.students = state.students.map((student) =>
            student.id === updated.id ? { ...student, ...updated } : student,
          );
          if (state.student?.id === updated.id) {
            state.student = { ...state.student, ...updated };
          }
        }
      })

      .addCase(updateStudentStatus.rejected, (state, action) => {
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
