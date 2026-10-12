import React, { useState, useMemo } from "react";
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination.jsx";
import usePagination from "../../../../common/components/table/usePagination.jsx";

const STATUS_CLASS = {
  active: "sg-status-active",
  inactive: "sg-status-inactive",
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

export default function SubjectGroupTable({
  subjectGroups = [],
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

  const sortedGroups = useMemo(() => {
    if (!sortField) return subjectGroups;
    return [...subjectGroups].sort((a, b) => {
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
  }, [subjectGroups, sortField, sortDirection]);

  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: sortedGroups, initialSize: initialPageSize });

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
    <div className="sg-table-card rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="sg-thead text-[11.5px] uppercase tracking-wide select-none">
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
                  Group Name {renderSortIcon("name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("description")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Description {renderSortIcon("description")}
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
                  colSpan={showSchoolColumn ? 6 : 5}
                  className="sg-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No subject groups found.
                </td>
              </tr>
            ) : (
              pagedData.map((sg) => {
                const isStatusUpdating = statusUpdatingId === sg.id;
                return (
                  <tr key={sg.id} className="sg-row transition-colors">
                    {showSchoolColumn && (
                      <td className="sg-cell px-5 py-3.5 text-[13px]">
                        {sg.school_name || "—"}
                      </td>
                    )}
                    <td
                      className={`sg-cell ${
                        showSchoolColumn ? "px-3" : "px-5"
                      } py-3.5 text-[13.5px] font-semibold`}
                    >
                      {sg.name}
                    </td>
                    <td className="sg-cell-muted px-3 py-3.5 text-[13px] max-w-xs truncate">
                      {sg.description || "—"}
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus &&
                          onToggleStatus(
                            sg,
                            sg.status === "active" ? "inactive" : "active"
                          )
                        }
                        disabled={isStatusUpdating || !onToggleStatus}
                        title={
                          onToggleStatus
                            ? `Click to toggle status to ${
                                sg.status === "active" ? "inactive" : "active"
                              }`
                            : sg.status
                        }
                        className={`sg-status inline-flex items-center gap-1.5 border-0 ${
                          STATUS_CLASS[sg.status] || "sg-status-inactive"
                        } ${
                          onToggleStatus
                            ? "cursor-pointer hover:opacity-85 transition-opacity"
                            : ""
                        } ${isStatusUpdating ? "opacity-50" : ""}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sg.status === "active"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {isStatusUpdating ? "Updating…" : sg.status}
                      </button>
                    </td>
                    <td className="sg-cell-muted px-3 py-3.5 text-[13px]">
                      {formatDate(sg.created_at)}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1 pr-2">
                        <button
                          onClick={() => onEdit(sg)}
                          className="sg-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(sg.id)}
                          disabled={deletingId === sg.id}
                          className="sg-action-btn sg-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
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
