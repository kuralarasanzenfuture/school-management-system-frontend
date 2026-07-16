import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CircleCheck, DollarSign } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    addEmployeeSalaryComponent,
    editEmployeeSalaryComponent,
    fetchEmployeeSalaryComponents,
} from "../../../../redux/employee_salary_component/employeeSalaryComponentSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import "../styles/SalaryComponent.css";

const INIT = {
    school_id: "",
    name: "",
    code: "",
    description: "",
    type: "earning",
    calculation_type: "fixed",
    // value: "",
    // is_taxable: false,
    status: "active",
};

/* ── Field wrapper ── */
function Field({ label, required, error, hint, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="sc-field-label">
                {label}{required && <span className="sc-field-required ml-0.5">*</span>}
            </label>
            {children}
            {hint && !error && <p className="sc-cell-muted text-[11px] mt-0.5">{hint}</p>}
            <div className="h-4">
                {error && <p className="sc-field-error">{error}</p>}
            </div>
        </div>
    );
}

/* ── Toggle switch ── */
function Toggle({ id, checked, onChange, label }) {
    return (
        <div className="sc-sw-wrap">
            <label className="sc-sw" htmlFor={id}>
                <input id={id} type="checkbox" checked={checked} onChange={onChange} />
                <span className="sc-sw-knob" />
            </label>
            <label htmlFor={id} className="sc-sw-label">{label}</label>
        </div>
    );
}

const fi = (hasError) => `sc-form-input${hasError ? " sc-form-input-error" : ""}`;

