import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Clock, CalendarCheck, CircleCheck, AlarmClock } from "lucide-react";
import { useDispatch } from "react-redux";
import { markAttendance, editAttendance } from "../../../../redux/employeeAttendance/employeeAttendanceSlice";
import "../styles/EmployeeAttendance.css";

const STATUSES = [
    { value: "present", label: "Present", emoji: "✅" },
    { value: "absent", label: "Absent", emoji: "❌" },
    { value: "late", label: "Late", emoji: "⏰" },
    { value: "half_day", label: "Half Day", emoji: "🌗" },
    { value: "leave", label: "Leave", emoji: "🏖️" },
    { value: "holiday", label: "Holiday", emoji: "🎉" },
    { value: "week_off", label: "Week Off", emoji: "📅" },
];

const INIT = {
    status: "",
    check_in: "",
    check_out: "",
    remarks: "",
    overtime_minutes: "",
    late_minutes: "",
};

function Field({ label, required, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="ea-field-label text-[13px] font-medium">
                {label}{required && <span className="ea-field-required ml-0.5">*</span>}
            </label>
            {children}
            <div className="h-4">
                {error && <p className="ea-field-error text-[11px]">{error}</p>}
            </div>
        </div>
    );
}

const inputClass = (hasError) =>
    `ea-form-input w-full rounded-lg px-3.5 py-2.5 text-[14px] ${hasError ? "ea-form-input-error" : ""}`;

