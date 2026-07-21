// import React from "react";
// import { Pencil, Trash2, ArrowUpDown, Eye } from "lucide-react";
// const API_URL = import.meta.env.VITE_API_URL;
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

// function getInitials(first, last) {
//   const a = first?.[0] || "";
//   const b = last?.[0] || "";
//   return (a + b).toUpperCase() || "?";
// }

// const STATUS_CLASS = {
//   active: "ep-status-active",
//   inactive: "ep-status-inactive",
//   resigned: "ep-status-resigned",
//   terminated: "ep-status-terminated",
// };

// export default function EmployeeTable({
//   employees,
//   onView,
//   onEdit,
//   onDelete,
//   deletingId,
// }) {
//   return (
//     <div className="ep-table-card rounded-2xl overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full text-left">
//           <thead>
//             <tr className="ep-thead text-[11.5px] uppercase tracking-wide">
//               <th className="px-5 py-3 font-semibold">
//                 <span className="inline-flex items-center gap-1">
//                   Employee <ArrowUpDown size={11} />
//                 </span>
//               </th>
//               <th className="px-3 py-3 font-semibold">Designation</th>
//               <th className="px-3 py-3 font-semibold">Department</th>
//               <th className="px-3 py-3 font-semibold">Mobile</th>
//               <th className="px-3 py-3 font-semibold">
//                 <span className="inline-flex items-center gap-1">
//                   Joined <ArrowUpDown size={11} />
//                 </span>
//               </th>
//               <th className="px-3 py-3 font-semibold">Status</th>
//               <th className="px-3 py-3 font-semibold text-right pr-5">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {employees.map((emp) => (
//               <tr key={emp.id} className="ep-row transition-colors">
//                 <td className="px-5 py-3.5">
//                   <div
//                     className="flex items-center gap-3 cursor-pointer"
//                     onClick={() => onView?.(emp)}
//                     title="View employee"
//                   >
//                     <div className="ep-avatar w-9 h-9 rounded-full flex items-center justify-center text-[12.5px] font-semibold shrink-0">
//                       {emp.photo_url ? (
//                         <img
//                           src={`${API_URL}${emp.photo_url}`}
//                           alt={`${emp.first_name} ${emp.last_name}`}
//                           className="w-9 h-9 rounded-full object-cover"
//                         />
//                       ) : (
//                         getInitials(emp.first_name, emp.last_name)
//                       )}
//                     </div>
//                     <div className="min-w-0">
//                       <p className="ep-name text-[13.5px] font-semibold truncate">
//                         {emp.first_name} {emp.last_name || ""}
//                       </p>
//                       <p className="ep-code text-[12px] truncate">
//                         {emp.employee_code}
//                       </p>
//                     </div>
//                   </div>
//                 </td>

//                 <td className="ep-cell px-3 py-3.5 text-[13px]">
//                   {emp.designation}
//                 </td>

//                 <td className="ep-cell px-3 py-3.5 text-[13px]">
//                   {emp.department || <span className="ep-cell-muted">—</span>}
//                 </td>

//                 <td className="ep-cell px-3 py-3.5 text-[13px]">
//                   {emp.mobile}
//                 </td>

//                 <td className="ep-cell-muted px-3 py-3.5 text-[13px]">
//                   {formatDate(emp.joining_date)}
//                 </td>

//                 <td className="px-3 py-3.5">
//                   <span
//                     className={`ep-status ${STATUS_CLASS[emp.status] || "ep-status-inactive"}`}
//                   >
//                     {emp.status}
//                   </span>
//                 </td>

