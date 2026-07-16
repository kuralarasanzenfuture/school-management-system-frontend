import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import SectionTable from "../components/SectionTable";
import SectionModal from "../components/SectionModal";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchSections,
  addSection,
  editSection,
  removeSection,
} from "../../../../redux/schoolSetup/section/sectionSlice.js";
import { fetchClasses } from "../../../../redux/schoolSetup/class/classSlice.js";

import "../styles/Section.css";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

const SectionPage = () => {
  const dispatch = useDispatch();
  const { sections, loading, error } = useSelector((state) => state.sections);

  // console.log("Sections from Redux state:", sections);

  const { classes } = useSelector((state) => state.classes);
  const [search, setSearch] = useState("");
  const [schoolIds, setSchoolId] = useState(
    localStorage.getItem("school_id") || "",
  );
  const [classFilter, setClassFilter] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { user, loading: authLoading } = useSelector((state) => state.auth);

  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  useEffect(() => {
    dispatch(fetchSections({ schoolId: schoolId, classId: classFilter }));
    dispatch(fetchClasses());
  }, [dispatch, schoolId, classFilter]);

  // const filteredSections = useMemo(() => {
  //   const term = search.trim().toLowerCase();

  //   return sections.filter((s) => {
  //     const matchesSearch = term ? s.name?.toLowerCase().includes(term) : true;

  //     const sectionClassId =
  //       typeof s.class_id === "object" ? s.class_id?.id : s.class_id;
  //     const matchesClass = classFilter
  //       ? String(sectionClassId) === String(classFilter)
  //       : true;

  //     return matchesSearch && matchesClass;
  //   });
  // }, [sections, search, classFilter]);

  const filteredSections = useMemo(() => {
    const term = search.trim().toLowerCase();

    return sections.filter((s) => {
      const matchesSearch =
        !term ||
        s.name?.toLowerCase().includes(term) ||
        s.school_name?.toLowerCase().includes(term);

      const sectionClassId =
        typeof s.class_id === "object" ? s.class_id?.id : s.class_id;

      const matchesClass = classFilter
        ? String(sectionClassId) === String(classFilter)
        : true;

      const matchesSchool = isAdmin
        ? selectedSchool
          ? String(s.school_id) === String(selectedSchool)
          : true
        : String(s.school_id) === String(schoolId);

      return matchesSearch && matchesClass && matchesSchool;
    });
  }, [sections, search, classFilter, selectedSchool, isAdmin, schoolId]);

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
        dispatch(fetchSections());
      } else {
        await dispatch(addSection(payload)).unwrap();
        dispatch(fetchSections());
      }

      closeModal();
    } catch (err) {
      alert(err.message || "Failed to save section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this section?")) return;

    setDeletingId(id);

    try {
      await dispatch(removeSection(id)).unwrap();
    } catch (err) {
      alert(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
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
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="sp-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sections…"
            className="sp-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="sp-filter-select rounded-lg px-3 py-2 text-[13.5px] transition-all"
        >
          <option value="">All Classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>

        {/* School Filter */}
        {isAdmin && (
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="edp-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
            disabled={schoolsLoading}
          >
            <option value="">All Schools</option>

            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        )}

        <span className="sp-count-text text-[12.5px] ml-auto">
          {filteredSections.length} section
          {filteredSections.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <p className="sp-loading px-2 py-10 text-[13.5px]">Loading sections…</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="sp-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchSections())}
            className="sp-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <SectionTable
          sections={filteredSections}
          onEdit={openEditModal}
          onDelete={handleDelete}
          deletingId={deletingId}
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
    </div>
  );
};

export default SectionPage;
