// import React from "react";

// const STATUS_LABELS = {
//     present: "Present",
//     absent: "Absent",
//     late: "Late",
//     half_day: "Half Day",
//     leave: "Leave",
// };

// // Normalizes a status value so "PRESENT", "half-day", "Absent " etc.
// // all collapse to the canonical lowercase/underscore form used by
// // STATUS_LABELS and the statusOptions passed in from AttendancePage.
// // This is the safety net that makes the active-button highlight work
// // even if the backend returns a differently-cased or hyphenated value.
// const normalizeStatus = (raw) => {
//     if (!raw) return "";
//     return String(raw).trim().toLowerCase().replace(/-/g, "_");
// };

// /**
//  * Renders the editable attendance roster: one row per student with a
//  * segmented status picker (present/absent/late/half_day/leave) and an
//  * optional per-student remarks field. Purely presentational — all state
//  * lives in AttendancePage.
//  *
//  * @param {Array<object>} rows - roster rows (see AttendancePage for shape)
//  * @param {Array<string>} statusOptions
//  * @param {boolean} isLocked - disables all inputs when true
//  * @param {(admissionId, status) => void} setRowStatus
//  * @param {(admissionId, remarks) => void} setRowRemarks
//  */
// export default function AttendanceTable({
//     rows,
//     statusOptions,
//     isLocked,
//     setRowStatus,
//     setRowRemarks,
// }) {
//     return (
//         <div className="at-table-card rounded-2xl overflow-hidden">
//             <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                     <thead>
//                         <tr className="at-thead text-[11.5px] uppercase tracking-wide">
//                             <th className="px-5 py-3 font-semibold">Roll No</th>
//                             <th className="px-3 py-3 font-semibold">Student</th>
//                             <th className="px-3 py-3 font-semibold">Status</th>
//                             <th className="px-3 py-3 font-semibold">Remarks</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {rows.map((row) => {
//                             const initials =
//                                 `${row.first_name?.[0] ?? ""}${row.last_name?.[0] ?? ""}`.toUpperCase();
//                             const rowStatus = normalizeStatus(row.status);
//                             return (
//                                 <tr key={row.admission_id} className="at-row transition-colors">
//                                     <td className="at-cell-muted px-5 py-3 text-[13px]">
//                                         {row.roll_no || "—"}
//                                     </td>
//                                     <td className="px-3 py-3">
//                                         <div className="flex items-center gap-3">
//                                             <div className="at-avatar w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0">
//                                                 {initials}
//                                             </div>
//                                             <span className="at-cell-primary text-[13.5px] font-semibold">
//                                                 {row.first_name} {row.last_name}
//                                             </span>
//                                         </div>
//                                     </td>
//                                     <td className="px-3 py-3">
//                                         <div className="flex items-center gap-1 flex-wrap">
//                                             {statusOptions.map((status) => {
//                                                 const isActive = rowStatus === normalizeStatus(status);
//                                                 return (
//                                                     <button
//                                                         key={status}
//                                                         type="button"
//                                                         disabled={isLocked}
//                                                         onClick={() => setRowStatus(row.admission_id, status)}
//                                                         className={`at-status-btn at-status-btn-${status} ${isActive ? "at-status-btn-active" : ""
//                                                             } px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
//                                                     >
//                                                         {STATUS_LABELS[status]}
//                                                     </button>
//                                                 );
//                                             })}
//                                         </div>
//                                     </td>
//                                     <td className="px-3 py-3">
//                                         <input
//                                             type="text"
//                                             disabled={isLocked}
//                                             value={row.remarks}
//                                             onChange={(e) => setRowRemarks(row.admission_id, e.target.value)}
//                                             placeholder="Optional…"
//                                             className="at-remarks-input w-full rounded-lg px-2.5 py-1.5 text-[12.5px] disabled:opacity-60"
//                                         />
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }

import React from "react";

const STATUS_LABELS = {
    present: "Present",
    absent: "Absent",
    late: "Late",
    half_day: "Half Day",
    leave: "Leave",
};

// Normalizes a status value so "PRESENT", "half-day", "Absent " etc.
// all collapse to the canonical lowercase/underscore form used by
// STATUS_LABELS and the statusOptions passed in from AttendancePage.
const normalizeStatus = (raw) => {
    if (!raw) return "";
    return String(raw).trim().toLowerCase().replace(/-/g, "_");
};

/**
 * Renders the editable attendance roster: one row per student with a
 * segmented status picker (present/absent/late/half_day/leave) and an
 * optional per-student remarks field. A row with no status yet (nothing
 * defaults to "present" anymore — see AttendancePage) is visually flagged
 * so it's obvious which students still need a tap before you can save.
 *
 * @param {Array<object>} rows - roster rows (see AttendancePage for shape)
 * @param {Array<string>} statusOptions
 * @param {boolean} isLocked - disables all inputs when true
 * @param {(admissionId, status) => void} setRowStatus
 * @param {(admissionId, remarks) => void} setRowRemarks
 */
export default function AttendanceTable({
    rows,
    statusOptions,
    isLocked,
    setRowStatus,
    setRowRemarks,
}) {
    return (
        <div className="at-table-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="at-thead text-[11.5px] uppercase tracking-wide">
                            <th className="px-5 py-3 font-semibold">Roll No</th>
                            <th className="px-3 py-3 font-semibold">Student</th>
                            <th className="px-3 py-3 font-semibold">Status</th>
                            <th className="px-3 py-3 font-semibold">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => {
                            const initials =
                                `${row.first_name?.[0] ?? ""}${row.last_name?.[0] ?? ""}`.toUpperCase();
                            const rowStatus = normalizeStatus(row.status);
                            const isUnmarked = !rowStatus;
                            return (
                                <tr
                                    key={row.admission_id}
                                    className={`at-row transition-colors ${isUnmarked ? "at-row-unmarked" : ""}`}
                                >
                                    <td className="at-cell-muted px-5 py-3 text-[13px]">
                                        {row.roll_no || "—"}
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="at-avatar w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0">
                                                {initials}
                                            </div>
                                            <span className="at-cell-primary text-[13.5px] font-semibold">
                                                {row.first_name} {row.last_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-1 flex-wrap">
                                            {statusOptions.map((status) => {
                                                const isActive = rowStatus === normalizeStatus(status);
                                                return (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        disabled={isLocked}
                                                        onClick={() => setRowStatus(row.admission_id, status)}
                                                        className={`at-status-btn at-status-btn-${status} ${isActive ? "at-status-btn-active" : ""
                                                            } px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
                                                    >
                                                        {STATUS_LABELS[status]}
                                                    </button>
                                                );
                                            })}
                                            {isUnmarked && (
                                                <span className="at-unmarked-tag text-[11px] font-semibold ml-1">
                                                    Not marked
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <input
                                            type="text"
                                            disabled={isLocked}
                                            value={row.remarks}
                                            onChange={(e) => setRowRemarks(row.admission_id, e.target.value)}
                                            placeholder="Optional…"
                                            className="at-remarks-input w-full rounded-lg px-2.5 py-1.5 text-[12.5px] disabled:opacity-60"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
