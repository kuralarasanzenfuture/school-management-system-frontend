import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Calendar } from "lucide-react";
import AcademicYearForm from "./AcademicYearForm.jsx";

/**
 * Modal shell for adding/editing an academic year with department-style animations.
 */
export default function AcademicYearModal({
  isOpen,
  onClose,
  academicYear,
  schoolId,
  isAdmin,
  onSubmit,
  submitting,
}) {
  const isEdit = Boolean(academicYear?.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="ay-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 32 }}
            transition={{ duration: 0.22 }}
            className="ay-modal-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="ay-modal-header flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--btn-bg)]/10 text-[var(--btn-bg)]">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="ay-modal-title text-[16px] font-bold tracking-tight">
                    {isEdit ? "Edit Academic Year" : "New Academic Year"}
                  </h2>
                  <p className="ay-cell-muted text-[12px]">
                    {isEdit
                      ? "Update academic year details"
                      : "Add a new academic year to your school"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="ay-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto">
              <AcademicYearForm
                initialData={academicYear}
                schoolId={schoolId}
                isAdmin={isAdmin}
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
