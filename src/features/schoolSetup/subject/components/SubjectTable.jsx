import React, { useState, useMemo } from "react";
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination.jsx";
import usePagination from "../../../../common/components/table/usePagination.jsx";

const STATUS_CLASS = {
  active: "sj-status-active",
  inactive: "sj-status-inactive",
};

const TYPE_CLASS = {
  theory: "sj-type-theory",
  practical: "sj-type-practical",
  both: "sj-type-both",
};

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

export default function SubjectTable({
  subjects = [],
  onEdit,
  onDelete,
  onToggleStatus,
  deletingId,
  statusUpdatingId,
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

  const sortedSubjects = useMemo(() => {
    if (!sortField) return subjects;
    return [...subjects].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "created_at") {
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
  }, [subjects, sortField, sortDirection]);

  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: sortedSubjects, initialSize: initialPageSize });

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
    <div className="sj-table-card rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="sj-thead text-[11.5px] uppercase tracking-wide select-none">
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
                  Subject {renderSortIcon("name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("code")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Code {renderSortIcon("code")}
                </span>
              </th>
              <th
                onClick={() => handleSort("subject_type")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Type {renderSortIcon("subject_type")}
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
              <th
                onClick={() => handleSort("created_at")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Created {renderSortIcon("created_at")}
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
                  colSpan={showSchoolColumn ? 7 : 6}
                  className="sj-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No subjects found.
                </td>
              </tr>
            ) : (
              pagedData.map((subj) => {
                const isStatusUpdating = statusUpdatingId === subj.id;
                return (
                  <tr key={subj.id} className="sj-row transition-colors">
                    {showSchoolColumn && (
                      <td className="sj-cell px-5 py-3.5 text-[13px]">
                        {subj.school_name || "—"}
                      </td>
                    )}
                    <td
                      className={`sj-cell ${
                        showSchoolColumn ? "px-3" : "px-5"
                      } py-3.5 text-[13.5px] font-semibold`}
                    >
                      {subj.name}
                    </td>
                    <td className="sj-cell-muted px-3 py-3.5 text-[13px]">
                      {subj.code || "—"}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`sj-type-pill ${
                          TYPE_CLASS[subj.subject_type] || "sj-type-theory"
                        }`}
                      >
                        {subj.subject_type}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus &&
                          onToggleStatus(
                            subj,
                            subj.status === "active" ? "inactive" : "active"
                          )
                        }
                        disabled={isStatusUpdating || !onToggleStatus}
                        title={
                          onToggleStatus
                            ? `Click to toggle status to ${
                                subj.status === "active" ? "inactive" : "active"
                              }`
                            : subj.status
                        }
                        className={`sj-status inline-flex items-center gap-1.5 border-0 ${
                          STATUS_CLASS[subj.status] || "sj-status-inactive"
                        } ${
                          onToggleStatus
                            ? "cursor-pointer hover:opacity-85 transition-opacity"
                            : ""
                        } ${isStatusUpdating ? "opacity-50" : ""}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            subj.status === "active"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {isStatusUpdating ? "Updating…" : subj.status}
                      </button>
                    </td>
                    <td className="sj-cell-muted px-3 py-3.5 text-[13px]">
                      {formatDate(subj.created_at)}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1 pr-2">
                        <button
                          onClick={() => onEdit(subj)}
                          className="sj-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(subj.id)}
                          disabled={deletingId === subj.id}
                          className="sj-action-btn sj-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
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
