/**
 * EmployeeAttendanceCalendar.jsx
 * Month grid — each day coloured by attendance status.
 * Click a day → detail popover with check-in/out, work hours.
 */
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, Clock } from "lucide-react";

export const STATUS_COLOR = {
    present: { bg: "var(--success-bg)", dot: "var(--success)", text: "var(--success)", label: "Present" },
    absent: { bg: "var(--danger-bg)", dot: "var(--danger)", text: "var(--danger)", label: "Absent" },
    late: { bg: "var(--warning-bg)", dot: "var(--warning)", text: "var(--warning)", label: "Late" },
    half_day: { bg: "#fdf4ff", dot: "#a855f7", text: "#a855f7", label: "Half Day" },
    leave: { bg: "var(--badge-bg)", dot: "var(--btn-bg)", text: "var(--btn-bg)", label: "Leave" },
    holiday: { bg: "#ecfeff", dot: "#06b6d4", text: "#06b6d4", label: "Holiday" },
    week_off: { bg: "var(--input-bg)", dot: "var(--text-muted)", text: "var(--text-muted)", label: "Week Off" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

function fmtTime(v) {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d) ? null : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function fmtMins(m) {
    if (!m && m !== 0) return "—";
    const h = Math.floor(m / 60), min = m % 60;
    if (h === 0) return `${min}m`;
    return min === 0 ? `${h}h` : `${h}h ${min}m`;
}
const pad = (n) => String(n).padStart(2, "0");

export default function EmployeeAttendanceCalendar({ logs = [], year, month, onMonthChange }) {
    const [selected, setSelected] = useState(null); // single log record

    /* ── Map: "YYYY-MM-DD" → log record ── */
    const dayMap = useMemo(() => {
        const map = {};
        logs.forEach((r) => {
            if (r.attendance_date) map[r.attendance_date.split("T")[0].split(" ")[0]] = r;
        });
        return map;
    }, [logs]);

    /* ── Calendar cells ── */
    const calCells = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const total = new Date(year, month + 1, 0).getDate();
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= total; d++) cells.push(d);
        return cells;
    }, [year, month]);

    const prevMonth = () => { const d = new Date(year, month - 1, 1); onMonthChange(d.getFullYear(), d.getMonth()); };
    const nextMonth = () => { const d = new Date(year, month + 1, 1); onMonthChange(d.getFullYear(), d.getMonth()); };
    const todayStr = new Date().toISOString().split("T")[0];

    return (
        <div className="ed-section-card rounded-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--divider)" }}>
                <button onClick={prevMonth}
                    className="ed-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center">
                    <ChevronLeft size={16} />
                </button>
                <p className="ed-field-value text-[15px] font-bold">{MONTHS[month]} {year}</p>
                <button onClick={nextMonth}
                    disabled={new Date(year, month) >= new Date(new Date().getFullYear(), new Date().getMonth())}
                    className="ed-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-2"
                style={{ borderBottom: "1px solid var(--divider)", background: "var(--input-bg)" }}>
                {Object.entries(STATUS_COLOR).map(([key, val]) => (
                    <span key={key} className="flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: val.text }}>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: val.dot }} />
                        {val.label}
                    </span>
                ))}
                <span className="flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: "var(--text-muted)" }}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: "var(--divider)" }} />
                    No data
                </span>
            </div>

            {/* Day-of-week row */}
            <div className="grid grid-cols-7 px-3 pt-3">
                {DAYS.map((d) => (
                    <div key={d} className="text-center text-[11px] font-bold uppercase pb-2"
                        style={{ color: "var(--text-muted)" }}>{d}</div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 px-3 pb-4">
                {calCells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} />;
                    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                    const record = dayMap[dateStr];
                    const status = record?.status ?? null;
                    const colors = status ? STATUS_COLOR[status] : null;
                    const isToday = dateStr === todayStr;
                    const checkIn = fmtTime(record?.check_in);
                    const checkOut = fmtTime(record?.check_out);

                    return (
                        <button key={dateStr}
                            onClick={() => record && setSelected(record)}
                            className="relative flex flex-col items-center justify-start rounded-xl py-2 px-1 transition-all"
                            style={{
                                background: colors?.bg ?? "var(--input-bg)",
                                border: isToday ? "2px solid var(--btn-bg)" : "1px solid transparent",
                                cursor: record ? "pointer" : "default",
                                minHeight: "62px",
                            }}>
                            <span className="text-[13px] font-bold" style={{ color: colors?.text ?? "var(--text-muted)" }}>
                                {day}
                            </span>
                            {status && (
                                <span className="text-[9px] font-semibold mt-0.5 capitalize" style={{ color: colors.text }}>
                                    {status.replace("_", " ")}
                                </span>
                            )}
                            {checkIn && (
                                <span className="text-[9px] mt-0.5" style={{ color: colors?.text ?? "var(--text-muted)" }}>
                                    {checkIn}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                    onClick={() => setSelected(null)}>
                    <div className="ed-section-card rounded-2xl w-full max-w-sm p-5"
                        onClick={(e) => e.stopPropagation()}>
                        {/* Popover header */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="ed-field-value text-[14px] font-bold">
                                    {new Date(selected.attendance_date).toLocaleDateString("en-IN", {
                                        weekday: "long", day: "2-digit", month: "short", year: "numeric",
                                    })}
                                </p>
                                {selected.status && (
                                    <span className={`ed-status ed-status-${selected.status} mt-1 inline-block`}>
                                        {selected.status.replace("_", " ")}
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setSelected(null)}
                                className="ed-doc-view-btn w-7 h-7 rounded-full flex items-center justify-center">
                                <X size={14} />
                            </button>
                        </div>

                        {/* Time grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="rounded-xl px-3 py-2.5" style={{ background: "var(--input-bg)" }}>
                                <p className="ed-field-label text-[11px] uppercase tracking-wide mb-1">Check-in</p>
                                <p className="ed-field-value text-[14px] font-semibold flex items-center gap-1">
                                    <Clock size={12} /> {fmtTime(selected.check_in) ?? "—"}
                                </p>
                            </div>
                            <div className="rounded-xl px-3 py-2.5" style={{ background: "var(--input-bg)" }}>
                                <p className="ed-field-label text-[11px] uppercase tracking-wide mb-1">Check-out</p>
                                <p className="ed-field-value text-[14px] font-semibold flex items-center gap-1">
                                    <Clock size={12} /> {fmtTime(selected.check_out) ?? "—"}
                                </p>
                            </div>
                        </div>

                        {/* Work / OT / Late minutes */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                ["Work", selected.total_work_minutes, "var(--success)"],
                                ["Overtime", selected.overtime_minutes, "var(--btn-bg)"],
                                ["Late", selected.late_minutes, "var(--warning)"],
                            ].map(([lbl, val, color]) => (
                                <div key={lbl} className="rounded-xl px-3 py-2.5 text-center" style={{ background: "var(--input-bg)" }}>
                                    <p className="ed-field-label text-[10px] uppercase tracking-wide">{lbl}</p>
                                    <p className="text-[13px] font-bold mt-0.5" style={{ color }}>{fmtMins(val)}</p>
                                </div>
                            ))}
                        </div>

                        {selected.remarks && (
                            <p className="ed-field-label text-[12px] mt-3 italic">"{selected.remarks}"</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}