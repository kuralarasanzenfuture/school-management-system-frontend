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

function getInitials(first, last) {
  const a = first?.[0] || "";
  const b = last?.[0] || "";
  return (a + b).toUpperCase() || "?";
}

const STATUS_CLASS = {
  active: "ep-status-active",
  inactive: "ep-status-inactive",
  resigned: "ep-status-resigned",
  terminated: "ep-status-terminated",
};

export default function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  deletingId,
}) {
  return (
    <div className="ep-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="ep-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Employee <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">Designation</th>
              <th className="px-3 py-3 font-semibold">Department</th>
              <th className="px-3 py-3 font-semibold">Mobile</th>
              <th className="px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Joined <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="ep-row transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="ep-avatar w-9 h-9 rounded-full flex items-center justify-center text-[12.5px] font-semibold shrink-0">
                      {emp.photo_url ? (
                        <img
                          src={emp.photo_url}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        getInitials(emp.first_name, emp.last_name)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="ep-name text-[13.5px] font-semibold truncate">
                        {emp.first_name} {emp.last_name || ""}
                      </p>
                      <p className="ep-code text-[12px] truncate">
                        {emp.employee_code}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="ep-cell px-3 py-3.5 text-[13px]">
                  {emp.designation}
                </td>

                <td className="ep-cell px-3 py-3.5 text-[13px]">
                  {emp.department || <span className="ep-cell-muted">—</span>}
                </td>

                <td className="ep-cell px-3 py-3.5 text-[13px]">
                  {emp.mobile}
                </td>

                <td className="ep-cell-muted px-3 py-3.5 text-[13px]">
                  {formatDate(emp.joining_date)}
                </td>

                <td className="px-3 py-3.5">
                  <span
                    className={`ep-status ${STATUS_CLASS[emp.status] || "ep-status-inactive"}`}
                  >
                    {emp.status}
                  </span>
                </td>

                <td className="px-3 py-3.5">
                  <div className="flex items-center justify-end gap-1 pr-2">
                    <button
                      onClick={() => onEdit(emp)}
                      className="ep-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(emp.id)}
                      disabled={deletingId === emp.id}
                      className="ep-action-btn ep-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {employees.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="ep-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
