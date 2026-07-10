// import React, { useEffect, useState } from "react";
// import { Loader2 } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
// import { checkSubjectGroupExists } from "../../../../redux/schoolSetup/subject_group/subject_group.service.js";
// import { handleRestrictedInput, toUpperCase } from "../../../../common/utils/inputHandlers.js";
// const EMPTY = {
//   school_id: "",
//   name: "",
//   description: "",
//   status: "active",
// };

// /**
//  * Add/edit form for a single subject group (e.g. "Science Stream",
//  * "Commerce with Computer Science" — used for higher secondary electives).
//  *
//  * @param {object|null} initialData
//  * @param {(payload: object) => void} onSubmit
//  * @param {() => void} onCancel
//  * @param {boolean} submitting
//  */
// export default function SubjectGroupForm({
//   initialData = null,
//   onSubmit,
//   onCancel,
//   submitting,
// }) {
//   const dispatch = useDispatch();

//   const { user } = useSelector((state) => state.auth);
//   const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
//   const schoolId = isAdmin ? null : user?.school_id;

//   const schools = useSelector((state) => state.schoolProfile?.schools || []);
//   const schoolsLoading = useSelector(
//     (state) => state.schoolProfile?.loading || false,
//   );

//   useEffect(() => {
//     if (isAdmin) dispatch(fetchSchools());
//   }, [dispatch, isAdmin]);

//   const isEdit = Boolean(initialData?.id);
//   const [data, setData] = useState(EMPTY);
//   const [errors, setErrors] = useState({});

//   // Resets the form only when switching between add/edit targets — not
//   // whenever schoolId/isAdmin change (those come from an async auth fetch
//   // and could otherwise flip mid-edit and wipe what the user typed).
//   useEffect(() => {
//     if (initialData) {
//       setData({
//         school_id: initialData.school_id ?? "",
//         name: initialData.name || "",
//         description: initialData.description || "",
//         status: initialData.status || "active",
//       });
//     } else {
//       setData({ ...EMPTY, school_id: isAdmin ? "" : (schoolId ?? "") });
//     }
//     setErrors({});
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [initialData]);

//   // Backfills school_id for a non-admin once the auth fetch resolves,
//   // without disturbing anything else already typed into a new record.
//   useEffect(() => {
//     if (!initialData && !isAdmin && schoolId) {
//       setData((d) => (d.school_id ? d : { ...d, school_id: schoolId }));
//     }
//   }, [schoolId, isAdmin, initialData]);

//   const set = (key) => (e) => {
//     setData((d) => ({ ...d, [key]: e.target.value }));
//     if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
//   };

