import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import EmployeeShiftForm from "./EmployeeShiftForm.jsx";

export default function EmployeeShiftModal({
  isOpen,
  onClose,
  shift,
  onSubmit,
  submitting,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="es-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="es-modal-panel w-full max-w-lg rounded-2xl flex flex-col shadow-2xl max-h-[92vh]"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 320,
              duration: 0.25,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="es-modal-header flex items-center justify-between px-6 py-4 shrink-0">
              <h2 className="es-modal-title text-[16px] font-bold">
                {shift ? "Edit Shift" : "Add Shift"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="es-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto">
              <EmployeeShiftForm
                initialData={shift}
                onSubmit={onSubmit}
                onCancel={onClose}
                submitting={submitting}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}