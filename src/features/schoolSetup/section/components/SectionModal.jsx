import React from "react";
import { X } from "lucide-react";
import SectionForm from "./SectionForm.jsx";

/**
 * Modal shell for adding/editing a section. The actual fields live in
 * SectionForm — this component only owns the overlay/panel/header chrome.
 */
export default function SectionModal({
  isOpen,
  onClose,
  section,
  availableClasses,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="sp-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="sp-modal-panel w-full max-w-md rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sp-modal-header flex items-center justify-between px-6 py-4">
          <h2 className="sp-modal-title text-[16px] font-bold">
            {section ? "Edit Section" : "Add Section"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="sp-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <SectionForm
            initialData={section}
            availableClasses={availableClasses}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
