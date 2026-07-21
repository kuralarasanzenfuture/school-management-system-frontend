import React from "react";
import { Pencil, Trash2, IndianRupee, Percent } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";
import "../styles/SalaryStructureDetail.css";

function AmountDisplay({ detail }) {
    const isEarning = detail.component_type === "earning";
    const isPercent = detail.calculation_type === "percentage";

    return (
        <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-1">
                {isPercent
                    ? <Percent size={13} className="ssd-cell-secondary" />
                    : <IndianRupee size={13} className="ssd-cell-secondary" />}
                <span className={`ssd-amount ${isEarning ? "ssd-amount-earning" : "ssd-amount-deduction"}`}>
                    {isPercent
                        ? `${Number(detail.percentage ?? 0).toFixed(2)}%`
                        : `₹${Number(detail.amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                </span>
            </div>
            {isPercent && detail.based_on && (
                <span className="ssd-based-on">of {detail.based_on}</span>
            )}
        </div>
    );
}

export default function SalaryStructureDetailTable({
    details = [],
    onEdit,
    onDelete,
    showStructureColumn = true,
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
    } = usePagination({ data: details, initialSize: initialPageSize });

    const colSpan = showStructureColumn ? 6 : 5;

    // console.log(pagedData)

    return (
        <div className="ssd-table-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="ssd-thead text-[11.5px] uppercase tracking-wide">
                            {showStructureColumn && (
                                <th className="px-5 py-3 font-semibold">Structure</th>
                            )}
                            <th className={`${showStructureColumn ? "px-3" : "px-5"} py-3 font-semibold`}>
                                Component
                            </th>
                            <th className="px-3 py-3 font-semibold">Type</th>
                            <th className="px-3 py-3 font-semibold">Calc Type</th>
                            <th className="px-3 py-3 font-semibold">Value</th>
                            <th className="px-3 py-3 font-semibold text-right pr-5">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pagedData.length === 0 ? (
                            <tr>
                                <td colSpan={colSpan}
                                    className="ssd-empty-state px-5 py-12 text-center text-[13.5px]">
                                    No salary details found.
                                </td>
                            </tr>
                        ) : (
                            pagedData.map((detail) => (
                                <tr key={detail.id} className="ssd-row">

                                    {showStructureColumn && (
                                        <td className="px-5 py-3.5 max-w-[180px]">
                                            <span className="ssd-structure-tag" title={detail.structure_name}>
                                                {detail.structure_name}
                                            </span>
                                        </td>
                                    )}

                                    {/* Component name */}
                                    <td className={`${showStructureColumn ? "px-3" : "px-5"} py-3.5`}>
                                        <p className="ssd-cell-primary text-[13.5px] font-semibold">
                                            {detail.component_name}
                                        </p>
                                    </td>

                                    {/* Component type */}
                                    <td className="px-3 py-3.5">
                                        <span className={`ssd-comp-type ssd-comp-type-${detail.component_type ?? "earning"}`}>
                                            {detail.component_type}
                                        </span>
                                    </td>

                                    {/* Calc type chip */}
                                    <td className="px-3 py-3.5">
                                        <span className={`ssd-calc-chip ssd-calc-${detail.calculation_type}`}>
                                            {detail.calculation_type === "fixed"
                                                ? <><IndianRupee size={11} /> Fixed</>
                                                : <><Percent size={11} /> Percentage</>}
                                        </span>
                                    </td>

                                    {/* Value */}
                                    <td className="px-3 py-3.5">
                                        <AmountDisplay detail={detail} />
                                    </td>

                                    {/* Actions */}
                                    <td className="px-3 py-3.5">
                                        <div className="flex items-center justify-end gap-1 pr-2">
                                            <button
                                                onClick={() => onEdit(detail)}
                                                className="ssd-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(detail)}
                                                className="ssd-action-btn ssd-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                                title="Remove"
                                            >
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