import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/redux/authSlice";
import studentReducer from "../redux/student/studentSlice";
import roleReducer from "../redux/Administration/roles/roleSlice";
import usersReducer from "../redux/Administration/users/userSlice";
// import teacherReducer from "../features/teachers/slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    roles: roleReducer,
    users: usersReducer,
    // teachers: teacherReducer,
  },
});