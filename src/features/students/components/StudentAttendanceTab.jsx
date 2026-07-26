/**
 * StudentAttendanceTab.jsx
 * Shows attendance history + summary stats for a single student.
 * Uses: fetchAttendanceByStudent → state.studentAttendance.attendanceByStudent
 */
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttendanceByStudent } from "../../../redux/studentAttendance/studentAttendanceSlice.js";
import Pagination from "../../../common/components/table/Pagination.jsx";
import usePagination from "../../../common/components/table/usePagination.jsx";
import "../styles/StudentDetailsPage-new.css";
import {
    UserCheck, UserX, Clock, CalendarDays,
    Umbrella, CalendarOff, Search,
} from "lucide-react";

const STATUS_LIST = ["present", "absent", "late", "half_day", "leave", "holiday"];

function fmtDate(v) {
    if (!v) return "—";
    const d = new Date(v);
    return isNaN(d) ? String(v) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(v) {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d) ? null : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

/* ── Stat card ── */
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

/* ── Circular attendance % ── */
function AttendanceRing({ pct }) {
    const r = 38;
    const circ = 2 * Math.PI * r;
    const dash = ((pct ?? 0) / 100) * circ;
    const color = pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)";
    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="100" height="100" viewBox="0 0 100 100" className="sd-progress-ring">
                <circle cx="50" cy="50" r={r} fill="none" stroke="var(--input-bg)" strokeWidth="8" />
                <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
            </svg>
            <div className="text-center" style={{ marginTop: "-72px" }}>
                <p className="text-[22px] font-extrabold" style={{ color }}>{Math.round(pct ?? 0)}%</p>
                <p className="sd-att-muted text-[11px]">Attendance</p>
            </div>
            <div style={{ marginTop: "36px" }} />
        </div>
    );
}

