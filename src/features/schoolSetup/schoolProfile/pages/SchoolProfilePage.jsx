import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search } from "lucide-react";
import SchoolTable from "../components/SchoolTable";
import SchoolModal from "../components/SchoolModal";
import {
  fetchSchools,
  addSchool,
  editSchool,
  removeSchool,
} from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import "../styles/School.css";

const SchoolProfilePage = () => {
  const dispatch = useDispatch();

  // NOTE: this reads from state.schoolProfile — adjust the key here if your
  // store registers this reducer under a different name in configureStore.
  const { schools, loading, error } = useSelector(
    (state) => state.schoolProfile,
  );

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchSchools());
  }, [dispatch]);

  const filteredSchools = useMemo(() => {
    const list = schools || [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) ||
        s.code?.toLowerCase().includes(term) ||
        s.city?.toLowerCase().includes(term),
    );
  }, [schools, search]);

  const openAddModal = () => {
    setEditingSchool(null);
    setModalOpen(true);
  };

  const openEditModal = (school) => {
    setEditingSchool(school);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSchool(null);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);

    try {
      if (editingSchool) {
        await dispatch(
          editSchool({
            id: editingSchool.id,
            formData,
          }),
        ).unwrap();
      } else {
        await dispatch(addSchool(formData)).unwrap();
      }

      await dispatch(fetchSchools()); // <-- reload list

      closeModal();
    } catch (err) {
      alert(err.message || "Failed to save school");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this school? This can't be undone.",
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await dispatch(removeSchool(id)).unwrap();
    } catch (err) {
      alert(err || "Failed to delete school");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="scp-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="scp-title text-2xl font-bold">School Profile</h1>
          <p className="scp-subtitle text-[13.5px] mt-1">
            Manage the schools registered in the system.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="scp-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add School
        </button>
      </div>

      {/* Toolbar */}
      <div className="scp-toolbar flex items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="scp-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schools…"
            className="scp-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>
        <span className="scp-count-text text-[12.5px] ml-auto">
          {filteredSchools.length} school
          {filteredSchools.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading && (!schools || schools.length === 0) ? (
        <p className="scp-loading px-2 py-10 text-[13.5px]">Loading schools…</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="scp-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchSchools())}
            className="scp-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <SchoolTable
          schools={filteredSchools}
          onEdit={openEditModal}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      <SchoolModal
        isOpen={modalOpen}
        onClose={closeModal}
        school={editingSchool}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default SchoolProfilePage;
