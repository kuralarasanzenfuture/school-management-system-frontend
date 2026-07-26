/**
 * StudentAttendanceCalendar.jsx
 * Month grid showing daily attendance status per day.
 * Clicking a day shows a detail popover.
 */
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const STATUS_COLOR = {
    present: { bg: "var(--success-bg)", dot: "var(--success)", text: "var(--success)", label: "Present" },
    absent: { bg: "var(--danger-bg)", dot: "var(--danger)", text: "var(--danger)", label: "Absent" },
    late: { bg: "var(--warning-bg)", dot: "var(--warning)", text: "var(--warning)", label: "Late" },
    half_day: { bg: "#fdf4ff", dot: "#a855f7", text: "#a855f7", label: "Half Day" },
    leave: { bg: "var(--badge-bg)", dot: "var(--btn-bg)", text: "var(--btn-bg)", label: "Leave" },
    holiday: { bg: "#ecfeff", dot: "#06b6d4", text: "#06b6d4", label: "Holiday" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

function fmtDate(v) {
    const d = new Date(v);
    return isNaN(d) ? v : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function StudentAttendanceCalendar({ dailyData = [], year, month, onMonthChange }) {
    const [selected, setSelected] = useState(null); // { date, records }

    /* ── Build a map: "YYYY-MM-DD" → records[] ── */
    const dayMap = useMemo(() => {
        const map = {};
        dailyData.forEach(({ date, records }) => {
            if (date) map[date] = records ?? [];
        });
        return map;
    }, [dailyData]);

    /* ── Calendar grid for the current month ── */
    const calDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);       // empty prefix
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
        return cells;
    }, [year, month]);

    const prevMonth = () => {
        const d = new Date(year, month - 1, 1);
        onMonthChange(d.getFullYear(), d.getMonth());
    };
    const nextMonth = () => {
        const d = new Date(year, month + 1, 1);
        onMonthChange(d.getFullYear(), d.getMonth());
    };

    const pad = (n) => String(n).padStart(2, "0");

    return (
        <div className="sd-section-card rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
                <button onClick={prevMonth} className="sd-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center">
                    <ChevronLeft size={16} />
                </button>
                <p className="sd-field-value text-[15px] font-bold">{MONTHS[month]} {year}</p>
                <button onClick={nextMonth} className="sd-doc-view-btn w-8 h-8 rounded-lg flex items-center justify-center"
                    disabled={new Date(year, month) >= new Date(new Date().getFullYear(), new Date().getMonth())}>
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-2" style={{ borderBottom: "1px solid var(--divider)", background: "var(--input-bg)" }}>
                {Object.entries(STATUS_COLOR).map(([key, val]) => (
                    <span key={key} className="flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: val.text }}>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: val.dot }} />
                        {val.label}
                    </span>
                ))}
                <span className="flex items-center gap-1.5 text-[11.5px] font-medium sd-att-muted">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: "var(--divider)" }} />No data
                </span>
            </div>

            {/* Day-of-week header */}
            <div className="grid grid-cols-7 px-3 pt-3">
                {DAYS.map((d) => (
                    <div key={d} className="text-center sd-att-muted text-[11px] font-bold uppercase pb-2">{d}</div>
                ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1 px-3 pb-4">
                {calDays.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} />;
                    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                    const records = dayMap[dateStr];
                    const status = records?.[0]?.status ?? null;
                    const colors = status ? STATUS_COLOR[status] : null;
                    const today = new Date().toISOString().split("T")[0] === dateStr;

                    return (
                        <button key={dateStr} onClick={() => records?.length && setSelected({ date: dateStr, records })}
                            className="relative flex flex-col items-center justify-start rounded-xl py-2 px-1 transition-all"
                            style={{
                                background: colors?.bg ?? "var(--input-bg)",
                                border: today ? "2px solid var(--btn-bg)" : "1px solid transparent",
                                cursor: records?.length ? "pointer" : "default",
                                minHeight: "52px",
                            }}>
                            <span className="text-[13px] font-bold" style={{ color: colors?.text ?? "var(--text-muted)" }}>{day}</span>
                            {status && (
                                <span className="text-[9px] font-semibold mt-0.5 capitalize" style={{ color: colors.text }}>
                                    {status.replace("_", " ")}
                                </span>
                            )}
                            {today && !status && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: "var(--btn-bg)" }} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Day detail popover */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
                    onClick={() => setSelected(null)}>
                    <div className="sd-section-card rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="sd-field-value text-[14px] font-bold">{fmtDate(selected.date)}</p>
                            <button onClick={() => setSelected(null)} className="sd-doc-view-btn w-7 h-7 rounded-full flex items-center justify-center">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {selected.records.map((r, i) => {
                                const c = STATUS_COLOR[r.status] ?? STATUS_COLOR.present;
                                return (
                                    <div key={i} className="rounded-xl px-4 py-3" style={{ background: c.bg }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
                                            <span className="text-[13px] font-bold capitalize" style={{ color: c.text }}>{r.status?.replace("_", " ")}</span>
                                        </div>
                                        <p className="sd-att-muted text-[12px]">{r.class_name} — Section {r.section_name}</p>
                                        {r.marked_by && <p className="sd-att-muted text-[11.5px] mt-0.5">Marked by: {r.marked_by}</p>}
                                        {r.remarks && <p className="sd-att-muted text-[11.5px] mt-0.5 italic">{r.remarks}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}