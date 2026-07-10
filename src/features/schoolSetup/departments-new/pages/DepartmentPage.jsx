import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDepartments } from "../../../../redux/schoolSetup/department/departmentSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import AddDepartmentModal from "../components/AddDepartmentModal.jsx";
import DeleteDepartmentModal from "../components/DeleteDepartmentModal.jsx";
import DepartmentTable from "../components/DepartmentTable.jsx";
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";
import "../styles/Department.css";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";

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
        />
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
