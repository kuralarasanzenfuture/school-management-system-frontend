import React from "react";
import { X } from "lucide-react";
import SubjectGroupForm from "./SubjectGroupForm.jsx";

export default function SubjectGroupModal({
  isOpen,
  onClose,
  subjectGroup,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="sg-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="sg-modal-panel w-full max-w-md rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sg-modal-header flex items-center justify-between px-6 py-4">
          <h2 className="sg-modal-title text-[16px] font-bold">
            {subjectGroup ? "Edit Subject Group" : "Add Subject Group"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="sg-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <SubjectGroupForm
            initialData={subjectGroup}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
