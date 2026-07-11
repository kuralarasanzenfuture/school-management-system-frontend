// import React from "react";
// import { X } from "lucide-react";
// import UserForm from "./UserForm.jsx";

// /**
//  * Modal shell for adding/editing a user. The actual fields live in
//  * UserForm — this component only owns the overlay/panel/header chrome.
//  */
// export default function UserModal({
//   isOpen,
//   onClose,
//   user,
//   availableRoles,
//   onSubmit,
//   submitting,
// }) {
//   if (!isOpen) return null;
//   // console.log("UserModal availableRoles:", availableRoles);

//   // console.log("UserModal user:", user);

//   return (
//     <div
//       className="up-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
//       onClick={onClose}
//     >
//       <div
//         className="up-modal-panel w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="up-modal-header flex items-center justify-between px-6 py-4">
//           <h2 className="up-modal-title text-[16px] font-bold">
//             {user ? "Edit User" : "Add User"}
//           </h2>
//           <button
//             onClick={onClose}
//             aria-label="Close"
//             className="up-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         <div className="px-6 py-5">
//           <UserForm
//             initialData={user}
//             availableRoles={availableRoles}
//             onSubmit={onSubmit}
//             onCancel={onClose}
//             submitting={submitting}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

import React from "react";
import { X } from "lucide-react";
import UserForm from "./UserForm.jsx";

/**
 * Modal shell for adding/editing a user. The actual fields live in
 * UserForm — this component only owns the overlay/panel/header chrome.
 */
export default function UserModal({
  isOpen,
  onClose,
  user,
  availableRoles,
  users,
  isAdmin,
  schoolId,
  schools,
  schoolsLoading,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="up-modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="up-modal-panel w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="up-modal-header flex items-center justify-between px-6 py-4">
          <h2 className="up-modal-title text-[16px] font-bold">
            {user ? "Edit User" : "Add User"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="up-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <UserForm
            initialData={user}
            availableRoles={availableRoles}
            users={users}
            isAdmin={isAdmin}
            schoolId={schoolId}
            schools={schools}
            schoolsLoading={schoolsLoading}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
