import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeSchool } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import "../styles/School.css";

export default function DeleteSchoolModal({ isOpen, onClose, school }) {
    const dispatch = useDispatch();
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            document.body.style.overflow = "hidden";
        } else {
            setError(null);
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const handleDelete = async () => {
        if (!school?.id) return;
        setError(null);
        setDeleting(true);
        try {
            await dispatch(removeSchool(school.id)).unwrap();
            handleClose();
        } catch (err) {
            const raw = typeof err === "string" ? err : err?.message || String(err);
            if (raw.includes("foreign key constraint fails") || raw.includes("a foreign key constraint fails")) {
                setError(
                    "Cannot delete this school because it is currently linked to existing records (such as employee attendance, students, staff, or classes). Please remove or reassign associated records first."
                );
            } else {
                setError(raw);
            }
        } finally {
            setDeleting(false);
        }
    };

    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="scp-modal-overlay fixed inset-0 z-[1200] flex items-center justify-center backdrop-blur-md p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 32 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 32 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="scp-modal-panel w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="scp-modal-header flex items-center justify-between px-5 py-4">
                            <h2 className="scp-modal-title text-[15px] font-bold">
                                Delete School
                            </h2>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="scp-modal-close w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                            <div className="scp-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                                <Trash2 size={24} className="scp-delete-icon" />
                            </div>
                            <p className="scp-delete-title text-[15px] font-semibold">
                                Are you sure?
                            </p>
                            <p className="scp-delete-desc text-[13px] leading-relaxed">
                                You are about to permanently delete{" "}
                                <span className="font-semibold">"{school?.name}"</span>
                                {school?.code && (
                                    <>
                                        {" "}
                                        (<span className="font-semibold">{school.code}</span>)
                                    </>
                                )}
                                . This action cannot be undone.
                            </p>

                            {/* In-modal error message */}
                            {error && (
                                <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-left mt-2">
                                    <AlertCircle size={17} className="text-red-600 shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold text-red-700">
                                            Cannot Delete School
                                        </p>
                                        <p className="text-[11.5px] text-red-600 mt-0.5 leading-relaxed">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="scp-form-footer flex items-center justify-center gap-3 px-5 py-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="scp-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="scp-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]"
                            >
                                {deleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}