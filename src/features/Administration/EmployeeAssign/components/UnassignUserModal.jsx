import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Unlink, X, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { unassignEmployeeUser } from "../../../../redux/employee/employeeSlice.js";

function employeeLabel(emp) {
  if (!emp) return "";
  if (emp.name) return emp.name;
  return `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || emp.employee_code || `#${emp.id}`;
}

function getAssignedUsername(emp) {
  if (!emp) return "";
  if (emp.user && typeof emp.user === "object") {
    return emp.user.username || emp.user.email || `#${emp.user.id}`;
  }
  return emp.user_id ? `#${emp.user_id}` : "";
}

/**
 * Confirm dialog for unlinking a user login account from an employee.
 */
export default function UnassignUserModal({
  isOpen,
  onClose,
  employee,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const [unassigning, setUnassigning] = useState(false);
  const [error, setError] = useState("");

  const handleUnassign = async () => {
    const empId = employee?.id ?? employee?.employee_id;
    if (!empId) return;
    setUnassigning(true);
    setError("");
    try {
      await dispatch(unassignEmployeeUser(Number(empId))).unwrap();
      if (onSuccess) {
        onSuccess(employee);
      }
      onClose();
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to unassign user";
      setError(msg);
    } finally {
      setUnassigning(false);
    }
  };

  const handleClose = () => {
    if (unassigning) return;
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && employee && (
        <motion.div
          className="ea-modal-overlay fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.2 }}
            className="ea-modal-panel w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-border/80"
          >
            {/* Header */}
            <div className="ea-modal-header flex items-center justify-between px-5 py-4 border-b border-border/60">
              <h2 className="ea-unassign-title text-[15px] font-bold">
                Unassign User Account
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={unassigning}
                className="ea-modal-close w-7 h-7 rounded-full flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
              <div className="ea-unassign-icon-wrap w-14 h-14 rounded-full flex items-center justify-center bg-destructive/10 text-destructive">
                <Unlink size={24} className="ea-unassign-icon" />
              </div>
              <p className="ea-unassign-title text-[15px] font-semibold">
                Unlink this user account?
              </p>
              <p className="ea-unassign-desc text-[13px] leading-relaxed text-muted-foreground">
                This will unlink{" "}
                <span className="font-semibold text-foreground">
                  {getAssignedUsername(employee)}
                </span>{" "}
                from{" "}
                <span className="font-semibold text-foreground">
                  {employeeLabel(employee)}
                </span>
                . The user will no longer be linked to this employee profile.
              </p>

              {error && (
                <div className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-[12.5px] text-left">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="ea-form-footer flex items-center justify-center gap-3 px-5 py-4 border-t border-border/60 bg-muted/20">
              <button
                type="button"
                onClick={handleClose}
                disabled={unassigning}
                className="ea-btn-cancel flex-1 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors border border-border/60 hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={unassigning}
                onClick={handleUnassign}
                className="ea-modal-btn-danger flex-1 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all active:scale-[0.98] shadow-sm disabled:opacity-60"
              >
                {unassigning ? "Unassigning…" : "Unassign"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}