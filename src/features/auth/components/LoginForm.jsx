import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { loginUser } from "../../../redux/auth/authSlice.js";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.auth);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginId.trim()) {
      toast.error("Please enter your Username, Email, or Phone number");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    try {
      const result = await dispatch(
        loginUser({
          login_id: loginId.trim(),
          password: password,
        }),
      );

      if (loginUser.fulfilled.match(result)) {
        toast.success("Welcome back! Redirecting to dashboard…");
        navigate("/dashboard", { replace: true });
      } else {
        const errorMsg =
          result.payload ||
          result.error?.message ||
          "Invalid credentials. Please check and try again.";
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="form-panel">
      <div className="form-header">
        <div className="form-badge">Portal Access</div>
        <h2 className="form-title">Sign in to your account</h2>
        <p className="form-subtitle">
          Enter your institutional credentials to access your dashboard
        </p>
      </div>

      <form onSubmit={handleLogin} className="login-form-body">
        {/* Username / Email / Phone */}
        <div className="field">
          <label className="field-label" htmlFor="loginId">
            Username, Email, or Phone
          </label>
          <div className="input-wrap">
            <User size={18} className="input-icon-svg" />
            <input
              id="loginId"
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="e.g. admin or staff@school.com"
              required
              autoComplete="username"
              className="login-input"
            />
          </div>
        </div>

        {/* Password */}
        <div className="field">
          <div className="field-header">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                toast("Please contact your School Administrator to reset your password.", {
                  icon: "ℹ️",
                });
              }}
              className="forgot-link"
            >
              Forgot password?
            </a>
          </div>
          <div className="input-wrap">
            <Lock size={18} className="input-icon-svg" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              className="login-input pr-10"
            />
            <button
              type="button"
              className="eye-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember me option */}
        <div className="options-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox-input"
            />
            <span>Remember this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Verifying credentials…</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Security Footer Note */}
      <div className="form-footer-note">
        Protected by end-to-end encryption & RBAC policies
      </div>
    </div>
  );
};

export default LoginForm;
