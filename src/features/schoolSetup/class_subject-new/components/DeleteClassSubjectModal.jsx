import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteClassSubjectThunk } from "../../../../redux/schoolSetup/class_subjects/classSubjectSlice.js";
import "../styles/ClassSubject.css";

// NOTE: this assumes ClassSubjectModal.jsx / ClassSubject.css already
// defines the same modal-chrome classes used in every other module —
// cx-modal-overlay, cx-modal-panel, cx-modal-header, cx-modal-title,
// cx-modal-close, cx-form-footer, cx-btn-cancel. I haven't seen
// ClassSubjectModal.jsx's actual CSS, so if any of those names don't
// match, paste that file/CSS and I'll correct this exactly.
export default function DeleteClassSubjectModal({
  isOpen,
  onClose,
  classSubject,
}) {
  const dispatch = useDispatch();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!classSubject?.id) return;
    setDeleting(true);
    try {
      await dispatch(deleteClassSubjectThunk(classSubject.id)).unwrap();
      onClose();
    } catch (err) {
      alert(err?.message ?? String(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cx-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
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
            className="cx-modal-panel w-full max-w-sm rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="cx-modal-header flex items-center justify-between px-5 py-4">
              <h2 className="cx-modal-title text-[15px] font-bold">
                Delete Class Subject
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="cx-modal-close w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
              <div className="cx-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="cx-delete-icon" />
              </div>
              <p className="cx-delete-title text-[15px] font-semibold">
                Are you sure?
              </p>
              <p className="cx-delete-desc text-[13px] leading-relaxed">
                You are about to permanently delete the mapping of{" "}
                <span className="font-semibold">
                  {classSubject?.subject_name}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {classSubject?.class_name}
                  {classSubject?.section_name
                    ? ` - ${classSubject.section_name}`
                    : ""}
                </span>
                {classSubject?.teacher_name && (
                  <>
                    {" "}
                    (taught by{" "}
                    <span className="font-semibold">
                      {classSubject.teacher_name}
                    </span>
                    )
                  </>
                )}
                . This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="cx-form-footer flex items-center justify-center gap-3 px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="cx-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="cx-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}