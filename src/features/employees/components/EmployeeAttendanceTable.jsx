/**
 * EmployeeAttendanceTable.jsx
 * Paginated table for employee attendance logs.
 * Receives logs[] directly — no Redux inside.
 */
import React from "react";
import { Clock, IndianRupee } from "lucide-react";
import Pagination from "../../../common/components/table/Pagination.jsx";
import usePagination from "../../../common/components/table/usePagination.jsx";
import { STATUS_COLOR } from "./EmployeeAttendanceCalendar.jsx";

function fmtDate(v) {
    if (!v) return "—";
    const d = new Date(v);
    return isNaN(d) ? String(v)
        : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(v) {
    if (!v) return "—";
    const d = new Date(v);
    return isNaN(d) ? "—" : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function fmtMins(m) {
    if (!m && m !== 0) return "—";
    const h = Math.floor(m / 60), min = m % 60;
    if (h === 0 && min === 0) return "0m";
    if (h === 0) return `${min}m`;
    return min === 0 ? `${h}h` : `${h}h ${min}m`;
}

export default function EmployeeAttendanceTable({
    logs = [],
    initialPageSize = 15,
    pageSizeOptions = [10, 15, 25, 50],
}) {
    const sorted = [...logs].sort(
        (a, b) => new Date(b.attendance_date) - new Date(a.attendance_date),
    );

    const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
        usePagination({ data: sorted, initialSize: initialPageSize });

    if (sorted.length === 0) {
        return (
            <div className="ed-section-card rounded-2xl p-12 text-center">
                <p className="ed-field-label text-[13.5px]">No attendance records found for this period.</p>
            </div>
        );
    }

    return (
        <div className="ed-section-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="ed-salary-thead text-[11.5px] uppercase tracking-wide">
                            <th className="px-5 py-3 font-semibold">Date</th>
                            <th className="px-3 py-3 font-semibold">Day</th>
                            <th className="px-3 py-3 font-semibold">Status</th>
                            <th className="px-3 py-3 font-semibold">Check-in</th>
                            <th className="px-3 py-3 font-semibold">Check-out</th>
                            <th className="px-3 py-3 font-semibold text-center">Work</th>
                            <th className="px-3 py-3 font-semibold text-center">Overtime</th>
                            <th className="px-3 py-3 font-semibold text-center">Late</th>
                            <th className="px-3 py-3 font-semibold">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedData.map((r) => {
                            const dateStr = r.attendance_date?.split("T")[0]?.split(" ")[0];
                            const dayStr = dateStr
                                ? new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short" })
                                : "";
                            const colors = STATUS_COLOR[r.status] ?? null;
                            const isLate = (r.late_minutes ?? 0) > 0;
                            const hasOT = (r.overtime_minutes ?? 0) > 0;

                            return (
                                <tr key={r.id} className="ed-salary-row">
                                    {/* Date */}
                                    <td className="px-5 py-3.5">
                                        <p className="ed-salary-primary text-[13.5px] font-semibold">{fmtDate(dateStr)}</p>
                                    </td>

                                    {/* Day */}
                                    <td className="px-3 py-3.5 ed-salary-muted text-[13px]">{dayStr}</td>

                                    {/* Status badge */}
                                    <td className="px-3 py-3.5">
                                        {r.status ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold capitalize"
                                                style={{ background: colors?.bg ?? "var(--input-bg)", color: colors?.text ?? "var(--text-muted)" }}>
                                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: colors?.dot ?? "var(--text-muted)" }} />
                                                {r.status.replace("_", " ")}
                                            </span>
                                        ) : <span className="ed-salary-muted">—</span>}
                                    </td>

                                    {/* Check-in */}
                                    <td className="px-3 py-3.5">
                                        <span className="inline-flex items-center gap-1 text-[13px]"
                                            style={{ color: isLate ? "var(--warning)" : "var(--text-secondary)" }}>
                                            <Clock size={12} />
                                            {fmtTime(r.check_in)}
                                        </span>
                                        {isLate && (
                                            <p className="text-[11px] mt-0.5" style={{ color: "var(--warning)" }}>
                                                +{fmtMins(r.late_minutes)} late
                                            </p>
                                        )}
                                    </td>

                                    {/* Check-out */}
                                    <td className="px-3 py-3.5">
                                        <span className="inline-flex items-center gap-1 ed-salary-muted text-[13px]">
                                            <Clock size={12} />
                                            {fmtTime(r.check_out)}
                                        </span>
                                    </td>

                                    {/* Work hours */}
                                    <td className="px-3 py-3.5 text-center">
                                        <span className="text-[13px] font-semibold" style={{ color: "var(--success)" }}>
                                            {fmtMins(r.total_work_minutes)}
                                        </span>
                                    </td>

                                    {/* Overtime */}
                                    <td className="px-3 py-3.5 text-center">
                                        {hasOT ? (
                                            <span className="text-[13px] font-semibold" style={{ color: "var(--btn-bg)" }}>
                                                +{fmtMins(r.overtime_minutes)}
                                            </span>
                                        ) : (
                                            <span className="ed-salary-muted text-[13px]">—</span>
                                        )}
                                    </td>

                                    {/* Late minutes */}
                                    <td className="px-3 py-3.5 text-center">
                                        {isLate ? (
                                            <span className="text-[13px] font-semibold" style={{ color: "var(--warning)" }}>
                                                {fmtMins(r.late_minutes)}
                                            </span>
                                        ) : (
                                            <span className="ed-salary-muted text-[13px]">—</span>
                                        )}
                                    </td>

                                    {/* Remarks */}
                                    <td className="px-3 py-3.5 max-w-[140px]">
                                        <p className="ed-salary-muted text-[12.5px] truncate">{r.remarks ?? "—"}</p>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
            />
        </div>
    );
}