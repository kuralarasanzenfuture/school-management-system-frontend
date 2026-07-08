// import React, { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchDepartments } from "../../../../redux/schoolSetup/department/departmentSlice.js";
// import AddDepartmentModal from "../components/AddDepartmentModal";
// import DeleteDepartmentModal from "../components/DeleteDepartmentModal";
// import "../styles/Department.css";
// import {
//   Building2,
//   Plus,
//   Download,
//   Search,
//   ArrowUpDown,
//   Pencil,
//   Trash2,
//   ChevronLeft,
//   ChevronRight,
//   LayoutGrid,
//   List,
//   FileText,
// } from "lucide-react";
// import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

// const PAGE_SIZE = 8;

// /* ── Stat card ── */
// function StatCard({ icon: Icon, iconBgClass, iconColorClass, value, label }) {
//   return (
//     <div className="dp-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
//       <div
//         className={`${iconBgClass} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}
//       >
//         <Icon size={20} className={iconColorClass} />
//       </div>
//       <div>
//         <p className="dp-stat-value text-xl font-bold leading-none">{value}</p>
//         <p className="dp-stat-label text-[12.5px] mt-1">{label}</p>
//       </div>
//     </div>
//   );
// }

// /* ── Sort icon ── */
// function SortIcon() {
//   return <ArrowUpDown size={11} className="inline ml-1 opacity-60" />;
// }

// export default function DepartmentPage() {
//   const dispatch = useDispatch();
//   const { departments, loading, error } = useSelector(
//     (state) => state.departments,
//   );

//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [viewMode, setViewMode] = useState("table"); // "table" | "grid"

//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editTarget, setEditTarget] = useState(null); // department to edit
//   const [deleteTarget, setDeleteTarget] = useState(null); // department to delete

//   const [selectedSchool, setSelectedSchool] = useState("");

//   const { user, loading: authLoading } = useSelector((state) => state.auth);

//   const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

//   const schoolId = isAdmin ? null : user?.school_id;

//   const schools = useSelector((state) => state.schoolProfile?.schools || []);
//   const schoolsLoading = useSelector(
//     (state) => state.schoolProfile?.loading || false,
//   );

//   useEffect(() => {
//     if (isAdmin && schools.length === 0) {
//       dispatch(fetchSchools());
//     }
//   }, [dispatch, isAdmin, schools.length]);

//   /* ── Fetch on mount ── */
//   useEffect(() => {
//     dispatch(fetchDepartments());
//   }, [dispatch]);

//   /* ── Derived data ── */
//   // const filteredDepartments = useMemo(() => {
//   //   const query = searchQuery.trim().toLowerCase();
//   //   if (!query) return departments;
//   //   return departments.filter(
//   //     (dept) =>
//   //       dept.name.toLowerCase().includes(query) ||
//   //       (dept.description ?? "").toLowerCase().includes(query),
//   //   );
//   // }, [departments, searchQuery]);

//   const filteredDepartments = useMemo(() => {
//     const query = searchQuery.trim().toLowerCase();

//     return departments.filter((dept) => {
//       const matchesSearch = query
//         ? dept.name?.toLowerCase().includes(query) ||
//           dept.description?.toLowerCase().includes(query)
//         : true;

//       const matchesSchool = isAdmin
//         ? selectedSchool
//           ? String(dept.school_id) === String(selectedSchool)
//           : true
//         : String(dept.school_id) === String(schoolId);

//       return matchesSearch && matchesSchool;
//     });
//   }, [departments, searchQuery, isAdmin, selectedSchool, schoolId]);

//   const totalPages = Math.max(
//     1,
//     Math.ceil(filteredDepartments.length / PAGE_SIZE),
//   );
//   const pagedRows = filteredDepartments.slice(
//     (currentPage - 1) * PAGE_SIZE,
//     currentPage * PAGE_SIZE,
//   );

