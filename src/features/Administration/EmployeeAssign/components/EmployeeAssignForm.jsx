import React, { useMemo, useState, useEffect } from "react";
import { Loader2, UserCheck, Shield } from "lucide-react";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";

function isSystemAdminUser(user) {
  if (!user) return false;

  // Check username
  const username = (user.username || "").trim().toLowerCase();
  if (username === "admin" || username === "superadmin" || username === "super_admin") {
    return true;
  }

  // Check flags
  if (user.is_admin || user.isAdmin || user.is_superadmin || user.isSuperAdmin) {
    return true;
  }

  // Check roles
  const rawRoles = Array.isArray(user.roles)
    ? user.roles.map((r) => (typeof r === "object" ? r?.name || "" : String(r)))
    : typeof user.roles === "string"
    ? user.roles.split(",")
    : user.role
    ? [String(user.role)]
    : [];

  return rawRoles.some((r) => {
    const roleStr = String(r);
    const cleanName = roleStr.includes(":") ? roleStr.split(":")[1].trim() : roleStr.trim();
    const upper = cleanName.toUpperCase();
    return upper === "ADMIN" || upper === "SUPER ADMIN" || upper === "SUPERADMIN";
  });
}

function getUserDisplayLabel(u) {
  if (!u) return "";
  const name = u.username || u.name || `#${u.id}`;
  const roles = Array.isArray(u.roles)
    ? u.roles.map((r) => (typeof r === "object" ? r.name : r)).join(", ")
    : typeof u.roles === "string"
    ? u.roles
    : "";
  return roles ? `${name} (${roles})` : name;
}

/**
 * Form for linking a user login account to an employee
 */
export default function EmployeeAssignForm({
  employee,
  users = [],
  employees = [],
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const currentUserId = employee?.user_id ?? employee?.user?.id ?? "";

  // Check if currently assigned user is an admin; if so, do not select it
  const isCurrentAdmin = useMemo(() => {
    if (!currentUserId) return false;
    const current = (users || []).find((u) => String(u.id) === String(currentUserId));
    return isSystemAdminUser(current);
  }, [users, currentUserId]);

  const [selectedUserId, setSelectedUserId] = useState(
    currentUserId && !isCurrentAdmin ? String(currentUserId) : "",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUserId && !isCurrentAdmin) {
      setSelectedUserId(String(currentUserId));
    } else {
      setSelectedUserId("");
    }
  }, [currentUserId, isCurrentAdmin]);

  // Determine users eligible to be linked to this employee
  const availableUsers = useMemo(() => {
    // Collect user IDs already assigned to any other employee
    const assignedUserIds = new Set(
      (employees || [])
        .filter((e) => Number(e.id) !== Number(employee?.id))
        .map((e) => e.user_id ?? e.user?.id)
        .filter(Boolean)
        .map(String),
    );

    return (users || []).filter((user) => {
      // 0. System Administrator accounts cannot be linked to employees
      if (isSystemAdminUser(user)) {
        return false;
      }

      // 1. School matching: must belong to same school if school is specified
      const empSchool = employee?.school_id ?? employee?.school?.id;
      const userSchool = user?.school_id ?? user?.school?.id;
      const sameSchool =
        !empSchool || !userSchool
          ? true
          : String(userSchool) === String(empSchool);

      // 2. Not assigned to any other employee (allow currently assigned user to remain)
      const isCurrentlyAssigned = String(user.id) === String(currentUserId);
      const isFree = !assignedUserIds.has(String(user.id));

      return sameSchool && (isFree || isCurrentlyAssigned);
    });
  }, [users, employees, employee, currentUserId]);

  // Format dropdown options
  const userOptions = useMemo(() => {
    return [
      { value: "", label: "Select user account…" },
      ...availableUsers.map((u) => ({
        value: u.id,
        label: getUserDisplayLabel(u),
      })),
    ];
  }, [availableUsers]);

  const selectedUserDetails = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find((u) => String(u.id) === String(selectedUserId));
  }, [users, selectedUserId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError("Please select a user account to assign");
      return;
    }
    onSubmit(Number(selectedUserId));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Selected Employee Info Box */}
      <div className="rounded-xl p-3.5 bg-muted/40 border border-border/60 flex items-center justify-between text-[13px]">
        <div>
          <p className="text-muted-foreground text-[11px] uppercase font-semibold">
            Target Employee
          </p>
          <p className="font-semibold text-foreground text-[14px]">
            {employee?.first_name || ""} {employee?.last_name || ""}
          </p>
          <p className="text-muted-foreground text-[12px]">
            Code: {employee?.employee_code || "N/A"}
            {(employee?.mobile || employee?.phone) && ` • Phone: ${employee.mobile || employee.phone}`}
            {` • Dept: ${employee?.department || "General"}`}
          </p>
        </div>

        {employee?.user_id && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
            Currently Linked
          </span>
        )}
      </div>

      {/* User Dropdown */}
      <div className="flex flex-col gap-1.5">
        <label className="ea-field-label text-[13px] font-medium">
          Select User Account <span className="ea-field-required">*</span>
        </label>

        <CustomDropdown
          options={userOptions}
          value={selectedUserId}
          onChange={(val) => {
            setSelectedUserId(val);
            setError("");
          }}
          placeholder="Select a user account…"
          searchable={userOptions.length > 5}
          searchPlaceholder="Search by username or role…"
          hasError={Boolean(error)}
          disabled={submitting}
          className="w-full"
        />

        <div className="min-h-[16px]">
          {error ? (
            <p className="ea-field-error text-[11px] text-destructive">{error}</p>
          ) : availableUsers.length === 0 ? (
            <p className="ea-field-hint text-[11px] text-muted-foreground">
              No unlinked user accounts available in this school.
            </p>
          ) : null}
        </div>
      </div>

      {/* Selected User Preview Badge */}
      {selectedUserDetails && (
        <div className="rounded-xl p-3 bg-primary/5 border border-primary/20 flex items-center gap-2.5 text-[12.5px]">
          <UserCheck size={16} className="text-primary shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">
              Will link login <span className="font-bold text-primary">@{selectedUserDetails.username}</span> to this employee.
            </p>
            {selectedUserDetails.email && (
              <p className="text-muted-foreground text-[11.5px] truncate">
                {selectedUserDetails.email}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="ea-form-footer flex items-center justify-end gap-3 pt-3 border-t border-border/40">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="ea-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !selectedUserId}
          className="ea-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Assign User
        </button>
      </div>
    </form>
  );
}