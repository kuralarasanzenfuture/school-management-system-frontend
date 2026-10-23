import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeEmployeeSalaryStructure } from "../../../../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
import "../styles/SalaryStructure.css";

export default function DeleteSalaryStructureModal({ isOpen, onClose, structure }) {
    const dispatch = useDispatch();
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            setDeleting(false);
        }
    }, [isOpen]);

    const handleDelete = async () => {
        if (!structure?.id) return;
        setDeleting(true);
        setError(null);
        try {
            await dispatch(removeEmployeeSalaryStructure(structure.id)).unwrap();
            onClose();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                (typeof err === "string" ? err : "Cannot delete active salary structure");
            setError(msg);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="ss-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 32 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 32 }}
                        transition={{ duration: 0.22 }}
                        className="ss-modal w-full max-w-sm rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="ss-modal-header flex items-center justify-between px-5 py-4">
                            <h2 className="ss-modal-title text-[15px] font-bold">Delete Salary Structure</h2>
                            <button type="button" onClick={onClose}
                                className="ss-close-btn w-7 h-7 rounded-full flex items-center justify-center transition-colors">
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                            <div className="ss-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                                <Trash2 size={24} className="ss-delete-icon" />
                            </div>
                            <p className="ss-delete-title text-[15px] font-semibold">Are you sure?</p>
                            <p className="ss-delete-desc text-[13px] leading-relaxed">
                                You are about to permanently delete the salary structure{" "}
                                <span className="font-semibold">"{structure?.structure_name}"</span>{" "}
                                for{" "}
                                <span className="font-semibold">
                                    {structure?.first_name} {structure?.last_name}
                                </span>
                                . This action cannot be undone.
                            </p>

                            {/* In-modal error alert */}
                            {error && (
                                <div className="w-full mt-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-[12.5px] font-medium flex items-start gap-2.5 text-left leading-normal animate-in fade-in-50 duration-200">
                                    <AlertCircle size={17} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                    <div className="flex-1">{error}</div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="ss-modal-footer flex items-center justify-center gap-3 px-5 py-4">
                            <button type="button" onClick={onClose}
                                className="ss-modal-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">
                                Cancel
                            </button>
                            <button type="button" disabled={deleting} onClick={handleDelete}
                                className="ss-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]">
                                {deleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}