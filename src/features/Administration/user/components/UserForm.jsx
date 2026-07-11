// import React, { useEffect, useRef, useState } from "react";
// import { Loader2 } from "lucide-react";
// import {
//   handleRestrictedInput,
//   mobileNumber,
// } from "../../../../common/utils/inputHandlers";
// import {
//   checkEmailExists,
//   checkPhoneExists,
//   checkUserExists,
// } from "../../../../redux/Administration/users/userService";

// const EMPTY = {
//   username: "",
//   email: "",
//   phone: "",
//   password: "",
//   status: "active",
// };

// const DEBOUNCE_MS = 500;
// const ADMIN_ROLE_NAME = "ADMIN";

// /**
//  * Add/edit form for a single user.
//  *
//  * @param {object|null} initialData - pass an existing user to edit; the
//  *   `roles` field on it may be an array of IDs ([2, 3]) or an array of role
//  *   objects ([{id, name}, ...]) — both are normalized below.
//  * @param {Array<{id, name}>} availableRoles - full role list to render as
//  *   checkboxes (fetched once by the parent page).
//  * @param {Array<object>} users - full user list, used only to figure out
//  *   whether an ADMIN already exists elsewhere so we can lock that checkbox.
//  * @param {(payload) => void} onSubmit
//  * @param {() => void} onCancel
//  * @param {boolean} submitting
//  */
// export default function UserForm({
//   initialData = null,
//   availableRoles = [],
//   users = [],
//   onSubmit,
//   onCancel,
//   submitting,
// }) {
//   const isEdit = Boolean(initialData?.id);
//   console.log("UserForm initialData:", initialData);
//   //   console.log("UserForm availableRoles:", availableRoles);
//   const [data, setData] = useState(EMPTY);
//   const [selectedRoles, setSelectedRoles] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [checking, setChecking] = useState({
//     username: false,
//     email: false,
//     phone: false,
//   });

//   // Track whether the very first render for a given initialData has
//   // happened yet, so the debounced checks don't immediately re-validate
//   // values we just populated from initialData.
//   const skipNextCheck = useRef({ username: true, email: true, phone: true });

//   //   useEffect(() => {
//   //     if (initialData) {
//   //       setData({
//   //         username: initialData.username || "",
//   //         email: initialData.email || "",
//   //         phone: initialData.phone || "",
//   //         password: "", // never pre-fill password
//   //         status: initialData.status || "active",
//   //       });
//   //       // console.log("initialData.roles:", initialData.roles);
//   //       //   console.log("availableRoles:", availableRoles);
//   //       //   const normalizedRoles = (initialData.roles || []).map((r) =>
//   //       //     typeof r === "object" ? r.id : r,
//   //       //   );
//   //       //   setSelectedRoles(normalizedRoles);

//   //       // Normalize the roles from initialData to an array of role IDs, regardless of whether they were provided as objects or strings.
//   //       let normalizedRoles = [];

//   //       if (Array.isArray(initialData.roles)) {
//   //         normalizedRoles = initialData.roles.map((r) =>
//   //           typeof r === "object" ? Number(r.id) : Number(r),
//   //         );
//   //       } else if (typeof initialData.roles === "string") {
//   //         const roleNames = initialData.roles
//   //           .split(",")
//   //           .map((r) => r.trim().toUpperCase());

//   //         normalizedRoles = availableRoles
//   //           .filter((role) => roleNames.includes(role.name.toUpperCase()))
//   //           .map((role) => role.id);
//   //       }

//   //     //   console.log("roleNames", roleNames);
//   //       console.log("availableRoles", availableRoles);
//   //       console.log("normalizedRoles", normalizedRoles);

//   //       setSelectedRoles(normalizedRoles);
//   //     } else {
//   //       setData(EMPTY);
//   //       setSelectedRoles([]);
//   //     }
//   //     setErrors({});
//   //     skipNextCheck.current = { username: true, email: true, phone: true };
//   //   }, [initialData]);

//   useEffect(() => {
//     if (!initialData) {
//       setData(EMPTY);
//       setSelectedRoles([]);
//       setErrors({});
//       return;
//     }