//                 <td className="px-3 py-3.5">
//                   <div className="flex items-center justify-end gap-1 pr-2">
//                     <button
//                       onClick={() => onView?.(emp)}
//                       className="ep-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//                       title="View"
//                     >
//                       <Eye size={15} />
//                     </button>
//                     <button
//                       onClick={() => onEdit(emp)}
//                       className="ep-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//                       title="Edit"
//                     >
//                       <Pencil size={15} />
//                     </button>
//                     <button
//                       onClick={() => onDelete(emp.id)}
//                       disabled={deletingId === emp.id}
//                       className="ep-action-btn ep-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
//                       title="Delete"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {employees.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={7}
//                   className="ep-empty-state px-5 py-10 text-center text-[13.5px]"
//                 >
//                   No employees found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

/*-------------------pagination implementation-------------------*/

import React from "react";
import { Pencil, Trash2, ArrowUpDown, Eye } from "lucide-react";
import Pagination from "../../../common/components/table/Pagination";
import usePagination from "../../../common/components/table/usePagination";

const API_URL = import.meta.env.VITE_API_URL;

/* ── helpers ── */
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

function getInitials(firstName, lastName) {
  const firstInitial = firstName?.[0] ?? "";
  const lastInitial = lastName?.[0] ?? "";
  return (firstInitial + lastInitial).toUpperCase() || "?";
}

const STATUS_CLASS = {
  active: "ep-status-active",
  inactive: "ep-status-inactive",
  resigned: "ep-status-resigned",
  terminated: "ep-status-terminated",
};

/* ────────────────────────────────────────────────────────────────
   EmployeeTable
   Props
     employees       array      full (unsliced) employee list
     onView          fn(emp)
     onEdit          fn(emp)
     onDelete        fn(id)
     deletingId      number|null
     initialPageSize number     default 10
     pageSizeOptions number[]   default [5, 10, 20, 50]
   ──────────────────────────────────────────────────────────────── */
