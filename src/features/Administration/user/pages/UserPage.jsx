import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import UserTable from "../components/UserTable";
import UserModal from "../components/UserModal.jsx";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  addUser,
  editUser,
  removeUser,
  fetchUserById,
} from "../../../../redux/Administration/users/userSlice.js";
import { fetchRoles } from "../../../../redux/Administration/roles/roleSlice.js";

import "../styles/User.css";

const UserPage = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const { roles } = useSelector((state) => state.roles);
  //   console.log("UserPage roles:", roles);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term),
    );
  }, [users, search]);

  const openAddModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

    // const openEditModal = (user) => {
    //   setEditingUser(user);
    //   setModalOpen(true);
    // };

  const openEditModal = async (user) => {
    try {
      const result = await dispatch(fetchUserById(user.id)).unwrap();

      setEditingUser(result.user || result);
      setModalOpen(true);
    } catch (err) {
      alert(err.message || "Failed to load user details");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      if (editingUser) {
        await dispatch(
          editUser({
            id: editingUser.id,
            formData: payload,
          }),
        ).unwrap();
        dispatch(fetchUsers());
      } else {
        await dispatch(addUser(payload)).unwrap();
        dispatch(fetchUsers());
      }

      closeModal();
    } catch (err) {
      alert(err.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    setDeletingId(id);

    try {
      await dispatch(removeUser(id)).unwrap();
      dispatch(fetchUsers());
    } catch (err) {
      alert(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="up-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="up-title text-2xl font-bold">User Management</h1>
          <p className="up-subtitle text-[13.5px] mt-1">
            Create and manage the users who can access the system.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="up-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Toolbar */}
      <div className="up-toolbar flex items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="up-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="up-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>
        <span className="up-count-text text-[12.5px] ml-auto">
          {filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <p className="up-loading px-2 py-10 text-[13.5px]">Loading users…</p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="up-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchUsers())}
            className="up-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onEdit={openEditModal}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      <UserModal
        isOpen={modalOpen}
        onClose={closeModal}
        user={editingUser}
        availableRoles={roles}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default UserPage;
