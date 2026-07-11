import React from "react";
import { X } from "lucide-react";
import EmployeeShiftForm from "./EmployeeShiftForm.jsx";

export default function EmployeeShiftModal({
    isOpen,
    onClose,
    shift,
    onSubmit,
    submitting,
}) {
    if (!isOpen) return null;

    return (
        <div
            className="es-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="es-modal-panel w-full max-w-md rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="es-modal-header flex items-center justify-between px-6 py-4">
                    <h2 className="es-modal-title text-[16px] font-bold">
                        {shift ? "Edit Shift" : "Add Shift"}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="es-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5">
                    <EmployeeShiftForm
                        initialData={shift}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        submitting={submitting}
                    />
                </div>
            </div>
        </div>
    );
}