import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeSchool } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import "../styles/School.css";

export default function DeleteSchoolModal({ isOpen, onClose, school }) {
    const dispatch = useDispatch();
    const [deleting, setDeleting] = useState(false);
    // console.log(school);
    // console.table(school);

    const handleDelete = async () => {
        // console.log("Deleting school id:", school?.id);
        // console.log(typeof school);
        if (!school?.id) return;
        setDeleting(true);
        try {
            await dispatch(removeSchool(school.id)).unwrap();
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
                    className="scp-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
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
                        className="scp-modal-panel w-full max-w-sm rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="scp-modal-header flex items-center justify-between px-5 py-4">
                            <h2 className="scp-modal-title text-[15px] font-bold">
                                Delete School
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
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
                        </div>

                        {/* Footer */}
                        <div className="scp-form-footer flex items-center justify-center gap-3 px-5 py-4">
                            <button
                                type="button"
                                onClick={onClose}
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
        </AnimatePresence>
    );
}