import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Upload } from "lucide-react";
import BulkAssignSubjectsForm from "./BulkAssignSubjectsForm.jsx";

export default function BulkAssignSubjectsModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}) {
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
            className="cx-modal-panel w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="cx-modal-header flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--btn-bg)]/10 text-[var(--btn-bg)]">
                  <Upload size={18} />
                </div>
                <div>
                  <h2 className="cx-modal-title text-[16px] font-bold tracking-tight">
                    Bulk Assign Subjects
                  </h2>
                  <p className="cx-cell-muted text-[12px]">
                    Assign multiple subjects to class sections at once
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

            {/* Scrollable Body */}
            <div className="px-6 py-5 overflow-y-auto">
              <BulkAssignSubjectsForm
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