//     setData({
//       username: initialData.username || "",
//       email: initialData.email || "",
//       phone: initialData.phone || "",
//       password: "",
//       status: initialData.status || "active",
//     });

//     let normalizedRoles = [];

//     if (Array.isArray(initialData.roles)) {
//       normalizedRoles = initialData.roles.map((role) => role.id);
//     } else if (typeof initialData.roles === "string") {
//       const roleNames = initialData.roles
//         .split(",")
//         .map((r) => r.trim().toUpperCase());

//       normalizedRoles = availableRoles
//         .filter((role) => roleNames.includes(role.name.toUpperCase()))
//         .map((role) => role.id);
//     }

//     // console.log("normalizedRoles", normalizedRoles);

//     setSelectedRoles(normalizedRoles);

//     setErrors({});
//     skipNextCheck.current = {
//       username: true,
//       email: true,
//       phone: true,
//     };
//   }, [initialData, availableRoles]);

//   const set = (key) => (e) => {
//     setData((d) => ({ ...d, [key]: e.target.value }));
//     if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
//   };

//   const toggleRole = (roleId) => {
//     setSelectedRoles((prev) =>
//       prev.includes(roleId)
//         ? prev.filter((id) => id !== roleId)
//         : [...prev, roleId],
//     );
//   };

//   // ── Single-admin restriction ──────────────────────────────────────
//   const adminRole = availableRoles.find(
//     (r) => r.name?.toUpperCase() === ADMIN_ROLE_NAME,
//   );

//   const adminTakenByOther =
//     adminRole &&
//     users.some((u) => {
//       if (isEdit && u.id === initialData.id) return false; // editing the admin themself is fine
//       const userRoles = u.roles || [];
//       return userRoles.some((r) => {
//         const roleId = typeof r === "object" ? r.id : r;
//         const roleName = typeof r === "object" ? r.name : null;
//         return (
//           roleId === adminRole.id || roleName?.toUpperCase() === ADMIN_ROLE_NAME
//         );
//       });
//     });

//   //   const adminTakenByOther =
//   //     adminRole &&
//   //     users.some((u) => {
//   //       // Ignore the current user while editing
//   //       if (isEdit && Number(u.id) === Number(initialData?.id)) {
//   //         return false;
//   //       }

//   //       let userRoles = [];

//   //       if (Array.isArray(u.roles)) {
//   //         userRoles = u.roles.map((r) =>
//   //           typeof r === "object"
//   //             ? (r.name || "").toUpperCase()
//   //             : String(r).toUpperCase(),
//   //         );
//   //       } else if (typeof u.roles === "string") {
//   //         userRoles = u.roles.split(",").map((r) => r.trim().toUpperCase());
//   //       }

//   //       return userRoles.includes(ADMIN_ROLE_NAME);
//   //     });

//   // ── Live uniqueness checks (debounced) ────────────────────────────
//   const checkUsername = async (value) => {
//     setChecking((c) => ({ ...c, username: true }));
//     try {
//       const exists = await checkUserExists(value);
//       setErrors((e) => ({
//         ...e,
//         username: exists ? "Username already exists" : null,
//       }));
//       console.log("checkUsername exists:", exists);
//     } catch {
//       // network/server error — don't block the user, just skip the check
//     } finally {
//       setChecking((c) => ({ ...c, username: false }));
//     }
//   };

//   const checkEmail = async (value) => {
//     setChecking((c) => ({ ...c, email: true }));
//     try {
//       const exists = await checkEmailExists(value);
//       setErrors((e) => ({
//         ...e,
//         email: exists ? "Email already exists" : null,
//       }));
//     } catch {
//       // ignore
//     } finally {
//       setChecking((c) => ({ ...c, email: false }));
//     }
//   };

//   const checkPhoneNum = async (value) => {
//     setChecking((c) => ({ ...c, phone: true }));
//     try {
//       const exists = await checkPhoneExists(value);
//       setErrors((e) => ({
//         ...e,
//         phone: exists ? "Phone already exists" : null,
//       }));
//     } catch {
//       // ignore
//     } finally {
//       setChecking((c) => ({ ...c, phone: false }));
//     }
//   };

