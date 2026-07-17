import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CircleCheck, LayoutList, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    addEmployeeSalaryStructure,
    editEmployeeSalaryStructure,
    fetchEmployeeSalaryStructures,
    fetchEmployeeSalaryStructureById,
} from "../../../../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";


/* ── Field wrapper ── */
function Field({ label, required, error, hint, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="ss-field-label">
                {label}{required && <span className="ss-field-required ml-0.5">*</span>}
            </label>
            {children}
            {hint && !error && <p className="ss-cell-muted text-[11px] mt-0.5">{hint}</p>}
            <div className="h-4">
                {error && <p className="ss-field-error">{error}</p>}
            </div>
        </div>
    );
}

const fi = (hasError) => `ss-form-input${hasError ? " ss-form-input-error" : ""}`;

function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

/* ─────────────────────────────────────── */

export default function SalaryStructureModal({
    isOpen,
    onClose,
    structure = null,       // null = create mode, object = edit mode
}) {
    const dispatch = useDispatch();
    const isEdit = Boolean(structure?.id);

    /* employees from redux — assumes employeeSlice with state.employees.employees */
    const employees = useSelector((state) => state.employees?.employees ?? []);
    const empLoading = useSelector((state) => state.employees?.loading ?? false);

    const [employeeSearch, setEmployeeSearch] = useState("");

    /* ── Form state ── */
    const [formData, setFormData] = useState({
        employee_id: "",
        effective_from: "",
        effective_to: "",
        status: "active",
        remarks: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    /* ── Filtered employee list ── */
    const filteredEmployees = useMemo(() => {
        const query = employeeSearch.trim().toLowerCase();
        if (!query) return employees;
        return employees.filter(
            (emp) =>
                `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(query) ||
                emp.employee_code?.toLowerCase().includes(query) ||
                emp.designation?.toLowerCase().includes(query),
        );
    }, [employees, employeeSearch]);

    /* ── Hydrate on open ── */
    useEffect(() => {
        if (!isOpen) return;
        if (isEdit && structure) {
            setFormData({
                employee_id: structure.employee_id ?? "",
                effective_from: structure.effective_from
                    ? structure.effective_from.split("T")[0].split(" ")[0]
                    : "",
                effective_to: structure.effective_to
                    ? structure.effective_to.split("T")[0].split(" ")[0]
                    : "",
                status: structure.status ?? "active",
                remarks: structure.remarks ?? "",
            });
        } else {
            setFormData({ employee_id: "", effective_from: "", effective_to: "", status: "active", remarks: "" });
            setEmployeeSearch("");
        }
        setErrors({});
    }, [isOpen, isEdit, structure]);

    /* ── Unified handler ── */
    const handleChange = (key) => (e) => {
        setFormData((prev) => ({ ...prev, [key]: e.target.value }));
        setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev));
    };

    /* ── Selected employee for preview ── */
    const selectedEmployee = useMemo(
        () => employees.find((emp) => String(emp.id) === String(formData.employee_id)),
        [employees, formData.employee_id],
    );

    /* ── Auto structure name preview ── */
    const structureNamePreview = useMemo(() => {
        if (!selectedEmployee || !formData.effective_from) return "";
        const year = new Date(formData.effective_from).getFullYear();
        const name = `${selectedEmployee.first_name} ${selectedEmployee.last_name}`.trim();
        const designation = selectedEmployee.designation ?? "";
        return `${name}${designation ? ` - ${designation}` : ""} ${year}`;
    }, [selectedEmployee, formData.effective_from]);

    /* ── Validation ── */
    const validate = () => {
        const errs = {};
        if (!isEdit && !formData.employee_id)
            errs.employee_id = "Please select an employee";
        if (!formData.effective_from)
            errs.effective_from = "Effective from date is required";
        if (formData.effective_to && formData.effective_from) {
            if (new Date(formData.effective_to) <= new Date(formData.effective_from))
                errs.effective_to = "Effective to must be after effective from";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);

        try {
            if (isEdit) {
                /* Update: only send editable fields */
                const payload = {
                    effective_to: formData.effective_to || null,
                    status: formData.status,
                    remarks: formData.remarks.trim() || null,
                };
                await dispatch(editEmployeeSalaryStructure({ id: structure.id, data: payload })).unwrap();
            } else {
                /* Create: minimal payload — backend derives structure_name and school_id */
                const payload = {
                    employee_id: Number(formData.employee_id),
                    effective_from: formData.effective_from,
                    remarks: formData.remarks.trim() || null,
                };
                await dispatch(addEmployeeSalaryStructure(payload)).unwrap();
            }
            await dispatch(fetchEmployeeSalaryStructures()).unwrap();
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
                    className="ss-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 32 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 32 }}
                        transition={{ duration: 0.22 }}
                        className="ss-modal w-full max-w-lg rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="ss-modal-header flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="ss-icon-total-bg w-9 h-9 rounded-xl flex items-center justify-center">
                                    <LayoutList size={18} className="ss-icon-total" />
                                </div>
                                <div>
                                    <h2 className="ss-modal-title text-[16px] font-bold tracking-tight">
                                        {isEdit ? "Edit Salary Structure" : "New Salary Structure"}
                                    </h2>
                                    <p className="ss-cell-muted text-[12px]">
                                        {isEdit
                                            ? `Editing: ${structure?.structure_name}`
                                            : "Assign a salary structure to an employee"}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={onClose}
                                className="ss-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                                <X size={17} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

                            {/* ── Create mode: Employee selector ── */}
                            {!isEdit && (
                                <>
                                    <p className="ss-section-label pb-1.5">Employee</p>

                                    {/* Search within dropdown */}
                                    <div className="flex flex-col gap-1">
                                        <label className="ss-field-label">
                                            Select Employee <span className="ss-field-required">*</span>
                                        </label>

                                        {/* Search box */}
                                        <div className="ss-search-wrap flex items-center gap-2 rounded-lg px-3 py-2.5 mb-1">
                                            <Search size={14} className="ss-search-icon shrink-0" />
                                            <input
                                                className="ss-search-input text-[13.5px]"
                                                placeholder="Search by name, code or designation…"
                                                value={employeeSearch}
                                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                            />
                                        </div>

                                        <select
                                            className={`${fi(errors.employee_id)} h-[120px]`}
                                            size={5}
                                            value={formData.employee_id}
                                            onChange={handleChange("employee_id")}
                                        >
                                            <option value="">— Select an employee —</option>
                                            {filteredEmployees.map((emp) => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.first_name} {emp.last_name}
                                                    {emp.employee_code ? ` (${emp.employee_code})` : ""}
                                                    {emp.designation ? ` · ${emp.designation}` : ""}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="h-4">
                                            {errors.employee_id && (
                                                <p className="ss-field-error">{errors.employee_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Selected employee preview */}
                                    {selectedEmployee && (
                                        <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                                            style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
                                            <div className="ss-avatar w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0">
                                                {selectedEmployee.first_name?.[0]}{selectedEmployee.last_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="ss-cell-primary text-[13.5px] font-semibold">
                                                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                                                </p>
                                                <p className="ss-cell-muted text-[12px]">
                                                    {selectedEmployee.designation}
                                                    {selectedEmployee.employee_code ? ` · ${selectedEmployee.employee_code}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ── Edit mode: show read-only employee info ── */}
                            {isEdit && (
                                <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                                    style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
                                    <div className="ss-avatar w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0">
                                        {structure?.first_name?.[0]}{structure?.last_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="ss-cell-primary text-[13.5px] font-semibold">
                                            {structure?.first_name} {structure?.last_name}
                                        </p>
                                        <p className="ss-cell-muted text-[12px]">{structure?.designation}</p>
                                    </div>
                                </div>
                            )}

                            {/* ── Dates ── */}
                            <p className="ss-section-label pb-1.5">Effective Period</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">

                                {/* effective_from — create only */}
                                {!isEdit ? (
                                    <Field label="Effective From" required error={errors.effective_from}>
                                        <input type="date" className={fi(errors.effective_from)}
                                            value={formData.effective_from} onChange={handleChange("effective_from")} />
                                    </Field>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <label className="ss-field-label">Effective From</label>
                                        <div className="ss-form-input ss-form-input-disabled">
                                            {formatDate(structure?.effective_from)}
                                        </div>
                                        <div className="h-4" />
                                    </div>
                                )}

                                {/* effective_to — edit only */}
                                <Field label="Effective To" error={errors.effective_to}
                                    hint={!isEdit ? "Leave blank for open-ended" : ""}>
                                    <input type="date"
                                        className={fi(errors.effective_to)}
                                        disabled={!isEdit}
                                        value={formData.effective_to}
                                        onChange={handleChange("effective_to")}
                                    />
                                </Field>
                            </div>

                            {/* ── Structure name preview (create only) ── */}
                            {!isEdit && structureNamePreview && (
                                <div className="flex flex-col gap-1">
                                    <label className="ss-field-label">Structure Name (auto-generated)</label>
                                    <div className="ss-preview-box">{structureNamePreview}</div>
                                </div>
                            )}

                            {/* ── Status (edit only) ── */}
                            {isEdit && (
                                <Field label="Status">
                                    <select className={fi(false)} value={formData.status}
                                        onChange={handleChange("status")}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </Field>
                            )}

                            {/* ── Remarks ── */}
                            <Field label="Remarks">
                                <textarea className={fi(false)} rows={2}
                                    placeholder="Optional notes about this salary structure…"
                                    value={formData.remarks} onChange={handleChange("remarks")} />
                            </Field>
                        </div>

                        {/* Footer */}
                        <div className="ss-modal-footer flex items-center justify-end gap-3 px-6 py-4">
                            <button type="button" onClick={onClose}
                                className="ss-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">
                                Cancel
                            </button>
                            <button type="button" disabled={submitting} onClick={handleSubmit}
                                className="ss-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors active:scale-[0.97]">
                                <CircleCheck size={15} />
                                {submitting
                                    ? isEdit ? "Updating…" : "Saving…"
                                    : isEdit ? "Update Structure" : "Create Structure"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}