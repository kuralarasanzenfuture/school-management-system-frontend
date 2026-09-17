import React, { useState, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Users,
  Clock,
  Coffee,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { getImageUrl } from "../../../../common/utils/imageUrl.js";
import Pagination from "../../../../common/components/table/Pagination.jsx";
import "../styles/EmployeeAttendance.css";

// Status code badge styles according to standardized protocol and application palette
export const STATUS_CONFIG = {
  P: {
    code: "P",
    name: "Present",
    bgColor: "bg-emerald-500",
    textColor: "text-white",
    badgeBorder: "border-emerald-200 dark:border-emerald-800",
    cellBg: "bg-emerald-50/40 dark:bg-emerald-950/20",
    summaryText: "text-emerald-700 dark:text-emerald-400",
    summaryBg: "bg-emerald-50/70 dark:bg-emerald-950/30",
  },
  A: {
    code: "A",
    name: "Absent",
    bgColor: "bg-rose-500",
    textColor: "text-white",
    badgeBorder: "border-rose-200 dark:border-rose-800",
    cellBg: "bg-rose-50/40 dark:bg-rose-950/20",
    summaryText: "text-rose-700 dark:text-rose-400",
    summaryBg: "bg-rose-50/70 dark:bg-rose-950/30",
  },
  L: {
    code: "L",
    name: "Late",
    bgColor: "bg-amber-500",
    textColor: "text-white",
    badgeBorder: "border-amber-200 dark:border-amber-800",
    cellBg: "bg-amber-50/40 dark:bg-amber-950/20",
    summaryText: "text-amber-700 dark:text-amber-400",
    summaryBg: "bg-amber-50/70 dark:bg-amber-950/30",
  },
  HD: {
    code: "HD",
    name: "Half Day",
    bgColor: "bg-purple-500",
    textColor: "text-white",
    badgeBorder: "border-purple-200 dark:border-purple-800",
    cellBg: "bg-purple-50/40 dark:bg-purple-950/20",
    summaryText: "text-purple-700 dark:text-purple-400",
    summaryBg: "bg-purple-50/70 dark:bg-purple-950/30",
  },
  LV: {
    code: "LV",
    name: "Leave",
    bgColor: "bg-[#3949ab]",
    textColor: "text-white",
    badgeBorder: "border-indigo-200 dark:border-indigo-800",
    cellBg: "bg-indigo-50/40 dark:bg-indigo-950/20",
    summaryText: "text-indigo-700 dark:text-indigo-400",
    summaryBg: "bg-indigo-50/70 dark:bg-indigo-950/30",
  },
  H: {
    code: "H",
    name: "Holiday",
    bgColor: "bg-cyan-500",
    textColor: "text-white",
    badgeBorder: "border-cyan-200 dark:border-cyan-800",
    cellBg: "bg-cyan-50/50 dark:bg-cyan-950/20",
    summaryText: "text-cyan-700 dark:text-cyan-400",
    summaryBg: "bg-cyan-50/70 dark:bg-cyan-950/30",
  },
  WO: {
    code: "WO",
    name: "Week Off",
    bgColor: "bg-slate-300 dark:bg-slate-600",
    textColor: "text-slate-700 dark:text-slate-200",
    badgeBorder: "border-slate-300 dark:border-slate-700",
    cellBg: "bg-[var(--input-bg)]/50",
    summaryText: "text-slate-600 dark:text-slate-400",
    summaryBg: "bg-[var(--input-bg)]",
  },
  "-": {
    code: "-",
    name: "Unrecorded",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    textColor: "text-slate-400 dark:text-slate-500",
    badgeBorder: "border-slate-200 dark:border-slate-700",
    cellBg: "bg-transparent",
    summaryText: "text-slate-400",
    summaryBg: "bg-[var(--input-bg)]/40",
  },
};

// Map attendance status string from DB to code
export function mapStatusToCode(status) {
  if (!status) return "-";
  const s = String(status).toLowerCase().trim();
  switch (s) {
    case "present":
      return "P";
    case "absent":
      return "A";
    case "late":
      return "L";
    case "half_day":
    case "half day":
    case "halfday":
      return "HD";
    case "leave":
    case "on_leave":
      return "LV";
    case "holiday":
      return "H";
    case "week_off":
    case "week off":
    case "weekoff":
      return "WO";
    default:
      return "-";
  }
}

// Generate avatar initials from name
function getInitials(name) {
  if (!name) return "EM";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Palette of background colors for employee avatar badges matching application tone
const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
  "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
  "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
  "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800",
];

// 12-hour time formatter (e.g. "09:00" -> "9:00 AM")
function formatTime12h(timeStr) {
  if (!timeStr) return null;
  let t = String(timeStr).trim();
  if (t.includes("T")) t = t.split("T")[1];
  if (t.includes(" ")) {
    const parts = t.split(" ");
    t = parts[parts.length - 1];
  }
  const parts = t.split(":");
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  if (isNaN(hour)) return timeStr;
  const min = parts[1].padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${min} ${ampm}`;
}

// Attendance Hover Card component
function AttendanceHoverCard({ data }) {
  if (!data) return null;
  const { emp, d, cell, cfg, rect } = data;

  const isAbove = rect.top > 230;
  const cardWidth = 270;

  // Viewport bounds clamping
  const badgeCenterX = rect.left + rect.width / 2;
  const idealLeft = badgeCenterX - cardWidth / 2;
  const clampedLeft = Math.max(12, Math.min(window.innerWidth - cardWidth - 12, idealLeft));
  const arrowOffset = Math.max(16, Math.min(cardWidth - 16, badgeCenterX - clampedLeft));

  const checkIn = cell?.check_in_time
    ? formatTime12h(cell.check_in_time)
    : cell?.check_in
    ? formatTime12h(cell.check_in)
    : null;
  const checkOut = cell?.check_out_time
    ? formatTime12h(cell.check_out_time)
    : cell?.check_out
    ? formatTime12h(cell.check_out)
    : null;

  const workHours =
    cell?.total_work_hours && Number(cell.total_work_hours) > 0
      ? `${cell.total_work_hours} hrs`
      : null;
  const lateMinutes =
    cell?.late_minutes && Number(cell.late_minutes) > 0 ? Number(cell.late_minutes) : null;
  const otMinutes =
    cell?.overtime_minutes && Number(cell.overtime_minutes) > 0
      ? Number(cell.overtime_minutes)
      : null;

  const dateFormatted = d?.date
    ? new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div
      className="fixed z-[9999] pointer-events-none transition-all duration-150 ease-out"
      style={{
        left: `${clampedLeft}px`,
        top: isAbove ? `${rect.top - 10}px` : `${rect.bottom + 10}px`,
        transform: isAbove ? "translateY(-100%)" : "translateY(0)",
        width: `${cardWidth}px`,
      }}
    >
      <div className="bg-[var(--panel-bg)] text-[var(--text-primary)] rounded-2xl p-3.5 shadow-2xl border border-[var(--divider)] backdrop-blur-md text-xs relative select-none">
        {/* Top Header: Status badge & formatted date */}
        <div className="flex items-center justify-between gap-2 border-b border-[var(--divider)] pb-2.5 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-6 h-6 rounded-lg font-black flex items-center justify-center text-[11px] shadow-2xs ${cfg.bgColor} ${cfg.textColor}`}
            >
              {cfg.code}
            </span>
            <span className="font-bold text-xs ea-cell-primary">{cfg.name}</span>
          </div>
          <span className="text-[10.5px] font-semibold ea-cell-muted">
            {dateFormatted}
          </span>
        </div>

        {/* Employee Info */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
            {getInitials(emp.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold ea-cell-primary truncate leading-tight">{emp.name}</p>
            <p className="text-[10.5px] ea-cell-muted truncate">
              {emp.employee_code} {emp.designation ? `• ${emp.designation}` : emp.department ? `• ${emp.department}` : ""}
            </p>
          </div>
        </div>

        {/* Attendance Stats Summary Box */}
        <div className="bg-[var(--input-bg)]/80 rounded-xl p-2.5 border border-[var(--input-border)] space-y-1.5 text-[11px]">
          {/* Check-In / Check-Out */}
          <div className="flex items-center justify-between">
            <span className="ea-cell-muted flex items-center gap-1 text-[10.5px]">
              <Clock size={12} className="text-slate-400 shrink-0" />
              Check In / Out
            </span>
            <span className="font-semibold ea-cell-primary text-[11px]">
              {checkIn || checkOut ? (
                <span>
                  {checkIn || "--:--"} <span className="text-slate-400 mx-1">→</span> {checkOut || "--:--"}
                </span>
              ) : (
                <span className="ea-cell-muted italic text-[10.5px]">
                  {cfg.code === "WO" ? "Scheduled Weekend" : cfg.code === "H" ? "Official Holiday" : "No punch log"}
                </span>
              )}
            </span>
          </div>

          {/* Work Hours */}
          {workHours && (
            <div className="flex items-center justify-between">
              <span className="ea-cell-muted text-[10.5px]">Work Duration</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {workHours}
              </span>
            </div>
          )}

          {/* Late / OT Chips */}
          {(lateMinutes || otMinutes) && (
            <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
              {lateMinutes && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                  ⚠️ Late: {lateMinutes}m
                </span>
              )}
              {otMinutes && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold">
                  ⚡ OT: {(otMinutes / 60).toFixed(1)}h
                </span>
              )}
            </div>
          )}

          {/* Shift */}
          {cell?.shift_name && (
            <div className="flex items-center justify-between pt-0.5 text-[10.5px]">
              <span className="ea-cell-muted">Shift</span>
              <span className="font-medium ea-cell-secondary truncate max-w-[140px]">
                {cell.shift_name}
              </span>
            </div>
          )}

          {/* Remarks / Reason */}
          {cell?.remarks && (
            <div className="pt-1 border-t border-[var(--divider)] text-[10.5px]">
              <span className="ea-cell-muted font-medium">Remarks: </span>
              <span className="font-medium ea-cell-primary italic">{cell.remarks}</span>
            </div>
          )}
        </div>

        {/* Quick Hint */}
        <div className="mt-2 text-center text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
          Click badge to edit attendance
        </div>

        {/* Pointer Arrow */}
        <div
          className={`absolute w-2.5 h-2.5 bg-[var(--panel-bg)] border-[var(--divider)] rotate-45 ${
            isAbove ? "bottom-[-5px] border-b border-r" : "top-[-5px] border-t border-l"
          }`}
          style={{ left: `${arrowOffset}px` }}
        />
      </div>
    </div>
  );
}

