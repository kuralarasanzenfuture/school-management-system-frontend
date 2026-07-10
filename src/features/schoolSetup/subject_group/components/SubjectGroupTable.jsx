import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import usePagination from "../../../../common/components/table/usePagination";
import Pagination from "../../../../common/components/table/Pagination";

const STATUS_CLASS = {
  active: "sg-status-active",
  inactive: "sg-status-inactive",
};

export default function SubjectGroupTable({
  subjectGroups,
  onEdit,
  onDelete,
  deletingId,
  showSchoolColumn = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: subjectGroups, initialSize: initialPageSize });
  return (
    <div className="sg-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="sg-thead text-[11.5px] uppercase tracking-wide">
              {showSchoolColumn && (
                <th className="px-5 py-3 font-semibold">School</th>
              )}
              <th
                className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold`}
              >
                Group Name
              </th>
              <th className="px-3 py-3 font-semibold">Description</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((sg) => (
              <tr key={sg.id} className="sg-row transition-colors">
                {showSchoolColumn && (
                  <td className="sg-cell px-5 py-3.5 text-[13px]">
                    {sg.school_name || "—"}
                  </td>
                )}
                <td
                  className={`sg-cell ${showSchoolColumn ? "px-3" : "px-5"} py-3.5 text-[13.5px] font-semibold`}
                >
                  {sg.name}
                </td>
                <td className="sg-cell-muted px-3 py-3.5 text-[13px] max-w-xs truncate">
                  {sg.description || "—"}
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`sg-status ${STATUS_CLASS[sg.status] || "sg-status-inactive"}`}
                  >
                    {sg.status}
                  </span>
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
            ))}

            {subjectGroups.length === 0 && (
              <tr>
                <td
                  colSpan={showSchoolColumn ? 5 : 4}
                  className="sg-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No subject groups found.
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
