import React from "react";
import { X } from "lucide-react";
import EmployeeDesignationForm from "./EmployeeDesignationForm";


export default function EmployeeDesignationModal({
  isOpen,
  onClose,
  designation,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="edp-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="edp-modal-panel w-full max-w-md rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edp-modal-header flex items-center justify-between px-6 py-4">
          <h2 className="edp-modal-title text-[16px] font-bold">
            {designation ? "Edit Designation" : "Add Designation"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="edp-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <EmployeeDesignationForm
            initialData={designation}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
