import React from "react";
import { Pencil, Trash2, Star } from "lucide-react";

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

export default function AcademicYearTable({
  academicYears,
  onEdit,
  onDelete,
  deletingId,
}) {
  // function isCurrentYear(value) {
  //   if (typeof value === "boolean") return value;
  //   if (typeof value === "number") return value === 1;
  //   if (typeof value === "string") return value === "true" || value === "1";
  //   return Boolean(value);
  // }

  function isCurrentYear(year) {
    if (!year.start_date || !year.end_date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(year.start_date);
    const end = new Date(year.end_date);

    return today >= start && today <= end;
  }

  return (
    <div className="ay-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="ay-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">Academic Year</th>
              <th className="px-3 py-3 font-semibold">Start Date</th>
              <th className="px-3 py-3 font-semibold">End Date</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {academicYears.map((year) => (
              <tr key={year.id} className="ay-row transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="ay-name text-[13.5px] font-semibold">
                      {year.name}
                    </span>
                    {/* {isCurrentYear(year.is_current) && (
                      <span
                        className="ay-current-badge inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                        title="Current academic year"
                      >
                        <Star size={11} /> Current
                      </span>
                    )} */}
                    {isCurrentYear(year) && (
                      <span
                        className="ay-current-badge inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                        title="Current academic year"
                      >
                        <Star size={11} /> Current
                      </span>
                    )}
                  </div>
                </td>
                <td className="ay-cell px-3 py-3.5 text-[13px]">
                  {formatDate(year.start_date)}
                </td>
                <td className="ay-cell px-3 py-3.5 text-[13px]">
                  {formatDate(year.end_date)}
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`ay-status ${
                      year.status === "active"
                        ? "ay-status-active"
                        : "ay-status-inactive"
                    }`}
                  >
                    {year.status}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center justify-end gap-1 pr-2">
                    <button
                      onClick={() => onEdit(year)}
                      className="ay-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(year.id)}
                      disabled={deletingId === year.id}
                      className="ay-action-btn ay-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {academicYears.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="ay-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No academic years found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
