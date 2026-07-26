/**
 * StudentAttendancePeriodTable.jsx
 * Table view for period-wise attendance records.
 */
import React from "react";
import Pagination from "../../../common/components/table/Pagination.jsx";
import usePagination from "../../../common/components/table/usePagination.jsx";

function fmtDate(v) {
    if (!v) return "—";
    const d = new Date(v);
    return isNaN(d) ? String(v) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function StudentAttendancePeriodTable({ rows = [] }) {
    /* flatten: date → periods[] → records[] */
    const flat = rows.flatMap(({ date, periods }) =>
        (periods ?? []).flatMap(({ period_no, records }) =>
            (records ?? []).map((r) => ({ date, period_no, ...r })),
        ),
    ).sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        return dateDiff !== 0 ? dateDiff : a.period_no - b.period_no;
    });

    const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
        usePagination({ data: flat, initialSize: 15 });

    if (flat.length === 0) {
        return <p className="sd-att-muted text-[13.5px] text-center py-10">No period attendance records found.</p>;
    }

    return (
        <div className="sd-att-table-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="sd-att-thead text-[11.5px] uppercase tracking-wide">
                            <th className="px-5 py-3 font-semibold">Date</th>
                            <th className="px-3 py-3 font-semibold">Period</th>
                            <th className="px-3 py-3 font-semibold">Class / Section</th>
                            <th className="px-3 py-3 font-semibold">Status</th>
                            <th className="px-3 py-3 font-semibold">Marked By</th>
                            <th className="px-3 py-3 font-semibold">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedData.map((r, i) => (
                            <tr key={r.attendance_id ?? i} className="sd-att-row">
                                <td className="sd-att-cell px-5 py-3 text-[13.5px] font-medium">{fmtDate(r.date)}</td>
                                <td className="px-3 py-3">
                                    <span className="sd-att-cell text-[13px] font-semibold"
                                        style={{ background: "var(--badge-bg)", color: "var(--btn-bg)", padding: "2px 8px", borderRadius: "6px" }}>
                                        P{r.period_no}
                                    </span>
                                </td>
                                <td className="sd-att-cell px-3 py-3 text-[13px]">
                                    {r.class_name} {r.section_name ? `— ${r.section_name}` : ""}
                                </td>
                                <td className="px-3 py-3">
                                    <span className={`sd-att-status sd-att-status-${r.status}`}>
                                        {r.status?.replace("_", " ")}
                                    </span>
                                </td>
                                <td className="sd-att-muted px-3 py-3 text-[13px]">{r.marked_by ?? "—"}</td>
                                <td className="sd-att-muted px-3 py-3 text-[12.5px] max-w-[160px]">
                                    <p className="truncate">{r.remarks ?? "—"}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination
                currentPage={currentPage} totalItems={totalItems} pageSize={pageSize}
                pageSizeOptions={[10, 15, 25, 50]} onPageChange={setPage} onPageSizeChange={setPageSize}
            />
        </div>
    );
}