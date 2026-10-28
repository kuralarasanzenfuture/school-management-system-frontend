/**
 * StudentAttendancePeriodTable.jsx
 *
 * Provides two viewing modes:
 *  1) "single_row" (Default): Each day is rendered on a single row with all periods
 *     (P1, P2, ... P8) displayed in a sleek horizontal track with color-coded status chips,
 *     day summary ratio, and expandable period detail drawers.
 *  2) "list": Detailed individual row-per-period view with clean badges, status dots,
 *     and user avatars.
 */
import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  RotateCcw,
  Rows3,
  LayoutList,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
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
  return isNaN(d)
    ? ""
    : d.toLocaleDateString("en-IN", { weekday: "short" });
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

export default function StudentAttendancePeriodTable({ rows = [] }) {
  const [layoutMode, setLayoutMode] = useState("single_row"); // "single_row" | "list"
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("All");
  const [expandedDates, setExpandedDates] = useState({});

  const toggleExpandDate = (dateStr) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  /* ─────────────────────────────────────────────────────────────
     1. Flattened list: date → periods[] → records[]
  ───────────────────────────────────────────────────────────── */
  const flatList = useMemo(() => {
    return rows
      .flatMap(({ date, periods }) =>
        (periods ?? []).flatMap(({ period_no, records }) =>
          (records ?? []).map((r) => ({ date, period_no, ...r }))
        )
      )
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        return dateDiff !== 0 ? dateDiff : a.period_no - b.period_no;
      });
  }, [rows]);

  /* ─────────────────────────────────────────────────────────────
     2. Grouped days: 1 record per date with periods map
  ───────────────────────────────────────────────────────────── */
  const dayGroups = useMemo(() => {
    return rows
      .map(({ date, periods = [] }) => {
        const periodList = (periods ?? [])
          .flatMap(({ period_no, records }) =>
            (records ?? []).map((r) => ({ period_no, ...r }))
          )
          .sort((a, b) => a.period_no - b.period_no);

        const total = periodList.length;
        const presentCount = periodList.filter(
          (p) => String(p.status).toLowerCase() === "present"
        ).length;
        const absentCount = periodList.filter(
          (p) => String(p.status).toLowerCase() === "absent"
        ).length;
        const lateCount = periodList.filter(
          (p) => String(p.status).toLowerCase() === "late"
        ).length;
        const className = periodList[0]?.class_name || "";
        const sectionName = periodList[0]?.section_name || "";
        const markedBy = periodList[0]?.marked_by || "—";

        return {
          date,
          periods: periodList,
          total,
          presentCount,
          absentCount,
          lateCount,
          className,
          sectionName,
          markedBy,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [rows]);

  /* Extract available period numbers dynamically for the dropdown */
  const periodOptions = useMemo(() => {
    const set = new Set();
    flatList.forEach((r) => {
      if (r.period_no !== undefined && r.period_no !== null) {
        set.add(Number(r.period_no));
      }
    });
    const sorted = Array.from(set).sort((a, b) => a - b);
    return [
      { value: "All", label: "All Periods" },
      ...sorted.map((p) => ({ value: String(p), label: `Period ${p}` })),
    ];
  }, [flatList]);

  /* ─────────────────────────────────────────────────────────────
     3. Filtered data for both layouts
  ───────────────────────────────────────────────────────────── */
  // Filtered for Flat List view
  const filteredFlat = useMemo(() => {
    let result = flatList;
    if (statusFilter && statusFilter !== "All") {
      result = result.filter(
        (r) => String(r.status).toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (periodFilter && periodFilter !== "All") {
      result = result.filter(
        (r) => String(r.period_no) === String(periodFilter)
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((r) => {
        const dateMatch =
          fmtDate(r.date).toLowerCase().includes(q) ||
          String(r.date).toLowerCase().includes(q) ||
          getWeekday(r.date).toLowerCase().includes(q);
        const periodMatch = `p${r.period_no} period ${r.period_no}`.includes(q);
        const statusMatch = String(r.status || "").toLowerCase().includes(q);
        const markedByMatch = String(r.marked_by || "").toLowerCase().includes(q);
        const remarksMatch = String(r.remarks || "").toLowerCase().includes(q);
        const classMatch = `${r.class_name || ""} ${r.section_name || ""}`
          .toLowerCase()
          .includes(q);
        return (
          dateMatch ||
          periodMatch ||
          statusMatch ||
          markedByMatch ||
          remarksMatch ||
          classMatch
        );
      });
    }
    return result;
  }, [flatList, statusFilter, periodFilter, search]);

  // Filtered for Single Row (Day Groups) view
  const filteredDayGroups = useMemo(() => {
    let result = dayGroups;
    if (statusFilter && statusFilter !== "All") {
      result = result.filter((g) =>
        g.periods.some(
          (p) => String(p.status).toLowerCase() === statusFilter.toLowerCase()
        )
      );
    }
    if (periodFilter && periodFilter !== "All") {
      result = result.filter((g) =>
        g.periods.some((p) => String(p.period_no) === String(periodFilter))
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((g) => {
        const dateMatch =
          fmtDate(g.date).toLowerCase().includes(q) ||
          String(g.date).toLowerCase().includes(q) ||
          getWeekday(g.date).toLowerCase().includes(q);
        const classMatch = `${g.className} ${g.sectionName}`
          .toLowerCase()
          .includes(q);
        const markedMatch = String(g.markedBy).toLowerCase().includes(q);
        const periodMatch = g.periods.some(
          (p) =>
            `p${p.period_no} period ${p.period_no}`.includes(q) ||
            String(p.status).toLowerCase().includes(q) ||
            String(p.remarks || "").toLowerCase().includes(q)
        );
        return dateMatch || classMatch || markedMatch || periodMatch;
      });
    }
    return result;
  }, [dayGroups, statusFilter, periodFilter, search]);

  /* ─────────────────────────────────────────────────────────────
     4. Pagination
  ───────────────────────────────────────────────────────────── */
  const activeData = layoutMode === "single_row" ? filteredDayGroups : filteredFlat;
  const initialPageSize = layoutMode === "single_row" ? 10 : 15;

  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: activeData, initialSize: initialPageSize });

  const hasActiveFilters =
    statusFilter !== "All" || periodFilter !== "All" || search.trim() !== "";

  const handleResetFilters = () => {
    setStatusFilter("All");
    setPeriodFilter("All");
    setSearch("");
  };

  return (
    <div className="sd-att-table-card rounded-2xl overflow-hidden flex flex-col gap-3.5 p-4 shadow-sm">
      {/* ── Table Top Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
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
              placeholder="Search period records…"
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

          {/* Period Filter Dropdown */}
          <div className="min-w-[130px]">
            <CustomDropdown
              options={periodOptions}
              value={periodFilter}
              onChange={setPeriodFilter}
              placeholder="All Periods"
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

        {/* View Layout Toggle (Single Row vs List) & Counter */}
        <div className="flex items-center gap-3">
          <div className="sd-view-toggle">
            <button
              type="button"
              onClick={() => setLayoutMode("single_row")}
              className={`sd-view-toggle-btn ${layoutMode === "single_row" ? "active" : ""}`}
              title="Single Row per Day (All periods in one row)"
            >
              <Rows3 size={14} />
              <span>Single Row</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("list")}
              className={`sd-view-toggle-btn ${layoutMode === "list" ? "active" : ""}`}
              title="Detailed List (One row per period)"
            >
              <LayoutList size={14} />
              <span>List</span>
            </button>
          </div>

          <span className="text-[12.5px] text-slate-400 font-medium whitespace-nowrap pl-1">
            {layoutMode === "single_row"
              ? `${filteredDayGroups.length} ${filteredDayGroups.length === 1 ? "day" : "days"} (${flatList.length} periods)`
              : `${filteredFlat.length} of ${flatList.length} records`}
          </span>
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {activeData.length === 0 ? (
        <div className="py-14 text-center text-slate-400 flex flex-col items-center justify-center gap-2.5">
          <Calendar size={36} className="text-slate-300 dark:text-slate-600" />
          <p className="text-[14px] font-semibold text-slate-600 dark:text-slate-300">
            No matching period records found
          </p>
          <p className="text-[12.5px] text-slate-400">
            Try adjusting your search query, status filter, or period selection.
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
      ) : layoutMode === "single_row" ? (
        /* ═════════════════════════════════════════════════════════
           LAYOUT 1: SINGLE ROW PER DAY (All Periods in 1 Row)
        ══════════════════════════════════════════════════════════ */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="sd-att-thead text-[11.5px] uppercase tracking-wider font-semibold">
                <th className="px-5 py-3 rounded-l-xl">Date & Day</th>
                <th className="px-3 py-3">Class / Section</th>
                <th className="px-4 py-3 min-w-[280px]">
                  Periods Timeline (Single Row)
                </th>
                <th className="px-3 py-3 text-center">Summary</th>
                <th className="px-3 py-3">Marked By</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Details</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((group) => {
                const isExpanded = !!expandedDates[group.date];
                const pct =
                  group.total > 0
                    ? Math.round((group.presentCount / group.total) * 100)
                    : 0;

                return (
                  <React.Fragment key={group.date}>
                    <tr
                      className={`sd-att-row group transition-colors ${
                        isExpanded ? "bg-slate-50/70 dark:bg-slate-800/40" : ""
                      }`}
                    >
                      {/* Date & Day */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="sd-att-cell text-[13.5px] font-semibold">
                            {fmtDate(group.date)}
                          </span>
                          <span className="sd-day-badge">
                            {getWeekday(group.date)}
                          </span>
                        </div>
                      </td>

                      {/* Class / Section */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">
                          {group.className}{" "}
                          {group.sectionName ? `— ${group.sectionName}` : ""}
                        </span>
                      </td>

                      {/* Periods in Single Row */}
                      <td className="px-4 py-3.5">
                        <div className="sd-period-track">
                          {group.periods.map((p) => {
                            const st = String(p.status).toLowerCase();
                            return (
                              <div
                                key={p.period_no}
                                className={`sd-period-chip sd-period-chip-${st}`}
                                title={`Period ${p.period_no}: ${p.status?.replace("_", " ")}${p.remarks ? ` (${p.remarks})` : ""}`}
                              >
                                <span className="sd-status-dot" />
                                <span>P{p.period_no}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Summary */}
                      <td className="px-3 py-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <span
                            className={
                              pct === 100
                                ? "text-emerald-600 dark:text-emerald-400"
                                : pct >= 50
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-rose-600 dark:text-rose-400"
                            }
                          >
                            {group.presentCount}/{group.total}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            ({pct}%)
                          </span>
                        </div>
                      </td>

                      {/* Marked By */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="sd-user-avatar">
                            {getInitials(group.markedBy)}
                          </span>
                          <span className="sd-att-muted text-[13px]">
                            {group.markedBy}
                          </span>
                        </div>
                      </td>

                      {/* Expand Button */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleExpandDate(group.date)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? "Hide" : "View"}</span>
                          {isExpanded ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Drawer for Period Details */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60 dark:bg-slate-800/30">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {group.periods.map((p) => {
                              const st = String(p.status).toLowerCase();
                              return (
                                <div
                                  key={p.period_no}
                                  className="sd-expandable-card p-3 rounded-xl flex flex-col gap-1.5 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                      <Clock size={12} className="text-indigo-500" />
                                      Period {p.period_no}
                                    </span>
                                    <span
                                      className={`sd-att-status sd-att-status-${st} text-[11px] py-0.5 px-2`}
                                    >
                                      {p.status?.replace("_", " ")}
                                    </span>
                                  </div>
                                  <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    <p className="truncate">
                                      <span className="font-medium text-slate-600 dark:text-slate-300">
                                        Marked by:
                                      </span>{" "}
                                      {p.marked_by || "—"}
                                    </p>
                                    <p className="truncate mt-0.5">
                                      <span className="font-medium text-slate-600 dark:text-slate-300">
                                        Remarks:
                                      </span>{" "}
                                      {p.remarks || "—"}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ═════════════════════════════════════════════════════════
           LAYOUT 2: DETAILED LIST VIEW (1 Row per Period)
        ══════════════════════════════════════════════════════════ */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="sd-att-thead text-[11.5px] uppercase tracking-wider font-semibold">
                <th className="px-5 py-3 rounded-l-xl">Date & Day</th>
                <th className="px-3 py-3">Period</th>
                <th className="px-3 py-3">Class / Section</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Marked By</th>
                <th className="px-5 py-3 rounded-r-xl">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((r, i) => (
                <tr
                  key={r.attendance_id ?? `${r.date}-${r.period_no}-${i}`}
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

                  {/* Period Badge */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold"
                      style={{
                        background: "var(--badge-bg)",
                        color: "var(--btn-bg)",
                      }}
                    >
                      P{r.period_no}
                    </span>
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
      {activeData.length > 0 && (
        <div className="pt-2">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizeOptions={layoutMode === "single_row" ? [10, 20, 30] : [10, 15, 25, 50]}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  );
}