//   useEffect(() => {
//     if (skipNextCheck.current.username) {
//       skipNextCheck.current.username = false;
//       return;
//     }
//     const value = data.username.trim();
//     if (!value) {
//       setErrors((e) => ({ ...e, username: null }));
//       return;
//     }
//     if (isEdit && value === initialData.username) {
//       setErrors((e) => ({ ...e, username: null }));
//       return;
//     }
//     const timer = setTimeout(() => checkUsername(value), DEBOUNCE_MS);
//     return () => clearTimeout(timer);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [data.username]);

//   useEffect(() => {
//     if (skipNextCheck.current.email) {
//       skipNextCheck.current.email = false;
//       return;
//     }
//     const value = data.email.trim();
//     if (!value || !/^\S+@\S+\.\S+$/.test(value)) {
//       setErrors((e) => ({ ...e, email: null }));
//       return;
//     }
//     if (isEdit && value === initialData.email) {
//       setErrors((e) => ({ ...e, email: null }));
//       return;
//     }
//     const timer = setTimeout(() => checkEmail(value), DEBOUNCE_MS);
//     return () => clearTimeout(timer);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [data.email]);

//   useEffect(() => {
//     if (skipNextCheck.current.phone) {
//       skipNextCheck.current.phone = false;
//       return;
//     }
//     const value = data.phone.trim();
//     if (!/^\d{10}$/.test(value)) {
//       setErrors((e) => ({ ...e, phone: null }));
//       return;
//     }
//     if (isEdit && value === initialData.phone) {
//       setErrors((e) => ({ ...e, phone: null }));
//       return;
//     }
//     const timer = setTimeout(() => checkPhoneNum(value), DEBOUNCE_MS);
//     return () => clearTimeout(timer);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [data.phone]);

//   const validate = () => {
//     const e = {};
//     if (!data.username.trim()) e.username = "Username is required";

//     if (!data.phone.trim()) e.phone = "Phone is required";

//     if (!selectedRoles.length) {
//       e.roles = "At least one role is required";
//     }

//     if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
//       e.email = "Enter a valid email";
//     }
//     if (data.phone && !/^\d{10}$/.test(data.phone)) {
//       e.phone = "Enter a 10-digit number";
//     }
//     if (!isEdit && !data.password) {
//       e.password = "Password is required";
//     } else if (data.password && data.password.length < 6) {
//       e.password = "At least 6 characters";
//     }

//     // Preserve any "already exists" errors surfaced by the live checks.
//     if (errors.username) e.username = errors.username;
//     if (errors.email) e.email = errors.email;
//     if (errors.phone) e.phone = errors.phone;

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (checking.username || checking.email || checking.phone) return;
//     if (!validate()) return;

//     const payload = {
//       username: data.username.trim(),
//       email: data.email.trim(),
//       phone: data.phone.trim(),
//       roles: selectedRoles,
//       status: data.status,
//     };
//     // Only send a password if one was actually typed — on edit, an empty
//     // field means "keep the current password".
//     if (data.password) payload.password = data.password;

//     onSubmit(payload);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div className="flex flex-col gap-1.5">
//           <label className="up-field-label text-[13px] font-medium">
//             Username <span className="up-field-required">*</span>
//           </label>
//           <input
//             autoFocus
//             className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.username ? "up-input-error" : ""}`}
//             placeholder="Username"
//             value={data.username}
//             onChange={set("username")}
//           />
//           <div className="h-4">
//             {checking.username ? (
//               <p className="up-field-hint text-[11px]">Checking…</p>
//             ) : (
//               errors.username && (
//                 <p className="up-field-error text-[11px]">{errors.username}</p>
//               )
//             )}
//           </div>
//         </div>

