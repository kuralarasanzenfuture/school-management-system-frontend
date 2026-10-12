import React, { useState, useMemo } from "react";
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination.jsx";
import usePagination from "../../../../common/components/table/usePagination.jsx";

function isTrue(value) {
  return value === true || value === 1 || value === "1";
}

export default function ClassSubjectTable({
  classSubjects = [],
  onEdit,
  onDelete,
  deletingId,
  showSchoolColumn = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedList = useMemo(() => {
    if (!sortField) return classSubjects;
    return [...classSubjects].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "created_at") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal || "").toLowerCase();
      } else if (typeof aVal === "boolean" || sortField === "is_optional") {
        aVal = isTrue(aVal) ? 1 : 0;
        bVal = isTrue(bVal) ? 1 : 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [classSubjects, sortField, sortDirection]);

  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: sortedList, initialSize: initialPageSize });

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={11} className="opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={11} className="text-primary font-bold" />
    ) : (
      <ArrowDown size={11} className="text-primary font-bold" />
    );
  };

  return (
    <div className="cx-table-card rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="cx-thead text-[11.5px] uppercase tracking-wide select-none">
              {showSchoolColumn && (
                <th
                  onClick={() => handleSort("school_name")}
                  className="px-5 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span className="inline-flex items-center gap-1.5">
                    School {renderSortIcon("school_name")}
                  </span>
                </th>
              )}
              <th
                onClick={() => handleSort("class_name")}
                className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity`}
              >
                <span className="inline-flex items-center gap-1.5">
                  Class / Section {renderSortIcon("class_name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("academic_year_name")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Academic Year {renderSortIcon("academic_year_name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("subject_name")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Subject {renderSortIcon("subject_name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("subject_group_name")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Subject Group {renderSortIcon("subject_group_name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("teacher_name")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Teacher {renderSortIcon("teacher_name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("weekly_periods")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Weekly Periods {renderSortIcon("weekly_periods")}
                </span>
              </th>
              <th
                onClick={() => handleSort("is_optional")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Type {renderSortIcon("is_optional")}
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
                  colSpan={showSchoolColumn ? 9 : 8}
                  className="cx-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No class subjects found.
                </td>
              </tr>
            ) : (
              pagedData.map((cx) => (
                <tr key={cx.id} className="cx-row transition-colors">
                  {showSchoolColumn && (
                    <td className="cx-cell px-5 py-3.5 text-[13px]">
                      {cx.school_name || "—"}
                    </td>
                  )}
                  <td
                    className={`cx-cell ${
                      showSchoolColumn ? "px-3" : "px-5"
                    } py-3.5 text-[13.5px] font-semibold`}
                  >
                    {cx.class_name}
                    {cx.section_name ? ` - ${cx.section_name}` : ""}
                  </td>
                  <td className="cx-cell px-3 py-3.5 text-[13px]">
                    {cx.academic_year_name || "—"}
                  </td>
                  <td className="cx-cell px-3 py-3.5 text-[13px]">
                    <span className="font-medium text-foreground">{cx.subject_name}</span>
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
              ))
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
