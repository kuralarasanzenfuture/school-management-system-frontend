import React from "react";
import { AlertTriangle, CheckCircle2, Loader2, X, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function UserStatusModal({
  isOpen,
  onClose,
  user,
  targetStatus,
  onConfirm,
  submitting,
}) {
  if (!isOpen || !user) return null;

  const isDeactivating = targetStatus === "inactive";

  return (
    <AnimatePresence>
      <motion.div
        className="up-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="up-modal-panel relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-border/80"
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="up-modal-header flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDeactivating
                    ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
                }`}
              >
                {isDeactivating ? (
                  <AlertTriangle size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
              </div>
              <h2 className="up-modal-title text-[16px] font-bold">
                {isDeactivating ? "Deactivate User" : "Activate User"}
              </h2>
            </div>

            <button
              onClick={onClose}
              disabled={submitting}
              className="up-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-[14px] leading-relaxed text-foreground">
              Are you sure you want to change the status of{" "}
              <strong className="font-semibold text-foreground">
                @{user.username}
              </strong>{" "}
              to{" "}
              <strong
                className={`capitalize ${
                  isDeactivating ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {targetStatus}
              </strong>
              ?
            </p>

            {/* User Details Pill */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[12.5px] space-y-1">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <User size={14} className="text-muted-foreground" />
                <span>{user.username}</span>
                {user.email && (
                  <span className="text-muted-foreground text-[12px]">
                    ({user.email})
                  </span>
                )}
              </div>
            </div>

            {isDeactivating ? (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-[12.5px] leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <AlertTriangle size={15} /> Access Revocation Warning
                </p>
                <p>
                  Deactivating this user account will immediately prevent them from logging in and invalidate active authentication sessions.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[12.5px]">
                Activating this user account will restore their login access and platform permissions.
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="up-btn-cancel px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => onConfirm(user.id, targetStatus)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] ${
                isDeactivating
                  ? "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400"
                  : "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
              }`}
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {isDeactivating ? "Confirm Deactivation" : "Confirm Activation"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
