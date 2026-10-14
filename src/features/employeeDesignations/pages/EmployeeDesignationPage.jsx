import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search } from "lucide-react";
import EmployeeDesignationTable from "../components/EmployeeDesignationTable";
import EmployeeDesignationModal from "../components/EmployeeDesignationModal";
import EmployeeDesignationStatusModal from "../components/EmployeeDesignationStatusModal";
import {
  fetchEmployeeDesignations,
  addEmployeeDesignation,
  editEmployeeDesignation,
  toggleEmployeeDesignationStatus,
  removeEmployeeDesignation,
} from "../../../redux/employeeDesignation/employeeDesignationSlice.js";
import "../styles/EmployeeDesignation.css";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import CustomDropdown from "../../../common/components/dropdown/CustomDropdown.jsx";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const EmployeeDesignationPage = () => {
  const dispatch = useDispatch();

  const { employeeDesignations, loading, error } = useSelector(
    (state) => state.employeeDesignations,
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  /* Status confirmation modal state (matching DepartmentStatusModal) */
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTargetDesignation, setStatusTargetDesignation] = useState(null);
  const [targetStatus, setTargetStatus] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  const schoolList = useMemo(() => {
    const raw = Array.isArray(schools)
      ? schools
      : schools?.schools || schools?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [schools]);

  const schoolOptions = useMemo(
    () => [
      { value: "", label: "All Schools" },
      ...schoolList.map((school) => ({
        value: String(school.id),
        label: school.name,
      })),
    ],
    [schoolList],
  );

  useEffect(() => {
    if (isAdmin && schoolList.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schoolList.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = {};
    if (isAdmin && selectedSchool) {
      params.school_id = selectedSchool;
    }
    if (statusFilter) {
      params.status = statusFilter;
    }
    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    dispatch(fetchEmployeeDesignations(params));
  }, [dispatch, isAdmin, selectedSchool, statusFilter, debouncedSearch]);

  const filteredDesignations = useMemo(() => {
    let list = Array.isArray(employeeDesignations)
      ? employeeDesignations
      : employeeDesignations?.data || employeeDesignations?.designations || [];

    // Search
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name?.toLowerCase().includes(term) ||
          d.description?.toLowerCase().includes(term),
      );
    }

    // Status filter
    if (statusFilter) {
      list = list.filter((d) => d.status === statusFilter);
    }

    // School filter (Admin only)
    if (isAdmin && selectedSchool) {
      list = list.filter((d) => Number(d.school_id) === Number(selectedSchool));
    }

    return list;
  }, [employeeDesignations, search, statusFilter, selectedSchool, isAdmin]);

  const openAddModal = () => {
    setEditingDesignation(null);
    setModalOpen(true);
  };

  const openEditModal = (designation) => {
    setEditingDesignation(designation);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDesignation(null);
  };

  /* ── Status Toggle Request opens confirmation modal (matching DepartmentStatusModal) ── */
  const handleStatusToggleRequest = (designation, nextStatus) => {
    setStatusTargetDesignation(designation);
    setTargetStatus(
      nextStatus || (designation.status === "active" ? "inactive" : "active"),
    );
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setStatusTargetDesignation(null);
    setTargetStatus("");
  };

  const handleConfirmStatusChange = async (designationId, next) => {
    setStatusSubmitting(true);
    setTogglingId(designationId);
    try {
      await dispatch(
        toggleEmployeeDesignationStatus({
          id: designationId,
          status: next,
        }),
      ).unwrap();
      closeStatusModal();
    } catch (err) {
      alert(err || "Failed to update designation status");
    } finally {
      setStatusSubmitting(false);
      setTogglingId(null);
    }
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingDesignation) {
        await dispatch(
          editEmployeeDesignation({
            id: editingDesignation.id,
            formData: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(addEmployeeDesignation(payload)).unwrap();
      }
      const params = {};
      if (isAdmin && selectedSchool) params.school_id = selectedSchool;
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      await dispatch(fetchEmployeeDesignations(params));
      closeModal();
    } catch (err) {
      alert(err || "Failed to save designation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this designation? This can't be undone.",
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await dispatch(removeEmployeeDesignation(id)).unwrap();
    } catch (err) {
      alert(err || "Failed to delete designation");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="edp-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="edp-title text-2xl font-bold">
            Employee Designations
          </h1>
          <p className="edp-subtitle text-[13.5px] mt-1">
            Manage the job titles/designations available for employees.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="edp-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Designation
        </button>
      </div>

      {/* Toolbar */}
      <div className="edp-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="edp-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search designations…"
            className="edp-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>

        {/* Status Filter */}
        <CustomDropdown
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          placeholder="All Statuses"
          className="min-w-[150px]"
        />

        {/* School Filter */}
        {isAdmin && (
          <CustomDropdown
            options={schoolOptions}
            value={selectedSchool}
            onChange={(val) => setSelectedSchool(val)}
            placeholder={schoolsLoading ? "Loading schools…" : "All Schools"}
            searchable={schoolOptions.length > 5}
            searchPlaceholder="Search schools…"
            disabled={schoolsLoading}
            className="min-w-[220px]"
          />
        )}

        <span className="edp-count-text text-[12.5px] ml-auto">
          {filteredDesignations.length} designation
          {filteredDesignations.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading &&
      (!employeeDesignations || employeeDesignations.length === 0) ? (
        <p className="edp-loading px-2 py-10 text-[13.5px]">
          Loading designations…
        </p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="edp-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchEmployeeDesignations())}
            className="edp-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <EmployeeDesignationTable
          designations={filteredDesignations}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onToggleStatus={handleStatusToggleRequest}
          deletingId={deletingId}
          togglingId={togglingId}
          initialPageSize={10} // optional, default 10
          pageSizeOptions={[5, 10, 20, 50]} // optional
        />
      )}

      <EmployeeDesignationModal
        isOpen={modalOpen}
        onClose={closeModal}
        designation={editingDesignation}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <EmployeeDesignationStatusModal
        isOpen={statusModalOpen}
        onClose={closeStatusModal}
        designation={statusTargetDesignation}
        targetStatus={targetStatus}
        onConfirm={handleConfirmStatusChange}
        submitting={statusSubmitting}
      />
    </div>
  );
};

export default EmployeeDesignationPage;
