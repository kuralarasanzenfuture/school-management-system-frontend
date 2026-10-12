import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search, RotateCcw, X } from "lucide-react";
import SectionTable from "../components/SectionTable";
import SectionModal from "../components/SectionModal";
import DeleteSectionModal from "../components/DeleteSectionModal";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchSections,
  addSection,
  editSection,
  toggleSectionStatus,
} from "../../../../redux/schoolSetup/section/sectionSlice.js";
import { fetchClasses } from "../../../../redux/schoolSetup/class/classSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

import "../styles/Section.css";

const SectionPage = () => {
  const dispatch = useDispatch();
  const { sections, loading, error } = useSelector((state) => state.sections);
  const { classes } = useSelector((state) => state.classes);

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
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

  // Load schools for admin
  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  // Load classes for dropdown
  useEffect(() => {
    dispatch(fetchClasses({ paginate: false }));
  }, [dispatch]);

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

  const classList = useMemo(() => {
    let list = Array.isArray(classes) ? classes : classes?.data || [];
    if (isAdmin && selectedSchool) {
      list = list.filter((c) => String(c.school_id) === String(selectedSchool));
    }
    return list;
  }, [classes, isAdmin, selectedSchool]);

  const classOptions = useMemo(
    () => [
      { value: "", label: "All Classes" },
      ...classList.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [classList],
  );

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
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

    if (selectedClass) {
      params.class_id = selectedClass;
    }

    if (selectedStatus) {
      params.status = selectedStatus;
    }

    return params;
  }, [search, isAdmin, selectedSchool, selectedClass, selectedStatus]);

  // Fetch sections with 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = buildQueryParams();
      dispatch(fetchSections(params));
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, buildQueryParams]);

  const refreshSections = useCallback(() => {
    const params = buildQueryParams();
    dispatch(fetchSections(params));
  }, [dispatch, buildQueryParams]);

  // Client fallback filter for instant responsiveness
  const filteredSections = useMemo(() => {
    const term = search.trim().toLowerCase();

    return sections.filter((s) => {
      const name = s.section_name || s.name || "";
      const className =
        s.class_name || (typeof s.class_id === "object" ? s.class_id?.name : "");

      const matchesSearch =
        !term ||
        name.toLowerCase().includes(term) ||
        (className && className.toLowerCase().includes(term)) ||
        (s.school_name && s.school_name.toLowerCase().includes(term));

      const sectionClassId =
        typeof s.class_id === "object" ? s.class_id?.id : s.class_id;

      const matchesClass = selectedClass
        ? String(sectionClassId) === String(selectedClass)
        : true;

      const matchesSchool = isAdmin
        ? selectedSchool
          ? String(s.school_id) === String(selectedSchool)
          : true
        : String(s.school_id) === String(schoolId);

      const matchesStatus = selectedStatus
        ? String(s.status).toLowerCase() === selectedStatus.toLowerCase()
        : true;

      return matchesSearch && matchesClass && matchesSchool && matchesStatus;
    });
  }, [sections, search, selectedClass, selectedSchool, isAdmin, schoolId, selectedStatus]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      (isAdmin && selectedSchool) ||
      selectedClass ||
      selectedStatus,
  );

  const resetFilters = () => {
    setSearch("");
    setSelectedSchool("");
    setSelectedClass("");
    setSelectedStatus("");
  };

  const handleToggleStatus = async (section, nextStatus) => {
    try {
      setStatusUpdatingId(section.id);
      await dispatch(
        toggleSectionStatus({ id: section.id, status: nextStatus }),
      ).unwrap();
    } catch (err) {
      alert(err?.message || "Failed to update section status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const openAddModal = () => {
    setEditingSection(null);
    setModalOpen(true);
  };

  const openEditModal = (section) => {
    setEditingSection(section);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSection(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      if (editingSection) {
        await dispatch(
          editSection({
            id: editingSection.id,
            formData: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(addSection(payload)).unwrap();
      }
      refreshSections();
      closeModal();
    } catch (err) {
      alert(err.message || "Failed to save section");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    const section = sections.find((s) => String(s.id) === String(id));
    setDeleteTarget(section ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    refreshSections();
  };

  return (
    <div className="sp-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="sp-title text-2xl font-bold">Section Management</h1>
          <p className="sp-subtitle text-[13.5px] mt-1">
            Create and manage the sections within each class.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="sp-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Section
        </button>
      </div>

      {/* Toolbar */}
      <div className="sp-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={15}
            className="sp-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sections…"
            className="sp-search-input w-full rounded-lg pl-9 pr-8 py-2 text-[13.5px] transition-all"
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
              onChange={(val) => {
                setSelectedSchool(val);
                setSelectedClass("");
              }}
              placeholder="All Schools"
              disabled={schoolsLoading}
            />
          </div>
        )}

        {/* Class Dropdown */}
        <div className="min-w-[170px]">
          <CustomDropdown
            options={classOptions}
            value={selectedClass}
            onChange={setSelectedClass}
            placeholder="All Classes"
          />
        </div>

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
        <span className="sp-count-text text-[12.5px] ml-auto">
          {filteredSections.length} section
          {filteredSections.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading && sections.length === 0 ? (
        <p className="sp-loading px-2 py-10 text-[13.5px]">Loading sections…</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="sp-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={refreshSections}
            className="sp-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <SectionTable
          sections={filteredSections}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onToggleStatus={handleToggleStatus}
          statusUpdatingId={statusUpdatingId}
          deletingId={deleteTarget?.id ?? null}
          showSchoolColumn={isAdmin && !selectedSchool}
        />
      )}

      <SectionModal
        isOpen={modalOpen}
        onClose={closeModal}
        section={editingSection}
        availableClasses={classes}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteSectionModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        section={deleteTarget}
      />
    </div>
  );
};

export default SectionPage;