//         <div className="flex flex-col gap-1.5">
//           <label className="up-field-label text-[13px] font-medium">
//             {isEdit ? "New Password" : "Password"}{" "}
//             {!isEdit && <span className="up-field-required">*</span>}
//           </label>
//           <input
//             type="password"
//             className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.password ? "up-input-error" : ""}`}
//             placeholder={
//               isEdit ? "Leave blank to keep current" : "Min 6 characters"
//             }
//             value={data.password}
//             onChange={set("password")}
//           />
//           <div className="h-4">
//             {errors.password ? (
//               <p className="up-field-error text-[11px]">{errors.password}</p>
//             ) : isEdit ? (
//               <p className="up-field-hint text-[11px]">
//                 Leave blank to keep current password
//               </p>
//             ) : null}
//           </div>
//         </div>

//         <div className="flex flex-col gap-1.5">
//           <label className="up-field-label text-[13px] font-medium">
//             Email
//           </label>
//           <input
//             className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.email ? "up-input-error" : ""}`}
//             placeholder="example@gmail.com"
//             value={data.email}
//             onChange={set("email")}
//           />
//           <div className="h-4">
//             {checking.email ? (
//               <p className="up-field-hint text-[11px]">Checking…</p>
//             ) : (
//               errors.email && (
//                 <p className="up-field-error text-[11px]">{errors.email}</p>
//               )
//             )}
//           </div>
//         </div>

//         <div className="flex flex-col gap-1.5">
//           <label className="up-field-label text-[13px] font-medium">
//             Phone <span className="up-field-required">*</span>
//           </label>
//           <input
//             className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.phone ? "up-input-error" : ""}`}
//             placeholder="1234567890"
//             value={data.phone}
//             onChange={handleRestrictedInput(setData, "phone", mobileNumber)}
//           />
//           <div className="h-4">
//             {checking.phone ? (
//               <p className="up-field-hint text-[11px]">Checking…</p>
//             ) : (
//               errors.phone && (
//                 <p className="up-field-error text-[11px]">{errors.phone}</p>
//               )
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="flex flex-col gap-1.5">
//         <label className="up-field-label text-[13px] font-medium">Roles</label>
//         {availableRoles.length === 0 ? (
//           <p className="up-field-hint text-[12.5px]">No roles available yet.</p>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//             {availableRoles.map((role) => {
//               const checked = selectedRoles.includes(role.id);
//               const isAdminRole = role.name?.toUpperCase() === ADMIN_ROLE_NAME;
//               const disabled = isAdminRole && adminTakenByOther;

//               console.log({
//                 adminTakenByOther,
//                 selectedRoles,
//                 availableRoles,
//               });

//               return (
//                 <label
//                   key={role.id}
//                   title={
//                     disabled
//                       ? "Only one Admin is allowed and it's already assigned"
//                       : undefined
//                   }
//                   className={`up-role-option flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
//                     checked ? "up-role-option-checked" : ""
//                   } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
//                 >
//                   <input
//                     type="checkbox"
//                     className="up-role-checkbox w-4 h-4 rounded"
//                     checked={checked}
//                     disabled={disabled}
//                     onChange={() => !disabled && toggleRole(role.id)}
//                   />
//                   {role.name}
//                 </label>
//               );
//             })}
//           </div>
//         )}
//         {adminTakenByOther && (
//           <p className="up-field-hint text-[11px]">
//             Admin role is already assigned to another user.
//           </p>
//         )}
//         <div className="h-4">
//           {errors.roles && (
//             <p className="up-field-error text-[11px]">{errors.roles}</p>
//           )}
//         </div>
//       </div>

//       <div className="flex flex-col gap-1.5">
//         <label className="up-field-label text-[13px] font-medium">Status</label>
//         <div className="flex gap-2">
//           {["active", "inactive"].map((s) => (
//             <button
//               key={s}
//               type="button"
//               onClick={() => setData((d) => ({ ...d, status: s }))}
//               className={`up-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
//                 data.status === s
//                   ? s === "active"
//                     ? "up-status-toggle-active"
//                     : "up-status-toggle-inactive"
//                   : ""
//               }`}
//             >
//               {s}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="up-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="up-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={
//             submitting || checking.username || checking.email || checking.phone
//           }
//           className="up-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
//         >
//           {submitting && <Loader2 size={14} className="animate-spin" />}
//           {isEdit ? "Update User" : "Create User"}
//         </button>
//       </div>
//     </form>
//   );
// }


