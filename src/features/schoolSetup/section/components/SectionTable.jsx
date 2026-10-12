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

import React, { useState, useMemo } from "react";
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
  onToggleStatus,
  deletingId,
  statusUpdatingId,
  showSchoolColumn = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedSections = useMemo(() => {
    if (!sortField) return sections;
    return [...sections].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "class_name") {
        aVal = getClassName(a);
        bVal = getClassName(b);
      } else if (sortField === "name" || sortField === "section_name") {
        aVal = a.name || a.section_name || "";
        bVal = b.name || b.section_name || "";
      }

      if (sortField === "created_at") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (sortField === "capacity") {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal || "").toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [sections, sortField, sortDirection]);

  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: sortedSections, initialSize: initialPageSize });

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={11} className="opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={11} className="text-primary font-bold" />
    ) : (
      <ArrowDown size={11} className="text-primary font-bold" />
    );
  };

  return (
    <div className="sp-table-card rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="sp-thead text-[11.5px] uppercase tracking-wide select-none">
              {showSchoolColumn && (
                <th
                  onClick={() => handleSort("school_name")}
                  className="px-5 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span className="inline-flex items-center gap-1.5">
                    School {renderSortIcon("school_name")}
                  </span>
                </th>
              )}
              <th
                onClick={() => handleSort("class_name")}
                className={`${showSchoolColumn ? "px-3" : "px-5"} py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity`}
              >
                <span className="inline-flex items-center gap-1.5">
                  Class {renderSortIcon("class_name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("section_name")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Section {renderSortIcon("section_name")}
                </span>
              </th>
              <th
                onClick={() => handleSort("capacity")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Capacity {renderSortIcon("capacity")}
                </span>
              </th>
              <th
                onClick={() => handleSort("status")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Status {renderSortIcon("status")}
                </span>
              </th>
              <th
                onClick={() => handleSort("created_at")}
                className="px-3 py-3 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center gap-1.5">
                  Created {renderSortIcon("created_at")}
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
                  colSpan={showSchoolColumn ? 7 : 6}
                  className="sp-empty-state px-5 py-10 text-center text-[13.5px]"
                >
                  No sections found.
                </td>
              </tr>
            ) : (
              pagedData.map((section) => {
                const isStatusUpdating = statusUpdatingId === section.id;
                return (
                  <tr key={section.id} className="sp-row transition-colors">
                    {showSchoolColumn && (
                      <td className="sj-cell px-5 py-3.5 text-[13px]">
                        {section.school_name || "—"}
                      </td>
                    )}
                    <td
                      className={`sp-cell ${
                        showSchoolColumn ? "px-3" : "px-5"
                      } py-3.5 text-[13.5px] font-semibold`}
                    >
                      <span className="sp-class-chip px-2.5 py-1 rounded-full text-[11.5px] font-medium">
                        {getClassName(section)}
                      </span>
                    </td>

                    <td className="sp-name px-3 py-3.5 text-[13.5px] font-semibold">
                      {section.section_name || section.name}
                    </td>

                    <td className="sp-cell px-3 py-3.5 text-[13px]">
                      {section.capacity ?? (
                        <span className="sp-cell-muted">—</span>
                      )}
                    </td>

                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus &&
                          onToggleStatus(
                            section,
                            section.status === "active" ? "inactive" : "active"
                          )
                        }
                        disabled={isStatusUpdating || !onToggleStatus}
                        title={
                          onToggleStatus
                            ? `Click to set status to ${
                                section.status === "active" ? "inactive" : "active"
                              }`
                            : section.status
                        }
                        className={`sp-status inline-flex items-center gap-1.5 border-0 ${
                          section.status === "active"
                            ? "sp-status-active"
                            : "sp-status-inactive"
                        } ${
                          onToggleStatus
                            ? "cursor-pointer hover:opacity-85 transition-opacity"
                            : ""
                        } ${isStatusUpdating ? "opacity-50" : ""}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            section.status === "active"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <span className="capitalize">{section.status}</span>
                      </button>
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
                );
              })
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
