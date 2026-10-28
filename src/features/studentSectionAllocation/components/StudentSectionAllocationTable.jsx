import React from "react";
import { Eye, Pencil, Trash2, User, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import usePagination from "../../../common/components/table/usePagination.jsx";
import Pagination from "../../../common/components/table/Pagination.jsx";
import { getFullImageUrl } from "../../../config/env.js";
import { getAvatarColor } from "../../../common/utils/colors.js";

const STATUS_BADGES = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  transferred: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
};

const AVATAR_PALETTES = [
  { bg: "bg-indigo-50 dark:bg-indigo-950/50", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-200/60 dark:border-indigo-800/50" },
  { bg: "bg-violet-50 dark:bg-violet-950/50", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200/60 dark:border-violet-800/50" },
  { bg: "bg-sky-50 dark:bg-sky-950/50", text: "text-sky-600 dark:text-sky-400", border: "border-sky-200/60 dark:border-sky-800/50" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/50", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200/60 dark:border-emerald-800/50" },
  { bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-600 dark:text-rose-400", border: "border-rose-200/60 dark:border-rose-800/50" },
  { bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200/60 dark:border-amber-800/50" },
  { bg: "bg-teal-50 dark:bg-teal-950/50", text: "text-teal-600 dark:text-teal-400", border: "border-teal-200/60 dark:border-teal-800/50" },
];

function getAvatarPalette(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

function getStudentInitials(firstName, lastName, fullName) {
  const f = String(firstName || "").trim();
  const l = String(lastName || "").trim();
  if (f && l) {
    return `${f[0]}${l[0]}`.toUpperCase();
  }
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || "ST";
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StudentSectionAllocationTable({
  allocations = [],
  onEdit,
  onDelete,
  deletingId,
  initialPageSize = 10,
}) {
  const navigate = useNavigate();
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: allocations, initialSize: initialPageSize });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11.5px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
              <th className="px-5 py-3.5">Roll No</th>
              <th className="px-4 py-3.5">Student</th>
              <th className="px-4 py-3.5">Admission No</th>
              <th className="px-4 py-3.5">Class & Section</th>
              <th className="px-4 py-3.5">Academic Year</th>
              <th className="px-4 py-3.5">Dates</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Remarks</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px] text-slate-700 dark:text-slate-200">
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-12 text-slate-400 dark:text-slate-500">
                  No section allocations found.
                </td>
              </tr>
            ) : (
              pagedData.map((alloc) => {
                const studentName = `${alloc.first_name || ""} ${alloc.last_name || ""}`.trim() || `Student #${alloc.student_id}`;
                const className = alloc.class_name || "—";
                const sectionName = alloc.section_name || alloc.section || "—";
                const status = (alloc.status || "active").toLowerCase();
                const badgeStyle = STATUS_BADGES[status] || STATUS_BADGES.active;

                const rawPhoto = alloc.photo_url || alloc.photo || alloc.student_photo;
                const photoUrl = getFullImageUrl(rawPhoto);
                const initials = getStudentInitials(alloc.first_name, alloc.last_name, studentName);
                const studentTargetId = alloc.student_id;
                const avatarColor = getAvatarColor(
                  `${studentTargetId || alloc.id}-${alloc.first_name || studentName}-${alloc.last_name || ""}`
                );

                return (
                  <tr
                    key={alloc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Roll No */}
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {alloc.roll_no ? (
                        <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono text-[12px] border border-indigo-200 dark:border-indigo-800/50">
                          #{alloc.roll_no}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-normal">—</span>
                      )}
                    </td>

                    {/* Student Info */}
                    <td className="px-4 py-3.5">
                      <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => {
                          if (studentTargetId) navigate(`/students/${studentTargetId}`);
                        }}
                        title="View student profile"
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
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white leading-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {studentName}
                          </div>
                          {alloc.student_code && (
                            <div className="text-[11.5px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                              {alloc.student_code}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Admission No */}
                    <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {alloc.admission_number || `Adm #${alloc.admission_id || "—"}`}
                    </td>

                    {/* Class & Section */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {className}
                      </div>
                      <div className="text-[12px] text-indigo-600 dark:text-indigo-400 font-medium">
                        Section {sectionName}
                      </div>
                    </td>

                    {/* Academic Year */}
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {alloc.academic_year_name || alloc.academic_year || "—"}
                    </td>

                    {/* Allocation Dates */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300">
                        <span>{formatDate(alloc.allocation_date)}</span>
                        {alloc.effective_to && (
                          <>
                            <ArrowRight size={11} className="text-slate-400" />
                            <span className="text-slate-400">{formatDate(alloc.effective_to)}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${badgeStyle}`}>
                        {status}
                      </span>
                    </td>

                    {/* Remarks */}
                    <td className="px-4 py-3.5 max-w-[160px] truncate text-slate-500 dark:text-slate-400 text-[12px]" title={alloc.remarks}>
                      {alloc.remarks || "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (studentTargetId) navigate(`/students/${studentTargetId}`);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                          title="View Full Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(alloc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                          title="Edit / Transfer Section"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(alloc)}
                          disabled={deletingId === alloc.id}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete Allocation"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {allocations.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Skeleton Loading Component for Student Section Allocations Table
───────────────────────────────────────────────────────────── */
export function StudentSectionAllocationTableSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11.5px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
              <th className="px-5 py-3.5">
                <div className="app-skeleton h-3.5 w-14 rounded" />
              </th>
              <th className="px-4 py-3.5">
                <div className="app-skeleton h-3.5 w-20 rounded" />
              </th>
              <th className="px-4 py-3.5">
                <div className="app-skeleton h-3.5 w-24 rounded" />
              </th>
              <th className="px-4 py-3.5">
                <div className="app-skeleton h-3.5 w-24 rounded" />
              </th>
              <th className="px-4 py-3.5">
                <div className="app-skeleton h-3.5 w-24 rounded" />
              </th>
              <th className="px-4 py-3.5">
                <div className="app-skeleton h-3.5 w-16 rounded" />
              </th>
              <th className="px-4 py-3.5">
                <div className="app-skeleton h-3.5 w-14 rounded" />
              </th>
              <th className="px-4 py-3.5">
                <div className="app-skeleton h-3.5 w-16 rounded" />
              </th>
              <th className="px-5 py-3.5 text-right">
                <div className="app-skeleton h-3.5 w-14 rounded ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
              <tr
                key={row}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="app-skeleton h-5 w-12 rounded-md" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="app-skeleton w-9 h-9 rounded-full shrink-0" />
                    <div className="flex flex-col gap-1.5">
                      <div className="app-skeleton h-3.5 w-32 rounded" />
                      <div className="app-skeleton h-2.5 w-20 rounded" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="app-skeleton h-4 w-24 rounded" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="app-skeleton h-4 w-20 rounded" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="app-skeleton h-4 w-20 rounded" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="app-skeleton h-4 w-16 rounded" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="app-skeleton h-5 w-16 rounded-full" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="app-skeleton h-4 w-20 rounded" />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="app-skeleton w-7 h-7 rounded-lg" />
                    <div className="app-skeleton w-7 h-7 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between">
        <div className="app-skeleton h-4 w-32 rounded" />
        <div className="flex items-center gap-2">
          <div className="app-skeleton h-8 w-20 rounded-lg" />
          <div className="app-skeleton h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

