import LoginLeftPanel from "../components/LoginLeftPanel.jsx";
import LoginForm from "../components/LoginForm.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import "../styles/login.css";

const LoginPage = () => {
  return (
    <>
      <div className="login-page">
        <ThemeToggle />
        {/* <h1 classname="text-3xl font-bold underline">Hello world!</h1> */}
        <div className="card">
          <LoginLeftPanel />
          <LoginForm />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
