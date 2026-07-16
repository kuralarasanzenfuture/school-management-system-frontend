import React from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";
import "../styles/SalaryComponent.css";

function TypeBadge({ type }) {
    const cls = {
        earning: "sc-type-earning",
        deduction: "sc-type-deduction",
        benefit: "sc-type-benefit",
    }[type] ?? "sc-type-earning";
    return <span className={`sc-type ${cls}`}>{type}</span>;
}

function CalcBadge({ calcType, value }) {
    const isPercent = calcType === "percentage";
    return (
        <div className="flex flex-col items-start gap-0.5">
            <span className={`sc-calc ${isPercent ? "sc-calc-percentage" : "sc-calc-fixed"}`}>
                {isPercent ? "%" : "₹"} {Number(value).toLocaleString("en-IN")}
            </span>
            <span className="sc-cell-muted text-[11px]">{isPercent ? "Percentage" : "Fixed"}</span>
        </div>
    );
}

function ValueType({ type, value }) {
    return (
        <span className="sc-cell-muted text-[11px]">
            {type === "percentage"
                ? `${value}%`
                : `₹${value}`}
        </span>
    );
}

// const valueType = (type, value) => (
//   <span className="sc-cell-muted text-[11px]">
//     {type === "percentage"
//       ? `${value}%`
//       : `₹${value}`}
//   </span>
// );

function BoolPill({ value, yesLabel = "Yes", noLabel = "No" }) {
    return (
        <span className={`sc-pill ${value ? "sc-pill-yes" : "sc-pill-no"}`}>
            {value ? <Check size={11} /> : <X size={11} />}
            {value ? yesLabel : noLabel}
        </span>
    );
}

export default function SalaryComponentTable({
    components = [],
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
    } = usePagination({ data: components, initialSize: initialPageSize });

    const colSpan = showSchoolColumn ? 8 : 7;
    console.log(pagedData)

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
                            <th className="px-3 py-3 font-semibold">Value Type</th>
                            {/* <th className="px-3 py-3 font-semibold text-center">Taxable</th> */}
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
                                        <TypeBadge type={comp.component_type} />
                                    </td>

                                    {/* Value + calc type */}
                                    {/* <td className="px-3 py-3.5">
                                        <CalcBadge calcType={comp.calculation_type} value={comp.value} />
                                    </td> */}
                                    {/* <td className="px-3 py-3.5">
                                        <ValueType
                                            type={comp.calculation_type}
                                            value={comp.value}
                                        />
                                    </td> */}

                                    {/* <td className="px-3 py-3.5">
                                        <span className="sc-cell-muted text-[11px]">
                                            {comp.calculation_type === "percentage" ? "Percentage(%)" : "Fixed ₹"}
                                        </span>
                                    </td> */}

                                    {/* <td className="px-3 py-3.5">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${comp.calculation_type === "percentage"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                                }`}
                                        >
                                            {comp.calculation_type === "percentage"
                                                ? "Percentage (%)"
                                                : "Fixed (₹)"}
                                        </span>
                                    </td> */}

                                    <td className="px-3 py-3.5">
                                        <span
                                            className={`sc-badge ${comp.calculation_type === "percentage"
                                                    ? "sc-badge-percentage"
                                                    : "sc-badge-fixed"
                                                }`}
                                        >
                                            {comp.calculation_type === "percentage"
                                                ? "Percentage (%)"
                                                : "Fixed (₹)"}
                                        </span>
                                    </td>

                                    {/* Taxable */}
                                    {/* <td className="px-3 py-3.5 text-center">
                                        <BoolPill
                                            value={Boolean(Number(comp.is_taxable))}
                                            yesLabel="Taxable"
                                            noLabel="Tax-free"
                                        />
                                    </td> */}

                                    {/* Status */}
                                    <td className="px-3 py-3.5 text-center">
                                        <span className={`sc-status sc-status-${comp.status}`}>
                                            {comp.status}
                                        </span>
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