/**
 * StudentAttendanceTab.jsx  — updated for new API
 *
 * API: GET /api/students-attendance/student/:admissionId
 *      ?from_date=YYYY-MM-DD
 *      &to_date=YYYY-MM-DD
 *      &attendance_type=daily,period   (optional, defaults to both)
 *      &academic_year_id=1             (optional, defaults to current year)
 *
 * Response:
 *  { admission_id, summary: { total_records, daily_count, period_count },
 *    data: { daily: [{ date, records[] }], period: [{ date, periods: [{ period_no, records[] }] }] } }
 *
 * Split into 4 sub-components:
 *   StudentAttendanceCalendar    — month grid with status colours
 *   StudentAttendanceDailyTable  — flat daily table with pagination
 *   StudentAttendancePeriodTable — period-wise table with pagination
 *   (stats cards inline here)
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, List, LayoutGrid, RefreshCw, UserCheck, UserX, Clock, Umbrella, CalendarOff, CalendarDays } from "lucide-react";
import StudentAttendanceCalendar from "./StudentAttendanceCalendar.jsx";
import StudentAttendanceDailyTable from "./StudentAttendanceDailyTable.jsx";
import StudentAttendancePeriodTable from "./StudentAttendancePeriodTable.jsx";
import "../styles/StudentDetailsPage.css";
import api from "../../../common/services/api.js";

/* ── helpers ── */
const pad = (n) => String(n).padStart(2, "0");
const ym = (y, m) => `${y}-${pad(m + 1)}`;
const ymFirst = (y, m) => `${ym(y, m)}-01`;
const ymLast = (y, m) => {
    const last = new Date(y, m + 1, 0).getDate();
    return `${ym(y, m)}-${pad(last)}`;
};

/* ── Attendance stat card ── */
function AttStat({ icon: Icon, bg, color, value, label }) {
    return (
        <div className="sd-att-stat-card flex items-center gap-3 rounded-2xl px-4 py-3.5">
            <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} />
            </div>
            <div>
                <p className="sd-att-stat-value text-[18px] font-bold leading-none">{value}</p>
                <p className="sd-att-stat-label text-[12px] mt-0.5">{label}</p>
            </div>
        </div>
    );
}