//   /* ── Select helpers ── */
//   const toggleSelectAll = (event) => {
//     setSelectedIds(
//       event.target.checked ? pagedRows.map((dept) => dept.id) : [],
//     );
//   };
//   const toggleSelectOne = (deptId) => {
//     setSelectedIds((prevIds) =>
//       prevIds.includes(deptId)
//         ? prevIds.filter((existingId) => existingId !== deptId)
//         : [...prevIds, deptId],
//     );
//   };

//   /* ── Open edit modal ── */
//   const openEditModal = (department) => {
//     setEditTarget(department);
//     setShowAddModal(true);
//   };
//   const closeAddModal = () => {
//     setShowAddModal(false);
//     setEditTarget(null);
//   };

//   /* ── Search reset page ── */
//   const handleSearch = (event) => {
//     setSearchQuery(event.target.value);
//     setCurrentPage(1);
//   };

//   /* ── Stat counts ── */
//   const totalCount = departments.length;
//   const activeCount = departments.filter(
//     (dept) => dept.status !== "inactive",
//   ).length;

//   return (
//     <div className="dp-page min-h-screen p-5 sm:p-6">
//       {/* ── Page header ── */}
//       <div className="flex items-start justify-between mb-6">
//         <div>
//           <h1 className="dp-title text-2xl font-bold">Departments</h1>
//           <p className="dp-subtitle text-[13.5px] mt-1">
//             Manage school departments and their details.
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           {/* <button className="dp-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors">
//             <Download size={15} /> Export
//           </button> */}
//           <button
//             onClick={() => {
//               setEditTarget(null);
//               setShowAddModal(true);
//             }}
//             className="dp-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors active:scale-[0.97] shadow-sm"
//           >
//             <Plus size={16} /> Add Department
//           </button>
//         </div>
//       </div>

//       {/* ── Stat cards ── */}
//       {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <StatCard icon={Building2} iconBgClass="dp-icon-primary-bg"  iconColorClass="dp-icon-primary"  value={totalCount}  label="Total departments" />
//         <StatCard icon={Building2} iconBgClass="dp-icon-success-bg"  iconColorClass="dp-icon-success"  value={activeCount} label="Active"             />
//         <StatCard icon={Building2} iconBgClass="dp-icon-warning-bg"  iconColorClass="dp-icon-warning"  value={0}           label="Under review"       />
//         <StatCard icon={Building2} iconBgClass="dp-icon-danger-bg"   iconColorClass="dp-icon-danger"   value={0}           label="Inactive"           />
//       </div> */}

//       {/* ── Search + view-toggle bar ── */}
//       <div className="dp-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-6">
//         {/* Search */}
//         <div className="dp-search-wrap flex items-center gap-2 flex-1 min-w-[180px] rounded-lg px-3 py-2.5">
//           <Search size={15} className="dp-search-icon shrink-0" />
//           <input
//             className="dp-search-input text-[13.5px] w-full"
//             placeholder="Search by name or description…"
//             value={searchQuery}
//             onChange={handleSearch}
//           />
//         </div>

//         {/* School Filter */}
//         {isAdmin && (
//           <select
//             value={selectedSchool}
//             onChange={(e) => setSelectedSchool(e.target.value)}
//             className="edp-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
//             disabled={schoolsLoading}
//           >
//             <option value="">All Schools</option>

//             {schools.map((school) => (
//               <option key={school.id} value={school.id}>
//                 {school.name}
//               </option>
//             ))}
//           </select>
//         )}

