/**
 * MyAttendanceTable.jsx — paginated table of attendance records.
 * Pure presentational — receives records[], onEdit, onDelete.
 */
import React from "react";
import { Pencil, Trash2, Clock } from "lucide-react";
import Pagination from "../../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../../common/components/Pagination/usePagination.jsx";


function fmtDate(v) {
    if (!v) return "—";
    const d = new Date(v);
    return isNaN(d) ? String(v)
        : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
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

const STATUS_EMOJI = {
    present: "✅", absent: "❌", late: "⏰", half_day: "🌗", leave: "🏖️", holiday: "🎉", week_off: "📅",
};

export default function MyAttendanceTable({
    records = [],
    onEdit,
    onDelete,
    deletingId,
    initialPageSize = 15,
    pageSizeOptions = [10, 15, 25, 50],
}) {
    const sorted = [...records].sort(
        (a, b) => new Date(b.attendance_date) - new Date(a.attendance_date),
    );

    const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
        usePagination({ data: sorted, initialSize: initialPageSize });

    if (sorted.length === 0) {
        return (
            <div className="ma-table-card rounded-2xl p-12 text-center">
                <p className="ma-empty-state text-[13.5px]">No attendance records found for this period.</p>
            </div>
        );
    }

    return (
        <div className="ma-table-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="ma-thead text-[11.5px] uppercase tracking-wide">
                            <th className="px-5 py-3 font-semibold">Date</th>
                            <th className="px-3 py-3 font-semibold">Day</th>
                            <th className="px-3 py-3 font-semibold">Status</th>
                            <th className="px-3 py-3 font-semibold">Check-in</th>
                            <th className="px-3 py-3 font-semibold">Check-out</th>
                            <th className="px-3 py-3 font-semibold text-center">Work</th>
                            <th className="px-3 py-3 font-semibold text-center">OT</th>
                            <th className="px-3 py-3 font-semibold text-center">Late</th>
                            <th className="px-3 py-3 font-semibold">Remarks</th>
                            <th className="px-3 py-3 font-semibold text-right pr-5">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pagedData.map((r) => {
                            const dateStr = (r.attendance_date ?? "").split("T")[0].split(" ")[0];
                            const dayName = dateStr ? new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short" }) : "";
                            const checkIn = fmtTime(r.check_in);
                            const isLate = (r.late_minutes ?? 0) > 0;
                            const hasOT = (r.overtime_minutes ?? 0) > 0;

                            return (
                                <tr key={r.id} className="ma-row">
                                    {/* Date */}
                                    <td className="px-5 py-3.5">
                                        <p className="ma-cell-primary text-[13.5px] font-semibold">{fmtDate(dateStr)}</p>
                                    </td>

                                    {/* Day */}
                                    <td className="ma-cell-muted px-3 py-3.5 text-[13px]">{dayName}</td>

                                    {/* Status */}
                                    <td className="px-3 py-3.5">
                                        {r.status ? (
                                            <span className={`ma-status ma-status-${r.status}`}>
                                                {STATUS_EMOJI[r.status]} {r.status.replace("_", " ")}
                                            </span>
                                        ) : <span className="ma-cell-muted">—</span>}
                                    </td>

                                    {/* Check-in */}
                                    <td className="px-3 py-3.5">
                                        {checkIn ? (
                                            <div>
                                                <span className={`ma-time-chip ${isLate ? "ma-time-chip-late" : ""}`}>
                                                    <Clock size={11} />{checkIn}
                                                </span>
                                                {isLate && (
                                                    <p className="text-[11px] mt-0.5" style={{ color: "var(--warning)" }}>
                                                        +{fmtMins(r.late_minutes)} late
                                                    </p>
                                                )}
                                            </div>
                                        ) : <span className="ma-cell-muted text-[13px]">—</span>}
                                    </td>

                                    {/* Check-out */}
                                    <td className="px-3 py-3.5">
                                        {fmtTime(r.check_out)
                                            ? <span className="ma-time-chip"><Clock size={11} />{fmtTime(r.check_out)}</span>
                                            : <span className="ma-cell-muted text-[13px]">—</span>}
                                    </td>

                                    {/* Work hours */}
                                    <td className="px-3 py-3.5 text-center">
                                        <span className="text-[13px] font-semibold" style={{ color: "var(--success)" }}>
                                            {fmtMins(r.total_work_minutes)}
                                        </span>
                                    </td>

                                    {/* Overtime */}
                                    <td className="px-3 py-3.5 text-center">
                                        {hasOT
                                            ? <span className="text-[13px] font-semibold" style={{ color: "var(--btn-bg)" }}>+{fmtMins(r.overtime_minutes)}</span>
                                            : <span className="ma-cell-muted text-[13px]">—</span>}
                                    </td>

                                    {/* Late */}
                                    <td className="px-3 py-3.5 text-center">
                                        {isLate
                                            ? <span className="text-[13px] font-semibold" style={{ color: "var(--warning)" }}>{fmtMins(r.late_minutes)}</span>
                                            : <span className="ma-cell-muted text-[13px]">—</span>}
                                    </td>

                                    {/* Remarks */}
                                    <td className="px-3 py-3.5 max-w-[140px]">
                                        <p className="ma-cell-muted text-[12.5px] truncate">{r.remarks ?? "—"}</p>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-3 py-3.5">
                                        <div className="flex items-center justify-end gap-1 pr-2">
                                            <button onClick={() => onEdit?.(r)}
                                                className="ma-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                                title="Edit">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => onDelete?.(r)}
                                                disabled={deletingId === r.id}
                                                className="ma-action-btn ma-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                                                title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage} totalItems={totalItems}
                pageSize={pageSize} pageSizeOptions={pageSizeOptions}
                onPageChange={setPage} onPageSizeChange={setPageSize}
            />
        </div>
    );
}