/* ── Circular attendance % ring ── */
function AttendanceRing({ pct }) {
    const r = 38;
    const circ = 2 * Math.PI * r;
    const dash = ((pct ?? 0) / 100) * circ;
    const color = pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)";
    return (
        <div className="flex flex-col items-center">
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r={r} fill="none" stroke="var(--input-bg)" strokeWidth="8" />
                <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
            </svg>
            <div style={{ marginTop: "-68px", textAlign: "center" }}>
                <p className="text-[22px] font-extrabold" style={{ color }}>{Math.round(pct ?? 0)}%</p>
                <p className="sd-att-muted text-[11px]">Attendance</p>
            </div>
            <div style={{ marginTop: "36px" }} />
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   MAIN TAB
══════════════════════════════════════════════════════ */
export default function StudentAttendanceTab({ studentId }) {
    const now = new Date();

    /* ── State ── */
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [attendType, setAttendType] = useState("daily,period"); // "daily" | "period" | "daily,period"
    const [viewMode, setViewMode] = useState("calendar");     // "calendar" | "daily" | "period"
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /* ── Fetch ── */
    const fetchData = useCallback(() => {
        if (!studentId) return;
        setLoading(true);
        setError(null);
        const params = {
            from_date: ymFirst(year, month),
            to_date: ymLast(year, month),
            attendance_type: attendType,
        };
        api.get(`/students-attendance/student/${studentId}`, { params })
            .then((res) => setData(res.data))
            .catch((e) => setError(e.response?.data?.message || e.message))
            .finally(() => setLoading(false));
    }, [studentId, year, month, attendType]);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* ── Handle calendar month navigation ── */
    const handleMonthChange = (y, m) => { setYear(y); setMonth(m); };

    /* ── Derived data ── */
    const dailyRows = data?.data?.daily ?? [];
    const periodRows = data?.data?.period ?? [];
    const summary = data?.summary ?? {};

    /* ── Compute stats from daily records ── */
    const stats = useMemo(() => {
        const allRecords = dailyRows.flatMap((d) => d.records ?? []);
        const cnt = (s) => allRecords.filter((r) => r.status === s).length;
        const present = cnt("present");
        const absent = cnt("absent");
        const late = cnt("late");
        const leave = cnt("leave");
        const holiday = cnt("holiday");
        const half_day = cnt("half_day");
        const attendable = allRecords.length - holiday;
        const pct = attendable > 0
            ? (((present + half_day * 0.5 + late) / attendable) * 100)
            : 0;
        return { present, absent, late, leave, holiday, half_day, attendable, total: allRecords.length, pct };
    }, [dailyRows]);

    /* ── Type filter changes → auto-switch view ── */
    const handleTypeChange = (type) => {
        setAttendType(type);
        if (type === "daily") setViewMode("daily");
        if (type === "period") setViewMode("period");
        if (type === "daily,period") setViewMode("calendar");
    };

    const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <div className="flex flex-col gap-5">

            {/* ── Filter / control bar ── */}
            <div className="sd-att-table-card rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">

                {/* Month navigation */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleMonthChange(...(() => { const d = new Date(year, month - 1, 1); return [d.getFullYear(), d.getMonth()]; })())}
                        className="sd-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center text-sm">‹</button>
                    <span className="sd-att-cell text-[13.5px] font-semibold px-2 min-w-[110px] text-center">
                        {MONTHS_SHORT[month]} {year}
                    </span>
                    <button
                        onClick={() => handleMonthChange(...(() => { const d = new Date(year, month + 1, 1); return [d.getFullYear(), d.getMonth()]; })())}
                        disabled={new Date(year, month) >= new Date(now.getFullYear(), now.getMonth())}
                        className="sd-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center text-sm disabled:opacity-40">›</button>
                </div>

                {/* Attendance type filter */}
                <select value={attendType} onChange={(e) => handleTypeChange(e.target.value)}
                    className="sd-att-cell text-[13.5px] rounded-lg px-3 py-2"
                    style={{ border: "1px solid var(--divider)", background: "var(--panel-bg)" }}>
                    <option value="daily,period">Daily + Period</option>
                    <option value="daily">Daily Only</option>
                    <option value="period">Period Only</option>
                </select>

                {/* View mode toggle */}
                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--divider)" }}>
                    <button onClick={() => setViewMode("calendar")}
                        className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors
              ${viewMode === "calendar" ? "sd-att-present-bg sd-att-present" : "sd-att-muted"}`}>
                        <Calendar size={13} /> Calendar
                    </button>
                    <button onClick={() => setViewMode("daily")}
                        disabled={!attendType.includes("daily")}
                        className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40
              ${viewMode === "daily" ? "sd-att-present-bg sd-att-present" : "sd-att-muted"}`}>
                        <List size={13} /> Daily
                    </button>
                    <button onClick={() => setViewMode("period")}
                        disabled={!attendType.includes("period")}
                        className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40
              ${viewMode === "period" ? "sd-att-present-bg sd-att-present" : "sd-att-muted"}`}>
                        <LayoutGrid size={13} /> Period
                    </button>
                </div>

                {/* Summary badges from API */}
                {data && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {summary.daily_count > 0 && <span className="sd-tab-badge">{summary.daily_count} daily</span>}
                        {summary.period_count > 0 && <span className="sd-tab-badge">{summary.period_count} period</span>}
                    </div>
                )}

                {/* Refresh */}
                <button onClick={fetchData}
                    className="sd-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center ml-auto"
                    title="Refresh" disabled={loading}>
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* ── Loading / error ── */}
            {loading && <p className="sd-att-muted text-[13.5px] text-center py-8">Loading attendance…</p>}
            {!loading && error && <p className="text-[13.5px] text-center py-8" style={{ color: "var(--danger)" }}>Error: {error}</p>}

            {/* ── Stats row (only when daily data is available) ── */}
            {!loading && !error && data && dailyRows.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="sd-att-stat-card rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
                        <AttendanceRing pct={stats.pct} />
                        <p className="sd-att-stat-label text-[12px] text-center mt-1">
                            {stats.present} of {stats.attendable} days present
                        </p>
                    </div>
                    <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <AttStat icon={UserCheck} bg="sd-att-present-bg" color="sd-att-present" value={stats.present} label="Present" />
                        <AttStat icon={UserX} bg="sd-att-absent-bg" color="sd-att-absent" value={stats.absent} label="Absent" />
                        <AttStat icon={Clock} bg="sd-att-late-bg" color="sd-att-late" value={stats.late} label="Late" />
                        <AttStat icon={Umbrella} bg="sd-att-leave-bg" color="sd-att-leave" value={stats.leave} label="Leave" />
                        <AttStat icon={CalendarOff} bg="sd-att-present-bg" color="sd-att-present" value={stats.holiday} label="Holiday" />
                        <AttStat icon={CalendarDays} bg="sd-att-absent-bg" color="sd-att-absent" value={stats.total} label="Total Days" />
                    </div>
                </div>
            )}

            {/* ── No data state ── */}
            {!loading && !error && data && dailyRows.length === 0 && periodRows.length === 0 && (
                <div className="sd-coming-soon rounded-2xl flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <CalendarDays size={36} className="sd-att-muted opacity-40" />
                    <p className="sd-field-value text-[14px] font-semibold">No attendance records for this period</p>
                    <p className="sd-att-muted text-[13px]">Try selecting a different month or attendance type</p>
                </div>
            )}

            {/* ── CALENDAR VIEW ── */}
            {!loading && !error && viewMode === "calendar" && dailyRows.length > 0 && (
                <StudentAttendanceCalendar
                    dailyData={dailyRows}
                    year={year}
                    month={month}
                    onMonthChange={handleMonthChange}
                />
            )}

            {/* ── DAILY TABLE VIEW ── */}
            {!loading && !error && viewMode === "daily" && (
                <StudentAttendanceDailyTable rows={dailyRows} />
            )}

            {/* ── PERIOD TABLE VIEW ── */}
            {!loading && !error && viewMode === "period" && (
                <StudentAttendancePeriodTable rows={periodRows} />
            )}
        </div>
    );
}
