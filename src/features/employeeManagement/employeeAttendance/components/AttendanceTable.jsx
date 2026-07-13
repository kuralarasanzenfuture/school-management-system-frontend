import React from "react";
import { Pencil, Trash2, Clock } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";
import "../styles/EmployeeAttendance.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function formatTime(datetimeString) {
    if (!datetimeString) return null;
    const dateObj = new Date(datetimeString);
    if (isNaN(dateObj)) return null;
    return dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", hour12: true,
    });
}

function formatMinutes(totalMinutes) {
    if (!totalMinutes && totalMinutes !== 0) return "—";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function getInitials(firstName, lastName) {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

export default function AttendanceTable({
    records = [],
    onEdit,
    onDelete,
    deletingId,
    showSchoolColumn = false,
    initialPageSize = 15,
    pageSizeOptions = [10, 15, 25, 50],
}) {
    const {
        pagedData,
        currentPage,
        pageSize,
        totalItems,
        setPage,
        setPageSize,
    } = usePagination({ data: records, initialSize: initialPageSize });

    const colSpan = showSchoolColumn ? 9 : 8;

    return (
        <div className="ea-table-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="ea-thead text-[11.5px] uppercase tracking-wide">
                            {showSchoolColumn && <th className="px-5 py-3 font-semibold">School</th>}
                            <th className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold`}>Employee</th>
                            <th className="px-3 py-3 font-semibold">Date</th>
                            <th className="px-3 py-3 font-semibold">Status</th>
                            <th className="px-3 py-3 font-semibold">Check-in</th>
                            <th className="px-3 py-3 font-semibold">Check-out</th>
                            <th className="px-3 py-3 font-semibold">Work</th>
                            <th className="px-3 py-3 font-semibold">Remarks</th>
                            <th className="px-3 py-3 font-semibold text-right pr-5">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pagedData.length === 0 ? (
                            <tr>
                                <td colSpan={colSpan} className="ea-empty-state px-5 py-12 text-center text-[13.5px]">
                                    No attendance records found.
                                </td>
                            </tr>
                        ) : (
                            pagedData.map((record) => {
                                const checkInTime = formatTime(record.check_in);
                                const checkOutTime = formatTime(record.check_out);
                                const isLate = record.late_minutes > 0;
                                const photoUrl = record.photo_url
                                    ? `${API_URL}${record.photo_url.startsWith("/") ? "" : "/"}${record.photo_url}`
                                    : null;

                                return (
                                    <tr key={record.id} className="ea-row">

                                        {showSchoolColumn && (
                                            <td className="ea-cell-secondary px-5 py-3.5 text-[13px]">
                                                {record.school_name ?? "—"}
                                            </td>
                                        )}

                                        {/* Employee */}
                                        <td className={`${showSchoolColumn ? "px-3" : "px-5"} py-3.5`}>
                                            <div className="flex items-center gap-3">
                                                <div className="ea-avatar w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 overflow-hidden">
                                                    {photoUrl
                                                        ? <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                                                        : getInitials(record.first_name, record.last_name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="ea-cell-primary text-[13.5px] font-semibold truncate">
                                                        {record.first_name} {record.last_name ?? ""}
                                                    </p>
                                                    <p className="ea-cell-muted text-[12px] truncate">
                                                        {record.employee_code ?? ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="ea-cell-secondary px-3 py-3.5 text-[13px]">
                                            {record.attendance_date
                                                ? new Date(record.attendance_date).toLocaleDateString("en-IN", {
                                                    day: "2-digit", month: "short", year: "numeric",
                                                })
                                                : "—"}
                                        </td>

                                        {/* Status */}
                                        <td className="px-3 py-3.5">
                                            <span className={`ea-status ea-status-${record.status}`}>
                                                {record.status?.replace("_", " ")}
                                            </span>
                                        </td>

                                        {/* Check-in */}
                                        <td className="px-3 py-3.5">
                                            {checkInTime ? (
                                                <span className={`ea-time-chip ${isLate ? "ea-time-chip-late" : ""}`}>
                                                    <Clock size={11} className="inline mr-1" />
                                                    {checkInTime}
                                                </span>
                                            ) : (
                                                <span className="ea-cell-muted text-[13px]">—</span>
                                            )}
                                        </td>

                                        {/* Check-out */}
                                        <td className="px-3 py-3.5">
                                            {checkOutTime ? (
                                                <span className="ea-time-chip">
                                                    <Clock size={11} className="inline mr-1" />
                                                    {checkOutTime}
                                                </span>
                                            ) : (
                                                <span className="ea-cell-muted text-[13px]">—</span>
                                            )}
                                        </td>

                                        {/* Work hours */}
                                        <td className="px-3 py-3.5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="ea-cell-secondary text-[12.5px] font-medium">
                                                    {formatMinutes(record.total_work_minutes)}
                                                </span>
                                                {record.overtime_minutes > 0 && (
                                                    <span className="ea-icon-present text-[11px] font-medium">
                                                        +{formatMinutes(record.overtime_minutes)} OT
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Remarks */}
                                        <td className="px-3 py-3.5 max-w-[160px]">
                                            <p className="ea-cell-muted text-[12.5px] truncate">
                                                {record.remarks ?? "—"}
                                            </p>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-3 py-3.5">
                                            <div className="flex items-center justify-end gap-1 pr-2">
                                                <button
                                                    onClick={() => onEdit?.(record)}
                                                    className="ea-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete?.(record.id)}
                                                    disabled={deletingId === record.id}
                                                    className="ea-action-btn ea-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                );
                            })
                        )}
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