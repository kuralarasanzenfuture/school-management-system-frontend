import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CircleCheck, FileText } from "lucide-react";
import { useDispatch } from "react-redux";
import { addEmployeeLeaveType, editEmployeeLeaveType } from "../../../../redux/employeeLeaveType/employeeLeaveTypeSlice.js";
import "../styles/LeaveType.css";

const INIT = {
    name: "",
    code: "",
    description: "",
    days_per_year: "",
    max_days_per_request: "",
    is_paid: true,
    carry_forward: false,
    max_carry_forward_days: "",
    allow_half_day: true,
    requires_approval: true,
    requires_attachment: false,
    applicable_gender: "all",
    status: "active",
};

/* ── reusable field wrapper ── */
function Field({ label, required, error, hint, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="lt-field-label">
                {label}{required && <span className="lt-field-required ml-0.5">*</span>}
            </label>
            {children}
            {hint && !error && <p className="lt-cell-muted text-[11px] mt-0.5">{hint}</p>}
            <div className="h-4">
                {error && <p className="lt-field-error">{error}</p>}
            </div>
        </div>
    );
}

/* ── toggle switch ── */
function Toggle({ id, checked, onChange, label }) {
    return (
        <div className="lt-toggle-wrap">
            <label className="lt-toggle" htmlFor={id}>
                <input id={id} type="checkbox" checked={checked} onChange={onChange} />
                <span className="lt-toggle-knob" />
            </label>
            <label htmlFor={id} className="lt-toggle-label">{label}</label>
        </div>
    );
}

const fi = (hasError) => `lt-form-input${hasError ? " lt-form-input-error" : ""}`;

