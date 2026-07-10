// import React from "react";
// import { Pencil, Trash2 } from "lucide-react";

// const STATUS_CLASS = {
//   active: "sj-status-active",
//   inactive: "sj-status-inactive",
// };

// const TYPE_CLASS = {
//   theory: "sj-type-theory",
//   practical: "sj-type-practical",
//   both: "sj-type-both",
// };

// export default function SubjectTable({
//   subjects,
//   onEdit,
//   onDelete,
//   deletingId,
//   showSchoolColumn = false,
// }) {
//   return (
//     <div className="sj-table-card rounded-2xl overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full text-left">
//           <thead>
//             <tr className="sj-thead text-[11.5px] uppercase tracking-wide">
//               {showSchoolColumn && (
//                 <th className="px-5 py-3 font-semibold">School</th>
//               )}
//               <th
//                 className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold`}
//               >
//                 Subject
//               </th>
//               <th className="px-3 py-3 font-semibold">Code</th>
//               <th className="px-3 py-3 font-semibold">Type</th>
//               <th className="px-3 py-3 font-semibold">Status</th>
//               <th className="px-3 py-3 font-semibold text-right pr-5">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {subjects.map((subj) => (
//               <tr key={subj.id} className="sj-row transition-colors">
//                 {showSchoolColumn && (
//                   <td className="sj-cell px-5 py-3.5 text-[13px]">
//                     {subj.school_name || "—"}
//                   </td>
//                 )}
//                 <td
//                   className={`sj-cell ${showSchoolColumn ? "px-3" : "px-5"} py-3.5 text-[13.5px] font-semibold`}
//                 >
//                   {subj.name}
//                 </td>
//                 <td className="sj-cell-muted px-3 py-3.5 text-[13px]">
//                   {subj.code || "—"}
//                 </td>
//                 <td className="px-3 py-3.5">
//                   <span
//                     className={`sj-type-pill ${TYPE_CLASS[subj.subject_type] || "sj-type-theory"}`}
//                   >
//                     {subj.subject_type}
//                   </span>
//                 </td>
//                 <td className="px-3 py-3.5">
//                   <span
//                     className={`sj-status ${STATUS_CLASS[subj.status] || "sj-status-inactive"}`}
//                   >
//                     {subj.status}
//                   </span>
//                 </td>
//                 <td className="px-3 py-3.5">
//                   <div className="flex items-center justify-end gap-1 pr-2">
//                     <button
//                       onClick={() => onEdit(subj)}
//                       className="sj-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//                       title="Edit"
//                     >
//                       <Pencil size={15} />
//                     </button>
//                     <button
//                       onClick={() => onDelete(subj.id)}
//                       disabled={deletingId === subj.id}
//                       className="sj-action-btn sj-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
//                       title="Delete"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {subjects.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={showSchoolColumn ? 6 : 5}
//                   className="sj-empty-state px-5 py-10 text-center text-[13.5px]"
//                 >
//                   No subjects found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";

const STATUS_CLASS = {
  active: "sj-status-active",
  inactive: "sj-status-inactive",
};

const TYPE_CLASS = {
  theory: "sj-type-theory",
  practical: "sj-type-practical",
  both: "sj-type-both",
};

export default function SubjectTable({
  subjects,
  onEdit,
  onDelete,
  deletingId,
  showSchoolColumn = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: subjects, initialSize: initialPageSize });
  return (
    <div className="sj-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="sj-thead text-[11.5px] uppercase tracking-wide">
              {showSchoolColumn && (
                <th className="px-5 py-3 font-semibold">School</th>
              )}
              <th
                className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold`}
              >
                Subject
              </th>
              <th className="px-3 py-3 font-semibold">Code</th>
              <th className="px-3 py-3 font-semibold">Type</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((subj) => (
              <tr key={subj.id} className="sj-row transition-colors">
                {showSchoolColumn && (
                  <td className="sj-cell px-5 py-3.5 text-[13px]">
                    {subj.school_name || "—"}
                  </td>
                )}
                <td
                  className={`sj-cell ${showSchoolColumn ? "px-3" : "px-5"} py-3.5 text-[13.5px] font-semibold`}
                >
                  {subj.name}
                </td>
                <td className="sj-cell-muted px-3 py-3.5 text-[13px]">
                  {subj.code || "—"}
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`sj-type-pill ${TYPE_CLASS[subj.subject_type] || "sj-type-theory"}`}
                  >
                    {subj.subject_type}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`sj-status ${STATUS_CLASS[subj.status] || "sj-status-inactive"}`}
                  >
                    {subj.status}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center justify-end gap-1 pr-2">
                    <button
                      onClick={() => onEdit(subj)}
                      className="sj-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(subj.id)}
                      disabled={deletingId === subj.id}
                      className="sj-action-btn sj-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {subjects.length === 0 && (
              <tr>
                <td
                  colSpan={showSchoolColumn ? 6 : 5}
                  className="sj-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No subjects found.
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
