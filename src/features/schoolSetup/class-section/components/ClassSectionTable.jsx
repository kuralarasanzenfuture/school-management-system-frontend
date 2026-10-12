import React, { useState, useMemo } from "react";
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";

export default function ClassSectionTable({
  classSections = [],
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

  const sortedClassSections = useMemo(() => {
    if (!sortField) return classSections;
    return [...classSections].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "created_at") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (sortField === "capacity") {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal || "").toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [classSections, sortField, sortDirection]);

  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: sortedClassSections, initialSize: initialPageSize });

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

  const colSpan = showSchoolColumn ? 8 : 7;

  return (
    <div className="cs-table-card rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="cs-thead text-[11.5px] uppercase tracking-wide select-none">
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
                  Class {renderSortIcon("class_name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("section_name")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Section {renderSortIcon("section_name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("academic_year")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Academic Year {renderSortIcon("academic_year")}
                </span>
              </th>
              <th
                onClick={() => handleSort("class_teacher_name")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Class Teacher {renderSortIcon("class_teacher_name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("capacity")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Capacity {renderSortIcon("capacity")}
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
                  colSpan={colSpan}
                  className="cs-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No class sections found.
                </td>
              </tr>
            ) : (
              pagedData.map((classSection) => {
                const isStatusUpdating = statusUpdatingId === classSection.id;
                return (
                  <tr key={classSection.id} className="cs-row transition-colors">
                    {showSchoolColumn && (
                      <td className="cs-cell px-5 py-3.5 text-[13px]">
                        {classSection.school_name || "—"}
                      </td>
                    )}

                    <td
                      className={`cs-cell ${
                        showSchoolColumn ? "px-3" : "px-5"
                      } py-3.5 text-[13.5px] font-semibold`}
                    >
                      {classSection.class_name}
                    </td>

                    <td className="cs-cell px-3 py-3.5 text-[13px]">
                      {classSection.section_name}
                    </td>

                    <td className="cs-cell px-3 py-3.5 text-[13px]">
                      {classSection.academic_year}
                    </td>

                    <td className="cs-cell px-3 py-3.5 text-[13px]">
                      {classSection.class_teacher_name || (
                        <span className="cs-cell-muted">—</span>
                      )}
                    </td>

                    <td className="cs-cell px-3 py-3.5 text-[13px]">
                      {classSection.capacity}
                    </td>

                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus &&
                          onToggleStatus(
                            classSection,
                            classSection.status === "active" ? "inactive" : "active"
                          )
                        }
                        disabled={isStatusUpdating || !onToggleStatus}
                        title={
                          onToggleStatus
                            ? `Click to set status to ${
                                classSection.status === "active"
                                  ? "inactive"
                                  : "active"
                              }`
                            : classSection.status
                        }
                        className={`cs-status inline-flex items-center gap-1.5 border-0 ${
                          classSection.status === "active"
                            ? "cs-status-active"
                            : "cs-status-inactive"
                        } ${
                          onToggleStatus
                            ? "cursor-pointer hover:opacity-85 transition-opacity"
                            : ""
                        } ${isStatusUpdating ? "opacity-50" : ""}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            classSection.status === "active"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <span className="capitalize">{classSection.status}</span>
                      </button>
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1 pr-2">
                        <button
                          onClick={() => onEdit(classSection)}
                          className="cs-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(classSection.id)}
                          disabled={deletingId === classSection.id}
                          className="cs-action-btn cs-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
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
