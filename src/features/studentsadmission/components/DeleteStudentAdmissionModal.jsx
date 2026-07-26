import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteStudentAdmissionThunk } from "../../../redux/studentsAdmission/studentAdmissionSlice.js";
import "../styles/StudentAdmission.css";

// NOTE: this assumes StudentAdmissionModal.jsx / StudentAdmission.css
// already defines the same modal-chrome classes used in every other
// module — sa-modal-overlay, sa-modal-panel, sa-modal-header,
// sa-modal-title, sa-modal-close, sa-form-footer, sa-btn-cancel. I
// haven't seen StudentAdmissionModal.jsx's actual CSS, so if any of
// those names don't match, paste that file/CSS and I'll correct this
// exactly.
export default function DeleteStudentAdmissionModal({
    isOpen,
    onClose,
    admission,
    studentName,
}) {
    const dispatch = useDispatch();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!admission?.id) return;
        setDeleting(true);
        try {
            await dispatch(deleteStudentAdmissionThunk(admission.id)).unwrap();
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
                    className="sa-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
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
                        className="sa-modal-panel w-full max-w-sm rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sa-modal-header flex items-center justify-between px-5 py-4">
                            <h2 className="sa-modal-title text-[15px] font-bold">
                                Delete Admission
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="sa-modal-close w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                            <div className="sa-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                                <Trash2 size={24} className="sa-delete-icon" />
                            </div>
                            <p className="sa-delete-title text-[15px] font-semibold">
                                Are you sure?
                            </p>
                            <p className="sa-delete-desc text-[13px] leading-relaxed">
                                You are about to permanently delete the admission record for{" "}
                                <span className="font-semibold">
                                    {studentName || `Student #${admission?.student_id}`}
                                </span>
                                {admission?.admission_number && (
                                    <>
                                        {" "}
                                        (admission no.{" "}
                                        <span className="font-semibold">
                                            {admission.admission_number}
                                        </span>
                                        )
                                    </>
                                )}
                                {admission?.class_name && (
                                    <>
                                        {" "}
                                        in{" "}
                                        <span className="font-semibold">
                                            {admission.class_name}
                                        </span>
                                    </>
                                )}
                                . This action cannot be undone.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="sa-form-footer flex items-center justify-center gap-3 px-5 py-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="sa-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="sa-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]"
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