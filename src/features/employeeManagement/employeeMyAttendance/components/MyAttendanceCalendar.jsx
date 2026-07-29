/**
 * MyAttendanceCalendar.jsx
 * Month grid for the logged-in employee's own attendance.
 * Click a day → detail popover with check-in/out and work hours.
 */
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, Clock, Timer, AlarmClock } from "lucide-react";
import "../styles/MyAttendance.css";

const STATUS_EMOJI = {
    present: "✅", absent: "❌", late: "⏰",
    half_day: "🌗", leave: "🏖️", holiday: "🎉", week_off: "📅",
};
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
const pad = (n) => String(n).padStart(2, "0");

function fmtTime(v) {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d) ? null : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function fmtMins(m) {
    if (!m && m !== 0) return "—";
    const h = Math.floor(m / 60), min = m % 60;
    if (h === 0 && min === 0) return "0m";
    if (h === 0) return `${min}m`;
    return min === 0 ? `${h}h` : `${h}h ${min}m`;
}

export default function MyAttendanceCalendar({ records = [], year, month, onMonthChange }) {
    const [selected, setSelected] = useState(null);

    /* Map date string → record */
    const dayMap = useMemo(() => {
        const map = {};
        records.forEach((r) => {
            const key = (r.attendance_date ?? "").split("T")[0].split(" ")[0];
            if (key) map[key] = r;
        });
        return map;
    }, [records]);

    /* Calendar grid */
    const cells = useMemo(() => {
        const first = new Date(year, month, 1).getDay();
        const total = new Date(year, month + 1, 0).getDate();
        const arr = [];
        for (let i = 0; i < first; i++) arr.push(null);
        for (let d = 1; d <= total; d++) arr.push(d);
        return arr;
    }, [year, month]);

    const todayStr = new Date().toISOString().split("T")[0];
    const isMaxMo = new Date(year, month) >= new Date(new Date().getFullYear(), new Date().getMonth());

    return (
        <div className="ma-calendar-card rounded-2xl overflow-hidden">

            {/* Month nav */}
            <div className="ma-cal-header flex items-center justify-between px-5 py-4">
                <button onClick={() => { const d = new Date(year, month - 1, 1); onMonthChange(d.getFullYear(), d.getMonth()); }}
                    className="ma-action-btn w-8 h-8 rounded-lg flex items-center justify-center">
                    <ChevronLeft size={16} />
                </button>
                <p className="ma-cell-primary text-[15px] font-bold">{MONTHS[month]} {year}</p>
                <button disabled={isMaxMo}
                    onClick={() => { const d = new Date(year, month + 1, 1); onMonthChange(d.getFullYear(), d.getMonth()); }}
                    className="ma-action-btn w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 px-5 py-2"
                style={{ background: "var(--input-bg)", borderBottom: "1px solid var(--divider)" }}>
                {Object.entries(STATUS_EMOJI).map(([status, emoji]) => (
                    <span key={status} className={`text-[11.5px] font-medium ma-day-text-${status} flex items-center gap-1`}>
                        {emoji} {status.replace("_", " ")}
                    </span>
                ))}
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 px-3 pt-3">
                {DAYS.map((d) => (
                    <div key={d} className="ma-cal-day-hdr text-center text-[11px] font-bold uppercase pb-2">{d}</div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1 px-3 pb-4">
                {cells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} />;
                    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                    const record = dayMap[dateStr];
                    const status = record?.status ?? null;
                    const isToday = dateStr === todayStr;
                    const isFuture = dateStr > todayStr;

                    return (
                        <button key={dateStr}
                            onClick={() => record && setSelected(record)}
                            disabled={!record}
                            className={`relative flex flex-col items-center justify-start rounded-xl py-2 px-1 transition-all
                ${status ? `ma-day-${status}` : "ma-day-empty"}
                ${isToday ? "ma-day-today" : ""}
              `}
                            style={{ minHeight: "64px", cursor: record ? "pointer" : isFuture ? "default" : "default", opacity: isFuture ? 0.4 : 1 }}>
                            <span className={`text-[13px] font-bold ${status ? `ma-day-text-${status}` : "ma-day-text-empty"}`}>
                                {day}
                            </span>
                            {status && (
                                <span className="text-[14px] mt-0.5">{STATUS_EMOJI[status]}</span>
                            )}
                            {record?.check_in && (
                                <span className={`text-[9px] mt-0.5 ${status ? `ma-day-text-${status}` : ""}`}>
                                    {fmtTime(record.check_in)}
                                </span>
                            )}
                            {isToday && !status && (
                                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                    style={{ background: "var(--btn-bg)" }} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Day detail popover */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ma-overlay"
                    style={{ backdropFilter: "blur(4px)" }}
                    onClick={() => setSelected(null)}>
                    <div className="ma-modal rounded-2xl w-full max-w-sm overflow-hidden"
                        onClick={(e) => e.stopPropagation()}>

                        {/* Popover header */}
                        <div className="ma-modal-header flex items-center justify-between px-5 py-4">
                            <div>
                                <p className="ma-modal-title text-[15px] font-bold">
                                    {new Date(selected.attendance_date).toLocaleDateString("en-IN", {
                                        weekday: "long", day: "2-digit", month: "short", year: "numeric",
                                    })}
                                </p>
                                <span className={`ma-status ma-status-${selected.status} mt-1 inline-flex`}>
                                    {STATUS_EMOJI[selected.status]} {selected.status?.replace("_", " ")}
                                </span>
                            </div>
                            <button onClick={() => setSelected(null)}
                                className="ma-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Time grid */}
                        <div className="px-5 py-4 flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl p-3" style={{ background: "var(--input-bg)" }}>
                                    <p className="ma-cell-muted text-[11px] uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                        <Clock size={11} /> Check-in
                                    </p>
                                    <p className="ma-cell-primary text-[15px] font-bold">
                                        {fmtTime(selected.check_in) ?? "—"}
                                    </p>
                                    {(selected.late_minutes ?? 0) > 0 && (
                                        <p className="text-[11px] mt-0.5" style={{ color: "var(--warning)" }}>
                                            +{fmtMins(selected.late_minutes)} late
                                        </p>
                                    )}
                                </div>
                                <div className="rounded-xl p-3" style={{ background: "var(--input-bg)" }}>
                                    <p className="ma-cell-muted text-[11px] uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                        <Clock size={11} /> Check-out
                                    </p>
                                    <p className="ma-cell-primary text-[15px] font-bold">
                                        {fmtTime(selected.check_out) ?? "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Work / OT / Late */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: "Work", value: selected.total_work_minutes, icon: Timer, color: "var(--success)" },
                                    { label: "Overtime", value: selected.overtime_minutes, icon: TrendingUp, color: "var(--btn-bg)" },
                                    { label: "Late", value: selected.late_minutes, icon: AlarmClock, color: "var(--warning)" },
                                ].map(({ label, value, icon: Icon, color }) => (
                                    <div key={label} className="rounded-xl p-3 text-center" style={{ background: "var(--input-bg)" }}>
                                        <Icon size={13} style={{ color, margin: "0 auto 4px" }} />
                                        <p className="ma-cell-muted text-[10px] uppercase tracking-wide">{label}</p>
                                        <p className="text-[13px] font-bold mt-0.5" style={{ color }}>{fmtMins(value)}</p>
                                    </div>
                                ))}
                            </div>

                            {selected.remarks && (
                                <p className="ma-cell-muted text-[12px] italic px-1">"{selected.remarks}"</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* need Timer / TrendingUp / AlarmClock from lucide */
function TrendingUp(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>; }