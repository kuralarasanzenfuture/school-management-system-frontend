import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search, Upload, RotateCcw, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ClassSubjectTable from "../components/ClassSubjectTable.jsx";
import ClassSubjectModal from "../components/ClassSubjectModal.jsx";
import DeleteClassSubjectModal from "../components/DeleteClassSubjectModal.jsx";
import BulkAssignSubjectsModal from "../components/BulkAssignSubjectsModal.jsx";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import {
  fetchClassSubjects,
  createClassSubjectThunk,
  updateClassSubjectThunk,
  addBulkAssignSubjects,
} from "../../../../redux/schoolSetup/class_subjects/classSubjectSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import "../styles/ClassSubject.css";

const ClassSubjectPage = () => {
  const dispatch = useDispatch();
  const { classSubjects, loading, error } = useSelector(
    (state) => state.classSubjects,
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
  const [selectedOptional, setSelectedOptional] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Load schools for admin
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

  const optionalOptions = [
    { value: "", label: "All Subject Types" },
    { value: "false", label: "Core (Compulsory)" },
    { value: "true", label: "Optional" },
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

    if (selectedOptional !== "") {
      params.is_optional = selectedOptional === "true";
    }

    return params;
  }, [search, isAdmin, selectedSchool, selectedOptional]);

  // Fetch class subjects from backend with debounced filter parameters
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = buildQueryParams();
      if (isAdmin) {
        dispatch(fetchClassSubjects(params));
      } else if (schoolId) {
        dispatch(fetchClassSubjects({ ...params, school_id: schoolId }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, buildQueryParams, isAdmin, schoolId]);

  const refetch = useCallback(() => {
    const params = buildQueryParams();
    if (isAdmin) {
      dispatch(fetchClassSubjects(params));
    } else if (schoolId) {
      dispatch(fetchClassSubjects({ ...params, school_id: schoolId }));
    }
  }, [dispatch, buildQueryParams, isAdmin, schoolId]);

  // Client fallback filter for instant responsiveness
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return classSubjects.filter((cx) => {
      const matchesSearch = term
        ? `${cx.class_name || ""} ${cx.section_name || ""} ${cx.subject_name || ""} ${cx.subject_code || ""} ${cx.teacher_name || ""} ${cx.school_name || ""}`
            .toLowerCase()
            .includes(term)
        : true;

      const matchesSchool = isAdmin
        ? selectedSchool
          ? String(cx.school_id) === String(selectedSchool)
          : true
        : String(cx.school_id) === String(schoolId);

      const matchesOptional =
        selectedOptional === ""
          ? true
          : selectedOptional === "true"
            ? Boolean(cx.is_optional)
            : !cx.is_optional;

      return matchesSearch && matchesSchool && matchesOptional;
    });
  }, [classSubjects, search, selectedSchool, selectedOptional, isAdmin, schoolId]);

  const hasActiveFilters = Boolean(
    search.trim() || selectedSchool || selectedOptional !== "",
  );

  const resetFilters = () => {
    setSearch("");
    setSelectedSchool("");
    setSelectedOptional("");
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
          updateClassSubjectThunk({
            id: editingItem.id,
            classSubjectData: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(createClassSubjectThunk(payload)).unwrap();
      }
      refetch();
      closeModal();
    } catch (err) {
      alert(err || "Failed to save class subject");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    const item = classSubjects.find((cx) => String(cx.id) === String(id));
    setDeleteTarget(item ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    refetch();
  };

  const handleBulkSubmit = async (payload) => {
    setBulkSubmitting(true);
    try {
      await dispatch(addBulkAssignSubjects(payload)).unwrap();
      refetch();
      setBulkModalOpen(false);
    } catch (err) {
      alert(err || "Failed to bulk assign subjects");
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="cx-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="cx-title text-2xl font-bold">
            Class Subject Management
          </h1>
          <p className="cx-subtitle text-[13.5px] mt-1">
            Map subjects (and teachers) to a class section for its academic year.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="cx-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors shadow-sm"
          >
            <Upload size={16} /> Bulk Assign
          </button>
          <button
            onClick={openAddModal}
            className="cx-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
          >
            <Plus size={16} /> Add Mapping
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="cx-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={15}
            className="cx-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class, subject, teacher…"
            className="cx-search-input w-full rounded-lg pl-9 pr-8 py-2 text-[13.5px] transition-all"
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

        {/* Optional Filter */}
        <CustomDropdown
          options={optionalOptions}
          value={selectedOptional}
          onChange={(val) => setSelectedOptional(val)}
          placeholder="All Types"
          className="min-w-[150px]"
        />

        {/* School Filter (Admin only) */}
        {isAdmin && (
          <CustomDropdown
            options={schoolOptions}
            value={selectedSchool}
            onChange={(val) => setSelectedSchool(val)}
            placeholder={schoolsLoading ? "Loading schools…" : "All Schools"}
            searchable={schoolOptions.length > 5}
            searchPlaceholder="Search schools…"
            className="min-w-[200px]"
          />
        )}

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="cx-btn-outline inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors"
            title="Reset filters"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        )}

        <span className="cx-count-text text-[12.5px] ml-auto">
          {filtered.length} mapping{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading && classSubjects.length === 0 ? (
        <p className="cx-loading px-2 py-10 text-[13.5px]">
          Loading class subjects…
        </p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="cx-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={refetch}
            className="cx-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <ClassSubjectTable
          classSubjects={filtered}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          deletingId={deleteTarget?.id ?? null}
          showSchoolColumn={isAdmin && !selectedSchool}
        />
      )}

      {/* Add / Edit Modal */}
      <ClassSubjectModal
        isOpen={modalOpen}
        onClose={closeModal}
        classSubject={editingItem}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteClassSubjectModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        classSubject={deleteTarget}
      />

      {/* Bulk Assign Modal */}
      <BulkAssignSubjectsModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSubmit={handleBulkSubmit}
        submitting={bulkSubmitting}
      />
    </div>
  );
};

export default ClassSubjectPage;
