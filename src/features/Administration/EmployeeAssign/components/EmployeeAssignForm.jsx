import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";


function userLabel(u) {
    if (!u) return "";
    return u.username || u.email || `#${u.id}`;
}

/**
 * @param {object} employee - the employee being assigned a user.
 * @param {Array<object>} users - full user list.
 * @param {Array<object>} employees - full employee list, used to figure out
 *   which users are already linked elsewhere so they can be excluded
 *   (assumes a 1:1 employee↔user relationship).
 * @param {(userId: number) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function EmployeeAssignForm({
    employee,
    users = [],
    employees = [],
    onSubmit,
    onCancel,
    submitting,
}) {
    const currentUserId = employee?.user_id ?? employee?.user?.id ?? "";
    const [selectedUserId, setSelectedUserId] = useState(currentUserId ? String(currentUserId) : "");
    const [error, setError] = useState("");

    const availableUsers = useMemo(() => {
        const takenIds = new Set(
            employees
                .filter((e) => e.id !== employee?.id) // exclude the employee we're assigning right now
                .map((e) => e.user_id ?? e.user?.id)
                .filter(Boolean)
                .map(String),
        );
        return users.filter((u) => !takenIds.has(String(u.id)));
    }, [users, employees, employee]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedUserId) {
            setError("Please select a user");
            return;
        }
        onSubmit(Number(selectedUserId));
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="ea-field-label text-[13px] font-medium">
                    User Account <span className="ea-field-required">*</span>
                </label>
                <select
                    className={`ea-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${error ? "ea-input-error" : ""}`}
                    value={selectedUserId}
                    onChange={(e) => {
                        setSelectedUserId(e.target.value);
                        setError("");
                    }}
                >
                    <option value="">Select a user…</option>
                    {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                            {userLabel(u)}
                        </option>
                    ))}
                </select>
                <div className="h-4">
                    {error ? (
                        <p className="ea-field-error text-[11px]">{error}</p>
                    ) : availableUsers.length === 0 ? (
                        <p className="ea-field-hint text-[11px]">
                            No unlinked user accounts available.
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="ea-form-footer flex items-center justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="ea-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="ea-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    Assign User
                </button>
            </div>
        </form>
    );
}