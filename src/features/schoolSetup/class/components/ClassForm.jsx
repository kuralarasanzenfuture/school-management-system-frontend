// import React, { useEffect, useRef, useState } from "react";
// import { Loader2 } from "lucide-react";
// // import { checkClassExists } from "../../../../redux/schoolSetup/class/classService.js";

// const EMPTY = {
//   name: "",
//   status: "active",
// };

// const DEBOUNCE_MS = 500;

// /**
//  * Add/edit form for a single class (e.g. "10", "9", "1").
//  *
//  * @param {object|null} initialData - pass an existing class to edit it;
//  *   omit (or pass null) to create a new one.
//  * @param {(payload: {name, status}) => void} onSubmit
//  * @param {() => void} onCancel
//  * @param {boolean} submitting - disables the form while a save is in flight
//  */
// export default function ClassForm({
//   initialData = null,
//   onSubmit,
//   onCancel,
//   submitting,
// }) {
//   const isEdit = Boolean(initialData?.id);
//   const [data, setData] = useState(EMPTY);
//   const [errors, setErrors] = useState({});
//   const [checkingName, setCheckingName] = useState(false);

//   const skipNextCheck = useRef(true);

//   useEffect(() => {
//     setData(
//       initialData
//         ? {
//             name: initialData.name || "",
//             status: initialData.status || "active",
//           }
//         : EMPTY,
//     );
//     setErrors({});
//     skipNextCheck.current = true;
//   }, [initialData]);

//   const set = (key) => (e) => {
//     setData((d) => ({ ...d, [key]: e.target.value }));
//     if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
//   };

//   // ── Live uniqueness check (debounced) ─────────────────────────────
//   useEffect(() => {
//     if (skipNextCheck.current) {
//       skipNextCheck.current = false;
//       return;
//     }
//     const value = data.name.trim();
//     if (!value) {
//       setErrors((e) => ({ ...e, name: null }));
//       return;
//     }
//     if (isEdit && value === initialData.name) {
//       setErrors((e) => ({ ...e, name: null }));
//       return;
//     }

//     const timer = setTimeout(async () => {
//       setCheckingName(true);
//       try {
//         const exists = await checkClassExists(value);
//         setErrors((e) => ({
//           ...e,
//           name: exists ? "This class already exists" : null,
//         }));
//       } catch {
//         // network/server error — don't block the user, just skip the check
//       } finally {
//         setCheckingName(false);
//       }
//     }, DEBOUNCE_MS);

//     return () => clearTimeout(timer);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [data.name]);

//   const validate = () => {
//     const e = {};
//     if (!data.name.trim()) e.name = "Class name is required";
//     else if (data.name.trim().length > 50) e.name = "Max 50 characters";

//     // Preserve an "already exists" error surfaced by the live check.
//     if (errors.name) e.name = errors.name;

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (checkingName) return;
//     if (!validate()) return;
//     onSubmit({
//       name: data.name.trim(),
//       status: data.status,
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//       <div className="flex flex-col gap-1.5">
//         <label className="cp-field-label text-[13px] font-medium">
//           Class Name <span className="cp-field-required">*</span>
//         </label>
//         <input
//           autoFocus
//           className={`cp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.name ? "cp-input-error" : ""}`}
//           placeholder="e.g. 10"
//           value={data.name}
//           onChange={set("name")}
//           maxLength={50}
//         />
//         <div className="h-4">
//           {checkingName ? (
//             <p className="cp-field-hint text-[11px]">Checking…</p>
//           ) : (
//             errors.name && (
//               <p className="cp-field-error text-[11px]">{errors.name}</p>
//             )
//           )}
//         </div>
//       </div>

//       <div className="flex flex-col gap-1.5">
//         <label className="cp-field-label text-[13px] font-medium">Status</label>
//         <div className="flex gap-2">
//           {["active", "inactive"].map((s) => (
//             <button
//               key={s}
//               type="button"
//               onClick={() => setData((d) => ({ ...d, status: s }))}
//               className={`cp-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
//                 data.status === s
//                   ? s === "active"
//                     ? "cp-status-toggle-active"
//                     : "cp-status-toggle-inactive"
//                   : ""
//               }`}
//             >
//               {s}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="cp-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="cp-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={submitting || checkingName}
//           className="cp-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
//         >
//           {submitting && <Loader2 size={14} className="animate-spin" />}
//           {isEdit ? "Update Class" : "Create Class"}
//         </button>
//       </div>
//     </form>
//   );
// }

// ------------------------------------------------------------------
import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { checkClassExists } from "../../../../redux/schoolSetup/class/class.service.js";

const EMPTY = {
  school_id: "",
  name: "",
  status: "active",
};

const DEBOUNCE_MS = 500;

