import { Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";

import MainLayout from "../common/layouts/MainLayout.jsx";

// import Dashboard from "../features/dashboard/pages/Dashboard";
import Dashboard from "../features/dashboard copy/pages/Dashboard";

// import StudentsPage from "../features/students/pages/StudentPage.jsx";
// import StudentsPage from "../features/students-new/pages/StudentsPage.jsx";
import StudentsPage from "../features/students-new-page/pages/StudentsPage.jsx";
import StudentDetailsPage from "../features/students/pages/StudentDetailsPage.jsx";
import RolePage from "../features/Administration/roles/pages/RolePage.jsx";
import UserPage from "../features/Administration/user/pages/UserPage.jsx";
import SchoolProfilePage from "../features/schoolSetup/schoolProfile/pages/SchoolProfilePage.jsx";
// import DepartmentPage from "../features/schoolSetup/departments/pages/DepartmentPage.jsx";
import DepartmentPage from "../features/schoolSetup/departments-new/pages/DepartmentPage.jsx";
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
import LeaveTypePage from "../features/employeeManagement/employeeLeaveType/pages/LeaveTypePage.jsx";
import StudentFormPage from "../features/students-new-page/pages/StudentFormPage.jsx";
import SalaryComponentPage from "../features/employeeManagement/employeeSalaryComponent/pages/SalaryComponentPage.jsx";
import NotFoundPage from "../common/pages/404/NotFoundPage.jsx";
import LoadingSpinner from "../common/components/loading/LoadingSpinner.jsx";
import ProfilePage from "../common/pages/profile/ProfilePage.jsx";
import SalaryStructurePage from "../features/employeeManagement/employeeSalaryStructure/pages/SalaryStructurePage.jsx";
import SalaryStructureDetailPage from "../features/employeeManagement/employeeSalaryStructureDetail/pages/SalaryStructureDetailPage.jsx";
import SalaryManagementV1 from "../features/employeeManagement/Salarymanagement/pages/SalaryManagementV1.jsx";
import SalaryManagementV2 from "../features/employeeManagement/Salarymanagement/pages/SalaryManagementV2.jsx";
import SalaryManagementV3 from "../features/employeeManagement/Salarymanagement/pages/SalaryManagementV3.jsx";

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
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/students" element={<StudentsPage />} />
          {/* Add Student */}
          <Route path="/students/add" element={<StudentFormPage />} />

          {/* Edit Student */}
          <Route path="/students/:id/edit" element={<StudentFormPage />} />
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
          <Route path="/employee-leaves" element={<LeaveTypePage />} />
          <Route path="/employee-salary-components" element={<SalaryComponentPage />} />
          {/* <Route path="/employee-salary-structures" element={<SalaryStructurePage />} /> */}
          <Route path="/employee-salary-structures" element={<SalaryManagementV1 />} />
          {/* <Route path="/employee-salary-structures" element={<SalaryManagementV2 />} /> */}
          {/* <Route path="/employee-salary-structures" element={<SalaryManagementV3 />} /> */}
          <Route path="/employee-salary-assignment" element={<SalaryStructureDetailPage />} />

          <Route path="/loading" element={<LoadingSpinner />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
