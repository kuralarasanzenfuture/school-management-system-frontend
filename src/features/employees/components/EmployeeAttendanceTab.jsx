/**
 * EmployeeAttendanceTab.jsx
 *
 * Dispatch: getEmployeeAttendanceByEmployeeId({ employeeId, filters })
 * State:    state.employeeAttendance.records  (logs[])
 *           state.employeeAttendance.summary  (summary object)
 *           state.employeeAttendance.loading
 *           state.employeeAttendance.error
 *
 * Response normalised:
 *   Shape A: { success, data: [] }              → logs = data
 *   Shape B: { success, data: { summary, logs }} → logs = data.logs, summary = data.summary
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, List, RefreshCw, UserCheck, UserX, Clock, Umbrella, CalendarOff, CalendarDays, TrendingUp } from "lucide-react";

/* ── adjust import to your project ── */
import { getEmployeeAttendanceByEmployeeId } from "../../../redux/employeeAttendance/employeeAttendanceSlice.js";
import EmployeeAttendanceCalendar from "./EmployeeAttendanceCalendar.jsx";
import EmployeeAttendanceTable from "./EmployeeAttendanceTable.jsx";
import "../styles/EmployeeDetailsPage.css";

/* ── date helpers ── */
const pad = (n) => String(n).padStart(2, "0");
const ymFirst = (y, m) => `${y}-${pad(m + 1)}-01`;
const ymLast = (y, m) => `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`;

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function fmtMins(m) {
    if (!m && m !== 0) return "0m";
    const h = Math.floor(m / 60), min = m % 60;
    if (h === 0) return `${min}m`;
    return min === 0 ? `${h}h` : `${h}h ${min}m`;
}

/* ── Stat card ── */
function Stat({ icon: Icon, bg, color, value, label, sub }) {
    return (
        <div className="ed-section-card flex items-center gap-3 rounded-2xl px-4 py-3.5">
            <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} />
            </div>
            <div>
                <p className="ed-salary-primary text-[18px] font-bold leading-none">{value}</p>
                <p className="ed-salary-muted text-[12px] mt-0.5">{label}</p>
                {sub && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>}
            </div>
        </div>
    );
}

