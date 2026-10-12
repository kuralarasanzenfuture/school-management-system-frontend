import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, BookOpen } from "lucide-react";
import SubjectForm from "./SubjectForm.jsx";

export default function SubjectModal({
  isOpen,
  onClose,
  subject,
  onSubmit,
  submitting,
}) {
  const isEdit = Boolean(subject?.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="sj-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
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
            className="sj-modal-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="sj-modal-header flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--btn-bg)]/10 text-[var(--btn-bg)]">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 className="sj-modal-title text-[16px] font-bold tracking-tight">
                    {isEdit ? "Edit Subject" : "New Subject"}
                  </h2>
                  <p className="sj-cell-muted text-[12px]">
                    {isEdit
                      ? "Update subject details"
                      : "Add a subject to this school"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="sj-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 max-h-[calc(90vh-100px)] overflow-y-auto">
              <SubjectForm
                initialData={subject}
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
