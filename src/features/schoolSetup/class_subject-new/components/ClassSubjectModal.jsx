import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, BookMarked } from "lucide-react";
import ClassSubjectForm from "./ClassSubjectForm.jsx";

export default function ClassSubjectModal({
  isOpen,
  onClose,
  classSubject,
  onSubmit,
  submitting,
}) {
  const isEdit = Boolean(classSubject?.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cx-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
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
            className="cx-modal-panel w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="cx-modal-header flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--btn-bg)]/10 text-[var(--btn-bg)]">
                  <BookMarked size={18} />
                </div>
                <div>
                  <h2 className="cx-modal-title text-[16px] font-bold tracking-tight">
                    {isEdit ? "Edit Class Subject" : "Assign Subject to Class"}
                  </h2>
                  <p className="cx-cell-muted text-[12px]">
                    {isEdit
                      ? "Update subject assignment details"
                      : "Map a subject and teacher to a class section"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="cx-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <ClassSubjectForm
                initialData={classSubject}
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
