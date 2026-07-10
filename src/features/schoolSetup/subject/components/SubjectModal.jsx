import React from "react";
import { X } from "lucide-react";
import SubjectForm from "./SubjectForm.jsx";

export default function SubjectModal({
  isOpen,
  onClose,
  subject,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="sj-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="sj-modal-panel w-full max-w-md rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sj-modal-header flex items-center justify-between px-6 py-4">
          <h2 className="sj-modal-title text-[16px] font-bold">
            {subject ? "Edit Subject" : "Add Subject"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="sj-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <SubjectForm
            initialData={subject}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