/**
 * Add/edit form for a single class (e.g. "10", "9", "1").
 *
 * @param {object|null} initialData - pass an existing class to edit it;
 *   omit (or pass null) to create a new one.
 * @param {(payload: {school_id, name, status}) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting - disables the form while a save is in flight
 */
export default function ClassForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting,
}) {
  const dispatch = useDispatch();

  const isEdit = Boolean(initialData?.id);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [checkingName, setCheckingName] = useState(false);

  const skipNextCheck = useRef(true);

  const { user } = useSelector((state) => state.auth);

  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

  // Non-admins only ever belong to one school — use theirs directly.
  // Admins pick a school in the dropdown below instead.
  const schoolId = isAdmin ? null : user?.school_id;

  // Which school the *uniqueness check* should actually run against:
  // admins check whatever they've selected in the dropdown so far (may be
  // empty), everyone else checks their own fixed school.
  const effectiveSchoolId = isAdmin ? data.school_id : schoolId;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  // Resets the form when switching between add/edit targets. Does NOT
  // depend on schoolId/isAdmin directly — those come from an async auth
  // fetch and could otherwise flip mid-edit and wipe what the user typed.
  useEffect(() => {
    if (initialData) {
      setData({
        school_id: initialData.school_id ?? "",
        name: initialData.name || "",
        status: initialData.status || "active",
      });
    } else {
      setData({ ...EMPTY, school_id: isAdmin ? "" : (schoolId ?? "") });
    }
    setErrors({});
    skipNextCheck.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Separately: once `schoolId` becomes available for a non-admin who
  // already has the "Add Class" form open, backfill it without touching
  // anything else they've typed. Only applies to a brand-new record.
  useEffect(() => {
    if (!initialData && !isAdmin && schoolId) {
      setData((d) => (d.school_id ? d : { ...d, school_id: schoolId }));
    }
  }, [schoolId, isAdmin, initialData]);

  const set = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  // ── Live uniqueness check (debounced) ─────────────────────────────
  // Re-runs whenever the name OR the target school changes — an admin
  // switching schools mid-typing needs the check to re-validate against
  // the newly selected school, not silently keep the old result.
  useEffect(() => {
    if (skipNextCheck.current) {
      skipNextCheck.current = false;
      return;
    }
    const value = data.name.trim();
    if (!value) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }
    if (isEdit && value === initialData.name) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }
    // Can't check uniqueness without knowing which school to check
    // against — happens for admins before they've picked one.
    if (!effectiveSchoolId) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingName(true);
      try {
        const result = await checkClassExists(effectiveSchoolId, value);
        // Normalize whatever shape the API returns — a plain boolean, or
        // an object like { exists: true }. Treating any truthy *object*
        // (including { exists: false }) as "exists" was the original bug.
        const exists =
          typeof result === "boolean" ? result : Boolean(result?.exists);
        setErrors((e) => ({
          ...e,
          name: exists ? "This class already exists" : null,
        }));
      } catch {
        // network/server error — don't block the user, just skip the check
      } finally {
        setCheckingName(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.name, effectiveSchoolId]);

  const validate = () => {
    const e = {};
    if (isAdmin && !data.school_id) e.school_id = "Please select a school";
    if (!data.name.trim()) e.name = "Class name is required";
    else if (data.name.trim().length > 50) e.name = "Max 50 characters";

    // Preserve an "already exists" error surfaced by the live check.
    if (errors.name) e.name = errors.name;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checkingName) return;
    if (!validate()) return;
    onSubmit({
      school_id: isAdmin ? data.school_id : schoolId,
      name: data.name.trim(),
      status: data.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="cp-field-label text-[13px] font-medium">
            School <span className="cp-field-required">*</span>
          </label>
          <select
            className={`cp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.school_id ? "cp-input-error" : ""}`}
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
              <p className="cp-field-error text-[11px]">{errors.school_id}</p>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="cp-field-label text-[13px] font-medium">
          Class Name <span className="cp-field-required">*</span>
        </label>
        <input
          autoFocus
          className={`cp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.name ? "cp-input-error" : ""}`}
          placeholder="e.g. 10"
          value={data.name}
          onChange={set("name")}
          maxLength={50}
        />
        <div className="h-4">
          {checkingName ? (
            <p className="cp-field-hint text-[11px]">Checking…</p>
          ) : (
            errors.name && (
              <p className="cp-field-error text-[11px]">{errors.name}</p>
            )
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="cp-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setData((d) => ({ ...d, status: s }))}
              className={`cp-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                data.status === s
                  ? s === "active"
                    ? "cp-status-toggle-active"
                    : "cp-status-toggle-inactive"
                  : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="cp-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="cp-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || checkingName}
          className="cp-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Update Class" : "Create Class"}
        </button>
      </div>
    </form>
  );
}
