import React from "react";
import { AlertTriangle, CheckCircle2, Loader2, X, FileText, Calendar } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import "../styles/LeaveType.css";

export default function LeaveTypeStatusModal({
  isOpen,
  onClose,
  leaveType,
  targetStatus,
  onConfirm,
  submitting,
}) {
  if (!isOpen || !leaveType) return null;

  const isDeactivating = targetStatus === "inactive";

  return (
    <AnimatePresence>
      <motion.div
        className="lt-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="lt-modal relative w-full max-w-md rounded-2xl overflow-hidden border border-[var(--divider)] shadow-2xl"
          style={{ background: "var(--panel-bg)" }}
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="lt-modal-header flex items-center justify-between px-6 py-4">
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
              <h2 className="lt-modal-title text-[16px] font-bold">
                {isDeactivating ? "Deactivate Leave Type" : "Activate Leave Type"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="lt-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
              Are you sure you want to change the status of{" "}
              <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {leaveType.name}
              </strong>{" "}
              to{" "}
              <strong
                className={`capitalize ${
                  isDeactivating ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {targetStatus}
              </strong>
              ?
            </p>

            {/* Leave Type Info Box */}
            <div className="lt-status-info-box p-3.5 rounded-xl text-[12.5px] space-y-2">
              <div className="flex items-center gap-2 font-medium" style={{ color: "var(--text-primary)" }}>
                <FileText size={15} style={{ color: "var(--btn-bg)" }} className="shrink-0" />
                <span className="font-semibold">{leaveType.name}</span>
                {leaveType.code && (
                  <span className="lt-code text-[11px]">
                    {leaveType.code}
                  </span>
                )}
                {leaveType.school_name && (
                  <span className="text-[12px] ml-auto" style={{ color: "var(--text-muted)" }}>
                    • {leaveType.school_name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[12px] flex-wrap" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1 font-medium" style={{ color: "var(--text-primary)" }}>
                  <Calendar size={12} /> {leaveType.days_per_year} days/year
                </span>
                <span>
                  {Boolean(Number(leaveType.is_paid)) ? "Paid leave" : "Unpaid leave"}
                </span>
                {Boolean(Number(leaveType.carry_forward)) && (
                  <span>• Carry forward enabled</span>
                )}
              </div>

              {leaveType.description && (
                <p className="text-[11.5px] line-clamp-2" style={{ color: "var(--text-muted)" }}>
                  {leaveType.description}
                </p>
              )}
            </div>

            {isDeactivating ? (
              <div className="lt-status-warning-deactivate p-3.5 rounded-xl text-[12.5px] leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <AlertTriangle size={15} /> Leave Type Inactivation Warning
                </p>
                <p className="opacity-90">
                  Deactivating this leave type will make it unavailable for new
                  employee leave requests across the school. Existing records and history will remain intact.
                </p>
              </div>
            ) : (
              <div className="lt-status-warning-activate p-3.5 rounded-xl text-[12.5px] leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={15} /> Leave Type Activation
                </p>
                <p className="opacity-90">
                  Activating this leave type will restore it as an active leave category
                  available for employee leave applications across the school.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="lt-modal-footer flex items-center justify-end gap-3 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="lt-modal-btn-cancel px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => onConfirm(leaveType.id, targetStatus)}
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
