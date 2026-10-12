import React from "react";
import {
  Building2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Loader2,
  School,
} from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";

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

/**
 * Table view for Department directory with animated status toggle,
 * sortable headers, school column for admins, and action buttons.
 */
export default function DepartmentTable({
  pagedRows = [],
  selectedIds = [],
  toggleSelectAll,
  toggleSelectOne,
  openEditModal,
  setDeleteTarget,
  currentPage,
  totalItems,
  pageSize,
  setPage,
  setPageSize,
  showSchoolColumn = false,
  schoolsById = {},
  onStatusToggle,
  statusUpdatingId = null,
  sortBy = "name",
  sortOrder = "asc",
  onSort,
}) {
  const renderSortIcon = (colKey) => {
    if (!onSort) return null;
    if (sortBy !== colKey) {
      return <ArrowUpDown size={11} className="inline ml-1 opacity-40 hover:opacity-100" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={11} className="inline ml-1 text-primary" />
    ) : (
      <ArrowDown size={11} className="inline ml-1 text-primary" />
    );
  };

  const handleHeaderClick = (colKey) => {
    if (onSort) onSort(colKey);
  };

  return (
    <div className="dp-table-card rounded-2xl overflow-hidden shadow-sm border border-border/60">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="dp-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 w-10">
                <input
                  type="checkbox"
                  className="dp-checkbox w-4 h-4 rounded cursor-pointer"
                  onChange={toggleSelectAll}
                  checked={
                    pagedRows.length > 0 &&
                    pagedRows.every((dept) => selectedIds.includes(dept.id))
                  }
                />
              </th>

              {showSchoolColumn && (
                <th
                  onClick={() => handleHeaderClick("school_name")}
                  className={`px-4 py-3 font-semibold ${onSort ? "cursor-pointer select-none hover:text-foreground" : ""}`}
                >
                  <span className="inline-flex items-center gap-1">
                    School {renderSortIcon("school_name")}
                  </span>
                </th>
              )}

              <th
                onClick={() => handleHeaderClick("name")}
                className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold ${
                  onSort ? "cursor-pointer select-none hover:text-foreground" : ""
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  Department Name {renderSortIcon("name")}
                </span>
              </th>

              <th className="px-3 py-3 font-semibold">Description</th>

              <th
                onClick={() => handleHeaderClick("status")}
                className={`px-3 py-3 font-semibold ${
                  onSort ? "cursor-pointer select-none hover:text-foreground" : ""
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  Status {renderSortIcon("status")}
                </span>
              </th>

              <th
                onClick={() => handleHeaderClick("created_at")}
                className={`px-3 py-3 font-semibold ${
                  onSort ? "cursor-pointer select-none hover:text-foreground" : ""
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  Created {renderSortIcon("created_at")}
                </span>
              </th>

              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={showSchoolColumn ? 7 : 6}
                  className="dp-empty-state px-5 py-12 text-center text-[13.5px]"
                >
                  No departments found matching the filter criteria.
                </td>
              </tr>
            ) : (
              pagedRows.map((department) => {
                const schoolName =
                  department.school_name ||
                  schoolsById[String(department.school_id)] ||
                  "—";

                return (
                  <tr key={department.id} className="dp-row transition-colors">
                    {/* Checkbox */}
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        className="dp-checkbox w-4 h-4 rounded cursor-pointer"
                        checked={selectedIds.includes(department.id)}
                        onChange={() => toggleSelectOne(department.id)}
                      />
                    </td>

                    {/* School (Admin / Multi-school) */}
                    {showSchoolColumn && (
                      <td className="px-4 py-3.5 text-[13px]">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <School size={14} className="text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[180px]">{schoolName}</span>
                        </div>
                      </td>
                    )}

                    {/* Department Name & Icon */}
                    <td
                      className={`dp-cell-primary ${
                        showSchoolColumn ? "px-3" : "px-5"
                      } py-3.5 text-[13.5px] font-semibold`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="dp-icon-primary-bg w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                          <Building2 size={16} className="dp-icon-primary" />
                        </div>
                        <span className="dp-cell-primary text-[13.5px] font-semibold">
                          {department.name}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-3 py-3.5 max-w-[280px]">
                      <p className="dp-cell-secondary text-[13px] truncate">
                        {department.description || (
                          <span className="dp-cell-muted">—</span>
                        )}
                      </p>
                    </td>

                    {/* Status Toggle + Badge */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        {statusUpdatingId === department.id ? (
                          <Loader2 size={16} className="animate-spin text-primary" />
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              onStatusToggle &&
                              onStatusToggle(
                                department,
                                department.status === "active"
                                  ? "inactive"
                                  : "active",
                              )
                            }
                            title={`Click to ${
                              department.status === "active"
                                ? "deactivate"
                                : "activate"
                            } department`}
                            className={`dp-toggle-switch relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              department.status === "active"
                                ? "bg-emerald-500"
                                : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                department.status === "active"
                                  ? "translate-x-4"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        )}

                        <span
                          className={`dp-status ${
                            department.status === "active"
                              ? "dp-status-active"
                              : "dp-status-inactive"
                          }`}
                        >
                          {department.status}
                        </span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="dp-cell-muted px-3 py-3.5 text-[12.5px] whitespace-nowrap">
                      {formatDate(department.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(department)}
                          className="dp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:text-primary"
                          title="Edit Department"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(department)}
                          className="dp-action-btn dp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          title="Delete Department"
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
