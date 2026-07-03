import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../redux/auth/authSlice.js";
import studentReducer from "../redux/student/studentSlice";
import roleReducer from "../redux/Administration/roles/roleSlice";
import usersReducer from "../redux/Administration/users/userSlice";
import departmentReducer from "../redux/schoolSetup/department/departmentSlice";
import classReducer from "../redux/schoolSetup/class/classSlice";
import sectionReducer from "../redux/schoolSetup/section/sectionSlice";
import schoolProfileReducer from "../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import academicYearReducer from "../redux/schoolSetup/academic-year/academicYearSlice.js";
// import teacherReducer from "../features/teachers/slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    schoolProfile: schoolProfileReducer,
    students: studentReducer,
    roles: roleReducer,
    users: usersReducer,

    departments: departmentReducer,
    classes: classReducer,
    sections: sectionReducer,
    academicYears: academicYearReducer,
    // teachers: teacherReducer,
  },
});