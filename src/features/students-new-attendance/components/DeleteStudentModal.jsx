import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteStudent } from "../../../redux/student/studentSlice";
import "../styles/AddStudentModal.css";

export default function DeleteStudentModal({ isOpen, onClose, student }) {
    const dispatch = useDispatch();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!student?.id) return;
        setDeleting(true);
        try {
            await dispatch(deleteStudent(student.id)).unwrap();
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
                    className="sm-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
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
                        className="sm-panel w-full max-w-sm rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sm-header flex items-center justify-between px-5 py-4">
                            <h2 className="sm-title text-[15px] font-bold">
                                Delete Student
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="sm-close-btn w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                            <div className="sm-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                                <Trash2 size={24} className="sm-delete-icon" />
                            </div>
                            <p className="sm-delete-title text-[15px] font-semibold">
                                Are you sure?
                            </p>
                            <p className="sm-delete-desc text-[13px] leading-relaxed">
                                You are about to permanently delete{" "}
                                <span className="font-semibold">
                                    {student?.first_name} {student?.last_name}
                                </span>
                                {student?.email && (
                                    <>
                                        {" "}
                                        (<span className="font-semibold">{student.email}</span>)
                                    </>
                                )}
                                . All admission, attendance, and academic records linked to
                                this student may be affected. This action cannot be undone.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="sm-footer flex items-center justify-center gap-3 px-5 py-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="sm-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="sm-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]"
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