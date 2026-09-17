import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import SchoolForm from "./SchoolForm";

export default function SchoolModal({
  isOpen,
  onClose,
  school,
  onSubmit,
  submitting,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="scp-modal-overlay fixed inset-0 z-[1200] flex items-center justify-center backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="scp-modal-panel w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] flex flex-col shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="scp-modal-header flex items-center justify-between px-6 py-4 shrink-0">
              <h2 className="scp-modal-title text-[16px] font-bold">
                {school ? "Edit School Profile" : "Add School Profile"}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
