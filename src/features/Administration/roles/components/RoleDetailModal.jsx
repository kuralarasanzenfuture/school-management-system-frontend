import React from "react";
import { X, ShieldCheck, Users, Calendar, Hash, FileText, ToggleLeft, Edit3, ShieldAlert } from "lucide-react";
import { formatDate, isSystemRole } from "../utils/roleUtils.js";
import { AnimatePresence, motion } from "framer-motion";

export default function RoleDetailModal({
  isOpen,
  onClose,
  role,
  onEdit,
}) {
  if (!isOpen || !role) return null;

  const isSystem = isSystemRole(role);
  const usersCount = Number(role.active_users_count) || 0;

  return (
    <AnimatePresence>
      <motion.div
        className="rp-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="rp-modal-panel relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="rp-modal-header flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isSystem
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                }`}
              >
                {isSystem ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
              </div>
              <div>
                <h2 className="rp-modal-title text-[16px] font-bold">
                  Role Details
                </h2>
                <p className="text-[12px] rp-subtitle">
                  {isSystem ? "Core System Role Specification" : "Custom Role Specification"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="rp-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-5">
            {/* Main Header Card */}
            <div className="rp-detail-card p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[18px] font-bold rp-name">{role.name}</h3>
                  <span className="rp-code-pill px-2.5 py-0.5 rounded text-[12px] font-mono font-semibold">
                    {role.role_code || role.name}
                  </span>
                </div>
                <p className="text-[12px] rp-cell-muted mt-1 flex items-center gap-1">
                  <Hash size={12} /> Role ID: #{role.id}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rp-status ${
                    role.status === "active"
                      ? "rp-status-active"
                      : "rp-status-inactive"
                  }`}
                >
                  {role.status}
                </span>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11.5px] font-semibold inline-flex items-center gap-1 ${
                    isSystem
                      ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                      : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                  }`}
                >
                  {isSystem ? "System Role" : "Custom Role"}
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rp-detail-stat p-3.5 rounded-xl border">
                <div className="flex items-center gap-2 rp-count-text text-[12px] mb-1">
                  <Users size={14} /> Assigned Active Users
                </div>
                <div className="text-[20px] font-bold rp-title">
                  {usersCount}
                  <span className="text-[12px] font-normal text-muted-foreground ml-1.5">
                    {usersCount === 1 ? "user" : "users"}
                  </span>
                </div>
              </div>

              <div className="rp-detail-stat p-3.5 rounded-xl border">
                <div className="flex items-center gap-2 rp-count-text text-[12px] mb-1">
                  <Calendar size={14} /> Created On
                </div>
                <div className="text-[13px] font-semibold rp-title mt-1">
                  {formatDate(role.created_at)}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold rp-field-label flex items-center gap-1.5">
                <FileText size={14} /> Description
              </span>
              <div className="rp-detail-card p-3.5 rounded-xl border min-h-[70px] text-[13.5px] rp-desc leading-relaxed">
                {role.description ? (
                  role.description
                ) : (
                  <span className="italic text-muted-foreground">
                    No description provided for this role.
                  </span>
                )}
              </div>
            </div>

            {/* Governance Info */}
            {isSystem && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[12px] text-amber-700 dark:text-amber-300 leading-normal">
                <strong>System Notice:</strong> This role provides essential system authorization capabilities. Modifying its system code or deleting it is restricted by database constraints.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="rp-modal-footer flex items-center justify-end gap-3 px-6 py-4 border-t">
            <button
              onClick={onClose}
              className="rp-btn-cancel px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(role);
              }}
              className="rp-btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all shadow-sm"
            >
              <Edit3 size={14} /> Edit Role
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