export default function SalaryComponentModal({
    isOpen,
    onClose,
    component = null,
    schoolId = null,
}) {
    const dispatch = useDispatch();
    const isEdit = Boolean(component?.id);

    const { user } = useSelector((state) => state.auth);
    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const userSchoolId = user?.school_id ?? null;

    const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

    const [formData, setFormData] = useState(INIT);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    /* ── Fetch schools for admin ── */
    useEffect(() => {
        if (isAdmin && isOpen && schools.length === 0) dispatch(fetchSchools());
    }, [dispatch, isAdmin, isOpen, schools.length]);

    /* ── Hydrate ── */
    useEffect(() => {
        if (!isOpen) return;
        if (isEdit && component) {
            setFormData({
                school_id: component.school_id ?? "",
                name: component.name ?? "",
                code: component.code ?? "",
                description: component.description ?? "",
                type: component.type ?? "earning",
                calculation_type: component.calculation_type ?? "fixed",
                // value: component.value != null ? String(component.value) : "",
                // is_taxable: Boolean(Number(component.is_taxable ?? 0)),
                status: component.status ?? "active",
            });
        } else {
            setFormData({
                ...INIT,
                school_id: isAdmin ? "" : String(schoolId ?? userSchoolId ?? ""),
            });
        }
        setErrors({});
    }, [isOpen, isEdit, component, isAdmin, schoolId, userSchoolId]);

    /* ── Unified handler ── */
    const handleChange = (key) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setFormData((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev));
    };

    /* ── Validate ── */
    const validate = () => {
        const errs = {};
        if (isAdmin && !formData.school_id)
            errs.school_id = "Please select a school";
        if (!formData.name.trim())
            errs.name = "Component name is required";
        if (!formData.code.trim())
            errs.code = "Code is required";
        else if (!/^[A-Z0-9_-]{1,20}$/.test(formData.code.toUpperCase()))
            errs.code = "Use uppercase letters, numbers, _ or – only";
        // if (!formData.value || isNaN(Number(formData.value)) || Number(formData.value) < 0)
        //     errs.value = "Enter a valid positive value";
        // if (formData.calculation_type === "percentage" && Number(formData.value) > 100)
        //     errs.value = "Percentage cannot exceed 100";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);

        const resolvedSchoolId = isAdmin
            ? Number(formData.school_id)
            : Number(schoolId ?? userSchoolId);

        const payload = {
            school_id: resolvedSchoolId,
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            description: formData.description.trim() || null,
            component_type: formData.type,
            calculation_type: formData.calculation_type,
            // value: Number(formData.value),
            // is_taxable: formData.is_taxable,
            status: formData.status,
        };

        try {
            if (isEdit) {
                await dispatch(editEmployeeSalaryComponent({ id: component.id, data: payload })).unwrap();
            } else {
                await dispatch(addEmployeeSalaryComponent(payload)).unwrap();
            }
            dispatch(fetchEmployeeSalaryComponents());
            onClose();
        } catch (err) {
            alert(err?.message ?? String(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="sc-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 32 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 32 }}
                        transition={{ duration: 0.22 }}
                        className="sc-modal w-full max-w-xl rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sc-modal-header flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="sc-icon-total-bg w-9 h-9 rounded-xl flex items-center justify-center">
                                    <DollarSign size={18} className="sc-icon-total" />
                                </div>
                                <div>
                                    <h2 className="sc-modal-title text-[16px] font-bold tracking-tight">
                                        {isEdit ? "Edit Salary Component" : "New Salary Component"}
                                    </h2>
                                    <p className="sc-cell-muted text-[12px]">
                                        {isEdit ? "Update component details" : "Define an earning or deduction component"}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={onClose}
                                className="sc-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                                <X size={17} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

                            {/* Admin school selector */}
                            {isAdmin && (
                                <Field label="School" required error={errors.school_id}>
                                    <select className={fi(errors.school_id)} value={formData.school_id}
                                        onChange={handleChange("school_id")} disabled={schoolsLoading}>
                                        <option value="">
                                            {schoolsLoading ? "Loading schools…" : "Select a school"}
                                        </option>
                                        {schools.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </Field>
                            )}

                            {/* Basic info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">
                                <Field label="Component Name" required error={errors.name}>
                                    <input className={fi(errors.name)} placeholder="e.g. Basic Salary"
                                        value={formData.name} onChange={handleChange("name")} maxLength={100} style={{ textTransform: "uppercase" }} />
                                </Field>
                                <Field label="Code" required error={errors.code}
                                    hint="Unique short code e.g. BASIC, HRA, PF">
                                    <input className={fi(errors.code)} placeholder="e.g. BASIC"
                                        value={formData.code} onChange={handleChange("code")}
                                        maxLength={20} style={{ textTransform: "uppercase" }} />
                                </Field>
                                <div className="sm:col-span-2">
                                    <Field label="Description">
                                        <textarea className={fi(false)} rows={2}
                                            placeholder="Brief description of this component…"
                                            value={formData.description} onChange={handleChange("description")} />
                                    </Field>
                                </div>
                            </div>

                            {/* Type & Calculation */}
                            <p className="sc-section-label pb-1.5">Component Configuration</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">
                                <Field label="Component Type" required>
                                    <select className={fi(false)} value={formData.type}
                                        onChange={handleChange("type")}>
                                        <option value="earning">Earning</option>
                                        <option value="deduction">Deduction</option>
                                        {/* <option value="benefit">Benefit</option> */}
                                    </select>
                                </Field>
                                <Field label="Calculation Type" required>
                                    <select className={fi(false)} value={formData.calculation_type}
                                        onChange={handleChange("calculation_type")}>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                        <option value="percentage">Percentage (%)</option>
                                    </select>
                                </Field>
                                {/* <Field label={formData.calculation_type === "percentage" ? "Percentage Value (%)" : "Fixed Amount (₹)"}
                                    required error={errors.value}
                                    hint={formData.calculation_type === "percentage" ? "Enter a value between 0–100" : "Enter amount in rupees"}>
                                    <input type="number" min="0" step="0.01"
                                        className={fi(errors.value)}
                                        placeholder={formData.calculation_type === "percentage" ? "e.g. 12.5" : "e.g. 5000"}
                                        value={formData.value} onChange={handleChange("value")} />
                                </Field> */}
                                <Field label="Status">
                                    <select className={fi(false)} value={formData.status} onChange={handleChange("status")}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </Field>
                            </div>

                            {/* Options */}
                            {/* <p className="sc-section-label pb-1.5">Tax & Options</p>
                            <Toggle id="is_taxable" checked={formData.is_taxable}
                                onChange={handleChange("is_taxable")} label="This component is taxable" /> */}
                        </div>

                        {/* Footer */}
                        <div className="sc-modal-footer flex items-center justify-end gap-3 px-6 py-4">
                            <button type="button" onClick={onClose}
                                className="sc-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">
                                Cancel
                            </button>
                            <button type="button" disabled={submitting} onClick={handleSubmit}
                                className="sc-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors active:scale-[0.97]">
                                <CircleCheck size={15} />
                                {submitting
                                    ? isEdit ? "Updating…" : "Saving…"
                                    : isEdit ? "Update Component" : "Save Component"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}