// import React, { useEffect, useState } from "react";
// import { Loader2 } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
// // ASSUMPTION: fetchStudents follows the same naming pattern as the other
// // list thunks in this app (fetchEmployees, fetchAcademicYears, etc).
// // Adjust this import + export name if studentSlice.js uses a different
// // thunk name for listing students.
// import { getStudents as fetchStudents } from "../../../redux/student/studentSlice.js";
// import { fetchClasses } from "../../../redux/schoolSetup/class/classSlice.js";
// import { fetchSections } from "../../../redux/schoolSetup/section/sectionSlice.js";
// import { fetchAcademicYears } from "../../../redux/schoolSetup/academic-year/academicYearSlice.js";

// const EMPTY = {
//   school_id: "",
//   student_id: "",
//   academic_year_id: "",
//   class_id: "",
//   section: "",
//   joining_date: "",
//   subject_group: "",
//   transport_required: false,
//   hostel_required: false,
//   admission_type: "new",
//   status: "active",
// };

// // ASSUMPTION: these are the common admission-type values — adjust to
// // match whatever your backend actually accepts if it differs.
// const ADMISSION_TYPES = ["new", "transfer", "re-admission"];

// // ASSUMPTION: this is a starting set of common subject groups/streams.
// // Swap for whatever list your school actually uses, or replace the
// // <select> with a free-text <input> if it isn't a fixed set server-side.
// const SUBJECT_GROUPS = ["Science", "Commerce", "Arts", "General"];

// // Some "get by id" endpoints return joined objects (e.g. { id, name })
// // for foreign-key fields instead of a plain id. This safely extracts a
// // plain id either way.
// function idOf(value) {
//   if (value == null) return "";
//   if (typeof value === "object") return value.id ?? "";
//   return value;
// }

// /**
//  * Add/edit form for a single student admission record.
//  *
//  * NOTE ON `section`: unlike ClassSection, this endpoint's `section` field
//  * is a plain string (e.g. "A"), not a section_id foreign key — see your
//  * sample payload. The dropdown below still uses your Sections list to
//  * populate the options (scoped to the selected class), but submits the
//  * section's *name*, not its id.
//  *
//  * NOTE ON SCHOOL SCOPING: your sample payload has no school_id field at
//  * all. This form still lets an admin pick a school to correctly scope
//  * the Student/Class/Section/Academic Year dropdowns (the same way other
//  * forms in this app do), but does NOT include school_id in the submitted
//  * payload, since your backend likely infers it from student_id/class_id
//  * server-side. If it actually does need school_id explicitly, tell me
//  * and I'll add it back into the submit payload.
//  *
//  * @param {object|null} initialData
//  * @param {(payload: object) => void} onSubmit
//  * @param {() => void} onCancel
//  * @param {boolean} submitting
//  */
// export default function StudentAdmissionForm({
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

//   const { students = [], loading: studentsLoading } = useSelector(
//     (state) => state.students,
//   );
//   const { classes = [], loading: classesLoading } = useSelector(
//     (state) => state.classes,
//   );
//   const { sections = [], loading: sectionsLoading } = useSelector(
//     (state) => state.sections,
//   );
//   const { academicYears = [], loading: yearsLoading } = useSelector(
//     (state) => state.academicYears,
//   );

//   const isEdit = Boolean(initialData?.id);
//   const [data, setData] = useState(EMPTY);
//   const [errors, setErrors] = useState({});

//   const effectiveSchoolId = isAdmin ? data.school_id : schoolId;

//   useEffect(() => {
//     if (isAdmin) dispatch(fetchSchools());
//   }, [dispatch, isAdmin]);

