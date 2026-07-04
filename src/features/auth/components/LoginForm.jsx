import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../../redux/auth/authSlice.js";

const roles = ["Admin", "Teacher", "Student", "Parent"];

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, token } = useSelector((state) => state.auth);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Admin");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginId.trim()) {
      alert("Enter Username or Email or Mobile Number");
      return;
    }

    if (!password.trim()) {
      alert("Enter Password");
      return;
    }

    try {
      const result = await dispatch(
        loginUser({
          login_id: loginId,
          password: password,
        }),
      );

      // console.log("Dispatch Result:", result);

      if (loginUser.fulfilled.match(result)) {
        alert("Login Successful");

        // navigate("/dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        alert(result.payload || "Login Failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="form-panel">
      <div className="form-header">
        <div className="form-eyebrow">Welcome Back</div>

        <div className="form-title">Sign in to your account</div>
      </div>

      {/* <div className="role-tabs">
        {roles.map((item) => (
          <button
            key={item}
            className={`role-tab ${role === item ? "active" : ""}`}
            onClick={() => setRole(item)}
          >
            {item}
          </button>
        ))}
      </div> */}

      <form onSubmit={handleLogin}>
        {/* Username */}
        <div className="field">
          <label>Username / Email / Phone *</label>

          <div className="input-wrap">
            <span className="input-icon">👨‍💼</span>

            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="Enter username, email or phone"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="field">
          <label>Password *</label>

          <div className="input-wrap">
            <span className="input-icon">🔒</span>

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Signing..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
