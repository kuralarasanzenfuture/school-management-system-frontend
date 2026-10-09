import React from "react";
import { X, ShieldPlus, Edit } from "lucide-react";
import RoleForm from "./RoleForm.jsx";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Modal shell for adding / editing a role.
 */
export default function RoleModal({
  isOpen,
  onClose,
  role,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="rp-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            className="rp-modal-panel relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.92, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 25 }}
            transition={{
              duration: 0.22,
              ease: "easeOut",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="rp-modal-header flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {role ? <Edit size={17} /> : <ShieldPlus size={18} />}
                </div>
                <div>
                  <h2 className="rp-modal-title text-[16px] font-bold">
                    {role ? "Edit Role" : "Add New Role"}
                  </h2>
                  <p className="text-[12px] rp-subtitle">
                    {role
                      ? `Update configuration for ${role.name}`
                      : "Define a new access role and permissions scope"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close"
                className="rp-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <RoleForm
                initialData={role}
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
