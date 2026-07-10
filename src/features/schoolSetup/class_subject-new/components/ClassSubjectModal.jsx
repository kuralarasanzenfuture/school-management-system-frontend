import React from "react";
import { X } from "lucide-react";
import ClassSubjectForm from "./ClassSubjectForm.jsx";

export default function ClassSubjectModal({
  isOpen,
  onClose,
  classSubject,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="cx-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="cx-modal-panel w-full max-w-lg rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cx-modal-header flex items-center justify-between px-6 py-4">
          <h2 className="cx-modal-title text-[16px] font-bold">
            {classSubject ? "Edit Class Subject" : "Add Class Subject"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cx-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <ClassSubjectForm
            initialData={classSubject}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
