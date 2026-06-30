import { Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";

import MainLayout from "../common/layouts/MainLayout.jsx";

import Dashboard from "../features/dashboard/pages/Dashboard";


import StudentsPage from "../features/students/pages/StudentPage.jsx";

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

        {/* <Route path="/teachers" element={<TeacherList />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;