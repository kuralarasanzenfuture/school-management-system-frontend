import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import RoleTable from "../components/RoleTable";
import RoleModal from "../components/Rolemodal";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchRoles,
  addRole,
  editRole,
  removeRole,
} from "../../../../redux/Administration/roles/roleSlice.js";

import "../styles/RolePage.css";

const RolePage = () => {
  const dispatch = useDispatch();
  const { roles, loading, error } = useSelector((state) => state.roles);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const filteredRoles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter(
      (r) =>
        r.name?.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term),
    );
  }, [roles, search]);

  const openAddModal = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRole(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      if (editingRole) {
        await dispatch(
          editRole({
            id: editingRole.id,
            formData: payload,
          }),
        ).unwrap();
        dispatch(fetchRoles());
        
      } else {
        await dispatch(addRole(payload)).unwrap();
        dispatch(fetchRoles());
      }

      closeModal();
    } catch (err) {
      alert(err.message || "Failed to save role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this role?")) return;

    setDeletingId(id);

    try {
      await dispatch(removeRole(id)).unwrap();
    } catch (err) {
      alert(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rp-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="rp-title text-2xl font-bold">Role Management</h1>
          <p className="rp-subtitle text-[13.5px] mt-1">
            Create and manage the roles available across the system.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="rp-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Role
        </button>
      </div>

      {/* Toolbar */}
      <div className="rp-toolbar flex items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="rp-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles…"
            className="rp-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>
        <span className="rp-count-text text-[12.5px] ml-auto">
          {filteredRoles.length} role{filteredRoles.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <p className="rp-loading px-2 py-10 text-[13.5px]">Loading roles…</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="rp-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchRoles())}
            className="rp-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <RoleTable
          roles={filteredRoles}
          onEdit={openEditModal}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      <RoleModal
        isOpen={modalOpen}
        onClose={closeModal}
        role={editingRole}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default RolePage;
