import React from "react";
import { X } from "lucide-react";
import StudentAdmissionForm from "./StudentAdmissionForm.jsx";

export default function StudentAdmissionModal({
  isOpen,
  onClose,
  admission,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="sa-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="sa-modal-panel w-full max-w-lg rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sa-modal-header flex items-center justify-between px-6 py-4">
          <h2 className="sa-modal-title text-[16px] font-bold">
            {admission ? "Edit Student Admission" : "Add Student Admission"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="sa-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
          <StudentAdmissionForm
            initialData={admission}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
