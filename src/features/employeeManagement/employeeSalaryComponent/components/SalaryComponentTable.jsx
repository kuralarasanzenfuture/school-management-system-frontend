import React from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";
import "../styles/SalaryComponent.css";

function TypeBadge({ type }) {
    const isEarning = type === "earning";
    return (
        <span className={`sc-type ${isEarning ? "sc-type-earning" : "sc-type-deduction"}`}>
            {isEarning ? "+ Earning" : "- Deduction"}
        </span>
    );
}

export default function SalaryComponentTable({
    components = [],
    onEdit,
    onDelete,
    onToggleStatus,
    togglingId,
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
    } = usePagination({ data: components, initialSize: initialPageSize });

    const colSpan = showSchoolColumn ? 7 : 6;

    return (
        <div className="sc-table-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="sc-thead text-[11.5px] uppercase tracking-wide">
                            {showSchoolColumn && <th className="px-5 py-3 font-semibold">School</th>}
                            <th className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold`}>Component</th>
                            <th className="px-3 py-3 font-semibold">Code</th>
                            <th className="px-3 py-3 font-semibold">Type</th>
                            <th className="px-3 py-3 font-semibold">Calculation Type</th>
                            <th className="px-3 py-3 font-semibold text-center">Status</th>
                            <th className="px-3 py-3 font-semibold text-right pr-5">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pagedData.length === 0 ? (
                            <tr>
                                <td colSpan={colSpan}
                                    className="sc-empty-state px-5 py-12 text-center text-[13.5px]">
                                    No salary components found.
                                </td>
                            </tr>
                        ) : (
                            pagedData.map((comp) => (
                                <tr key={comp.id} className="sc-row">

                                    {showSchoolColumn && (
                                        <td className="sc-cell-secondary px-5 py-3.5 text-[13px]">
                                            {comp.school_name ?? "—"}
                                        </td>
                                    )}

                                    {/* Name + description */}
                                    <td className={`${showSchoolColumn ? "px-3" : "px-5"} py-3.5`}>
                                        <p className="sc-cell-primary text-[13.5px] font-semibold">{comp.name}</p>
                                        {comp.description && (
                                            <p className="sc-cell-muted text-[12px] mt-0.5 max-w-[220px] truncate">
                                                {comp.description}
                                            </p>
                                        )}
                                    </td>

                                    {/* Code */}
                                    <td className="px-3 py-3.5">
                                        <span className="sc-code">{comp.code}</span>
                                    </td>

                                    {/* Type */}
                                    <td className="px-3 py-3.5">
                                        <TypeBadge type={comp.component_type || comp.type} />
                                    </td>

                                    {/* Calculation Type */}
                                    <td className="px-3 py-3.5">
                                        <span
                                            className={`sc-badge ${
                                                comp.calculation_type === "percentage"
                                                    ? "sc-badge-percentage"
                                                    : "sc-badge-fixed"
                                            }`}
                                        >
                                            {comp.calculation_type === "percentage"
                                                ? "% Percentage"
                                                : "₹ Fixed Amount"}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-3 py-3.5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {togglingId === comp.id ? (
                                                <Loader2 size={16} className="animate-spin text-primary" />
                                            ) : (
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={comp.status === "active"}
                                                    disabled={togglingId === comp.id}
                                                    onClick={() =>
                                                        onToggleStatus &&
                                                        onToggleStatus(
                                                            comp,
                                                            comp.status === "active" ? "inactive" : "active"
                                                        )
                                                    }
                                                    title={`Click to ${
                                                        comp.status === "active" ? "deactivate" : "activate"
                                                    } component`}
                                                    className={`sc-toggle-switch ${
                                                        comp.status === "active"
                                                            ? "sc-toggle-active"
                                                            : "sc-toggle-inactive"
                                                    }`}
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className={`sc-toggle-knob ${
                                                            comp.status === "active"
                                                                ? "sc-toggle-knob-active"
                                                                : "sc-toggle-knob-inactive"
                                                        }`}
                                                    />
                                                </button>
                                            )}
                                            <span className={`sc-status sc-status-${comp.status}`}>
                                                {comp.status}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-3 py-3.5">
                                        <div className="flex items-center justify-end gap-1 pr-2">
                                            <button onClick={() => onEdit(comp)}
                                                className="sc-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                                title="Edit">
                                                <Pencil size={15} />
                                            </button>
                                            <button onClick={() => onDelete(comp)}
                                                className="sc-action-btn sc-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                                title="Delete">
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

            {/* Pagination footer */}
            <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={pageSizeOptions}
            />
        </div>
    );
}