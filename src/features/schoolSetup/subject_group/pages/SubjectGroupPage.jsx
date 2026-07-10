import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import SubjectGroupTable from "../components/SubjectGroupTable.jsx";
import SubjectGroupModal from "../components/SubjectGroupModal.jsx";
import StatusFilterDropdown from "../components/StatusFilterDropdown.jsx";
import {
  fetchSubjectGroups,
  createSubjectGroupThunk,
  updateSubjectGroupThunk,
  deleteSubjectGroupThunk,
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

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [statusFilter, setStatusFilter] = useState(["active", "inactive"]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // fetchSubjectGroups takes schoolId directly — pass the admin's
  // selected filter school (or undefined for "all") and the non-admin's
  // own school. Re-fetches whenever the admin changes the school filter.
  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchSchools());
      dispatch(fetchSubjectGroups(selectedSchool || undefined));
    } else if (schoolId) {
      dispatch(fetchSubjectGroups(schoolId));
    }
  }, [dispatch, isAdmin, schoolId, selectedSchool]);

  //   const filtered = useMemo(() => {
  //     const term = search.trim().toLowerCase();

  //     return subjectGroups.filter((sg) => {
  //       const matchesSearch = term
  //         ? `${sg.name} ${sg.description || ""}`.toLowerCase().includes(term)
  //         : true;

  //       const matchesStatus = statusFilter.includes(sg.status);

  //       return matchesSearch && matchesStatus;
  //     });
  //   }, [subjectGroups, search, statusFilter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return subjectGroups.filter((sg) => {
      const matchesSearch = term
        ? `${sg.name} ${sg.description || ""}`.toLowerCase().includes(term)
        : true;

      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(sg.status);

      const matchesSchool = isAdmin
        ? !selectedSchool || String(sg.school_id) === String(selectedSchool)
        : String(sg.school_id) === String(schoolId);

      return matchesSearch && matchesStatus && matchesSchool;
    });
  }, [subjectGroups, search, statusFilter, isAdmin, selectedSchool, schoolId]);

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

  const refetch = () => {
    if (isAdmin) dispatch(fetchSubjectGroups(selectedSchool || undefined));
    else dispatch(fetchSubjectGroups(schoolId));
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject group?")) return;
    setDeletingId(id);
    try {
      await dispatch(deleteSubjectGroupThunk(id)).unwrap();
    } catch (err) {
      alert(err || "Delete failed");
    } finally {
      setDeletingId(null);
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
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="sg-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject groups…"
            className="sg-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>

        {isAdmin && (
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="sg-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
          >
            <option value="">All Schools</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        <StatusFilterDropdown
          selected={statusFilter}
          onChange={setStatusFilter}
        />

        <span className="sg-count-text text-[12.5px] ml-auto">
          {filtered.length} group{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
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
          onDelete={handleDelete}
          deletingId={deletingId}
          showSchoolColumn={isAdmin && !selectedSchool}
        />
      )}

      <SubjectGroupModal
        isOpen={modalOpen}
        onClose={closeModal}
        subjectGroup={editingItem}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default SubjectGroupPage;
