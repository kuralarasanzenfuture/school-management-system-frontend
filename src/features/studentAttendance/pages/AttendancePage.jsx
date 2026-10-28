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
import { fetchClassSections } from "../../../redux/schoolSetup/class-sections/classSectionSlice.js";
import CustomDropdown from "../../../common/components/dropdown/CustomDropdown.jsx";
import CustomDatePicker from "../../../common/components/datepicker/CustomDatePicker.jsx";
import AttendanceTable from "../components/AttendanceTable.jsx";
import "../styles/Attendance.css";

const STATUS_OPTIONS = ["present", "absent", "late", "half_day", "leave"];

const TYPE_OPTIONS = [
    { value: "daily", label: "Daily" },
    { value: "period", label: "Period" },
];

// Normalizes a raw attendance_status value from the backend so it matches
// one of STATUS_OPTIONS. Deliberately does NOT default an empty/null
// value to "present" — an unmarked student should show with no status
// selected at all until explicitly chosen.
const normalizeStatus = (raw) => {
    if (!raw) return "";
    const cleaned = String(raw).trim().toLowerCase().replace(/-/g, "_");
    return STATUS_OPTIONS.includes(cleaned) ? cleaned : "";
};

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const isAdmin = Boolean(
        user?.roles?.includes("ADMIN") ||
        user?.roles?.includes("SUPER_ADMIN") ||
        user?.role === "ADMIN"
    );
    const fixedSchoolId = isAdmin ? null : user?.school_id;

    // School Profile slice state
    const schoolsData = useSelector((state) => state.schoolProfile?.schools);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

    // Classes slice state
    const classesState = useSelector((state) => state.classes);
    const classesLoading = Boolean(classesState?.loading);

    // Sections slice state
    const sectionsState = useSelector((state) => state.sections);
    const sectionsLoading = Boolean(sectionsState?.loading);

    // Academic Years slice state
    const academicYearsState = useSelector((state) => state.academicYears);
    const yearsLoading = Boolean(academicYearsState?.loading);

    // Class Sections junction slice state
    const classSectionsState = useSelector((state) => state.classSections);
    const classSectionsLoading = Boolean(classSectionsState?.loading);

    // Admissions & Attendance state
    const classStudentSummary = useSelector(
        (state) => state.studentAdmissions?.classStudentSummary ?? []
    );
    const rosterLoading = useSelector((state) => state.studentAdmissions?.loading ?? false);

    const tokenAttendances = useSelector(
        (state) => state.studentAttendance?.tokenAttendances ?? []
    );
    const attendanceLoading = useSelector((state) => state.studentAttendance?.loading ?? false);
    const submitting = useSelector((state) => state.studentAttendance?.submitting ?? false);

    // Local filter state
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

    // Safely normalize schools list from redux
    const schoolList = useMemo(() => {
        const raw = Array.isArray(schoolsData)
            ? schoolsData
            : schoolsData?.schools || schoolsData?.data || [];
        return Array.isArray(raw) ? raw : [];
    }, [schoolsData]);

    const schoolOptions = useMemo(
        () => [
            { value: "", label: "Select a school" },
            ...schoolList.map((school) => ({
                value: String(school.id),
                label: school.name,
            })),
        ],
        [schoolList]
    );

    // Safely normalize classes list from redux
    const rawClasses = useMemo(() => {
        const raw = classesState?.classes;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.data)) return raw.data;
        if (Array.isArray(raw?.classes)) return raw.classes;
        return [];
    }, [classesState]);

    // Safely normalize sections list from redux
    const rawSections = useMemo(() => {
        const raw = sectionsState?.sections;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.data)) return raw.data;
        if (Array.isArray(raw?.sections)) return raw.sections;
        return [];
    }, [sectionsState]);

    // Safely normalize academic years list from redux
    const rawAcademicYears = useMemo(() => {
        const raw = academicYearsState?.academicYears;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.data)) return raw.data;
        if (Array.isArray(raw?.academicYears)) return raw.academicYears;
        return [];
    }, [academicYearsState]);

    // Safely normalize class sections junction list from redux
    const classSections = useMemo(() => {
        const raw = classSectionsState?.classSections;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.data)) return raw.data;
        if (Array.isArray(raw?.classSections)) return raw.classSections;
        return [];
    }, [classSectionsState]);

    // Load schools for Admin
    useEffect(() => {
        if (isAdmin && schoolList.length === 0) {
            dispatch(fetchSchools());
        }
    }, [dispatch, isAdmin, schoolList.length]);

    // Load dependent lists whenever effectiveSchoolId changes
    useEffect(() => {
        if (isAdmin && !effectiveSchoolId) return;
        const query = { school_id: effectiveSchoolId, paginate: false };
        dispatch(fetchClasses(query));
        dispatch(fetchAcademicYears(query));
        dispatch(fetchSections(query));
        dispatch(fetchClassSections(query));
    }, [dispatch, isAdmin, effectiveSchoolId]);

    // Scoped classes with junction fallback so no class is missed
    const scopedClasses = useMemo(() => {
        let list = !effectiveSchoolId
            ? rawClasses
            : rawClasses.filter(
                (c) => c.school_id == null || String(c.school_id) === String(effectiveSchoolId)
            );

        // Include any classes mapped in classSections that might not be in classes
        const existingIds = new Set(list.map((c) => String(c.id)));
        for (const cs of classSections) {
            if (!cs.class_id) continue;
            if (effectiveSchoolId && cs.school_id != null && String(cs.school_id) !== String(effectiveSchoolId)) continue;
            if (!existingIds.has(String(cs.class_id))) {
                existingIds.add(String(cs.class_id));
                list = [
                    ...list,
                    {
                        id: cs.class_id,
                        name: cs.class_name || `Class ${cs.class_id}`,
                        school_id: cs.school_id,
                    },
                ];
            }
        }
        return list;
    }, [rawClasses, classSections, effectiveSchoolId]);

    const needsSchoolFirst = isAdmin && !effectiveSchoolId;
    const needsClassFirst = !needsSchoolFirst && !classId;

    const classOptions = useMemo(
        () => [
            {
                value: "",
                label: needsSchoolFirst ? "Select school first" : "Select class",
            },
            ...scopedClasses.map((c) => ({
                value: String(c.id),
                label: c.name || c.class_name || `Class ${c.id}`,
            })),
        ],
        [scopedClasses, needsSchoolFirst]
    );

    // Scoped sections with junction fallback
    const scopedSections = useMemo(() => {
        let list = !effectiveSchoolId
            ? rawSections
            : rawSections.filter(
                (s) => s.school_id == null || String(s.school_id) === String(effectiveSchoolId)
            );

        if (classId) {
            const hasClassSpecific = list.some(
                (s) => s.class_id != null && String(s.class_id) === String(classId)
            );
            if (hasClassSpecific) {
                list = list.filter(
                    (s) => s.class_id == null || String(s.class_id) === String(classId)
                );
            }
        }

        // Include sections from classSections junction for this class
        const existingNames = new Set(
            list.map((s) => String(s.section_name ?? s.name ?? "").toLowerCase()).filter(Boolean)
        );
        for (const cs of classSections) {
            if (!cs.section_name && !cs.section_id) continue;
            if (effectiveSchoolId && cs.school_id != null && String(cs.school_id) !== String(effectiveSchoolId)) continue;
            if (classId && String(cs.class_id) !== String(classId)) continue;

            const secName = cs.section_name || "";
            if (secName && !existingNames.has(secName.toLowerCase())) {
                existingNames.add(secName.toLowerCase());
                list = [
                    ...list,
                    {
                        id: cs.section_id || cs.id,
                        section_name: secName,
                        name: secName,
                        class_id: cs.class_id,
                        school_id: cs.school_id,
                    },
                ];
            }
        }

        return list;
    }, [rawSections, classSections, effectiveSchoolId, classId]);

    const sectionOptions = useMemo(
        () => [
            {
                value: "",
                label: needsSchoolFirst
                    ? "Select school first"
                    : needsClassFirst
                    ? "Select class first"
                    : "Select section",
            },
            ...scopedSections.map((s) => {
                const name = s.section_name ?? s.name;
                return {
                    value: String(name),
                    label: String(name),
                };
            }),
        ],
        [scopedSections, needsSchoolFirst, needsClassFirst]
    );

    // Helper to determine if an academic year is the current/active one
    const isCurrentAcademicYear = (year) => {
        if (!year) return false;

        // 1. Explicit is_current flag (boolean, number 1, or string "1"/"true")
        if (
            year.is_current === true ||
            year.is_current === 1 ||
            year.is_current === "1" ||
            String(year.is_current).toLowerCase() === "true"
        ) {
            return true;
        }

        // 2. Date range check: today falls between start_date and end_date
        if (year.start_date && year.end_date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const start = new Date(year.start_date);
            const end = new Date(year.end_date);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                if (today >= start && today <= end) {
                    return true;
                }
            }
        }

        // 3. Status flag is active
        if (String(year.status).toLowerCase() === "active") {
            return true;
        }

        // 4. Current calendar year contained in name/label
        const curYear = new Date().getFullYear();
        const name = String(year.name || year.academic_year || year.year || "");
        if (name.includes(String(curYear))) {
            return true;
        }

        return false;
    };

    // Scoped academic years
    const scopedAcademicYears = useMemo(() => {
        let list = !effectiveSchoolId
            ? rawAcademicYears
            : rawAcademicYears.filter(
                (y) => y.school_id == null || String(y.school_id) === String(effectiveSchoolId)
            );

        const existingIds = new Set(list.map((y) => String(y.id)));
        for (const cs of classSections) {
            if (!cs.academic_year_id) continue;
            if (effectiveSchoolId && cs.school_id != null && String(cs.school_id) !== String(effectiveSchoolId)) continue;
            if (!existingIds.has(String(cs.academic_year_id))) {
                existingIds.add(String(cs.academic_year_id));
                list = [
                    ...list,
                    {
                        id: cs.academic_year_id,
                        name: cs.academic_year || `Year ${cs.academic_year_id}`,
                        school_id: cs.school_id,
                    },
                ];
            }
        }
        return list;
    }, [rawAcademicYears, classSections, effectiveSchoolId]);

    // Only select / display current academic year(s)
    const currentAcademicYears = useMemo(() => {
        const filtered = scopedAcademicYears.filter((y) => isCurrentAcademicYear(y));
        return filtered.length > 0 ? filtered : scopedAcademicYears;
    }, [scopedAcademicYears]);

    const academicYearOptions = useMemo(
        () => [
            ...currentAcademicYears.map((y) => ({
                value: String(y.id),
                label: y.name || y.academic_year || y.year || String(y.id),
                badge: "Current",
                badgeVariant: "success",
            })),
        ],
        [currentAcademicYears]
    );

    // Automatically select the current academic year
    useEffect(() => {
        if (currentAcademicYears.length > 0) {
            const currentYear =
                currentAcademicYears.find((y) => isCurrentAcademicYear(y)) || currentAcademicYears[0];
            if (currentYear) {
                if (
                    !academicYearId ||
                    !currentAcademicYears.some((y) => String(y.id) === String(academicYearId))
                ) {
                    setAcademicYearId(String(currentYear.id));
                }
            }
        } else if (isAdmin && !effectiveSchoolId) {
            setAcademicYearId("");
        }
    }, [currentAcademicYears, academicYearId, effectiveSchoolId, isAdmin]);

    // Dropdown change handlers
    const handleSchoolChange = (val) => {
        setSelectedSchool(val);
        setClassId("");
        setSection("");
        setAcademicYearId("");
        setRows([]);
        setSaveError("");
    };

    const handleClassChange = (val) => {
        setClassId(val);
        setSection("");
        setRows([]);
        setSaveError("");
    };

    const handleSectionChange = (val) => {
        setSection(val);
        setRows([]);
        setSaveError("");
    };

    const handleAcademicYearChange = (val) => {
        setAcademicYearId(val);
        setRows([]);
        setSaveError("");
    };

    const handleTypeChange = (val) => {
        setAttendanceType(val);
        if (val !== "period") setPeriodNo("");
        setSaveError("");
    };

    // Resolves numeric class_section_id required by the backend API
    const currentClassSectionId = useMemo(() => {
        if (!classId || !section || !academicYearId) return null;

        // 1. Direct match on classSections by school, class, section_name and academic_year
        const directMatch = classSections.find(
            (cs) =>
                (!effectiveSchoolId || String(cs.school_id) === String(effectiveSchoolId)) &&
                String(cs.class_id) === String(classId) &&
                String(cs.academic_year_id) === String(academicYearId) &&
                (String(cs.section_name ?? "").toLowerCase() === String(section).toLowerCase() ||
                 String(cs.section_id) === String(section))
        );
        if (directMatch?.id) return directMatch.id;

        // 2. Match section object by name to get its section_id
        const matchingSectionObj = scopedSections.find(
            (s) => String(s.section_name ?? s.name).toLowerCase() === String(section).toLowerCase()
        );
        const sectionId = matchingSectionObj?.id ?? matchingSectionObj?.section_id;

        if (sectionId) {
            const match = classSections.find(
                (cs) =>
                    (!effectiveSchoolId || String(cs.school_id) === String(effectiveSchoolId)) &&
                    String(cs.class_id) === String(classId) &&
                    String(cs.section_id) === String(sectionId) &&
                    String(cs.academic_year_id) === String(academicYearId)
            );
            if (match?.id) return match.id;
        }

        // 3. Fallback: match without strict academic_year_id check
        const fallbackMatch = classSections.find(
            (cs) =>
                (!effectiveSchoolId || String(cs.school_id) === String(effectiveSchoolId)) &&
                String(cs.class_id) === String(classId) &&
                (String(cs.section_name ?? "").toLowerCase() === String(section).toLowerCase() ||
                 (sectionId && String(cs.section_id) === String(sectionId)))
        );
        return fallbackMatch?.id ?? null;
    }, [classSections, scopedSections, effectiveSchoolId, classId, section, academicYearId]);

    const canLoadRoster =
        !needsSchoolFirst &&
        Boolean(classId) &&
        Boolean(section) &&
        Boolean(academicYearId);

    const canLoadSheet =
        canLoadRoster && Boolean(date) && (attendanceType === "daily" || Boolean(periodNo));

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
            })
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
                class_section_id: currentClassSectionId || undefined,
                attendance_type: attendanceType,
                period_no: attendanceType === "period" ? Number(periodNo) : 0,
                limit: 500,
            })
        );
    }, [dispatch, canLoadSheet, date, classId, section, academicYearId, effectiveSchoolId, currentClassSectionId, attendanceType, periodNo]);

    /* ── 3. Merge roster + that date's marks into the editable `rows` ── */
    useEffect(() => {
        if (!canLoadSheet) {
            setRows([]);
            return;
        }

        const marksByAdmission = new Map();
        tokenAttendances.forEach((record) => {
            if (record.admission_id != null) marksByAdmission.set(String(record.admission_id), record);
            if (record.student_id != null) marksByAdmission.set(String(record.student_id), record);
        });

        const rawRoster = Array.isArray(classStudentSummary)
            ? classStudentSummary
            : (classStudentSummary?.students || []);

        const sortedRoster = [...rawRoster].sort((a, b) => {
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
                const studentId = student.student_id ?? student.id;
                const rawPhoto =
                    student.photo_url ||
                    student.photo ||
                    student.student_photo ||
                    student.avatar ||
                    student.image ||
                    null;
                const mark =
                    marksByAdmission.get(String(admissionId)) ||
                    (studentId != null ? marksByAdmission.get(String(studentId)) : undefined);
                return {
                    admission_id: admissionId,
                    student_id: studentId,
                    class_id: student.class_id ?? classId,
                    section: student.section ?? section,
                    first_name: student.first_name,
                    last_name: student.last_name,
                    roll_no: student.roll_no,
                    photo_url: rawPhoto,
                    status: normalizeStatus(mark?.attendance_status),
                    remarks: mark?.remarks || "",
                    sessionId: mark?.session_id ?? null,
                    isLocked: Boolean(mark?.is_locked),
                };
            })
        );
        setSessionRemarks((prev) => prev || "");
    }, [classStudentSummary, tokenAttendances, canLoadSheet, classId, section]);

    // Defensive filter — only keeps rows actually belonging to the currently-selected class/section
    const filteredRows = useMemo(
        () =>
            rows.filter(
                (r) =>
                    (!classId || String(r.class_id) === String(classId)) &&
                    (!section || String(r.section) === String(section))
            ),
        [rows, classId, section]
    );

    const sessionId = rows.find((r) => r.sessionId)?.sessionId ?? null;
    const isLocked = rows.some((r) => r.isLocked);
    const loading = rosterLoading || attendanceLoading;

    const setRowStatus = (admissionId, status) => {
        setRows((prev) =>
            prev.map((r) => (r.admission_id === admissionId ? { ...r, status } : r))
        );
        setSaveError("");
    };

    const setRowRemarks = (admissionId, remarks) => {
        setRows((prev) =>
            prev.map((r) => (r.admission_id === admissionId ? { ...r, remarks } : r))
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
                class_section_id: currentClassSectionId || undefined,
                attendance_type: attendanceType,
                period_no: attendanceType === "period" ? Number(periodNo) : 0,
                limit: 500,
            })
        );
    };

    const handleSave = async () => {
        if (!filteredRows.length) return;

        if (classSectionsLoading) {
            setSaveError("Still resolving class section details — please wait a moment.");
            return;
        }
        if (!currentClassSectionId) {
            setSaveError("Couldn't resolve this class section. Please re-check the selected filters above.");
            return;
        }

        const unmarked = filteredRows.filter((r) => !r.status);
        if (unmarked.length > 0) {
            setSaveError(
                `${unmarked.length} student${unmarked.length === 1 ? "" : "s"} still need${
                    unmarked.length === 1 ? "s" : ""
                } a status before you can save.`
            );
            return;
        }
        setSaveError("");

        const payload = {
            class_section_id: Number(currentClassSectionId),
            attendance_date: date,
            attendance_type: attendanceType,
            period_no: attendanceType === "period" ? Number(periodNo) : 0,
            remarks: sessionRemarks.trim() || null,
            allow_update: true,
            students: filteredRows.map((r) => ({
                admission_id: Number(r.admission_id),
                student_id: r.student_id ? Number(r.student_id) : undefined,
                status: r.status,
                ...(r.remarks ? { remarks: r.remarks.trim() } : {}),
            })),
        };

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
                                className={`at-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ${
                                    isLocked ? "at-btn-locked" : ""
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
                {/* School Dropdown for Admins */}
                {isAdmin && (
                    <div className="flex flex-col gap-1 min-w-[200px]">
                        <label className="at-filter-label text-[11.5px] font-semibold">School</label>
                        <CustomDropdown
                            options={schoolOptions}
                            value={selectedSchool}
                            onChange={handleSchoolChange}
                            placeholder={schoolsLoading ? "Loading schools…" : "Select a school"}
                            searchable={schoolOptions.length > 5}
                            searchPlaceholder="Search school…"
                            disabled={schoolsLoading}
                            className="w-full"
                        />
                    </div>
                )}

                {/* Class Dropdown */}
                <div className="flex flex-col gap-1 min-w-[160px]">
                    <label className="at-filter-label text-[11.5px] font-semibold">Class</label>
                    <CustomDropdown
                        options={classOptions}
                        value={classId}
                        onChange={handleClassChange}
                        placeholder={
                            needsSchoolFirst
                                ? "Select school first"
                                : classesLoading
                                ? "Loading classes…"
                                : "Select class"
                        }
                        searchable={classOptions.length > 5}
                        searchPlaceholder="Search class…"
                        disabled={needsSchoolFirst || classesLoading}
                        className="w-full"
                    />
                </div>

                {/* Section Dropdown */}
                <div className="flex flex-col gap-1 min-w-[140px]">
                    <label className="at-filter-label text-[11.5px] font-semibold">Section</label>
                    <CustomDropdown
                        options={sectionOptions}
                        value={section}
                        onChange={handleSectionChange}
                        placeholder={
                            needsSchoolFirst
                                ? "Select school first"
                                : needsClassFirst
                                ? "Select class first"
                                : sectionsLoading
                                ? "Loading sections…"
                                : "Select section"
                        }
                        searchable={sectionOptions.length > 5}
                        searchPlaceholder="Search section…"
                        disabled={needsSchoolFirst || needsClassFirst || sectionsLoading}
                        className="w-full"
                    />
                </div>

                {/* Academic Year Dropdown */}
                <div className="flex flex-col gap-1 min-w-[160px]">
                    <label className="at-filter-label text-[11.5px] font-semibold">Academic Year</label>
                    <CustomDropdown
                        options={academicYearOptions}
                        value={academicYearId}
                        onChange={handleAcademicYearChange}
                        placeholder={
                            needsSchoolFirst
                                ? "Select school first"
                                : yearsLoading
                                ? "Loading years…"
                                : "Select year"
                        }
                        searchable={academicYearOptions.length > 5}
                        searchPlaceholder="Search year…"
                        disabled={needsSchoolFirst || yearsLoading}
                        className="w-full"
                    />
                </div>

                {/* Date Picker */}
                <div className="flex flex-col gap-1 min-w-[150px]">
                    <label className="at-filter-label text-[11.5px] font-semibold">Date</label>
                    <CustomDatePicker
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="Pick date..."
                    />
                </div>

                {/* Attendance Type Dropdown */}
                <div className="flex flex-col gap-1 min-w-[120px]">
                    <label className="at-filter-label text-[11.5px] font-semibold">Type</label>
                    <CustomDropdown
                        options={TYPE_OPTIONS}
                        value={attendanceType}
                        onChange={handleTypeChange}
                        placeholder="Type"
                        className="w-full"
                    />
                </div>

                {/* Period No (Conditional) */}
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
                            className="at-select px-3 py-2 rounded-lg text-[13px] w-24 h-[38px]"
                        />
                    </div>
                )}

                {/* Counters and lock status */}
                {filteredRows.length > 0 && (
                    <div className="ml-auto flex items-center gap-2 self-center pt-2">
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
                        {needsSchoolFirst
                            ? "Select a school to get started"
                            : "Select class, section and academic year"}
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