export default function StudentAttendanceTab({ studentId }) {
    const dispatch = useDispatch();
    const { attendanceByStudent: records, loading, error } = useSelector((s) => s.studentAttendance);
    // console.log("records:", records);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [monthFilter, setMonthFilter] = useState("");

    useEffect(() => {
        if (studentId) dispatch(fetchAttendanceByStudent({ studentId }));
    }, [dispatch, studentId]);

    /* ── Normalize records into flat array ── */
    const parsedRecords = useMemo(() => {
        if (!records) return [];
        if (Array.isArray(records)) return records;
        if (records.data) {
            if (Array.isArray(records.data)) {
                return records.data;
            }
            if (records.data.daily && Array.isArray(records.data.daily)) {
                return records.data.daily.flatMap(({ date, records: subRecords }) =>
                    (subRecords ?? []).map((r) => ({ date, ...r }))
                );
            }
        }
        return [];
    }, [records]);

    /* ── Summary counts ── */
    const summary = useMemo(() => {
        const all = parsedRecords;
        const count = (status) => all.filter(r => r.status === status).length;
        const total = all.length;
        const present = count("present") + count("late") + count("half_day");
        return {
            total,
            present: count("present"),
            absent: count("absent"),
            late: count("late"),
            leave: count("leave"),
            holiday: count("holiday"),
            attendable: total - count("holiday"),
            pct: total > 0
                ? ((count("present") + count("half_day") * 0.5 + count("late")) / Math.max(1, total - count("holiday")) * 100)
                : 0,
        };
    }, [parsedRecords]);

    /* ── Month options from records ── */
    const monthOptions = useMemo(() => {
        const seen = new Set();
        parsedRecords.forEach((r) => {
            if (r.date) seen.add(r.date.slice(0, 7)); // YYYY-MM
        });
        return [...seen].sort().reverse();
    }, [parsedRecords]);

    /* ── Filtered ── */
    const filtered = useMemo(() => {
        let result = parsedRecords;
        if (statusFilter !== "All") result = result.filter(r => r.status === statusFilter);
        if (monthFilter) result = result.filter(r => r.date?.startsWith(monthFilter));
        const q = search.trim().toLowerCase();
        if (q) result = result.filter(r =>
            r.date?.includes(q) ||
            r.status?.toLowerCase().includes(q) ||
            r.remarks?.toLowerCase().includes(q),
        );
        return [...result].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [records, statusFilter, monthFilter, search]);

    const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
        usePagination({ data: filtered, initialSize: 15 });

    if (loading) return <p className="sd-att-muted text-[13.5px] text-center py-12">Loading attendance…</p>;
    if (error) return <p className="text-[13.5px] text-center py-12" style={{ color: "var(--danger)" }}>{error}</p>;

    return (
        <div className="flex flex-col gap-5">

            {/* ── Summary row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Ring + stat */}
                <div className="sd-att-stat-card rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                    <AttendanceRing pct={summary.pct} />
                    <p className="sd-att-stat-label text-[12px] text-center">
                        {summary.present + Math.round(summary.late)} of {summary.attendable} days attended
                    </p>
                </div>
                <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <AttStat icon={UserCheck} bg="sd-att-present-bg" color="sd-att-present" value={summary.present} label="Present" />
                    <AttStat icon={UserX} bg="sd-att-absent-bg" color="sd-att-absent" value={summary.absent} label="Absent" />
                    <AttStat icon={Clock} bg="sd-att-late-bg" color="sd-att-late" value={summary.late} label="Late" />
                    <AttStat icon={Umbrella} bg="sd-att-leave-bg" color="sd-att-leave" value={summary.leave} label="Leave" />
                    <AttStat icon={CalendarOff} bg="sd-att-present-bg" color="sd-att-present" value={summary.holiday} label="Holiday" />
                    <AttStat icon={CalendarDays} bg="sd-att-absent-bg" color="sd-att-absent" value={summary.total} label="Total Days" />
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="sd-att-table-card rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[160px]" style={{ background: "var(--input-bg)", border: "1px solid var(--divider)", borderRadius: "8px", padding: "8px 12px" }}>
                    <Search size={14} className="sd-att-muted shrink-0" />
                    <input className="bg-transparent outline-none w-full text-[13.5px] sd-att-cell"
                        placeholder="Search date, status…"
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="sd-att-cell text-[13.5px] rounded-lg px-3 py-2" style={{ border: "1px solid var(--divider)", background: "var(--panel-bg)" }}>
                    <option value="All">All Status</option>
                    {STATUS_LIST.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>

                <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}
                    className="sd-att-cell text-[13.5px] rounded-lg px-3 py-2" style={{ border: "1px solid var(--divider)", background: "var(--panel-bg)" }}>
                    <option value="">All Months</option>
                    {monthOptions.map((m) => <option key={m} value={m}>{new Date(m + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</option>)}
                </select>

                <span className="sd-att-muted text-[12.5px] ml-auto">
                    {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* ── Table ── */}
            <div className="sd-att-table-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="sd-att-thead text-[11.5px] uppercase tracking-wide">
                                <th className="px-5 py-3 font-semibold">Date</th>
                                <th className="px-3 py-3 font-semibold">Day</th>
                                <th className="px-3 py-3 font-semibold">Status</th>
                                <th className="px-3 py-3 font-semibold">Check-in</th>
                                <th className="px-3 py-3 font-semibold">Check-out</th>
                                <th className="px-3 py-3 font-semibold">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedData.length === 0 ? (
                                <tr><td colSpan={6} className="sd-att-muted px-5 py-10 text-center text-[13.5px]">
                                    No attendance records found.
                                </td></tr>
                            ) : pagedData.map((r) => {
                                const d = new Date(r.date);
                                const day = isNaN(d) ? "" : d.toLocaleDateString("en-IN", { weekday: "short" });
                                return (
                                    <tr key={r.id ?? r.date} className="sd-att-row">
                                        <td className="sd-att-cell px-5 py-3 text-[13.5px] font-medium">{fmtDate(r.date)}</td>
                                        <td className="sd-att-muted px-3 py-3 text-[13px]">{day}</td>
                                        <td className="px-3 py-3">
                                            <span className={`sd-att-status sd-att-status-${r.status}`}>
                                                {r.status?.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="sd-att-muted px-3 py-3 text-[13px]">{fmtTime(r.check_in) ?? "—"}</td>
                                        <td className="sd-att-muted px-3 py-3 text-[13px]">{fmtTime(r.check_out) ?? "—"}</td>
                                        <td className="sd-att-muted px-3 py-3 text-[12.5px] max-w-[160px]">
                                            <p className="truncate">{r.remarks ?? "—"}</p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage} totalItems={totalItems} pageSize={pageSize}
                    pageSizeOptions={[10, 15, 25, 50]} onPageChange={setPage} onPageSizeChange={setPageSize}
                />
            </div>
        </div>
    );
}