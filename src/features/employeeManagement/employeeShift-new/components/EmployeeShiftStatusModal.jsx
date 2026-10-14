import React from "react";
import { AlertTriangle, CheckCircle2, Loader2, X, Clock, Timer, Moon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { formatTime } from "../utils/shiftTimeUtils.js";

export default function EmployeeShiftStatusModal({
  isOpen,
  onClose,
  shift,
  targetStatus,
  onConfirm,
  submitting,
}) {
  if (!isOpen || !shift) return null;

  const isDeactivating = targetStatus === "inactive";

  return (
    <AnimatePresence>
      <motion.div
        className="es-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="es-modal-panel relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-border/80"
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="es-modal-header flex items-center justify-between px-6 py-4 border-b border-border/60">
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
              <h2 className="es-modal-title text-[16px] font-bold">
                {isDeactivating ? "Deactivate Shift" : "Activate Shift"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="es-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-[14px] leading-relaxed text-foreground">
              Are you sure you want to change the status of{" "}
              <strong className="font-semibold text-foreground">
                {shift.name}
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

            {/* Shift Info Box */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[12.5px] space-y-2">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Clock size={15} className="text-primary shrink-0" />
                <span className="font-semibold">{shift.name}</span>
                {shift.school_name && (
                  <span className="text-muted-foreground text-[12px]">
                    • {shift.school_name}
                  </span>
                )}
                {shift.shift_type && (
                  <span className="es-type-badge ml-auto capitalize text-[10.5px]">
                    {shift.shift_type}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-muted-foreground text-[12px] flex-wrap">
                <span>
                  {formatTime(shift.start_time)} – {formatTime(shift.end_time)}
                </span>
                {shift.working_hours != null && (
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Timer size={12} /> {shift.working_hours} hrs
                  </span>
                )}
                {Boolean(shift.crosses_midnight) && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <Moon size={11} /> Crosses midnight
                  </span>
                )}
              </div>
            </div>

            {isDeactivating ? (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-[12.5px] leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <AlertTriangle size={15} /> Shift Inactivation Warning
                </p>
                <p>
                  Deactivating this shift will mark it inactive across the
                  school. It will no longer be available for assignment to
                  employees or active scheduling.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[12.5px]">
                Activating this shift will restore it as an active working
                schedule across the employee management system.
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="es-btn-cancel px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => onConfirm(shift.id, targetStatus)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] ${
                isDeactivating
                  ? "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400"
                  : "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
              }`}
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {isDeactivating
                ? "Confirm Deactivation"
                : "Confirm Activation"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
