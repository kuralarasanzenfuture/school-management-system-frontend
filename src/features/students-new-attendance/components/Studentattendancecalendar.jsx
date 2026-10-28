/**
 * StudentAttendanceCalendar.jsx
 *
 * Big Calendar View (Matching User Reference Image):
 *  - Prominent summary counts for Present, Absent, Holiday, Late, Leave, Half Day, and Total
 *  - Big spacious grid cells (min-h-[145px]) with clean 1px interior borders
 *  - Monday-first layout: Mon, Tue, Wed, Thu, Fri, Sat, Sun
 *  - Day numbers placed in the top-left corner
 *  - "TODAY" highlighted with circular badge and text (e.g. "14 TODAY")
 *  - Soft pastel background tints on recorded days (soft green for Present, soft red for Absent, soft cyan for Holiday)
 *  - Diagonal stripe texture on weekend/empty days (like reference image)
 *  - Clean bordered event pills inside the cells
 *  - Interactive day inspection modal
 */
import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays,
  Palmtree,
  Umbrella,
  Layers,
  Sparkles,
} from "lucide-react";

const STATUS_CONFIG = {
  present: {
    cellBg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    pillClass:
      "border border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200",
    dotClass: "bg-emerald-500",
    label: "Present",
    badgeColor: "#10b981",
  },
  absent: {
    cellBg: "bg-rose-50/60 dark:bg-rose-950/25",
    pillClass:
      "border border-rose-500/60 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200",
    dotClass: "bg-rose-500",
    label: "Absent",
    badgeColor: "#f43f5e",
  },
  late: {
    cellBg: "bg-amber-50/50 dark:bg-amber-950/20",
    pillClass:
      "border border-amber-500/60 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200",
    dotClass: "bg-amber-500",
    label: "Late",
    badgeColor: "#f59e0b",
  },
  half_day: {
    cellBg: "bg-purple-50/50 dark:bg-purple-950/20",
    pillClass:
      "border border-purple-500/60 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200",
    dotClass: "bg-purple-500",
    label: "Half Day",
    badgeColor: "#a855f7",
  },
  leave: {
    cellBg: "bg-indigo-50/50 dark:bg-indigo-950/20",
    pillClass:
      "border border-indigo-500/60 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200",
    dotClass: "bg-indigo-500",
    label: "Leave",
    badgeColor: "#6366f1",
  },
  holiday: {
    cellBg: "bg-cyan-50/50 dark:bg-cyan-950/20",
    pillClass:
      "border border-cyan-500/60 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200",
    dotClass: "bg-cyan-500",
    label: "Holiday",
    badgeColor: "#06b6d4",
  },
};

