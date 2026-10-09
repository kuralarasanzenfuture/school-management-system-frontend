import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, UserPlus } from "lucide-react";
import EmployeeAssignForm from "./EmployeeAssignForm";

function employeeLabel(emp) {
  if (!emp) return "";
  if (emp.name) return emp.name;
  return `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || emp.employee_code || `#${emp.id}`;
}

export default function EmployeeAssignModal({
  isOpen,
  onClose,
  employee,
  users = [],
  employees = [],
  onSubmit,
  submitting = false,
}) {
  return (
    <AnimatePresence>
      {isOpen && employee && (
        <motion.div
          className="ea-modal-overlay fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="ea-modal-panel relative w-full max-w-md rounded-2xl overflow-visible shadow-2xl border border-border/80"
          >
            {/* Modal Header */}
            <div className="ea-modal-header flex items-center justify-between px-6 py-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 className="ea-modal-title text-[16px] font-bold leading-tight">
                    Assign User Account
                  </h2>
                  <p className="ea-modal-subtitle text-[12px] mt-0.5 text-muted-foreground truncate max-w-[260px]">
                    Link login credentials to {employeeLabel(employee)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="ea-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="relative px-6 py-5 overflow-visible">
              <EmployeeAssignForm
                employee={employee}
                users={users}
                employees={employees}
                onSubmit={onSubmit}
                onCancel={onClose}
                submitting={submitting}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}