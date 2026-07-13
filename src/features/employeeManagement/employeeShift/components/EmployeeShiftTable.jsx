import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { formatTime } from "../utils/shiftTimeUtils.js";
import Pagination from "../../../../common/components/table/Pagination.jsx";
import usePagination from "../../../../common/components/table/usePagination.jsx";

const STATUS_CLASS = {
    active: "es-status-active",
    inactive: "es-status-inactive",
};

export default function EmployeeShiftTable({
    shifts,
    onEdit,
    onDelete,
    deletingId,
    showSchoolColumn = false,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50],
}) {
    const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
        usePagination({ data: shifts, initialSize: initialPageSize });

        // console.log("pagedData:", pagedData);
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
                        {pagedData.map((shift) => (
                            <tr key={shift.id} className="es-row transition-colors">
                                {showSchoolColumn && (
                                    <td className="es-cell px-5 py-3.5 text-[13px]">
                                        {shift.school_name || "—"}
                                    </td>
                                )}
                                <td
                                    className={`es-cell ${showSchoolColumn ? "px-3" : "px-5"} py-3.5 text-[13.5px] font-semibold`}
                                >
                                    {shift.name}
                                </td>
                                <td className="es-cell px-3 py-3.5 text-[13px]">
                                    {formatTime(shift.start_time)}
                                </td>
                                <td className="es-cell px-3 py-3.5 text-[13px]">
                                    {formatTime(shift.end_time)}
                                </td>
                                <td className="es-cell-muted px-3 py-3.5 text-[13px]">
                                    {shift.grace_minutes ?? 0} min
                                </td>
                                <td className="es-cell-muted px-3 py-3.5 text-[13px]">
                                    {shift.working_hours != null ? `${shift.working_hours} hrs` : "—"}
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
                                    colSpan={showSchoolColumn ? 8 : 7}
                                    className="es-empty-state px-5 py-10 text-center text-[13.5px]"
                                >
                                    No shifts found.
                                </td>
                            </tr>
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