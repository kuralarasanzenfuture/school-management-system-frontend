// import React from "react";
// import { Pencil, Trash2, ArrowUpDown } from "lucide-react";

// function formatDate(value) {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (isNaN(d)) return value;
//   return d.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// export default function ClassTable({ classes, onEdit, onDelete, deletingId }) {
//   return (
//     <div className="cp-table-card rounded-2xl overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full text-left">
//           <thead>
//             <tr className="cp-thead text-[11.5px] uppercase tracking-wide">
//               <th className="px-5 py-3 font-semibold">
//                 <span className="inline-flex items-center gap-1">
//                   Class Name <ArrowUpDown size={11} />
//                 </span>
//               </th>
//               <th className="px-3 py-3 font-semibold">Status</th>
//               <th className="px-3 py-3 font-semibold">
//                 <span className="inline-flex items-center gap-1">
//                   Created <ArrowUpDown size={11} />
//                 </span>
//               </th>
//               <th className="px-3 py-3 font-semibold text-right pr-5">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {classes.map((cls) => (
//               <tr key={cls.id} className="cp-row transition-colors">
//                 <td className="cp-name px-5 py-3.5 text-[13.5px] font-semibold">
//                   {cls.name}
//                 </td>
//                 <td className="px-3 py-3.5">
//                   <span
//                     className={`cp-status ${
//                       cls.status === "active"
//                         ? "cp-status-active"
//                         : "cp-status-inactive"
//                     }`}
//                   >
//                     {cls.status}
//                   </span>
//                 </td>
//                 <td className="cp-cell-muted px-3 py-3.5 text-[13px]">
//                   {formatDate(cls.created_at)}
//                 </td>
//                 <td className="px-3 py-3.5">
//                   <div className="flex items-center justify-end gap-1 pr-2">
//                     <button
//                       onClick={() => onEdit(cls)}
//                       className="cp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//                       title="Edit"
//                     >
//                       <Pencil size={15} />
//                     </button>
//                     <button
//                       onClick={() => onDelete(cls.id)}
//                       disabled={deletingId === cls.id}
//                       className="cp-action-btn cp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
//                       title="Delete"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {classes.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={4}
//                   className="cp-empty-state px-5 py-10 text-center text-[13.5px]"
//                 >
//                   No classes found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// ---------------------------------------------------------------------------------

import React from "react";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";

function formatDate(value) {
  if (!value) return "—";
  const dateObj = new Date(value);
  if (isNaN(dateObj)) return value;
  return dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ClassTable({
  classes = [],
  onEdit,
  onDelete,
  deletingId,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: classes, initialSize: initialPageSize });

  return (
    <div className="cp-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="cp-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Class Name <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Created <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="cp-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No classes found.
                </td>
              </tr>
            ) : (
              pagedData.map((cls) => (
                <tr key={cls.id} className="cp-row transition-colors">
                  <td className="cp-name px-5 py-3.5 text-[13.5px] font-semibold">
                    {cls.name}
                  </td>

                  <td className="px-3 py-3.5">
                    <span
                      className={`cp-status ${
                        cls.status === "active"
                          ? "cp-status-active"
                          : "cp-status-inactive"
                      }`}
                    >
                      {cls.status}
                    </span>
                  </td>

                  <td className="cp-cell-muted px-3 py-3.5 text-[13px]">
                    {formatDate(cls.created_at)}
                  </td>

                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1 pr-2">
                      <button
                        onClick={() => onEdit(cls)}
                        className="cp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(cls.id)}
                        disabled={deletingId === cls.id}
                        className="cp-action-btn cp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Delete"
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
