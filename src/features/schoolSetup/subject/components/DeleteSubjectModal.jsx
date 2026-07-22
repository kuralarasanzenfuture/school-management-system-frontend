import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteSubjectThunk } from "../../../../redux/schoolSetup/subject/subjectSlice.js";
import "../styles/Subject.css";

// NOTE: this assumes SubjectModal.jsx / Subject.css already defines the
// same modal-chrome classes used in every other module — sj-modal-overlay,
// sj-modal-panel, sj-modal-header, sj-modal-title, sj-modal-close,
// sj-form-footer, sj-btn-cancel. I haven't seen SubjectModal.jsx's actual
// CSS, so if any of those names don't match, paste that file/CSS and I'll
// correct this exactly (same issue that happened with the School modal).
export default function DeleteSubjectModal({ isOpen, onClose, subject }) {
    const dispatch = useDispatch();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!subject?.id) return;
        setDeleting(true);
        try {
            await dispatch(deleteSubjectThunk(subject.id)).unwrap();
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
                    className="sj-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
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
                        className="sj-modal-panel w-full max-w-sm rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sj-modal-header flex items-center justify-between px-5 py-4">
                            <h2 className="sj-modal-title text-[15px] font-bold">
                                Delete Subject
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="sj-modal-close w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                            <div className="sj-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                                <Trash2 size={24} className="sj-delete-icon" />
                            </div>
                            <p className="sj-delete-title text-[15px] font-semibold">
                                Are you sure?
                            </p>
                            <p className="sj-delete-desc text-[13px] leading-relaxed">
                                You are about to permanently delete{" "}
                                <span className="font-semibold">"{subject?.name}"</span>
                                {subject?.code && (
                                    <>
                                        {" "}
                                        (<span className="font-semibold">{subject.code}</span>)
                                    </>
                                )}
                                . Any classes or timetables referencing this subject may be
                                affected. This action cannot be undone.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="sj-form-footer flex items-center justify-center gap-3 px-5 py-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="sj-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="sj-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]"
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