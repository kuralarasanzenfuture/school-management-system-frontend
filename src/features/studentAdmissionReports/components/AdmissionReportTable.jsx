import React, { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Printer,
  Bus,
  Home,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import * as XLSX from "xlsx";
import usePagination from "../../../common/components/table/usePagination.jsx";
import Pagination from "../../../common/components/table/Pagination.jsx";
import { getFullImageUrl } from "../../../config/env.js";

const STATUS_BADGES = {
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60",
  inactive: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60",
  completed: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60",
  transferred: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60",
  dropped: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  cancelled: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60",
};

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return String(val);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isTrue(val) {
  return val === true || val === 1 || val === "1" || String(val).toLowerCase() === "true";
}

export default function AdmissionReportTable({
  admissions = [],
  studentsById = {},
  onSelectAdmission,
  currentSchoolName = "School",
  currentAcademicYearName = "Academic Year",
  loading = false,
}) {
  const [sortField, setSortField] = useState("admission_number");
  const [sortAsc, setSortAsc] = useState(true);

  // Sorting (Ultra-fast direct comparison avoiding expensive localeCompare on 15k rows)
  const sortedAdmissions = React.useMemo(() => {
    if (!admissions || admissions.length === 0) return [];

    return [...admissions].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "student_name") {
        valA = a.student_name;
        if (!valA) {
          const studentA = studentsById[a.student_id];
          valA = studentA ? `${studentA.first_name || ""} ${studentA.last_name || ""}` : "";
        }
        valB = b.student_name;
        if (!valB) {
          const studentB = studentsById[b.student_id];
          valB = studentB ? `${studentB.first_name || ""} ${studentB.last_name || ""}` : "";
        }
      }

      valA = valA == null ? "" : valA;
      valB = valB == null ? "" : valB;

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [admissions, sortField, sortAsc, studentsById]);

  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: sortedAdmissions, initialSize: 15 });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (!admissions.length) return;

    const dataRows = admissions.map((a, idx) => {
      const student = studentsById[a.student_id];
      const studentName =
        a.student_name ||
        (student
          ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
          : `Student #${a.student_id}`);

      return {
        "S.No": idx + 1,
        "Admission Number": a.admission_number || "—",
        "Student Name": studentName,
        "Student Code": a.student_code || student?.student_code || "—",
        Gender: student?.gender || a.gender || "—",
        Class: a.class_name || "—",
        Section: a.section || "Unallocated",
        "Roll No": a.roll_no || student?.roll_no || "—",
        "Academic Year": a.academic_year_name || a.academic_year || "—",
        "Joining Date": formatDate(a.joining_date),
        "Admission Type": a.admission_type || "New",
        "Transport Required": isTrue(a.transport_required) ? "Yes" : "No",
        "Hostel Required": isTrue(a.hostel_required) ? "Yes" : "No",
        "Guardian Name": student?.father_name || student?.guardian_name || "—",
        "Contact Number":
          student?.mobile_no ||
          student?.parent_mobile ||
          student?.mobile ||
          student?.phone ||
          a?.mobile_no ||
          a?.parent_mobile ||
          "—",
        Email: student?.email || a?.email || "—",
        Status: a.status || "Active",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);

    // Auto-fit column widths
    worksheet["!cols"] = [
      { wch: 6 },  // S.No
      { wch: 18 }, // Admission Number
      { wch: 24 }, // Student Name
      { wch: 16 }, // Student Code
      { wch: 10 }, // Gender
      { wch: 14 }, // Class
      { wch: 10 }, // Section
      { wch: 10 }, // Roll No
      { wch: 16 }, // Academic Year
      { wch: 14 }, // Joining Date
      { wch: 16 }, // Admission Type
      { wch: 18 }, // Transport
      { wch: 16 }, // Hostel
      { wch: 22 }, // Guardian
      { wch: 16 }, // Contact
      { wch: 24 }, // Email
      { wch: 14 }, // Status
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admission Report");

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Student_Admissions_Report_${dateStr}.xlsx`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!admissions.length) return;

    const headers = [
      "Admission Number",
      "Student Name",
      "Student Code",
      "Gender",
      "Class",
      "Section",
      "Academic Year",
      "Joining Date",
      "Admission Type",
      "Transport",
      "Hostel",
      "Guardian Name",
      "Phone",
      "Status",
    ];

    const rows = admissions.map((a) => {
      const student = studentsById[a.student_id];
      const studentName =
        a.student_name ||
        (student
          ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
          : `Student #${a.student_id}`);

      return [
        `"${a.admission_number || ""}"`,
        `"${studentName}"`,
        `"${a.student_code || student?.student_code || ""}"`,
        `"${student?.gender || ""}"`,
        `"${a.class_name || ""}"`,
        `"${a.section || "Unallocated"}"`,
        `"${a.academic_year_name || a.academic_year || ""}"`,
        `"${formatDate(a.joining_date)}"`,
        `"${a.admission_type || "New"}"`,
        `"${isTrue(a.transport_required) ? "Yes" : "No"}"`,
        `"${isTrue(a.hostel_required) ? "Yes" : "No"}"`,
        `"${student?.father_name || a?.father_name || ""}"`,
        `"${student?.mobile_no || student?.parent_mobile || student?.mobile || student?.phone || a?.mobile_no || a?.parent_mobile || ""}"`,
        `"${a.status || "Active"}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `Student_Admissions_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="sar-card rounded-2xl overflow-hidden flex flex-col">
      {/* Table Action Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Admissions Roster Audit
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              {admissions.length} Students
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full comprehensive enrollment ledger & verification table
          </p>
        </div>

        {/* Export and Print Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto no-print">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={admissions.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-40"
            title="Download full report as Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet size={14} />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={admissions.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
            title="Download CSV"
          >
            <Download size={14} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="sar-table-head text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
              <th
                className="px-5 py-3 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => toggleSort("admission_number")}
              >
                <div className="flex items-center gap-1">
                  <span>Admission No.</span>
                  {sortField === "admission_number" && (
                    sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                  )}
                </div>
              </th>

              <th
                className="px-3 py-3 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => toggleSort("student_name")}
              >
                <div className="flex items-center gap-1">
                  <span>Student</span>
                  {sortField === "student_name" && (
                    sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                  )}
                </div>
              </th>

              <th
                className="px-3 py-3 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => toggleSort("class_name")}
              >
                <div className="flex items-center gap-1">
                  <span>Class & Section</span>
                  {sortField === "class_name" && (
                    sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                  )}
                </div>
              </th>

              <th className="px-3 py-3">Academic Year</th>

              <th
                className="px-3 py-3 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => toggleSort("joining_date")}
              >
                <div className="flex items-center gap-1">
                  <span>Joining Date</span>
                  {sortField === "joining_date" && (
                    sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                  )}
                </div>
              </th>

              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Facilities</th>
              <th className="px-3 py-3">Contact</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-4 py-3 text-right pr-6 no-print">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[12.5px] text-slate-700 dark:text-slate-200">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`sar-skel-${idx}`} className="animate-pulse">
                  <td className="px-5 py-3.5">
                    <div className="sar-skeleton h-4 w-24 rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="sar-skeleton w-8 h-8 rounded-full shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="sar-skeleton h-3.5 w-32 rounded" />
                        <div className="sar-skeleton h-2.5 w-16 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="sar-skeleton h-4 w-16 rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="sar-skeleton h-4 w-20 rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="sar-skeleton h-4 w-20 rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="sar-skeleton h-4 w-14 rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="sar-skeleton h-5 w-16 rounded-md" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="sar-skeleton h-4 w-24 rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="sar-skeleton h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-3.5 text-right pr-6">
                    <div className="sar-skeleton h-6 w-6 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : pagedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  No admission records found matching current criteria.
                </td>
              </tr>
            ) : (
              pagedData.map((a) => {
                const student = studentsById[a.student_id];
                const studentName =
                  a.student_name ||
                  (student
                    ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
                    : `Student #${a.student_id}`);
                const studentCode = a.student_code || student?.student_code;
                const rawPhoto = a.photo_url || student?.photo_url || student?.avatar || student?.image;
                const photoUrl = getFullImageUrl(rawPhoto);
                const initials =
                  `${(a.first_name || student?.first_name || studentName)?.[0] || ""}${(a.last_name || student?.last_name)?.[0] || ""}`.toUpperCase() || "S";
                const statusKey = String(a.status || "active").toLowerCase();

                return (
                  <tr
                    key={a.id || a.admission_id}
                    className="sar-table-row transition-colors cursor-pointer group"
                    onClick={() => onSelectAdmission && onSelectAdmission(a, student)}
                  >
                    {/* Admission Number */}
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white font-mono text-xs">
                      {a.admission_number || "—"}
                    </td>

                    {/* Student Name & Avatar */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          style={{ display: photoUrl ? "none" : "flex" }}
                          className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-800/60"
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {studentName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                            {studentCode && <span>{studentCode}</span>}
                            {student?.gender && (
                              <span className="capitalize font-sans">• {student.gender}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Class & Section */}
                    <td className="px-3 py-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {a.class_name || "—"}
                      </span>
                      {a.section ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1.5">
                          ({a.section})
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs ml-1 font-normal">
                          (Unallocated)
                        </span>
                      )}
                    </td>

                    {/* Academic Year */}
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                      {a.academic_year_name || a.academic_year || "—"}
                    </td>

                    {/* Joining Date */}
                    <td className="px-3 py-3 font-medium text-slate-600 dark:text-slate-400">
                      {formatDate(a.joining_date)}
                    </td>

                    {/* Admission Type */}
                    <td className="px-3 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                        {a.admission_type || "New"}
                      </span>
                    </td>

                    {/* Facilities Badges */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isTrue(a.transport_required) && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60"
                            title="School Bus Transport Opted"
                          >
                            <Bus size={11} /> Bus
                          </span>
                        )}
                        {isTrue(a.hostel_required) && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60"
                            title="Hostel Accommodation Opted"
                          >
                            <Home size={11} /> Hostel
                          </span>
                        )}
                        {!isTrue(a.transport_required) && !isTrue(a.hostel_required) && (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </div>
                    </td>

                    {/* Contact / Parent */}
                    <td className="px-3 py-3 text-xs">
                      {student?.mobile_no || student?.parent_mobile || student?.phone || a?.mobile_no || a?.parent_mobile ? (
                        <div>
                          <div className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                            {student?.mobile_no || a?.mobile_no || student?.parent_mobile || a?.parent_mobile || student?.phone}
                          </div>
                          {(student?.father_name || a?.father_name) && (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[130px]">
                              {student?.father_name || a?.father_name}
                            </div>
                          )}
                        </div>
                      ) : student?.father_name || a?.father_name ? (
                        <div className="text-slate-600 dark:text-slate-400 truncate max-w-[130px]">
                          {student?.father_name || a?.father_name}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                          STATUS_BADGES[statusKey] || STATUS_BADGES.inactive
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            statusKey === "active"
                              ? "bg-emerald-500"
                              : statusKey === "pending"
                              ? "bg-amber-500"
                              : statusKey === "completed"
                              ? "bg-blue-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {a.status || "Active"}
                      </span>
                    </td>

                    {/* Action button */}
                    <td className="px-4 py-3 text-right pr-6 no-print">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAdmission && onSelectAdmission(a, student);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View complete admission details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 no-print">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 15, 25, 50, 100]}
          />
        </div>
      )}

      {/* Printable Area (Hidden on screen, visible during window.print()) */}
      <div id="admission-report-print-area" className="hidden">
        <div className="mb-4 text-center border-b pb-3">
          <h2 className="text-xl font-bold">{currentSchoolName}</h2>
          <h3 className="text-sm font-semibold text-slate-600">Student Admissions Master Audit Report</h3>
          <p className="text-xs text-slate-500 mt-1">
            Academic Year: {currentAcademicYearName} | Generated: {new Date().toLocaleString("en-IN")} | Total Records: {admissions.length}
          </p>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Admission No</th>
              <th>Student Name</th>
              <th>Code</th>
              <th>Class</th>
              <th>Section</th>
              <th>Joining Date</th>
              <th>Type</th>
              <th>Transport</th>
              <th>Hostel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {admissions.map((a, i) => {
              const student = studentsById[a.student_id];
              const studentName =
                a.student_name ||
                (student
                  ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
                  : `Student #${a.student_id}`);
              return (
                <tr key={`print-${a.id || i}`}>
                  <td>{i + 1}</td>
                  <td>{a.admission_number || "—"}</td>
                  <td>{studentName}</td>
                  <td>{a.student_code || student?.student_code || "—"}</td>
                  <td>{a.class_name || "—"}</td>
                  <td>{a.section || "Unallocated"}</td>
                  <td>{formatDate(a.joining_date)}</td>
                  <td>{a.admission_type || "New"}</td>
                  <td>{isTrue(a.transport_required) ? "Yes" : "No"}</td>
                  <td>{isTrue(a.hostel_required) ? "Yes" : "No"}</td>
                  <td>{a.status || "Active"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
