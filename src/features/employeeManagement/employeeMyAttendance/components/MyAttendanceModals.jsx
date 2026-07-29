/**
 * MyAttendanceModals.jsx
 *
 * Exports:
 *   ManualAttendanceModal  — add / edit attendance (manual entry)
 *   DeleteAttendanceModal  — confirm delete
 */
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CircleCheck, Trash2, CalendarDays } from "lucide-react";
import "../styles/MyAttendance.css";

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
    status: "", attendance_date: "", check_in: "", check_out: "",
    late_minutes: "", overtime_minutes: "", remarks: "",
};

/* ── Shared field wrapper ── */
function Field({ label, required, error, hint, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="ma-field-label">
                {label}{required && <span className="ma-field-required ml-0.5">*</span>}
            </label>
            {children}
            {hint && !error && <p className="ma-cell-muted text-[11px] mt-0.5">{hint}</p>}
            <div className="h-4">{error && <p className="ma-field-error">{error}</p>}</div>
        </div>
    );
}
const fi = (err) => `ma-form-input${err ? " ma-form-input-error" : ""}`;

/* ══════════════════════════════════════════════════
   MANUAL ATTENDANCE MODAL (add + edit)
══════════════════════════════════════════════════ */
export function ManualAttendanceModal({ isOpen, onClose, record = null, onSave }) {
    const isEdit = Boolean(record?.id);
    const [form, setForm] = useState(INIT);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        if (isEdit && record) {
            const toLocal = (dt) => {
                if (!dt) return "";
                const d = new Date(dt);
                return isNaN(d) ? "" : d.toISOString().slice(0, 16);
            };
            setForm({
                status: record.status ?? "",
                attendance_date: (record.attendance_date ?? "").split("T")[0].split(" ")[0],
                check_in: toLocal(record.check_in),
                check_out: toLocal(record.check_out),
                late_minutes: record.late_minutes != null ? String(record.late_minutes) : "",
                overtime_minutes: record.overtime_minutes != null ? String(record.overtime_minutes) : "",
                remarks: record.remarks ?? "",
            });
        } else {
            setForm({ ...INIT, attendance_date: new Date().toISOString().split("T")[0] });
        }
        setErrors({});
    }, [isOpen, isEdit, record]);

    const set = (k) => (e) => {
        setForm((p) => ({ ...p, [k]: e.target.value }));
        setErrors((p) => (p[k] ? { ...p, [k]: null } : p));
    };
    const pickStatus = (v) => {
        setForm((p) => ({ ...p, status: v }));
        setErrors((p) => (p.status ? { ...p, status: null } : p));
    };

    const validate = () => {
        const errs = {};
        if (!form.status) errs.status = "Please select a status";
        if (!form.attendance_date) errs.attendance_date = "Date is required";
        if (form.check_in && form.check_out && new Date(form.check_out) <= new Date(form.check_in))
            errs.check_out = "Check-out must be after check-in";
        if (form.late_minutes && isNaN(Number(form.late_minutes))) errs.late_minutes = "Must be a number";
        if (form.overtime_minutes && isNaN(Number(form.overtime_minutes))) errs.overtime_minutes = "Must be a number";
        setErrors(errs);
        return !Object.keys(errs).length;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setBusy(true);
        const payload = {
            status: form.status,
            attendance_date: form.attendance_date,
            check_in: form.check_in || null,
            check_out: form.check_out || null,
            late_minutes: form.late_minutes ? Number(form.late_minutes) : 0,
            overtime_minutes: form.overtime_minutes ? Number(form.overtime_minutes) : 0,
            remarks: form.remarks.trim() || null,
        };
        try {
            await onSave(payload, record?.id);
            onClose();
        } catch (err) {
            alert(err?.message ?? String(err));
        } finally {
            setBusy(false);
        }
    };

    const showTime = ["present", "late", "half_day"].includes(form.status);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div className="ma-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}>
                    <motion.div onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 32 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 32 }} transition={{ duration: 0.22 }}
                        className="ma-modal w-full max-w-lg rounded-2xl overflow-hidden">

                        {/* Header */}
                        <div className="ma-modal-header flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="ma-icon-present-bg w-9 h-9 rounded-xl flex items-center justify-center">
                                    <CalendarDays size={18} className="ma-icon-present" />
                                </div>
                                <div>
                                    <h2 className="ma-modal-title text-[16px] font-bold">
                                        {isEdit ? "Edit Attendance" : "Manual Attendance"}
                                    </h2>
                                    <p className="ma-cell-muted text-[12px]">
                                        {isEdit ? "Update your attendance record" : "Add a manual attendance entry"}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={onClose}
                                className="ma-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                                <X size={17} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

                            {/* Date */}
                            <Field label="Attendance Date" required error={errors.attendance_date}>
                                <input type="date" className={fi(errors.attendance_date)}
                                    value={form.attendance_date} onChange={set("attendance_date")}
                                    max={new Date().toISOString().split("T")[0]} />
                            </Field>

                            {/* Status grid */}
                            <div>
                                <p className="ma-field-label mb-2">
                                    Status <span className="ma-field-required">*</span>
                                </p>
                                <div className="ma-status-grid">
                                    {STATUSES.map(({ value, label, emoji }) => (
                                        <button key={value} type="button" onClick={() => pickStatus(value)}
                                            className={`ma-status-option ma-status-option-${value} ${form.status === value ? "ma-sel" : ""}`}>
                                            <span className="text-[18px] block mb-1">{emoji}</span>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {errors.status && <p className="ma-field-error mt-1">{errors.status}</p>}
                            </div>

                            {/* Check-in / Check-out */}
                            {showTime && (
                                <>
                                    <p className="ma-section-label pb-1.5">Time Details</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Check-in">
                                            <input type="datetime-local" className={fi(false)}
                                                value={form.check_in} onChange={set("check_in")} />
                                        </Field>
                                        <Field label="Check-out" error={errors.check_out}>
                                            <input type="datetime-local" className={fi(errors.check_out)}
                                                value={form.check_out} onChange={set("check_out")} />
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Late Minutes" error={errors.late_minutes}>
                                            <input type="number" min="0" className={fi(errors.late_minutes)}
                                                placeholder="0" value={form.late_minutes} onChange={set("late_minutes")} />
                                        </Field>
                                        <Field label="Overtime Minutes" error={errors.overtime_minutes}>
                                            <input type="number" min="0" className={fi(errors.overtime_minutes)}
                                                placeholder="0" value={form.overtime_minutes} onChange={set("overtime_minutes")} />
                                        </Field>
                                    </div>
                                </>
                            )}

                            {/* Remarks */}
                            <Field label="Remarks">
                                <textarea className={fi(false)} rows={2}
                                    placeholder="Optional notes…"
                                    value={form.remarks} onChange={set("remarks")} maxLength={500} />
                            </Field>
                        </div>

                        {/* Footer */}
                        <div className="ma-modal-footer flex justify-end gap-3 px-6 py-4">
                            <button type="button" onClick={onClose}
                                className="ma-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">
                                Cancel
                            </button>
                            <button type="button" disabled={busy} onClick={handleSubmit}
                                className="ma-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold active:scale-[0.97]">
                                <CircleCheck size={15} />
                                {busy ? (isEdit ? "Updating…" : "Saving…") : (isEdit ? "Update" : "Save Entry")}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ══════════════════════════════════════════════════
   DELETE CONFIRMATION MODAL
══════════════════════════════════════════════════ */
export function DeleteAttendanceModal({ isOpen, onClose, record, onConfirm }) {
    const [busy, setBusy] = useState(false);

    const handleDelete = async () => {
        setBusy(true);
        try {
            await onConfirm(record?.id);
            onClose();
        } catch (err) {
            alert(err?.message ?? String(err));
        } finally {
            setBusy(false);
        }
    };

    const dateLabel = record?.attendance_date
        ? new Date(record.attendance_date).toLocaleDateString("en-IN", {
            weekday: "long", day: "2-digit", month: "short", year: "numeric",
        })
        : "";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div className="ma-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}>
                    <motion.div onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 32 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 32 }} transition={{ duration: 0.22 }}
                        className="ma-modal w-full max-w-sm rounded-2xl overflow-hidden">

                        <div className="ma-modal-header flex items-center justify-between px-5 py-4">
                            <h2 className="ma-modal-title text-[15px] font-bold">Delete Record</h2>
                            <button type="button" onClick={onClose}
                                className="ma-close-btn w-7 h-7 rounded-full flex items-center justify-center transition-colors">
                                <X size={15} />
                            </button>
                        </div>

                        <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                            <div className="ma-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                                <Trash2 size={24} className="ma-delete-icon" />
                            </div>
                            <p className="ma-delete-title text-[15px] font-semibold">Delete this record?</p>
                            <p className="ma-delete-desc text-[13px] leading-relaxed">
                                <span className="font-semibold">{dateLabel}</span>
                                {record?.status && (
                                    <> — <span className="capitalize">{record.status.replace("_", " ")}</span></>
                                )}
                                <br />This action cannot be undone.
                            </p>
                        </div>

                        <div className="ma-modal-footer flex justify-center gap-3 px-5 py-4">
                            <button type="button" onClick={onClose}
                                className="ma-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">
                                Cancel
                            </button>
                            <button type="button" disabled={busy} onClick={handleDelete}
                                className="ma-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold active:scale-[0.97]">
                                {busy ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}