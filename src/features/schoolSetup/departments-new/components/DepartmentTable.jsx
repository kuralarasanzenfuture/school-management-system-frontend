import React from "react";
import { Building2, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";

function SortIcon() {
  return <ArrowUpDown size={11} className="inline ml-1 opacity-60" />;
}

/**
 * Table-view card for the department directory: header row, table body,
 * and pagination — all inside the same rounded card, matching the
 * original inline markup exactly. The grid view lives separately in
 * DepartmentPage.jsx since it's visually a different layout, not just a
 * different rendering of the same table.
 *
 * @param {Array<object>} pagedRows
 * @param {Array<number>} selectedIds
 * @param {(e) => void} toggleSelectAll
 * @param {(id: number) => void} toggleSelectOne
 * @param {(department: object) => void} openEditModal
 * @param {(department: object) => void} setDeleteTarget
 * @param {number} currentPage
 * @param {number} totalItems
 * @param {number} pageSize
 * @param {(page: number) => void} setPage
 * @param {(size: number) => void} setPageSize
 */
export default function DepartmentTable({
  pagedRows,
  selectedIds,
  toggleSelectAll,
  toggleSelectOne,
  openEditModal,
  setDeleteTarget,
  currentPage,
  totalItems,
  pageSize,
  setPage,
  setPageSize,
}) {
  return (
    <div className="dp-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="dp-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 w-10">
                <input
                  type="checkbox"
                  className="dp-checkbox w-4 h-4 rounded"
                  onChange={toggleSelectAll}
                  checked={
                    pagedRows.length > 0 &&
                    pagedRows.every((dept) => selectedIds.includes(dept.id))
                  }
                />
              </th>
              <th className="px-3 py-3 font-semibold">
                Name <SortIcon />
              </th>
              <th className="px-3 py-3 font-semibold">Description</th>
              <th className="px-3 py-3 font-semibold">
                Status <SortIcon />
              </th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="dp-empty-state px-5 py-12 text-center text-[13.5px]"
                >
                  No departments found.
                </td>
              </tr>
            ) : (
              pagedRows.map((department) => (
                <tr key={department.id} className="dp-row transition-colors">
                  <td className="px-5 py-3.5">
                    <input
                      type="checkbox"
                      className="dp-checkbox w-4 h-4 rounded"
                      checked={selectedIds.includes(department.id)}
                      onChange={() => toggleSelectOne(department.id)}
                    />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="dp-icon-primary-bg w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 size={16} className="dp-icon-primary" />
                      </div>
                      <span className="dp-cell-primary text-[13.5px] font-semibold">
                        {department.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 max-w-[280px]">
                    <p className="dp-cell-secondary text-[13px] truncate">
                      {department.description || (
                        <span className="dp-cell-muted">—</span>
                      )}
                    </p>
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`dp-status ${department.status === "active" ? "dp-status-active" : "dp-status-inactive"}`}
                    >
                      {department.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1 pr-2">
                      <button
                        onClick={() => openEditModal(department)}
                        className="dp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(department)}
                        className="dp-action-btn dp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
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

      {/* ── Pagination ── */}
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