// Monday-first header matching reference image
const WEEKDAYS_MON_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function StudentAttendanceCalendar({
  dailyData = [],
  periodData = [],
  year,
  month,
  onMonthChange,
}) {
  const [selectedDay, setSelectedDay] = useState(null);

  /* ─────────────────────────────────────────────────────────────
     1. Build Daily & Period Maps
  ───────────────────────────────────────────────────────────── */
  const dailyMap = useMemo(() => {
    const map = {};
    dailyData.forEach(({ date, records }) => {
      if (date) map[date] = records ?? [];
    });
    return map;
  }, [dailyData]);

  const periodMap = useMemo(() => {
    const map = {};
    periodData.forEach(({ date, periods }) => {
      if (date) {
        map[date] = (periods ?? []).flatMap(({ period_no, records }) =>
          (records ?? []).map((r) => ({ period_no, ...r }))
        );
      }
    });
    return map;
  }, [periodData]);

  /* ─────────────────────────────────────────────────────────────
     2. Comprehensive Attendance Counts for Present, Absent, Holiday, etc.
  ───────────────────────────────────────────────────────────── */
  const counts = useMemo(() => {
    const allDailyRecords = dailyData.flatMap((d) => d.records ?? []);

    // Filter counts based on daily records if available
    const cnt = (status) =>
      allDailyRecords.filter(
        (r) => String(r.status).toLowerCase() === status
      ).length;

    let present = cnt("present");
    let absent = cnt("absent");
    let holiday = cnt("holiday");
    let late = cnt("late");
    let leave = cnt("leave");
    let half_day = cnt("half_day");
    let totalDays = allDailyRecords.length;

    // If only periodData is present (no daily records), derive from period days
    if (totalDays === 0 && periodData.length > 0) {
      periodData.forEach(({ periods = [] }) => {
        const periodList = periods.flatMap((p) => p.records ?? []);
        if (periodList.length === 0) return;
        totalDays++;
        const anyAbsent = periodList.some(
          (r) => String(r.status).toLowerCase() === "absent"
        );
        const anyLate = periodList.some(
          (r) => String(r.status).toLowerCase() === "late"
        );
        const anyHoliday = periodList.some(
          (r) => String(r.status).toLowerCase() === "holiday"
        );
        const anyLeave = periodList.some(
          (r) => String(r.status).toLowerCase() === "leave"
        );

        if (anyAbsent) absent++;
        else if (anyHoliday) holiday++;
        else if (anyLeave) leave++;
        else if (anyLate) late++;
        else present++;
      });
    }

    const attendable = totalDays - holiday;
    const rate =
      attendable > 0
        ? Math.round(((present + half_day * 0.5 + late) / attendable) * 100)
        : totalDays > 0
        ? 100
        : 0;

    return {
      present,
      absent,
      holiday,
      late,
      leave,
      half_day,
      totalDays,
      rate,
    };
  }, [dailyData, periodData]);

  /* ─────────────────────────────────────────────────────────────
     3. 35 or 42 Cell Grid with Monday as First Day
  ───────────────────────────────────────────────────────────── */
  const calendarCells = useMemo(() => {
    const firstDayDate = new Date(year, month, 1);
    // (getDay() + 6) % 7 maps Sun(0) -> 6, Mon(1) -> 0, Tue(2) -> 1, ..., Sat(6) -> 5
    const firstDayMonIdx = (firstDayDate.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // Prior month trailing days
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    for (let i = firstDayMonIdx - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const dateStr = `${prevYear}-${pad(prevMonthIdx + 1)}-${pad(d)}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        dayOfWeek: (cells.length) % 7,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        dayOfWeek: (cells.length) % 7,
      });
    }

    // Next month days to complete 35 or 42 cells
    const totalCurrent = cells.length;
    const totalGrid = totalCurrent <= 35 ? 35 : 42;
    const remaining = totalGrid - totalCurrent;

    const nextYear = month === 11 ? year + 1 : year;
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    for (let d = 1; d <= remaining; d++) {
      const dateStr = `${nextYear}-${pad(nextMonthIdx + 1)}-${pad(d)}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        dayOfWeek: (cells.length) % 7,
      });
    }

    return cells;
  }, [year, month]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }, []);

  const isCurrentMonthNow = useMemo(() => {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() === month;
  }, [year, month]);

  const handlePrev = () => {
    const d = new Date(year, month - 1, 1);
    onMonthChange(d.getFullYear(), d.getMonth());
  };

  const handleNext = () => {
    const d = new Date(year, month + 1, 1);
    onMonthChange(d.getFullYear(), d.getMonth());
  };

  const handleTodayJump = () => {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth());
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ══════════════════════════════════════════════════════════
          1. PROMINENT ATTENDANCE STATS CARDS (Counts for All Statuses)
      ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Present Card */}
        <div className="sd-cal-stat-card border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Present
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[26px] font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
              {counts.present}
            </span>
            <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
        </div>

        {/* Absent Card */}
        <div className="sd-cal-stat-card border-l-4 border-l-rose-500 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Absent
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[26px] font-extrabold text-rose-600 dark:text-rose-400 leading-none">
              {counts.absent}
            </span>
            <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
        </div>

        {/* Holiday Card */}
        <div className="sd-cal-stat-card border-l-4 border-l-cyan-500 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Holiday
            </span>
            <div className="w-6 h-6 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <CalendarDays size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[26px] font-extrabold text-cyan-600 dark:text-cyan-400 leading-none">
              {counts.holiday}
            </span>
            <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
        </div>

        {/* Late Card */}
        <div className="sd-cal-stat-card border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Late
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[26px] font-extrabold text-amber-600 dark:text-amber-400 leading-none">
              {counts.late}
            </span>
            <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
        </div>

        {/* Leave / Half Day Card */}
        <div className="sd-cal-stat-card border-l-4 border-l-indigo-500 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Leave / Half
            </span>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Umbrella size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[26px] font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">
              {counts.leave + counts.half_day}
            </span>
            <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
        </div>

        {/* Total Days & Rate Card */}
        <div className="sd-cal-stat-card border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total / Rate
            </span>
            <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-1">
            <span className="text-[26px] font-extrabold text-slate-800 dark:text-slate-100 leading-none">
              {counts.totalDays}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40">
              {counts.rate}%
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. BIG CALENDAR CARD (Matching User Reference Image)
      ══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
        {/* Header Bar with Month Title & Arrows */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div>
            <h3 className="text-[17px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>{MONTH_NAMES[month]} {year}</span>
              {isCurrentMonthNow && (
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Current Month
                </span>
              )}
            </h3>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
              Click on any day to inspect full attendance records and period logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {!isCurrentMonthNow && (
              <button
                type="button"
                onClick={handleTodayJump}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="overflow-x-auto w-full">
          <div className="min-w-[840px] w-full">
            {/* Weekday Header Row (Mon, Tue, Wed, Thu, Fri, Sat, Sun) */}
            <div className="grid grid-cols-7 bg-[#f0f2f5] dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">
              {WEEKDAYS_MON_FIRST.map((dayName) => (
                <div
                  key={dayName}
                  className={`py-3 px-3 text-center text-[13px] font-semibold border-r border-slate-200/80 dark:border-slate-700/80 last:border-r-0 ${
                    dayName === "Sun"
                      ? "text-red-600 dark:text-red-400 font-bold bg-red-100/60 dark:bg-red-950/40"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Big Calendar Grid (Cells min-h-[145px]) */}
            <div className="grid grid-cols-7 border-l border-slate-200 dark:border-slate-800">
              {calendarCells.map((cell, idx) => {
                const { dayNumber, dateStr, isCurrentMonth, dayOfWeek } = cell;
                const isToday = dateStr === todayStr;

                const dailyRecords = dailyMap[dateStr] || [];
                const periodRecords = periodMap[dateStr] || [];
                const hasRecords =
                  dailyRecords.length > 0 || periodRecords.length > 0;

                // Primary daily status if present
                const dailyStatus = dailyRecords[0]?.status
                  ? String(dailyRecords[0].status).toLowerCase()
                  : null;
                const dailyCfg = dailyStatus
                  ? STATUS_CONFIG[dailyStatus] || STATUS_CONFIG.present
                  : null;

                // Period status if only period records exist
                const totalPeriods = periodRecords.length;
                const presentPeriods = periodRecords.filter(
                  (p) => String(p.status).toLowerCase() === "present"
                ).length;

                // Weekend checks (Mon-first: Sat=5, Sun=6)
                const isSunday = dayOfWeek === 6;
                const isSaturday = dayOfWeek === 5;

                // Cell background styling: Sunday is full red; Saturday and weekdays are clean (no stripe shade)
                let cellBgClass = "";
                if (dailyCfg) {
                  cellBgClass = dailyCfg.cellBg;
                } else if (totalPeriods > 0) {
                  cellBgClass = "bg-blue-50/40 dark:bg-blue-950/20";
                } else if (isSunday) {
                  // Full red color for Sunday
                  cellBgClass = isCurrentMonth
                    ? "sd-sunday-cell"
                    : "sd-sunday-cell-dim";
                } else if (!isCurrentMonth) {
                  cellBgClass = "bg-slate-50/30 dark:bg-slate-950/20";
                } else {
                  // Clean white for Saturday and all standard days (no stripes)
                  cellBgClass = "bg-white dark:bg-slate-900";
                }

                return (
                  <div
                    key={`${dateStr}-${idx}`}
                    onClick={() => {
                      if (hasRecords) {
                        setSelectedDay({
                          date: dateStr,
                          daily: dailyRecords,
                          periods: periodRecords,
                        });
                      }
                    }}
                    className={`min-h-[140px] md:min-h-[155px] p-2.5 flex flex-col justify-between border-r border-b border-slate-200 dark:border-slate-800 transition-colors relative group ${cellBgClass} ${
                      hasRecords ? "cursor-pointer hover:shadow-xs" : ""
                    }`}
                  >
                    {/* Top-Left: Day Number & Today Badge */}
                    <div className="flex items-center gap-1.5 pl-0.5 pt-0.5">
                      {isToday ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-[12px] flex items-center justify-center shadow-xs">
                            {dayNumber}
                          </span>
                          <span className="text-[10px] font-extrabold tracking-wider text-rose-500 uppercase">
                            TODAY
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`text-[13.5px] font-semibold ${
                            isSunday
                              ? isCurrentMonth
                                ? "text-red-600 dark:text-red-400 font-bold"
                                : "text-red-400/70 dark:text-red-500/50"
                              : isCurrentMonth
                              ? "text-slate-700 dark:text-slate-200"
                              : "text-slate-300 dark:text-slate-600 font-normal"
                          }`}
                        >
                          {dayNumber}
                        </span>
                      )}
                    </div>

                    {/* Middle: Attendance Pills */}
                    <div className="flex-1 flex flex-col gap-1.5 justify-center py-2">
                      {/* Daily Record Pill */}
                      {dailyStatus && dailyCfg && (
                        <div
                          className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition-all shadow-2xs flex items-center justify-between gap-1.5 ${dailyCfg.pillClass}`}
                          title={`Daily Status: ${dailyCfg.label}${
                            dailyRecords[0]?.remarks
                              ? ` (${dailyRecords[0].remarks})`
                              : ""
                          }`}
                        >
                          <span className="truncate flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${dailyCfg.dotClass}`}
                            />
                            <span>{dailyCfg.label}</span>
                          </span>
                          {dailyRecords[0]?.class_name && (
                            <span className="text-[10px] opacity-75 font-normal truncate">
                              {dailyRecords[0].class_name}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Period Records Pill */}
                      {totalPeriods > 0 && (
                        <div
                          className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border border-blue-500/50 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 transition-all shadow-2xs flex items-center justify-between gap-1.5"
                          title={`${presentPeriods} of ${totalPeriods} periods attended`}
                        >
                          <span className="truncate flex items-center gap-1.5">
                            <Clock size={11} className="text-blue-500" />
                            <span>
                              {presentPeriods}/{totalPeriods} Periods
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Subtle Inspection Hint */}
                    {hasRecords && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold text-right pr-0.5">
                        Details →
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          3. DAY INSPECTION MODAL (Full Details on Click)
      ══════════════════════════════════════════════════════════ */}
      {selectedDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="sd-att-table-card rounded-2xl w-full max-w-lg p-5 max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col gap-4 border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">
                    {fmtDate(selectedDay.date)}
                  </h3>
                  <p className="text-[11.5px] text-slate-400">
                    Complete attendance report for this date
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Daily Attendance Details */}
            {selectedDay.daily.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400">
                  Daily Attendance
                </p>
                {selectedDay.daily.map((r, i) => {
                  const st = String(r.status).toLowerCase();
                  const cfg = STATUS_CONFIG[st] || STATUS_CONFIG.present;
                  return (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border ${cfg.pillClass} flex flex-col gap-1.5`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[13px] font-bold">
                          <span
                            className={`w-2 h-2 rounded-full ${cfg.dotClass}`}
                          />
                          <span className="capitalize">{cfg.label}</span>
                        </span>
                        <span className="text-[12px] font-medium opacity-80">
                          {r.class_name} {r.section_name ? `— ${r.section_name}` : ""}
                        </span>
                      </div>
                      {r.marked_by && (
                        <p className="text-[11.5px] opacity-80">
                          Marked by:{" "}
                          <span className="font-semibold">{r.marked_by}</span>
                        </p>
                      )}
                      {r.remarks && (
                        <p className="text-[11.5px] opacity-80 italic">
                          Remarks: {r.remarks}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Period Breakdown */}
            {selectedDay.periods.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <p className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400">
                  Period Breakdown ({selectedDay.periods.length} Periods)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedDay.periods.map((p, i) => {
                    const st = String(p.status).toLowerCase();
                    const cfg = STATUS_CONFIG[st] || STATUS_CONFIG.present;
                    return (
                      <div
                        key={i}
                        className="sd-expandable-card p-3 rounded-xl flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <Clock size={12} className="text-indigo-500" />
                            Period {p.period_no}
                          </span>
                          <span
                            className={`sd-att-status sd-att-status-${st} text-[10.5px] py-0.5 px-2`}
                          >
                            {p.status?.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {p.marked_by && <p>Teacher: {p.marked_by}</p>}
                          {p.remarks && <p className="italic">"{p.remarks}"</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}