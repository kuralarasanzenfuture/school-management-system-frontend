import React, { useEffect } from "react";
import LoginLeftPanel from "../components/LoginLeftPanel.jsx";
import LoginForm from "../components/LoginForm.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import "../styles/login.css";

const LoginPage = () => {
  useEffect(() => {
    // Prevent document body scrolling on the login screen
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="login-page">
      <ThemeToggle />
      <div className="card">
        <LoginLeftPanel />
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
