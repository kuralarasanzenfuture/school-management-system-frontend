import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import ClassTable from "../components/ClassTable.jsx";
import ClassModal from "../components/ClassModel.jsx";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchClasses,
  addClass,
  editClass,
  removeClass,
} from "../../../../redux/schoolSetup/class/classSlice.js";

import "../styles/Class.css";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import StatusFilterDropdown from "../components/StatusFilterDropdown";
import "../styles/StatusFilterDropdown.css";

const ClassPage = () => {
  const dispatch = useDispatch();
  const { classes, loading, error } = useSelector((state) => state.classes);

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  // Replace your current single-value statusFilter with an array —
  // default to both checked, matching "everything visible" out of the box.
  const [statusFilter, setStatusFilter] = useState(["active", "inactive"]);

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
    dispatch(fetchClasses());
  }, [dispatch]);

  // const filteredClasses = useMemo(() => {
  //   const term = search.trim().toLowerCase();
  //   if (!term) return classes;
  //   return classes.filter((c) => c.name?.toLowerCase().includes(term));
  // }, [classes, search]);

  const filteredClasses = useMemo(() => {
    const term = search.trim().toLowerCase();

    return classes.filter((c) => {
      const matchesSearch =
        !term ||
        c.name?.toLowerCase().includes(term) ||
        c.school_name?.toLowerCase().includes(term);

      const matchesSchool = isAdmin
        ? selectedSchool
          ? Number(c.school_id) === Number(selectedSchool)
          : true
        : Number(c.school_id) === Number(schoolId);

      return matchesSearch && matchesSchool;
    });
  }, [classes, search, selectedSchool, isAdmin, schoolId]);

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
        dispatch(fetchClasses());
      } else {
        await dispatch(addClass(payload)).unwrap();
        dispatch(fetchClasses());
      }

      closeModal();
    } catch (err) {
      alert(err.message || "Failed to save class");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class?")) return;

    setDeletingId(id);

    try {
      await dispatch(removeClass(id)).unwrap();
    } catch (err) {
      alert(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
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

      {/* Toolbar */}
      <div className="cp-toolbar flex items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="cp-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes…"
            className="cp-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>

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

        <span className="cp-count-text text-[12.5px] ml-auto">
          {filteredClasses.length} class
          {filteredClasses.length === 1 ? "" : "es"}
        </span>
      </div>

      {/* Toolbar */}
      {/* <div className="cp-toolbar flex items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="cp-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes…"
            className="cp-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>

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

        <StatusFilterDropdown
          selected={statusFilter}
          onChange={setStatusFilter}
        />

        <span className="cp-count-text text-[12.5px] ml-auto">
          {filteredClasses.length} class
          {filteredClasses.length === 1 ? "" : "es"}
        </span>
      </div> */}

      {/* Content */}
      {loading ? (
        <p className="cp-loading px-2 py-10 text-[13.5px]">Loading classes…</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="cp-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchClasses())}
            className="cp-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <ClassTable
          classes={filteredClasses}
          onEdit={openEditModal}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      <ClassModal
        isOpen={modalOpen}
        onClose={closeModal}
        cls={editingClass}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default ClassPage;