export default function MarkAttendanceModal({
    isOpen,
    onClose,
    attendance = null,     // null = create, object = edit
    employee = null,     // { id, first_name, last_name, employee_code }
    date = "",       // pre-selected date string "YYYY-MM-DD"
    schoolId = null,
}) {
    const dispatch = useDispatch();
    const isEdit = Boolean(attendance?.id);

    const [formData, setFormData] = useState(INIT);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    /* ── Hydrate ── */
    useEffect(() => {
        if (!isOpen) return;
        if (isEdit && attendance) {
            setFormData({
                status: attendance.status ?? "",
                check_in: attendance.check_in
                    ? new Date(attendance.check_in).toISOString().slice(0, 16)
                    : "",
                check_out: attendance.check_out
                    ? new Date(attendance.check_out).toISOString().slice(0, 16)
                    : "",
                remarks: attendance.remarks ?? "",
                overtime_minutes: attendance.overtime_minutes != null
                    ? String(attendance.overtime_minutes) : "",
                late_minutes: attendance.late_minutes != null
                    ? String(attendance.late_minutes) : "",
            });
        } else {
            setFormData(INIT);
        }
        setErrors({});
    }, [isOpen, isEdit, attendance]);

    /* ── Handlers ── */
    const handleChange = (fieldKey) => (event) => {
        setFormData((prevData) => ({ ...prevData, [fieldKey]: event.target.value }));
        setErrors((prevErrors) =>
            prevErrors[fieldKey] ? { ...prevErrors, [fieldKey]: null } : prevErrors,
        );
    };

    const selectStatus = (statusValue) => {
        setFormData((prevData) => ({ ...prevData, status: statusValue }));
        setErrors((prevErrors) =>
            prevErrors.status ? { ...prevErrors, status: null } : prevErrors,
        );
    };

    /* ── Validation ── */
    const validate = () => {
        const validationErrors = {};
        if (!formData.status) validationErrors.status = "Please select a status";
        if (formData.check_in && formData.check_out) {
            if (new Date(formData.check_out) <= new Date(formData.check_in)) {
                validationErrors.check_out = "Check-out must be after check-in";
            }
        }
        if (formData.overtime_minutes && isNaN(Number(formData.overtime_minutes)))
            validationErrors.overtime_minutes = "Must be a number";
        if (formData.late_minutes && isNaN(Number(formData.late_minutes)))
            validationErrors.late_minutes = "Must be a number";
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);

        const payload = {
            school_id: schoolId,
            employee_id: employee?.id,
            attendance_date: date,
            status: formData.status,
            check_in: formData.check_in || null,
            check_out: formData.check_out || null,
            remarks: formData.remarks || null,
            overtime_minutes: formData.overtime_minutes ? Number(formData.overtime_minutes) : 0,
            late_minutes: formData.late_minutes ? Number(formData.late_minutes) : 0,
        };

        try {
            if (isEdit) {
                await dispatch(editAttendance({ id: attendance.id, payload })).unwrap();
            } else {
                await dispatch(markAttendance(payload)).unwrap();
            }
            onClose();
        } catch (submissionError) {
            alert(submissionError?.message ?? String(submissionError));
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Time fields visible only for relevant statuses ── */
    const showTimeFields = ["present", "late", "half_day"].includes(formData.status);
    const showLateField = formData.status === "late";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="ea-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(clickEvent) => clickEvent.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 32 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 32 }}
                        transition={{ duration: 0.22 }}
                        className="ea-modal w-full max-w-lg rounded-2xl overflow-hidden"
                    >
                        {/* ── Header ── */}
                        <div className="ea-modal-header flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="ea-icon-present-bg w-9 h-9 rounded-xl flex items-center justify-center">
                                    <CalendarCheck size={18} className="ea-icon-present" />
                                </div>
                                <div>
                                    <h2 className="ea-modal-title text-[16px] font-bold tracking-tight">
                                        {isEdit ? "Edit Attendance" : "Mark Attendance"}
                                    </h2>
                                    <p className="ea-cell-muted text-[12px]">
                                        {employee
                                            ? `${employee.first_name} ${employee.last_name} · ${employee.employee_code}`
                                            : "Select employee"}
                                        {date && ` · ${new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="ea-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        {/* ── Body ── */}
                        <div className="px-6 py-5 flex flex-col gap-5 max-h-[65vh] overflow-y-auto">

                            {/* Status selector */}
                            <div>
                                <p className="ea-field-label text-[13px] font-medium mb-2">
                                    Attendance Status <span className="ea-field-required">*</span>
                                </p>
                                <div className="ea-status-grid">
                                    {STATUSES.map((statusOption) => (
                                        <button
                                            key={statusOption.value}
                                            type="button"
                                            onClick={() => selectStatus(statusOption.value)}
                                            className={`ea-status-option ea-status-option-${statusOption.value} ${formData.status === statusOption.value ? "ea-selected" : ""
                                                }`}
                                        >
                                            <span className="text-lg block mb-1">{statusOption.emoji}</span>
                                            {statusOption.label}
                                        </button>
                                    ))}
                                </div>
                                {errors.status && (
                                    <p className="ea-field-error text-[11px] mt-1">{errors.status}</p>
                                )}
                            </div>

                            {/* Check-in / Check-out */}
                            {showTimeFields && (
                                <>
                                    <p className="ea-section-label text-[12px] font-bold uppercase tracking-wide pb-1.5">
                                        Time Details
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Check-in Time">
                                            <input
                                                type="datetime-local"
                                                className={inputClass(false)}
                                                value={formData.check_in}
                                                onChange={handleChange("check_in")}
                                            />
                                        </Field>
                                        <Field label="Check-out Time" error={errors.check_out}>
                                            <input
                                                type="datetime-local"
                                                className={inputClass(errors.check_out)}
                                                value={formData.check_out}
                                                onChange={handleChange("check_out")}
                                            />
                                        </Field>
                                    </div>
                                </>
                            )}

                            {/* Extra minutes */}
                            {showTimeFields && (
                                <div className="grid grid-cols-2 gap-4">
                                    {showLateField && (
                                        <Field label="Late Minutes" error={errors.late_minutes}>
                                            <input
                                                type="number"
                                                min="0"
                                                className={inputClass(errors.late_minutes)}
                                                placeholder="0"
                                                value={formData.late_minutes}
                                                onChange={handleChange("late_minutes")}
                                            />
                                        </Field>
                                    )}
                                    <Field label="Overtime Minutes" error={errors.overtime_minutes}>
                                        <input
                                            type="number"
                                            min="0"
                                            className={inputClass(errors.overtime_minutes)}
                                            placeholder="0"
                                            value={formData.overtime_minutes}
                                            onChange={handleChange("overtime_minutes")}
                                        />
                                    </Field>
                                </div>
                            )}

                            {/* Remarks */}
                            <Field label="Remarks">
                                <textarea
                                    rows={2}
                                    className={inputClass(false)}
                                    placeholder="Optional notes…"
                                    value={formData.remarks}
                                    onChange={handleChange("remarks")}
                                    maxLength={500}
                                />
                            </Field>
                        </div>

                        {/* ── Footer ── */}
                        <div className="ea-modal-footer flex items-center justify-end gap-3 px-6 py-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="ea-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleSubmit}
                                className="ea-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors active:scale-[0.97]"
                            >
                                <CircleCheck size={15} />
                                {submitting
                                    ? isEdit ? "Updating…" : "Saving…"
                                    : isEdit ? "Update" : "Mark Attendance"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}