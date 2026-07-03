import React from "react";
import { X } from "lucide-react";
import ClassForm from "./ClassForm.jsx";

/**
 * Modal shell for adding/editing a class. The actual fields live in
 * ClassForm — this component only owns the overlay/panel/header chrome.
 */
export default function ClassModal({
  isOpen,
  onClose,
  cls,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="cp-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="cp-modal-panel w-full max-w-md rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cp-modal-header flex items-center justify-between px-6 py-4">
          <h2 className="cp-modal-title text-[16px] font-bold">
            {cls ? "Edit Class" : "Add Class"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cp-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <ClassForm
            initialData={cls}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