//         {/* Count + view toggle */}
//         <div className="flex items-center gap-3 ml-auto">
//           <span className="dp-count-text text-[12.5px]">
//             {filteredDepartments.length === 0
//               ? "No results"
//               : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredDepartments.length)} of ${filteredDepartments.length}`}
//           </span>
//           <div className="dp-toggle-group flex rounded-lg overflow-hidden">
//             <button
//               onClick={() => setViewMode("table")}
//               className={`p-2 ${viewMode === "table" ? "dp-toggle-btn-active" : "dp-toggle-btn"}`}
//             >
//               <List size={15} />
//             </button>
//             <button
//               onClick={() => setViewMode("grid")}
//               className={`p-2 ${viewMode === "grid" ? "dp-toggle-btn-active" : "dp-toggle-btn"}`}
//             >
//               <LayoutGrid size={15} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ── Loading / error / empty states ── */}
//       {loading && (
//         <div className="dp-table-card rounded-2xl p-12 text-center">
//           <p className="dp-loading text-[14px]">Loading departments…</p>
//         </div>
//       )}
//       {!loading && error && (
//         <div className="dp-table-card rounded-2xl p-12 text-center">
//           <p className="dp-error text-[14px]">{error}</p>
//         </div>
//       )}

//       {/* ── TABLE view ── */}
//       {!loading && !error && viewMode === "table" && (
//         <div className="dp-table-card rounded-2xl overflow-hidden">
//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-left">
//               <thead>
//                 <tr className="dp-thead text-[11.5px] uppercase tracking-wide">
//                   <th className="px-5 py-3 w-10">
//                     <input
//                       type="checkbox"
//                       className="dp-checkbox w-4 h-4 rounded"
//                       onChange={toggleSelectAll}
//                       checked={
//                         pagedRows.length > 0 &&
//                         pagedRows.every((dept) => selectedIds.includes(dept.id))
//                       }
//                     />
//                   </th>
//                   <th className="px-3 py-3 font-semibold">
//                     Name <SortIcon />
//                   </th>
//                   <th className="px-3 py-3 font-semibold">Description</th>
//                   <th className="px-3 py-3 font-semibold">
//                     STATUS <SortIcon />
//                   </th>
//                   <th className="px-3 py-3 font-semibold text-right pr-5">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {pagedRows.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={5}
//                       className="dp-empty-state px-5 py-12 text-center text-[13.5px]"
//                     >
//                       No departments found.
//                     </td>
//                   </tr>
//                 ) : (
//                   pagedRows.map((department) => (
//                     <tr
//                       key={department.id}
//                       className="dp-row transition-colors"
//                     >
//                       <td className="px-5 py-3.5">
//                         <input
//                           type="checkbox"
//                           className="dp-checkbox w-4 h-4 rounded"
//                           checked={selectedIds.includes(department.id)}
//                           onChange={() => toggleSelectOne(department.id)}
//                         />
//                       </td>
//                       <td className="px-3 py-3.5">
//                         <div className="flex items-center gap-3">
//                           <div className="dp-icon-primary-bg w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
//                             <Building2 size={16} className="dp-icon-primary" />
//                           </div>
//                           <span className="dp-cell-primary text-[13.5px] font-semibold">
//                             {department.name}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-3 py-3.5 max-w-[280px]">
//                         <p className="dp-cell-secondary text-[13px] truncate">
//                           {department.description || (
//                             <span className="dp-cell-muted">—</span>
//                           )}
//                         </p>
//                       </td>
//                       <td className="px-3 py-3.5">
//                         <span
//                           className={`dp-status ${
//                             department.status === "active"
//                               ? "dp-status-active"
//                               : "dp-status-inactive"
//                           }`}
//                         >
//                           {department.status}
//                         </span>
//                       </td>
//                       <td className="px-3 py-3.5">
//                         <div className="flex items-center justify-end gap-1 pr-2">
//                           <button
//                             onClick={() => openEditModal(department)}
//                             className="dp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//                           >
//                             <Pencil size={15} />
//                           </button>
//                           <button
//                             onClick={() => setDeleteTarget(department)}
//                             className="dp-action-btn dp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//                           >
//                             <Trash2 size={15} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div
//             className="flex items-center justify-between px-5 py-4"
//             style={{ borderTop: "1px solid var(--divider)" }}
//           >
//             <p className="dp-pagination-text text-[12.5px]">
//               Page {currentPage} of {totalPages}
//             </p>
//             <div className="flex items-center gap-1.5">
//               <button
//                 onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
//                 disabled={currentPage === 1}
//                 className="dp-page-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//               >
//                 <ChevronLeft size={15} />
//               </button>
//               {Array.from({ length: totalPages }, (_, index) => index + 1).map(
//                 (pageNumber) => (
//                   <button
//                     key={pageNumber}
//                     onClick={() => setCurrentPage(pageNumber)}
//                     className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-colors ${
//                       pageNumber === currentPage
//                         ? "dp-page-btn-active"
//                         : "dp-page-btn"
//                     }`}
//                   >
//                     {pageNumber}
//                   </button>
//                 ),
//               )}
//               <button
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.min(totalPages, prev + 1))
//                 }
//                 disabled={currentPage === totalPages}
//                 className="dp-page-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//               >
//                 <ChevronRight size={15} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── GRID view ── */}
//       {!loading && !error && viewMode === "grid" && (
//         <>
//           {pagedRows.length === 0 ? (
//             <div className="dp-table-card rounded-2xl p-12 text-center">
//               <p className="dp-empty-state text-[13.5px]">
//                 No departments found.
//               </p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {pagedRows.map((department) => (
//                 <div
//                   key={department.id}
//                   className="dp-stat-card rounded-2xl p-5 flex flex-col gap-3"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="dp-icon-primary-bg w-10 h-10 rounded-xl flex items-center justify-center">
//                       <Building2 size={18} className="dp-icon-primary" />
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <button
//                         onClick={() => openEditModal(department)}
//                         className="dp-action-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
//                       >
//                         <Pencil size={13} />
//                       </button>
//                       <button
//                         onClick={() => setDeleteTarget(department)}
//                         className="dp-action-btn dp-action-btn-danger w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
//                       >
//                         <Trash2 size={13} />
//                       </button>
//                     </div>
//                   </div>
//                   <div>
//                     <p className="dp-cell-primary text-[14px] font-bold">
//                       {department.name}
//                     </p>
//                     <p className="dp-cell-muted text-[12.5px] mt-1 line-clamp-2 leading-relaxed">
//                       {department.description || "No description provided."}
//                     </p>
//                   </div>
//                   <div
//                     className="mt-auto pt-2"
//                     style={{ borderTop: "1px solid var(--divider)" }}
//                   >
//                     <span className="dp-cell-muted text-[11.5px]">
//                       School ID:{" "}
//                     </span>
//                     <span className="dp-cell-secondary text-[11.5px] font-semibold">
//                       {department.school_id}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Pagination for grid */}
//           {pagedRows.length > 0 && (
//             <div className="flex items-center justify-between mt-5">
//               <p className="dp-pagination-text text-[12.5px]">
//                 Page {currentPage} of {totalPages}
//               </p>
//               <div className="flex items-center gap-1.5">
//                 <button
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.max(1, prev - 1))
//                   }
//                   disabled={currentPage === 1}
//                   className="dp-page-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//                 >
//                   <ChevronLeft size={15} />
//                 </button>
//                 {Array.from(
//                   { length: totalPages },
//                   (_, index) => index + 1,
//                 ).map((pageNumber) => (
//                   <button
//                     key={pageNumber}
//                     onClick={() => setCurrentPage(pageNumber)}
//                     className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-colors ${
//                       pageNumber === currentPage
//                         ? "dp-page-btn-active"
//                         : "dp-page-btn"
//                     }`}
//                   >
//                     {pageNumber}
//                   </button>
//                 ))}
//                 <button
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.min(totalPages, prev + 1))
//                   }
//                   disabled={currentPage === totalPages}
//                   className="dp-page-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//                 >
//                   <ChevronRight size={15} />
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* ── Modals ── */}
//       <AddDepartmentModal
//         isOpen={showAddModal}
//         onClose={closeAddModal}
//         department={editTarget}
//       />
//       <DeleteDepartmentModal
//         isOpen={Boolean(deleteTarget)}
//         onClose={() => setDeleteTarget(null)}
//         department={deleteTarget}
//       />
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDepartments } from "../../../../redux/schoolSetup/department/departmentSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import AddDepartmentModal from "../components/AddDepartmentModal";
import DeleteDepartmentModal from "../components/DeleteDepartmentModal";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";
import "../styles/Department.css";
import {
  Building2,
  Plus,
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";

function SortIcon() {
  return <ArrowUpDown size={11} className="inline ml-1 opacity-60" />;
}

export default function DepartmentPage() {
  const dispatch = useDispatch();

  const { departments, loading, error } = useSelector(
    (state) => state.departments,
  );
  const { user } = useSelector((state) => state.auth);
  const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading ?? false,
  );

  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const schoolId = isAdmin ? null : user?.school_id;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ── Fetch ── */
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (isAdmin && schools.length === 0) dispatch(fetchSchools());
  }, [dispatch, isAdmin, schools.length]);

  /* ── Filter ── */
  const filteredDepartments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return departments.filter((dept) => {
      const matchesSearch = query
        ? dept.name?.toLowerCase().includes(query) ||
          dept.description?.toLowerCase().includes(query)
        : true;
      const matchesSchool = isAdmin
        ? selectedSchool
          ? String(dept.school_id) === String(selectedSchool)
          : true
        : String(dept.school_id) === String(schoolId);
      return matchesSearch && matchesSchool;
    });
  }, [departments, searchQuery, isAdmin, selectedSchool, schoolId]);

  /* ── Pagination — replaces manual currentPage / totalPages / pagedRows ── */
  const {
    pagedData: pagedRows,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset,
  } = usePagination({ data: filteredDepartments, initialSize: 10 });

  /* ── Handlers ── */
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    reset(); // back to page 1 on new search
  };

  const handleSchoolChange = (event) => {
    setSelectedSchool(event.target.value);
    reset();
  };

  const toggleSelectAll = (event) => {
    setSelectedIds(
      event.target.checked ? pagedRows.map((dept) => dept.id) : [],
    );
  };

  const toggleSelectOne = (deptId) => {
    setSelectedIds((prevIds) =>
      prevIds.includes(deptId)
        ? prevIds.filter((existingId) => existingId !== deptId)
        : [...prevIds, deptId],
    );
  };

  const openEditModal = (department) => {
    setEditTarget(department);
    setShowAddModal(true);
  };
  const closeAddModal = () => {
    setShowAddModal(false);
    setEditTarget(null);
  };

  return (
    <div className="dp-page min-h-screen p-5 sm:p-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="dp-title text-2xl font-bold">Departments</h1>
          <p className="dp-subtitle text-[13.5px] mt-1">
            Manage school departments and their details.
          </p>
        </div>
        <button
          onClick={() => {
            setEditTarget(null);
            setShowAddModal(true);
          }}
          className="dp-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors active:scale-[0.97] shadow-sm"
        >
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="dp-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-6">
        <div className="dp-search-wrap flex items-center gap-2 flex-1 min-w-[180px] rounded-lg px-3 py-2.5">
          <Search size={15} className="dp-search-icon shrink-0" />
          <input
            className="dp-search-input text-[13.5px] w-full"
            placeholder="Search by name or description…"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {isAdmin && (
          <select
            value={selectedSchool}
            onChange={handleSchoolChange}
            className="dp-search-input rounded-lg px-3 py-2.5 text-[13.5px] min-w-[200px]"
            disabled={schoolsLoading}
          >
            <option value="">All Schools</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-3 ml-auto">
          <span className="dp-count-text text-[12.5px]">
            {totalItems === 0
              ? "No results"
              : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, totalItems)} of ${totalItems}`}
          </span>
          <div className="dp-toggle-group flex rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 ${viewMode === "table" ? "dp-toggle-btn-active" : "dp-toggle-btn"}`}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "dp-toggle-btn-active" : "dp-toggle-btn"}`}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="dp-table-card rounded-2xl p-12 text-center">
          <p className="dp-loading text-[14px]">Loading departments…</p>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="dp-table-card rounded-2xl p-12 text-center">
          <p className="dp-error text-[14px]">{error}</p>
        </div>
      )}

      {/* ── TABLE view ── */}
      {!loading && !error && viewMode === "table" && (
        <div className="dp-table-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="dp-thead text-[11.5px] uppercase tracking-wide">
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      className="dp-checkbox w-4 h-4 rounded"
                      onChange={toggleSelectAll}
                      checked={
                        pagedRows.length > 0 &&
                        pagedRows.every((dept) => selectedIds.includes(dept.id))
                      }
                    />
                  </th>
                  <th className="px-3 py-3 font-semibold">
                    Name <SortIcon />
                  </th>
                  <th className="px-3 py-3 font-semibold">Description</th>
                  <th className="px-3 py-3 font-semibold">
                    Status <SortIcon />
                  </th>
                  <th className="px-3 py-3 font-semibold text-right pr-5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="dp-empty-state px-5 py-12 text-center text-[13.5px]"
                    >
                      No departments found.
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((department) => (
                    <tr
                      key={department.id}
                      className="dp-row transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          className="dp-checkbox w-4 h-4 rounded"
                          checked={selectedIds.includes(department.id)}
                          onChange={() => toggleSelectOne(department.id)}
                        />
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="dp-icon-primary-bg w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                            <Building2 size={16} className="dp-icon-primary" />
                          </div>
                          <span className="dp-cell-primary text-[13.5px] font-semibold">
                            {department.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 max-w-[280px]">
                        <p className="dp-cell-secondary text-[13px] truncate">
                          {department.description || (
                            <span className="dp-cell-muted">—</span>
                          )}
                        </p>
                      </td>
                      <td className="px-3 py-3.5">
                        <span
                          className={`dp-status ${department.status === "active" ? "dp-status-active" : "dp-status-inactive"}`}
                        >
                          {department.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-end gap-1 pr-2">
                          <button
                            onClick={() => openEditModal(department)}
                            className="dp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(department)}
                            className="dp-action-btn dp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
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

          {/* ── Global Pagination (table) ── */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* ── GRID view ── */}
      {!loading && !error && viewMode === "grid" && (
        <>
          {pagedRows.length === 0 ? (
            <div className="dp-table-card rounded-2xl p-12 text-center">
              <p className="dp-empty-state text-[13.5px]">
                No departments found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pagedRows.map((department) => (
                <div
                  key={department.id}
                  className="dp-stat-card rounded-2xl p-5 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="dp-icon-primary-bg w-10 h-10 rounded-xl flex items-center justify-center">
                      <Building2 size={18} className="dp-icon-primary" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(department)}
                        className="dp-action-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(department)}
                        className="dp-action-btn dp-action-btn-danger w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="dp-cell-primary text-[14px] font-bold">
                      {department.name}
                    </p>
                    <p className="dp-cell-muted text-[12.5px] mt-1 line-clamp-2 leading-relaxed">
                      {department.description || "No description provided."}
                    </p>
                  </div>
                  <div
                    className="mt-auto pt-2"
                    style={{ borderTop: "1px solid var(--divider)" }}
                  >
                    <span className="dp-cell-muted text-[11.5px]">
                      School ID:{" "}
                    </span>
                    <span className="dp-cell-secondary text-[11.5px] font-semibold">
                      {department.school_id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Global Pagination (grid) ── */}
          {pagedRows.length > 0 && (
            <div className="dp-table-card rounded-2xl mt-4 overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <AddDepartmentModal
        isOpen={showAddModal}
        onClose={closeAddModal}
        department={editTarget}
      />
      <DeleteDepartmentModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        department={deleteTarget}
      />
    </div>
  );
}