export default function EmployeeTable({
  employees = [],
  onView,
  onEdit,
  onDelete,
  deletingId,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: employees, initialSize: initialPageSize });

  return (
    <div className="ep-table-card rounded-2xl overflow-hidden">
      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="ep-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Employee <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-3 py-3 font-semibold">Designation</th>
              <th className="px-3 py-3 font-semibold">Department</th>
              <th className="px-3 py-3 font-semibold">Mobile</th>
              <th className="px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Joined <ArrowUpDown size={11} />
                </span>
              </th>
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
                  colSpan={7}
                  className="ep-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              pagedData.map((employee) => (
                <tr key={employee.id} className="ep-row transition-colors">
                  {/* Employee name + avatar */}
                  <td className="px-5 py-3.5">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onView?.(employee)}
                      title="View employee"
                    >
                      <div className="ep-avatar w-9 h-9 rounded-full flex items-center justify-center text-[12.5px] font-semibold shrink-0">
                        {employee.photo_url ? (
                          <img
                            src={`${API_URL}${employee.photo_url}`}
                            alt={`${employee.first_name} ${employee.last_name}`}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          getInitials(employee.first_name, employee.last_name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="ep-name text-[13.5px] font-semibold truncate">
                          {employee.first_name} {employee.last_name ?? ""}
                        </p>
                        <p className="ep-code text-[12px] truncate">
                          {employee.employee_code}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="ep-cell px-3 py-3.5 text-[13px]">
                    {employee.designation}
                  </td>

                  <td className="ep-cell px-3 py-3.5 text-[13px]">
                    {employee.department ?? (
                      <span className="ep-cell-muted">—</span>
                    )}
                  </td>

                  <td className="ep-cell px-3 py-3.5 text-[13px]">
                    {employee.mobile}
                  </td>

                  <td className="ep-cell-muted px-3 py-3.5 text-[13px]">
                    {formatDate(employee.joining_date)}
                  </td>

                  <td className="px-3 py-3.5">
                    <span
                      className={`ep-status ${STATUS_CLASS[employee.status] ?? "ep-status-inactive"}`}
                    >
                      {employee.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1 pr-2">
                      <button
                        onClick={() => onView?.(employee)}
                        className="ep-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        title="View"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => onEdit(employee)}
                        className="ep-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(employee.id)}
                        disabled={deletingId === employee.id}
                        className="ep-action-btn ep-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
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

      {/* ── Pagination ── */}
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


// import React, { useState, useMemo } from "react";
// import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react";
// import Pagination from "../../../common/components/table/Pagination";
// import usePagination from "../../../common/components/table/usePagination";

// const API_URL = import.meta.env.VITE_API_URL;

// /* ── helpers ── */
// function formatDate(value) {
//   if (!value) return "—";
//   const dateObj = new Date(value);
//   if (isNaN(dateObj)) return value;
//   return dateObj.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// function getInitials(firstName, lastName) {
//   const firstInitial = firstName?.[0] ?? "";
//   const lastInitial = lastName?.[0] ?? "";
//   return (firstInitial + lastInitial).toUpperCase() || "?";
// }

// const STATUS_CLASS = {
//   active: "ep-status-active",
//   inactive: "ep-status-inactive",
//   resigned: "ep-status-resigned",
//   terminated: "ep-status-terminated",
// };

// export default function EmployeeTable({
//   employees = [],
//   onView,
//   onEdit,
//   onDelete,
//   deletingId,
//   initialPageSize = 10,
//   pageSizeOptions = [5, 10, 20, 50],
// }) {
//   // ── 1. Sort State ──
//   // key can be 'name' or 'joining_date'
//   // direction can be 'asc' or 'desc' (or null for unsorted)
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

//   // ── 2. Handle Sort Request ──
//   const handleSort = (key) => {
//     let direction = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     } else if (sortConfig.key === key && sortConfig.direction === "desc") {
//       // Optional: resets sorting completely on 3rd click
//       key = null;
//       direction = null;
//     }
//     setSortConfig({ key, direction });
//   };

//   // ── 3. Sort Data Before Pagination ──
//   const sortedEmployees = useMemo(() => {
//     const sortableItems = [...employees];
//     if (sortConfig.key !== null) {
//       sortableItems.sort((a, b) => {
//         let aValue, bValue;

//         // Custom resolution for sorting by Full Name
//         if (sortConfig.key === "name") {
//           aValue = `${a.first_name} ${a.last_name ?? ""}`.toLowerCase().trim();
//           bValue = `${b.first_name} ${b.last_name ?? ""}`.toLowerCase().trim();
//         } else {
//           aValue = a[sortConfig.key];
//           bValue = b[sortConfig.key];
//         }

//         // Handle missing/null entries gracefully
//         if (aValue === null || aValue === undefined) return 1;
//         if (bValue === null || bValue === undefined) return -1;

//         if (aValue < bValue) {
//           return sortConfig.direction === "asc" ? -1 : 1;
//         }
//         if (aValue > bValue) {
//           return sortConfig.direction === "asc" ? 1 : -1;
//         }
//         return 0;
//       });
//     }
//     return sortableItems;
//   }, [employees, sortConfig]);

//   // ── 4. Pass Sorted Items to Pagination Hook ──
//   const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
//     usePagination({ data: sortedEmployees, initialSize: initialPageSize });

//   // Helper component to render context-aware indicator arrows
//   const SortIcon = ({ columnKey }) => {
//     if (sortConfig.key !== columnKey) return <ArrowUpDown size={11} className="opacity-50" />;
//     return sortConfig.direction === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />;
//   };

//   return (
//     <div className="ep-table-card rounded-2xl overflow-hidden">
//       {/* ── Table ── */}
//       <div className="overflow-x-auto">
//         <table className="w-full text-left">
//           <thead>
//             <tr className="ep-thead text-[11.5px] uppercase tracking-wide">
//               {/* Sortable: Employee */}
//               <th
//                 className="px-5 py-3 font-semibold cursor-pointer hover:bg-black/5 select-none transition-colors"
//                 onClick={() => handleSort("name")}
//               >
//                 <span className="inline-flex items-center gap-1">
//                   Employee <SortIcon columnKey="name" />
//                 </span>
//               </th>

//               <th className="px-3 py-3 font-semibold">Designation</th>
//               <th className="px-3 py-3 font-semibold">Department</th>
//               <th className="px-3 py-3 font-semibold">Mobile</th>

//               {/* Sortable: Joined */}
//               <th
//                 className="px-3 py-3 font-semibold cursor-pointer hover:bg-black/5 select-none transition-colors"
//                 onClick={() => handleSort("joining_date")}
//               >
//                 <span className="inline-flex items-center gap-1">
//                   Joined <SortIcon columnKey="joining_date" />
//                 </span>
//               </th>

//               <th className="px-3 py-3 font-semibold">Status</th>
//               <th className="px-3 py-3 font-semibold text-right pr-5">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {pagedData.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={7}
//                   className="ep-empty-state px-5 py-10 text-center text-[13.5px]"
//                 >
//                   No employees found.
//                 </td>
//               </tr>
//             ) : (
//               pagedData.map((employee) => (
//                 <tr key={employee.id} className="ep-row transition-colors">
//                   {/* Employee name + avatar */}
//                   <td className="px-5 py-3.5">
//                     <div
//                       className="flex items-center gap-3 cursor-pointer"
//                       onClick={() => onView?.(employee)}
//                       title="View employee"
//                     >
//                       <div className="ep-avatar w-9 h-9 rounded-full flex items-center justify-center text-[12.5px] font-semibold shrink-0">
//                         {employee.photo_url ? (
//                           <img
//                             src={`${API_URL}${employee.photo_url}`}
//                             alt={`${employee.first_name} ${employee.last_name}`}
//                             className="w-9 h-9 rounded-full object-cover"
//                           />
//                         ) : (
//                           getInitials(employee.first_name, employee.last_name)
//                         )}
//                       </div>
//                       <div className="min-w-0">
//                         <p className="ep-name text-[13.5px] font-semibold truncate">
//                           {employee.first_name} {employee.last_name ?? ""}
//                         </p>
//                         <p className="ep-code text-[12px] truncate">
//                           {employee.employee_code}
//                         </p>
//                       </div>
//                     </div>
//                   </td>

//                   <td className="ep-cell px-3 py-3.5 text-[13px]">
//                     {employee.designation}
//                   </td>

//                   <td className="ep-cell px-3 py-3.5 text-[13px]">
//                     {employee.department ?? (
//                       <span className="ep-cell-muted">—</span>
//                     )}
//                   </td>

//                   <td className="ep-cell px-3 py-3.5 text-[13px]">
//                     {employee.mobile}
//                   </td>

//                   <td className="ep-cell-muted px-3 py-3.5 text-[13px]">
//                     {formatDate(employee.joining_date)}
//                   </td>

//                   <td className="px-3 py-3.5">
//                     <span
//                       className={`ep-status ${STATUS_CLASS[employee.status] ?? "ep-status-inactive"}`}
//                     >
//                       {employee.status}
//                     </span>
//                   </td>

//                   {/* Actions */}
//                   <td className="px-3 py-3.5">
//                     <div className="flex items-center justify-end gap-1 pr-2">
//                       <button
//                         onClick={() => onView?.(employee)}
//                         className="ep-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//                         title="View"
//                       >
//                         <Eye size={15} />
//                       </button>
//                       <button
//                         onClick={() => onEdit(employee)}
//                         className="ep-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//                         title="Edit"
//                       >
//                         <Pencil size={15} />
//                       </button>
//                       <button
//                         onClick={() => onDelete(employee.id)}
//                         disabled={deletingId === employee.id}
//                         className="ep-action-btn ep-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
//                         title="Delete"
//                       >
//                         <Trash2 size={15} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ── Pagination ── */}
//       <Pagination
//         currentPage={currentPage}
//         totalItems={totalItems}
//         pageSize={pageSize}
//         pageSizeOptions={pageSizeOptions}
//         onPageChange={setPage}
//         onPageSizeChange={setPageSize}
//       />
//     </div>
//   );
// }