//   // Re-fetch the dependent lists whenever the effective school changes,
//   // passing it along in case these thunks accept a school_id argument to
//   // filter server-side (same assumption as ClassSectionForm — harmless if
//   // the thunk ignores the extra argument).
//   useEffect(() => {
//     if (isAdmin && !effectiveSchoolId) return;
//     dispatch(fetchStudents(effectiveSchoolId));
//     dispatch(fetchClasses(effectiveSchoolId));
//     dispatch(fetchSections(effectiveSchoolId));
//     dispatch(fetchAcademicYears(effectiveSchoolId));
//   }, [dispatch, isAdmin, effectiveSchoolId]);

//   // Resets the form only when switching between add/edit targets — not
//   // whenever schoolId/isAdmin change (those come from an async auth fetch
//   // and could otherwise flip mid-edit and wipe what the user typed).
//   useEffect(() => {
//     if (initialData) {
//       setData({
//         school_id: idOf(initialData.school_id),
//         student_id: idOf(initialData.student_id),
//         academic_year_id: idOf(initialData.academic_year_id),
//         class_id: idOf(initialData.class_id),
//         section: initialData.section || "",
//         joining_date: initialData.joining_date
//           ? String(initialData.joining_date).slice(0, 10)
//           : "",
//         subject_group: initialData.subject_group || "",
//         transport_required: Boolean(
//           initialData.transport_required === 1 ||
//           initialData.transport_required === true,
//         ),
//         hostel_required: Boolean(
//           initialData.hostel_required === 1 ||
//           initialData.hostel_required === true,
//         ),
//         admission_type: initialData.admission_type || "new",
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
//     const value = e.target.value;
//     setData((d) => ({ ...d, [key]: value }));
//     if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
//   };

//   const toggle = (key) => (e) => {
//     setData((d) => ({ ...d, [key]: e.target.checked }));
//   };

//   // Changing the class atomically clears the section selection in the
//   // SAME state update, since a previously-picked section may not belong
//   // to the new class. Only fires from real user interaction — never from
//   // the initialData load effect — so it can't race against that effect.
//   const handleClassChange = (e) => {
//     const value = e.target.value;
//     setData((d) => ({ ...d, class_id: value, section: "" }));
//     setErrors((er) => ({ ...er, class_id: null, section: null }));
//   };

//   const scopedTo = (list) =>
//     !effectiveSchoolId
//       ? list
//       : list.filter(
//           (item) =>
//             item.school_id == null ||
//             String(item.school_id) === String(effectiveSchoolId),
//         );

//   const filteredStudents = scopedTo(students);
//   const filteredClasses = scopedTo(classes);
//   // Sections belong to a specific class — narrow further once a class is
//   // picked (see the same fix applied in ClassSectionForm).
//   const filteredSections = scopedTo(sections).filter(
//     (s) =>
//       !data.class_id ||
//       s.class_id == null ||
//       String(s.class_id) === String(data.class_id),
//   );
//   const filteredAcademicYears = scopedTo(academicYears);

//   const needsSchoolFirst = isAdmin && !effectiveSchoolId;
//   const needsClassFirst = !needsSchoolFirst && !data.class_id;