//   const validate = () => {
//     const e = {};
//     if (isAdmin && !data.school_id) e.school_id = "Please select a school";
//     if (!data.name.trim()) e.name = "Group name is required";
//     else if (data.name.trim().length > 100) e.name = "Max 100 characters";

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     onSubmit({
//       school_id: Number(isAdmin ? data.school_id : schoolId),
//       name: data.name.trim(),
//       description: data.description.trim() || null,
//       status: data.status,
//     });
//   };

//   const inputCls = (key) =>
//     `sg-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors[key] ? "sg-input-error" : ""}`;

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//       {isAdmin && (
//         <div className="flex flex-col gap-1.5">
//           <label className="sg-field-label text-[13px] font-medium">
//             School <span className="sg-field-required">*</span>
//           </label>
//           <select
//             className={inputCls("school_id")}
//             value={data.school_id}
//             onChange={set("school_id")}
//             disabled={schoolsLoading}
//           >
//             <option value="">
//               {schoolsLoading ? "Loading schools..." : "Select a school"}
//             </option>
//             {schools.map((s) => (
//               <option key={s.id} value={s.id}>
//                 {s.name}
//               </option>
//             ))}
//           </select>
//           <div className="h-4">
//             {errors.school_id && (
//               <p className="sg-field-error text-[11px]">{errors.school_id}</p>
//             )}
//           </div>
//         </div>
//       )}

//       <div className="flex flex-col gap-1.5">
//         <label className="sg-field-label text-[13px] font-medium">
//           Group Name <span className="sg-field-required">*</span>
//         </label>
//         <input
//           autoFocus
//           className={inputCls("name")}
//           placeholder="e.g. Science Stream"
//           value={data.name}
//           // onChange={set("name")}
//           onChange={handleRestrictedInput(setData, "name", toUpperCase)}
//           maxLength={100}
//         />
//         <div className="h-4">
//           {errors.name && (
//             <p className="sg-field-error text-[11px]">{errors.name}</p>
//           )}
//         </div>
//       </div>

//       <div className="flex flex-col gap-1.5">
//         <label className="sg-field-label text-[13px] font-medium">
//           Description
//         </label>
//         <textarea
//           rows={3}
//           className="sg-textarea w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 resize-none"
//           placeholder="Optional notes about this group (e.g. subjects included)"
//           value={data.description}
//           onChange={set("description")}
//         />
//       </div>

//       <div className="flex flex-col gap-1.5">
//         <label className="sg-field-label text-[13px] font-medium">Status</label>
//         <div className="flex gap-2">
//           {["active", "inactive"].map((s) => (
//             <button
//               key={s}
//               type="button"
//               onClick={() => setData((d) => ({ ...d, status: s }))}
//               className={`sg-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
//                 data.status === s
//                   ? s === "active"
//                     ? "sg-status-toggle-active"
//                     : "sg-status-toggle-inactive"
//                   : ""
//               }`}
//             >
//               {s}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="sg-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="sg-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={submitting}
//           className="sg-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
//         >
//           {submitting && <Loader2 size={14} className="animate-spin" />}
//           {isEdit ? "Update Subject Group" : "Create Subject Group"}
//         </button>
//       </div>
//     </form>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { checkSubjectGroupExists } from "../../../../redux/schoolSetup/subject_group/subject_group.service.js";
import {
  handleRestrictedInput,
  toUpperCase,
} from "../../../../common/utils/inputHandlers.js";

const EMPTY = {
  school_id: "",
  name: "",
  description: "",
  status: "active",
};

const DEBOUNCE_MS = 500;

/**
 * Add/edit form for a single subject group (e.g. "Science Stream",
 * "Commerce with Computer Science" — used for higher secondary electives).
 *
 * @param {object|null} initialData
 * @param {(payload: object) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function SubjectGroupForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting,
}) {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  useEffect(() => {
    if (isAdmin) dispatch(fetchSchools());
  }, [dispatch, isAdmin]);

  const isEdit = Boolean(initialData?.id);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [checkingExists, setCheckingExists] = useState(false);

  const skipNextCheck = useRef(true);

  // Which school the *uniqueness check* should run against: admins check
  // whatever they've picked in the dropdown so far (may be empty until
  // chosen), everyone else checks their own fixed school.
  const effectiveSchoolId = isAdmin ? data.school_id : schoolId;

  // Resets the form only when switching between add/edit targets — not
  // whenever schoolId/isAdmin change (those come from an async auth fetch
  // and could otherwise flip mid-edit and wipe what the user typed).
  useEffect(() => {
    if (initialData) {
      setData({
        school_id: initialData.school_id ?? "",
        name: initialData.name || "",
        description: initialData.description || "",
        status: initialData.status || "active",
      });
    } else {
      setData({ ...EMPTY, school_id: isAdmin ? "" : (schoolId ?? "") });
    }
    setErrors({});
    skipNextCheck.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

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

  // ── Live uniqueness check (debounced, scoped to name only — subject
  // groups don't have a `code` field like subjects do) ─────────────
  useEffect(() => {
    if (skipNextCheck.current) {
      skipNextCheck.current = false;
      return;
    }

    const name = data.name.trim();

    // Nothing worth checking yet, or we don't know which school to scope to.
    if (!effectiveSchoolId || !name) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }

    // Editing and the name didn't actually change — skip.
    if (isEdit && name === (initialData.name || "")) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingExists(true);
      try {
        const result = await checkSubjectGroupExists({
          school_id: effectiveSchoolId,
          name,
        });

        // console.log("Subject group existence check result:", result);

        // Confirmed API shape: { match: { name: boolean } }
        const nameExists = result?.exists;

        setErrors((e) => ({
          ...e,
          name: nameExists
            ? "This subject group name already exists in this school"
            : null,
        }));
      } catch (err) {
        // Surface this — a silent catch here means duplicate names would
        // never show an error and you'd have no way to tell why.
        console.error("Subject group existence check failed:", err);
      } finally {
        setCheckingExists(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.name, effectiveSchoolId]);

  const validate = () => {
    const e = {};
    if (isAdmin && !data.school_id) e.school_id = "Please select a school";
    if (!data.name.trim()) e.name = "Group name is required";
    else if (data.name.trim().length > 100) e.name = "Max 100 characters";

    // Preserve an "already exists" error surfaced by the live check.
    if (errors.name) e.name = errors.name;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checkingExists) return;
    if (!validate()) return;

    onSubmit({
      school_id: Number(isAdmin ? data.school_id : schoolId),
      name: data.name.trim(),
      description: data.description.trim() || null,
      status: data.status,
    });
  };

  const inputCls = (key) =>
    `sg-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors[key] ? "sg-input-error" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="sg-field-label text-[13px] font-medium">
            School <span className="sg-field-required">*</span>
          </label>
          <select
            className={inputCls("school_id")}
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
              <p className="sg-field-error text-[11px]">{errors.school_id}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="sg-field-label text-[13px] font-medium">
          Group Name <span className="sg-field-required">*</span>
        </label>
        <input
          autoFocus
          className={inputCls("name")}
          placeholder="e.g. Science Stream"
          value={data.name}
          onChange={handleRestrictedInput(setData, "name", toUpperCase)}
          maxLength={100}
        />
        <div className="h-4">
          {checkingExists ? (
            <p className="sg-field-hint text-[11px]">Checking…</p>
          ) : (
            errors.name && (
              <p className="sg-field-error text-[11px]">{errors.name}</p>
            )
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="sg-field-label text-[13px] font-medium">
          Description
        </label>
        <textarea
          rows={3}
          className="sg-textarea w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 resize-none"
          placeholder="Optional notes about this group (e.g. subjects included)"
          value={data.description}
          onChange={set("description")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="sg-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setData((d) => ({ ...d, status: s }))}
              className={`sg-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                data.status === s
                  ? s === "active"
                    ? "sg-status-toggle-active"
                    : "sg-status-toggle-inactive"
                  : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="sg-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="sg-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || checkingExists}
          className="sg-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Update Subject Group" : "Create Subject Group"}
        </button>
      </div>
    </form>
  );
}
