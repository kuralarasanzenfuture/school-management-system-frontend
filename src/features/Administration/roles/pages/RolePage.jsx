import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus,
  Search,
  RotateCw,
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import RoleTable from "../components/RoleTable.jsx";
import RoleModal from "../components/Rolemodal.jsx";
import RoleDetailModal from "../components/RoleDetailModal.jsx";
import RoleStatusModal from "../components/RoleStatusModal.jsx";
import RoleFilterToolbar from "../components/RoleFilterToolbar.jsx";
import Pagination from "../../../../common/components/Pagination/Pagination.jsx";

import {
  fetchRoles,
  addRole,
  editRole,
  removeRole,
  toggleRoleStatus,
} from "../../../../redux/Administration/roles/roleSlice.js";
import { isSystemRole } from "../utils/roleUtils.js";

import "../styles/RolePage.css";

const RolePage = () => {
  const dispatch = useDispatch();
  const { roles, loading, error, pagination } = useSelector(
    (state) => state.roles,
  );

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'system' | 'custom'
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingRole, setViewingRole] = useState(null);

  // Status Change Confirmation Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTargetRole, setStatusTargetRole] = useState(null);
  const [targetStatus, setTargetStatus] = useState("active");
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Deleting State
  const [deletingId, setDeletingId] = useState(null);

  // Load roles from backend
  const loadRoles = useCallback(() => {
    const params = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    if (typeFilter === "system") {
      params.is_system = "1";
    } else if (typeFilter === "custom") {
      params.is_system = "0";
    }

    dispatch(fetchRoles(params));
  }, [dispatch, page, limit, sortBy, sortOrder, searchTerm, statusFilter, typeFilter]);

  // Debounced fetch on filter/search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadRoles();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadRoles]);

  // Reset page to 1 when filters or search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
    setPage(1);
  };

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(columnKey);
      setSortOrder("ASC");
    }
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSortBy("id");
    setSortOrder("ASC");
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    sortBy !== "id" ||
    sortOrder !== "ASC";

  // KPI Metrics Calculation (derived from current roles in state)
  const stats = useMemo(() => {
    const total = pagination?.total || roles.length;
    let active = 0;
    let inactive = 0;
    let system = 0;
    let totalAssignedUsers = 0;

    roles.forEach((r) => {
      if (r.status === "active") active++;
      if (r.status === "inactive") inactive++;
      if (isSystemRole(r)) system++;
      totalAssignedUsers += Number(r.active_users_count) || 0;
    });

    return {
      total,
      active,
      inactive,
      system,
      totalAssignedUsers,
    };
  }, [roles, pagination]);

  // Modal Handlers
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

  const openDetailModal = (role) => {
    setViewingRole(role);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setViewingRole(null);
  };

  // Add / Edit Submission
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
        toast.success(`Role '${payload.name}' updated successfully!`);
      } else {
        await dispatch(addRole(payload)).unwrap();
        toast.success(`Role '${payload.name}' created successfully!`);
      }

      closeModal();
      loadRoles();
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to save role";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Status Toggle Request
  const handleStatusToggleRequest = (role, nextStatus) => {
    if (isSystemRole(role) && nextStatus === "inactive") {
      toast.error("ADMIN and system roles cannot be deactivated");
      return;
    }

    setStatusTargetRole(role);
    setTargetStatus(nextStatus);
    setStatusModalOpen(true);
  };

  // Status Toggle Confirmation
  const handleConfirmStatusChange = async (roleId, nextStatus) => {
    setStatusUpdatingId(roleId);

    try {
      const res = await dispatch(
        toggleRoleStatus({ id: roleId, status: nextStatus }),
      ).unwrap();

      const message =
        res.data?.message ||
        `Role status changed to ${nextStatus} successfully`;
      toast.success(message);
      setStatusModalOpen(false);
      setStatusTargetRole(null);
      loadRoles();
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to update role status";
      toast.error(msg);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Delete Action
  const handleDelete = async (role) => {
    if (isSystemRole(role)) {
      toast.error("System roles cannot be deleted to protect platform integrity.");
      return;
    }

    const assignedCount = Number(role.active_users_count) || 0;
    if (assignedCount > 0) {
      alert(
        `Cannot delete role '${role.name}'. It is currently assigned to ${assignedCount} active user(s).\n\nPlease reassign or deactivate the users before deleting this role.`,
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete role '${role.name}'?`)) {
      return;
    }

    setDeletingId(role.id);

    try {
      await dispatch(removeRole(role.id)).unwrap();
      toast.success(`Role '${role.name}' deleted successfully.`);
      loadRoles();
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.message || "Delete failed";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // Total items for Pagination component
  const totalItems = pagination?.total || roles.length;

  return (
    <div className="rp-page min-h-screen p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#151929]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shadow-xs">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="rp-title text-2xl font-bold tracking-tight">
                Role Management
              </h1>
              <p className="rp-subtitle text-[13.5px] mt-0.5">
                Manage system and custom roles, permissions scopes, and user assignments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={loadRoles}
            disabled={loading}
            className="rp-btn-outline inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all shadow-sm active:scale-[0.98]"
            title="Refresh list"
          >
            <RotateCw size={15} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={openAddModal}
            className="rp-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
          >
            <Plus size={16} /> Add Role
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        {/* Total Roles */}
        <div className="rp-stat-card p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center shrink-0">
            <Shield size={22} />
          </div>
          <div>
            <p className="text-[12px] font-medium rp-count-text">Total Roles</p>
            <h3 className="text-xl font-bold rp-title">{stats.total}</h3>
          </div>
        </div>

        {/* Active Roles */}
        <div className="rp-stat-card p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[12px] font-medium rp-count-text">Active Roles</p>
            <h3 className="text-xl font-bold rp-title">{stats.active}</h3>
          </div>
        </div>

        {/* System Protected Roles */}
        <div className="rp-stat-card p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-[12px] font-medium rp-count-text">System Roles</p>
            <h3 className="text-xl font-bold rp-title">{stats.system}</h3>
          </div>
        </div>

        {/* Assigned Users */}
        <div className="rp-stat-card p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[12px] font-medium rp-count-text">Assigned Users</p>
            <h3 className="text-xl font-bold rp-title">{stats.totalAssignedUsers}</h3>
          </div>
        </div>
      </div>

      {/* Tailwind UI-Style Filter Toolbar */}
      <RoleFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={(term) => {
          setSearchTerm(term);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={handleStatusFilterChange}
        typeFilter={typeFilter}
        onTypeChange={handleTypeFilterChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(col, dir) => {
          setSortBy(col);
          setSortOrder(dir);
          setPage(1);
        }}
        onClearFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Table / Content */}
      {loading && roles.length === 0 ? (
        <div className="rp-table-card rounded-2xl p-12 text-center border">
          <RotateCw size={24} className="animate-spin text-primary mx-auto mb-3" />
          <p className="rp-loading text-[13.5px]">Loading system roles…</p>
        </div>
      ) : error ? (
        <div className="rp-table-card rounded-2xl p-12 text-center border">
          <ShieldAlert size={32} className="text-rose-500 mx-auto mb-2" />
          <p className="rp-error text-[14px] font-medium mb-3">{error}</p>
          <button
            onClick={loadRoles}
            className="rp-btn-outline px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <div className="rp-table-card rounded-2xl overflow-hidden border shadow-sm">
          <RoleTable
            roles={roles}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onViewDetails={openDetailModal}
            onStatusToggle={handleStatusToggleRequest}
            deletingId={deletingId}
            statusUpdatingId={statusUpdatingId}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          <Pagination
            currentPage={page}
            totalItems={totalItems}
            pageSize={limit}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => {
              setLimit(newSize);
              setPage(1);
            }}
            showPageSizeSelector={true}
            showFirstLast={true}
          />
        </div>
      )}

      {/* Add / Edit Role Modal */}
      <RoleModal
        isOpen={modalOpen}
        onClose={closeModal}
        role={editingRole}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* View Role Details Modal */}
      <RoleDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        role={viewingRole}
        onEdit={(role) => {
          closeDetailModal();
          openEditModal(role);
        }}
      />

      {/* Status Change Confirmation Modal */}
      <RoleStatusModal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusTargetRole(null);
        }}
        role={statusTargetRole}
        targetStatus={targetStatus}
        onConfirm={handleConfirmStatusChange}
        submitting={Boolean(statusUpdatingId)}
      />
    </div>
  );
};

export default RolePage;
