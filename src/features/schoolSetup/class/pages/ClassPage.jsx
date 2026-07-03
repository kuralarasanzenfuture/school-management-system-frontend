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

const ClassPage = () => {
  const dispatch = useDispatch();
  const { classes, loading, error } = useSelector((state) => state.classes);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  const filteredClasses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return classes;
    return classes.filter((c) => c.name?.toLowerCase().includes(term));
  }, [classes, search]);

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
        <span className="cp-count-text text-[12.5px] ml-auto">
          {filteredClasses.length} class
          {filteredClasses.length === 1 ? "" : "es"}
        </span>
      </div>

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
