import React from "react";
import { X } from "lucide-react";
import ClassSectionForm from "./ClassSectionForm.jsx";

export default function ClassSectionModal({
  isOpen,
  onClose,
  classSection,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="cs-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="cs-modal-panel w-full max-w-md rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cs-modal-header flex items-center justify-between px-6 py-4">
          <h2 className="cs-modal-title text-[16px] font-bold">
            {classSection ? "Edit Class Section" : "Add Class Section"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cs-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <ClassSectionForm
            initialData={classSection}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
