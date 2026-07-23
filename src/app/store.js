import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../redux/auth/authSlice.js";
import studentReducer from "../redux/student/studentSlice";
import roleReducer from "../redux/Administration/roles/roleSlice";
import usersReducer from "../redux/Administration/users/userSlice";
import departmentReducer from "../redux/schoolSetup/department/departmentSlice";
import classReducer from "../redux/schoolSetup/class/classSlice";
import sectionReducer from "../redux/schoolSetup/section/sectionSlice";
import classSectionReducer from "../redux/schoolSetup/class-sections/classSectionSlice.js";
import schoolProfileReducer from "../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import academicYearReducer from "../redux/schoolSetup/academic-year/academicYearSlice.js";
import employeeReducer from "../redux/employee/employeeSlice.js";
import employeeDesignationReducer from "../redux/employeeDesignation/employeeDesignationSlice.js";
import studentAdmissionReducer from "../redux/studentsAdmission/studentAdmissionSlice.js";
import studentAttendanceReducer from "../redux/studentAttendance/studentAttendanceSlice.js";
import subjectReducer from "../redux/schoolSetup/subject/subjectSlice.js";
import subjectGroupReducer from "../redux/schoolSetup/subject_group/subjectGroupSlice.js";
import classSubjectReducer from "../redux/schoolSetup/class_subjects/classSubjectSlice.js";

import employeeShiftReducer from "../redux/employeeShift/employeeShiftSlice.js";
import employeeAttendanceReducer from "../redux/employeeAttendance/employeeAttendanceSlice.js";
import employeeLeaveTypeReducer from "../redux/employeeLeaveType/employeeLeaveTypeSlice.js";
import employeeSalaryComponentReducer from "../redux/employee_salary_component/employeeSalaryComponentSlice.js";
import employeeSalaryStructureReducer from "../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
import employeeSalaryStructureDetailReducer from "../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";

import changePasswordReducer from "../redux/changePassword/changePasswordSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    changePassword: changePasswordReducer,
    schoolProfile: schoolProfileReducer,
    students: studentReducer,
    roles: roleReducer,
    users: usersReducer,

    departments: departmentReducer,
    classes: classReducer,
    sections: sectionReducer,
    classSections: classSectionReducer,
    academicYears: academicYearReducer,
    employees: employeeReducer,
    employeeDesignations: employeeDesignationReducer,

    studentAdmissions: studentAdmissionReducer,
    studentAttendance: studentAttendanceReducer,

    subjects: subjectReducer,
    subjectGroups: subjectGroupReducer,
    classSubjects: classSubjectReducer,

    employeeShifts: employeeShiftReducer,
    employeeAttendance: employeeAttendanceReducer,
    employeeLeaveTypes: employeeLeaveTypeReducer,
    employeeSalaryComponents: employeeSalaryComponentReducer,
    employeeSalaryStructure: employeeSalaryStructureReducer,
    employeeSalaryStructureDetails: employeeSalaryStructureDetailReducer,
  },
});
