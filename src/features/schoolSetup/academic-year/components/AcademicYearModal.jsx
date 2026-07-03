import React from "react";
import { X } from "lucide-react";
import AcademicYearForm from "./AcademicYearForm.jsx";

/**
 * Modal shell for adding/editing an academic year. The actual fields live
 * in AcademicYearForm — this component only owns the overlay/panel/header
 * chrome.
 */
export default function AcademicYearModal({
  isOpen,
  onClose,
  academicYear,
  schoolId,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="ay-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="ay-modal-panel w-full max-w-md rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ay-modal-header flex items-center justify-between px-6 py-4">
          <h2 className="ay-modal-title text-[16px] font-bold">
            {academicYear ? "Edit Academic Year" : "Add Academic Year"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ay-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <AcademicYearForm
            initialData={academicYear}
            schoolId={schoolId}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