import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  handleRestrictedInput,
  mobileNumber,
} from "../../../../common/utils/inputHandlers";
import {
  checkEmailExists,
  checkPhoneExists,
  checkUserExists,
} from "../../../../redux/Administration/users/userService";

const EMPTY = {
  username: "",
  email: "",
  phone: "",
  password: "",
  school_id: "",
  status: "active",
};

const DEBOUNCE_MS = 500;
const ADMIN_ROLE_NAME = "ADMIN";

/**
 * Add/edit form for a single user.
 *
 * @param {object|null} initialData - pass an existing user to edit; the
 *   `roles` field on it may be an array of IDs ([2, 3]) or an array of role
 *   objects ([{id, name}, ...]) — both are normalized below.
 * @param {Array<{id, name}>} availableRoles - full role list to render as
 *   checkboxes (fetched once by the parent page).
 * @param {Array<object>} users - full user list, used only to figure out
 *   whether an ADMIN already exists elsewhere so we can lock that checkbox.
 * @param {boolean} isAdmin - whether the *logged-in* user is an admin. Admins
 *   pick which school a user belongs to; everyone else's users are scoped
 *   to their own school automatically.
 * @param {number|string|null} schoolId - the logged-in non-admin's own
 *   school_id, used directly instead of showing a picker.
 * @param {Array<{id, name}>} schools - full school list for the admin picker.
 * @param {boolean} schoolsLoading
 * @param {(payload) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function UserForm({
  initialData = null,
  availableRoles = [],
  users = [],
  isAdmin = false,
  schoolId = null,
  schools = [],
  schoolsLoading = false,
  onSubmit,
  onCancel,
  submitting,
}) {
  const isEdit = Boolean(initialData?.id);

  const [data, setData] = useState(EMPTY);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [checking, setChecking] = useState({
    username: false,
    email: false,
    phone: false,
  });

  // Track whether the very first render for a given initialData has
  // happened yet, so the debounced checks don't immediately re-validate
  // values we just populated from initialData.
  const skipNextCheck = useRef({ username: true, email: true, phone: true });

  // Resets the form only when switching between add/edit targets — not
  // whenever schoolId/isAdmin change (those come from an async auth fetch
  // and could otherwise flip mid-edit and wipe what the user typed).
  useEffect(() => {
    if (!initialData) {
      setData({ ...EMPTY, school_id: isAdmin ? "" : (schoolId ?? "") });
      setSelectedRoles([]);
      setErrors({});
      skipNextCheck.current = { username: true, email: true, phone: true };
      return;
    }

    setData({
      username: initialData.username || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      password: "",
      school_id: initialData.school_id ?? "",
      status: initialData.status || "active",
    });

    let normalizedRoles = [];

    if (Array.isArray(initialData.roles)) {
      normalizedRoles = initialData.roles.map((role) =>
        typeof role === "object" ? role.id : role,
      );
    } else if (typeof initialData.roles === "string") {
      const roleNames = initialData.roles
        .split(",")
        .map((r) => r.trim().toUpperCase());

      normalizedRoles = availableRoles
        .filter((role) => roleNames.includes(role.name.toUpperCase()))
        .map((role) => role.id);
    }

    setSelectedRoles(normalizedRoles);
    setErrors({});
    skipNextCheck.current = { username: true, email: true, phone: true };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, availableRoles]);

  // Backfills school_id for a non-admin once the auth fetch resolves,
  // without disturbing anything else already typed into a new record.
  useEffect(() => {
    if (!initialData && !isAdmin && schoolId) {
      setData((d) => (d.school_id ? d : { ...d, school_id: schoolId }));
    }
  }, [schoolId, isAdmin, initialData]);

  const set = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  // ── Single-admin restriction ──────────────────────────────────────
  const adminRole = availableRoles.find(
    (r) => r.name?.toUpperCase() === ADMIN_ROLE_NAME,
  );

  const adminTakenByOther =
    adminRole &&
    users.some((u) => {
      if (isEdit && u.id === initialData.id) return false; // editing the admin themself is fine
      const userRoles = u.roles || [];
      return userRoles.some((r) => {
        const roleId = typeof r === "object" ? r.id : r;
        const roleName = typeof r === "object" ? r.name : null;
        return (
          roleId === adminRole.id || roleName?.toUpperCase() === ADMIN_ROLE_NAME
        );
      });
    });

  // ── Live uniqueness checks (debounced) ────────────────────────────
  const checkUsername = async (value) => {
    setChecking((c) => ({ ...c, username: true }));
    try {
      const exists = await checkUserExists(value);
      setErrors((e) => ({
        ...e,
        username: exists ? "Username already exists" : null,
      }));
    } catch {
      // network/server error — don't block the user, just skip the check
    } finally {
      setChecking((c) => ({ ...c, username: false }));
    }
  };

  const checkEmail = async (value) => {
    setChecking((c) => ({ ...c, email: true }));
    try {
      const exists = await checkEmailExists(value);
      setErrors((e) => ({
        ...e,
        email: exists ? "Email already exists" : null,
      }));
    } catch {
      // ignore
    } finally {
      setChecking((c) => ({ ...c, email: false }));
    }
  };

  const checkPhoneNum = async (value) => {
    setChecking((c) => ({ ...c, phone: true }));
    try {
      const exists = await checkPhoneExists(value);
      setErrors((e) => ({
        ...e,
        phone: exists ? "Phone already exists" : null,
      }));
    } catch {
      // ignore
    } finally {
      setChecking((c) => ({ ...c, phone: false }));
    }
  };

  useEffect(() => {
    if (skipNextCheck.current.username) {
      skipNextCheck.current.username = false;
      return;
    }
    const value = data.username.trim();
    if (!value) {
      setErrors((e) => ({ ...e, username: null }));
      return;
    }
    if (isEdit && value === initialData.username) {
      setErrors((e) => ({ ...e, username: null }));
      return;
    }
    const timer = setTimeout(() => checkUsername(value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.username]);

  useEffect(() => {
    if (skipNextCheck.current.email) {
      skipNextCheck.current.email = false;
      return;
    }
    const value = data.email.trim();
    if (!value || !/^\S+@\S+\.\S+$/.test(value)) {
      setErrors((e) => ({ ...e, email: null }));
      return;
    }
    if (isEdit && value === initialData.email) {
      setErrors((e) => ({ ...e, email: null }));
      return;
    }
    const timer = setTimeout(() => checkEmail(value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.email]);

  useEffect(() => {
    if (skipNextCheck.current.phone) {
      skipNextCheck.current.phone = false;
      return;
    }
    const value = data.phone.trim();
    if (!/^\d{10}$/.test(value)) {
      setErrors((e) => ({ ...e, phone: null }));
      return;
    }
    if (isEdit && value === initialData.phone) {
      setErrors((e) => ({ ...e, phone: null }));
      return;
    }
    const timer = setTimeout(() => checkPhoneNum(value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.phone]);

  const validate = () => {
    const e = {};
    if (isAdmin && !data.school_id) e.school_id = "Please select a school";
    if (!data.username.trim()) e.username = "Username is required";

    if (!data.phone.trim()) e.phone = "Phone is required";

    if (!selectedRoles.length) {
      e.roles = "At least one role is required";
    }

    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      e.email = "Enter a valid email";
    }
    if (data.phone && !/^\d{10}$/.test(data.phone)) {
      e.phone = "Enter a 10-digit number";
    }
    if (!isEdit && !data.password) {
      e.password = "Password is required";
    } else if (data.password && data.password.length < 6) {
      e.password = "At least 6 characters";
    }

    // Preserve any "already exists" errors surfaced by the live checks.
    if (errors.username) e.username = errors.username;
    if (errors.email) e.email = errors.email;
    if (errors.phone) e.phone = errors.phone;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checking.username || checking.email || checking.phone) return;
    if (!validate()) return;

    const payload = {
      username: data.username.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      school_id: Number(isAdmin ? data.school_id : schoolId),
      roles: selectedRoles,
      status: data.status,
    };
    // Only send a password if one was actually typed — on edit, an empty
    // field means "keep the current password".
    if (data.password) payload.password = data.password;

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="up-field-label text-[13px] font-medium">
            School <span className="up-field-required">*</span>
          </label>
          <select
            className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.school_id ? "up-input-error" : ""}`}
            value={data.school_id}
            onChange={set("school_id")}
            disabled={schoolsLoading}
          >
            <option value="">
              {schoolsLoading ? "Loading schools..." : "Select a school"}
            </option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="h-4">
            {errors.school_id && (
              <p className="up-field-error text-[11px]">{errors.school_id}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="up-field-label text-[13px] font-medium">
            Username <span className="up-field-required">*</span>
          </label>
          <input
            autoFocus
            className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.username ? "up-input-error" : ""}`}
            placeholder="Username"
            value={data.username}
            onChange={set("username")}
          />
          <div className="h-4">
            {checking.username ? (
              <p className="up-field-hint text-[11px]">Checking…</p>
            ) : (
              errors.username && (
                <p className="up-field-error text-[11px]">{errors.username}</p>
              )
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="up-field-label text-[13px] font-medium">
            {isEdit ? "New Password" : "Password"}{" "}
            {!isEdit && <span className="up-field-required">*</span>}
          </label>
          <input
            type="password"
            className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.password ? "up-input-error" : ""}`}
            placeholder={
              isEdit ? "Leave blank to keep current" : "Min 6 characters"
            }
            value={data.password}
            onChange={set("password")}
          />
          <div className="h-4">
            {errors.password ? (
              <p className="up-field-error text-[11px]">{errors.password}</p>
            ) : isEdit ? (
              <p className="up-field-hint text-[11px]">
                Leave blank to keep current password
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="up-field-label text-[13px] font-medium">
            Email
          </label>
          <input
            className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.email ? "up-input-error" : ""}`}
            placeholder="example@gmail.com"
            value={data.email}
            onChange={set("email")}
          />
          <div className="h-4">
            {checking.email ? (
              <p className="up-field-hint text-[11px]">Checking…</p>
            ) : (
              errors.email && (
                <p className="up-field-error text-[11px]">{errors.email}</p>
              )
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="up-field-label text-[13px] font-medium">
            Phone <span className="up-field-required">*</span>
          </label>
          <input
            className={`up-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.phone ? "up-input-error" : ""}`}
            placeholder="1234567890"
            value={data.phone}
            onChange={handleRestrictedInput(setData, "phone", mobileNumber)}
          />
          <div className="h-4">
            {checking.phone ? (
              <p className="up-field-hint text-[11px]">Checking…</p>
            ) : (
              errors.phone && (
                <p className="up-field-error text-[11px]">{errors.phone}</p>
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="up-field-label text-[13px] font-medium">Roles</label>
        {availableRoles.length === 0 ? (
          <p className="up-field-hint text-[12.5px]">No roles available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableRoles.map((role) => {
              const checked = selectedRoles.includes(role.id);
              const isAdminRole = role.name?.toUpperCase() === ADMIN_ROLE_NAME;
              const disabled = isAdminRole && adminTakenByOther;

              return (
                <label
                  key={role.id}
                  title={
                    disabled
                      ? "Only one Admin is allowed and it's already assigned"
                      : undefined
                  }
                  className={`up-role-option flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${checked ? "up-role-option-checked" : ""
                    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    className="up-role-checkbox w-4 h-4 rounded"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => !disabled && toggleRole(role.id)}
                  />
                  {role.name}
                </label>
              );
            })}
          </div>
        )}
        {adminTakenByOther && (
          <p className="up-field-hint text-[11px]">
            Admin role is already assigned to another user.
          </p>
        )}
        <div className="h-4">
          {errors.roles && (
            <p className="up-field-error text-[11px]">{errors.roles}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="up-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setData((d) => ({ ...d, status: s }))}
              className={`up-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${data.status === s
                  ? s === "active"
                    ? "up-status-toggle-active"
                    : "up-status-toggle-inactive"
                  : ""
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="up-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="up-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            submitting || checking.username || checking.email || checking.phone
          }
          className="up-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
}