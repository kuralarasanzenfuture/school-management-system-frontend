// import React from "react";
// import { Pencil, Trash2 } from "lucide-react";

// const STATUS_CLASS = {
//   active: "cs-status-active",
//   inactive: "cs-status-inactive",
// };

// /**
//  * NOTE: your sample GET response includes school_name, class_name,
//  * section_name, and academic_year as joined display strings, but does
//  * NOT include a class_teacher_name — only class_teacher_id. This falls
//  * back to an em-dash when that name isn't present. If your backend can
//  * add a joined `class_teacher_name` to the response, this will pick it
//  * up automatically with no code change needed here.
//  */
// export default function ClassSectionTable({
//   classSections,
//   onEdit,
//   onDelete,
//   deletingId,
//   showSchoolColumn = false,
// }) {
//   return (
//     <div className="cs-table-card rounded-2xl overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full text-left">
//           <thead>
//             <tr className="cs-thead text-[11.5px] uppercase tracking-wide">
//               {showSchoolColumn && (
//                 <th className="px-5 py-3 font-semibold">School</th>
//               )}
//               <th
//                 className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold`}
//               >
//                 Class
//               </th>
//               <th className="px-3 py-3 font-semibold">Section</th>
//               <th className="px-3 py-3 font-semibold">Academic Year</th>
//               <th className="px-3 py-3 font-semibold">Class Teacher</th>
//               <th className="px-3 py-3 font-semibold">Capacity</th>
//               <th className="px-3 py-3 font-semibold">Status</th>
//               <th className="px-3 py-3 font-semibold text-right pr-5">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {classSections.map((cs) => (
//               <tr key={cs.id} className="cs-row transition-colors">
//                 {showSchoolColumn && (
//                   <td className="cs-cell px-5 py-3.5 text-[13px]">
//                     {cs.school_name || "—"}
//                   </td>
//                 )}
//                 <td
//                   className={`cs-cell ${showSchoolColumn ? "px-3" : "px-5"} py-3.5 text-[13.5px] font-semibold`}
//                 >
//                   {cs.class_name}
//                 </td>
//                 <td className="cs-cell px-3 py-3.5 text-[13px]">
//                   {cs.section_name}
//                 </td>
//                 <td className="cs-cell px-3 py-3.5 text-[13px]">
//                   {cs.academic_year}
//                 </td>
//                 <td className="cs-cell px-3 py-3.5 text-[13px]">
//                   {cs.class_teacher_name || (
//                     <span className="cs-cell-muted">—</span>
//                   )}
//                 </td>
//                 <td className="cs-cell px-3 py-3.5 text-[13px]">
//                   {cs.capacity}
//                 </td>
//                 <td className="px-3 py-3.5">
//                   <span
//                     className={`cs-status ${STATUS_CLASS[cs.status] || "cs-status-inactive"}`}
//                   >
//                     {cs.status}
//                   </span>
//                 </td>
//                 <td className="px-3 py-3.5">
//                   <div className="flex items-center justify-end gap-1 pr-2">
//                     <button
//                       onClick={() => onEdit(cs)}
//                       className="cs-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//                       title="Edit"
//                     >
//                       <Pencil size={15} />
//                     </button>
//                     <button
//                       onClick={() => onDelete(cs.id)}
//                       disabled={deletingId === cs.id}
//                       className="cs-action-btn cs-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
//                       title="Delete"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {classSections.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={showSchoolColumn ? 8 : 7}
//                   className="cs-empty-state px-5 py-10 text-center text-[13.5px]"
//                 >
//                   No class sections found.
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
  active: "cs-status-active",
  inactive: "cs-status-inactive",
};

export default function ClassSectionTable({
  classSections = [],
  onEdit,
  onDelete,
  deletingId,
  showSchoolColumn = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: classSections, initialSize: initialPageSize });

  // colSpan changes based on whether the School column is visible
  const colSpan = showSchoolColumn ? 8 : 7;

  return (
    <div className="cs-table-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="cs-thead text-[11.5px] uppercase tracking-wide">
              {showSchoolColumn && (
                <th className="px-5 py-3 font-semibold">School</th>
              )}
              <th
                className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold`}
              >
                Class
              </th>
              <th className="px-3 py-3 font-semibold">Section</th>
              <th className="px-3 py-3 font-semibold">Academic Year</th>
              <th className="px-3 py-3 font-semibold">Class Teacher</th>
              <th className="px-3 py-3 font-semibold">Capacity</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold text-right pr-5">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="cs-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No class sections found.
                </td>
              </tr>
            ) : (
              pagedData.map((classSection) => (
                <tr key={classSection.id} className="cs-row transition-colors">
                  {showSchoolColumn && (
                    <td className="cs-cell px-5 py-3.5 text-[13px]">
                      {classSection.school_name || "—"}
                    </td>
                  )}

                  <td
                    className={`cs-cell ${showSchoolColumn ? "px-3" : "px-5"} py-3.5 text-[13.5px] font-semibold`}
                  >
                    {classSection.class_name}
                  </td>

                  <td className="cs-cell px-3 py-3.5 text-[13px]">
                    {classSection.section_name}
                  </td>

                  <td className="cs-cell px-3 py-3.5 text-[13px]">
                    {classSection.academic_year}
                  </td>

                  <td className="cs-cell px-3 py-3.5 text-[13px]">
                    {classSection.class_teacher_name || (
                      <span className="cs-cell-muted">—</span>
                    )}
                  </td>

                  <td className="cs-cell px-3 py-3.5 text-[13px]">
                    {classSection.capacity}
                  </td>

                  <td className="px-3 py-3.5">
                    <span
                      className={`cs-status ${STATUS_CLASS[classSection.status] ?? "cs-status-inactive"}`}
                    >
                      {classSection.status}
                    </span>
                  </td>

                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1 pr-2">
                      <button
                        onClick={() => onEdit(classSection)}
                        className="cs-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(classSection.id)}
                        disabled={deletingId === classSection.id}
                        className="cs-action-btn cs-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
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
