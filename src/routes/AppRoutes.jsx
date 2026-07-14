import { Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";

import MainLayout from "../common/layouts/MainLayout.jsx";

import Dashboard from "../features/dashboard/pages/Dashboard";

import StudentsPage from "../features/students/pages/StudentPage.jsx";
import StudentDetailsPage from "../features/students/pages/StudentDetailsPage.jsx";
import RolePage from "../features/Administration/roles/pages/RolePage.jsx";
import UserPage from "../features/Administration/user/pages/UserPage.jsx";
import SchoolProfilePage from "../features/schoolSetup/schoolProfile/pages/SchoolProfilePage.jsx";
import DepartmentPage from "../features/schoolSetup/departments/pages/DepartmentPage.jsx";
import ClassPage from "../features/schoolSetup/class/pages/ClassPage.jsx";
import SectionPage from "../features/schoolSetup/section/pages/SectionPage.jsx";
import AcademicYearPage from "../features/schoolSetup/academic-year/pages/AcademicYearPage.jsx";
import EmployeePage from "../features/employees/pages/EmployeePage.jsx";
import EmployeeDesignationPage from "../features/employeeDesignations/pages/EmployeeDesignationPage.jsx";
import PublicRoute from "./PublicRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import EmployeeDetailsPage from "../features/employees/pages/EmployeeDetailsPage.jsx";
import ClassSectionPage from "../features/schoolSetup/class-section/pages/ClassSectionPage.jsx";
import StudentAdmissionPage from "../features/studentsAdmission/pages/StudentAdmissionPage.jsx";
import SubjectPage from "../features/schoolSetup/subject/pages/SubjectPage.jsx";
import SubjectGroupPage from "../features/schoolSetup/subject_group/pages/SubjectGroupPage.jsx";
// import ClassSubjectPage from "../features/schoolSetup/class_subject/pages/ClassSubjectPage.jsx";
import ClassSubjectPage from "../features/schoolSetup/class_subject-new/pages/ClassSubjectPage.jsx";
import EmployeeShiftPage from "../features/employeeManagement/employeeShift-new/pages/EmployeeShiftPage.jsx";
import EmployeeAttendancePage from "../features/employeeManagement/employeeAttendance/pages/EmployeeAttendancePage.jsx";

// import TeacherList from "../features/teachers/pages/TeacherList";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login */}
      <Route element={<PublicRoute />}>
        {/* Public */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard Layout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailsPage />} />

          {/* <Route path="/teachers" element={<TeacherList />} /> */}

          <Route path="/roles" element={<RolePage />} />
          {/* <Route path="/roles/:id" element={<RolePage />} /> */}
          <Route path="/users" element={<UserPage />} />
          {/* <Route path="/users/:id" element={<UserPage />} /> */}

          <Route path="/school-profile" element={<SchoolProfilePage />} />
          <Route path="/academic-years" element={<AcademicYearPage />} />
          <Route path="/departments" element={<DepartmentPage />} />
          <Route path="/classes" element={<ClassPage />} />
          <Route path="/sections" element={<SectionPage />} />
          <Route path="/class-sections" element={<ClassSectionPage />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
          <Route
            path="/employee-designations"
            element={<EmployeeDesignationPage />}
          />
          <Route
            path="/student-admissions"
            element={<StudentAdmissionPage />}
          />
          <Route path="/subjects" element={<SubjectPage />} />
          <Route path="/subject-groups" element={<SubjectGroupPage />} />
          <Route path="/class-subjects" element={<ClassSubjectPage />} />
          <Route path="/employee-shifts" element={<EmployeeShiftPage />} />
          <Route path="/employee-attendance" element={<EmployeeAttendancePage />} />

          <Route path="*" element={<div>404</div>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
