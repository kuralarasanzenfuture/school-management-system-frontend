/**
 * StudentAttendanceDailyTable.jsx
 * Table view for daily attendance records with row/list filters and modern visual styling.
 */
import React, { useState, useMemo } from "react";
import { Search, X, RotateCcw, Calendar } from "lucide-react";
import Pagination from "../../../common/components/table/Pagination.jsx";
import usePagination from "../../../common/components/table/usePagination.jsx";
import CustomDropdown from "../../../common/components/dropdown/CustomDropdown.jsx";

function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d)
    ? String(v)
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function getWeekday(v) {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d) ? "" : d.toLocaleDateString("en-IN", { weekday: "short" });
}

function getInitials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const STATUS_OPTIONS = [
  { value: "All", label: "All Statuses" },
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "leave", label: "Leave" },
  { value: "holiday", label: "Holiday" },
  { value: "half_day", label: "Half Day" },
];

export default function StudentAttendanceDailyTable({ rows = [] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* Flatten dailyData → one row per record */
  const flat = useMemo(() => {
    return rows
      .flatMap(({ date, records }) =>
        (records ?? []).map((r) => ({ date, ...r }))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [rows]);

  /* Filter by status and search text */
  const filtered = useMemo(() => {
    let result = flat;
    if (statusFilter && statusFilter !== "All") {
      result = result.filter(
        (r) => String(r.status).toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((r) => {
        const dateMatch =
          fmtDate(r.date).toLowerCase().includes(q) ||
          String(r.date).toLowerCase().includes(q) ||
          getWeekday(r.date).toLowerCase().includes(q);
        const statusMatch = String(r.status || "").toLowerCase().includes(q);
        const markedByMatch = String(r.marked_by || "").toLowerCase().includes(q);
        const remarksMatch = String(r.remarks || "").toLowerCase().includes(q);
        const classMatch = `${r.class_name || ""} ${r.section_name || ""}`
          .toLowerCase()
          .includes(q);
        return (
          dateMatch ||
          statusMatch ||
          markedByMatch ||
          remarksMatch ||
          classMatch
        );
      });
    }
    return result;
  }, [flat, statusFilter, search]);

  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: filtered, initialSize: 15 });

  const hasActiveFilters = statusFilter !== "All" || search.trim() !== "";

  const handleResetFilters = () => {
    setStatusFilter("All");
    setSearch("");
  };

  return (
    <div className="sd-att-table-card rounded-2xl overflow-hidden flex flex-col gap-3.5 p-4 shadow-sm">
      {/* ── Table Row Filters Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search daily records…"
              className="w-full pl-8 pr-7 py-2 rounded-xl text-[13px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500 shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="min-w-[140px]">
            <CustomDropdown
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Statuses"
            />
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Count text */}
        <span className="text-[12.5px] text-slate-400 font-medium whitespace-nowrap">
          {filtered.length} of {flat.length} {flat.length === 1 ? "record" : "records"}
        </span>
      </div>

      {/* ── Table Content ── */}
      {filtered.length === 0 ? (
        <div className="py-14 text-center text-slate-400 flex flex-col items-center justify-center gap-2.5">
          <Calendar size={36} className="text-slate-300 dark:text-slate-600" />
          <p className="text-[14px] font-semibold text-slate-600 dark:text-slate-300">
            No matching daily records found
          </p>
          <p className="text-[12.5px] text-slate-400">
            Try adjusting your search query or status filter.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="sd-att-thead text-[11.5px] uppercase tracking-wider font-semibold">
                <th className="px-5 py-3 rounded-l-xl">Date & Day</th>
                <th className="px-3 py-3">Class / Section</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Marked By</th>
                <th className="px-5 py-3 rounded-r-xl">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((r, i) => (
                <tr
                  key={r.attendance_id ?? `${r.date}-${i}`}
                  className="sd-att-row hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Date & Day */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="sd-att-cell text-[13.5px] font-semibold">
                        {fmtDate(r.date)}
                      </span>
                      <span className="sd-day-badge">
                        {getWeekday(r.date)}
                      </span>
                    </div>
                  </td>

                  {/* Class / Section */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">
                      {r.class_name} {r.section_name ? `— ${r.section_name}` : ""}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span
                      className={`sd-att-status sd-att-status-${String(r.status).toLowerCase()} inline-flex items-center gap-1.5`}
                    >
                      <span className="sd-status-dot" />
                      <span>{r.status?.replace("_", " ")}</span>
                    </span>
                  </td>

                  {/* Marked By */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="sd-user-avatar">
                        {getInitials(r.marked_by)}
                      </span>
                      <span className="sd-att-muted text-[13px]">
                        {r.marked_by ?? "—"}
                      </span>
                    </div>
                  </td>

                  {/* Remarks */}
                  <td className="px-5 py-3.5 text-[12.5px] max-w-[200px]">
                    <p
                      className="sd-att-muted truncate"
                      title={r.remarks || ""}
                    >
                      {r.remarks || "—"}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {filtered.length > 0 && (
        <div className="pt-2">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizeOptions={[10, 15, 25, 50]}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  );
}