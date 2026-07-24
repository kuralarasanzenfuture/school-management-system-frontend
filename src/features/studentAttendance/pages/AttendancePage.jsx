// import React, { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//     ClipboardCheck,
//     Lock,
//     Unlock,
//     CheckCheck,
//     Save,
// } from "lucide-react";
// import {
//     fetchAttendanceByToken,
//     addAttendance,
//     lockSession,
//     unlockSession,
// } from "../../../redux/studentAttendance/studentAttendanceSlice.js";
// import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
// // ASSUMPTION: a class-sections list slice already exists in this app (the
// // sidebar has a "Class Sections" page) — adjust the import path/thunk
// // name/state shape if it's different. Expected shape per item:
// // { id, class_name, section_name, school_id }.
// import { fetchClassSections } from "../../../redux/schoolSetup/class-sections/classSectionSlice.js";
// import AttendanceTable from "../components/AttendanceTable.jsx";
// import "../styles/Attendance.css";

// const STATUS_OPTIONS = ["present", "absent", "late", "half_day", "leave"];

// function todayISO() {
//     return new Date().toISOString().slice(0, 10);
// }

// export default function AttendancePage() {
//     const dispatch = useDispatch();

//     const { user } = useSelector((state) => state.auth);
//     const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
//     const fixedSchoolId = isAdmin ? null : user?.school_id;

//     const schools = useSelector((state) => state.schoolProfile?.schools);


//     const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

//     const classSections = useSelector((state) => state.classSections?.classSections ?? []);
//     const classSectionsLoading = useSelector((state) => state.classSections?.loading ?? false);

//     const tokenAttendances = useSelector((state) => state.studentAttendance?.tokenAttendances ?? []);
//     const loading = useSelector((state) => state.studentAttendance?.loading ?? false);
//     const submitting = useSelector((state) => state.studentAttendance?.submitting ?? false);

//     const [selectedSchool, setSelectedSchool] = useState("");
//     // console.log("selectedSchool:", selectedSchool);
//     const [classSectionId, setClassSectionId] = useState("");
//     // console.log("classSectionId:", classSectionId);
//     const [date, setDate] = useState(todayISO());
//     const [attendanceType, setAttendanceType] = useState("daily");
//     const [periodNo, setPeriodNo] = useState("");
//     const [sessionRemarks, setSessionRemarks] = useState("");

//     // Local, editable copy of the roster — seeded from tokenAttendances
//     // whenever the fetch resolves, then edited in place as the user taps
//     // status buttons / types remarks, and only sent back on Save.
//     const [rows, setRows] = useState([]);


//     const effectiveSchoolId = isAdmin ? selectedSchool : fixedSchoolId;

//     useEffect(() => {
//         if (isAdmin) dispatch(fetchSchools());
//     }, [dispatch, isAdmin]);

//     useEffect(() => {
//         if (isAdmin && !effectiveSchoolId) return;
//         dispatch(fetchClassSections(effectiveSchoolId));
//     }, [dispatch, isAdmin, effectiveSchoolId]);

//     const scopedClassSections = useMemo(() => {
//         if (!effectiveSchoolId) return classSections;
//         return classSections.filter(
//             (cs) => cs.school_id == null || String(cs.school_id) === String(effectiveSchoolId),
//         );
//     }, [classSections, effectiveSchoolId]);

//     const needsSchoolFirst = isAdmin && !effectiveSchoolId;
//     const canLoadSheet =
//         !needsSchoolFirst &&
//         Boolean(classSectionId) &&
//         Boolean(date) &&
//         (attendanceType === "daily" || Boolean(periodNo));

//     /* ── Load the attendance sheet for the current filters ──
//        ASSUMPTION: getAllAttendanceByToken, given class_section_id + date
//        (+ period_no), returns one row PER ENROLLED STUDENT in that section —
//        with attendance_status/remarks/marked_by populated if already taken,
//        or null/absent defaults if not. That's what makes this a usable
//        "take attendance" screen in a single call. If your endpoint instead
//        only returns rows for students who already have a record (i.e. an
//        empty array on a never-taken date), you'll need a separate roster
//        endpoint — the rest of this page doesn't change, just where `rows`
//        gets seeded from. */
//     useEffect(() => {
//         if (!canLoadSheet) {
//             setRows([]);
//             return;
//         }
//         dispatch(
//             fetchAttendanceByToken({
//                 date,
//                 class_section_id: classSectionId,
//                 attendance_type: attendanceType,
//                 period_no: attendanceType === "period" ? periodNo : undefined,
//                 limit: 500,
//             }),
//         );
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [dispatch, canLoadSheet, date, classSectionId, attendanceType, periodNo]);