export default function AttendanceMatrix({
  matrixData,
  loading = false,
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear(),
  onMonthChange,
  weekStartDate,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  viewMode = "monthly",
  onViewModeChange,
  departments = [],
  selectedDepartment = "",
  onDepartmentChange,
  searchQuery = "",
  onSearchChange,
  schools = [],
  selectedSchool = "",
  onSchoolChange,
  isAdmin = false,
  shifts = [],
  selectedShift = "",
  onShiftChange,
  onCellClick,
  onBulkMark,
  todayAttendanceSummary,
  allEmployees = [],
  records = [],
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Format month and year label (e.g. "September, 2026")
  const monthName = useMemo(() => {
    const d = new Date(year, month - 1, 1);
    return d.toLocaleString("default", { month: "long" });
  }, [month, year]);

  // Format weekly label (e.g. "Wk 38: Sep 14 – Sep 20, 2026")
  const weekDisplayLabel = useMemo(() => {
    if (matrixData?.week_label) {
      return matrixData.week_number
        ? `Wk ${matrixData.week_number}: ${matrixData.week_label}`
        : matrixData.week_label;
    }
    const todayStr = new Intl.DateTimeFormat("en-CA").format(new Date());
    const ref = weekStartDate || todayStr;
    const s = new Date(`${ref}T00:00:00`);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    const sStr = s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const eStr = e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${sStr} – ${eStr}`;
  }, [matrixData, weekStartDate]);

  // Handle previous and next month navigation
  const handlePrevMonth = () => {
    if (onMonthChange) {
      let newMonth = month - 1;
      let newYear = year;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      onMonthChange(newMonth, newYear);
    }
  };

  const handleNextMonth = () => {
    if (onMonthChange) {
      let newMonth = month + 1;
      let newYear = year;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      onMonthChange(newMonth, newYear);
    }
  };

  // Build days_meta fallback if not yet returned from API
  const daysMeta = useMemo(() => {
    if (matrixData?.days_meta && Array.isArray(matrixData.days_meta)) {
      return matrixData.days_meta;
    }

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const shortDayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const todayStr = new Intl.DateTimeFormat("en-CA").format(new Date());

    if (viewMode === "weekly") {
      const ref = weekStartDate || todayStr;
      const start = new Date(`${ref}T00:00:00`);
      const result = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dayOfWeek = d.getDay();
        const dateFormatted = new Intl.DateTimeFormat("en-CA").format(d);
        result.push({
          day: d.getDate(),
          date: dateFormatted,
          day_name: dayNames[dayOfWeek],
          day_abbr: shortDayNames[dayOfWeek],
          day_of_week: dayOfWeek,
          is_weekend: dayOfWeek === 0 || dayOfWeek === 6,
          is_today: dateFormatted === todayStr,
        });
      }
      return result;
    }

    // Monthly fallback
    const daysInMonth = new Date(year, month, 0).getDate();
    const result = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month - 1, day);
      const dayOfWeek = d.getDay();
      const dateFormatted = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      result.push({
        day,
        date: dateFormatted,
        day_name: dayNames[dayOfWeek],
        day_abbr: shortDayNames[dayOfWeek],
        day_of_week: dayOfWeek,
        is_weekend: dayOfWeek === 0 || dayOfWeek === 6,
        is_today: dateFormatted === todayStr,
      });
    }
    return result;
  }, [matrixData, month, year, viewMode, weekStartDate]);

  // Combine matrix employees with client-side fallback
  const matrixEmployees = useMemo(() => {
    const empMap = new Map((allEmployees || []).map((emp) => [Number(emp.id), emp]));

    if (matrixData?.employees && Array.isArray(matrixData.employees)) {
      return matrixData.employees.map((emp) => {
        const fullEmp = empMap.get(Number(emp.employee_id || emp.id));
        return {
          ...emp,
          employee_id: emp.employee_id || emp.id,
          school_id: emp.school_id ?? fullEmp?.school_id,
          school_name: emp.school_name ?? fullEmp?.school_name,
        };
      });
    }

    if (!Array.isArray(allEmployees) || allEmployees.length === 0) {
      return [];
    }

    const attendanceMap = new Map();
    (records || []).forEach((row) => {
      const dateStr = String(row.attendance_date).slice(0, 10);
      attendanceMap.set(`${row.employee_id}_${dateStr}`, row);
    });

    return allEmployees.map((emp) => {
      const empAttendance = {};
      const summary = {
        present_days: 0,
        absent_days: 0,
        late_days: 0,
        half_days: 0,
        leave_days: 0,
        holiday_days: 0,
        week_off_days: 0,
        total_work_minutes: 0,
        total_work_hours: "0.00",
        total_overtime_minutes: 0,
        total_overtime_hours: "0.00",
        total_late_minutes: 0,
        attendance_percentage: "0%",
      };

      daysMeta.forEach((d) => {
        const row = attendanceMap.get(`${emp.id}_${d.date}`);
        if (row) {
          const code = mapStatusToCode(row.status);
          const workMin = row.total_work_minutes || 0;
          const otMin = row.overtime_minutes || 0;
          const lateMin = row.late_minutes || 0;

          summary.total_work_minutes += workMin;
          summary.total_overtime_minutes += otMin;
          summary.total_late_minutes += lateMin;

          const cellData = {
            id: row.id,
            attendance_date: d.date,
            status: row.status,
            code,
            shift_id: row.shift_id,
            shift_name: row.shift_name,
            check_in: row.check_in,
            check_out: row.check_out,
            check_in_time: row.check_in ? String(row.check_in).slice(11, 16) : null,
            check_out_time: row.check_out ? String(row.check_out).slice(11, 16) : null,
            total_work_minutes: workMin,
            total_work_hours: (workMin / 60).toFixed(1),
            overtime_minutes: otMin,
            late_minutes: lateMin,
            remarks: row.remarks || row.reason || null,
          };

          empAttendance[d.date] = cellData;
          empAttendance[d.day] = cellData;

          if (code === "P") summary.present_days++;
          else if (code === "A") summary.absent_days++;
          else if (code === "L") summary.late_days++;
          else if (code === "HD") summary.half_days++;
          else if (code === "LV") summary.leave_days++;
          else if (code === "H") summary.holiday_days++;
          else if (code === "WO") summary.week_off_days++;
        } else {
          const emptyCell = {
            id: null,
            attendance_date: d.date,
            status: null,
            code: "-",
            total_work_hours: "0.0",
            remarks: null,
          };
          empAttendance[d.date] = emptyCell;
          empAttendance[d.day] = emptyCell;
        }
      });

      summary.total_work_hours = (summary.total_work_minutes / 60).toFixed(1);
      summary.total_overtime_hours = (summary.total_overtime_minutes / 60).toFixed(1);

      const workingDays = daysMeta.filter((d) => !d.is_weekend).length || daysMeta.length;
      const presentEquiv = summary.present_days + summary.late_days + summary.half_days * 0.5;
      summary.attendance_percentage =
        workingDays > 0 ? `${Math.min(100, Math.round((presentEquiv / workingDays) * 100))}%` : "0%";

      return {
        employee_id: emp.id,
        employee_code: emp.employee_code,
        first_name: emp.first_name,
        last_name: emp.last_name,
        name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || emp.name,
        photo_url: emp.photo_url,
        designation: emp.designation,
        department: emp.department,
        school_id: emp.school_id,
        summary,
        attendance: empAttendance,
      };
    });
  }, [matrixData, allEmployees, records, daysMeta]);

  // Filter employees by department, school and search query
  const filteredEmployees = useMemo(() => {
    let list = matrixEmployees;

    if (selectedDepartment && selectedDepartment !== "All") {
      list = list.filter((e) => e.department === selectedDepartment);
    }

    if (isAdmin && selectedSchool) {
      list = list.filter((e) => {
        if (e.school_id != null && e.school_id !== "") {
          return String(e.school_id) === String(selectedSchool);
        }
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.designation?.toLowerCase().includes(q) ||
          e.employee_code?.toLowerCase().includes(q) ||
          e.department?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [matrixEmployees, selectedDepartment, selectedSchool, isAdmin, searchQuery]);

  // Paginated employees
  const totalEmployeesCount = filteredEmployees.length;
  const totalPages = Math.ceil(totalEmployeesCount / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  // Compute KPI statistics (Context-aware for Weekly vs Monthly)
  const kpiStats = useMemo(() => {
    let presentToday = 0;
    let absentToday = 0;
    let lateToday = 0;
    let halfDayToday = 0;
    let leaveToday = 0;
    let weekOffToday = 0;

    let periodPresentTotal = 0;
    let periodAbsences = 0;
    let periodLeaves = 0;
    let periodLates = 0;
    let periodHalfDays = 0;
    let periodTotalWorkMins = 0;
    let periodTotalOTMins = 0;

    const totalStaff = filteredEmployees.length || matrixEmployees.length || 1;
    const todayDate = new Intl.DateTimeFormat("en-CA").format(new Date());

    // Check if today falls within the active matrix days
    const hasTodayInPeriod = daysMeta.some((d) => d.date === todayDate || d.is_today);

    filteredEmployees.forEach((emp) => {
      // Single-day snapshot ONLY if today actually exists in this timeframe
      if (hasTodayInPeriod) {
        const todayCell = emp.attendance?.[todayDate];
        if (todayCell) {
          const code = todayCell.code || mapStatusToCode(todayCell.status);
          if (code === "P") presentToday++;
          else if (code === "A") absentToday++;
          else if (code === "L") lateToday++;
          else if (code === "HD") halfDayToday++;
          else if (code === "LV") leaveToday++;
          else if (code === "WO") weekOffToday++;
        }
      }

      // Aggregates across the active period (Weekly or Monthly)
      periodPresentTotal += emp.summary?.present_days || 0;
      periodAbsences += emp.summary?.absent_days || 0;
      periodLeaves += emp.summary?.leave_days || 0;
      periodLates += emp.summary?.late_days || 0;
      periodHalfDays += emp.summary?.half_days || 0;
      periodTotalWorkMins += emp.summary?.total_work_minutes || 0;
      periodTotalOTMins += emp.summary?.total_overtime_minutes || 0;
    });

    const todayRate = totalStaff > 0 ? ((presentToday / totalStaff) * 100).toFixed(1) : "0.0";
    const periodWorkHours = (periodTotalWorkMins / 60).toFixed(1);
    const periodOTHours = (periodTotalOTMins / 60).toFixed(1);

    // Calculate period average rate across staff
    let totalPct = 0;
    filteredEmployees.forEach((e) => {
      totalPct += parseFloat(e.summary?.attendance_percentage) || 0;
    });
    const periodAvgRate = filteredEmployees.length > 0 ? (totalPct / filteredEmployees.length).toFixed(1) : "0.0";

    return {
      hasTodayInPeriod,
      presentToday,
      totalStaff,
      todayRate,
      absentToday,
      leaveToday,
      absentAndLeave: absentToday + leaveToday,
      lateToday,
      halfDayToday,
      lateAndHalfDay: lateToday + halfDayToday,
      weekOffToday,
      // Period metrics (Weekly or Monthly):
      periodPresentTotal,
      periodAbsences,
      periodLeaves,
      periodLates,
      periodHalfDays,
      periodWorkHours,
      periodOTHours,
      periodAvgRate,
    };
  }, [filteredEmployees, matrixEmployees, daysMeta]);

  // Average attendance percentage across filtered employees
  const avgAttendancePercentage = useMemo(() => {
    if (filteredEmployees.length === 0) return "0.0%";
    let totalPct = 0;
    filteredEmployees.forEach((e) => {
      const pct = parseFloat(e.summary?.attendance_percentage) || 0;
      totalPct += pct;
    });
    return `${(totalPct / filteredEmployees.length).toFixed(1)}%`;
  }, [filteredEmployees]);

  // Export Matrix to CSV
  const handleExportCSV = () => {
    if (!filteredEmployees || filteredEmployees.length === 0) {
      alert("No attendance data to export.");
      return;
    }

    const isWeekly = viewMode === "weekly";
    const headers = [
      "Employee Code",
      "Employee Name",
      "Department",
      "Designation",
      ...daysMeta.map((d) => `"${d.day_name} (${d.date})"`),
      "Present (P)",
      "Absent (A)",
      "Late (L)",
      "Half Day (HD)",
      "Leave (LV)",
      "Holiday (H)",
      "Week Off (WO)",
      isWeekly ? "Work Hours" : "Total Work Hours",
      isWeekly ? "Overtime Hours" : "OT Hours",
      "Attendance %",
    ];

    const rows = filteredEmployees.map((emp) => {
      const dayCodes = daysMeta.map((d) => {
        const cell = emp.attendance?.[d.date] || emp.attendance?.[d.day];
        const code = cell?.code || "-";
        const hours = cell?.total_work_hours && Number(cell.total_work_hours) > 0 ? ` (${cell.total_work_hours}h)` : "";
        return `"${code}${hours}"`;
      });

      return [
        `"${emp.employee_code || ""}"`,
        `"${emp.name || ""}"`,
        `"${emp.department || ""}"`,
        `"${emp.designation || ""}"`,
        ...dayCodes,
        emp.summary?.present_days ?? 0,
        emp.summary?.absent_days ?? 0,
        emp.summary?.late_days ?? 0,
        emp.summary?.half_days ?? 0,
        emp.summary?.leave_days ?? 0,
        emp.summary?.holiday_days ?? 0,
        emp.summary?.week_off_days ?? 0,
        `"${emp.summary?.total_work_hours ?? "0.00"}"`,
        `"${emp.summary?.total_overtime_hours ?? "0.00"}"`,
        `"${emp.summary?.attendance_percentage ?? "0%"}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = isWeekly
      ? `Employee_Attendance_Weekly_${weekStartDate || "week"}.csv`
      : `Employee_Attendance_Matrix_${monthName}_${year}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isWeekly = viewMode === "weekly";

  return (
    <div className="space-y-6 w-full max-w-full min-w-0" data-purpose="attendance-matrix-dashboard">
      {/* ── Action & Header Bar ── */}
      <section
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0"
        data-purpose="page-title-and-actions"
      >
        <div className="min-w-0 flex-1">
          <h1 className="ea-title text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>{isWeekly ? "Weekly Attendance Roster" : "Employee Attendance Matrix"}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border shadow-2xs ea-avatar shrink-0">
              {isWeekly ? weekDisplayLabel : `${monthName} ${year}`}
            </span>
          </h1>
          <p className="ea-subtitle text-xs mt-1 truncate">
            {isWeekly
              ? "7-day staff schedule & timecard tracking with automated work hours, punctuality, and code mapping: [P], [A], [L], [HD], [LV], [H], [WO]"
              : "Daily roster status mapping with standardized code protocols: [P], [A], [L], [HD], [LV], [H], [WO]"}
          </p>
        </div>

        {/* Action Buttons: perfectly aligned horizontally on 1 row */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <button
            onClick={handleExportCSV}
            type="button"
            className="ea-btn-outline inline-flex items-center gap-2 font-medium text-xs px-3.5 py-2.5 rounded-xl transition shadow-2xs cursor-pointer whitespace-nowrap"
            title={isWeekly ? "Export weekly timecard to CSV" : "Export full roster matrix to CSV"}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onBulkMark}
            type="button"
            className="ea-btn-primary inline-flex items-center gap-2 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Log Bulk Attendance</span>
          </button>
        </div>
      </section>

      {/* ── 4 KPI Summary Cards (Context-aware: Weekly vs Monthly) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 w-full min-w-0" data-purpose="attendance-kpis">
        {/* KPI 1: Attendance Rate */}
        <div className="ea-stat-card rounded-2xl p-3 sm:p-3.5 min-h-[96px] sm:min-h-[102px] flex items-center justify-between transition-all duration-200 hover:shadow-md min-w-0 overflow-hidden">
          <div className="flex flex-col justify-between h-full min-w-0 overflow-hidden pr-2 flex-1">
            <span className="ea-stat-label text-xs font-semibold tracking-wide truncate">
              {isWeekly ? "Weekly Attendance Rate" : "Monthly Attendance Rate"}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1 sm:mt-1.5 min-w-0">
              <span className="ea-stat-value text-xl sm:text-2xl font-bold tracking-tight">
                {kpiStats.periodAvgRate}%
              </span>
              <span className="ea-cell-muted text-xs font-medium truncate">
                Avg Staff Rate
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 sm:mt-1.5 truncate min-w-0">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
              </svg>
              <span className="truncate min-w-0">
                {kpiStats.hasTodayInPeriod
                  ? `Today: ${kpiStats.presentToday}/${kpiStats.totalStaff} present (${kpiStats.todayRate}%)`
                  : `${kpiStats.periodPresentTotal} total present shifts`}
              </span>
            </span>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/80 flex items-center justify-center font-extrabold text-xs shadow-2xs shrink-0">
            P
          </div>
        </div>

        {/* KPI 2: Total Hours Logged */}
        <div className="ea-stat-card rounded-2xl p-3 sm:p-3.5 min-h-[96px] sm:min-h-[102px] flex items-center justify-between transition-all duration-200 hover:shadow-md min-w-0 overflow-hidden">
          <div className="flex flex-col justify-between h-full min-w-0 overflow-hidden pr-2 flex-1">
            <span className="ea-stat-label text-xs font-semibold tracking-wide truncate">
              {isWeekly ? "Weekly Hours Logged" : "Monthly Hours Logged"}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1 sm:mt-1.5 min-w-0">
              <span className="ea-stat-value text-xl sm:text-2xl font-bold tracking-tight">
                {kpiStats.periodWorkHours}h
              </span>
              <span className="ea-cell-muted text-xs font-medium truncate">
                cumulative
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 text-[11px] truncate min-w-0">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate min-w-0">
                +{kpiStats.periodOTHours}h overtime recorded
              </span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/80 flex items-center justify-center font-extrabold text-xs shadow-2xs shrink-0">
            <Clock size={16} />
          </div>
        </div>

        {/* KPI 3: Absences & Leaves */}
        <div className="ea-stat-card rounded-2xl p-3 sm:p-3.5 min-h-[96px] sm:min-h-[102px] flex items-center justify-between transition-all duration-200 hover:shadow-md min-w-0 overflow-hidden">
          <div className="flex flex-col justify-between h-full min-w-0 overflow-hidden pr-2 flex-1">
            <span className="ea-stat-label text-xs font-semibold tracking-wide truncate">
              {isWeekly ? "Absences & Leaves This Week" : "Monthly Leaves & Absences"}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1 sm:mt-1.5 min-w-0">
              <span className="ea-stat-value text-xl sm:text-2xl font-bold tracking-tight">
                {kpiStats.periodAbsences + kpiStats.periodLeaves}
              </span>
              <span className="ea-cell-muted text-xs font-medium truncate">
                days total
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 text-[11px] truncate min-w-0">
              <span className={`truncate min-w-0 ${kpiStats.periodAbsences > 0 ? "font-semibold text-rose-600 dark:text-rose-400" : "ea-cell-muted font-medium"}`}>
                {kpiStats.periodAbsences} Absent (A)
              </span>
              <span className="ea-cell-muted shrink-0">•</span>
              <span className={`truncate min-w-0 ${kpiStats.periodLeaves > 0 ? "font-semibold text-purple-600 dark:text-purple-400" : "ea-cell-muted font-medium"}`}>
                {kpiStats.periodLeaves} Leave (LV)
              </span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/80 flex items-center justify-center font-extrabold text-xs shadow-2xs shrink-0">
            LV
          </div>
        </div>

        {/* KPI 4: Late Arrivals & Half-Days */}
        <div className="ea-stat-card rounded-2xl p-3 sm:p-3.5 min-h-[96px] sm:min-h-[102px] flex items-center justify-between transition-all duration-200 hover:shadow-md min-w-0 overflow-hidden">
          <div className="flex flex-col justify-between h-full min-w-0 overflow-hidden pr-2 flex-1">
            <span className="ea-stat-label text-xs font-semibold tracking-wide truncate">
              {isWeekly ? "Late Arrivals & Half-Days" : "Monthly Late & Half-Days"}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1 sm:mt-1.5 min-w-0">
              <span className="ea-stat-value text-xl sm:text-2xl font-bold tracking-tight">
                {kpiStats.periodLates + kpiStats.periodHalfDays}
              </span>
              <span className="ea-cell-muted text-xs font-medium truncate">
                flagged
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 text-[11px] truncate min-w-0">
              <span className={`truncate min-w-0 ${kpiStats.periodLates > 0 ? "font-semibold text-amber-600 dark:text-amber-400" : "ea-cell-muted font-medium"}`}>
                {kpiStats.periodLates} Late (L)
              </span>
              <span className="ea-cell-muted shrink-0">•</span>
              <span className={`truncate min-w-0 ${kpiStats.periodHalfDays > 0 ? "font-semibold text-purple-600 dark:text-purple-400" : "ea-cell-muted font-medium"}`}>
                {kpiStats.periodHalfDays} Half Day (HD)
              </span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/80 flex items-center justify-center font-extrabold text-xs shadow-2xs shrink-0">
            L
          </div>
        </div>
      </section>

      {/* ── Main Matrix Container Card ── */}
      <section
        className="ea-table-card rounded-2xl flex flex-col overflow-hidden w-full max-w-full min-w-0 shadow-xs"
        data-purpose="attendance-calendar-card"
      >
        {/* ── Attendance Subheader: Row 1 - Timeframe Navigation & View Mode Switcher ── */}
        <div className="px-4 sm:px-5 py-3 border-b border-[var(--divider)] flex flex-wrap items-center justify-between gap-3 bg-[var(--panel-bg)] w-full min-w-0">
          {/* Left: Navigator (Weekly or Monthly) */}
          <div className="flex items-center gap-2">
            {isWeekly ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)] bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-2 py-1 shadow-2xs">
                  <button
                    onClick={onPrevWeek}
                    aria-label="Previous week"
                    className="ea-cell-muted hover:text-[var(--text-primary)] p-1 rounded-md transition cursor-pointer"
                    type="button"
                    title="Previous Week"
                  >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                  </button>
                  <span className="px-2 font-bold min-w-[155px] text-center ea-cell-primary select-none">
                    {weekDisplayLabel}
                  </span>
                  <button
                    onClick={onNextWeek}
                    aria-label="Next week"
                    className="ea-cell-muted hover:text-[var(--text-primary)] p-1 rounded-md transition cursor-pointer"
                    type="button"
                    title="Next Week"
                  >
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </button>
                </div>
                {onCurrentWeek && (
                  <button
                    onClick={onCurrentWeek}
                    type="button"
                    className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] hover:bg-[var(--panel-bg)] text-[var(--text-primary)] transition shadow-2xs cursor-pointer"
                    title="Jump to current week"
                  >
                    This Week
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)] bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-2 py-1 shadow-2xs">
                <button
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="ea-cell-muted hover:text-[var(--text-primary)] p-1 rounded-md transition cursor-pointer"
                  type="button"
                >
                  <ChevronLeft size={14} strokeWidth={2.5} />
                </button>
                <span className="px-2 font-bold min-w-[110px] text-center ea-cell-primary select-none">
                  {monthName}, {year}
                </span>
                <button
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="ea-cell-muted hover:text-[var(--text-primary)] p-1 rounded-md transition cursor-pointer"
                  type="button"
                >
                  <ChevronRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>

          {/* Right: View Mode switcher buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-1 bg-[var(--input-bg)] rounded-xl border border-[var(--input-border)] text-xs font-medium text-[var(--text-muted)] shadow-2xs">
              <button
                onClick={() => onViewModeChange && onViewModeChange("daily")}
                className={`px-3.5 py-1 rounded-lg transition font-medium cursor-pointer ${
                  viewMode === "daily" ? "ea-btn-primary font-semibold shadow-xs" : "hover:text-[var(--text-primary)]"
                }`}
                type="button"
              >
                Daily
              </button>
              <button
                onClick={() => onViewModeChange && onViewModeChange("weekly")}
                className={`px-3.5 py-1 rounded-lg transition font-medium cursor-pointer ${
                  viewMode === "weekly" ? "ea-btn-primary font-semibold shadow-xs" : "hover:text-[var(--text-primary)]"
                }`}
                type="button"
              >
                Weekly
              </button>
              <button
                onClick={() => onViewModeChange && onViewModeChange("monthly")}
                className={`px-3.5 py-1 rounded-lg transition font-medium cursor-pointer ${
                  viewMode === "monthly" ? "ea-btn-primary font-semibold shadow-xs" : "hover:text-[var(--text-primary)]"
                }`}
                type="button"
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        {/* ── Attendance Subheader: Row 2 - Staff Scope Filters & Search Input ── */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-[var(--divider)] flex flex-wrap items-center justify-between gap-3 bg-[var(--input-bg)]/35 w-full min-w-0">
          {/* Left: School and Department Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider ea-cell-muted flex items-center gap-1">
              <Filter size={12} /> Filter:
            </span>

            {/* School filter (Admin) */}
            {isAdmin && schools.length > 0 && (
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedSchool ? String(selectedSchool) : ""}
                  onChange={(e) => {
                    onSchoolChange && onSchoolChange(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="ea-input rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer shadow-2xs"
                >
                  <option value="">All Schools ({schools.length})</option>
                  {schools.map((sc) => (
                    <option key={sc.id} value={String(sc.id)}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Department Filter */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    onDepartmentChange && onDepartmentChange(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="ea-input rounded-xl pl-3 pr-8 py-1.5 text-xs font-medium appearance-none cursor-pointer shadow-2xs"
                >
                  <option value="">All Departments ({departments.length || "10"})</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <svg
                  className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-2.5 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Right: Search Input */}
          <div className="relative w-52 sm:w-64">
            <Search size={13} className="absolute left-3.5 top-2.5 ea-search-icon pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange && onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search staff, role..."
              className="ea-input w-full pl-10 pr-3 py-1.5 text-xs rounded-xl shadow-2xs"
            />
          </div>
        </div>

        {/* ── Attendance Legend mapped to Code System ── */}
        <div className="px-4 sm:px-6 py-2.5 bg-[var(--input-bg)]/60 border-b border-[var(--divider)] flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px] ea-cell-secondary select-none w-full min-w-0">
          <span className="ea-cell-muted font-bold uppercase tracking-wider text-[10px]">
            Status Code Mapping:
          </span>

          <div className="inline-flex items-center gap-1.5 bg-[var(--panel-bg)] px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
            <span className="w-4 h-4 rounded bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">
              P
            </span>
            <span className="font-medium ea-cell-primary">Present</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[var(--panel-bg)] px-2.5 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800/60 shadow-2xs">
            <span className="w-4 h-4 rounded bg-rose-500 text-white font-bold flex items-center justify-center text-[10px]">
              A
            </span>
            <span className="font-medium ea-cell-primary">Absent</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[var(--panel-bg)] px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/60 shadow-2xs">
            <span className="w-4 h-4 rounded bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
              L
            </span>
            <span className="font-medium ea-cell-primary">Late</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[var(--panel-bg)] px-2.5 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800/60 shadow-2xs">
            <span className="w-4 h-4 rounded bg-purple-500 text-white font-bold flex items-center justify-center text-[10px]">
              HD
            </span>
            <span className="font-medium ea-cell-primary">Half Day</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[var(--panel-bg)] px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 shadow-2xs">
            <span className="w-4 h-4 rounded bg-[#3949ab] text-white font-bold flex items-center justify-center text-[10px]">
              LV
            </span>
            <span className="font-medium ea-cell-primary">Leave</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[var(--panel-bg)] px-2.5 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-800/60 shadow-2xs">
            <span className="w-4 h-4 rounded bg-cyan-500 text-white font-bold flex items-center justify-center text-[10px]">
              H
            </span>
            <span className="font-medium ea-cell-primary">Holiday</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[var(--panel-bg)] px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-[10px]">
              WO
            </span>
            <span className="font-medium ea-cell-primary">Week Off</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[var(--panel-bg)] px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold flex items-center justify-center text-[10px]">
              -
            </span>
            <span className="font-medium ea-cell-muted">Unrecorded</span>
          </div>
        </div>

        {/* ── Attendance Matrix Table ── */}
        <div
          className="overflow-x-auto relative flex-1 w-full max-w-full min-w-0 [scrollbar-width:thin]"
          data-purpose="attendance-matrix-table"
          onScroll={() => setHoveredCell(null)}
        >
          {loading ? (
            <div className="p-16 text-center ea-cell-muted">
              <div className="inline-block animate-spin w-8 h-8 border-3 border-[var(--btn-bg)] border-t-transparent rounded-full mb-3" />
              <p className="text-sm font-medium">Loading Attendance Matrix...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-16 text-center ea-cell-muted">
              <Users size={32} className="mx-auto text-[var(--text-muted)] mb-2 opacity-50" />
              <p className="text-sm font-semibold ea-cell-primary">No employees found</p>
              <p className="text-xs ea-cell-muted mt-1">Try changing department or search filters.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs min-w-[1250px]">
              {/* Table Header */}
              <thead>
                <tr className="ea-thead border-b border-[var(--divider)] text-[11px] font-semibold select-none">
                  {/* Sticky Employee Info Column */}
                  <th
                    className="sticky left-0 z-20 bg-[var(--input-bg)] backdrop-blur px-5 py-3 w-64 font-bold uppercase tracking-wider ea-cell-secondary border-r border-[var(--divider)] shadow-[2px_0_5px_rgba(0,0,0,0.02)]"
                    scope="col"
                  >
                    <div className="flex items-center gap-2">
                      <Users size={14} className="ea-cell-muted" />
                      <span>Employee Name &amp; Role</span>
                    </div>
                  </th>

                  {/* Day Columns */}
                  {daysMeta.map((d) => {
                    const isWeekend = d.is_weekend;
                    const isToday = d.is_today;

                    if (isWeekly) {
                      return (
                        <th
                          key={d.date || d.day}
                          className={`py-3 px-2 text-center w-36 border-r border-[var(--divider)] transition ${
                            isToday
                              ? "bg-indigo-50/90 dark:bg-indigo-950/60 text-[#1a237e] dark:text-indigo-300 font-bold shadow-xs"
                              : isWeekend
                              ? "bg-[var(--input-bg)]/80 ea-cell-muted"
                              : "ea-cell-secondary"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                isToday ? "text-[#1a237e] dark:text-indigo-300 font-extrabold" : "ea-cell-muted"
                              }`}
                            >
                              {d.day_name}
                            </span>
                            <span
                              className={`text-sm font-extrabold mt-0.5 ${
                                isToday ? "text-[#1a237e] dark:text-indigo-200" : "ea-cell-primary"
                              }`}
                            >
                              {new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            {isToday && (
                              <span className="text-[9px] bg-[#1a237e] text-white font-bold px-1.5 py-0.2 rounded-full mt-0.5 shadow-2xs">
                                TODAY
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    }

                    // Monthly compact day column
                    return (
                      <th
                        key={d.date || d.day}
                        className={`p-1.5 text-center w-8 font-semibold border-r border-[var(--divider)] ${
                          isToday
                            ? "bg-indigo-50/80 dark:bg-indigo-950/40 text-[#1a237e] dark:text-indigo-300 font-bold"
                            : isWeekend
                            ? "bg-[var(--input-bg)]/70 ea-cell-muted"
                            : "ea-cell-secondary"
                        }`}
                      >
                        <span
                          className={`block text-[9px] uppercase ${
                            isToday ? "text-[#1a237e] dark:text-indigo-300 font-bold" : "ea-cell-muted"
                          }`}
                        >
                          {d.day_name ? d.day_name.slice(0, 2) : "Dy"}
                        </span>
                        <span>{String(d.day).padStart(2, "0")}</span>
                      </th>
                    );
                  })}

                  {/* Summary Columns */}
                  <th
                    className="p-2 text-center w-12 font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 border-l border-[var(--divider)]"
                    title="Total Present Days"
                  >
                    <span className="w-[26px] h-[26px] mx-auto rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-xs font-black shadow-2xs">
                      P
                    </span>
                  </th>
                  <th
                    className="p-2 text-center w-12 font-black text-rose-700 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40"
                    title="Total Absent Days"
                  >
                    <span className="w-[26px] h-[26px] mx-auto rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-xs font-black shadow-2xs">
                      A
                    </span>
                  </th>
                  <th
                    className="p-2 text-center w-12 font-black text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/40"
                    title="Total Late Days"
                  >
                    <span className="w-[26px] h-[26px] mx-auto rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-xs font-black shadow-2xs">
                      L
                    </span>
                  </th>
                  <th
                    className="p-2 text-center w-12 font-black text-purple-700 dark:text-purple-400 bg-purple-50/70 dark:bg-purple-950/40"
                    title="Total Leave / Half Days"
                  >
                    <span className="w-[26px] h-[26px] mx-auto rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-xs font-black shadow-2xs">
                      LV
                    </span>
                  </th>
                  {isWeekly && (
                    <>
                      <th
                        className="p-2 text-center w-20 font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30"
                        title="Total Weekly Work Hours"
                      >
                        Work Hrs
                      </th>
                      <th
                        className="p-2 text-center w-16 font-bold text-slate-700 dark:text-slate-300 bg-[var(--input-bg)]"
                        title="Weekly Overtime Hours"
                      >
                        OT
                      </th>
                    </>
                  )}
                  <th
                    className="p-2 text-center w-16 font-bold ea-cell-primary bg-[var(--input-bg)] border-l border-[var(--divider)]"
                    title={isWeekly ? "Weekly Attendance Percentage" : "Monthly Attendance Percentage"}
                  >
                    % Rate
                  </th>
                </tr>
              </thead>

              {/* Table Rows */}
              <tbody className="divide-y divide-[var(--divider)] text-xs">
                {paginatedEmployees.map((emp, empIdx) => {
                  const avatarColor = AVATAR_COLORS[empIdx % AVATAR_COLORS.length];
                  const initials = getInitials(emp.name);

                  return (
                    <tr key={emp.employee_id || empIdx} className="ea-row hover:bg-[var(--input-bg)]/40 transition">
                      {/* Sticky Employee Identity Cell */}
                      <td className="sticky left-0 z-10 bg-[var(--panel-bg)] hover:bg-[var(--input-bg)]/40 px-5 py-2.5 flex items-center gap-3 border-r border-[var(--divider)] shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        {emp.photo_url ? (
                          <img
                            src={getImageUrl(emp.photo_url)}
                            alt={emp.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-[var(--divider)]"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border ${avatarColor}`}
                          >
                            {initials}
                          </div>
                        )}
                        <div className="truncate max-w-[170px]">
                          <span className="font-semibold ea-cell-primary block truncate">{emp.name}</span>
                          <span className="text-[10.5px] ea-cell-muted block truncate">
                            {emp.designation || emp.department || emp.employee_code || "Staff"}
                          </span>
                        </div>
                      </td>

                      {/* Day Cells */}
                      {daysMeta.map((d) => {
                        const cell = emp.attendance?.[d.date] || emp.attendance?.[d.day];
                        const code = cell?.code || mapStatusToCode(cell?.status);
                        const cfg = STATUS_CONFIG[code] || STATUS_CONFIG["-"];
                        const isWeekend = d.is_weekend;
                        const isToday = d.is_today;

                        if (isWeekly) {
                          return (
                            <td
                              key={d.date || d.day}
                              onClick={() => onCellClick && onCellClick(emp, d, cell)}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredCell({ emp, d, cell, cfg, rect });
                              }}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`p-2 text-center border-r border-[var(--divider)] transition cursor-pointer group ${
                                isToday
                                  ? "bg-indigo-50/40 dark:bg-indigo-950/20"
                                  : isWeekend
                                  ? "bg-[var(--input-bg)]/30"
                                  : "hover:bg-[var(--input-bg)]/60"
                              }`}
                              title={`${emp.name} • ${d.day_name}, ${d.date}: ${cfg.name} (Click to edit)`}
                            >
                              {code === "-" ? (
                                <div className="py-2 flex flex-col items-center justify-center">
                                  <span
                                    className="w-[30px] h-[30px] rounded-xl border border-dashed border-[var(--input-border)] text-[var(--text-muted)] flex items-center justify-center text-xs font-bold group-hover:border-indigo-400 group-hover:text-indigo-600 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-950/30 transition shadow-2xs"
                                    style={{ width: "30px", height: "30px" }}
                                  >
                                    <Plus size={14} className="opacity-0 group-hover:opacity-100 transition" />
                                    <span className="group-hover:hidden">-</span>
                                  </span>
                                  <span className="text-[10px] ea-cell-muted mt-0.5 opacity-0 group-hover:opacity-100 transition font-semibold">
                                    Log
                                  </span>
                                </div>
                              ) : code === "WO" ? (
                                <div className="py-1.5 flex flex-col items-center justify-center">
                                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center text-[11px] shadow-2xs">
                                    WO
                                  </span>
                                  <span className="text-[10px] ea-cell-muted mt-0.5 font-semibold">Off Day</span>
                                </div>
                              ) : (
                                <div className="py-1 flex flex-col items-center justify-center gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`w-[30px] h-[30px] min-w-[30px] rounded-xl font-black flex items-center justify-center text-xs shadow-xs ${cfg.bgColor} ${cfg.textColor}`}
                                      style={{ width: "30px", height: "30px" }}
                                    >
                                      {cfg.code}
                                    </span>
                                    {cell?.total_work_hours && Number(cell.total_work_hours) > 0 && (
                                      <span className="text-[11px] font-bold ea-cell-primary bg-[var(--input-bg)] px-2 py-0.5 rounded-lg border border-[var(--input-border)] shadow-2xs">
                                        {cell.total_work_hours}h
                                      </span>
                                    )}
                                  </div>
                                  {cell?.check_in_time ? (
                                    <span
                                      className="text-[10px] ea-cell-muted font-semibold truncate max-w-[100px]"
                                      title={`In: ${cell.check_in_time} ${cell.check_out_time ? `| Out: ${cell.check_out_time}` : ""}`}
                                    >
                                      {cell.check_in_time.replace(":00 ", " ")}
                                    </span>
                                  ) : (
                                    <span className={`text-[10px] font-bold ${cfg.summaryText}`}>
                                      {cfg.name}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        }

                        // Monthly View cell (compact)
                        return (
                          <td
                            key={d.date || d.day}
                            onClick={() => onCellClick && onCellClick(emp, d, cell)}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredCell({ emp, d, cell, cfg, rect });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`p-1 text-center border-r border-[var(--divider)] transition cursor-pointer group ${
                              isToday
                                ? "bg-indigo-50/40 dark:bg-indigo-950/20"
                                : isWeekend
                                ? "bg-[var(--input-bg)]/30"
                                : "hover:bg-[var(--input-bg)]/60"
                            }`}
                            title={`${emp.name} - ${d.date}: ${cfg.name} (Click to edit)`}
                          >
                            <span
                              className={`w-[28px] h-[28px] mx-auto rounded-lg font-black flex items-center justify-center text-[11px] transition-transform group-hover:scale-110 shadow-2xs ${cfg.bgColor} ${cfg.textColor}`}
                              style={{ width: "28px", height: "28px" }}
                            >
                              {cfg.code}
                            </span>
                          </td>
                        );
                      })}

                      {/* Summary Columns */}
                      <td className="p-2 text-center border-l border-[var(--divider)]">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-[26px] px-1.5 rounded-lg font-black text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shadow-2xs">
                          {emp.summary?.present_days ?? 0}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[28px] h-[26px] px-1.5 rounded-lg font-black text-xs ${
                            (emp.summary?.absent_days ?? 0) > 0
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 shadow-2xs"
                              : "text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60"
                          }`}
                        >
                          {emp.summary?.absent_days ?? 0}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[28px] h-[26px] px-1.5 rounded-lg font-black text-xs ${
                            (emp.summary?.late_days ?? 0) > 0
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shadow-2xs"
                              : "text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60"
                          }`}
                        >
                          {emp.summary?.late_days ?? 0}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[28px] h-[26px] px-1.5 rounded-lg font-black text-xs ${
                            ((emp.summary?.leave_days ?? 0) + (emp.summary?.half_day_days ?? 0)) > 0
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 shadow-2xs"
                              : "text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60"
                          }`}
                        >
                          {(emp.summary?.leave_days ?? 0) + (emp.summary?.half_day_days ?? 0)}
                        </span>
                      </td>
                      {isWeekly && (
                        <>
                          <td className="p-2 text-center font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10">
                            {emp.summary?.total_work_hours ? `${emp.summary.total_work_hours}h` : "0.0h"}
                          </td>
                          <td className="p-2 text-center font-semibold ea-cell-muted bg-[var(--input-bg)]/30">
                            {emp.summary?.total_overtime_hours && Number(emp.summary.total_overtime_hours) > 0
                              ? `${emp.summary.total_overtime_hours}h`
                              : "-"}
                          </td>
                        </>
                      )}
                      <td className="p-2 text-center font-bold ea-cell-primary bg-[var(--input-bg)]/50 border-l border-[var(--divider)]">
                        {emp.summary?.attendance_percentage ?? "0%"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Table Footer Summary & Standard Pagination ── */}
        <div className="border-t border-[var(--divider)] bg-[var(--panel-bg)] w-full min-w-0">
          {/* Top summary row */}
          <div className="px-6 py-2.5 bg-[var(--input-bg)]/40 flex flex-wrap items-center justify-between gap-4 text-xs ea-cell-secondary border-b border-[var(--divider)]">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>
                  {isWeekly ? "Average Weekly Attendance:" : "Average Monthly Attendance:"}{" "}
                  <strong className="ea-cell-primary font-bold">
                    {isWeekly ? `${kpiStats.weeklyAvgRate}%` : avgAttendancePercentage}
                  </strong>
                </span>
              </div>
              {isWeekly && (
                <div className="flex items-center gap-2 border-l border-[var(--divider)] pl-4">
                  <Clock size={13} className="text-indigo-600 dark:text-indigo-400" />
                  <span>
                    Total Week Hours:{" "}
                    <strong className="ea-cell-primary font-bold">{kpiStats.weeklyWorkHours} hrs</strong>
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleExportCSV}
              type="button"
              className="text-xs font-semibold text-[#1a237e] dark:text-indigo-400 hover:underline transition cursor-pointer flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>{isWeekly ? "Download Weekly Roster Report (.csv)" : "Download Full Audit Report (.csv)"}</span>
              <span>→</span>
            </button>
          </div>

          {/* Standard Application Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalEmployeesCount}
            pageSize={pageSize}
            pageSizeOptions={[10, 15, 25, 50]}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            showPageSizeSelector={true}
            showFirstLast={true}
          />
        </div>
      </section>

      {/* Floating Attendance Details Hover Card */}
      {hoveredCell && <AttendanceHoverCard data={hoveredCell} />}
    </div>
  );
}
