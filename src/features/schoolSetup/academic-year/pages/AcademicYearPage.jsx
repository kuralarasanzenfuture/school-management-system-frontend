import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search, RotateCcw, X } from "lucide-react";
import AcademicYearTable from "../components/AcademicYearTable";
import AcademicYearModal from "../components/AcademicYearModal";
import DeleteAcademicYearModal from "../components/DeleteAcademicYearModal";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchAcademicYears,
  addAcademicYear,
  editAcademicYear,
  toggleAcademicYearStatus,
} from "../../../../redux/schoolSetup/academic-year/academicYearSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

import "../styles/AcademicYear.css";

const AcademicYearPage = () => {
  const dispatch = useDispatch();
  const { academicYears, loading, error } = useSelector(
    (state) => state.academicYears,
  );

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  // Load schools for admin dropdown
  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  const schoolList = useMemo(() => {
    if (Array.isArray(schools)) return schools;
    if (Array.isArray(schools?.data)) return schools.data;
    if (Array.isArray(schools?.schools)) return schools.schools;
    return [];
  }, [schools]);

  const schoolOptions = useMemo(
    () => [
      { value: "", label: "All Schools" },
      ...schoolList.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [schoolList],
  );

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "archived", label: "Archived" },
  ];

  // Build API filter query parameters
  const buildQueryParams = useCallback(() => {
    const params = { paginate: false };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (isAdmin && selectedSchool) {
      params.school_id = selectedSchool;
    }

    if (selectedStatus) {
      params.status = selectedStatus;
    }

    return params;
  }, [search, isAdmin, selectedSchool, selectedStatus]);

  // Fetch academic years with debounced filter parameters
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = buildQueryParams();
      dispatch(fetchAcademicYears(params));
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, buildQueryParams]);

  const refreshAcademicYears = useCallback(() => {
    const params = buildQueryParams();
    dispatch(fetchAcademicYears(params));
  }, [dispatch, buildQueryParams]);

  // Client fallback filter for instant responsiveness
  const filteredYears = useMemo(() => {
    const term = search.trim().toLowerCase();

    return academicYears.filter((y) => {
      const matchesSearch =
        !term ||
        y.name?.toLowerCase().includes(term) ||
        y.school_name?.toLowerCase().includes(term) ||
        y.remarks?.toLowerCase().includes(term);

      const matchesSchool = isAdmin
        ? selectedSchool
          ? String(y.school_id) === String(selectedSchool)
          : true
        : String(y.school_id) === String(schoolId);

      const matchesStatus = selectedStatus
        ? String(y.status).toLowerCase() === selectedStatus.toLowerCase()
        : true;

      return matchesSearch && matchesSchool && matchesStatus;
    });
  }, [academicYears, search, selectedSchool, isAdmin, schoolId, selectedStatus]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      (isAdmin && selectedSchool) ||
      selectedStatus
  );

  const resetFilters = () => {
    setSearch("");
    setSelectedSchool("");
    setSelectedStatus("");
  };

  const openAddModal = () => {
    setEditingYear(null);
    setModalOpen(true);
  };

  const openEditModal = (year) => {
    setEditingYear(year);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingYear(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      if (editingYear) {
        await dispatch(
          editAcademicYear({
            id: editingYear.id,
            formData: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(addAcademicYear(payload)).unwrap();
      }

      closeModal();
      refreshAcademicYears();
    } catch (err) {
      alert(err || "Failed to save academic year");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    const year = academicYears.find((y) => String(y.id) === String(id));
    setDeleteTarget(year ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    refreshAcademicYears();
  };

  // Status toggle handler
  const handleToggleStatus = async (year, nextStatus) => {
    if (!year?.id) return;
    setStatusUpdatingId(year.id);
    try {
      await dispatch(
        toggleAcademicYearStatus({ id: year.id, status: nextStatus })
      ).unwrap();
      refreshAcademicYears();
    } catch (err) {
      alert(err || "Failed to update academic year status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="ay-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="ay-title text-2xl font-bold">
            Academic Year Management
          </h1>
          <p className="ay-subtitle text-[13.5px] mt-1">
            Create and manage the academic years for your school.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="ay-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Academic Year
        </button>
      </div>

      {/* Toolbar with CustomDropdown filters (matching Department exactly) */}
      <div className="ay-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={15}
            className="ay-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search academic years…"
            className="ay-search-input w-full rounded-lg pl-9 pr-8 py-2 text-[13.5px] transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter (Custom Dropdown - matching Department) */}
        <CustomDropdown
          options={statusOptions}
          value={selectedStatus}
          onChange={(val) => {
            setSelectedStatus(val);
          }}
          placeholder="All Statuses"
          className="min-w-[140px]"
        />

        {/* School Filter — Admin only (Custom Dropdown - matching Department) */}
        {isAdmin && (
          <CustomDropdown
            options={schoolOptions}
            value={selectedSchool}
            onChange={(val) => {
              setSelectedSchool(val);
            }}
            placeholder={schoolsLoading ? "Loading schools…" : "All Schools"}
            searchable={schoolOptions.length > 5}
            searchPlaceholder="Search schools…"
            className="min-w-[200px]"
          />
        )}

        {/* Reset Filters button if any active */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="ay-btn-outline inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors"
            title="Reset filters"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}

        <span className="ay-count-text text-[12.5px] ml-auto">
          {filteredYears.length} year{filteredYears.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading && academicYears.length === 0 ? (
        <p className="ay-loading px-2 py-10 text-[13.5px]">
          Loading academic years…
        </p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="ay-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={refreshAcademicYears}
            className="ay-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <AcademicYearTable
          academicYears={filteredYears}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onToggleStatus={handleToggleStatus}
          deletingId={deleteTarget?.id ?? null}
          statusUpdatingId={statusUpdatingId}
          showSchoolColumn={isAdmin && !selectedSchool}
        />
      )}

      {/* Modals */}
      <AcademicYearModal
        isOpen={modalOpen}
        onClose={closeModal}
        year={editingYear}
        schoolId={schoolId}
        isAdmin={isAdmin}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteAcademicYearModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        year={deleteTarget}
      />
    </div>
  );
};

export default AcademicYearPage;