//     useEffect(() => {
//         if (!canLoadSheet) return;
//         setRows(
//             tokenAttendances.map((record) => ({
//                 // The GET response's `student_id` is what this page sends back
//                 // as `admission_id` on save — the mark payload only has
//                 // admission_id, and the schema's student_attendance table is
//                 // keyed on admission_id, not a bare student id. Confirm this
//                 // mapping is right for your API; if student_id and admission_id
//                 // can ever diverge for the same row, this needs its own field.
//                 admission_id: record.student_id,
//                 first_name: record.first_name,
//                 last_name: record.last_name,
//                 roll_no: record.roll_no,
//                 status: record.attendance_status || "present",
//                 remarks: record.remarks || "",
//                 sessionId: record.session_id,
//                 isLocked: Boolean(record.is_locked),
//             })),
//         );
//         setSessionRemarks((prev) => prev || "");
//     }, [tokenAttendances, canLoadSheet]);

//     console.log(tokenAttendances);

//     const sessionId = rows.find((r) => r.sessionId)?.sessionId ?? null;
//     const isLocked = rows.some((r) => r.isLocked);

//     const setRowStatus = (admissionId, status) => {
//         setRows((prev) =>
//             prev.map((r) => (r.admission_id === admissionId ? { ...r, status } : r)),
//         );
//     };
//     const setRowRemarks = (admissionId, remarks) => {
//         setRows((prev) =>
//             prev.map((r) => (r.admission_id === admissionId ? { ...r, remarks } : r)),
//         );
//     };
//     const markAllPresent = () => {
//         setRows((prev) => prev.map((r) => ({ ...r, status: "present" })));
//     };

//     const handleSave = async () => {
//         if (!rows.length) return;
//         const payload = {
//             class_section_id: Number(classSectionId),
//             attendance_date: date,
//             attendance_type: attendanceType,
//             period_no: attendanceType === "period" ? Number(periodNo) : null,
//             remarks: sessionRemarks.trim() || null,
//             students: rows.map((r) => ({
//                 admission_id: r.admission_id,
//                 status: r.status,
//                 ...(r.remarks ? { remarks: r.remarks } : {}),
//             })),
//         };
//         try {
//             await dispatch(addAttendance(payload)).unwrap();
//             dispatch(
//                 fetchAttendanceByToken({
//                     date,
//                     class_section_id: classSectionId,
//                     attendance_type: attendanceType,
//                     period_no: attendanceType === "period" ? periodNo : undefined,
//                     limit: 500,
//                 }),
//             );
//         } catch (err) {
//             alert(err?.message ?? String(err));
//         }
//     };

//     const handleToggleLock = async () => {
//         if (!sessionId) return;
//         try {
//             if (isLocked) {
//                 await dispatch(unlockSession(sessionId)).unwrap();
//             } else {
//                 await dispatch(lockSession(sessionId)).unwrap();
//             }
//             dispatch(
//                 fetchAttendanceByToken({
//                     date,
//                     class_section_id: classSectionId,
//                     attendance_type: attendanceType,
//                     period_no: attendanceType === "period" ? periodNo : undefined,
//                     limit: 500,
//                 }),
//             );
//         } catch (err) {
//             alert(err?.message ?? String(err));
//         }
//     };

//     const presentCount = rows.filter((r) => r.status === "present").length;

//     console.log("selectedSchool:", selectedSchool);
//     console.log("classSectionId:", classSectionId);
//     console.log("date:", date);
//     console.log("attendanceType:", attendanceType);
//     console.log("periodNo:", periodNo);
//     console.log("sessionRemarks:", sessionRemarks);
//     console.log("rows:", rows);

//     console.log({
//         canLoadSheet,
//         classSectionId,
//         date,
//         attendanceType,
//         periodNo,
//     });

