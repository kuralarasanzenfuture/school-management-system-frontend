import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Eye, EyeOff, Check, KeyRound } from "lucide-react";
import {
    changePassword,
    clearChangePasswordState,
} from "../../../redux/changePassword/changePasswordSlice.js";
import "./ChangePassword.css";

const EMPTY = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

const REQUIREMENTS = [
    { key: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
    { key: "upper", label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
    { key: "lower", label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
    { key: "number", label: "One number", test: (v) => /\d/.test(v) },
    {
        key: "special",
        label: "One special character",
        test: (v) => /[^A-Za-z0-9]/.test(v),
    },
];

function getStrength(password) {
    const metCount = REQUIREMENTS.filter((r) => r.test(password)).length;
    if (!password) return { score: 0, label: "", tone: "" };
    if (metCount <= 2) return { score: 1, label: "Weak", tone: "weak" };
    if (metCount === 3) return { score: 2, label: "Fair", tone: "fair" };
    if (metCount === 4) return { score: 3, label: "Good", tone: "good" };
    return { score: 4, label: "Strong", tone: "strong" };
}

export default function ChangePasswordModal({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const { loading, error, success } = useSelector(
        (state) => state.changePassword ?? {},
    );

    const [data, setData] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setData(EMPTY);
        setErrors({});
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
        dispatch(clearChangePasswordState());
    }, [isOpen, dispatch]);

    // Close automatically a moment after a successful change, so the person
    // sees the confirmation before the modal disappears.
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => {
            dispatch(clearChangePasswordState());
            onClose();
        }, 1500);
        return () => clearTimeout(timer);
    }, [success, dispatch, onClose]);

    if (!isOpen) return null;

    const strength = getStrength(data.newPassword);
    const metRequirements = REQUIREMENTS.map((r) => ({
        ...r,
        met: r.test(data.newPassword),
    }));
    const allRequirementsMet = metRequirements.every((r) => r.met);
    const passwordsMatch =
        data.confirmPassword.length > 0 && data.newPassword === data.confirmPassword;
    const sameAsCurrent =
        data.newPassword.length > 0 && data.newPassword === data.currentPassword;

    const set = (key) => (e) => {
        setData((d) => ({ ...d, [key]: e.target.value }));
        if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
    };

    const validate = () => {
        const e = {};
        if (!data.currentPassword)
            e.currentPassword = "Current password is required";
        if (!data.newPassword) e.newPassword = "New password is required";
        else if (!allRequirementsMet)
            e.newPassword = "Password doesn't meet all requirements";
        else if (sameAsCurrent)
            e.newPassword = "New password must be different from the current one";
        if (!data.confirmPassword)
            e.confirmPassword = "Please confirm your new password";
        else if (!passwordsMatch) e.confirmPassword = "Passwords don't match";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        // console.log({
        //     currentPassword: data.currentPassword,
        //     newPassword: data.newPassword,
        //     confirmPassword: data.confirmPassword,
        // });
        dispatch(
            changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            }),
        );
    };

    const inputCls = (key) =>
        `cpw-input w-full rounded-lg pl-3.5 pr-10 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors[key] ? "cpw-input-error" : ""}`;

    return (
        <div
            className="cpw-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="cpw-modal w-full max-w-md rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="cpw-modal-header flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 className="cpw-modal-title text-[16px] font-bold flex items-center gap-2">
                            <KeyRound size={17} /> Change Password
                        </h2>
                        <p className="cpw-modal-subtitle text-[12px] mt-0.5">
                            Choose a strong, unique password.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="cpw-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
                    {error && (
                        <div className="cpw-alert-error rounded-lg px-3.5 py-2.5 text-[13px]">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="cpw-alert-success rounded-lg px-3.5 py-2.5 text-[13px]">
                            Password changed successfully.
                        </div>
                    )}

                    {/* Current password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="cpw-field-label text-[13px] font-medium">
                            Current Password <span className="cpw-field-required">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                className={inputCls("currentPassword")}
                                value={data.currentPassword}
                                onChange={set("currentPassword")}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent((v) => !v)}
                                className="cpw-eye-btn absolute right-3 top-1/2 -translate-y-1/2"
                                tabIndex={-1}
                            >
                                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="h-4">
                            {errors.currentPassword && (
                                <p className="cpw-field-error text-[11px]">
                                    {errors.currentPassword}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* New password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="cpw-field-label text-[13px] font-medium">
                            New Password <span className="cpw-field-required">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                className={inputCls("newPassword")}
                                value={data.newPassword}
                                onChange={set("newPassword")}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew((v) => !v)}
                                className="cpw-eye-btn absolute right-3 top-1/2 -translate-y-1/2"
                                tabIndex={-1}
                            >
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Strength meter */}
                        {data.newPassword && (
                            <div className="flex items-center gap-2 mt-1">
                                <div className="cpw-strength-track flex-1 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                                    {[1, 2, 3, 4].map((segment) => (
                                        <div
                                            key={segment}
                                            className={`flex-1 h-full transition-colors ${segment <= strength.score
                                                ? `cpw-strength-fill-${strength.tone}`
                                                : ""
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span
                                    className={`cpw-strength-label-${strength.tone} text-[11px] font-semibold shrink-0`}
                                >
                                    {strength.label}
                                </span>
                            </div>
                        )}

                        {/* Requirement checklist */}
                        <div className="grid grid-cols-1 gap-1 mt-2">
                            {metRequirements.map((req) => (
                                <div
                                    key={req.key}
                                    className={`flex items-center gap-1.5 text-[11.5px] ${req.met ? "cpw-req-item-met" : "cpw-req-item"
                                        }`}
                                >
                                    <Check
                                        size={12}
                                        className={req.met ? "cpw-req-icon-met" : "cpw-req-icon"}
                                    />
                                    {req.label}
                                </div>
                            ))}
                        </div>

                        <div className="h-4">
                            {errors.newPassword && (
                                <p className="cpw-field-error text-[11px]">
                                    {errors.newPassword}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Confirm password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="cpw-field-label text-[13px] font-medium">
                            Confirm New Password <span className="cpw-field-required">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                className={inputCls("confirmPassword")}
                                value={data.confirmPassword}
                                onChange={set("confirmPassword")}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="cpw-eye-btn absolute right-3 top-1/2 -translate-y-1/2"
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="h-4">
                            {errors.confirmPassword ? (
                                <p className="cpw-field-error text-[11px]">
                                    {errors.confirmPassword}
                                </p>
                            ) : data.confirmPassword ? (
                                <p
                                    className={`text-[11px] ${passwordsMatch ? "cpw-match-ok" : "cpw-match-bad"}`}
                                >
                                    {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="cpw-modal-footer flex items-center justify-end gap-3 pt-4 mt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cpw-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="cpw-btn-submit inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
                        >
                            {loading ? "Updating…" : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}