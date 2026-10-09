import React from "react";
import {
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock,
  Loader2,
} from "lucide-react";
import { formatDate, isSystemRole } from "../utils/roleUtils.js";

export default function RoleTable({
  roles = [],
  onEdit,
  onDelete,
  onViewDetails,
  onStatusToggle,
  deletingId,
  statusUpdatingId,
  sortBy,
  sortOrder,
  onSort,
}) {
  const renderSortIcon = (columnKey) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown size={12} className="opacity-40" />;
    }
    return sortOrder === "DESC" ? (
      <ArrowDown size={12} className="text-primary font-bold" />
    ) : (
      <ArrowUp size={12} className="text-primary font-bold" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="rp-thead text-[11.5px] uppercase tracking-wider font-semibold border-b">
            {/* Role Name & Code */}
            <th
              onClick={() => onSort("name")}
              className="px-5 py-3.5 cursor-pointer select-none hover:text-foreground transition-colors"
            >
              <span className="inline-flex items-center gap-1.5">
                Role Name & Code {renderSortIcon("name")}
              </span>
            </th>

            {/* Role Type */}
            <th
              onClick={() => onSort("is_system")}
              className="px-3.5 py-3.5 cursor-pointer select-none hover:text-foreground transition-colors"
            >
              <span className="inline-flex items-center gap-1.5">
                Type {renderSortIcon("is_system")}
              </span>
            </th>

            {/* Description */}
            <th className="px-3.5 py-3.5">Description</th>

            {/* Active Users */}
            <th className="px-3.5 py-3.5 select-none">
              <span className="inline-flex items-center gap-1.5">
                Assigned Users
              </span>
            </th>

            {/* Status */}
            <th
              onClick={() => onSort("status")}
              className="px-3.5 py-3.5 cursor-pointer select-none hover:text-foreground transition-colors"
            >
              <span className="inline-flex items-center gap-1.5">
                Status {renderSortIcon("status")}
              </span>
            </th>

            {/* Created Date */}
            <th
              onClick={() => onSort("created_at")}
              className="px-3.5 py-3.5 cursor-pointer select-none hover:text-foreground transition-colors"
            >
              <span className="inline-flex items-center gap-1.5">
                Created {renderSortIcon("created_at")}
              </span>
            </th>

            {/* Actions */}
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {roles.map((role) => {
            const isSystem = isSystemRole(role);
            const usersCount = Number(role.active_users_count) || 0;
            const isDeleting = deletingId === role.id;
            const isStatusUpdating = statusUpdatingId === role.id;

            return (
              <tr key={role.id} className="rp-row transition-colors">
                {/* Name & Code */}
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="rp-name text-[14px] font-bold">
                      {role.name}
                    </span>
                    <span className="rp-code-pill self-start px-2 py-0.5 rounded text-[11px] font-mono font-medium">
                      {role.role_code || role.name}
                    </span>
                  </div>
                </td>

                {/* Type */}
                <td className="px-3.5 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${isSystem
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      }`}
                  >
                    {isSystem ? "System" : "Custom"}
                  </span>
                </td>

                {/* Description */}
                <td className="px-3.5 py-4 max-w-[260px]">
                  <p
                    className="rp-desc text-[13px] truncate"
                    title={role.description || ""}
                  >
                    {role.description || (
                      <span className="rp-cell-muted italic">—</span>
                    )}
                  </p>
                </td>

                {/* Assigned Users */}
                <td className="px-3.5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border ${usersCount > 0
                        ? "bg-indigo-50/70 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800"
                        : "bg-muted text-muted-foreground border-transparent"
                      }`}
                  >
                    <Users size={12} />
                    {usersCount} {usersCount === 1 ? "user" : "users"}
                  </span>
                </td>

                {/* Status & Quick Toggle */}
                <td className="px-3.5 py-4">
                  <div className="flex items-center gap-2">
                    {isStatusUpdating ? (
                      <Loader2 size={16} className="animate-spin text-primary" />
                    ) : (
                      <button
                        type="button"
                        disabled={isSystem && role.status === "active"}
                        onClick={() =>
                          onStatusToggle(
                            role,
                            role.status === "active" ? "inactive" : "active",
                          )
                        }
                        title={
                          isSystem && role.status === "active"
                            ? "System role cannot be deactivated"
                            : `Toggle status to ${role.status === "active"
                              ? "inactive"
                              : "active"
                            }`
                        }
                        className={`rp-toggle-switch relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${role.status === "active"
                            ? "bg-emerald-500"
                            : "bg-slate-300 dark:bg-slate-700"
                          } ${isSystem && role.status === "active"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                          }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${role.status === "active"
                              ? "translate-x-4"
                              : "translate-x-0"
                            }`}
                        />
                      </button>
                    )}

                    <span
                      className={`rp-status ${role.status === "active"
                          ? "rp-status-active"
                          : "rp-status-inactive"
                        }`}
                    >
                      {role.status}
                    </span>
                  </div>
                </td>

                {/* Created Date */}
                <td className="px-3.5 py-4 rp-cell-muted text-[12.5px] whitespace-nowrap">
                  {formatDate(role.created_at)}
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {/* View Details */}
                    <button
                      onClick={() => onViewDetails(role)}
                      className="rp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      title="View Role Details"
                    >
                      <Eye size={15} />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(role)}
                      className="rp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      title={
                        isSystem
                          ? "Edit Role (System role name is protected)"
                          : "Edit Role"
                      }
                    >
                      <Pencil size={15} />
                    </button>

                    {/* Delete */}
                    {isSystem ? (
                      <button
                        disabled
                        className="rp-action-btn w-8 h-8 rounded-lg flex items-center justify-center opacity-40 cursor-not-allowed text-muted-foreground"
                        title="System roles cannot be deleted"
                      >
                        <Lock size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => onDelete(role)}
                        disabled={isDeleting}
                        className="rp-action-btn rp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                        title={
                          usersCount > 0
                            ? `Cannot delete: currently assigned to ${usersCount} active user(s)`
                            : "Delete Role"
                        }
                      >
                        {isDeleting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {roles.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="rp-empty-state px-5 py-12 text-center"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <ShieldAlert size={36} className="opacity-30 mb-1" />
                  <p className="text-[14px] font-semibold rp-title">
                    No roles found
                  </p>
                  <p className="text-[12.5px] rp-subtitle max-w-sm">
                    Try adjusting your search keywords or filter criteria to see available roles.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
