/**
 * StudentAttendanceDailyTable.jsx
 * Table view for daily attendance records.
 */
import React from "react";
import Pagination from "../../../common/components/table/Pagination.jsx";
import usePagination from "../../../common/components/table/usePagination.jsx";

function fmtDate(v) {
    if (!v) return "—";
    const d = new Date(v);
    return isNaN(d) ? String(v) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function StudentAttendanceDailyTable({ rows = [] }) {
    /* flatten dailyData → one row per record */
    const flat = rows.flatMap(({ date, records }) =>
        (records ?? []).map((r) => ({ date, ...r })),
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
        usePagination({ data: flat, initialSize: 15 });

    if (flat.length === 0) {
        return <p className="sd-att-muted text-[13.5px] text-center py-10">No daily attendance records found.</p>;
    }

    return (
        <div className="sd-att-table-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="sd-att-thead text-[11.5px] uppercase tracking-wide">
                            <th className="px-5 py-3 font-semibold">Date</th>
                            <th className="px-3 py-3 font-semibold">Day</th>
                            <th className="px-3 py-3 font-semibold">Class / Section</th>
                            <th className="px-3 py-3 font-semibold">Status</th>
                            <th className="px-3 py-3 font-semibold">Marked By</th>
                            <th className="px-3 py-3 font-semibold">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedData.map((r, i) => {
                            const d = new Date(r.date);
                            const day = isNaN(d) ? "" : d.toLocaleDateString("en-IN", { weekday: "short" });
                            return (
                                <tr key={r.attendance_id ?? i} className="sd-att-row">
                                    <td className="sd-att-cell px-5 py-3 text-[13.5px] font-medium">{fmtDate(r.date)}</td>
                                    <td className="sd-att-muted px-3 py-3 text-[13px]">{day}</td>
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
                            );
                        })}
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