import React from "react";
import { Link2, Unlink, Loader2 } from "lucide-react";


function employeeLabel(emp) {
    if (emp.name) return emp.name;
    return `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || `#${emp.id}`;
}

function getInitials(name) {
    if (!name) return "?";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");
}

function getAssignedUser(emp, users) {
    if (emp.user && typeof emp.user === "object") return emp.user;
    const uid = emp.user_id;
    if (!uid) return null;
    return users.find((u) => String(u.id) === String(uid)) || { id: uid, username: `#${uid}` };
}

/**
 * @param {Array<object>} employees
 * @param {Array<object>} users - full user list, used to resolve a readable
 *   username when an employee only carries `user_id` (not a nested `user`
 *   object from the API).
 */
export default function EmployeeAssignTable({
    employees = [],
    users = [],
    onAssign,
    onUnassign,
    unassigningId,
}) {
    return (
        <div className="ea-table-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="ea-thead text-[11.5px] uppercase tracking-wide">
                            <th className="px-5 py-3 font-semibold">Employee</th>
                            <th className="px-3 py-3 font-semibold">Linked User</th>
                            <th className="px-3 py-3 font-semibold text-right pr-5">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="ea-empty-state px-5 py-10 text-center text-[13.5px]">
                                    No employees found.
                                </td>
                            </tr>
                        ) : (
                            employees.map((emp) => {
                                const assignedUser = getAssignedUser(emp, users);
                                const name = employeeLabel(emp);
                                const isUnassigning = unassigningId === emp.id;

                                return (
                                    <tr key={emp.id} className="ea-row transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="ea-avatar w-9 h-9 rounded-full flex items-center justify-center text-[12.5px] font-semibold shrink-0">
                                                    {getInitials(name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="ea-name text-[13.5px] font-semibold truncate">
                                                        {name}
                                                    </p>
                                                    {emp.designation_name && (
                                                        <p className="ea-cell-muted text-[12px] truncate">
                                                            {emp.designation_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-3 py-3.5">
                                            {assignedUser ? (
                                                <span className="ea-link-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium">
                                                    <Link2 size={12} />
                                                    {assignedUser.username || assignedUser.email}
                                                </span>
                                            ) : (
                                                <span className="ea-unlinked-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium">
                                                    Not linked
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-3 py-3.5">
                                            <div className="flex items-center justify-end gap-2 pr-2">
                                                {assignedUser ? (
                                                    <button
                                                        onClick={() => onUnassign(emp)}
                                                        disabled={isUnassigning}
                                                        className="ea-unassign-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors"
                                                    >
                                                        {isUnassigning ? (
                                                            <Loader2 size={13} className="animate-spin" />
                                                        ) : (
                                                            <Unlink size={13} />
                                                        )}
                                                        Unassign
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => onAssign(emp)}
                                                        className="ea-assign-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors"
                                                    >
                                                        <Link2 size={13} />
                                                        Assign User
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}