//     return (
//         <div className="at-page min-h-screen p-6">
//             {/* ── Header ── */}
//             <div className="flex items-start justify-between mb-6">
//                 <div>
//                     <h1 className="at-title text-2xl font-bold">Attendance</h1>
//                     <p className="at-subtitle text-[13.5px] mt-1">
//                         Mark or review daily attendance for a class section.
//                     </p>
//                 </div>
//                 {rows.length > 0 && (
//                     <div className="flex items-center gap-3">
//                         {sessionId && (
//                             <button
//                                 onClick={handleToggleLock}
//                                 className={`at-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ${isLocked ? "at-btn-locked" : ""
//                                     }`}
//                             >
//                                 {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
//                                 {isLocked ? "Unlock" : "Lock"}
//                             </button>
//                         )}
//                         <button
//                             onClick={markAllPresent}
//                             disabled={isLocked}
//                             className="at-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             <CheckCheck size={16} /> Mark all present
//                         </button>
//                         <button
//                             onClick={handleSave}
//                             disabled={isLocked || submitting}
//                             className="at-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             <Save size={16} />
//                             {submitting ? "Saving…" : "Save Attendance"}
//                         </button>
//                     </div>
//                 )}
//             </div>

//             {/* ── Filter bar ── */}
//             <div className="at-filter-bar flex flex-wrap items-end gap-3 rounded-2xl px-4 py-3 mb-6">
//                 {isAdmin && (
//                     <div className="flex flex-col gap-1">
//                         <label className="at-filter-label text-[11.5px] font-semibold">School</label>
//                         <select
//                             value={selectedSchool}
//                             onChange={(e) => {
//                                 setSelectedSchool(e.target.value);
//                                 setClassSectionId("");
//                             }}
//                             className="at-select px-3 py-2 rounded-lg text-[13px] min-w-[200px]"
//                             disabled={schoolsLoading}
//                         >
//                             <option value="">Select a school</option>
//                             {schools.map((s) => (
//                                 <option key={s.id} value={s.id}>{s.name}</option>
//                             ))}
//                         </select>
//                     </div>
//                 )}

//                 <div className="flex flex-col gap-1">
//                     <label className="at-filter-label text-[11.5px] font-semibold">Class Section</label>
//                     <select
//                         value={classSectionId}
//                         onChange={(e) => setClassSectionId(e.target.value)}
//                         className="at-select px-3 py-2 rounded-lg text-[13px] min-w-[180px]"
//                         disabled={needsSchoolFirst || classSectionsLoading}
//                     >
//                         <option value="">
//                             {needsSchoolFirst
//                                 ? "Select a school first"
//                                 : classSectionsLoading
//                                     ? "Loading…"
//                                     : "Select class section"}
//                         </option>
//                         {scopedClassSections.map((cs) => (
//                             <option key={cs.id} value={cs.id}>
//                                 {cs.class_name} — {cs.section_name}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 <div className="flex flex-col gap-1">
//                     <label className="at-filter-label text-[11.5px] font-semibold">Date</label>
//                     <input
//                         type="date"
//                         value={date}
//                         onChange={(e) => setDate(e.target.value)}
//                         className="at-select px-3 py-2 rounded-lg text-[13px]"
//                     />
//                 </div>

//                 <div className="flex flex-col gap-1">
//                     <label className="at-filter-label text-[11.5px] font-semibold">Type</label>
//                     <select
//                         value={attendanceType}
//                         onChange={(e) => setAttendanceType(e.target.value)}
//                         className="at-select px-3 py-2 rounded-lg text-[13px]"
//                     >
//                         <option value="daily">Daily</option>
//                         <option value="period">Period</option>
//                     </select>
//                 </div>

//                 {attendanceType === "period" && (
//                     <div className="flex flex-col gap-1">
//                         <label className="at-filter-label text-[11.5px] font-semibold">Period No.</label>
//                         <input
//                             type="number"
//                             min="1"
//                             max="12"
//                             value={periodNo}
//                             onChange={(e) => setPeriodNo(e.target.value)}
//                             placeholder="e.g. 3"
//                             className="at-select px-3 py-2 rounded-lg text-[13px] w-24"
//                         />
//                     </div>
//                 )}

//                 {rows.length > 0 && (
//                     <div className="ml-auto flex items-center gap-2">
//                         {isLocked && (
//                             <span className="at-locked-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold">
//                                 <Lock size={12} /> Locked
//                             </span>
//                         )}
//                         <span className="at-count-text text-[12.5px]">
//                             {presentCount}/{rows.length} present
//                         </span>
//                     </div>
//                 )}
//             </div>

