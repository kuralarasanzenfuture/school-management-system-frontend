import React from "react";
import { Pencil, Trash2, Star, Moon } from "lucide-react";
import { formatTime } from "../utils/shiftTimeUtils.js";

const STATUS_CLASS = {
    active: "es-status-active",
    inactive: "es-status-inactive",
};

// Normalizes 1/0/true/false into a real boolean.
function isTrue(value) {
    return value === true || value === 1 || value === "1";
}

export default function EmployeeShiftTable({
    shifts,
    onEdit,
    onDelete,
    deletingId,
    showSchoolColumn = false,
}) {
    return (
        <div className="es-table-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="es-thead text-[11.5px] uppercase tracking-wide">
                            {showSchoolColumn && (
                                <th className="px-5 py-3 font-semibold">School</th>
                            )}
                            <th
                                className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold`}
                            >
                                Shift Name
                            </th>
                            <th className="px-3 py-3 font-semibold">Type</th>
                            <th className="px-3 py-3 font-semibold">Start</th>
                            <th className="px-3 py-3 font-semibold">End</th>
                            <th className="px-3 py-3 font-semibold">Grace</th>
                            <th className="px-3 py-3 font-semibold">Working Hours</th>
                            <th className="px-3 py-3 font-semibold">Status</th>
                            <th className="px-3 py-3 font-semibold text-right pr-5">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {shifts.map((shift) => (
                            <tr key={shift.id} className="es-row transition-colors">
                                {showSchoolColumn && (
                                    <td className="es-cell px-5 py-3.5 text-[13px]">
                                        {shift.school_name || "—"}
                                    </td>
                                )}
                                <td
                                    className={`es-cell ${showSchoolColumn ? "px-3" : "px-5"} py-3.5 text-[13.5px] font-semibold`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {shift.name}
                                        {isTrue(shift.is_default) && (
                                            <Star
                                                size={12}
                                                className="es-default-star"
                                                fill="currentColor"
                                                title="Default shift"
                                            />
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 py-3.5">
                                    {shift.shift_type && (
                                        <span className="es-type-badge capitalize">
                                            {shift.shift_type}
                                        </span>
                                    )}
                                </td>
                                <td className="es-cell px-3 py-3.5 text-[13px]">
                                    {formatTime(shift.start_time)}
                                </td>
                                <td className="es-cell px-3 py-3.5 text-[13px]">
                                    <div className="flex items-center gap-1.5">
                                        {formatTime(shift.end_time)}
                                        {isTrue(shift.crosses_midnight) && (
                                            <Moon
                                                size={12}
                                                className="es-midnight-icon"
                                                title="Crosses midnight"
                                            />
                                        )}
                                    </div>
                                </td>
                                <td className="es-cell-muted px-3 py-3.5 text-[13px]">
                                    {shift.grace_minutes ?? 0} min
                                </td>
                                <td className="es-cell-muted px-3 py-3.5 text-[13px]">
                                    {shift.working_hours != null
                                        ? `${shift.working_hours} hrs`
                                        : "—"}
                                </td>
                                <td className="px-3 py-3.5">
                                    <span
                                        className={`es-status ${STATUS_CLASS[shift.status] || "es-status-inactive"}`}
                                    >
                                        {shift.status}
                                    </span>
                                </td>
                                <td className="px-3 py-3.5">
                                    <div className="flex items-center justify-end gap-1 pr-2">
                                        <button
                                            onClick={() => onEdit(shift)}
                                            className="es-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(shift.id)}
                                            disabled={deletingId === shift.id}
                                            className="es-action-btn es-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                                            title="Delete"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {shifts.length === 0 && (
                            <tr>
                                <td
                                    colSpan={showSchoolColumn ? 9 : 8}
                                    className="es-empty-state px-5 py-10 text-center text-[13.5px]"
                                >
                                    No shifts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}