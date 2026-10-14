import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CircleCheck, DollarSign } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    addEmployeeSalaryComponent,
    editEmployeeSalaryComponent,
    fetchEmployeeSalaryComponents,
} from "../../../../redux/employee_salary_component/employeeSalaryComponentSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import "../styles/SalaryComponent.css";

const COMPONENT_TYPE_OPTIONS = [
    { value: "earning", label: "Earning" },
    { value: "deduction", label: "Deduction" },
];

const CALCULATION_TYPE_OPTIONS = [
    { value: "fixed", label: "Fixed Amount (₹)" },
    { value: "percentage", label: "Percentage (%)" },
];

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const INIT = {
    school_id: "",
    name: "",
    code: "",
    description: "",
    type: "earning",
    calculation_type: "fixed",
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

    const schoolList = useMemo(() => {
        const raw = Array.isArray(schools)
            ? schools
            : schools?.schools || schools?.data || [];
        return Array.isArray(raw) ? raw : [];
    }, [schools]);

    const schoolOptions = useMemo(
        () =>
            schoolList.map((s) => ({
                value: String(s.id),
                label: s.name,
            })),
        [schoolList],
    );

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
                school_id: component.school_id ? String(component.school_id) : "",
                name: component.name ?? "",
                code: component.code ?? "",
                description: component.description ?? "",
                type: component.component_type ?? component.type ?? "earning",
                calculation_type: component.calculation_type ?? "fixed",
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
        const value = e.target.value;
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
        else if (!/^[A-Z0-9_-]{1,30}$/.test(formData.code.toUpperCase()))
            errs.code = "Use uppercase letters, numbers, _ or – only";
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
                    className="sc-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
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
                        style={{ background: "var(--panel-bg)" }}
                    >
                        {/* Header */}
                        <div className="sc-modal-header flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="sc-icon-total-bg w-9 h-9 rounded-xl flex items-center justify-center">
                                    <DollarSign size={18} className="sc-icon-total" />
                                </div>
                                <div>
                                    <h2 className="sc-modal-title text-[16px] font-bold">
                                        {isEdit ? "Edit Salary Component" : "Add Salary Component"}
                                    </h2>
                                    <p className="sc-cell-muted text-[12px]">
                                        {isEdit
                                            ? "Update details of this salary component"
                                            : "Define a new component for payroll calculation"}
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
                                    <CustomDropdown
                                        options={schoolOptions}
                                        value={formData.school_id ? String(formData.school_id) : ""}
                                        onChange={(val) => {
                                            setFormData((prev) => ({ ...prev, school_id: val }));
                                            if (errors.school_id) setErrors((prev) => ({ ...prev, school_id: null }));
                                        }}
                                        placeholder={schoolsLoading ? "Loading schools…" : "Select a school"}
                                        searchable={schoolOptions.length > 5}
                                        searchPlaceholder="Search schools…"
                                        disabled={schoolsLoading}
                                        hasError={Boolean(errors.school_id)}
                                        className="w-full"
                                    />
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
                                        maxLength={30} style={{ textTransform: "uppercase" }} />
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
                            <p className="sc-section-label pb-1.5 font-semibold text-[13px] border-b border-[var(--divider)]">Component Configuration</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">
                                <Field label="Component Type" required>
                                    <CustomDropdown
                                        options={COMPONENT_TYPE_OPTIONS}
                                        value={formData.type}
                                        onChange={(val) => setFormData((prev) => ({ ...prev, type: val }))}
                                        placeholder="Select component type"
                                        className="w-full"
                                    />
                                </Field>
                                <Field label="Calculation Type" required>
                                    <CustomDropdown
                                        options={CALCULATION_TYPE_OPTIONS}
                                        value={formData.calculation_type}
                                        onChange={(val) => setFormData((prev) => ({ ...prev, calculation_type: val }))}
                                        placeholder="Select calculation type"
                                        className="w-full"
                                    />
                                </Field>
                                <Field label="Status">
                                    <CustomDropdown
                                        options={STATUS_OPTIONS}
                                        value={formData.status}
                                        onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                                        placeholder="Select status"
                                        className="w-full"
                                    />
                                </Field>
                            </div>
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