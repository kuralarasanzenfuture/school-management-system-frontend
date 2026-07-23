import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Unlink, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { fetchEmployees, unassignEmployeeUser } from "../../../../redux/employee/employeeSlice.js";

function employeeLabel(emp) {
    if (!emp) return "";
    if (emp.name) return emp.name;
    return `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || `#${emp.id}`;
}

function getAssignedUsername(emp) {
    if (!emp) return "";
    if (emp.user && typeof emp.user === "object") {
        return emp.user.username || emp.user.email || `#${emp.user.id}`;
    }
    return emp.user_id ? `#${emp.user_id}` : "";
}

/**
 * Confirm dialog for unlinking a user account from an employee. Same
 * structure/chrome as DeleteSubjectGroupModal — icon, title, description,
 * cancel/confirm footer — just pointed at unassignEmployeeUser instead of
 * a delete thunk.
 */
export default function UnassignUserModal({ isOpen, onClose, employee }) {
    const dispatch = useDispatch();
    const [unassigning, setUnassigning] = useState(false);

    const handleUnassign = async () => {
        if (!employee?.id) return;
        setUnassigning(true);
        try {
            await dispatch(unassignEmployeeUser(employee.id)).unwrap();
            await dispatch(fetchEmployees());
            onClose();
        } catch (err) {
            alert(err?.message ?? String(err));
        } finally {
            setUnassigning(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="ea-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
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
                        className="ea-modal-panel w-full max-w-sm rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="ea-modal-header flex items-center justify-between px-5 py-4">
                            <h2 className="ea-unassign-title text-[15px] font-bold">
                                Unassign User
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="ea-modal-close w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                            <div className="ea-unassign-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                                <Unlink size={24} className="ea-unassign-icon" />
                            </div>
                            <p className="ea-unassign-title text-[15px] font-semibold">
                                Are you sure?
                            </p>
                            <p className="ea-unassign-desc text-[13px] leading-relaxed">
                                This will unlink{" "}
                                <span className="font-semibold">{getAssignedUsername(employee)}</span>{" "}
                                from <span className="font-semibold">{employeeLabel(employee)}</span>.
                                They won't be able to sign in through this employee record until
                                a user is assigned again.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="ea-form-footer flex items-center justify-center gap-3 px-5 py-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="ea-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={unassigning}
                                onClick={handleUnassign}
                                className="ea-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]"
                            >
                                {unassigning ? "Unassigning…" : "Unassign"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}