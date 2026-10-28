/**
 * StudentAttendanceTab.jsx — Unified Attendance View
 *
 * Implements clean, uncluttered layout matching Payfit UI (Dribbble reference):
 *  - Two primary views: [ Calendar ] and [ List View ] (no duplicate or conflicting toggles)
 *  - In "Calendar": Full-width Payfit monthly calendar with multi-segment distribution bar and in-cell accent cards
 *  - In "List View": Monthly/Weekly/Daily range filters, Daily Attendance table, and Period Attendance table (with Single Row & List layouts)
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Calendar as CalendarIcon,
  List as ListIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Layers,
} from "lucide-react";
import StudentAttendanceCalendar from "./StudentAttendanceCalendar.jsx";
import StudentAttendanceDailyTable from "./StudentAttendanceDailyTable.jsx";
import StudentAttendancePeriodTable from "./StudentAttendancePeriodTable.jsx";
import CustomDropdown from "../../../common/components/dropdown/CustomDropdown.jsx";
import "../styles/StudentDetailsPage-new.css";
import api from "../../../common/services/api.js";

const ATTENDANCE_TYPE_OPTIONS = [
  { value: "daily,period", label: "Daily + Period" },
  { value: "daily", label: "Daily Only" },
  { value: "period", label: "Period Only" },
];

export default function StudentAttendanceTab({ studentId }) {
  /* ── View Mode: "calendar" (Default) | "list" ── */
  const [viewMode, setViewMode] = useState("calendar");

  /* ── Range Mode (Used for List View): "monthly" | "weekly" | "daily" ── */
  const [rangeMode, setRangeMode] = useState("monthly");
  const [anchorDate, setAnchorDate] = useState(() => dayjs());

  /* ── Attendance Type: "daily,period" | "daily" | "period" ── */
  const [attendType, setAttendType] = useState("daily,period");

  /* ── In List View when both are selected, user can toggle sub-tabs ── */
  const [listSubTab, setListSubTab] = useState("daily"); // "daily" | "period"

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const year = anchorDate.year();
  const month = anchorDate.month(); // 0-indexed

  const handleMonthChange = (newYear, newMonth) => {
    setAnchorDate((prev) => prev.year(newYear).month(newMonth).startOf("month"));
  };

  /* ── Date range calculation according to viewMode & rangeMode ── */
  const { from_date, to_date, rangeDisplayTitle, isAtCurrent } = useMemo(() => {
    const today = dayjs();

    // In Calendar mode: always full month of anchorDate
    if (viewMode === "calendar") {
      const start = anchorDate.startOf("month");
      const end = anchorDate.endOf("month");
      return {
        from_date: start.format("YYYY-MM-DD"),
        to_date: end.format("YYYY-MM-DD"),
        rangeDisplayTitle: anchorDate.format("MMMM YYYY"),
        isAtCurrent:
          anchorDate.isSame(today, "month") || anchorDate.isAfter(today, "month"),
      };
    }

    // In List View: support monthly, weekly, or single-day ranges
    if (rangeMode === "monthly") {
      const start = anchorDate.startOf("month");
      const end = anchorDate.endOf("month");
      return {
        from_date: start.format("YYYY-MM-DD"),
        to_date: end.format("YYYY-MM-DD"),
        rangeDisplayTitle: anchorDate.format("MMMM YYYY"),
        isAtCurrent:
          anchorDate.isSame(today, "month") || anchorDate.isAfter(today, "month"),
      };
    } else if (rangeMode === "weekly") {
      const start = anchorDate.startOf("week");
      const end = anchorDate.endOf("week");
      return {
        from_date: start.format("YYYY-MM-DD"),
        to_date: end.format("YYYY-MM-DD"),
        rangeDisplayTitle: `${start.format("D MMM")} – ${end.format("D MMM YYYY")}`,
        isAtCurrent:
          anchorDate.isSame(today, "week") || anchorDate.isAfter(today, "week"),
      };
    } else {
      const formatted = anchorDate.format("YYYY-MM-DD");
      return {
        from_date: formatted,
        to_date: formatted,
        rangeDisplayTitle: anchorDate.format("D MMMM YYYY"),
        isAtCurrent:
          anchorDate.isSame(today, "day") || anchorDate.isAfter(today, "day"),
      };
    }
  }, [viewMode, rangeMode, anchorDate]);

  /* ── Navigation helpers ── */
  const handlePrev = () => {
    if (viewMode === "calendar" || rangeMode === "monthly") {
      setAnchorDate((prev) => prev.subtract(1, "month"));
    } else if (rangeMode === "weekly") {
      setAnchorDate((prev) => prev.subtract(1, "week"));
    } else {
      setAnchorDate((prev) => prev.subtract(1, "day"));
    }
  };

  const handleNext = () => {
    if (viewMode === "calendar" || rangeMode === "monthly") {
      setAnchorDate((prev) => prev.add(1, "month"));
    } else if (rangeMode === "weekly") {
      setAnchorDate((prev) => prev.add(1, "week"));
    } else {
      setAnchorDate((prev) => prev.add(1, "day"));
    }
  };

  const handleJumpToToday = () => {
    setAnchorDate(dayjs());
  };

  /* ── Fetch Attendance API ── */
  const fetchData = useCallback(() => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    const params = {
      from_date,
      to_date,
      attendance_type: attendType,
    };
    api
      .get(`/students-attendance/student/${studentId}`, { params })
      .then((res) => setData(res.data))
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, [studentId, from_date, to_date, attendType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dailyRows = data?.data?.daily ?? [];
  const periodRows = data?.data?.period ?? [];
  const summary = data?.summary ?? {};

  return (
    <div className="flex flex-col gap-4">
      {/* ══════════════════════════════════════════════════════════
          TOP CONTROL BAR (Streamlined & Clean - No Duplicates)
      ══════════════════════════════════════════════════════════ */}
      <div className="sd-att-table-card rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          {/* In List View: Show Range Switcher (Monthly, Weekly, Daily) */}
          {viewMode === "list" && (
            <div className="flex rounded-xl p-0.5 border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/60">
              <button
                type="button"
                onClick={() => setRangeMode("monthly")}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all ${
                  rangeMode === "monthly"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setRangeMode("weekly")}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all ${
                  rangeMode === "weekly"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setRangeMode("daily")}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all ${
                  rangeMode === "daily"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Daily
              </button>
            </div>
          )}

          {/* Date Navigator */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="sd-att-cell text-[14px] font-bold px-2.5 min-w-[130px] text-center whitespace-nowrap">
              {rangeDisplayTitle}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={isAtCurrent}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
              title="Next"
            >
              <ChevronRight size={16} />
            </button>
            {!isAtCurrent && (
              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold ml-0.5 cursor-pointer"
              >
                Today
              </button>
            )}
          </div>

          {/* Attendance Type Selector Dropdown */}
          <div className="min-w-[155px]">
            <CustomDropdown
              options={ATTENDANCE_TYPE_OPTIONS}
              value={attendType}
              onChange={setAttendType}
              placeholder="Attendance Type"
            />
          </div>
        </div>

        {/* Right: Payfit View Switch [ Calendar ] | [ List View ] + Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="flex rounded-xl p-0.5 border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/60">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <CalendarIcon size={14} />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <ListIcon size={14} />
              <span>List View</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchData}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Loading / Error states ── */}
      {loading && (
        <div className="flex flex-col gap-5">
          {/* 6 Stat cards skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="sd-cal-stat-card flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="sd-skeleton h-3 w-16 rounded" />
                  <div className="sd-skeleton w-7 h-7 rounded-lg" />
                </div>
                <div className="sd-skeleton h-6 w-12 rounded-md" />
              </div>
            ))}
          </div>

          {/* Calendar grid skeleton */}
          <div className="sd-section-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-7 bg-[#f0f2f5] dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 py-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex justify-center">
                  <div className="sd-skeleton h-4 w-10 rounded" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-l border-slate-200 dark:border-slate-800">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[140px] p-2.5 flex flex-col justify-between border-r border-b border-slate-200 dark:border-slate-800"
                >
                  <div className="sd-skeleton h-4 w-5 rounded" />
                  <div className="sd-skeleton h-6 w-3/4 rounded-lg my-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-sm">
          Error: {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          VIEW 1: PAYFIT CALENDAR VIEW
      ══════════════════════════════════════════════════════════ */}
      {!loading && !error && viewMode === "calendar" && (
        <StudentAttendanceCalendar
          dailyData={dailyRows}
          periodData={periodRows}
          year={year}
          month={month}
          onMonthChange={handleMonthChange}
        />
      )}

      {/* ══════════════════════════════════════════════════════════
          VIEW 2: LIST VIEW (Clean Tables & Sub-tabs if needed)
      ══════════════════════════════════════════════════════════ */}
      {!loading && !error && viewMode === "list" && (
        <div className="flex flex-col gap-4">
          {/* Sub-tab navigation if user selected "Daily + Period" */}
          {attendType === "daily,period" && (
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setListSubTab("daily")}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  listSubTab === "daily"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <CalendarDays size={14} />
                <span>Daily Attendance</span>
                {summary.daily_count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10.5px] bg-white/20">
                    {summary.daily_count}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setListSubTab("period")}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  listSubTab === "period"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Clock size={14} />
                <span>Period Attendance</span>
                {summary.period_count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10.5px] bg-white/20">
                    {summary.period_count}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Render Active Table */}
          {attendType === "daily" ||
          (attendType === "daily,period" && listSubTab === "daily") ? (
            <StudentAttendanceDailyTable rows={dailyRows} />
          ) : (
            <StudentAttendancePeriodTable rows={periodRows} />
          )}
        </div>
      )}
    </div>
  );
}
