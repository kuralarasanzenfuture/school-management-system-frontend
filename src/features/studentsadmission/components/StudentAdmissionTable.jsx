import React from "react";
import { Pencil, Trash2, Bus, Home } from "lucide-react";

const STATUS_CLASS = {
  active: "sa-status-active",
  inactive: "sa-status-inactive",
};

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

// Normalizes 1/0, true/false, "1"/"0" into a real boolean — booleans
// often round-trip through APIs/DBs as integers.
function isTrue(value) {
  return value === true || value === 1 || value === "1";
}

/**
 * NOTE: your sample GET response has no joined `student_name` — only
 * `student_id`. `studentsById` (a map of id -> student record, built from
 * whatever list you already fetch for the form's dropdown) is used here
 * to display a name instead of a raw id. If your backend can add a
 * joined student_name to the response, this falls back to that first.
 */
export default function StudentAdmissionTable({
  admissions,
  studentsById = {},
  onEdit,
  onDelete,
  deletingId,
}) {
  return (
    <div className="sa-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="sa-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">Admission No.</th>
              <th className="px-3 py-3 font-semibold">Student</th>
              <th className="px-3 py-3 font-semibold">Class / Section</th>
              <th className="px-3 py-3 font-semibold">Academic Year</th>
              <th className="px-3 py-3 font-semibold">Joining Date</th>
              <th className="px-3 py-3 font-semibold">Type</th>
              <th className="px-3 py-3 font-semibold">Facilities</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {admissions.map((a) => {
              const studentName =
                a.student_name ||
                (studentsById[a.student_id]
                  ? `${studentsById[a.student_id].first_name} ${studentsById[a.student_id].last_name || ""}`.trim()
                  : `Student #${a.student_id}`);

              return (
                <tr key={a.id} className="sa-row transition-colors">
                  <td className="sa-cell px-5 py-3.5 text-[13px] font-semibold">
                    {a.admission_number || "—"}
                  </td>
                  <td className="sa-cell px-3 py-3.5 text-[13px]">
                    {studentName}
                  </td>
                  <td className="sa-cell px-3 py-3.5 text-[13px]">
                    {a.class_name}
                    {a.section ? ` - ${a.section}` : ""}
                  </td>
                  <td className="sa-cell px-3 py-3.5 text-[13px]">
                    {a.academic_year}
                  </td>
                  <td className="sa-cell-muted px-3 py-3.5 text-[13px]">
                    {formatDate(a.joining_date)}
                  </td>
                  <td className="sa-cell px-3 py-3.5 text-[13px] capitalize">
                    {a.admission_type}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      {isTrue(a.transport_required) && (
                        <span
                          className="sa-facility-badge inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium"
                          title="Transport required"
                        >
                          <Bus size={12} /> Transport
                        </span>
                      )}
                      {isTrue(a.hostel_required) && (
                        <span
                          className="sa-facility-badge inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium"
                          title="Hostel required"
                        >
                          <Home size={12} /> Hostel
                        </span>
                      )}
                      {!isTrue(a.transport_required) &&
                        !isTrue(a.hostel_required) && (
                          <span className="sa-cell-muted">—</span>
                        )}
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`sa-status ${STATUS_CLASS[a.status] || "sa-status-inactive"}`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1 pr-2">
                      <button
                        onClick={() => onEdit(a)}
                        className="sa-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="sa-action-btn sa-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {admissions.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="sa-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No student admissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
