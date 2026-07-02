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

export default function RoleTable({ roles, onEdit, onDelete, deletingId }) {
  return (
    <div className="rp-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="rp-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Role Name <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">Description</th>
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
            {roles.map((role) => (
              <tr key={role.id} className="rp-row transition-colors">
                <td className="rp-name px-5 py-3.5 text-[13.5px] font-semibold">
                  {role.name}
                </td>
                <td className="rp-desc px-3 py-3.5 text-[13px] max-w-[320px] truncate">
                  {role.description || <span className="rp-cell-muted">—</span>}
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`rp-status ${
                      role.status === "active"
                        ? "rp-status-active"
                        : "rp-status-inactive"
                    }`}
                  >
                    {role.status}
                  </span>
                </td>
                <td className="rp-cell-muted px-3 py-3.5 text-[13px]">
                  {formatDate(role.created_at)}
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center justify-end gap-1 pr-2">
                    <button
                      onClick={() => onEdit(role)}
                      className="rp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(role.id)}
                      disabled={deletingId === role.id}
                      className="rp-action-btn rp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {roles.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="rp-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
