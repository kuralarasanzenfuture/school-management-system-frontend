import React from "react";
import { X } from "lucide-react";
import EmployeeAssignForm from "./EmployeeAssignForm";


function employeeLabel(emp) {
    if (!emp) return "";
    if (emp.name) return emp.name;
    return `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || `#${emp.id}`;
}

export default function EmployeeAssignModal({
    isOpen,
    onClose,
    employee,
    users,
    employees,
    onSubmit,
    submitting,
}) {
    if (!isOpen || !employee) return null;

    return (
        <div
            className="ea-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="ea-modal-panel w-full max-w-md rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="ea-modal-header flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 className="ea-modal-title text-[16px] font-bold">Assign User</h2>
                        <p className="ea-modal-subtitle text-[12.5px] mt-0.5">
                            Linking a login to {employeeLabel(employee)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="ea-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5">
                    <EmployeeAssignForm
                        employee={employee}
                        users={users}
                        employees={employees}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        submitting={submitting}
                    />
                </div>
            </div>
        </div>
    );
}