import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search, RotateCcw, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import SubjectGroupTable from "../components/SubjectGroupTable.jsx";
import SubjectGroupModal from "../components/SubjectGroupModal.jsx";
import DeleteSubjectGroupModal from "../components/DeleteSubjectGroupModal.jsx";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import {
  fetchSubjectGroups,
  createSubjectGroupThunk,
  updateSubjectGroupThunk,
  deleteSubjectGroupThunk,
  toggleSubjectGroupStatus,
} from "../../../../redux/schoolSetup/subject_group/subjectGroupSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import "../styles/SubjectGroup.css";

const SubjectGroupPage = () => {
  const dispatch = useDispatch();
  const { subjectGroups, loading, error } = useSelector(
    (state) => state.subjectGroups,
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

  // Fetch subject groups from backend with debounced filter parameters
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = buildQueryParams();
      if (isAdmin) {
        dispatch(fetchSubjectGroups(params));
      } else if (schoolId) {
        dispatch(fetchSubjectGroups({ ...params, school_id: schoolId }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, buildQueryParams, isAdmin, schoolId]);

  const refetch = useCallback(() => {
    const params = buildQueryParams();
    if (isAdmin) {
      dispatch(fetchSubjectGroups(params));
    } else if (schoolId) {
      dispatch(fetchSubjectGroups({ ...params, school_id: schoolId }));
    }
  }, [dispatch, buildQueryParams, isAdmin, schoolId]);

  // Client fallback filter for instant UI responsiveness
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return subjectGroups.filter((sg) => {
      const matchesSearch = term
        ? `${sg.name || ""} ${sg.description || ""} ${sg.school_name || ""}`
            .toLowerCase()
            .includes(term)
        : true;

      const matchesStatus = selectedStatus
        ? sg.status === selectedStatus
        : true;

      const matchesSchool = isAdmin
        ? selectedSchool
          ? String(sg.school_id) === String(selectedSchool)
          : true
        : String(sg.school_id) === String(schoolId);

      return matchesSearch && matchesStatus && matchesSchool;
    });
  }, [subjectGroups, search, selectedStatus, isAdmin, selectedSchool, schoolId]);

  const hasActiveFilters = Boolean(
    search.trim() || selectedSchool || selectedStatus,
  );

  const resetFilters = () => {
    setSearch("");
    setSelectedSchool("");
    setSelectedStatus("");
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
          updateSubjectGroupThunk({
            id: editingItem.id,
            subjectGroupData: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(createSubjectGroupThunk(payload)).unwrap();
      }
      refetch();
      closeModal();
    } catch (err) {
      alert(err || "Failed to save subject group");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    const group = subjectGroups.find((sg) => String(sg.id) === String(id));
    setDeleteTarget(group ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    refetch();
  };

  // One-click quick status toggle
  const handleToggleStatus = async (group, nextStatus) => {
    if (!group?.id) return;
    setStatusUpdatingId(group.id);
    try {
      await dispatch(
        toggleSubjectGroupStatus({ id: group.id, status: nextStatus }),
      ).unwrap();
    } catch (err) {
      alert(err || "Failed to update subject group status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="sg-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="sg-title text-2xl font-bold">
            Subject Group Management
          </h1>
          <p className="sg-subtitle text-[13.5px] mt-1">
            Manage subject groups/electives for higher secondary classes.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="sg-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Subject Group
        </button>
      </div>

      {/* Toolbar */}
      <div className="sg-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={15}
            className="sg-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject groups…"
            className="sg-search-input w-full rounded-lg pl-9 pr-8 py-2 text-[13.5px] transition-all"
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
            className="sg-btn-outline inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors"
            title="Reset filters"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        )}

        <span className="sg-count-text text-[12.5px] ml-auto">
          {filtered.length} group{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading && subjectGroups.length === 0 ? (
        <p className="sg-loading px-2 py-10 text-[13.5px]">
          Loading subject groups…
        </p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="sg-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={refetch}
            className="sg-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <SubjectGroupTable
          subjectGroups={filtered}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onToggleStatus={handleToggleStatus}
          deletingId={deleteTarget?.id ?? null}
          statusUpdatingId={statusUpdatingId}
          showSchoolColumn={isAdmin && !selectedSchool}
        />
      )}

      {/* Add / Edit Modal with Framer Motion animations */}
      <SubjectGroupModal
        isOpen={modalOpen}
        onClose={closeModal}
        subjectGroup={editingItem}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteSubjectGroupModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        subjectGroup={deleteTarget}
      />
    </div>
  );
};

export default SubjectGroupPage;
