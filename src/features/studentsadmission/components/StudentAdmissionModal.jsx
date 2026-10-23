import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, UserPlus, Pencil } from "lucide-react";
import StudentAdmissionForm from "./StudentAdmissionForm.jsx";
import "../styles/StudentAdmission.css";

export default function StudentAdmissionModal({
  isOpen,
  onClose,
  admission,
  onSubmit,
  submitting,
}) {
  const isEdit = Boolean(admission?.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="sa-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 32 }}
            transition={{ duration: 0.22 }}
            className="sa-modal-panel w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="sa-modal-header flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  {isEdit ? <Pencil size={18} /> : <UserPlus size={18} />}
                </div>
                <div>
                  <h2 className="sa-modal-title text-[16px] font-bold tracking-tight">
                    {isEdit ? "Edit Student Admission" : "Add Student Admission"}
                  </h2>
                  <p className="sa-cell-muted text-[12px] text-slate-500 dark:text-slate-400">
                    {isEdit
                      ? `Updating admission #${admission?.admission_number || admission?.id}`
                      : "Enroll a student into class, section, and academic year"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="sa-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <div className="px-6 py-5 max-h-[75vh] overflow-y-auto overflow-x-hidden">
              <StudentAdmissionForm
                initialData={admission}
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
