import React, { useState, useMemo } from "react";
import { Pencil, Trash2, Star, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";

/* ── helpers ── */
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

function isCurrentYear(year) {
  if (!year.start_date || !year.end_date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(year.start_date);
  const endDate = new Date(year.end_date);
  return today >= startDate && today <= endDate;
}

export default function AcademicYearTable({
  academicYears = [],
  onEdit,
  onDelete,
  onToggleStatus,
  deletingId,
  statusUpdatingId,
  showSchoolColumn = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const [sortField, setSortField] = useState("start_date");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedYears = useMemo(() => {
    if (!sortField) return academicYears;
    return [...academicYears].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "start_date" || sortField === "end_date" || sortField === "created_at") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal || "").toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [academicYears, sortField, sortDirection]);

  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: sortedYears, initialSize: initialPageSize });

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

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    if (s === "active") return "ay-status-active";
    if (s === "inactive") return "ay-status-inactive";
    return "bg-slate-500/10 text-slate-500 dark:text-slate-400";
  };

  const getNextStatus = (current) => {
    const s = String(current).toLowerCase();
    if (s === "active") return "inactive";
    if (s === "inactive") return "archived";
    return "active";
  };

  return (
    <div className="ay-table-card rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="ay-thead text-[11.5px] uppercase tracking-wide select-none">
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
                onClick={() => handleSort("name")}
                className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity`}
              >
                <span className="inline-flex items-center gap-1.5">
                  Academic Year {renderSortIcon("name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("start_date")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Start Date {renderSortIcon("start_date")}
                </span>
              </th>
              <th
                onClick={() => handleSort("end_date")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  End Date {renderSortIcon("end_date")}
                </span>
              </th>
              <th
                onClick={() => handleSort("status")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Status {renderSortIcon("status")}
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
                  colSpan={showSchoolColumn ? 6 : 5}
                  className="ay-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No academic years found.
                </td>
              </tr>
            ) : (
              pagedData.map((year) => {
                const isStatusUpdating = statusUpdatingId === year.id;
                return (
                  <tr key={year.id} className="ay-row transition-colors">
                    {showSchoolColumn && (
                      <td className="sj-cell px-5 py-3.5 text-[13px]">
                        {year.school_name || "—"}
                      </td>
                    )}
                    <td className={`${showSchoolColumn ? "px-3" : "px-5"} py-3.5 text-[13px]`}>
                      <div className="flex items-center gap-2">
                        <span className="ay-name text-[13.5px] font-semibold">
                          {year.name}
                        </span>
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

                    {/* Status badge */}
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus &&
                          onToggleStatus(year, getNextStatus(year.status))
                        }
                        disabled={isStatusUpdating || !onToggleStatus}
                        title={
                          onToggleStatus
                            ? `Click to set status to ${getNextStatus(year.status)}`
                            : year.status
                        }
                        className={`ay-status inline-flex items-center gap-1.5 border-0 capitalize ${getStatusBadgeClass(
                          year.status
                        )} ${
                          onToggleStatus
                            ? "cursor-pointer hover:opacity-85 transition-opacity"
                            : ""
                        } ${isStatusUpdating ? "opacity-50" : ""}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            year.status === "active"
                              ? "bg-emerald-500"
                              : year.status === "inactive"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {isStatusUpdating ? "Updating…" : year.status}
                      </button>
                    </td>

                    {/* Actions */}
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
