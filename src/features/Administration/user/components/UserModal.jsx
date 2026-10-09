import React from "react";
import { X } from "lucide-react";
import UserForm from "./UserForm.jsx";

/**
 * Modal shell for adding/editing a user.
 */
export default function UserModal({
  isOpen,
  onClose,
  user = null,
  availableRoles = [],
  users = [],
  isAdmin = false,
  schoolId = null,
  schools = [],
  schoolsLoading = false,
  onSubmit,
  submitting = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="up-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="up-modal-panel w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto bg-card border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="up-modal-header flex items-center justify-between px-6 py-4 border-b border-border/60">
          <h2 className="up-modal-title text-[16px] font-bold">
            {user ? "Edit User" : "Add User"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="up-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <UserForm
            initialData={user}
            availableRoles={availableRoles}
            users={users}
            isAdmin={isAdmin}
            schoolId={schoolId}
            schools={schools}
            schoolsLoading={schoolsLoading}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
