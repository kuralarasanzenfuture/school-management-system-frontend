import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    X, Clock, CalendarCheck, CircleCheck, CheckCircle2,
    XCircle, SunMedium, CalendarDays, Sparkles, Coffee,
    Clock3, MessageSquare, Check, Calendar, User, Briefcase,
    Zap, ChevronRight
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
    markAttendance,
    editAttendance,
    getAttendanceRecords
} from "../../../../redux/employeeAttendance/employeeAttendanceSlice";
import SearchableSelect from "./SearchableSelect.jsx";
import { getImageUrl } from "../../../../common/utils/imageUrl.js";
import "../styles/EmployeeAttendance.css";

const STATUS_CONFIG = [
    {
        value: "present",
        label: "Present",
        icon: CheckCircle2,
        color: "#10b981",
        lightBg: "rgba(16, 185, 129, 0.12)",
        desc: "Full Day",
    },
    {
        value: "late",
        label: "Late",
        icon: Clock,
        color: "#f59e0b",
        lightBg: "rgba(245, 158, 11, 0.12)",
        desc: "Delayed In",
    },
    {
        value: "half_day",
        label: "Half Day",
        icon: SunMedium,
        color: "#a855f7",
        lightBg: "rgba(168, 85, 247, 0.12)",
        desc: "Half Shift",
    },
    {
        value: "absent",
        label: "Absent",
        icon: XCircle,
        color: "#ef4444",
        lightBg: "rgba(239, 68, 68, 0.12)",
        desc: "Not Present",
    },
    {
        value: "leave",
        label: "Leave",
        icon: CalendarDays,
        color: "#3b82f6",
        lightBg: "rgba(59, 130, 246, 0.12)",
        desc: "Approved",
    },
    {
        value: "holiday",
        label: "Holiday",
        icon: Sparkles,
        color: "#06b6d4",
        lightBg: "rgba(6, 182, 212, 0.12)",
        desc: "Official Off",
    },
    {
        value: "week_off",
        label: "Week Off",
        icon: Coffee,
        color: "#64748b",
        lightBg: "rgba(100, 116, 139, 0.12)",
        desc: "Rest Day",
    },
];

const QUICK_REMARKS = [
    "On Time",
    "Permission Approved",
    "Official Duty",
    "Medical Reason",
    "Half Day Permission",
];

const INIT = {
    employee_id: "",
    shift_id: "",
    status: "",
    check_in: "",
    check_out: "",
    remarks: "",
};