//             {/* ── Content ── */}
//             {!canLoadSheet ? (
//                 <div className="at-empty-card rounded-2xl p-14 text-center">
//                     <ClipboardCheck size={32} className="at-empty-icon mx-auto mb-3" />
//                     <p className="at-empty-title text-[14px] font-semibold mb-1">
//                         {needsSchoolFirst ? "Select a school to get started" : "Select a class section and date"}
//                     </p>
//                     <p className="at-empty-desc text-[13px]">
//                         {attendanceType === "period" && !periodNo
//                             ? "A period number is required for period-wise attendance."
//                             : "Pick the filters above to load the attendance sheet."}
//                     </p>
//                 </div>
//             ) : loading ? (
//                 <div className="at-empty-card rounded-2xl p-14 text-center">
//                     <p className="at-empty-title text-[14px] font-semibold">Loading attendance sheet…</p>
//                 </div>
//             ) : rows.length === 0 ? (
//                 <div className="at-empty-card rounded-2xl p-14 text-center">
//                     <ClipboardCheck size={32} className="at-empty-icon mx-auto mb-3" />
//                     <p className="at-empty-title text-[14px] font-semibold mb-1">No students found</p>
//                     <p className="at-empty-desc text-[13px]">
//                         This class section has no enrolled students for this date, or the roster couldn't be loaded.
//                     </p>
//                 </div>
//             ) : (
//                 <>
//                     <AttendanceTable
//                         rows={rows}
//                         statusOptions={STATUS_OPTIONS}
//                         isLocked={isLocked}
//                         setRowStatus={setRowStatus}
//                         setRowRemarks={setRowRemarks}
//                     />

//                     <div className="at-remarks-card rounded-2xl px-5 py-4 mt-4">
//                         <label className="at-filter-label text-[12px] font-semibold mb-1.5 block">
//                             Session remarks (optional)
//                         </label>
//                         <textarea
//                             rows={2}
//                             disabled={isLocked}
//                             value={sessionRemarks}
//                             onChange={(e) => setSessionRemarks(e.target.value)}
//                             placeholder="e.g. Morning attendance, assembly delay…"
//                             className="at-select w-full px-3 py-2.5 rounded-lg text-[13.5px] disabled:opacity-60"
//                         />
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
    ClipboardCheck,
    Lock,
    Unlock,
    CheckCheck,
    Save,
    CheckCircle2,
} from "lucide-react";
import {
    fetchAttendanceByToken,
    addAttendance,
    lockSession,
    unlockSession,
} from "../../../redux/studentAttendance/studentAttendanceSlice.js";
import { fetchClassStudentSummaryByToken } from "../../../redux/studentsAdmission/studentAdmissionSlice.js";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { fetchClasses } from "../../../redux/schoolSetup/class/classSlice.js";
import { fetchSections } from "../../../redux/schoolSetup/section/sectionSlice.js";
import { fetchAcademicYears } from "../../../redux/schoolSetup/academic-year/academicYearSlice.js";
import AttendanceTable from "../components/AttendanceTable.jsx";
import "../styles/Attendance.css";

const STATUS_OPTIONS = ["present", "absent", "late", "half_day", "leave"];

// Normalizes a raw attendance_status value from the backend so it matches
// one of STATUS_OPTIONS. Backends commonly return "PRESENT", "Half-Day",
// "half_day", "absent ", etc. Deliberately does NOT default an empty/null
// value to "present" — an unmarked student should show with no status
// selected at all, not be silently assumed present (see handleSave, which
// now blocks submission until every row has an explicit status).
const normalizeStatus = (raw) => {
    if (!raw) return "";
    const cleaned = String(raw).trim().toLowerCase().replace(/-/g, "_");
    return STATUS_OPTIONS.includes(cleaned) ? cleaned : "";
};

