import React, { useEffect, useRef, useState, useMemo } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import {
  handleRestrictedInput,
  mobileNumber,
} from "../../../../common/utils/inputHandlers";
import {
  checkEmailExists,
  checkPhoneExists,
  checkUserExists,
} from "../../../../redux/Administration/users/userService";
import CustomDropdown from "./CustomDropdown";

const EMPTY = {
  username: "",
  email: "",
  phone: "",
  password: "",
  school_id: "",
  status: "active",
};

const DEBOUNCE_MS = 500;
const ADMIN_ROLE_NAME = "ADMIN";

/**
 * Safely parse any role representation (objects, IDs, names, "1:ADMIN" strings) into numeric role IDs
 */
export const parseRolesToIds = (rolesData, allRoles = []) => {
  if (!rolesData) return [];
  if (Array.isArray(rolesData)) {
    return rolesData
      .map((r) => {
        if (typeof r === "object" && r !== null) return Number(r.id);
        if (typeof r === "number") return r;
        if (typeof r === "string") {
          const parts = r.split(":");
          const firstAsNum = Number(parts[0]);
          if (!isNaN(firstAsNum) && firstAsNum > 0) return firstAsNum;
          const match = allRoles.find(
            (ar) => (ar.name || "").toUpperCase() === r.trim().toUpperCase(),
          );
          return match ? Number(match.id) : null;
        }
        return null;
      })
      .filter((id) => id !== null && !isNaN(id) && id > 0);
  }
  if (typeof rolesData === "string") {
    return rolesData
      .split(",")
      .map((part) => {
        const trimmed = part.trim();
        const [possibleId, possibleName] = trimmed.split(":");
        const numId = Number(possibleId);
        if (
          !isNaN(numId) &&
          numId > 0 &&
          (possibleName || allRoles.some((r) => Number(r.id) === numId))
        ) {
          return numId;
        }
        const nameToMatch = (possibleName || possibleId || "").toUpperCase();
        const match = allRoles.find(
          (ar) => (ar.name || "").toUpperCase() === nameToMatch,
        );
        return match ? Number(match.id) : null;
      })
      .filter((id) => id !== null && !isNaN(id) && id > 0);
  }
  return [];
};

/**
 * Safely extract uppercase role names from user record
 */
export const getUserRoleNames = (user) => {
  if (!user?.roles) return [];
  if (Array.isArray(user.roles)) {
    return user.roles
      .map((r) => (typeof r === "object" && r !== null ? r.name : String(r)))
      .filter(Boolean)
      .map((n) => n.trim().toUpperCase());
  }
  if (typeof user.roles === "string") {
    return user.roles
      .split(",")
      .map((part) => {
        const parts = part.split(":");
        return (parts.length > 1 ? parts[1] : parts[0]).trim().toUpperCase();
      })
      .filter(Boolean);
  }
  return [];
};

/**
 * Add / Edit Form for Users with complete Role Module integration:
 * - Dynamically binds roles from roleService / roleSlice
 * - Enforces single-admin constraint ("Only one ADMIN user allowed")
 * - Enforces admin lock on edit ("Cannot remove ADMIN role")
 * - Enforces live uniqueness validation (username, email, phone)
 * - Transmits payload in exact format expected by backend validateCreateUser / validateUpdateUser
 */