/* ── Circular % ring ── */
function Ring({ pct }) {
    const r = 36;
    const circ = 2 * Math.PI * r;
    const dash = ((pct ?? 0) / 100) * circ;
    const color = pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)";
    return (
        <div className="flex flex-col items-center">
            <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="48" cy="48" r={r} fill="none" stroke="var(--input-bg)" strokeWidth="8" />
                <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
            </svg>
            <div style={{ marginTop: "-64px", textAlign: "center" }}>
                <p className="text-[20px] font-extrabold" style={{ color }}>{Math.round(pct ?? 0)}%</p>
                <p className="ed-salary-muted text-[10px]">Present</p>
            </div>
            <div style={{ marginTop: "32px" }} />
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   MAIN TAB
══════════════════════════════════════════════════════ */
export default function EmployeeAttendanceTab({ employeeId }) {
    const dispatch = useDispatch();
    const now = new Date();

    /* ── Redux ── */
    const { records, summary: reduxSummary, loading, error } =
        useSelector((s) => s.employeeAttendance);

    /* ── UI state ── */
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [statusFilter, setStatusFilter] = useState("");   // "" = all
    const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "table"

    /* ── Dispatch ── */
    const load = useCallback(() => {
        if (!employeeId) return;
        dispatch(getEmployeeAttendanceByEmployeeId({
            employeeId: Number(employeeId),
            filters: {
                from_date: ymFirst(year, month),
                to_date: ymLast(year, month),
                month: month + 1,
                year,
                ...(statusFilter ? { status: statusFilter.toUpperCase() } : {}),
            },
        }));
    }, [dispatch, employeeId, year, month, statusFilter]);

    useEffect(() => { load(); }, [load]);

    /* ── Normalise response ──
       The slice may store Shape A (array) or Shape B ({ summary, logs }).
       Handles both gracefully.                                              */
    const logs = useMemo(() => {
        if (!records) return [];
        if (Array.isArray(records)) return records;                   // Shape A
        if (Array.isArray(records.logs)) return records.logs;         // Shape B nested
        return [];
    }, [records]);

    const summary = useMemo(() => {
        // prefer slice's dedicated summary field (from Shape B response)
        if (reduxSummary && typeof reduxSummary === "object") return reduxSummary;
        // fall back to deriving counts from logs
        const cnt = (s) => logs.filter(r => r.status === s).length;
        const present = cnt("present");
        const absent = cnt("absent");
        const late = cnt("late");
        const holiday = cnt("holiday");
        const attendable = logs.length - holiday;
        return {
            present_days: String(present),
            absent_days: String(absent),
            late_days: String(late),
            half_days: String(cnt("half_day")),
            leave_days: String(cnt("leave")),
            holiday_days: String(holiday),
            week_off_days: String(cnt("week_off")),
            total_records: logs.length,
            total_work_hours: (logs.reduce((s, r) => s + (r.total_work_minutes ?? 0), 0) / 60).toFixed(2),
            total_overtime_hours: (logs.reduce((s, r) => s + (r.overtime_minutes ?? 0), 0) / 60).toFixed(2),
            total_late_minutes: String(logs.reduce((s, r) => s + (r.late_minutes ?? 0), 0)),
        };
    }, [reduxSummary, logs]);

    /* ── Attendance % ── */
    const attendable = Number(summary.total_records ?? 0) - Number(summary.holiday_days ?? 0) - Number(summary.week_off_days ?? 0);
    const presentDays = Number(summary.present_days ?? 0) + Number(summary.half_days ?? 0) * 0.5 + Number(summary.late_days ?? 0);
    const pct = attendable > 0 ? (presentDays / attendable) * 100 : 0;

    /* ── Month nav ── */
    const goPrev = () => { const d = new Date(year, month - 1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()); };
    const goNext = () => { const d = new Date(year, month + 1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()); };
    const isNowOrFuture = new Date(year, month) >= new Date(now.getFullYear(), now.getMonth());
    const handleMonthChange = (y, m) => { setYear(y); setMonth(m); };

    const hasData = logs.length > 0;

    return (
        <div className="flex flex-col gap-5">

            {/* ── Control bar ── */}
            <div className="ed-section-card rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">

                {/* Month nav */}
                <div className="flex items-center gap-1">
                    <button onClick={goPrev}
                        className="ed-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[16px]">‹</button>
                    <span className="ed-salary-primary text-[13.5px] font-semibold px-2 min-w-[120px] text-center">
                        {MONTHS_SHORT[month]} {year}
                    </span>
                    <button onClick={goNext} disabled={isNowOrFuture}
                        className="ed-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[16px] disabled:opacity-40">›</button>
                </div>

                {/* Status filter */}
                <select value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="ed-salary-primary text-[13.5px] rounded-lg px-3 py-2"
                    style={{ border: "1px solid var(--divider)", background: "var(--panel-bg)" }}>
                    <option value="">All Status</option>
                    {["present", "absent", "late", "half_day", "leave", "holiday", "week_off"].map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                </select>

                {/* View toggle */}
                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--divider)" }}>
                    <button onClick={() => setViewMode("calendar")}
                        className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors
              ${viewMode === "calendar" ? "ed-salary-section-earning" : "ed-salary-muted"}`}>
                        <Calendar size={13} /> Calendar
                    </button>
                    <button onClick={() => setViewMode("table")}
                        className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors
              ${viewMode === "table" ? "ed-salary-section-earning" : "ed-salary-muted"}`}>
                        <List size={13} /> Table
                    </button>
                </div>

                {/* Period label */}
                {hasData && (
                    <span className="ed-salary-muted text-[12.5px]">
                        {logs.length} record{logs.length !== 1 ? "s" : ""} · {MONTHS_FULL[month]} {year}
                    </span>
                )}

                {/* Refresh */}
                <button onClick={load} disabled={loading} title="Refresh"
                    className="ed-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center ml-auto">
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* ── Loading ── */}
            {loading && <p className="ed-salary-muted text-[13.5px] text-center py-10">Loading attendance…</p>}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="ed-coming-soon rounded-2xl flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <p className="text-[14px] font-semibold" style={{ color: "var(--danger)" }}>Failed to load attendance</p>
                    <p className="ed-salary-muted text-[13px]">{typeof error === "string" ? error : "Please try again"}</p>
                    <button onClick={load}
                        className="ed-doc-view-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold mt-1">
                        <RefreshCw size={13} /> Retry
                    </button>
                </div>
            )}

            {/* ── Stats ── */}
            {!loading && !error && hasData && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Ring */}
                    <div className="ed-section-card rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
                        <Ring pct={pct} />
                        <p className="ed-salary-muted text-[12px] text-center mt-1">
                            {presentDays.toFixed(0)} of {attendable} working days
                        </p>
                    </div>
                    {/* Stat grid */}
                    <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <Stat icon={UserCheck} bg="ed-salary-section-earning" color="" value={summary.present_days ?? 0} label="Present" />
                        <Stat icon={UserX} bg="ed-salary-section-deduction" color="" value={summary.absent_days ?? 0} label="Absent" />
                        <Stat icon={Clock} bg="ed-salary-section-deduction" color="" value={summary.late_days ?? 0} label="Late"
                            sub={summary.total_late_minutes > 0 ? `${fmtMins(Number(summary.total_late_minutes))} total` : undefined} />
                        <Stat icon={Umbrella} bg="ed-salary-section-earning" color="" value={summary.leave_days ?? 0} label="Leave" />
                        <Stat icon={CalendarOff} bg="ed-salary-section-earning" color="" value={summary.holiday_days ?? 0} label="Holiday" />
                        <Stat icon={TrendingUp} bg="ed-salary-section-earning" color="" value={`${summary.total_work_hours ?? "0.00"}h`} label="Work Hours"
                            sub={Number(summary.total_overtime_hours) > 0 ? `+${summary.total_overtime_hours}h OT` : undefined} />
                    </div>
                </div>
            )}

            {/* ── No data ── */}
            {!loading && !error && !hasData && (
                <div className="ed-coming-soon rounded-2xl flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <CalendarDays size={36} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
                    <p className="ed-salary-primary text-[14px] font-semibold">No attendance records for {MONTHS_FULL[month]} {year}</p>
                    <p className="ed-salary-muted text-[13px]">Try a different month or remove the status filter</p>
                </div>
            )}

            {/* ── CALENDAR VIEW ── */}
            {!loading && !error && viewMode === "calendar" && (
                <EmployeeAttendanceCalendar
                    logs={logs}
                    year={year}
                    month={month}
                    onMonthChange={handleMonthChange}
                />
            )}

            {/* ── TABLE VIEW ── */}
            {!loading && !error && viewMode === "table" && (
                <EmployeeAttendanceTable logs={logs} />
            )}
        </div>
    );
}