// Stable references for "nothing here yet" — reused as-is on every render
// instead of a fresh `[]` literal, which is what caused the infinite
// render loop.
const EMPTY_ARRAY = [];

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const fixedSchoolId = isAdmin ? null : user?.school_id;

    const schools = useSelector((state) => state.schoolProfile?.schools ?? EMPTY_ARRAY);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

    const classes = useSelector((state) => state.classes?.classes ?? EMPTY_ARRAY);
    const classesLoading = useSelector((state) => state.classes?.loading ?? false);

    const sections = useSelector((state) => state.sections?.sections ?? EMPTY_ARRAY);
    const sectionsLoading = useSelector((state) => state.sections?.loading ?? false);

    const academicYears = useSelector((state) => state.academicYears?.academicYears ?? EMPTY_ARRAY);
    const yearsLoading = useSelector((state) => state.academicYears?.loading ?? false);

    const classStudentSummary = useSelector(
        (state) => state.studentAdmissions?.classStudentSummary ?? EMPTY_ARRAY,
    );
    const rosterLoading = useSelector((state) => state.studentAdmissions?.loading ?? false);

    // Mounted at state.studentAttendance (confirmed against store.js).
    const tokenAttendances = useSelector((state) => state.studentAttendance?.tokenAttendances ?? EMPTY_ARRAY);
    const attendanceLoading = useSelector((state) => state.studentAttendance?.loading ?? false);
    const submitting = useSelector((state) => state.studentAttendance?.submitting ?? false);

    const [selectedSchool, setSelectedSchool] = useState("");
    const [classId, setClassId] = useState("");
    const [section, setSection] = useState("");
    const [academicYearId, setAcademicYearId] = useState("");
    const [date, setDate] = useState(todayISO());
    const [attendanceType, setAttendanceType] = useState("daily");
    const [periodNo, setPeriodNo] = useState("");
    const [sessionRemarks, setSessionRemarks] = useState("");
    const [saveError, setSaveError] = useState("");
    const [showSavedToast, setShowSavedToast] = useState(false);

    const [rows, setRows] = useState([]);

    const effectiveSchoolId = isAdmin ? selectedSchool : fixedSchoolId;

    useEffect(() => {
        if (isAdmin) dispatch(fetchSchools());
    }, [dispatch, isAdmin]);

    useEffect(() => {
        if (isAdmin && !effectiveSchoolId) return;
        dispatch(fetchClasses(effectiveSchoolId));
        dispatch(fetchAcademicYears(effectiveSchoolId));
    }, [dispatch, isAdmin, effectiveSchoolId]);

    useEffect(() => {
        if (isAdmin && !effectiveSchoolId) return;
        dispatch(fetchSections(effectiveSchoolId));
    }, [dispatch, isAdmin, effectiveSchoolId]);

    const scopedTo = (list) =>
        !effectiveSchoolId
            ? list
            : list.filter(
                (item) => item.school_id == null || String(item.school_id) === String(effectiveSchoolId),
            );

    const scopedClasses = useMemo(() => scopedTo(classes), [classes, effectiveSchoolId]);
    const scopedAcademicYears = useMemo(() => scopedTo(academicYears), [academicYears, effectiveSchoolId]);
    const scopedSections = useMemo(
        () =>
            scopedTo(sections).filter(
                (s) => !classId || s.class_id == null || String(s.class_id) === String(classId),
            ),
        [sections, effectiveSchoolId, classId],
    );

    const needsSchoolFirst = isAdmin && !effectiveSchoolId;
    const needsClassFirst = !needsSchoolFirst && !classId;
    const canLoadRoster =
        !needsSchoolFirst &&
        Boolean(classId) &&
        Boolean(section) &&
        Boolean(academicYearId);
    const canLoadSheet =
        canLoadRoster && Boolean(date) && (attendanceType === "daily" || Boolean(periodNo));

    const handleClassChange = (e) => {
        setClassId(e.target.value);
        setSection("");
    };

    /* ── 1. Load the class roster (not date-specific) ── */
    useEffect(() => {
        if (!canLoadRoster) return;
        dispatch(
            fetchClassStudentSummaryByToken({
                class_id: classId,
                section,
                academic_year_id: academicYearId,
                school_id: effectiveSchoolId,
                include_students: true,
            }),
        );
    }, [dispatch, canLoadRoster, classId, section, academicYearId, effectiveSchoolId]);

    /* ── 2. Load that date's existing marks, if any ── */
    useEffect(() => {
        if (!canLoadSheet) return;
        dispatch(
            fetchAttendanceByToken({
                date,
                class_id: classId,
                section,
                academic_year_id: academicYearId,
                school_id: effectiveSchoolId,
                attendance_type: attendanceType,
                period_no: attendanceType === "period" ? periodNo : undefined,
                limit: 500,
            }),
        );
    }, [dispatch, canLoadSheet, date, classId, section, academicYearId, effectiveSchoolId, attendanceType, periodNo]);

    /* ── 3. Merge roster + that date's marks into the editable `rows` ── */
    useEffect(() => {
        if (!canLoadSheet) {
            setRows([]);
            return;
        }

        const marksByAdmission = new Map(
            tokenAttendances.map((record) => [String(record.student_id), record]),
        );

        const sortedRoster = [...classStudentSummary].sort((a, b) => {
            const nameA = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim().toLowerCase();
            const nameB = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim().toLowerCase();
            const byName = nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
            if (byName !== 0) return byName;
            return String(a.roll_no ?? "").localeCompare(String(b.roll_no ?? ""), undefined, {
                numeric: true,
            });
        });

        setRows(
            sortedRoster.map((student) => {
                const admissionId = student.admission_id ?? student.id ?? student.student_admission_id;
                const mark = marksByAdmission.get(String(admissionId));
                return {
                    admission_id: admissionId,
                    class_id: student.class_id ?? classId,
                    section: student.section ?? section,
                    first_name: student.first_name,
                    last_name: student.last_name,
                    roll_no: student.roll_no,
                    // No default status — stays "" (unmarked) until the user picks
                    // one, or an existing saved mark provides it.
                    status: normalizeStatus(mark?.attendance_status),
                    remarks: mark?.remarks || "",
                    sessionId: mark?.session_id ?? null,
                    isLocked: Boolean(mark?.is_locked),
                };
            }),
        );
        setSessionRemarks((prev) => prev || "");
    }, [classStudentSummary, tokenAttendances, canLoadSheet, classId, section]);

    // THE CRASH: the table was rendered with `rows={filteredRows}`, a
    // variable that didn't exist anywhere in this file — every render past
    // this point threw a ReferenceError, which is why clicks looked like
    // they were landing on the wrong row/status (React was stuck re-showing
    // stale output after the error, not actually responding to your taps).
    // This is the real fix: a defensive filter that only keeps rows
    // actually belonging to the currently-selected class/section (in case
    // the roster endpoint ever returns extra students), computed from the
    // real `rows` state instead of a name that was never defined.
    const filteredRows = useMemo(
        () =>
            rows.filter(
                (r) =>
                    (!classId || String(r.class_id) === String(classId)) &&
                    (!section || String(r.section) === String(section)),
            ),
        [rows, classId, section],
    );

    const sessionId = rows.find((r) => r.sessionId)?.sessionId ?? null;
    const isLocked = rows.some((r) => r.isLocked);
    const loading = rosterLoading || attendanceLoading;

    const setRowStatus = (admissionId, status) => {
        setRows((prev) =>
            prev.map((r) => (r.admission_id === admissionId ? { ...r, status } : r)),
        );
        setSaveError("");
    };
    const setRowRemarks = (admissionId, remarks) => {
        setRows((prev) =>
            prev.map((r) => (r.admission_id === admissionId ? { ...r, remarks } : r)),
        );
    };
    const markAllPresent = () => {
        setRows((prev) => prev.map((r) => ({ ...r, status: "present" })));
        setSaveError("");
    };

    const refetchSheet = () => {
        dispatch(
            fetchAttendanceByToken({
                date,
                class_id: classId,
                section,
                academic_year_id: academicYearId,
                school_id: effectiveSchoolId,
                attendance_type: attendanceType,
                period_no: attendanceType === "period" ? periodNo : undefined,
                limit: 500,
            }),
        );
    };

    const handleSave = async () => {
        if (!filteredRows.length) return;

        // Status is no longer defaulted anywhere, so an unmarked row is a
        // real possibility now — block submission and point it out instead
        // of silently sending an empty status to the backend.
        const unmarked = filteredRows.filter((r) => !r.status);
        if (unmarked.length > 0) {
            setSaveError(
                `${unmarked.length} student${unmarked.length === 1 ? "" : "s"} still need${unmarked.length === 1 ? "s" : ""
                } a status before you can save.`,
            );
            return;
        }
        setSaveError("");

        const payload = {
            class_id: Number(classId),
            section,
            academic_year_id: Number(academicYearId),
            attendance_date: date,
            attendance_type: attendanceType,
            period_no: attendanceType === "period" ? Number(periodNo) : null,
            remarks: sessionRemarks.trim() || null,
            students: filteredRows.map((r) => ({
                admission_id: r.admission_id,
                status: r.status,
                ...(r.remarks ? { remarks: r.remarks } : {}),
            })),
        };

        // console.log("payload:", payload);

        try {
            await dispatch(addAttendance(payload)).unwrap();
            refetchSheet();
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 2400);
        } catch (err) {
            alert(err?.message ?? String(err));
        }
    };

    const handleToggleLock = async () => {
        if (!sessionId) return;
        try {
            if (isLocked) {
                await dispatch(unlockSession(sessionId)).unwrap();
            } else {
                await dispatch(lockSession(sessionId)).unwrap();
            }
            refetchSheet();
        } catch (err) {
            alert(err?.message ?? String(err));
        }
    };

    const presentCount = filteredRows.filter((r) => r.status === "present").length;
    const unmarkedCount = filteredRows.filter((r) => !r.status).length;

    // console.log("selectedSchool:", selectedSchool);
    // // console.log("classSectionId:", classSectionId);
    // console.log("classId:", classId);
    // console.log("section:", section);
    // console.log("date:", date);
    // console.log("attendanceType:", attendanceType);
    // console.log("periodNo:", periodNo);
    // console.log("sessionRemarks:", sessionRemarks);
    // console.log("rows:", rows);

    // console.log({
    //     canLoadSheet,
    //     // classSectionId,
    //     date,
    //     attendanceType,
    //     periodNo,
    // });

    return (
        <div className="at-page min-h-screen p-6">
            {/* ── Save-success toast ── */}
            <AnimatePresence>
                {showSavedToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="at-toast fixed top-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.5, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.05 }}
                        >
                            <CheckCircle2 size={20} className="at-toast-icon" />
                        </motion.div>
                        <span className="text-[13.5px] font-semibold">Attendance saved successfully</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="at-title text-2xl font-bold">Attendance</h1>
                    <p className="at-subtitle text-[13.5px] mt-1">
                        Mark or review daily attendance for a class section.
                    </p>
                </div>
                {filteredRows.length > 0 && (
                    <div className="flex items-center gap-3">
                        {sessionId && (
                            <button
                                onClick={handleToggleLock}
                                className={`at-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ${isLocked ? "at-btn-locked" : ""
                                    }`}
                            >
                                {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                                {isLocked ? "Unlock" : "Lock"}
                            </button>
                        )}
                        <button
                            onClick={markAllPresent}
                            disabled={isLocked}
                            className="at-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCheck size={16} /> Mark all present
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLocked || submitting}
                            className="at-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={16} />
                            {submitting ? "Saving…" : "Save Attendance"}
                        </button>
                    </div>
                )}
            </div>

            {/* ── Filter bar ── */}
            <div className="at-filter-bar flex flex-wrap items-end gap-3 rounded-2xl px-4 py-3 mb-6">
                {isAdmin && (
                    <div className="flex flex-col gap-1">
                        <label className="at-filter-label text-[11.5px] font-semibold">School</label>
                        <select
                            value={selectedSchool}
                            onChange={(e) => {
                                setSelectedSchool(e.target.value);
                                setClassId("");
                                setSection("");
                            }}
                            className="at-select px-3 py-2 rounded-lg text-[13px] min-w-[200px]"
                            disabled={schoolsLoading}
                        >
                            <option value="">Select a school</option>
                            {schools.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <label className="at-filter-label text-[11.5px] font-semibold">Class</label>
                    <select
                        value={classId}
                        onChange={handleClassChange}
                        className="at-select px-3 py-2 rounded-lg text-[13px] min-w-[150px]"
                        disabled={needsSchoolFirst || classesLoading}
                    >
                        <option value="">
                            {needsSchoolFirst ? "Select a school first" : classesLoading ? "Loading…" : "Select class"}
                        </option>
                        {scopedClasses.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="at-filter-label text-[11.5px] font-semibold">Section</label>
                    <select
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="at-select px-3 py-2 rounded-lg text-[13px] min-w-[130px]"
                        disabled={needsSchoolFirst || needsClassFirst || sectionsLoading}
                    >
                        <option value="">
                            {needsSchoolFirst
                                ? "Select a school first"
                                : needsClassFirst
                                    ? "Select a class first"
                                    : sectionsLoading
                                        ? "Loading…"
                                        : "Select section"}
                        </option>
                        {scopedSections.map((s) => (
                            <option key={s.id} value={s.section_name}>{s.section_name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="at-filter-label text-[11.5px] font-semibold">Academic Year</label>
                    <select
                        value={academicYearId}
                        onChange={(e) => setAcademicYearId(e.target.value)}
                        className="at-select px-3 py-2 rounded-lg text-[13px] min-w-[150px]"
                        disabled={needsSchoolFirst || yearsLoading}
                    >
                        <option value="">
                            {needsSchoolFirst ? "Select a school first" : yearsLoading ? "Loading…" : "Select year"}
                        </option>
                        {scopedAcademicYears.map((y) => (
                            <option key={y.id} value={y.id}>{y.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="at-filter-label text-[11.5px] font-semibold">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="at-select px-3 py-2 rounded-lg text-[13px]"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="at-filter-label text-[11.5px] font-semibold">Type</label>
                    <select
                        value={attendanceType}
                        onChange={(e) => setAttendanceType(e.target.value)}
                        className="at-select px-3 py-2 rounded-lg text-[13px]"
                    >
                        <option value="daily">Daily</option>
                        <option value="period">Period</option>
                    </select>
                </div>

                {attendanceType === "period" && (
                    <div className="flex flex-col gap-1">
                        <label className="at-filter-label text-[11.5px] font-semibold">Period No.</label>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={periodNo}
                            onChange={(e) => setPeriodNo(e.target.value)}
                            placeholder="e.g. 3"
                            className="at-select px-3 py-2 rounded-lg text-[13px] w-24"
                        />
                    </div>
                )}

                {filteredRows.length > 0 && (
                    <div className="ml-auto flex items-center gap-2">
                        {isLocked && (
                            <span className="at-locked-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold">
                                <Lock size={12} /> Locked
                            </span>
                        )}
                        {unmarkedCount > 0 && (
                            <span className="at-unmarked-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold">
                                {unmarkedCount} unmarked
                            </span>
                        )}
                        <span className="at-count-text text-[12.5px]">
                            {presentCount}/{filteredRows.length} present
                        </span>
                    </div>
                )}
            </div>

            {saveError && (
                <div className="at-save-error rounded-xl px-4 py-3 mb-4 text-[13px] font-medium">
                    {saveError}
                </div>
            )}

            {/* ── Content ── */}
            {!canLoadSheet ? (
                <div className="at-empty-card rounded-2xl p-14 text-center">
                    <ClipboardCheck size={32} className="at-empty-icon mx-auto mb-3" />
                    <p className="at-empty-title text-[14px] font-semibold mb-1">
                        {needsSchoolFirst ? "Select a school to get started" : "Select class, section and academic year"}
                    </p>
                    <p className="at-empty-desc text-[13px]">
                        {attendanceType === "period" && !periodNo
                            ? "A period number is required for period-wise attendance."
                            : "Pick the filters above to load the attendance sheet."}
                    </p>
                </div>
            ) : loading ? (
                <div className="at-empty-card rounded-2xl p-14 text-center">
                    <p className="at-empty-title text-[14px] font-semibold">Loading attendance sheet…</p>
                </div>
            ) : filteredRows.length === 0 ? (
                <div className="at-empty-card rounded-2xl p-14 text-center">
                    <ClipboardCheck size={32} className="at-empty-icon mx-auto mb-3" />
                    <p className="at-empty-title text-[14px] font-semibold mb-1">No students found</p>
                    <p className="at-empty-desc text-[13px]">
                        This class section has no enrolled students for this academic year.
                    </p>
                </div>
            ) : (
                <>
                    <AttendanceTable
                        rows={filteredRows}
                        statusOptions={STATUS_OPTIONS}
                        isLocked={isLocked}
                        setRowStatus={setRowStatus}
                        setRowRemarks={setRowRemarks}
                    />

                    <div className="at-remarks-card rounded-2xl px-5 py-4 mt-4">
                        <label className="at-filter-label text-[12px] font-semibold mb-1.5 block">
                            Session remarks (optional)
                        </label>
                        <textarea
                            rows={2}
                            disabled={isLocked}
                            value={sessionRemarks}
                            onChange={(e) => setSessionRemarks(e.target.value)}
                            placeholder="e.g. Morning attendance, assembly delay…"
                            className="at-select w-full px-3 py-2.5 rounded-lg text-[13.5px] disabled:opacity-60"
                        />
                    </div>
                </>
            )}
        </div>
    );
}