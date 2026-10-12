import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search, RotateCcw, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ClassSectionTable from "../components/ClassSectionTable.jsx";
import ClassSectionModal from "../components/ClassSectionModal.jsx";
import DeleteClassSectionModal from "../components/DeleteClassSectionModal.jsx";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import {
  fetchClassSections,
  addClassSection,
  editClassSection,
  toggleClassSectionStatus,
} from "../../../../redux/schoolSetup/class-sections/classSectionSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import "../styles/ClassSection.css";

const ClassSectionPage = () => {
  const dispatch = useDispatch();
  const { classSections, loading, error } = useSelector(
    (state) => state.classSections,
  );
  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

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
  ];

  // Build API query parameters
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

  // Fetch class sections with 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = buildQueryParams();
      dispatch(fetchClassSections(params));
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, buildQueryParams]);

  const refreshClassSections = useCallback(() => {
    const params = buildQueryParams();
    dispatch(fetchClassSections(params));
  }, [dispatch, buildQueryParams]);

  // Client fallback filter for instant UI responsiveness
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return classSections.filter((cs) => {
      const matchesSearch = term
        ? `${cs.class_name} ${cs.section_name} ${cs.academic_year || ""} ${cs.class_teacher_name || ""}`
            .toLowerCase()
            .includes(term)
        : true;

      const matchesSchool =
        isAdmin && selectedSchool
          ? String(cs.school_id) === String(selectedSchool)
          : true;

      const matchesStatus = selectedStatus
        ? String(cs.status).toLowerCase() === selectedStatus.toLowerCase()
        : true;

      return matchesSearch && matchesSchool && matchesStatus;
    });
  }, [classSections, search, selectedSchool, selectedStatus, isAdmin]);

  const hasActiveFilters = Boolean(
    search.trim() || (isAdmin && selectedSchool) || selectedStatus,
  );

  const resetFilters = () => {
    setSearch("");
    setSelectedSchool("");
    setSelectedStatus("");
  };

  const handleToggleStatus = async (item, nextStatus) => {
    try {
      setStatusUpdatingId(item.id);
      await dispatch(
        toggleClassSectionStatus({ id: item.id, status: nextStatus }),
      ).unwrap();
    } catch (err) {
      alert(err?.message || "Failed to update status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await dispatch(
          editClassSection({ id: editingItem.id, data: payload }),
        ).unwrap();
      } else {
        await dispatch(addClassSection(payload)).unwrap();
      }
      refreshClassSections();
      closeModal();
    } catch (err) {
      alert(err?.message || err || "Failed to save class section");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    const item = classSections.find((cs) => String(cs.id) === String(id));
    setDeleteTarget(item ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    refreshClassSections();
  };

  return (
    <div className="cs-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="cs-title text-2xl font-bold">
            Class Section Management
          </h1>
          <p className="cs-subtitle text-[13.5px] mt-1">
            Map classes to sections, teachers, and capacity for each
            academic year.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="cs-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Class Section
        </button>
      </div>

      {/* Toolbar */}
      <div className="cs-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={15}
            className="cs-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class/section…"
            className="cs-search-input w-full rounded-lg pl-9 pr-8 py-2 text-[13.5px] transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* School Dropdown (Admin) */}
        {isAdmin && (
          <div className="min-w-[190px]">
            <CustomDropdown
              options={schoolOptions}
              value={selectedSchool}
              onChange={setSelectedSchool}
              placeholder="All Schools"
              disabled={schoolsLoading}
            />
          </div>
        )}

        {/* Status Dropdown */}
        <div className="min-w-[150px]">
          <CustomDropdown
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="All Statuses"
          />
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Reset all filters"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        )}

        {/* Count Badge */}
        <span className="cs-count-text text-[12.5px] ml-auto">
          {filtered.length} section{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading && classSections.length === 0 ? (
        <p className="cs-loading px-2 py-10 text-[13.5px]">
          Loading class sections…
        </p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="cs-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={refreshClassSections}
            className="cs-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <ClassSectionTable
          classSections={filtered}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onToggleStatus={handleToggleStatus}
          statusUpdatingId={statusUpdatingId}
          deletingId={deleteTarget?.id ?? null}
          showSchoolColumn={isAdmin && !selectedSchool}
        />
      )}

      <ClassSectionModal
        isOpen={modalOpen}
        onClose={closeModal}
        classSection={editingItem}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteClassSectionModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        classSection={deleteTarget}
      />
    </div>
  );
};

export default ClassSectionPage;