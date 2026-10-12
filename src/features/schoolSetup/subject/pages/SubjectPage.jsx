import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search, RotateCcw, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import SubjectTable from "../components/SubjectTable.jsx";
import SubjectModal from "../components/SubjectModal.jsx";
import DeleteSubjectModal from "../components/DeleteSubjectModal.jsx";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import {
  fetchSubjects,
  createSubjectThunk,
  updateSubjectThunk,
  deleteSubjectThunk,
  toggleSubjectStatus,
} from "../../../../redux/schoolSetup/subject/subjectSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import "../styles/Subject.css";

const SubjectPage = () => {
  const dispatch = useDispatch();
  const { subjects, loading, error } = useSelector((state) => state.subjects);
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
  const [selectedType, setSelectedType] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

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

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "theory", label: "Theory" },
    { value: "practical", label: "Practical" },
    { value: "both", label: "Both" },
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

    if (selectedType) {
      params.subject_type = selectedType;
    }

    return params;
  }, [search, isAdmin, selectedSchool, selectedStatus, selectedType]);

  // Fetch subjects from backend with debounced filter parameters
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = buildQueryParams();
      if (isAdmin) {
        dispatch(fetchSubjects(params));
      } else if (schoolId) {
        dispatch(fetchSubjects({ ...params, school_id: schoolId }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, buildQueryParams, isAdmin, schoolId]);

  const refetch = useCallback(() => {
    const params = buildQueryParams();
    if (isAdmin) {
      dispatch(fetchSubjects(params));
    } else if (schoolId) {
      dispatch(fetchSubjects({ ...params, school_id: schoolId }));
    }
  }, [dispatch, buildQueryParams, isAdmin, schoolId]);

  // Client fallback filter for instant responsiveness
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return subjects.filter((subj) => {
      const matchesSearch = term
        ? `${subj.name || ""} ${subj.code || ""} ${subj.school_name || ""}`
            .toLowerCase()
            .includes(term)
        : true;

      const matchesStatus = selectedStatus
        ? subj.status === selectedStatus
        : true;

      const matchesType = selectedType
        ? subj.subject_type === selectedType
        : true;

      const matchesSchool = isAdmin
        ? selectedSchool
          ? String(subj.school_id) === String(selectedSchool)
          : true
        : String(subj.school_id) === String(schoolId);

      return matchesSearch && matchesStatus && matchesType && matchesSchool;
    });
  }, [subjects, search, selectedStatus, selectedType, isAdmin, selectedSchool, schoolId]);

  const hasActiveFilters = Boolean(
    search.trim() || selectedSchool || selectedStatus || selectedType,
  );

  const resetFilters = () => {
    setSearch("");
    setSelectedSchool("");
    setSelectedStatus("");
    setSelectedType("");
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
          updateSubjectThunk({ id: editingItem.id, subjectData: payload }),
        ).unwrap();
      } else {
        await dispatch(createSubjectThunk(payload)).unwrap();
      }
      refetch();
      closeModal();
    } catch (err) {
      alert(err || "Failed to save subject");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    const subject = subjects.find((s) => String(s.id) === String(id));
    setDeleteTarget(subject ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    refetch();
  };

  // One-click quick status toggle
  const handleToggleStatus = async (subject, nextStatus) => {
    if (!subject?.id) return;
    setStatusUpdatingId(subject.id);
    try {
      await dispatch(
        toggleSubjectStatus({ id: subject.id, status: nextStatus }),
      ).unwrap();
    } catch (err) {
      alert(err || "Failed to update subject status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="sj-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="sj-title text-2xl font-bold">Subject Management</h1>
          <p className="sj-subtitle text-[13.5px] mt-1">
            Manage the subjects taught at your school.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="sj-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {/* Toolbar */}
      <div className="sj-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={15}
            className="sj-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects…"
            className="sj-search-input w-full rounded-lg pl-9 pr-8 py-2 text-[13.5px] transition-all"
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

        {/* Status Filter */}
        <CustomDropdown
          options={statusOptions}
          value={selectedStatus}
          onChange={(val) => setSelectedStatus(val)}
          placeholder="All Statuses"
          className="min-w-[140px]"
        />

        {/* Type Filter */}
        <CustomDropdown
          options={typeOptions}
          value={selectedType}
          onChange={(val) => setSelectedType(val)}
          placeholder="All Types"
          className="min-w-[130px]"
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
            className="sj-btn-outline inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors"
            title="Reset filters"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        )}

        <span className="sj-count-text text-[12.5px] ml-auto">
          {filtered.length} subject{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading && subjects.length === 0 ? (
        <p className="sj-loading px-2 py-10 text-[13.5px]">Loading subjects…</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="sj-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={refetch}
            className="sj-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <SubjectTable
          subjects={filtered}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onToggleStatus={handleToggleStatus}
          deletingId={deleteTarget?.id ?? null}
          statusUpdatingId={statusUpdatingId}
          showSchoolColumn={isAdmin && !selectedSchool}
        />
      )}

      {/* Add / Edit Modal with Framer Motion animations */}
      <SubjectModal
        isOpen={modalOpen}
        onClose={closeModal}
        subject={editingItem}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteSubjectModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        subject={deleteTarget}
      />
    </div>
  );
};

export default SubjectPage;
