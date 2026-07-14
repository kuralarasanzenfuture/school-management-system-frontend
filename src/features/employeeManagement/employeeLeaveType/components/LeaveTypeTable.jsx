import React from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";
import "../styles/LeaveType.css";

function BoolPill({ value, yesLabel = "Yes", noLabel = "No" }) {
    return (
        <span className={`lt-pill ${value ? "lt-pill-yes" : "lt-pill-no"}`}>
            {value ? <Check size={11} /> : <X size={11} />}
            {value ? yesLabel : noLabel}
        </span>
    );
}

function GenderBadge({ gender }) {
    const cls = { all: "lt-gender-all", male: "lt-gender-male", female: "lt-gender-female" }[gender] ?? "lt-gender-all";
    const label = { all: "All", male: "Male", female: "Female" }[gender] ?? gender;
    return <span className={`lt-pill ${cls}`}>{label}</span>;
}

export default function LeaveTypeTable({
    leaveTypes = [],
    onEdit,
    onDelete,
    showSchoolColumn = false,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50],
}) {
    const {
        pagedData,
        currentPage,
        pageSize,
        totalItems,
        setPage,
        setPageSize,
    } = usePagination({ data: leaveTypes, initialSize: initialPageSize });

    const colSpan = showSchoolColumn ? 10 : 9;

    return (
        <div className="lt-table-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="lt-thead text-[11.5px] uppercase tracking-wide">
                            {showSchoolColumn && <th className="px-5 py-3 font-semibold">School</th>}
                            <th className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold`}>Leave Type</th>
                            <th className="px-3 py-3 font-semibold">Code</th>
                            <th className="px-3 py-3 font-semibold text-center">Days/Year</th>
                            <th className="px-3 py-3 font-semibold text-center">Max/Request</th>
                            <th className="px-3 py-3 font-semibold text-center">Paid</th>
                            <th className="px-3 py-3 font-semibold text-center">Carry Fwd</th>
                            <th className="px-3 py-3 font-semibold text-center">Gender</th>
                            <th className="px-3 py-3 font-semibold text-center">Status</th>
                            <th className="px-3 py-3 font-semibold text-right pr-5">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pagedData.length === 0 ? (
                            <tr>
                                <td colSpan={colSpan} className="lt-empty-state px-5 py-12 text-center text-[13.5px]">
                                    No leave types found.
                                </td>
                            </tr>
                        ) : (
                            pagedData.map((leaveType) => (
                                <tr key={leaveType.id} className="lt-row">

                                    {showSchoolColumn && (
                                        <td className="lt-cell-secondary px-5 py-3.5 text-[13px]">
                                            {leaveType.school_name ?? "—"}
                                        </td>
                                    )}

                                    {/* Name + description */}
                                    <td className={`${showSchoolColumn ? "px-3" : "px-5"} py-3.5`}>
                                        <p className="lt-cell-primary text-[13.5px] font-semibold">{leaveType.name}</p>
                                        {leaveType.description && (
                                            <p className="lt-cell-muted text-[12px] mt-0.5 max-w-[200px] truncate">
                                                {leaveType.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                            {leaveType.allow_half_day && <span className="lt-pill lt-pill-yes text-[10.5px]">½ Day</span>}
                                            {leaveType.requires_approval && <span className="lt-pill lt-pill-no  text-[10.5px]">Approval</span>}
                                            {leaveType.requires_attachment && <span className="lt-pill lt-pill-no text-[10.5px]">Docs</span>}
                                        </div>
                                    </td>

                                    {/* Code */}
                                    <td className="px-3 py-3.5">
                                        <span className="lt-code">{leaveType.code}</span>
                                    </td>

                                    {/* Days per year */}
                                    <td className="px-3 py-3.5 text-center">
                                        <span className="lt-cell-primary text-[13.5px] font-semibold">
                                            {leaveType.days_per_year}
                                        </span>
                                    </td>

                                    {/* Max per request */}
                                    <td className="lt-cell-muted px-3 py-3.5 text-[13px] text-center">
                                        {leaveType.max_days_per_request ?? "—"}
                                    </td>

                                    {/* Paid */}
                                    <td className="px-3 py-3.5 text-center">
                                        <BoolPill value={Boolean(Number(leaveType.is_paid))} yesLabel="Paid" noLabel="Unpaid" />
                                    </td>

                                    {/* Carry forward */}
                                    <td className="px-3 py-3.5 text-center">
                                        {Boolean(Number(leaveType.carry_forward)) ? (
                                            <div className="flex flex-col items-center gap-0.5">
                                                <BoolPill value={true} yesLabel="Yes" />
                                                {Number(leaveType.max_carry_forward_days) > 0 && (
                                                    <span className="lt-cell-muted text-[11px]">
                                                        Max {leaveType.max_carry_forward_days}d
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <BoolPill value={false} noLabel="No" />
                                        )}
                                    </td>

                                    {/* Gender */}
                                    <td className="px-3 py-3.5 text-center">
                                        <GenderBadge gender={leaveType.applicable_gender} />
                                    </td>

                                    {/* Status */}
                                    <td className="px-3 py-3.5 text-center">
                                        <span className={`lt-status lt-status-${leaveType.status}`}>
                                            {leaveType.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-3 py-3.5">
                                        <div className="flex items-center justify-end gap-1 pr-2">
                                            <button onClick={() => onEdit(leaveType)}
                                                className="lt-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors" title="Edit">
                                                <Pencil size={15} />
                                            </button>
                                            <button onClick={() => onDelete(leaveType)}
                                                className="lt-action-btn lt-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors" title="Delete">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))
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