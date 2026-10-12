import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDepartments,
  toggleDepartmentStatus,
} from "../../../../redux/schoolSetup/department/departmentSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import AddDepartmentModal from "../components/AddDepartmentModal.jsx";
import DeleteDepartmentModal from "../components/DeleteDepartmentModal.jsx";
import DepartmentStatusModal from "../components/DepartmentStatusModal.jsx";
import DepartmentTable from "../components/DepartmentTable.jsx";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";
import toast from "react-hot-toast";
import "../styles/Department.css";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertTriangle,
  School,
  X,
  RotateCw,
  Loader2,
} from "lucide-react";

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

export default function DepartmentPage() {
  const dispatch = useDispatch();

  const { departments = [], loading, error } = useSelector(
    (state) => state.departments,
  );
  const { user } = useSelector((state) => state.auth);
  const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading ?? false,
  );

  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (user.is_admin || user.isAdmin) return true;
    if (Array.isArray(user.roles)) {
      return user.roles.some((r) =>
        (typeof r === "object" ? r?.name || "" : String(r))
          .toUpperCase()
          .includes("ADMIN"),
      );
    }
    return String(user.roles || user.role || "")
      .toUpperCase()
      .includes("ADMIN");
  }, [user]);

  const schoolId = isAdmin ? null : user?.school_id;

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState("table");

  // Sorting state
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Status Change Confirmation Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTargetDept, setStatusTargetDept] = useState(null);
  const [targetStatus, setTargetStatus] = useState("active");
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  /* ── Initial Data Fetch ── */
  const loadDepartments = useCallback(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  /* ── Safe Array Normalization ── */
  const deptList = useMemo(() => {
    if (Array.isArray(departments)) return departments;
    if (Array.isArray(departments?.data)) return departments.data;
    if (Array.isArray(departments?.departments)) return departments.departments;
    return [];
  }, [departments]);

  const schoolList = useMemo(() => {
    if (Array.isArray(schools)) return schools;
    if (Array.isArray(schools?.data)) return schools.data;
    if (Array.isArray(schools?.schools)) return schools.schools;
    return [];
  }, [schools]);

  /* ── School lookup map ── */
  const schoolsById = useMemo(() => {
    const map = {};
    schoolList.forEach((s) => {
      map[String(s.id)] = s.name;
    });
    return map;
  }, [schoolList]);

  /* ── KPI Stats ── */
  const stats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    const uniqueSchools = new Set();

    deptList.forEach((d) => {
      if (d.status === "active") active++;
      if (d.status === "inactive") inactive++;
      if (d.school_id) uniqueSchools.add(String(d.school_id));
    });

    return {
      total: deptList.length,
      active,
      inactive,
      schoolsCount: isAdmin
        ? schoolList.length || uniqueSchools.size
        : 1,
    };
  }, [deptList, schoolList, isAdmin]);

  /* ── Client Filtering & Sorting ── */
  const filteredDepartments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = deptList.filter((dept) => {
      // 1. Text Search (name or description)
      const matchesSearch = query
        ? dept.name?.toLowerCase().includes(query) ||
          dept.description?.toLowerCase().includes(query)
        : true;

      // 2. School Filter
      const matchesSchool = isAdmin
        ? selectedSchool
          ? String(dept.school_id) === String(selectedSchool)
          : true
        : String(dept.school_id) === String(schoolId);

      // 3. Status Filter
      const matchesStatus = selectedStatus
        ? String(dept.status).toLowerCase() === selectedStatus.toLowerCase()
        : true;

      return matchesSearch && matchesSchool && matchesStatus;
    });

    // Sort rows
    return filtered.sort((a, b) => {
      let valA = a[sortBy] ?? "";
      let valB = b[sortBy] ?? "";

      if (sortBy === "school_name") {
        valA = a.school_name || schoolsById[String(a.school_id)] || "";
        valB = b.school_name || schoolsById[String(b.school_id)] || "";
      }

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    departments,
    searchQuery,
    isAdmin,
    selectedSchool,
    schoolId,
    selectedStatus,
    sortBy,
    sortOrder,
    schoolsById,
  ]);

  /* ── Pagination ── */
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
    reset();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    reset();
  };

  const handleSort = (colKey) => {
    if (sortBy === colKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(colKey);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSchool("");
    setSelectedStatus("");
    reset();
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedSchool || selectedStatus,
  );

  const toggleSelectAll = (event) => {
    setSelectedIds(
      event.target.checked ? pagedRows.map((dept) => dept.id) : [],
    );
  };

  const toggleSelectOne = (deptId) => {
    setSelectedIds((prevIds) =>
      prevIds.includes(deptId)
        ? prevIds.filter((id) => id !== deptId)
        : [...prevIds, deptId],
    );
  };

  const openAddModal = () => {
    setEditTarget(null);
    setShowAddModal(true);
  };

  const openEditModal = (dept) => {
    setEditTarget(dept);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setEditTarget(null);
  };

  /* ── Status Toggle with Confirmation Modal ── */
  const handleStatusToggleRequest = (dept, nextStatus) => {
    setStatusTargetDept(dept);
    setTargetStatus(
      nextStatus || (dept.status === "active" ? "inactive" : "active"),
    );
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async (deptId, next) => {
    setStatusUpdatingId(deptId);
    try {
      await dispatch(
        toggleDepartmentStatus({ id: deptId, status: next }),
      ).unwrap();
      toast.success(
        `Department '${statusTargetDept?.name || "status"}' changed to ${next} successfully!`,
      );
      setStatusModalOpen(false);
      setStatusTargetDept(null);
      dispatch(fetchDepartments());
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "Failed to update department status";
      toast.error(msg);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  /* ── Dropdown Options ── */
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const schoolOptions = useMemo(
    () => [
      { value: "", label: "All Schools" },
      ...schoolList.map((s) => ({ value: s.id, label: s.name })),
    ],
    [schoolList],
  );

  return (
    <div className="dp-page min-h-screen p-5 sm:p-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="dp-title text-2xl font-bold tracking-tight">
            Department Management
          </h1>
          <p className="dp-subtitle text-[13.5px] mt-1">
            Organize, manage, and configure academic and operational departments.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDepartments}
            className="dp-btn-outline inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
            title="Refresh list"
          >
            <RotateCw size={15} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="dp-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all active:scale-[0.97] shadow-sm"
          >
            <Plus size={16} /> Add Department
          </button>
        </div>
      </div>

      {/* ── KPI Stat Summary Cards (matches roles & user modules) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
        {/* Total Departments */}
        <div className="dp-stat-card p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-[12px] font-medium dp-stat-label">Total Departments</p>
            <h3 className="text-xl font-bold dp-stat-value">{stats.total}</h3>
          </div>
        </div>

        {/* Active Departments */}
        <div className="dp-stat-card p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[12px] font-medium dp-stat-label">Active</p>
            <h3 className="text-xl font-bold dp-stat-value">{stats.active}</h3>
          </div>
        </div>

        {/* Inactive Departments */}
        <div className="dp-stat-card p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[12px] font-medium dp-stat-label">Inactive</p>
            <h3 className="text-xl font-bold dp-stat-value">{stats.inactive}</h3>
          </div>
        </div>

        {/* Schools Count */}
        <div className="dp-stat-card p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <School size={22} />
          </div>
          <div>
            <p className="text-[12px] font-medium dp-stat-label">
              {isAdmin ? "Schools" : "Assigned School"}
            </p>
            <h3 className="text-xl font-bold dp-stat-value">{stats.schoolsCount}</h3>
          </div>
        </div>
      </div>

      {/* ── Toolbar with Search, Custom Dropdown filters, and View Switcher ── */}
      <div className="dp-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-6">
        {/* Search */}
        <div className="dp-search-wrap flex items-center gap-2 flex-1 min-w-[200px] max-w-sm rounded-lg px-3 py-2">
          <Search size={15} className="dp-search-icon shrink-0" />
          <input
            className="dp-search-input text-[13.5px] w-full"
            placeholder="Search departments…"
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter (Custom Dropdown) */}
        <CustomDropdown
          options={statusOptions}
          value={selectedStatus}
          onChange={(val) => {
            setSelectedStatus(val);
            reset();
          }}
          placeholder="All Statuses"
          className="min-w-[140px]"
        />

        {/* School Filter — Admin only (Custom Dropdown) */}
        {isAdmin && (
          <CustomDropdown
            options={schoolOptions}
            value={selectedSchool}
            onChange={(val) => {
              setSelectedSchool(val);
              reset();
            }}
            placeholder={schoolsLoading ? "Loading schools…" : "All Schools"}
            searchable={schools.length > 5}
            searchPlaceholder="Search schools…"
            className="min-w-[180px]"
          />
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-[12.5px] font-semibold text-primary hover:underline px-2 py-1"
          >
            Clear filters
          </button>
        )}

        {/* Right side: Count & View Switcher */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="dp-stat-label text-[12.5px]">
            {totalItems === 0
              ? "No results"
              : `${(currentPage - 1) * pageSize + 1}–${Math.min(
                  currentPage * pageSize,
                  totalItems,
                )} of ${totalItems}`}
          </span>

          <div className="dp-toggle-group flex rounded-lg overflow-hidden border border-border/80">
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-2 transition-colors ${
                viewMode === "table" ? "dp-toggle-btn-active" : "dp-toggle-btn"
              }`}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-2 transition-colors ${
                viewMode === "grid" ? "dp-toggle-btn-active" : "dp-toggle-btn"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && deptList.length === 0 ? (
        <div className="dp-table-card rounded-2xl p-12 text-center border border-border/60">
          <RotateCw size={24} className="animate-spin text-primary mx-auto mb-3" />
          <p className="dp-loading text-[14px]">Loading departments…</p>
        </div>
      ) : error && deptList.length === 0 ? (
        <div className="dp-table-card rounded-2xl p-12 text-center border border-border/60">
          <AlertTriangle size={28} className="text-destructive mx-auto mb-2" />
          <p className="dp-error text-[14px] mb-3">{error}</p>
          <button
            onClick={loadDepartments}
            className="dp-btn-outline px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ── TABLE VIEW ── */
        <DepartmentTable
          pagedRows={pagedRows}
          selectedIds={selectedIds}
          toggleSelectAll={toggleSelectAll}
          toggleSelectOne={toggleSelectOne}
          openEditModal={openEditModal}
          setDeleteTarget={setDeleteTarget}
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
          showSchoolColumn={isAdmin}
          schoolsById={schoolsById}
          onStatusToggle={handleStatusToggleRequest}
          statusUpdatingId={statusUpdatingId}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      ) : (
        /* ── GRID VIEW ── */
        <>
          {pagedRows.length === 0 ? (
            <div className="dp-table-card rounded-2xl p-12 text-center border border-border/60">
              <p className="dp-empty-state text-[13.5px]">
                No departments found matching the filter criteria.
              </p>
            </div>
          ) : (
            <div className="dp-grid">
              {pagedRows.map((department) => {
                const schoolName =
                  department.school_name ||
                  schoolsById[String(department.school_id)] ||
                  "—";

                return (
                  <div
                    key={department.id}
                    className="dp-stat-card rounded-2xl p-5 flex flex-col gap-3.5 border border-border/60 shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Top row: Avatar + Actions */}
                    <div className="flex items-start justify-between">
                      <div className="dp-icon-primary-bg w-10 h-10 rounded-xl flex items-center justify-center">
                        <Building2 size={19} className="dp-icon-primary" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(department)}
                          className="dp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:text-primary"
                          title="Edit Department"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(department)}
                          className="dp-action-btn dp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          title="Delete Department"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Department Title & Description */}
                    <div>
                      <p className="dp-cell-primary text-[14.5px] font-bold">
                        {department.name}
                      </p>
                      <p className="dp-cell-muted text-[12.5px] mt-1 line-clamp-2 leading-relaxed">
                        {department.description || "No description provided."}
                      </p>
                    </div>

                    {/* Status with Toggle Switch + Pill */}
                    <div className="flex items-center gap-2 pt-1">
                      {statusUpdatingId === department.id ? (
                        <Loader2 size={16} className="animate-spin text-primary" />
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusToggleRequest(
                              department,
                              department.status === "active"
                                ? "inactive"
                                : "active",
                            )
                          }
                          title={`Toggle status to ${
                            department.status === "active"
                              ? "inactive"
                              : "active"
                          }`}
                          className={`dp-toggle-switch relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            department.status === "active"
                              ? "bg-emerald-500"
                              : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              department.status === "active"
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      )}

                      <span
                        className={`dp-status ${
                          department.status === "active"
                            ? "dp-status-active"
                            : "dp-status-inactive"
                        }`}
                      >
                        {department.status}
                      </span>
                    </div>

                    {/* Footer: School info + Created Date */}
                    <div
                      className="mt-auto pt-2.5 flex items-center justify-between text-[11.5px]"
                      style={{ borderTop: "1px solid var(--divider)" }}
                    >
                      <span className="dp-cell-secondary font-medium truncate max-w-[150px]">
                        {schoolName}
                      </span>
                      <span className="dp-cell-muted">
                        {formatDate(department.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grid View Pagination */}
          {pagedRows.length > 0 && (
            <div className="dp-table-card rounded-2xl mt-4 overflow-hidden border border-border/60">
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

      <DepartmentStatusModal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusTargetDept(null);
        }}
        department={statusTargetDept}
        targetStatus={targetStatus}
        onConfirm={handleConfirmStatusChange}
        submitting={Boolean(statusUpdatingId)}
      />
    </div>
  );
}