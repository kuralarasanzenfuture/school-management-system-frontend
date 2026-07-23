import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";

// Normalizes 1/0, true/false, "1"/"0" into a real boolean.
function isTrue(value) {
  return value === true || value === 1 || value === "1";
}

/**
 * ASSUMPTION: since class_subjects now references class_section_id
 * instead of separate class_id/academic_year_id/school_id columns, this
 * assumes your GET response still includes joined display fields —
 * class_name, section_name, academic_year (via class_section_id), plus
 * school_name for admins. Adjust the field names below if your actual
 * API joins these differently.
 */
export default function ClassSubjectTable({
  classSubjects,
  onEdit,
  onDelete,
  deletingId,
  showSchoolColumn = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: classSubjects, initialSize: initialPageSize });

    console.log(classSubjects);
  return (
    <div className="cx-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="cx-thead text-[11.5px] uppercase tracking-wide">
              {showSchoolColumn && (
                <th className="px-5 py-3 font-semibold">School</th>
              )}
              <th
                className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold`}
              >
                Class / Section
              </th>
              <th className="px-3 py-3 font-semibold">Academic Year</th>
              <th className="px-3 py-3 font-semibold">Subject</th>
              <th className="px-3 py-3 font-semibold">Subject Group</th>
              <th className="px-3 py-3 font-semibold">Teacher</th>
              <th className="px-3 py-3 font-semibold">Weekly Periods</th>
              <th className="px-3 py-3 font-semibold">Optional</th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((cx) => (
              <tr key={cx.id} className="cx-row transition-colors">
                {showSchoolColumn && (
                  <td className="cx-cell px-5 py-3.5 text-[13px]">
                    {cx.school_name || "—"}
                  </td>
                )}
                <td
                  className={`cx-cell ${showSchoolColumn ? "px-3" : "px-5"} py-3.5 text-[13.5px] font-semibold`}
                >
                  {cx.class_name}
                  {cx.section_name ? ` - ${cx.section_name}` : ""}
                </td>
                <td className="cx-cell px-3 py-3.5 text-[13px]">
                  {cx.academic_year_name || "—" }
                </td>
                <td className="cx-cell px-3 py-3.5 text-[13px]">
                  {cx.subject_name}
                  {cx.subject_code ? (
                    <span className="cx-cell-muted"> ({cx.subject_code})</span>
                  ) : (
                    ""
                  )}
                </td>
                <td className="cx-cell px-3 py-3.5 text-[13px]">
                  {cx.subject_group_name || (
                    <span className="cx-cell-muted">—</span>
                  )}
                </td>
                <td className="cx-cell px-3 py-3.5 text-[13px]">
                  {cx.teacher_name || <span className="cx-cell-muted">—</span>}
                </td>
                <td className="cx-cell px-3 py-3.5 text-[13px]">
                  {cx.weekly_periods ?? 0}
                </td>
                <td className="px-3 py-3.5">
                  {isTrue(cx.is_optional) ? (
                    <span className="cx-optional-badge">Optional</span>
                  ) : (
                    <span className="cx-cell-muted">Core</span>
                  )}
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center justify-end gap-1 pr-2">
                    <button
                      onClick={() => onEdit(cx)}
                      className="cx-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(cx.id)}
                      disabled={deletingId === cx.id}
                      className="cx-action-btn cx-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {classSubjects.length === 0 && (
              <tr>
                <td
                  colSpan={showSchoolColumn ? 9 : 8}
                  className="cx-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No class subjects found.
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
