import React from "react";
import { AlertTriangle, CheckCircle2, Loader2, X, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import "../styles/SalaryComponent.css";

export default function SalaryComponentStatusModal({
  isOpen,
  onClose,
  component,
  targetStatus,
  onConfirm,
  submitting,
}) {
  if (!isOpen || !component) return null;

  const isDeactivating = targetStatus === "inactive";
  const isEarning = component.component_type === "earning";

  return (
    <AnimatePresence>
      <motion.div
        className="sc-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="sc-modal relative w-full max-w-md rounded-2xl overflow-hidden border border-[var(--divider)] shadow-2xl"
          style={{ background: "var(--panel-bg)" }}
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sc-modal-header flex items-center justify-between px-6 py-4">
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
              <h2 className="sc-modal-title text-[16px] font-bold">
                {isDeactivating ? "Deactivate Salary Component" : "Activate Salary Component"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="sc-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
              Are you sure you want to change the status of{" "}
              <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {component.name}
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

            {/* Component Info Box */}
            <div className="sc-status-info-box p-3.5 rounded-xl text-[12.5px] space-y-2">
              <div className="flex items-center gap-2 font-medium" style={{ color: "var(--text-primary)" }}>
                <DollarSign size={15} style={{ color: "var(--btn-bg)" }} className="shrink-0" />
                <span className="font-semibold">{component.name}</span>
                {component.code && (
                  <span className="sc-code text-[11px]">
                    {component.code}
                  </span>
                )}
                {component.school_name && (
                  <span className="text-[12px] ml-auto" style={{ color: "var(--text-muted)" }}>
                    • {component.school_name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[12px] flex-wrap" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1 font-medium capitalize" style={{ color: "var(--text-primary)" }}>
                  {isEarning ? (
                    <TrendingUp size={13} className="text-emerald-600" />
                  ) : (
                    <TrendingDown size={13} className="text-rose-600" />
                  )}
                  {component.component_type}
                </span>
                <span>•</span>
                <span>
                  {component.calculation_type === "percentage" ? "Percentage (%)" : "Fixed Amount (₹)"}
                </span>
              </div>

              {component.description && (
                <p className="text-[11.5px] line-clamp-2" style={{ color: "var(--text-muted)" }}>
                  {component.description}
                </p>
              )}
            </div>

            {isDeactivating ? (
              <div className="sc-status-warning-deactivate p-3.5 rounded-xl text-[12.5px] leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <AlertTriangle size={15} /> Component Inactivation Warning
                </p>
                <p className="opacity-90">
                  Deactivating this component will mark it inactive across the school.
                  It will no longer be selectable in new salary structures or active payroll calculations.
                </p>
              </div>
            ) : (
              <div className="sc-status-warning-activate p-3.5 rounded-xl text-[12.5px] leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={15} /> Component Activation
                </p>
                <p className="opacity-90">
                  Activating this component will restore it as an active payroll earning or deduction
                  across the employee management system.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sc-modal-footer flex items-center justify-end gap-3 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="sc-modal-btn-cancel px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => onConfirm(component.id, targetStatus)}
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