//   const validate = () => {
//     const e = {};
//     if (isAdmin && !data.school_id) e.school_id = "Please select a school";
//     if (!data.student_id) e.student_id = "Student is required";
//     if (!data.academic_year_id)
//       e.academic_year_id = "Academic year is required";
//     if (!data.class_id) e.class_id = "Class is required";
//     if (!data.section.trim()) e.section = "Section is required";
//     if (!data.joining_date) e.joining_date = "Joining date is required";
//     if (!data.admission_type) e.admission_type = "Admission type is required";

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     onSubmit({
//       student_id: Number(data.student_id),
//       academic_year_id: Number(data.academic_year_id),
//       class_id: Number(data.class_id),
//       section: data.section,
//       joining_date: data.joining_date,
//       subject_group: data.subject_group || null,
//       transport_required: data.transport_required,
//       hostel_required: data.hostel_required,
//       admission_type: data.admission_type,
//       status: data.status,
//     });
//   };

//   const inputCls = (key) =>
//     `sa-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors[key] ? "sa-input-error" : ""}`;

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//       {isAdmin && (
//         <div className="flex flex-col gap-1.5">
//           <label className="sa-field-label text-[13px] font-medium">
//             School <span className="sa-field-required">*</span>
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
//               <p className="sa-field-error text-[11px]">{errors.school_id}</p>
//             )}
//           </div>
//         </div>
//       )}

//       <div className="flex flex-col gap-1.5">
//         <label className="sa-field-label text-[13px] font-medium">
//           Student <span className="sa-field-required">*</span>
//         </label>
//         <select
//           className={inputCls("student_id")}
//           value={data.student_id}
//           onChange={set("student_id")}
//           disabled={studentsLoading || needsSchoolFirst}
//         >
//           <option value="">
//             {needsSchoolFirst
//               ? "Select a school first"
//               : studentsLoading
//                 ? "Loading..."
//                 : "Select Student"}
//           </option>
//           {filteredStudents.map((s) => (
//             <option key={s.id} value={s.id}>
//               {s.first_name} {s.last_name || ""}
//               {s.admission_number ? ` (${s.admission_number})` : ""}
//             </option>
//           ))}
//         </select>
//         <div className="h-4">
//           {errors.student_id && (
//             <p className="sa-field-error text-[11px]">{errors.student_id}</p>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div className="flex flex-col gap-1.5">
//           <label className="sa-field-label text-[13px] font-medium">
//             Academic Year <span className="sa-field-required">*</span>
//           </label>
//           <select
//             className={inputCls("academic_year_id")}
//             value={data.academic_year_id}
//             onChange={set("academic_year_id")}
//             disabled={yearsLoading || needsSchoolFirst}
//           >
//             <option value="">
//               {needsSchoolFirst
//                 ? "Select a school first"
//                 : yearsLoading
//                   ? "Loading..."
//                   : "Select Academic Year"}
//             </option>
//             {filteredAcademicYears.map((y) => (
//               <option key={y.id} value={y.id}>
//                 {y.name}
//               </option>
//             ))}
//           </select>
//           <div className="h-4">
//             {errors.academic_year_id && (
//               <p className="sa-field-error text-[11px]">
//                 {errors.academic_year_id}
//               </p>
//             )}
//           </div>
//         </div>

//         <div className="flex flex-col gap-1.5">
//           <label className="sa-field-label text-[13px] font-medium">
//             Class <span className="sa-field-required">*</span>
//           </label>
//           <select
//             className={inputCls("class_id")}
//             value={data.class_id}
//             onChange={handleClassChange}
//             disabled={classesLoading || needsSchoolFirst}
//           >
//             <option value="">
//               {needsSchoolFirst
//                 ? "Select a school first"
//                 : classesLoading
//                   ? "Loading..."
//                   : "Select Class"}
//             </option>
//             {filteredClasses.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.name}
//               </option>
//             ))}
//           </select>
//           <div className="h-4">
//             {errors.class_id && (
//               <p className="sa-field-error text-[11px]">{errors.class_id}</p>
//             )}
//           </div>
//         </div>

//         <div className="flex flex-col gap-1.5">
//           <label className="sa-field-label text-[13px] font-medium">
//             Section <span className="sa-field-required">*</span>
//           </label>
//           <select
//             className={inputCls("section")}
//             value={data.section}
//             onChange={set("section")}
//             disabled={sectionsLoading || needsSchoolFirst || needsClassFirst}
//           >
//             <option value="">
//               {needsSchoolFirst
//                 ? "Select a school first"
//                 : needsClassFirst
//                   ? "Select a class first"
//                   : sectionsLoading
//                     ? "Loading..."
//                     : "Select Section"}
//             </option>
//             {filteredSections.map((s) => (
//               <option key={s.id} value={s.section_name}>
//                 {s.section_name}
//               </option>
//             ))}
//           </select>
//           <div className="h-4">
//             {errors.section && (
//               <p className="sa-field-error text-[11px]">{errors.section}</p>
//             )}
//           </div>
//         </div>

//         <div className="flex flex-col gap-1.5">
//           <label className="sa-field-label text-[13px] font-medium">
//             Joining Date <span className="sa-field-required">*</span>
//           </label>
//           <input
//             type="date"
//             className={inputCls("joining_date")}
//             value={data.joining_date}
//             onChange={set("joining_date")}
//           />
//           <div className="h-4">
//             {errors.joining_date && (
//               <p className="sa-field-error text-[11px]">
//                 {errors.joining_date}
//               </p>
//             )}
//           </div>
//         </div>

//         <div className="flex flex-col gap-1.5">
//           <label className="sa-field-label text-[13px] font-medium">
//             Subject Group
//           </label>
//           <select
//             className="sa-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
//             value={data.subject_group}
//             onChange={set("subject_group")}
//           >
//             <option value="">None</option>
//             {SUBJECT_GROUPS.map((g) => (
//               <option key={g} value={g}>
//                 {g}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex flex-col gap-1.5">
//           <label className="sa-field-label text-[13px] font-medium">
//             Admission Type <span className="sa-field-required">*</span>
//           </label>
//           <select
//             className={inputCls("admission_type")}
//             value={data.admission_type}
//             onChange={set("admission_type")}
//           >
//             {ADMISSION_TYPES.map((t) => (
//               <option key={t} value={t}>
//                 {t.charAt(0).toUpperCase() + t.slice(1)}
//               </option>
//             ))}
//           </select>
//           <div className="h-4">
//             {errors.admission_type && (
//               <p className="sa-field-error text-[11px]">
//                 {errors.admission_type}
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="flex flex-wrap gap-4">
//         <label className="sa-checkbox-row flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium cursor-pointer transition-colors">
//           <input
//             type="checkbox"
//             className="sa-checkbox w-4 h-4 rounded"
//             checked={data.transport_required}
//             onChange={toggle("transport_required")}
//           />
//           Transport Required
//         </label>
//         <label className="sa-checkbox-row flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium cursor-pointer transition-colors">
//           <input
//             type="checkbox"
//             className="sa-checkbox w-4 h-4 rounded"
//             checked={data.hostel_required}
//             onChange={toggle("hostel_required")}
//           />
//           Hostel Required
//         </label>
//       </div>

//       {isEdit && (
//         <div className="flex flex-col gap-1.5">
//           <label className="sa-field-label text-[13px] font-medium">
//             Status
//           </label>
//           <div className="flex gap-2">
//             {["active", "inactive"].map((s) => (
//               <button
//                 key={s}
//                 type="button"
//                 onClick={() => setData((d) => ({ ...d, status: s }))}
//                 className={`sa-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
//                   data.status === s
//                     ? s === "active"
//                       ? "sa-status-toggle-active"
//                       : "sa-status-toggle-inactive"
//                     : ""
//                 }`}
//               >
//                 {s}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       <div className="sa-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="sa-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={submitting}
//           className="sa-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
//         >
//           {submitting && <Loader2 size={14} className="animate-spin" />}
//           {isEdit ? "Update Admission" : "Create Admission"}
//         </button>
//       </div>
//     </form>
//   );
// }

/*-------------------------------------------------------------------*/

import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
// ASSUMPTION: fetchStudents follows the same naming pattern as the other
// list thunks in this app (fetchEmployees, fetchAcademicYears, etc).
// Adjust this import + export name if studentSlice.js uses a different
// thunk name for listing students.
import { getStudents as fetchStudents } from "../../../redux/student/studentSlice.js";
import { fetchClasses } from "../../../redux/schoolSetup/class/classSlice.js";
import { fetchSections } from "../../../redux/schoolSetup/section/sectionSlice.js";
import { fetchAcademicYears } from "../../../redux/schoolSetup/academic-year/academicYearSlice.js";
import SearchableSelect from "../../../common/components/search/SearchableSelect.jsx";

const EMPTY = {
  school_id: "",
  student_id: "",
  academic_year_id: "",
  class_id: "",
  section: "",
  joining_date: "",
  subject_group: "",
  transport_required: false,
  hostel_required: false,
  admission_type: "new",
  status: "active",
};

// ASSUMPTION: these are the common admission-type values — adjust to
// match whatever your backend actually accepts if it differs.
const ADMISSION_TYPES = ["new", "transfer", "re-admission"];

// ASSUMPTION: this is a starting set of common subject groups/streams.
// Swap for whatever list your school actually uses, or replace the
// <select> with a free-text <input> if it isn't a fixed set server-side.
const SUBJECT_GROUPS = ["Science", "Commerce", "Arts", "General"];

// Some "get by id" endpoints return joined objects (e.g. { id, name })
// for foreign-key fields instead of a plain id. This safely extracts a
// plain id either way.
function idOf(value) {
  if (value == null) return "";
  if (typeof value === "object") return value.id ?? "";
  return value;
}

/**
 * Add/edit form for a single student admission record.
 *
 * NOTE ON `section`: unlike ClassSection, this endpoint's `section` field
 * is a plain string (e.g. "A"), not a section_id foreign key — see your
 * sample payload. The dropdown below still uses your Sections list to
 * populate the options (scoped to the selected class), but submits the
 * section's *name*, not its id.
 *
 * NOTE ON SCHOOL SCOPING: your sample payload has no school_id field at
 * all. This form still lets an admin pick a school to correctly scope
 * the Student/Class/Section/Academic Year dropdowns (the same way other
 * forms in this app do), but does NOT include school_id in the submitted
 * payload, since your backend likely infers it from student_id/class_id
 * server-side. If it actually does need school_id explicitly, tell me
 * and I'll add it back into the submit payload.
 *
 * @param {object|null} initialData
 * @param {(payload: object) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function StudentAdmissionForm({
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

  const { students = [], loading: studentsLoading } = useSelector(
    (state) => state.students,
  );
  const { classes = [], loading: classesLoading } = useSelector(
    (state) => state.classes,
  );
  const { sections = [], loading: sectionsLoading } = useSelector(
    (state) => state.sections,
  );
  const { academicYears = [], loading: yearsLoading } = useSelector(
    (state) => state.academicYears,
  );

  const isEdit = Boolean(initialData?.id);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const effectiveSchoolId = isAdmin ? data.school_id : schoolId;

  useEffect(() => {
    if (isAdmin) dispatch(fetchSchools());
  }, [dispatch, isAdmin]);

  // Re-fetch the dependent lists whenever the effective school changes,
  // passing it along in case these thunks accept a school_id argument to
  // filter server-side (same assumption as ClassSectionForm — harmless if
  // the thunk ignores the extra argument).
  useEffect(() => {
    if (isAdmin && !effectiveSchoolId) return;
    dispatch(fetchStudents(effectiveSchoolId));
    dispatch(fetchClasses(effectiveSchoolId));
    dispatch(fetchSections(effectiveSchoolId));
    dispatch(fetchAcademicYears(effectiveSchoolId));
  }, [dispatch, isAdmin, effectiveSchoolId]);

  // Resets the form only when switching between add/edit targets — not
  // whenever schoolId/isAdmin change (those come from an async auth fetch
  // and could otherwise flip mid-edit and wipe what the user typed).
  useEffect(() => {
    if (initialData) {
      setData({
        school_id: idOf(initialData.school_id),
        student_id: idOf(initialData.student_id),
        academic_year_id: idOf(initialData.academic_year_id),
        class_id: idOf(initialData.class_id),
        section: initialData.section || "",
        joining_date: initialData.joining_date
          ? String(initialData.joining_date).slice(0, 10)
          : "",
        subject_group: initialData.subject_group || "",
        transport_required: Boolean(
          initialData.transport_required === 1 ||
          initialData.transport_required === true,
        ),
        hostel_required: Boolean(
          initialData.hostel_required === 1 ||
          initialData.hostel_required === true,
        ),
        admission_type: initialData.admission_type || "new",
        status: initialData.status || "active",
      });
    } else {
      setData({ ...EMPTY, school_id: isAdmin ? "" : (schoolId ?? "") });
    }
    setErrors({});
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
    const value = e.target.value;
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const setValue = (key) => (value) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const toggle = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.checked }));
  };

  // Changing the class atomically clears the section selection in the
  // SAME state update, since a previously-picked section may not belong
  // to the new class. Only fires from real user interaction — never from
  // the initialData load effect — so it can't race against that effect.
  const handleClassChange = (e) => {
    const value = e.target.value;
    setData((d) => ({ ...d, class_id: value, section: "" }));
    setErrors((er) => ({ ...er, class_id: null, section: null }));
  };

  const scopedTo = (list) =>
    !effectiveSchoolId
      ? list
      : list.filter(
        (item) =>
          item.school_id == null ||
          String(item.school_id) === String(effectiveSchoolId),
      );

  const filteredStudents = scopedTo(students);
  const filteredClasses = scopedTo(classes);
  // Sections belong to a specific class — narrow further once a class is
  // picked (see the same fix applied in ClassSectionForm).
  const filteredSections = scopedTo(sections).filter(
    (s) =>
      !data.class_id ||
      s.class_id == null ||
      String(s.class_id) === String(data.class_id),
  );
  const filteredAcademicYears = scopedTo(academicYears);

  // Options for the searchable Student combobox — label is what gets
  // matched/highlighted as you type, sublabel (admission number) is
  // matched too but shown smaller underneath.
  const studentOptions = useMemo(
    () =>
      filteredStudents.map((s) => ({
        value: s.id,
        label: `${s.first_name} ${s.last_name || ""}`.trim(),
        sublabel: s.admission_number || "",
      })),
    [filteredStudents],
  );

  const needsSchoolFirst = isAdmin && !effectiveSchoolId;
  const needsClassFirst = !needsSchoolFirst && !data.class_id;

  const validate = () => {
    const e = {};
    if (isAdmin && !data.school_id) e.school_id = "Please select a school";
    if (!data.student_id) e.student_id = "Student is required";
    if (!data.academic_year_id)
      e.academic_year_id = "Academic year is required";
    if (!data.class_id) e.class_id = "Class is required";
    if (!data.section.trim()) e.section = "Section is required";
    if (!data.joining_date) e.joining_date = "Joining date is required";
    if (!data.admission_type) e.admission_type = "Admission type is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      student_id: Number(data.student_id),
      academic_year_id: Number(data.academic_year_id),
      class_id: Number(data.class_id),
      section: data.section,
      joining_date: data.joining_date,
      subject_group: data.subject_group || null,
      transport_required: data.transport_required,
      hostel_required: data.hostel_required,
      admission_type: data.admission_type,
      status: data.status,
    });
  };

  const inputCls = (key) =>
    `sa-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors[key] ? "sa-input-error" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="sa-field-label text-[13px] font-medium">
            School <span className="sa-field-required">*</span>
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
              <p className="sa-field-error text-[11px]">{errors.school_id}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="sa-field-label text-[13px] font-medium">
          Student <span className="sa-field-required">*</span>
        </label>

        <SearchableSelect
          options={studentOptions}
          value={data.student_id}
          onChange={setValue("student_id")}
          placeholder={needsSchoolFirst ? "Select a school first" : "Select Student"}
          disabled={studentsLoading || needsSchoolFirst}
          loading={studentsLoading}
          loadingText="Loading students…"
          hasError={Boolean(errors.student_id)}
        />

        <div className="h-4">
          {errors.student_id && (
            <p className="sa-field-error text-[11px]">
              {errors.student_id}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="sa-field-label text-[13px] font-medium">
            Academic Year <span className="sa-field-required">*</span>
          </label>
          <select
            className={inputCls("academic_year_id")}
            value={data.academic_year_id}
            onChange={set("academic_year_id")}
            disabled={yearsLoading || needsSchoolFirst}
          >
            <option value="">
              {needsSchoolFirst
                ? "Select a school first"
                : yearsLoading
                  ? "Loading..."
                  : "Select Academic Year"}
            </option>
            {filteredAcademicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
          <div className="h-4">
            {errors.academic_year_id && (
              <p className="sa-field-error text-[11px]">
                {errors.academic_year_id}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sa-field-label text-[13px] font-medium">
            Class <span className="sa-field-required">*</span>
          </label>
          <select
            className={inputCls("class_id")}
            value={data.class_id}
            onChange={handleClassChange}
            disabled={classesLoading || needsSchoolFirst}
          >
            <option value="">
              {needsSchoolFirst
                ? "Select a school first"
                : classesLoading
                  ? "Loading..."
                  : "Select Class"}
            </option>
            {filteredClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="h-4">
            {errors.class_id && (
              <p className="sa-field-error text-[11px]">{errors.class_id}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sa-field-label text-[13px] font-medium">
            Section <span className="sa-field-required">*</span>
          </label>
          <select
            className={inputCls("section")}
            value={data.section}
            onChange={set("section")}
            disabled={sectionsLoading || needsSchoolFirst || needsClassFirst}
          >
            <option value="">
              {needsSchoolFirst
                ? "Select a school first"
                : needsClassFirst
                  ? "Select a class first"
                  : sectionsLoading
                    ? "Loading..."
                    : "Select Section"}
            </option>
            {filteredSections.map((s) => (
              <option key={s.id} value={s.section_name}>
                {s.section_name}
              </option>
            ))}
          </select>
          <div className="h-4">
            {errors.section && (
              <p className="sa-field-error text-[11px]">{errors.section}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sa-field-label text-[13px] font-medium">
            Joining Date <span className="sa-field-required">*</span>
          </label>
          <input
            type="date"
            className={inputCls("joining_date")}
            value={data.joining_date}
            onChange={set("joining_date")}
          />
          <div className="h-4">
            {errors.joining_date && (
              <p className="sa-field-error text-[11px]">
                {errors.joining_date}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sa-field-label text-[13px] font-medium">
            Subject Group
          </label>
          <select
            className="sa-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
            value={data.subject_group}
            onChange={set("subject_group")}
          >
            <option value="">None</option>
            {SUBJECT_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sa-field-label text-[13px] font-medium">
            Admission Type <span className="sa-field-required">*</span>
          </label>
          <select
            className={inputCls("admission_type")}
            value={data.admission_type}
            onChange={set("admission_type")}
          >
            {ADMISSION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <div className="h-4">
            {errors.admission_type && (
              <p className="sa-field-error text-[11px]">
                {errors.admission_type}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="sa-checkbox-row flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium cursor-pointer transition-colors">
          <input
            type="checkbox"
            className="sa-checkbox w-4 h-4 rounded"
            checked={data.transport_required}
            onChange={toggle("transport_required")}
          />
          Transport Required
        </label>
        <label className="sa-checkbox-row flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium cursor-pointer transition-colors">
          <input
            type="checkbox"
            className="sa-checkbox w-4 h-4 rounded"
            checked={data.hostel_required}
            onChange={toggle("hostel_required")}
          />
          Hostel Required
        </label>
      </div>

      {isEdit && (
        <div className="flex flex-col gap-1.5">
          <label className="sa-field-label text-[13px] font-medium">
            Status
          </label>
          <div className="flex gap-2">
            {["active", "inactive"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setData((d) => ({ ...d, status: s }))}
                className={`sa-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${data.status === s
                  ? s === "active"
                    ? "sa-status-toggle-active"
                    : "sa-status-toggle-inactive"
                  : ""
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="sa-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="sa-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="sa-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Update Admission" : "Create Admission"}
        </button>
      </div>
    </form>
  );
}
