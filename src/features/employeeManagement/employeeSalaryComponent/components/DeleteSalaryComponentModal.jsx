import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeEmployeeSalaryComponent } from "../../../../redux/employee_salary_component/employeeSalaryComponentSlice.js";
import "../styles/SalaryComponent.css";

export default function DeleteSalaryComponentModal({ isOpen, onClose, component }) {
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
        if (!component?.id) return;
        setDeleting(true);
        setError(null);
        try {
            await dispatch(removeEmployeeSalaryComponent(component.id)).unwrap();
            onClose();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                (typeof err === "string" ? err : "Failed to delete salary component");
            setError(msg);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="sc-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 32 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 32 }}
                        transition={{ duration: 0.22 }}
                        className="sc-modal w-full max-w-sm rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sc-modal-header flex items-center justify-between px-5 py-4">
                            <h2 className="sc-modal-title text-[15px] font-bold">Delete Salary Component</h2>
                            <button type="button" onClick={onClose}
                                className="sc-close-btn w-7 h-7 rounded-full flex items-center justify-center transition-colors">
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                            <div className="sc-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                                <Trash2 size={24} className="sc-delete-icon" />
                            </div>
                            <p className="sc-delete-title text-[15px] font-semibold">Are you sure?</p>
                            <p className="sc-delete-desc text-[13px] leading-relaxed">
                                You are about to permanently delete{" "}
                                <span className="font-semibold">{component?.name}</span>{" "}
                                <span className="sc-code px-1.5 py-0.5 rounded text-[11px]">
                                    {component?.code}
                                </span>
                                . This action cannot be undone.
                            </p>

                            {error && (
                                <div className="w-full mt-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-[12.5px] font-medium flex items-start gap-2.5 text-left leading-normal animate-in fade-in-50 duration-200">
                                    <AlertCircle size={17} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                    <div className="flex-1">{error}</div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sc-modal-footer flex items-center justify-center gap-3 px-5 py-4">
                            <button type="button" onClick={onClose}
                                className="sc-modal-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">
                                Cancel
                            </button>
                            <button type="button" disabled={deleting} onClick={handleDelete}
                                className="sc-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]">
                                {deleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}