import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search, RotateCcw, X } from "lucide-react";
import ClassTable from "../components/ClassTable.jsx";
import ClassModal from "../components/ClassModel.jsx";
import DeleteClassModal from "../components/DeleteClassModal.jsx";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchClasses,
  addClass,
  editClass,
  toggleClassStatus,
} from "../../../../redux/schoolSetup/class/classSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

import "../styles/Class.css";

const ClassPage = () => {
  const dispatch = useDispatch();
  const { classes, loading, error } = useSelector((state) => state.classes);

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
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

  // Fetch classes from backend with debounced filter parameters
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = buildQueryParams();
      dispatch(fetchClasses(params));
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, buildQueryParams]);

  const refreshClasses = useCallback(() => {
    const params = buildQueryParams();
    dispatch(fetchClasses(params));
  }, [dispatch, buildQueryParams]);

  // Client fallback filter for instant UI responsiveness
  const filteredClasses = useMemo(() => {
    const term = search.trim().toLowerCase();

    return classes.filter((c) => {
      const matchesSearch =
        !term ||
        c.name?.toLowerCase().includes(term) ||
        c.school_name?.toLowerCase().includes(term);

      const matchesSchool = isAdmin
        ? selectedSchool
          ? String(c.school_id) === String(selectedSchool)
          : true
        : String(c.school_id) === String(schoolId);

      const matchesStatus = selectedStatus
        ? String(c.status).toLowerCase() === selectedStatus.toLowerCase()
        : true;

      return matchesSearch && matchesSchool && matchesStatus;
    });
  }, [classes, search, selectedSchool, isAdmin, schoolId, selectedStatus]);

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
    setEditingClass(null);
    setModalOpen(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingClass(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      if (editingClass) {
        await dispatch(
          editClass({
            id: editingClass.id,
            formData: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(addClass(payload)).unwrap();
      }

      closeModal();
      refreshClasses();
    } catch (err) {
      alert(err.message || "Failed to save class");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    const cls = classes.find((c) => String(c.id) === String(id));
    setDeleteTarget(cls ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    refreshClasses();
  };

  // Status toggle handler
  const handleToggleStatus = async (cls, nextStatus) => {
    if (!cls?.id) return;
    setStatusUpdatingId(cls.id);
    try {
      await dispatch(
        toggleClassStatus({ id: cls.id, status: nextStatus })
      ).unwrap();
      refreshClasses();
    } catch (err) {
      alert(err.message || "Failed to update class status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="cp-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="cp-title text-2xl font-bold">Class Management</h1>
          <p className="cp-subtitle text-[13.5px] mt-1">
            Create and manage the classes available in your school.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="cp-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Class
        </button>
      </div>

      {/* Toolbar with Search, Custom Dropdown filters (matching Department) */}
      <div className="cp-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={15}
            className="cp-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes…"
            className="cp-search-input w-full rounded-lg pl-9 pr-8 py-2 text-[13.5px] transition-all"
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

        {/* Status Filter (Custom Dropdown - exactly matching Department) */}
        <CustomDropdown
          options={statusOptions}
          value={selectedStatus}
          onChange={(val) => {
            setSelectedStatus(val);
          }}
          placeholder="All Statuses"
          className="min-w-[140px]"
        />

        {/* School Filter — Admin only (Custom Dropdown - exactly matching Department) */}
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
            className="cp-btn-outline inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors"
            title="Reset filters"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}

        <span className="cp-count-text text-[12.5px] ml-auto">
          {filteredClasses.length} class
          {filteredClasses.length === 1 ? "" : "es"}
        </span>
      </div>

      {/* Content */}
      {loading && classes.length === 0 ? (
        <p className="cp-loading px-2 py-10 text-[13.5px]">Loading classes…</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="cp-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={refreshClasses}
            className="cp-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <ClassTable
          classes={filteredClasses}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onToggleStatus={handleToggleStatus}
          deletingId={deleteTarget?.id ?? null}
          statusUpdatingId={statusUpdatingId}
          showSchoolColumn={isAdmin && !selectedSchool}
        />
      )}

      {/* Modals */}
      <ClassModal
        isOpen={modalOpen}
        onClose={closeModal}
        cls={editingClass}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteClassModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        cls={deleteTarget}
      />
    </div>
  );
};

export default ClassPage;
