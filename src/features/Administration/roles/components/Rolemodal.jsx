import React from "react";
import { X } from "lucide-react";
import RoleForm from "./RoleForm.jsx";
import { AnimatePresence, motion } from "framer-motion";


/**
 * Modal shell for adding/editing a role. The actual fields live in
 * RoleForm — this component only owns the overlay/panel/header chrome.
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
    // <div
    //   className="rp-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
    //   onClick={onClose}
    // >
    //   <div
    //     className="rp-modal-panel w-full max-w-md rounded-2xl overflow-hidden"
    //     onClick={(e) => e.stopPropagation()}
    //   >
    //     <div className="rp-modal-header flex items-center justify-between px-6 py-4">
    //       <h2 className="rp-modal-title text-[16px] font-bold">
    //         {role ? "Edit Role" : "Add Role"}
    //       </h2>
    //       <button
    //         onClick={onClose}
    //         aria-label="Close"
    //         className="rp-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
    //       >
    //         <X size={18} />
    //       </button>
    //     </div>

    //     <div className="px-6 py-5">
    //       <RoleForm
    //         initialData={role}
    //         onSubmit={onSubmit}
    //         onCancel={onClose}
    //         submitting={submitting}
    //       />
    //     </div>
    //   </div>
    // </div>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="rp-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            className="rp-modal-panel relative w-full max-w-md rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="rp-modal-header flex items-center justify-between px-6 py-4">
              <h2 className="rp-modal-title text-[16px] font-bold">
                {role ? "Edit Role" : "Add Role"}
              </h2>

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
