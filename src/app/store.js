import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/redux/authSlice";
// import studentReducer from "../features/students/slice";
// import teacherReducer from "../features/teachers/slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // students: studentReducer,
    // teachers: teacherReducer,
  },
});