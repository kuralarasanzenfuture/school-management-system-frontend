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
// ASSUMPTION: follows the same naming pattern as the other list thunks in
// this app (fetchStudents, fetchClasses, etc). Adjust this import + export
// name if employeeSlice.js uses a different thunk name for listing
// employees. This is the actual fix for "employee search not working" —
// nothing was ever dispatching a fetch, so state.employees.employees was
// permanently empty and the search box had nothing to filter.
import { fetchEmployees } from "../../../../redux/employee/employeeSlice.js";


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
    // console.log(employees);
    const empLoading = useSelector((state) => state.employees?.loading ?? false);

    const [employeeSearch, setEmployeeSearch] = useState("");

    const { user } = useSelector((state) => state.auth);
    const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const schoolId = isAdmin ? null : user?.school_id;

    /* ── Form state ── */
    const [formData, setFormData] = useState({
        employee_id: "",
        effective_from: "",
        effective_to: "",
        status: "active",
        remarks: "",
    });
    // Admin-only: which school's employees to browse when creating a new
    // structure. Not part of formData/the submit payload — same pattern as
    // StudentAdmissionForm's school picker, used purely for scoping.
    const [selectedSchool, setSelectedSchool] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const effectiveSchoolId = isAdmin ? selectedSchool : schoolId;
    const needsSchoolFirst = !isEdit && isAdmin && !effectiveSchoolId;

    /* ── Fetch schools (admin) ── */
    useEffect(() => {
        if (isAdmin) dispatch(fetchSchools());
    }, [dispatch, isAdmin]);

    /* ── Fetch employees, scoped to the effective school ──
       Re-fetches whenever the effective school changes, passing it along
       in case the thunk filters server-side (harmless if it ignores the
       extra argument — same assumption used elsewhere in this app). */
    useEffect(() => {
        if (!isOpen) return;
        if (isAdmin && !effectiveSchoolId) return;
        dispatch(fetchEmployees(effectiveSchoolId));
    }, [dispatch, isOpen, isAdmin, effectiveSchoolId]);

    /* ── School-scoped + search-filtered employee list ──
       Client-side school filter as a safety net even if the fetch above
       already filtered server-side — mirrors the scopedTo() pattern used
       in StudentAdmissionForm/ClassSectionForm. */
    const filteredEmployees = useMemo(() => {
        let list = employees;

        if (effectiveSchoolId) {
            list = list.filter(
                (emp) =>
                    emp.school_id == null ||
                    String(emp.school_id) === String(effectiveSchoolId),
            );
        }

        const query = employeeSearch.trim().toLowerCase();
        if (!query) return list;
        return list.filter(
            (emp) =>
                `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(query) ||
                emp.employee_code?.toLowerCase().includes(query) ||
                emp.designation?.toLowerCase().includes(query) ||
                emp.mobile?.toLowerCase().includes(query),
        );
    }, [employees, employeeSearch, effectiveSchoolId]);

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
            setSelectedSchool(isAdmin ? "" : (schoolId ?? ""));
        }
        setErrors({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isEdit, structure]);

    /* ── Changing the school (admin, create mode) clears any previously
       picked employee, since it may not belong to the new school ── */
    const handleSchoolChange = (e) => {
        const value = e.target.value;
        setSelectedSchool(value);
        setFormData((prev) => ({ ...prev, employee_id: "" }));
        setErrors((prev) => ({ ...prev, school_id: null, employee_id: null }));
    };

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
        if (!isEdit && isAdmin && !selectedSchool)
            errs.school_id = "Please select a school";
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

                            {/* ── Create mode: School (admin only) + Employee selector ── */}
                            {!isEdit && (
                                <>
                                    <p className="ss-section-label pb-1.5">Employee</p>

                                    {/* School filter — ADMIN only, scopes the employee list below */}
                                    {isAdmin && (
                                        <Field label="School" required error={errors.school_id}>
                                            <select
                                                className={fi(errors.school_id)}
                                                value={selectedSchool}
                                                onChange={handleSchoolChange}
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
                                        </Field>
                                    )}

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
                                                placeholder={
                                                    needsSchoolFirst
                                                        ? "Select a school first…"
                                                        : "Search by name, mobile, code or designation…"
                                                }
                                                value={employeeSearch}
                                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                                disabled={needsSchoolFirst}
                                            />
                                        </div>

                                        <select
                                            className={`${fi(errors.employee_id)} h-[120px]`}
                                            size={5}
                                            value={formData.employee_id}
                                            onChange={handleChange("employee_id")}
                                            disabled={needsSchoolFirst || empLoading}
                                        >
                                            <option value="">
                                                {needsSchoolFirst
                                                    ? "Select a school first"
                                                    : empLoading
                                                        ? "Loading employees…"
                                                        : filteredEmployees.length === 0
                                                            ? "No employees found"
                                                            : "— Select an employee —"}
                                            </option>
                                            {filteredEmployees.map((emp) => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.first_name} {emp.last_name}
                                                    {/* {emp.employee_code ? ` (${emp.employee_code})` : ""} */}
                                                    {emp.mobile ? ` · (${emp.mobile})` : ""}
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