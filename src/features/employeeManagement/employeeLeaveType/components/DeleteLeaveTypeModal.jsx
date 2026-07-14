import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeEmployeeLeaveType } from "../../../../redux/employeeLeaveType/employeeLeaveTypeSlice.js";
import "../styles/LeaveType.css";

export default function DeleteLeaveTypeModal({ isOpen, onClose, leaveType }) {
    const dispatch = useDispatch();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!leaveType?.id) return;
        setDeleting(true);
        try {
            await dispatch(removeEmployeeLeaveType(leaveType.id)).unwrap();
            onClose();
        } catch (deletionError) {
            alert(deletionError?.message ?? String(deletionError));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="lt-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 32 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 32 }}
                        transition={{ duration: 0.22 }}
                        className="lt-modal w-full max-w-sm rounded-2xl overflow-hidden"
                    >
                        <div className="lt-modal-header flex items-center justify-between px-5 py-4">
                            <h2 className="lt-modal-title text-[15px] font-bold">Delete Leave Type</h2>
                            <button type="button" onClick={onClose}
                                className="lt-close-btn w-7 h-7 rounded-full flex items-center justify-center transition-colors">
                                <X size={15} />
                            </button>
                        </div>

                        <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                            <div className="lt-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                                <Trash2 size={24} className="lt-delete-icon" />
                            </div>
                            <p className="lt-delete-title text-[15px] font-semibold">Are you sure?</p>
                            <p className="lt-delete-desc text-[13px] leading-relaxed">
                                You are about to permanently delete{" "}
                                <span className="font-semibold">{leaveType?.name}</span>{" "}
                                <span className="lt-code px-1.5 py-0.5 rounded text-[11px]">{leaveType?.code}</span>.
                                This action cannot be undone.
                            </p>
                        </div>

                        <div className="lt-modal-footer flex items-center justify-center gap-3 px-5 py-4">
                            <button type="button" onClick={onClose}
                                className="lt-modal-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">
                                Cancel
                            </button>
                            <button type="button" disabled={deleting} onClick={handleDelete}
                                className="lt-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]">
                                {deleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}