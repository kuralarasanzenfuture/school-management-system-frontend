import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import {
    updateProfile,
    uploadAvatar,
    clearProfileError,
    clearUpdateSuccess,
} from "../../../redux/profile/profileSlice.js";
import ChangePasswordModal from "../../components/header/ChangePasswordModal.jsx";
import "./Profile.css";

export default function ProfilePage() {
    const dispatch = useDispatch();
    const avatarInputRef = useRef(null);

    const { user: authUser } = useSelector((state) => state.auth);
    const { updating, uploadingAvatar, error, updateSuccess } = useSelector(
        (state) => state.profile ?? {},
    );

    const [data, setData] = useState({
        username: "",
        email: "",
        phone: "",
    });
    const [errors, setErrors] = useState({});
    const [showChangePassword, setShowChangePassword] = useState(false);

    // Pre-fill from whatever's already in the auth slice — avoids a second
    // network round-trip if authUser already has everything the form needs.
    // Swap for a fetchProfile() dispatch on mount if your profile data is
    // richer than what auth carries.
    useEffect(() => {
        if (authUser) {
            setData({
                username: authUser.name ?? authUser.username ?? "",
                email: authUser.email ?? "",
                phone: authUser.phone ?? authUser.mobile ?? "",
            });
        }
    }, [authUser]);

    useEffect(() => {
        if (!updateSuccess) return;
        const timer = setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
        return () => clearTimeout(timer);
    }, [updateSuccess, dispatch]);

    const set = (key) => (e) => {
        setData((d) => ({ ...d, [key]: e.target.value }));
        if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
        if (error) dispatch(clearProfileError());
    };

    const validate = () => {
        const e = {};
        if (!data.username.trim()) e.username = "Name is required";
        if (data.email && !/^\S+@\S+\.\S+$/.test(data.email))
            e.email = "Enter a valid email";
        if (data.phone && !/^\d{10}$/.test(data.phone))
            e.phone = "Enter a 10-digit number";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        dispatch(
            updateProfile({
                username: data.username.trim(),
                email: data.email.trim(),
                phone: data.phone.trim(),
            }),
        );
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        dispatch(uploadAvatar(file));
    };

    const displayName = authUser?.name ?? authUser?.username ?? "Admin";
    const roles = Array.isArray(authUser?.roles)
        ? authUser.roles
        : authUser?.roles
            ? [authUser.roles]
            : [];
    const avatarUrl =
        authUser?.avatar ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=160`;

    return (
        <div className="pf-page min-h-screen p-6">
            <div className="mb-6">
                <h1 className="pf-title text-2xl font-bold">My Profile</h1>
                <p className="pf-subtitle text-[13.5px] mt-1">
                    View and manage your account details.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Overview card ── */}
                <div className="pf-card rounded-2xl p-6 flex flex-col items-center text-center lg:col-span-1 h-fit">
                    <div className="relative">
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="pf-avatar-ring w-24 h-24 rounded-full object-cover"
                        />
                        <label className="pf-avatar-upload-btn absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                            {uploadingAvatar ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Camera size={14} />
                            )}
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                className="hidden"
                                onChange={handleAvatarChange}
                                disabled={uploadingAvatar}
                            />
                        </label>
                    </div>

                    <p className="pf-name text-[16px] font-bold mt-4">{displayName}</p>
                    <p className="pf-email text-[13px] mt-0.5">{authUser?.email}</p>

                    {roles.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                            {roles.map((role) => (
                                <span
                                    key={role}
                                    className="pf-role-badge px-2.5 py-1 rounded-full text-[11.5px] font-medium"
                                >
                                    {role}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="pf-meta-divider w-full mt-5 pt-4 flex flex-col gap-2 text-left">
                        {authUser?.username && (
                            <div className="flex items-center justify-between text-[12.5px]">
                                <span className="pf-meta-label">Username</span>
                                <span className="pf-meta-value font-medium">
                                    {authUser.username}
                                </span>
                            </div>
                        )}
                        {authUser?.school_id && (
                            <div className="flex items-center justify-between text-[12.5px]">
                                <span className="pf-meta-label">School ID</span>
                                <span className="pf-meta-value font-medium">
                                    {authUser.school_id}
                                </span>
                            </div>
                        )}
                        {authUser?.employee_code && (
                            <div className="flex items-center justify-between text-[12.5px]">
                                <span className="pf-meta-label">Employee Code</span>
                                <span className="pf-meta-value font-medium">
                                    {authUser.employee_code}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right column ── */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Edit form */}
                    <div className="pf-card rounded-2xl p-6">
                        <h2 className="pf-card-title text-[15px] font-bold mb-4">
                            Profile Details
                        </h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {error && (
                                <div className="pf-alert-error rounded-lg px-3.5 py-2.5 text-[13px]">
                                    {error}
                                </div>
                            )}
                            {updateSuccess && (
                                <div className="pf-alert-success rounded-lg px-3.5 py-2.5 text-[13px]">
                                    Profile updated successfully.
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="pf-field-label text-[13px] font-medium">
                                        Full Name <span className="pf-field-required">*</span>
                                    </label>
                                    <input
                                        className={`pf-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.username ? "pf-input-error" : ""}`}
                                        value={data.username}
                                        onChange={set("username")}
                                    />
                                    <div className="h-4">
                                        {errors.username && (
                                            <p className="pf-field-error text-[11px]">
                                                {errors.username}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="pf-field-label text-[13px] font-medium">
                                        Email
                                    </label>
                                    <input
                                        className={`pf-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.email ? "pf-input-error" : ""}`}
                                        value={data.email}
                                        onChange={set("email")}
                                    />
                                    <div className="h-4">
                                        {errors.email && (
                                            <p className="pf-field-error text-[11px]">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="pf-field-label text-[13px] font-medium">
                                        Phone
                                    </label>
                                    <input
                                        className={`pf-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.phone ? "pf-input-error" : ""}`}
                                        placeholder="1234567890"
                                        value={data.phone}
                                        onChange={set("phone")}
                                    />
                                    <div className="h-4">
                                        {errors.phone && (
                                            <p className="pf-field-error text-[11px]">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="pf-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
                                >
                                    {updating && <Loader2 size={14} className="animate-spin" />}
                                    {updating ? "Saving…" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security shortcut */}
                    <div className="pf-security-card rounded-2xl p-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="pf-security-icon-bg w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
                                <ShieldCheck size={20} className="pf-security-icon" />
                            </div>
                            <div>
                                <p className="pf-card-title text-[14px] font-bold">
                                    Password & Security
                                </p>
                                <p className="pf-field-hint text-[12.5px] mt-0.5">
                                    Change your password to keep your account secure.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowChangePassword(true)}
                            className="pf-btn-outline inline-flex items-center gap-2 text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0"
                        >
                            <KeyRound size={14} /> Change Password
                        </button>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
        </div>
    );
}