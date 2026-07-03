import React from "react";
import { X } from "lucide-react";
import SchoolForm from "./SchoolForm";


export default function SchoolModal({
  isOpen,
  onClose,
  school,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="scp-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="scp-modal-panel w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scp-modal-header flex items-center justify-between px-6 py-4 shrink-0">
          <h2 className="scp-modal-title text-[16px] font-bold">
            {school ? "Edit School" : "Add School"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="scp-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          <SchoolForm
            initialData={school}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
