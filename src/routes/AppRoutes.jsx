import { Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";

import MainLayout from "../common/layouts/MainLayout.jsx";

import Dashboard from "../features/dashboard/pages/Dashboard";


import StudentsPage from "../features/students/pages/StudentPage.jsx";
import StudentDetailsPage from "../features/students/pages/StudentDetailsPage.jsx";
import RolePage from "../features/Administration/roles/pages/RolePage.jsx";
import UserPage from "../features/Administration/user/pages/UserPage.jsx";
import SchoolProfilePage from "../features/schoolSetup/schoolProfile/pages/SchoolProfilePage.jsx";

// import TeacherList from "../features/teachers/pages/TeacherList";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

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

      </Route>
    </Routes>
  );
};

export default AppRoutes;