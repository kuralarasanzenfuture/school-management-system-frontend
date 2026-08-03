import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeEmployee } from "../../../redux/employee/employeeSlice.js";
import "../styles/Employee.css";

export default function DeleteEmployeeModal({ isOpen, onClose, employee }) {
    const dispatch = useDispatch();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!employee?.id) return;
        setDeleting(true);
        try {
            await dispatch(removeEmployee(employee.id)).unwrap();
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
                    className="ep-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
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
                        className="ep-modal-panel w-full max-w-sm rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="ep-modal-header flex items-center justify-between px-5 py-4">
                            <h2 className="ep-modal-title text-[15px] font-bold">
                                Delete Employee
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="ep-modal-close w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                            <div className="ep-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                                <Trash2 size={24} className="ep-delete-icon" />
                            </div>
                            <p className="ep-delete-title text-[15px] font-semibold">
                                Are you sure?
                            </p>
                            <p className="ep-delete-desc text-[13px] leading-relaxed">
                                You are about to permanently delete{" "}
                                <span className="font-semibold">
                                    {employee?.first_name} {employee?.last_name}
                                </span>
                                {employee?.employee_code && (
                                    <>
                                        {" "}
                                        (
                                        <span className="font-semibold">
                                            {employee.employee_code}
                                        </span>
                                        )
                                    </>
                                )}
                                . Any salary structures, attendance, or payroll records
                                linked to this employee may be affected. This action cannot
                                be undone.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="ep-form-footer flex items-center justify-center gap-3 px-5 py-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="ep-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="ep-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]"
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