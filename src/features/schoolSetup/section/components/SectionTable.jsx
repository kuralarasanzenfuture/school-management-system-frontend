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

// function getClassName(section) {
//   if (section.class?.name) return section.class.name;
//   if (section.class_name) return section.class_name;
//   if (typeof section.class_id === "object") return section.class_id.name;
//   return section.class_id ?? "—";
// }

// export default function SectionTable({
//   sections,
//   onEdit,
//   onDelete,
//   deletingId,
// }) {
//   return (
//     <div className="sp-table-card rounded-2xl overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full text-left">
//           <thead>
//             <tr className="sp-thead text-[11.5px] uppercase tracking-wide">
//               <th className="px-5 py-3 font-semibold">Class</th>
//               <th className="px-3 py-3 font-semibold">
//                 <span className="inline-flex items-center gap-1">
//                   Section <ArrowUpDown size={11} />
//                 </span>
//               </th>
//               <th className="px-3 py-3 font-semibold">Capacity</th>
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
//             {sections.map((section) => (
//               <tr key={section.id} className="sp-row transition-colors">
//                 <td className="px-5 py-3.5">
//                   <span className="sp-class-chip px-2.5 py-1 rounded-full text-[11.5px] font-medium">
//                     {getClassName(section)}
//                   </span>
//                 </td>
//                 <td className="sp-name px-3 py-3.5 text-[13.5px] font-semibold">
//                   {section.section_name}
//                 </td>
//                 <td className="sp-cell px-3 py-3.5 text-[13px]">
//                   {section.capacity ?? <span className="sp-cell-muted">—</span>}
//                 </td>
//                 <td className="px-3 py-3.5">
//                   <span
//                     className={`sp-status ${
//                       section.status === "active"
//                         ? "sp-status-active"
//                         : "sp-status-inactive"
//                     }`}
//                   >
//                     {section.status}
//                   </span>
//                 </td>
//                 <td className="sp-cell-muted px-3 py-3.5 text-[13px]">
//                   {formatDate(section.created_at)}
//                 </td>
//                 <td className="px-3 py-3.5">
//                   <div className="flex items-center justify-end gap-1 pr-2">
//                     <button
//                       onClick={() => onEdit(section)}
//                       className="sp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//                       title="Edit"
//                     >
//                       <Pencil size={15} />
//                     </button>
//                     <button
//                       onClick={() => onDelete(section.id)}
//                       disabled={deletingId === section.id}
//                       className="sp-action-btn sp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
//                       title="Delete"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {sections.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={6}
//                   className="sp-empty-state px-5 py-10 text-center text-[13.5px]"
//                 >
//                   No sections found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// -------------------------------------------------------------------------

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

function getClassName(section) {
  if (section.class?.name) return section.class.name;
  if (section.class_name) return section.class_name;
  if (typeof section.class_id === "object") return section.class_id.name;
  return section.class_id ?? "—";
}

export default function SectionTable({
  sections = [],
  onEdit,
  onDelete,
  deletingId,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: sections, initialSize: initialPageSize });

  return (
    <div className="sp-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="sp-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">Class</th>
              <th className="px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Section <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">Capacity</th>
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
                  colSpan={6}
                  className="sp-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No sections found.
                </td>
              </tr>
            ) : (
              pagedData.map((section) => (
                <tr key={section.id} className="sp-row transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="sp-class-chip px-2.5 py-1 rounded-full text-[11.5px] font-medium">
                      {getClassName(section)}
                    </span>
                  </td>

                  <td className="sp-name px-3 py-3.5 text-[13.5px] font-semibold">
                    {section.section_name}
                  </td>

                  <td className="sp-cell px-3 py-3.5 text-[13px]">
                    {section.capacity ?? (
                      <span className="sp-cell-muted">—</span>
                    )}
                  </td>

                  <td className="px-3 py-3.5">
                    <span
                      className={`sp-status ${
                        section.status === "active"
                          ? "sp-status-active"
                          : "sp-status-inactive"
                      }`}
                    >
                      {section.status}
                    </span>
                  </td>

                  <td className="sp-cell-muted px-3 py-3.5 text-[13px]">
                    {formatDate(section.created_at)}
                  </td>

                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1 pr-2">
                      <button
                        onClick={() => onEdit(section)}
                        className="sp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(section.id)}
                        disabled={deletingId === section.id}
                        className="sp-action-btn sp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
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