export default function UserForm({
  initialData = null,
  availableRoles = [],
  users = [],
  isAdmin = false,
  schoolId = null,
  schools = [],
  schoolsLoading = false,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const isEdit = Boolean(initialData?.id);

  const [data, setData] = useState(EMPTY);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [checking, setChecking] = useState({
    username: false,
    email: false,
    phone: false,
  });

  const skipNextCheck = useRef({ username: true, email: true, phone: true });

  // Identify ADMIN role definition from availableRoles
  const adminRole = useMemo(() => {
    return (availableRoles || []).find(
      (r) => (r.name || "").toUpperCase() === ADMIN_ROLE_NAME,
    );
  }, [availableRoles]);

  // Check if initial user is already an ADMIN
  const initialIsAdmin = useMemo(() => {
    if (!isEdit || !initialData) return false;
    const roleNames = getUserRoleNames(initialData);
    if (roleNames.includes(ADMIN_ROLE_NAME)) return true;
    if (adminRole) {
      const roleIds = parseRolesToIds(initialData.roles, availableRoles);
      return roleIds.includes(Number(adminRole.id));
    }
    return false;
  }, [isEdit, initialData, adminRole, availableRoles]);

  // Check whether ADMIN role is assigned to ANOTHER user in the system
  const adminTakenByOther = useMemo(() => {
    if (!adminRole) return false;
    return (users || []).some((u) => {
      if (isEdit && Number(u.id) === Number(initialData?.id)) {
        return false;
      }
      const roleNames = getUserRoleNames(u);
      if (roleNames.includes(ADMIN_ROLE_NAME)) return true;
      const roleIds = parseRolesToIds(u.roles, availableRoles);
      return roleIds.includes(Number(adminRole.id));
    });
  }, [adminRole, users, isEdit, initialData, availableRoles]);

  // Initialize or reset form state
  useEffect(() => {
    if (!initialData) {
      setData({
        ...EMPTY,
        school_id: isAdmin ? "" : (schoolId ?? ""),
      });
      setSelectedRoles([]);
      setErrors({});
      skipNextCheck.current = { username: true, email: true, phone: true };
      return;
    }

    setData({
      username: initialData.username || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      password: "",
      school_id: initialData.school_id ?? "",
      status: initialData.status || "active",
    });

    const parsedRoleIds = parseRolesToIds(initialData.roles, availableRoles);
    setSelectedRoles(parsedRoleIds);
    setErrors({});
    skipNextCheck.current = { username: true, email: true, phone: true };
  }, [initialData, availableRoles, isAdmin, schoolId]);

  // Backfill school_id for non-admin if loaded later
  useEffect(() => {
    if (!initialData && !isAdmin && schoolId) {
      setData((d) => (d.school_id ? d : { ...d, school_id: schoolId }));
    }
  }, [schoolId, isAdmin, initialData]);

  const setField = (key) => (e) => {
    const val = e.target.value;
    setData((d) => ({ ...d, [key]: val }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const toggleRole = (roleId) => {
    const numericId = Number(roleId);
    // If user is currently ADMIN in edit mode, backend disallows removing ADMIN role
    if (isEdit && initialIsAdmin && adminRole && numericId === Number(adminRole.id)) {
      return;
    }

    setSelectedRoles((prev) =>
      prev.includes(numericId)
        ? prev.filter((id) => id !== numericId)
        : [...prev, numericId],
    );

    if (errors.roles) {
      setErrors((er) => ({ ...er, roles: null }));
    }
  };

  // ── Debounced Uniqueness Checks ──────────────────────────────────
  const checkUsername = async (value) => {
    setChecking((c) => ({ ...c, username: true }));
    try {
      const exists = await checkUserExists(value);
      setErrors((e) => ({
        ...e,
        username: exists ? "Username already exists" : null,
      }));
    } catch {
      // Don't block on network error
    } finally {
      setChecking((c) => ({ ...c, username: false }));
    }
  };

  const checkEmail = async (value) => {
    setChecking((c) => ({ ...c, email: true }));
    try {
      const exists = await checkEmailExists(value);
      setErrors((e) => ({
        ...e,
        email: exists ? "Email already exists" : null,
      }));
    } catch {
      // Don't block on network error
    } finally {
      setChecking((c) => ({ ...c, email: false }));
    }
  };

  const checkPhoneNum = async (value) => {
    setChecking((c) => ({ ...c, phone: true }));
    try {
      const exists = await checkPhoneExists(value);
      setErrors((e) => ({
        ...e,
        phone: exists ? "Phone already exists" : null,
      }));
    } catch {
      // Don't block on network error
    } finally {
      setChecking((c) => ({ ...c, phone: false }));
    }
  };

  useEffect(() => {
    if (skipNextCheck.current.username) {
      skipNextCheck.current.username = false;
      return;
    }
    const value = data.username.trim();
    if (!value) {
      setErrors((e) => ({ ...e, username: null }));
      return;
    }
    if (isEdit && value === initialData?.username) {
      setErrors((e) => ({ ...e, username: null }));
      return;
    }
    const timer = setTimeout(() => checkUsername(value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [data.username]);

  useEffect(() => {
    if (skipNextCheck.current.email) {
      skipNextCheck.current.email = false;
      return;
    }
    const value = data.email.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors((e) => ({ ...e, email: null }));
      return;
    }
    if (isEdit && value.toLowerCase() === (initialData?.email || "").toLowerCase()) {
      setErrors((e) => ({ ...e, email: null }));
      return;
    }
    const timer = setTimeout(() => checkEmail(value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [data.email]);

  useEffect(() => {
    if (skipNextCheck.current.phone) {
      skipNextCheck.current.phone = false;
      return;
    }
    const value = data.phone.trim();
    if (!/^\d{10}$/.test(value)) {
      setErrors((e) => ({ ...e, phone: null }));
      return;
    }
    if (isEdit && value === initialData?.phone) {
      setErrors((e) => ({ ...e, phone: null }));
      return;
    }
    const timer = setTimeout(() => checkPhoneNum(value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [data.phone]);

  const validate = () => {
    const e = {};
    if (isAdmin && !data.school_id) {
      e.school_id = "Please select a school";
    }
    if (!data.username.trim()) {
      e.username = "Username is required";
    }
    if (!data.phone.trim()) {
      e.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(data.phone.trim())) {
      e.phone = "Enter a valid 10-digit number";
    }

    if (!selectedRoles.length) {
      e.roles = "At least one role is required";
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      e.email = "Enter a valid email address";
    }

    if (!isEdit && !data.password) {
      e.password = "Password is required";
    } else if (data.password && data.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    // Role backend conflict prevention
    if (adminRole && selectedRoles.includes(Number(adminRole.id)) && adminTakenByOther) {
      e.roles = "Only one ADMIN user allowed in the system";
    }

    if (errors.username) e.username = errors.username;
    if (errors.email) e.email = errors.email;
    if (errors.phone) e.phone = errors.phone;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checking.username || checking.email || checking.phone) return;
    if (!validate()) return;

    const payload = {
      username: data.username.trim(),
      email: data.email.trim() ? data.email.trim().toLowerCase() : null,
      phone: data.phone.trim(),
      school_id: Number(isAdmin ? data.school_id : schoolId),
      roles: selectedRoles.map(Number),
      status: data.status,
    };

    // Include password only if entered
    if (data.password) {
      payload.password = data.password;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* School picker for Super Admin */}
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="up-field-label text-[13px] font-medium">
            School <span className="up-field-required">*</span>
          </label>
          <CustomDropdown
            options={schools.map((s) => ({ value: s.id, label: s.name }))}
            value={data.school_id}
            onChange={(val) => {
              setData((d) => ({ ...d, school_id: val }));
              if (errors.school_id) setErrors((er) => ({ ...er, school_id: null }));
            }}
            placeholder={schoolsLoading ? "Loading schools..." : "Select a school"}
            searchable={true}
            searchPlaceholder="Search schools…"
            disabled={schoolsLoading}
            hasError={Boolean(errors.school_id)}
            className="w-full"
          />
          <div className="min-h-[16px]">
            {errors.school_id && (
              <p className="up-field-error text-[11px]">{errors.school_id}</p>
            )}
          </div>
        </div>
      )}

      {/* Basic Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="up-field-label text-[13px] font-medium">
            Username <span className="up-field-required">*</span>
          </label>
          <input
            autoFocus
            className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${
              errors.username ? "up-input-error" : ""
            }`}
            placeholder="Username"
            value={data.username}
            onChange={setField("username")}
          />
          <div className="min-h-[16px]">
            {checking.username ? (
              <p className="up-field-hint text-[11px]">Checking availability…</p>
            ) : (
              errors.username && (
                <p className="up-field-error text-[11px]">{errors.username}</p>
              )
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="up-field-label text-[13px] font-medium">
            {isEdit ? "New Password" : "Password"}{" "}
            {!isEdit && <span className="up-field-required">*</span>}
          </label>
          <input
            type="password"
            className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${
              errors.password ? "up-input-error" : ""
            }`}
            placeholder={
              isEdit ? "Leave blank to keep current" : "Min 6 characters"
            }
            value={data.password}
            onChange={setField("password")}
          />
          <div className="min-h-[16px]">
            {errors.password ? (
              <p className="up-field-error text-[11px]">{errors.password}</p>
            ) : isEdit ? (
              <p className="up-field-hint text-[11px]">
                Leave blank to keep current password
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="up-field-label text-[13px] font-medium">
            Email
          </label>
          <input
            type="email"
            className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${
              errors.email ? "up-input-error" : ""
            }`}
            placeholder="example@gmail.com"
            value={data.email}
            onChange={setField("email")}
          />
          <div className="min-h-[16px]">
            {checking.email ? (
              <p className="up-field-hint text-[11px]">Checking availability…</p>
            ) : (
              errors.email && (
                <p className="up-field-error text-[11px]">{errors.email}</p>
              )
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="up-field-label text-[13px] font-medium">
            Phone <span className="up-field-required">*</span>
          </label>
          <input
            className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${
              errors.phone ? "up-input-error" : ""
            }`}
            placeholder="10-digit mobile number"
            value={data.phone}
            onChange={handleRestrictedInput(setData, "phone", mobileNumber)}
          />
          <div className="min-h-[16px]">
            {checking.phone ? (
              <p className="up-field-hint text-[11px]">Checking availability…</p>
            ) : (
              errors.phone && (
                <p className="up-field-error text-[11px]">{errors.phone}</p>
              )
            )}
          </div>
        </div>
      </div>

      {/* Role Selection (Dynamic reference to Roles Module) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="up-field-label text-[13px] font-medium">
            Assign Roles <span className="up-field-required">*</span>
          </label>
          <span className="text-[12px] text-muted-foreground">
            {selectedRoles.length} selected
          </span>
        </div>

        {availableRoles.length === 0 ? (
          <p className="up-field-hint text-[12.5px]">No roles available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableRoles.map((role) => {
              const numericId = Number(role.id);
              const isChecked = selectedRoles.includes(numericId);
              const isRoleAdmin =
                (role.name || "").toUpperCase() === ADMIN_ROLE_NAME;

              // Constraint 1: Only 1 Admin in system
              const disabledBecauseTaken = isRoleAdmin && adminTakenByOther;

              // Constraint 2: Cannot remove Admin role from the existing Admin user
              const disabledBecauseLockedAdmin =
                isEdit && initialIsAdmin && isRoleAdmin;

              const isDisabled = disabledBecauseTaken || disabledBecauseLockedAdmin;

              const tooltipText = disabledBecauseTaken
                ? "Only one ADMIN user allowed in system (already assigned)"
                : disabledBecauseLockedAdmin
                ? "Cannot remove ADMIN role from this user"
                : role.status === "inactive"
                ? "Role is currently inactive"
                : undefined;

              return (
                <label
                  key={role.id}
                  title={tooltipText}
                  className={`up-role-option flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors border ${
                    isChecked ? "up-role-option-checked border-primary/40" : "border-border/40"
                  } ${
                    isDisabled
                      ? "opacity-60 cursor-not-allowed bg-muted/30"
                      : "cursor-pointer hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      className="up-role-checkbox w-4 h-4 rounded accent-primary"
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() => !isDisabled && toggleRole(role.id)}
                    />
                    <span className="truncate">{role.name}</span>
                  </div>

                  {role.status === "inactive" && (
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Inactive
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}

        {adminTakenByOther && (
          <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-amber-600 dark:text-amber-400">
            <ShieldAlert size={13} className="shrink-0" />
            <span>ADMIN role is already assigned to another user in the system.</span>
          </div>
        )}

        <div className="min-h-[16px]">
          {errors.roles && (
            <p className="up-field-error text-[11px]">{errors.roles}</p>
          )}
        </div>
      </div>

      {/* Status Selection */}
      <div className="flex flex-col gap-1.5">
        <label className="up-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => {
            const isInactiveDisabled =
              isEdit && initialIsAdmin && s === "inactive";
            return (
              <button
                key={s}
                type="button"
                disabled={isInactiveDisabled}
                title={
                  isInactiveDisabled
                    ? "ADMIN user cannot be deactivated"
                    : undefined
                }
                onClick={() => setData((d) => ({ ...d, status: s }))}
                className={`up-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                  data.status === s
                    ? s === "active"
                      ? "up-status-toggle-active"
                      : "up-status-toggle-inactive"
                    : "border border-border/50 text-muted-foreground"
                } ${isInactiveDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="up-form-footer flex items-center justify-end gap-3 pt-4 mt-1 border-t border-border/40">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="up-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors border border-border hover:bg-muted/50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            submitting || checking.username || checking.email || checking.phone
          }
          className="up-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
}