export default function LeaveTypeModal({
    isOpen,
    onClose,
    leaveType = null,
    schoolId = null,
}) {
    const dispatch = useDispatch();
    const isEdit = Boolean(leaveType?.id);

    const [formData, setFormData] = useState(INIT);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    /* ── Hydrate ── */
    useEffect(() => {
        if (!isOpen) return;
        if (isEdit && leaveType) {
            setFormData({
                name: leaveType.name ?? "",
                code: leaveType.code ?? "",
                description: leaveType.description ?? "",
                days_per_year: leaveType.days_per_year != null ? String(leaveType.days_per_year) : "",
                max_days_per_request: leaveType.max_days_per_request != null ? String(leaveType.max_days_per_request) : "",
                is_paid: Boolean(Number(leaveType.is_paid ?? 1)),
                carry_forward: Boolean(Number(leaveType.carry_forward ?? 0)),
                max_carry_forward_days: leaveType.max_carry_forward_days != null ? String(leaveType.max_carry_forward_days) : "",
                allow_half_day: Boolean(Number(leaveType.allow_half_day ?? 1)),
                requires_approval: Boolean(Number(leaveType.requires_approval ?? 1)),
                requires_attachment: Boolean(Number(leaveType.requires_attachment ?? 0)),
                applicable_gender: leaveType.applicable_gender ?? "all",
                status: leaveType.status ?? "active",
            });
        } else {
            setFormData(INIT);
        }
        setErrors({});
    }, [isOpen, isEdit, leaveType]);

    /* ── Handlers ── */
    const handleChange = (fieldKey) => (event) => {
        const value = event.target.type === "checkbox"
            ? event.target.checked
            : event.target.value;
        setFormData((prev) => ({ ...prev, [fieldKey]: value }));
        setErrors((prev) => prev[fieldKey] ? { ...prev, [fieldKey]: null } : prev);
    };

    /* ── Validation ── */
    const validate = () => {
        const validationErrors = {};
        if (!formData.name.trim()) validationErrors.name = "Leave type name is required";
        if (!formData.code.trim()) validationErrors.code = "Code is required";
        else if (!/^[A-Z0-9_-]{1,20}$/.test(formData.code.toUpperCase()))
            validationErrors.code = "Use uppercase letters, numbers, _ or – only";
        if (!formData.days_per_year || isNaN(Number(formData.days_per_year)) || Number(formData.days_per_year) < 0)
            validationErrors.days_per_year = "Enter a valid number of days";
        if (formData.max_days_per_request && isNaN(Number(formData.max_days_per_request)))
            validationErrors.max_days_per_request = "Must be a number";
        if (formData.carry_forward && formData.max_carry_forward_days && isNaN(Number(formData.max_carry_forward_days)))
            validationErrors.max_carry_forward_days = "Must be a number";
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        const payload = {
            school_id: schoolId,
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            description: formData.description.trim() || null,
            days_per_year: Number(formData.days_per_year),
            max_days_per_request: formData.max_days_per_request ? Number(formData.max_days_per_request) : null,
            is_paid: formData.is_paid,
            carry_forward: formData.carry_forward,
            max_carry_forward_days: formData.carry_forward && formData.max_carry_forward_days
                ? Number(formData.max_carry_forward_days) : 0,
            allow_half_day: formData.allow_half_day,
            requires_approval: formData.requires_approval,
            requires_attachment: formData.requires_attachment,
            applicable_gender: formData.applicable_gender,
            status: formData.status,
        };
        try {
            if (isEdit) {
                await dispatch(editEmployeeLeaveType({ id: leaveType.id, payload })).unwrap();
            } else {
                await dispatch(addEmployeeLeaveType(payload)).unwrap();
            }
            onClose();
        } catch (submissionError) {
            alert(submissionError?.message ?? String(submissionError));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="lt-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 32 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 32 }}
                        transition={{ duration: 0.22 }}
                        className="lt-modal w-full max-w-2xl rounded-2xl overflow-hidden"
                    >
                        {/* ── Header ── */}
                        <div className="lt-modal-header flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="lt-icon-total-bg w-9 h-9 rounded-xl flex items-center justify-center">
                                    <FileText size={18} className="lt-icon-total" />
                                </div>
                                <div>
                                    <h2 className="lt-modal-title text-[16px] font-bold tracking-tight">
                                        {isEdit ? "Edit Leave Type" : "New Leave Type"}
                                    </h2>
                                    <p className="lt-cell-muted text-[12px]">
                                        {isEdit ? "Update leave type configuration" : "Define a new leave category for employees"}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={onClose}
                                className="lt-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                                <X size={17} />
                            </button>
                        </div>

                        {/* ── Body ── */}
                        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

                            {/* ── Basic info ── */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">
                                <Field label="Leave Type Name" required error={errors.name}>
                                    <input className={fi(errors.name)} placeholder="e.g. Casual Leave"
                                        value={formData.name} onChange={handleChange("name")} />
                                </Field>
                                <Field label="Code" required error={errors.code}
                                    hint="Short unique identifier e.g. CL, SL, EL">
                                    <input className={fi(errors.code)} placeholder="e.g. CL"
                                        value={formData.code} onChange={handleChange("code")}
                                        maxLength={20} style={{ textTransform: "uppercase" }} />
                                </Field>
                                <div className="sm:col-span-2">
                                    <Field label="Description">
                                        <textarea className={fi(false)} rows={2}
                                            placeholder="Brief description of this leave type…"
                                            value={formData.description} onChange={handleChange("description")} />
                                    </Field>
                                </div>
                            </div>

                            {/* ── Days config ── */}
                            <p className="lt-section-label pb-1.5">Days Configuration</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">
                                <Field label="Days Per Year" required error={errors.days_per_year}>
                                    <input type="number" min="0" step="0.5" className={fi(errors.days_per_year)}
                                        placeholder="12" value={formData.days_per_year} onChange={handleChange("days_per_year")} />
                                </Field>
                                <Field label="Max Days Per Request" error={errors.max_days_per_request}
                                    hint="Leave blank for no limit">
                                    <input type="number" min="0" step="0.5" className={fi(errors.max_days_per_request)}
                                        placeholder="Optional" value={formData.max_days_per_request}
                                        onChange={handleChange("max_days_per_request")} />
                                </Field>
                            </div>

                            {/* ── Carry forward ── */}
                            <div className="flex flex-col gap-3">
                                <Toggle id="carry_forward" checked={formData.carry_forward}
                                    onChange={handleChange("carry_forward")} label="Allow carry forward to next year" />
                                {formData.carry_forward && (
                                    <div className="pl-12 max-w-xs">
                                        <Field label="Max Carry Forward Days" error={errors.max_carry_forward_days}
                                            hint="Leave blank for no limit">
                                            <input type="number" min="0" step="0.5" className={fi(errors.max_carry_forward_days)}
                                                placeholder="e.g. 10" value={formData.max_carry_forward_days}
                                                onChange={handleChange("max_carry_forward_days")} />
                                        </Field>
                                    </div>
                                )}
                            </div>

                            {/* ── Options ── */}
                            <p className="lt-section-label pb-1.5">Leave Options</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Toggle id="is_paid" checked={formData.is_paid} onChange={handleChange("is_paid")} label="Paid leave" />
                                <Toggle id="allow_half_day" checked={formData.allow_half_day} onChange={handleChange("allow_half_day")} label="Allow half-day requests" />
                                <Toggle id="requires_approval" checked={formData.requires_approval} onChange={handleChange("requires_approval")} label="Requires manager approval" />
                                <Toggle id="requires_attachment" checked={formData.requires_attachment} onChange={handleChange("requires_attachment")} label="Requires document upload" />
                            </div>

                            {/* ── Gender & status ── */}
                            <p className="lt-section-label pb-1.5">Eligibility & Status</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">
                                <Field label="Applicable Gender">
                                    <select className={fi(false)} value={formData.applicable_gender}
                                        onChange={handleChange("applicable_gender")}>
                                        <option value="all">All</option>
                                        <option value="male">Male only</option>
                                        <option value="female">Female only</option>
                                    </select>
                                </Field>
                                <Field label="Status">
                                    <select className={fi(false)} value={formData.status} onChange={handleChange("status")}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </Field>
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div className="lt-modal-footer flex items-center justify-end gap-3 px-6 py-4">
                            <button type="button" onClick={onClose}
                                className="lt-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">
                                Cancel
                            </button>
                            <button type="button" disabled={submitting} onClick={handleSubmit}
                                className="lt-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors active:scale-[0.97]">
                                <CircleCheck size={15} />
                                {submitting
                                    ? isEdit ? "Updating…" : "Saving…"
                                    : isEdit ? "Update Leave Type" : "Save Leave Type"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}