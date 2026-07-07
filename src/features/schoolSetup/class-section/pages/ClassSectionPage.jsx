import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ClassSectionTable from "../components/ClassSectionTable.jsx";
import ClassSectionModal from "../components/ClassSectionModal.jsx";
import StatusFilterDropdown from "../components/StatusFilterDropdown";
import {
  fetchClassSections,
  addClassSection,
  editClassSection,
  removeClassSection,
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

  const schools = useSelector((state) => state.schoolProfile?.schools || []);

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [statusFilter, setStatusFilter] = useState(["active", "inactive"]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchClassSections());
    if (isAdmin) dispatch(fetchSchools());
  }, [dispatch, isAdmin]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return classSections.filter((cs) => {
      const matchesSearch = term
        ? `${cs.class_name} ${cs.section_name}`.toLowerCase().includes(term)
        : true;

      const matchesSchool =
        isAdmin && selectedSchool
          ? String(cs.school_id) === String(selectedSchool)
          : true;

      const matchesStatus = statusFilter.includes(cs.status);

      return matchesSearch && matchesSchool && matchesStatus;
    });
  }, [classSections, search, selectedSchool, statusFilter, isAdmin]);

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
      dispatch(fetchClassSections());
      closeModal();
    } catch (err) {
      alert(err || "Failed to save class section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class section?")) return;
    setDeletingId(id);
    try {
      await dispatch(removeClassSection(id)).unwrap();
    } catch (err) {
      alert(err || "Delete failed");
    } finally {
      setDeletingId(null);
    }
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
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="cs-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class/section…"
            className="cs-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>

        {isAdmin && (
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="cs-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
          >
            <option value="">All Schools</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        <StatusFilterDropdown selected={statusFilter} onChange={setStatusFilter} />

        <span className="cs-count-text text-[12.5px] ml-auto">
          {filtered.length} section{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <p className="cs-loading px-2 py-10 text-[13.5px]">
          Loading class sections…
        </p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="cs-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchClassSections())}
            className="cs-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <ClassSectionTable
          classSections={filtered}
          onEdit={openEditModal}
          onDelete={handleDelete}
          deletingId={deletingId}
          showSchoolColumn={isAdmin}
        />
      )}

      <ClassSectionModal
        isOpen={modalOpen}
        onClose={closeModal}
        classSection={editingItem}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default ClassSectionPage;