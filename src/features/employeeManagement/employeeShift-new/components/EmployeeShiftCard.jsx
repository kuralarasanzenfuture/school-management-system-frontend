import React from "react";
import { Pencil, Trash2, Clock, Timer, Star, Moon } from "lucide-react";
import {
    formatTime,
    shiftTimelinePosition,
} from "../utils/shiftTimeUtils.js";

const HOUR_MARKS = [0, 6, 12, 18, 24];

// Normalizes 1/0/true/false into a real boolean.
function isTrue(value) {
    return value === true || value === 1 || value === "1";
}

export default function EmployeeShiftCard({
    shift,
    onEdit,
    onDelete,
    deleting,
}) {
    const isActive = shift.status === "active";
    const pos = shiftTimelinePosition(shift.start_time, shift.end_time);

    return (
        <div
            className={`es-card rounded-2xl p-5 flex flex-col gap-4 ${isActive ? "" : "es-card-inactive"}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="es-card-name text-[15px] font-bold truncate">
                            {shift.name}
                        </h3>
                        {isTrue(shift.is_default) && (
                            <span
                                className="es-default-badge inline-flex items-center gap-1"
                                title="Default shift for this school"
                            >
                                <Star size={10} fill="currentColor" /> Default
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span
                            className={`es-status ${isActive ? "es-status-active" : "es-status-inactive"}`}
                        >
                            {shift.status}
                        </span>
                        {shift.shift_type && (
                            <span className="es-type-badge capitalize">
                                {shift.shift_type}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => onEdit(shift)}
                        className="es-card-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        title="Edit"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(shift.id)}
                        disabled={deleting}
                        className="es-card-action-btn es-card-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <Clock size={15} className="es-card-time-icon shrink-0" />
                <span className="es-card-time text-[15px] font-semibold">
                    {formatTime(shift.start_time)}
                    <span className="es-card-time-dash"> – </span>
                    {formatTime(shift.end_time)}
                </span>
                {isTrue(shift.crosses_midnight) && (
                    <span
                        className="es-midnight-badge inline-flex items-center gap-1"
                        title="This shift spans into the next day"
                    >
                        <Moon size={11} /> Overnight
                    </span>
                )}
            </div>

            {/* 24h timeline strip showing where in the day this shift falls —
          also renders as two segments for overnight shifts. */}
            <div className="es-timeline">
                <div className="es-timeline-track">
                    <div
                        className="es-timeline-fill"
                        style={{ left: `${pos.leftPct}%`, width: `${pos.widthPct}%` }}
                    />
                    {pos.wraps && (
                        <div
                            className="es-timeline-fill"
                            style={{ left: 0, width: `${pos.secondSegmentWidthPct}%` }}
                        />
                    )}
                </div>
                <div className="es-timeline-marks">
                    {HOUR_MARKS.map((h) => (
                        <span key={h} className="es-timeline-mark">
                            {h === 24 ? "12a" : h === 0 ? "12a" : h === 12 ? "12p" : h}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <span className="es-chip inline-flex items-center gap-1.5">
                    <Timer size={12} />
                    {shift.working_hours != null ? `${shift.working_hours} hrs` : "—"}
                </span>
                <span className="es-chip">
                    +{shift.grace_minutes ?? 0} min grace
                </span>
            </div>
        </div>
    );
}