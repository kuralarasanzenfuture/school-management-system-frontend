import React from "react";
import { Pencil, Trash2, ArrowUpDown, Shield, KeyRound } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";

function formatDate(value) {
  if (!value) return "—";
  const dateObj = new Date(value);
  if (isNaN(dateObj)) return value;
  return dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

const MAX_VISIBLE_ROLES = 2;

/**
 * Safely parse user roles into an array of displayable role items
 */
function normalizeUserRoles(userRoles) {
  if (!userRoles) return [];
  if (Array.isArray(userRoles)) {
    return userRoles.map((r) => {
      if (typeof r === "object" && r !== null) {
        return { id: r.id, name: r.name || "Role" };
      }
      const str = String(r);
      const parts = str.split(":");
      return { id: parts[0], name: parts.length > 1 ? parts[1].trim() : str.trim() };
    });
  }
  if (typeof userRoles === "string") {
    return userRoles
      .split(",")
      .map((part) => {
        const trimmed = part.trim();
        const parts = trimmed.split(":");
        return {
          id: parts[0],
          name: parts.length > 1 ? parts[1].trim() : trimmed,
        };
      })
      .filter((r) => Boolean(r.name));
  }
  return [];
}

/**
 * UserTable component with accurate role display and backend restrictions:
 * - ADMIN user cannot be deleted
 * - ADMIN user status cannot be deactivated
 * - School column displayed when viewed by Super Admin
 */
export default function UserTable({
  users = [],
  onEdit,
  onDelete,
  onToggleStatus,
  onChangePassword,
  deletingId = null,
  togglingId = null,
  isAdmin = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: users, initialSize: initialPageSize });

  const colSpan = isAdmin ? 7 : 6;

  return (
    <div className="up-table-card rounded-2xl overflow-hidden shadow-sm border border-border/60">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="up-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  User <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">Phone</th>
              <th className="px-3 py-3 font-semibold">Roles</th>
              {isAdmin && (
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    School <ArrowUpDown size={11} />
                  </span>
                </th>
              )}
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Created <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="up-empty-state px-5 py-12 text-center text-[13.5px] text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              pagedData.map((user) => {
                const roles = normalizeUserRoles(user.roles);
                const visibleRoles = roles.slice(0, MAX_VISIBLE_ROLES);
                const extraCount = roles.length - visibleRoles.length;
                const isUserAdmin = roles.some(
                  (role) => (role.name || "").toUpperCase() === "ADMIN",
                );

                return (
                  <tr key={user.id} className="up-row transition-colors">
                    {/* User avatar + name + email */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="up-avatar w-9 h-9 rounded-full flex items-center justify-center text-[12.5px] font-semibold">
                            {getInitials(user.username)}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${
                              user.is_online
                                ? "up-online-dot"
                                : "up-offline-dot"
                            }`}
                            title={user.is_online ? "Online" : "Offline"}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="up-username text-[13.5px] font-semibold truncate">
                              {user.username}
                            </p>
                            {isUserAdmin && (
                              <span
                                title="System Administrator"
                                className="inline-flex items-center text-primary text-[10px]"
                              >
                                <Shield size={12} />
                              </span>
                            )}
                          </div>
                          <p className="up-email text-[12.5px] truncate">
                            {user.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="up-cell px-3 py-3.5 text-[13px]">
                      {user.phone || <span className="up-cell-muted">—</span>}
                    </td>

                    {/* Roles */}
                    <td className="px-3 py-3.5">
                      {roles.length === 0 ? (
                        <span className="up-cell-muted text-[13px]">—</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {visibleRoles.map((role, idx) => (
                            <span
                              key={role.id || idx}
                              className={`up-role-chip px-2.5 py-1 rounded-full text-[11.5px] font-medium ${
                                (role.name || "").toUpperCase() === "ADMIN"
                                  ? "border border-primary/30"
                                  : ""
                              }`}
                            >
                              {role.name}
                            </span>
                          ))}
                          {extraCount > 0 && (
                            <span
                              className="up-role-chip-more px-2.5 py-1 rounded-full text-[11.5px] font-medium"
                              title={roles
                                .slice(MAX_VISIBLE_ROLES)
                                .map((r) => r.name)
                                .join(", ")}
                            >
                              +{extraCount}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* School — Super Admin only */}
                    {isAdmin && (
                      <td className="up-cell px-3 py-3.5 text-[13px]">
                        {user.school_name || (
                          <span className="up-cell-muted">—</span>
                        )}
                      </td>
                    )}

                    {/* Status */}
                    <td className="px-3 py-3.5">
                      {onToggleStatus && !isUserAdmin ? (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(user)}
                          disabled={togglingId === user.id}
                          className={`up-status cursor-pointer transition-all hover:scale-105 ${
                            user.status === "active"
                              ? "up-status-active"
                              : "up-status-inactive"
                          } ${togglingId === user.id ? "opacity-60" : ""}`}
                          title={`Click to ${
                            user.status === "active" ? "deactivate" : "activate"
                          }`}
                        >
                          {togglingId === user.id ? "Updating…" : user.status}
                        </button>
                      ) : (
                        <span
                          className={`up-status ${
                            user.status === "active"
                              ? "up-status-active"
                              : "up-status-inactive"
                          }`}
                          title={
                            isUserAdmin
                              ? "ADMIN user cannot be deactivated"
                              : undefined
                          }
                        >
                          {user.status}
                        </span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="up-cell-muted px-3 py-3.5 text-[13px]">
                      {formatDate(user.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1 pr-2">
                        {onChangePassword && (
                          <button
                            onClick={() => onChangePassword(user)}
                            className="up-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:text-amber-500 hover:bg-amber-500/10"
                            title="Change Password"
                          >
                            <KeyRound size={15} />
                          </button>
                        )}

                        <button
                          onClick={() => onEdit(user)}
                          className="up-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:text-primary"
                          title="Edit User"
                        >
                          <Pencil size={15} />
                        </button>

                        {/* Admin users cannot be deleted according to backend policy */}
                        {!isUserAdmin ? (
                          <button
                            onClick={() => onDelete(user.id)}
                            disabled={deletingId === user.id}
                            className="up-action-btn up-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 text-destructive hover:bg-destructive/10"
                            title="Delete User"
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <span
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground/40 cursor-not-allowed"
                            title="ADMIN user cannot be deleted"
                          >
                            <Trash2 size={15} />
                          </span>
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

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
