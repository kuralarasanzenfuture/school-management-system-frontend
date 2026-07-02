import React from "react";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString("en-IN", {
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
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const MAX_VISIBLE_ROLES = 2;

export default function UserTable({ users, onEdit, onDelete, deletingId }) {
  return (
    <div className="up-table-card rounded-2xl overflow-hidden">
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
            {users.map((user) => {
              const roles =
                typeof user.roles === "string"
                  ? user.roles
                      .split(",")
                      .map((role) => role.trim())
                      .filter(Boolean)
                  : Array.isArray(user.roles)
                    ? user.roles
                    : [];
              const visibleRoles = roles.slice(0, MAX_VISIBLE_ROLES);
              const extraCount = roles.length - visibleRoles.length;
              //   console.log(user);
              console.log(user.roles);
              const isAdmin = user.roles?.some((role) => role.name === "ADMIN");
              return (
                <tr key={user.id} className="up-row transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="up-avatar w-9 h-9 rounded-full flex items-center justify-center text-[12.5px] font-semibold">
                          {getInitials(user.username)}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${
                            user.is_online ? "up-online-dot" : "up-offline-dot"
                          }`}
                          title={user.is_online ? "Online" : "Offline"}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="up-username text-[13.5px] font-semibold truncate">
                          {user.username}
                        </p>
                        <p className="up-email text-[12.5px] truncate">
                          {user.email || "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="up-cell px-3 py-3.5 text-[13px]">
                    {user.phone || <span className="up-cell-muted">—</span>}
                  </td>

                  <td className="px-3 py-3.5">
                    {roles.length === 0 ? (
                      <span className="up-cell-muted text-[13px]">—</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {visibleRoles.map((role) => (
                          <span
                            key={role.id || role}
                            className="up-role-chip px-2.5 py-1 rounded-full text-[11.5px] font-medium"
                          >
                            {role.name || role}
                          </span>
                        ))}
                        {extraCount > 0 && (
                          <span className="up-role-chip-more px-2.5 py-1 rounded-full text-[11.5px] font-medium">
                            +{extraCount}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-3.5">
                    <span
                      className={`up-status ${
                        user.status === "active"
                          ? "up-status-active"
                          : "up-status-inactive"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="up-cell-muted px-3 py-3.5 text-[13px]">
                    {formatDate(user.created_at)}
                  </td>
                  {!isAdmin && (
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1 pr-2">
                        <button
                          onClick={() => onEdit(user)}
                          className="up-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="up-action-btn up-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="up-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
