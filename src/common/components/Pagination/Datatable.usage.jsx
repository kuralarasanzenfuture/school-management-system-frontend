/**
 * DataTable usage examples
 * ─────────────────────────────────────────────────────────────────
 * File structure (suggested):
 *
 *   src/common/components/table/
 *     DataTable.jsx
 *     DataTable.css
 *     Pagination.jsx
 *     Pagination.css
 *     usePagination.js
 */

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Pencil, Trash2, Building2 } from "lucide-react";
import DataTable from "../../common/components/table/DataTable";
import usePagination from "../../common/components/table/usePagination";
import { fetchDepartments } from "../../redux/department/departmentSlice";

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 1 — Basic read-only table (DataTable handles everything)
// ─────────────────────────────────────────────────────────────────
export function DepartmentTableBasic() {
  const dispatch = useDispatch();
  const { departments, loading } = useSelector((state) => state.departments);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const columns = [
    { key: "id", label: "ID", sortable: true, width: "w-16" },
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description" },
    { key: "school_id", label: "School", sortable: true, width: "w-24" },
  ];

  return (
    <DataTable
      title="Departments"
      data={departments}
      columns={columns}
      loading={loading}
      emptyMessage="No departments found."
      initialPageSize={10}
      onExport={() => console.log("export")}
    />
  );
}

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 2 — Table with custom cell renderers + actions + selection
// ─────────────────────────────────────────────────────────────────
export function DepartmentTableFull() {
  const dispatch = useDispatch();
  const { departments, loading } = useSelector((state) => state.departments);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const [search, setSearch] = useState("");

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return departments;
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(query) ||
        (dept.description ?? "").toLowerCase().includes(query),
    );
  }, [departments, search]);

  const columns = [
    {
      key: "name",
      label: "Department",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="dp-icon-primary-bg w-8 h-8 rounded-lg flex items-center justify-center">
            <Building2 size={15} className="dp-icon-primary" />
          </div>
          <span className="dt-cell-primary text-[13.5px] font-semibold">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="dt-cell-secondary text-[13px]">
          {value || <span className="dt-cell-muted">—</span>}
        </span>
      ),
    },
    {
      key: "school_id",
      label: "School",
      sortable: true,
      align: "center",
      render: (value) => <span className="dp-badge">{value}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1 pr-1">
          <button className="dt-action-btn w-8 h-8 rounded-lg flex items-center justify-center">
            <Eye size={15} />
          </button>
          <button className="dt-action-btn w-8 h-8 rounded-lg flex items-center justify-center">
            <Pencil size={15} />
          </button>
          <button className="dt-action-btn dt-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const bulkActions = [
    {
      label: "Export Selected",
      onClick: (rows) => console.log("export", rows),
    },
    {
      label: "Delete Selected",
      danger: true,
      onClick: (rows) => console.log("delete", rows),
    },
  ];

  return (
    <div>
      {/* External search box — reset to page 1 is handled inside DataTable via sort change */}
      <input
        className="mb-4 border rounded-lg px-3 py-2 text-sm outline-none"
        placeholder="Search departments…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <DataTable
        title="Department directory"
        data={filteredDepartments}
        columns={columns}
        loading={loading}
        emptyMessage="No departments match your search."
        selectable
        bulkActions={bulkActions}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        onExport={() => console.log("export all")}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 3 — Use usePagination hook independently (no DataTable)
//             when you need full control over your own table markup
// ─────────────────────────────────────────────────────────────────
import Pagination from "../../common/components/table/Pagination";

export function CustomTableWithHook({ rows }) {
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: rows, initialSize: 10 });

  return (
    <div className="dt-card rounded-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="dt-thead text-[11.5px] uppercase tracking-wide">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Description</th>
          </tr>
        </thead>
        <tbody>
          {pagedData.map((row) => (
            <tr key={row.id} className="dt-row">
              <td className="px-4 py-3 dt-cell-primary text-[13.5px]">
                {row.name}
              </td>
              <td className="px-4 py-3 dt-cell-secondary text-[13px]">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Standalone Pagination — works with any table markup */}
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