/** Formats date/timestamp to local HTML input YYYY-MM-DDTHH:mm safely without UTC drift */
const formatToLocalDatetimeString = (val, baseDate) => {
    if (!val) return "";
    let d = new Date(val);
    if (isNaN(d.getTime())) {
        if (typeof val === "string" && /^\d{2}:\d{2}/.test(val) && baseDate) {
            d = new Date(`${baseDate}T${val}`);
        } else {
            return "";
        }
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function MarkAttendanceModal({
    isOpen,
    onClose,
    attendance = null, // null = create, object = edit
    employee = null,   // { id, first_name, last_name, employee_code, photo_url }
    employees = [],    // scoped employees list for selecting
    shifts = [],       // active shifts list for selecting
    initialShiftId = "",
    existingRecords = [],
    onSwitchToEdit = null,
    date = "",         // pre-selected date string "YYYY-MM-DD"
    schoolId = null,
    onSuccess = null,
}) {
    const dispatch = useDispatch();
    const isEdit = Boolean(attendance?.id);

    const [formData, setFormData] = useState(INIT);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const effectiveDate = useMemo(() => {
        if (isEdit && attendance?.attendance_date) {
            return String(attendance.attendance_date).slice(0, 10);
        }
        return date || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    }, [isEdit, attendance?.attendance_date, date]);

    // 1. Resolve selected employee object
    const currentEmployeeId = formData.employee_id || employee?.id || attendance?.employee_id || "";
    const selectedEmployeeObj = useMemo(() => {
        if (!currentEmployeeId) return null;
        const found = (employees ?? []).find((e) => Number(e.id) === Number(currentEmployeeId));
        if (found) return found;
        if (employee && Number(employee.id) === Number(currentEmployeeId)) return employee;
        if (attendance && Number(attendance.employee_id) === Number(currentEmployeeId)) {
            return {
                id: attendance.employee_id,
                first_name: attendance.first_name,
                last_name: attendance.last_name,
                employee_code: attendance.employee_code,
                photo_url: attendance.photo_url,
                school_id: attendance.school_id,
            };
        }
        return null;
    }, [currentEmployeeId, employees, employee, attendance]);

    // Currently selected shift object across all shifts
    const selectedShiftObj = useMemo(() => {
        if (!formData.shift_id) return null;
        const list = Array.isArray(shifts) ? shifts : [];
        return list.find((s) => Number(s.id) === Number(formData.shift_id)) || null;
    }, [formData.shift_id, shifts]);

    // 2. Determine target school ID (selected employee's school takes precedence, then selected shift's school)
    const effectiveSchoolId = useMemo(() => {
        if (selectedEmployeeObj?.school_id) return Number(selectedEmployeeObj.school_id);
        if (attendance?.school_id) return Number(attendance.school_id);
        if (selectedShiftObj?.school_id) return Number(selectedShiftObj.school_id);
        if (schoolId) return Number(schoolId);
        return null;
    }, [selectedEmployeeObj?.school_id, attendance?.school_id, selectedShiftObj?.school_id, schoolId]);

    // Map employees to SearchableSelect options (filtered to effective school so selecting a shift scopes employees)
    const employeeOptions = useMemo(() => {
        let list = employees ?? [];
        if (effectiveSchoolId) {
            list = list.filter((emp) => Number(emp.school_id) === Number(effectiveSchoolId));
        }
        return list.map((emp) => ({
            value: emp.id,
            label: `${emp.first_name} ${emp.last_name ?? ""}`.trim(),
            sublabel: [emp.employee_code, emp.designation, emp.mobile].filter(Boolean).join(" · "),
            avatarUrl: emp.photo_url && emp.photo_url !== "null" ? getImageUrl(emp.photo_url) : null,
            initials: `${emp.first_name?.[0] ?? ""}${emp.last_name?.[0] ?? ""}`.toUpperCase(),
        }));
    }, [employees, effectiveSchoolId]);

    // 3. Active shifts strictly filtered to the same school!
    const availableShifts = useMemo(() => {
        const list = Array.isArray(shifts) ? shifts : [];
        return list.filter((s) => {
            const isActive = s.status === "active" || s.status === undefined;
            if (!isActive) return false;
            if (effectiveSchoolId) {
                return Number(s.school_id) === Number(effectiveSchoolId);
            }
            return true;
        });
    }, [shifts, effectiveSchoolId]);

    // Check if the selected employee already has attendance marked for this date
    const existingEmployeeRecord = useMemo(() => {
        if (isEdit || !currentEmployeeId || !Array.isArray(existingRecords)) return null;
        return existingRecords.find(
            (r) =>
                Number(r.employee_id) === Number(currentEmployeeId) &&
                String(r.attendance_date).slice(0, 10) === effectiveDate,
        );
    }, [isEdit, currentEmployeeId, existingRecords, effectiveDate]);

    /* ── Hydrate: Only run when opening the modal or switching attendance record ── */
    useEffect(() => {
        if (!isOpen) return;

        if (isEdit && attendance) {
            setFormData({
                employee_id: String(attendance.employee_id || ""),
                shift_id: attendance.shift_id ? String(attendance.shift_id) : "",
                status: attendance.status ?? "",
                check_in: attendance.check_in
                    ? formatToLocalDatetimeString(attendance.check_in, effectiveDate)
                    : "",
                check_out: attendance.check_out
                    ? formatToLocalDatetimeString(attendance.check_out, effectiveDate)
                    : "",
                remarks: attendance.remarks ?? "",
            });
        } else {
            // Find school for the initial employee or props
            const initEmp = employee || (employees ?? []).find((e) => Number(e.id) === Number(employee?.id));
            const initSchoolId = initEmp?.school_id ? Number(initEmp.school_id) : schoolId ? Number(schoolId) : null;

            // Find school-scoped shifts
            const schoolShifts = (Array.isArray(shifts) ? shifts : []).filter((s) => {
                const isActive = s.status === "active" || s.status === undefined;
                if (!isActive) return false;
                if (initSchoolId) return Number(s.school_id) === Number(initSchoolId);
                return true;
            });

            // Default shift: initialShiftId (if it belongs to this school), or is_default === 1, or first available
            const defaultShift = (initialShiftId && schoolShifts.find((s) => String(s.id) === String(initialShiftId)))
                || schoolShifts.find((s) => s.is_default === 1 || s.is_default === true)
                || schoolShifts[0];

            const chosenShiftId = defaultShift?.id ? String(defaultShift.id) : "";

            setFormData({
                ...INIT,
                employee_id: employee?.id ? String(employee.id) : "",
                shift_id: chosenShiftId,
                check_in: defaultShift?.start_time ? `${effectiveDate}T${defaultShift.start_time.slice(0, 5)}` : "",
                check_out: defaultShift?.end_time ? `${effectiveDate}T${defaultShift.end_time.slice(0, 5)}` : "",
            });
        }
        setErrors({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isEdit, attendance?.id, employee?.id]);

    /* ── Handlers ── */
    const handleChange = (fieldKey) => (event) => {
        setFormData((prev) => ({ ...prev, [fieldKey]: event.target.value }));
        setErrors((prev) => (prev[fieldKey] ? { ...prev, [fieldKey]: null } : prev));
    };

    const handleEmployeeSelect = (empId) => {
        const emp = (employees ?? []).find((e) => Number(e.id) === Number(empId));
        const empSchoolId = emp?.school_id ? Number(emp.school_id) : effectiveSchoolId;

        // Find shifts strictly belonging to this employee's school
        const empShifts = (Array.isArray(shifts) ? shifts : []).filter((s) => {
            const isActive = s.status === "active" || s.status === undefined;
            if (!isActive) return false;
            if (empSchoolId) {
                return Number(s.school_id) === Number(empSchoolId);
            }
            return true;
        });

        // Retain current shift if it belongs to this employee's school, or find equivalent shift by name
        let matchingShift = empShifts.find((s) => String(s.id) === String(formData.shift_id));
        if (!matchingShift && formData.shift_id) {
            const prevShiftObj = (Array.isArray(shifts) ? shifts : []).find((s) => String(s.id) === String(formData.shift_id));
            if (prevShiftObj?.name) {
                matchingShift = empShifts.find((s) => s.name?.toLowerCase() === prevShiftObj.name?.toLowerCase());
            }
        }
        const finalShift = matchingShift || empShifts.find((s) => s.is_default === 1 || s.is_default === true) || empShifts[0];
        const newShiftId = finalShift?.id ? String(finalShift.id) : "";

        setFormData((prev) => {
            const updated = {
                ...prev,
                employee_id: empId,
                shift_id: newShiftId,
            };
            if (finalShift?.start_time && (!prev.status || ["present", "late", "half_day"].includes(prev.status))) {
                updated.check_in = `${effectiveDate}T${finalShift.start_time.slice(0, 5)}`;
                if (finalShift.end_time) {
                    updated.check_out = `${effectiveDate}T${finalShift.end_time.slice(0, 5)}`;
                }
            }
            return updated;
        });
        setErrors((prev) => ({ ...prev, employee_id: null }));
    };

    const handleShiftChange = (event) => {
        const shiftId = event.target.value;
        const shiftObj = availableShifts.find((s) => String(s.id) === String(shiftId));
        setFormData((prev) => {
            const updated = { ...prev, shift_id: shiftId };
            // Automatically update check_in and check_out to match new shift timing
            if (shiftObj?.start_time && (!prev.status || ["present", "late", "half_day"].includes(prev.status))) {
                updated.check_in = `${effectiveDate}T${shiftObj.start_time.slice(0, 5)}`;
                if (shiftObj.end_time) {
                    updated.check_out = `${effectiveDate}T${shiftObj.end_time.slice(0, 5)}`;
                }
            }
            return updated;
        });
    };

    const selectStatus = (statusValue) => {
        setFormData((prev) => {
            const updated = { ...prev, status: statusValue };
            // Clear times automatically if non-working
            if (["absent", "leave", "holiday", "week_off"].includes(statusValue)) {
                updated.check_in = "";
                updated.check_out = "";
            } else if (!updated.check_in && selectedShiftObj?.start_time) {
                // Auto-fill shift times if turning present/late
                updated.check_in = `${effectiveDate}T${selectedShiftObj.start_time.slice(0, 5)}`;
                if (selectedShiftObj.end_time) {
                    updated.check_out = `${effectiveDate}T${selectedShiftObj.end_time.slice(0, 5)}`;
                }
            }
            return updated;
        });
        setErrors((prev) => (prev.status ? { ...prev, status: null } : prev));
    };

    // Apply Shift Timings Preset
    const applyCurrentShiftTimings = () => {
        if (!selectedShiftObj) return;
        const inTime = selectedShiftObj.start_time ? selectedShiftObj.start_time.slice(0, 5) : "09:00";
        const outTime = selectedShiftObj.end_time ? selectedShiftObj.end_time.slice(0, 5) : "17:00";
        setFormData((prev) => ({
            ...prev,
            check_in: `${effectiveDate}T${inTime}`,
            check_out: `${effectiveDate}T${outTime}`,
        }));
        setErrors((prev) => ({ ...prev, check_in: null, check_out: null }));
    };

    const applyNowCheckIn = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        setFormData((prev) => ({
            ...prev,
            check_in: `${effectiveDate}T${hours}:${minutes}`,
        }));
        setErrors((prev) => ({ ...prev, check_in: null }));
    };

    const applyNowCheckOut = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        setFormData((prev) => ({
            ...prev,
            check_out: `${effectiveDate}T${hours}:${minutes}`,
        }));
        setErrors((prev) => ({ ...prev, check_out: null }));
    };

    const appendRemark = (chipText) => {
        setFormData((prev) => ({
            ...prev,
            remarks: prev.remarks ? `${prev.remarks}, ${chipText}` : chipText,
        }));
    };

    /* ── Computed Live Duration Preview ── */
    const computedDuration = useMemo(() => {
        if (!formData.check_in || !formData.check_out) return null;
        const inT = new Date(formData.check_in);
        const outT = new Date(formData.check_out);
        if (isNaN(inT.getTime()) || isNaN(outT.getTime()) || outT <= inT) return null;
        const totalMins = Math.floor((outT - inT) / 60000);
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        return `${hrs}h ${mins}m (${totalMins} mins)`;
    }, [formData.check_in, formData.check_out]);

    /* ── Validation ── */
    const validate = () => {
        const validationErrors = {};
        if (!currentEmployeeId) {
            validationErrors.employee_id = "Please select an employee";
        }
        if (!formData.status) {
            validationErrors.status = "Please select an attendance status";
        }
        if (formData.check_in && formData.check_out) {
            if (new Date(formData.check_out) <= new Date(formData.check_in)) {
                validationErrors.check_out = "Check-out time must be after check-in time";
            }
        }
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    /* ── Submit (Backend automatically calculates work minutes, lateness, and overtime) ── */
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);

        const payload = {
            school_id: schoolId || attendance?.school_id || selectedEmployeeObj?.school_id,
            employee_id: Number(currentEmployeeId),
            attendance_date: effectiveDate,
            status: formData.status,
            shift_id: formData.shift_id ? Number(formData.shift_id) : null,
            check_in: formData.check_in || null,
            check_out: formData.check_out || null,
            remarks: formData.remarks?.trim() || null,
        };

        try {
            if (isEdit) {
                await dispatch(editAttendance({ id: attendance.id, payload })).unwrap();
            } else {
                await dispatch(markAttendance(payload)).unwrap();
            }
            onClose();
            await dispatch(getAttendanceRecords()).unwrap();
            if (onSuccess) onSuccess();
        } catch (submissionError) {
            alert(submissionError?.message ?? String(submissionError));
        } finally {
            setSubmitting(false);
        }
    };

    const showTimeFields = ["present", "late", "half_day"].includes(formData.status);
    const selectedConfig = STATUS_CONFIG.find((s) => s.value === formData.status);

    const formattedDateBadge = useMemo(() => {
        if (!effectiveDate) return "";
        const [y, m, d] = effectiveDate.split("-").map(Number);
        const dateObj = new Date(y, m - 1, d);
        return dateObj.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }, [effectiveDate]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="ea-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.94, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 24 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="ea-modal w-full max-w-[560px] rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* ── Header ── */}
                        <div className="ea-modal-header flex items-center justify-between px-6 py-4.5 bg-gradient-to-b from-transparent to-black/[0.01]">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-white"
                                    style={{
                                        background: "linear-gradient(135deg, var(--btn-bg, #1a237e) 0%, var(--btn-hover, #3949ab) 100%)",
                                    }}
                                >
                                    <CalendarCheck size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="ea-modal-title text-[16.5px] font-bold tracking-tight mt-5">
                                        {isEdit ? "Edit Attendance" : "Mark Attendance"}
                                    </h2>
                                    <div className="flex items-center flex-wrap gap-1.5 mt-0.5 text-[12px]">
                                        {selectedEmployeeObj ? (
                                            <>
                                                <span className="font-semibold ea-cell-primary truncate">
                                                    {selectedEmployeeObj.first_name} {selectedEmployeeObj.last_name || ""}
                                                </span>
                                                {selectedEmployeeObj.employee_code && (
                                                    <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                        {selectedEmployeeObj.employee_code}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="ea-cell-muted">Select an employee below</span>
                                        )}
                                        {formattedDateBadge && (
                                            <span
                                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold"
                                                style={{
                                                    background: "var(--badge-bg, #e8ecff)",
                                                    color: "var(--badge-text, #1a237e)",
                                                }}
                                            >
                                                <Calendar size={11} />
                                                {formattedDateBadge}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="ea-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 hover:rotate-90 duration-150"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* ── Scrollable Body ── */}
                        <div className="ea-modal-scroll px-6 py-5 flex flex-col gap-4.5 overflow-y-auto">

                            {/* Alert if selected employee already has attendance marked for this date */}
                            {existingEmployeeRecord && (
                                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3 flex items-center justify-between gap-2.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-[14px]">⚠️</span>
                                        <p className="text-[12px] text-amber-800 dark:text-amber-300 font-medium truncate">
                                            Attendance already marked as <strong className="uppercase">{existingEmployeeRecord.status}</strong> for this employee on {effectiveDate}.
                                        </p>
                                    </div>
                                    {onSwitchToEdit && (
                                        <button
                                            type="button"
                                            onClick={() => onSwitchToEdit(existingEmployeeRecord)}
                                            className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
                                        >
                                            Edit Record
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* 1. Shift & Employee Selector Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {/* Shift Selector */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="ea-field-label text-[12.5px] font-semibold flex items-center gap-1.5">
                                            <Briefcase size={13} style={{ color: "var(--btn-bg, #1a237e)" }} className="dark:text-indigo-400" />
                                            Shift
                                        </label>
                                        {selectedShiftObj?.working_hours && (
                                            <span className="text-[11px] font-mono font-semibold" style={{ color: "var(--btn-bg, #1a237e)" }}>
                                                {selectedShiftObj.working_hours}h required
                                            </span>
                                        )}
                                    </div>
                                    <select
                                        value={formData.shift_id}
                                        onChange={handleShiftChange}
                                        className="ea-form-input w-full rounded-xl px-3 py-2.5 text-[13px] outline-none cursor-pointer"
                                    >
                                        <option value="">No Shift / Default Shift</option>
                                        {availableShifts.map((sh) => (
                                            <option key={sh.id} value={sh.id}>
                                                {sh.name} ({sh.start_time?.slice(0, 5)} - {sh.end_time?.slice(0, 5)})
                                            </option>
                                        ))}
                                    </select>
                                    {selectedShiftObj && (
                                        <p className="text-[10.5px] ea-cell-muted flex items-center gap-1">
                                            <Clock size={10} />
                                            {selectedShiftObj.start_time?.slice(0, 5)} - {selectedShiftObj.end_time?.slice(0, 5)} · Grace: {selectedShiftObj.grace_minutes ?? 10}m
                                        </p>
                                    )}
                                </div>

                                {/* Employee Selector */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="ea-field-label text-[12.5px] font-semibold flex items-center gap-1.5">
                                        <User size={13} style={{ color: "var(--btn-bg, #1a237e)" }} className="dark:text-indigo-400" />
                                        Employee <span className="ea-field-required">*</span>
                                    </label>
                                    {isEdit ? (
                                        <div className="ea-form-input w-full rounded-xl px-3 py-2.5 text-[13px] bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                                            <span className="font-semibold ea-cell-primary truncate">
                                                {selectedEmployeeObj?.first_name} {selectedEmployeeObj?.last_name || ""}
                                            </span>
                                            {selectedEmployeeObj?.employee_code && (
                                                <span className="text-[11px] font-mono ea-cell-muted">
                                                    {selectedEmployeeObj.employee_code}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <SearchableSelect
                                            options={employeeOptions}
                                            value={formData.employee_id}
                                            onChange={handleEmployeeSelect}
                                            placeholder="Choose an employee…"
                                            showAvatars
                                            hasError={Boolean(errors.employee_id)}
                                        />
                                    )}
                                    {errors.employee_id && (
                                        <p className="ea-field-error text-[11px] font-medium">{errors.employee_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* 2. Status Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="ea-field-label text-[12.5px] font-semibold flex items-center gap-1">
                                        Attendance Status <span className="ea-field-required">*</span>
                                    </label>
                                    {formData.status && (
                                        <span
                                            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                                            style={{
                                                color: selectedConfig?.color,
                                                backgroundColor: selectedConfig?.lightBg,
                                            }}
                                        >
                                            {selectedConfig?.label}
                                        </span>
                                    )}
                                </div>

                                {/* Working Daily Statuses */}
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {STATUS_CONFIG.slice(0, 4).map((statusOption) => {
                                        const IconComp = statusOption.icon;
                                        const isSelected = formData.status === statusOption.value;
                                        return (
                                            <button
                                                key={statusOption.value}
                                                type="button"
                                                onClick={() => selectStatus(statusOption.value)}
                                                className={`ea-status-card ea-status-card-${statusOption.value} ${isSelected ? "ea-selected" : ""}`}
                                            >
                                                {isSelected && (
                                                    <span
                                                        className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                                                        style={{ backgroundColor: statusOption.color }}
                                                    >
                                                        <Check size={10} strokeWidth={3} />
                                                    </span>
                                                )}
                                                <div
                                                    className="w-7 h-7 rounded-xl flex items-center justify-center transition-colors"
                                                    style={{
                                                        backgroundColor: statusOption.lightBg,
                                                        color: statusOption.color,
                                                    }}
                                                >
                                                    <IconComp size={16} strokeWidth={isSelected ? 2.5 : 2} />
                                                </div>
                                                <span
                                                    className="text-[12px] font-bold leading-tight"
                                                    style={{ color: isSelected ? statusOption.color : "inherit" }}
                                                >
                                                    {statusOption.label}
                                                </span>
                                                <span className="text-[9.5px] ea-cell-muted -mt-0.5">
                                                    {statusOption.desc}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Non-working / Leave Statuses */}
                                <div className="grid grid-cols-3 gap-2">
                                    {STATUS_CONFIG.slice(4).map((statusOption) => {
                                        const IconComp = statusOption.icon;
                                        const isSelected = formData.status === statusOption.value;
                                        return (
                                            <button
                                                key={statusOption.value}
                                                type="button"
                                                onClick={() => selectStatus(statusOption.value)}
                                                className={`ea-status-card ea-status-card-${statusOption.value} ${isSelected ? "ea-selected" : ""}`}
                                            >
                                                {isSelected && (
                                                    <span
                                                        className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                                                        style={{ backgroundColor: statusOption.color }}
                                                    >
                                                        <Check size={10} strokeWidth={3} />
                                                    </span>
                                                )}
                                                <div
                                                    className="w-7 h-7 rounded-xl flex items-center justify-center transition-colors"
                                                    style={{
                                                        backgroundColor: statusOption.lightBg,
                                                        color: statusOption.color,
                                                    }}
                                                >
                                                    <IconComp size={16} strokeWidth={isSelected ? 2.5 : 2} />
                                                </div>
                                                <span
                                                    className="text-[12px] font-bold leading-tight"
                                                    style={{ color: isSelected ? statusOption.color : "inherit" }}
                                                >
                                                    {statusOption.label}
                                                </span>
                                                <span className="text-[9.5px] ea-cell-muted -mt-0.5">
                                                    {statusOption.desc}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {errors.status && (
                                    <p className="ea-field-error text-[11px] mt-1.5 font-medium">{errors.status}</p>
                                )}
                            </div>

                            {/* 3. Time Details (Only for working statuses) */}
                            {showTimeFields && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex flex-col gap-3 pt-1"
                                >
                                    <div className="flex items-center justify-between border-b border-dashed pb-2 border-slate-200 dark:border-slate-800">
                                        <span className="ea-section-label text-[11.5px] font-bold uppercase flex items-center gap-1.5" style={{ color: "var(--btn-bg, #1a237e)" }}>
                                            <Clock3 size={13} />
                                            Timings & Shift
                                        </span>
                                        {/* Quick Preset Time Chips */}
                                        <div className="flex items-center gap-1.5">
                                            {selectedShiftObj?.start_time && selectedShiftObj?.end_time && (
                                                <button
                                                    type="button"
                                                    onClick={applyCurrentShiftTimings}
                                                    className="ea-chip-btn flex items-center gap-1 font-semibold"
                                                    style={{
                                                        background: "var(--badge-bg, #e8ecff)",
                                                        color: "var(--badge-text, #1a237e)",
                                                        borderColor: "color-mix(in srgb, var(--btn-bg, #1a237e) 30%, transparent)",
                                                    }}
                                                >
                                                    <Zap size={11} />
                                                    {selectedShiftObj.name} ({selectedShiftObj.start_time.slice(0, 5)} - {selectedShiftObj.end_time.slice(0, 5)})
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Check-in / Check-out Inputs */}
                                    <div className="grid grid-cols-2 gap-3.5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="ea-field-label text-[12px] font-semibold">
                                                    Check-in Time
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={applyNowCheckIn}
                                                    className="text-[11.5px] font-semibold hover:underline cursor-pointer"
                                                    style={{ color: "var(--btn-bg, #1a237e)" }}
                                                >
                                                    Set Now
                                                </button>
                                            </div>
                                            <input
                                                type="datetime-local"
                                                className={`ea-form-input w-full rounded-xl px-3 py-2 text-[13px] ${errors.check_in ? "ea-form-input-error" : ""
                                                    }`}
                                                value={formData.check_in}
                                                onChange={handleChange("check_in")}
                                            />
                                            {errors.check_in && (
                                                <p className="ea-field-error text-[11px] font-medium">{errors.check_in}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="ea-field-label text-[12px] font-semibold">
                                                    Check-out Time
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={applyNowCheckOut}
                                                    className="text-[11.5px] font-semibold hover:underline cursor-pointer"
                                                    style={{ color: "var(--btn-bg, #1a237e)" }}
                                                >
                                                    Set Now
                                                </button>
                                            </div>
                                            <input
                                                type="datetime-local"
                                                className={`ea-form-input w-full rounded-xl px-3 py-2 text-[13px] ${errors.check_out ? "ea-form-input-error" : ""
                                                    }`}
                                                value={formData.check_out}
                                                onChange={handleChange("check_out")}
                                            />
                                            {errors.check_out && (
                                                <p className="ea-field-error text-[11px] font-medium">{errors.check_out}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Auto-calculation Notice & Duration Preview */}
                                    <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-3.5 py-2 text-[11.5px]">
                                        <div className="flex items-center gap-1.5 ea-cell-secondary">
                                            <Sparkles size={12} className="text-amber-500 shrink-0" />
                                            <span>Overtime & lateness are calculated by the backend based on selected shift.</span>
                                        </div>
                                        {computedDuration && (
                                            <span className="font-bold shrink-0 ml-auto" style={{ color: "var(--btn-bg, #1a237e)" }}>
                                                Duration: {computedDuration}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* 4. Remarks */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="ea-field-label text-[12px] font-semibold flex items-center gap-1.5">
                                        <MessageSquare size={13} style={{ color: "var(--btn-bg, #1a237e)" }} className="dark:text-indigo-400" />
                                        Remarks / Note
                                    </label>
                                    <span className="text-[10px] ea-cell-muted">Optional</span>
                                </div>

                                <textarea
                                    rows={2}
                                    placeholder="Add supervisor notes, approval reasons..."
                                    className="ea-form-input w-full rounded-xl px-3 py-2 text-[13px] resize-none"
                                    value={formData.remarks}
                                    onChange={handleChange("remarks")}
                                    maxLength={500}
                                />

                                {/* Quick remark pills */}
                                <div className="flex items-center flex-wrap gap-1 mt-0.5">
                                    {QUICK_REMARKS.map((remarkText) => (
                                        <button
                                            key={remarkText}
                                            type="button"
                                            onClick={() => appendRemark(remarkText)}
                                            className="ea-chip-btn text-[10.5px] py-0.5"
                                        >
                                            + {remarkText}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div className="ea-modal-footer flex items-center justify-between px-6 py-3.5 border-t">
                            <div className="flex items-center gap-2">
                                {selectedConfig && (
                                    <div
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold shadow-xs"
                                        style={{
                                            backgroundColor: selectedConfig.lightBg,
                                            color: selectedConfig.color,
                                        }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: selectedConfig.color }}
                                        />
                                        {selectedConfig.label}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="ea-modal-btn-cancel px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors active:scale-[0.98] cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={handleSubmit}
                                    className="ea-modal-btn-submit inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.97] cursor-pointer"
                                >
                                    <CircleCheck size={16} />
                                    {submitting
                                        ? isEdit
                                            ? "Updating..."
                                            : "Saving..."
                                        : isEdit
                                            ? "Update Attendance"
                                            : "Mark Attendance"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}