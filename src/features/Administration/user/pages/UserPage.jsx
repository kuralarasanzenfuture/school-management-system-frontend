import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";
import UserTable from "../components/UserTable";
import UserModal from "../components/UserModal.jsx";
import UserChangePasswordModal from "../components/UserChangePasswordModal.jsx";
import UserStatusModal from "../components/UserStatusModal.jsx";
import CustomDropdown from "../components/CustomDropdown.jsx";
import { parseRolesToIds } from "../components/UserForm.jsx";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  addUser,
  editUser,
  removeUser,
  fetchUserById,
  toggleUserStatus,
} from "../../../../redux/Administration/users/userSlice.js";
import { fetchRoles } from "../../../../redux/Administration/roles/roleSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

import "../styles/User.css";

const UserPage = () => {
  const dispatch = useDispatch();
  const { users = [], loading, error } = useSelector((state) => state.users);
  const roles = useSelector((state) => state.roles?.roles || []);

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Status Change Confirmation Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTargetUser, setStatusTargetUser] = useState(null);
  const [targetStatus, setTargetStatus] = useState("active");

  // Change Password Modal state
  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const { user: authUser } = useSelector((state) => state.auth);

  // Check if current logged-in user is Super Admin
  const isAdmin = useMemo(() => {
    if (!authUser?.roles) return false;
    if (Array.isArray(authUser.roles)) {
      return authUser.roles.some((r) =>
        (typeof r === "object" ? r.name : String(r)).toUpperCase() === "ADMIN",
      );
    }
    return String(authUser.roles).toUpperCase().includes("ADMIN");
  }, [authUser]);

  const schoolId = isAdmin ? null : authUser?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  // Super Admin: fetch schools list for school selector
  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  // Load users and available roles on mount
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
  }, [dispatch]);

  // Comprehensive filter logic: search, school, role, and status
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (users || []).filter((u) => {
      // 1. Search term
      const matchesSearch =
        !term ||
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term) ||
        u.school_name?.toLowerCase().includes(term);

      // 2. School filter
      const matchesSchool = isAdmin
        ? selectedSchool
          ? String(u.school_id) === String(selectedSchool)
          : true
        : String(u.school_id) === String(schoolId);

      // 3. Role filter (dynamic reference to Roles module)
      let matchesRole = true;
      if (selectedRole) {
        const userRoleIds = parseRolesToIds(u.roles, roles);
        matchesRole = userRoleIds.includes(Number(selectedRole));
      }

      // 4. Status filter
      const matchesStatus = selectedStatus ? u.status === selectedStatus : true;

      return matchesSearch && matchesSchool && matchesRole && matchesStatus;
    });
  }, [users, search, selectedSchool, selectedRole, selectedStatus, isAdmin, schoolId, roles]);

  const openAddModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEditModal = async (targetUser) => {
    try {
      const result = await dispatch(fetchUserById(targetUser.id)).unwrap();
      const userData = result?.user || result?.data || result;
      setEditingUser(userData);
      setModalOpen(true);
    } catch (err) {
      // Fallback to local table user row if single user fetch fails
      setEditingUser(targetUser);
      setModalOpen(true);
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
      } else {
        await dispatch(addUser(payload)).unwrap();
      }
      closeModal();
      dispatch(fetchUsers());
    } catch (err) {
      alert(err || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setDeletingId(id);
    try {
      await dispatch(removeUser(id)).unwrap();
      dispatch(fetchUsers());
    } catch (err) {
      alert(err || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = (targetUser, nextStatus) => {
    setStatusTargetUser(targetUser);
    setTargetStatus(
      nextStatus || (targetUser.status === "active" ? "inactive" : "active"),
    );
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async (userId, next) => {
    setTogglingId(userId);
    try {
      await dispatch(
        toggleUserStatus({ id: userId, status: next }),
      ).unwrap();
      toast.success(`User status changed to ${next} successfully`);
      setStatusModalOpen(false);
      setStatusTargetUser(null);
      dispatch(fetchUsers());
    } catch (err) {
      const msg =
        typeof err === "string" ? err : err?.message || "Failed to update user status";
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenChangePassword = (targetUser) => {
    setPasswordUser(targetUser);
    setPasswordModalOpen(true);
  };

  const handleCloseChangePassword = () => {
    setPasswordModalOpen(false);
    setPasswordUser(null);
  };

  // Prepare dropdown options
  const roleOptions = useMemo(() => {
    return [
      { value: "", label: "All Roles" },
      ...roles.map((r) => ({ value: r.id, label: r.name })),
    ];
  }, [roles]);

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const schoolOptions = useMemo(() => {
    return [
      { value: "", label: "All Schools" },
      ...schools.map((s) => ({ value: s.id, label: s.name })),
    ];
  }, [schools]);

  return (
    <div className="up-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="up-title text-2xl font-bold">User Management</h1>
          <p className="up-subtitle text-[13.5px] mt-1">
            Create, assign roles, and manage users who can access the system.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="up-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Toolbar with Search, Custom Dropdown filters */}
      <div className="up-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
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

        {/* Role Filter (Custom Dropdown) */}
        <CustomDropdown
          options={roleOptions}
          value={selectedRole}
          onChange={setSelectedRole}
          placeholder="All Roles"
          searchable={roles.length > 5}
          searchPlaceholder="Search roles…"
          className="min-w-[160px]"
        />

        {/* Status Filter (Custom Dropdown) */}
        <CustomDropdown
          options={statusOptions}
          value={selectedStatus}
          onChange={setSelectedStatus}
          placeholder="All Statuses"
          className="min-w-[140px]"
        />

        {/* School Filter — Super Admin only (Custom Dropdown) */}
        {isAdmin && (
          <CustomDropdown
            options={schoolOptions}
            value={selectedSchool}
            onChange={setSelectedSchool}
            placeholder={schoolsLoading ? "Loading schools…" : "All Schools"}
            searchable={schools.length > 5}
            searchPlaceholder="Search schools…"
            disabled={schoolsLoading}
            className="min-w-[210px]"
          />
        )}

        <span className="up-count-text text-[12.5px] ml-auto">
          {filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <p className="up-loading px-2 py-10 text-[13.5px] text-center text-muted-foreground">
          Loading users…
        </p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="up-error text-[13.5px] mb-3 text-destructive">{error}</p>
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
          onToggleStatus={handleToggleStatus}
          onChangePassword={handleOpenChangePassword}
          deletingId={deletingId}
          togglingId={togglingId}
          isAdmin={isAdmin}
        />
      )}

      {/* Add / Edit User Modal */}
      <UserModal
        isOpen={modalOpen}
        onClose={closeModal}
        user={editingUser}
        availableRoles={roles}
        users={users}
        isAdmin={isAdmin}
        schoolId={schoolId}
        schools={schools}
        schoolsLoading={schoolsLoading}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Change Password Modal */}
      <UserChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={handleCloseChangePassword}
        targetUser={passwordUser}
      />

      {/* Status Change Confirmation Modal */}
      <UserStatusModal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusTargetUser(null);
        }}
        user={statusTargetUser}
        targetStatus={targetStatus}
        onConfirm={handleConfirmStatusChange}
        submitting={Boolean(togglingId)}
      />
    </div>
  );
};

export default UserPage;