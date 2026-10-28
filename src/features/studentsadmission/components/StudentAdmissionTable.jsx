import React from "react";
import { Eye, Pencil, Trash2, Bus, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import usePagination from "../../../common/components/table/usePagination";
import Pagination from "../../../common/components/table/Pagination";
import { getFullImageUrl } from "../../../config/env.js";
import { getAvatarColor } from "../../../common/utils/colors.js";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40",
  inactive: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40",
  completed: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40",
  transferred: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40",
  dropped: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
  cancelled: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40",
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
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const navigate = useNavigate();
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: admissions, initialSize: initialPageSize });

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
            {pagedData.map((a) => {
              const student = studentsById[a.student_id];
              const studentName =
                a.student_name ||
                (student
                  ? `${student.first_name} ${student.last_name || ""}`.trim()
                  : `Student #${a.student_id}`);
              const studentCode = a.student_code || student?.student_code;
              const rawPhoto = a.photo_url || student?.photo_url || student?.avatar || student?.image;
              const photoUrl = getFullImageUrl(rawPhoto);
              const initials =
                `${(a.first_name || student?.first_name || studentName)?.[0] || ""}${(a.last_name || student?.last_name)?.[0] || ""}`.toUpperCase() || "S";
              const statusKey = String(a.status || "active").toLowerCase();

              const studentTargetId = a.student_id || student?.id;
              const avatarColor = getAvatarColor(
                `${studentTargetId || a.id}-${student?.first_name || a.first_name || studentName}-${student?.last_name || a.last_name || ""}`
              );

              return (
                <tr key={a.id} className="sa-row transition-colors">
                  <td className="sa-cell px-5 py-3.5 text-[13px] font-semibold">
                    {a.admission_number || "—"}
                  </td>
                  <td className="sa-cell px-3 py-3.5 text-[13px]">
                    <div
                      className="flex items-center gap-2.5 cursor-pointer group"
                      onClick={() => {
                        if (studentTargetId) navigate(`/students/${studentTargetId}`);
                      }}
                      title="View full details"
                    >
                      <div
                        className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-2xs ${avatarColor}`}
                      >
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={studentName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {studentName}
                        </span>
                        {studentCode && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                            {studentCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="sa-cell px-3 py-3.5 text-[13px]">
                    <span className="font-medium">{a.class_name || "—"}</span>
                    {a.section ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold ml-1.5">
                        ({a.section})
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs ml-1.5 font-normal">
                        (Unallocated)
                      </span>
                    )}
                  </td>
                  <td className="sa-cell px-3 py-3.5 text-[13px]">
                    {a.academic_year_name || a.academic_year || "—"}
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
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold capitalize ${
                        STATUS_STYLES[statusKey] || STATUS_STYLES.inactive
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          statusKey === "active"
                            ? "bg-emerald-500"
                            : statusKey === "pending"
                            ? "bg-amber-500"
                            : statusKey === "completed"
                            ? "bg-blue-500"
                            : "bg-rose-500"
                        }`}
                      />
                      {a.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1 pr-2">
                      <button
                        onClick={() => {
                          if (studentTargetId) navigate(`/students/${studentTargetId}`);
                        }}
                        className="sa-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                        title="View full details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => onEdit(a)}
                        className="sa-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="sa-action-btn sa-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
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

/* ─────────────────────────────────────────────────────────────
   Skeleton Loading Component for Student Admissions Table
───────────────────────────────────────────────────────────── */
export function StudentAdmissionTableSkeleton() {
  return (
    <div className="sa-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="sa-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">
                <div className="sa-skeleton h-3.5 w-24 rounded" />
              </th>
              <th className="px-3 py-3 font-semibold">
                <div className="sa-skeleton h-3.5 w-16 rounded" />
              </th>
              <th className="px-3 py-3 font-semibold">
                <div className="sa-skeleton h-3.5 w-24 rounded" />
              </th>
              <th className="px-3 py-3 font-semibold">
                <div className="sa-skeleton h-3.5 w-24 rounded" />
              </th>
              <th className="px-3 py-3 font-semibold">
                <div className="sa-skeleton h-3.5 w-20 rounded" />
              </th>
              <th className="px-3 py-3 font-semibold">
                <div className="sa-skeleton h-3.5 w-12 rounded" />
              </th>
              <th className="px-3 py-3 font-semibold">
                <div className="sa-skeleton h-3.5 w-16 rounded" />
              </th>
              <th className="px-3 py-3 font-semibold">
                <div className="sa-skeleton h-3.5 w-14 rounded" />
              </th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                <div className="sa-skeleton h-3.5 w-16 rounded ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
              <tr
                key={row}
                className="sa-row border-b border-slate-100 dark:border-slate-800"
              >
                <td className="px-5 py-3.5">
                  <div className="sa-skeleton h-4 w-28 rounded" />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="sa-skeleton w-9 h-9 rounded-full shrink-0" />
                    <div className="flex flex-col gap-1.5">
                      <div className="sa-skeleton h-3.5 w-28 rounded" />
                      <div className="sa-skeleton h-2.5 w-20 rounded" />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <div className="sa-skeleton h-4 w-16 rounded" />
                </td>
                <td className="px-3 py-3.5">
                  <div className="sa-skeleton h-4 w-20 rounded" />
                </td>
                <td className="px-3 py-3.5">
                  <div className="sa-skeleton h-4 w-20 rounded" />
                </td>
                <td className="px-3 py-3.5">
                  <div className="sa-skeleton h-4 w-12 rounded" />
                </td>
                <td className="px-3 py-3.5">
                  <div className="sa-skeleton h-5 w-20 rounded-md" />
                </td>
                <td className="px-3 py-3.5">
                  <div className="sa-skeleton h-5 w-16 rounded-full" />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center justify-end gap-1.5 pr-2">
                    <div className="sa-skeleton w-7 h-7 rounded-lg" />
                    <div className="sa-skeleton w-7 h-7 rounded-lg" />
                    <div className="sa-skeleton w-7 h-7 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="sa-skeleton h-4 w-32 rounded" />
        <div className="flex items-center gap-2">
          <div className="sa-skeleton h-8 w-20 rounded-lg" />
          <div className="sa-skeleton h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

