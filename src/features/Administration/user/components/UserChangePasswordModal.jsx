import React, { useState, useEffect } from "react";
import { X, KeyRound, Eye, EyeOff, Loader2, Check, ShieldCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import { editUser, fetchUsers } from "../../../../redux/Administration/users/userSlice.js";

const REQUIREMENTS = [
  { key: "length", label: "At least 6 characters", test: (v) => v.length >= 6 },
  { key: "upper", label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { key: "number", label: "Number", test: (v) => /\d/.test(v) },
  { key: "special", label: "Special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function getStrength(password) {
  if (!password) return { score: 0, label: "", tone: "default" };
  const count = REQUIREMENTS.filter((r) => r.test(password)).length;
  if (count <= 1) return { score: 1, label: "Weak", tone: "weak" };
  if (count === 2) return { score: 2, label: "Fair", tone: "fair" };
  if (count === 3) return { score: 3, label: "Good", tone: "good" };
  return { score: 4, label: "Strong", tone: "strong" };
}

export default function UserChangePasswordModal({
  isOpen,
  onClose,
  targetUser = null,
}) {
  const dispatch = useDispatch();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirm(false);
      setErrors({});
      setSuccessMessage("");
    }
  }, [isOpen]);

  if (!isOpen || !targetUser) return null;

  const strength = getStrength(password);

  const validate = () => {
    const e = {};
    if (!password) {
      e.password = "New password is required";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      e.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      await dispatch(
        editUser({
          id: targetUser.id,
          formData: { password },
        }),
      ).unwrap();

      setSuccessMessage(`Password updated successfully for ${targetUser.username}`);
      dispatch(fetchUsers());

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrors({ form: err || "Failed to update password" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="up-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="up-modal-panel w-full max-w-md rounded-2xl overflow-hidden bg-card border border-border shadow-2xl animate-in fade-in-50 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="up-modal-header flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="up-modal-title text-[16px] font-bold">
                Change Password
              </h2>
              <p className="text-[12px] text-muted-foreground">
                Set a new password for <span className="font-semibold text-foreground">@{targetUser.username}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="up-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-muted text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {errors.form && (
            <div className="rounded-lg px-3.5 py-2 text-[12.5px] bg-destructive/10 text-destructive border border-destructive/20 font-medium">
              {errors.form}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg px-3.5 py-2 text-[12.5px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-2">
              <Check size={15} /> {successMessage}
            </div>
          )}

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="up-field-label text-[13px] font-medium">
              New Password <span className="up-field-required">*</span>
            </label>
            <div className="relative">
              <input
                autoFocus
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((er) => ({ ...er, password: null }));
                }}
                placeholder="Enter at least 6 characters"
                className={`up-input w-full rounded-lg pl-3.5 pr-10 py-2.5 text-[14px] outline-none transition-all ${
                  errors.password ? "up-input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength meter */}
            {password && (
              <div className="mt-1 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-muted-foreground">Strength:</span>
                  <span
                    className={
                      strength.tone === "strong"
                        ? "text-emerald-500"
                        : strength.tone === "good"
                        ? "text-blue-500"
                        : strength.tone === "fair"
                        ? "text-amber-500"
                        : "text-rose-500"
                    }
                  >
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden flex gap-0.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 h-full transition-all duration-300 ${
                        step <= strength.score
                          ? strength.tone === "strong"
                            ? "bg-emerald-500"
                            : strength.tone === "good"
                            ? "bg-blue-500"
                            : strength.tone === "fair"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                          : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="min-h-[16px]">
              {errors.password && (
                <p className="up-field-error text-[11px]">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="up-field-label text-[13px] font-medium">
              Confirm New Password <span className="up-field-required">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((er) => ({ ...er, confirmPassword: null }));
                  }
                }}
                placeholder="Re-type new password"
                className={`up-input w-full rounded-lg pl-3.5 pr-10 py-2.5 text-[14px] outline-none transition-all ${
                  errors.confirmPassword ? "up-input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="min-h-[16px]">
              {errors.confirmPassword && (
                <p className="up-field-error text-[11px]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="text-[13.5px] font-semibold px-4 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || Boolean(successMessage)}
              className="up-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
