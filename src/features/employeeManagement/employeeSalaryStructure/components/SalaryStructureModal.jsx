import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CircleCheck, LayoutList, Search, AlertTriangle, AlertCircle } from "lucide-react";
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
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import { getFullImageUrl } from "../../../../config/env.js";


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

    /* salary structures from redux to detect overlaps */
    const allStructures = useSelector(
        (state) => state.employeeSalaryStructure?.employeeSalaryStructures ?? [],
    );

    const [employeeSearch, setEmployeeSearch] = useState("");
    const [serverError, setServerError] = useState(null);

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

    const effectiveSchoolId = isAdmin ? selectedSchool : schoolId;
    const needsSchoolFirst = !isEdit && isAdmin && !effectiveSchoolId;

    /* ── Fetch schools (admin) ── */
    useEffect(() => {
        if (isAdmin) dispatch(fetchSchools());
    }, [dispatch, isAdmin]);

    /* ── Fetch salary structures on modal open to detect active overlaps ── */
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchEmployeeSalaryStructures());
        }
    }, [dispatch, isOpen]);

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
    }, [employees, effectiveSchoolId, employeeSearch]);

    /* ── Active structures for selected employee ── */
    const activeStructuresForEmployee = useMemo(() => {
        if (!formData.employee_id) return [];
        const raw = Array.isArray(allStructures)
            ? allStructures
            : allStructures?.data || allStructures?.structures || [];
        return raw.filter((s) => {
            if (String(s.employee_id) !== String(formData.employee_id)) return false;
            if (s.status !== "active") return false;
            if (isEdit && String(s.id) === String(structure?.id)) return false;
            return true;
        });
    }, [allStructures, formData.employee_id, isEdit, structure?.id]);

    /* ── Exact date range overlap detection ── */
    const overlappingStructure = useMemo(() => {
        if (!formData.employee_id || !formData.effective_from) return null;
        if (formData.status !== "active") return null;

        const newStart = new Date(formData.effective_from);
        if (isNaN(newStart)) return null;
        newStart.setHours(0, 0, 0, 0);

        const newEnd = formData.effective_to ? new Date(formData.effective_to) : null;
        if (newEnd) newEnd.setHours(23, 59, 59, 999);

        return activeStructuresForEmployee.find((s) => {
            const exStart = s.effective_from ? new Date(s.effective_from) : null;
            if (exStart) exStart.setHours(0, 0, 0, 0);

            const exEnd = s.effective_to ? new Date(s.effective_to) : null;
            if (exEnd) exEnd.setHours(23, 59, 59, 999);

            const startBeforeEnd = !exEnd || newStart <= exEnd;
            const endAfterStart = !newEnd || !exStart || exStart <= newEnd;
            return startBeforeEnd && endAfterStart;
        }) || null;
    }, [formData.employee_id, formData.effective_from, formData.effective_to, formData.status, activeStructuresForEmployee]);

    const employeeOptions = useMemo(() => {
        const rawStructs = Array.isArray(allStructures) ? allStructures : allStructures?.data || allStructures?.structures || [];
        const activeEmpIds = new Set(
            rawStructs.filter(s => s.status === "active").map(s => String(s.employee_id))
        );

        return filteredEmployees.map((emp) => {
            const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || emp.employee_code || "Unnamed";
            const initials = `${emp.first_name?.[0] || ""}${emp.last_name?.[0] || ""}`.toUpperCase() || "EM";
            const rawPhoto = emp.photo_url || emp.passport_size_photo_url || emp.profile_image || emp.photo || emp.avatar || emp.image;
            const photoUrl = rawPhoto ? getFullImageUrl(rawPhoto) : null;
            const hasActive = activeEmpIds.has(String(emp.id));

            const subParts = [];
            if (emp.designation) subParts.push(emp.designation);
            if (emp.department) subParts.push(emp.department);
            if (emp.mobile || emp.phone) subParts.push(emp.mobile || emp.phone);

            return {
                value: String(emp.id),
                label: fullName,
                code: emp.employee_code || null,
                sublabel: subParts.join(" · "),
                badge: hasActive ? "Active Exists" : null,
                badgeVariant: "warning",
                avatarUrl: photoUrl,
                initials: initials,
                searchText: `${fullName} ${emp.employee_code || ""} ${emp.designation || ""} ${emp.department || ""} ${emp.mobile || ""} ${emp.phone || ""}`.toLowerCase(),
            };
        });
    }, [filteredEmployees, allStructures]);

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
        setServerError(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isEdit, structure]);

    /* ── Changing the school (admin, create mode) clears any previously
       picked employee, since it may not belong to the new school ── */
    const handleSchoolChange = (e) => {
        const value = e.target.value;
        setSelectedSchool(value);
        setFormData((prev) => ({ ...prev, employee_id: "" }));
        setErrors((prev) => ({ ...prev, school_id: null, employee_id: null }));
        setServerError(null);
    };

    /* ── Unified handler ── */
    const handleChange = (key) => (e) => {
        setFormData((prev) => ({ ...prev, [key]: e.target.value }));
        setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev));
        setServerError(null);
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
        if (overlappingStructure) {
            errs.effective_from = "Active salary structure already exists for this date range";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setServerError(null);

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
            const msg = err?.message ?? String(err);
            setServerError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="ss-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
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
                        <div className="px-6 py-5 overflow-y-auto overflow-x-hidden max-h-[70vh] flex flex-col gap-5">

                            {/* ── Server error banner (if submit fails) ── */}
                            {serverError && (
                                <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 text-[12.5px]">
                                    <AlertCircle size={17} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                    <div className="flex-1 leading-snug">
                                        <p className="font-bold text-[13px] text-rose-700 dark:text-rose-300">Submission Error</p>
                                        <p className="mt-0.5">{serverError}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setServerError(null)}
                                        className="text-rose-500 hover:text-rose-700 transition-colors p-0.5"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {/* ── Create mode: School (admin only) + Employee selector ── */}
                            {!isEdit && (
                                <>
                                    <p className="ss-section-label pb-1.5">Employee</p>

                                    {/* School filter — ADMIN only, scopes the employee list below */}
                                    {isAdmin && (
                                        <Field label="School" required error={errors.school_id}>
                                            <CustomDropdown
                                                className="w-full"
                                                options={schoolOptions}
                                                value={selectedSchool}
                                                onChange={(val) => {
                                                    setSelectedSchool(val);
                                                    setFormData((prev) => ({ ...prev, employee_id: "" }));
                                                    setErrors((prev) => ({ ...prev, school_id: null, employee_id: null }));
                                                }}
                                                placeholder={schoolsLoading ? "Loading schools..." : "Select a school"}
                                                searchable={schoolOptions.length > 5}
                                                searchPlaceholder="Search schools..."
                                                disabled={schoolsLoading}
                                                hasError={Boolean(errors.school_id)}
                                            />
                                        </Field>
                                    )}

                                    {/* Employee selector */}
                                    <Field label="Select Employee" required error={errors.employee_id}>
                                        <CustomDropdown
                                            className="w-full"
                                            options={employeeOptions}
                                            value={formData.employee_id}
                                            onChange={(val) => {
                                                setFormData((prev) => ({ ...prev, employee_id: val }));
                                                setErrors((prev) => ({ ...prev, employee_id: null }));
                                            }}
                                            placeholder={
                                                needsSchoolFirst
                                                    ? "Select a school first…"
                                                    : empLoading
                                                    ? "Loading employees…"
                                                    : employeeOptions.length === 0
                                                    ? "No employees found"
                                                    : "Select an employee"
                                            }
                                            searchable={true}
                                            searchPlaceholder="Search by name, designation, code…"
                                            disabled={needsSchoolFirst || empLoading}
                                            hasError={Boolean(errors.employee_id)}
                                        />
                                    </Field>

                                    {/* Selected employee preview */}
                                    {selectedEmployee && (() => {
                                        const rawPhoto = selectedEmployee.photo_url || selectedEmployee.profile_image || selectedEmployee.photo || selectedEmployee.avatar || selectedEmployee.image;
                                        const photoUrl = rawPhoto ? getFullImageUrl(rawPhoto) : null;
                                        const initials = `${selectedEmployee.first_name?.[0] || ""}${selectedEmployee.last_name?.[0] || ""}`.toUpperCase() || "EM";
                                        return (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                                                    style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
                                                    <div className="ss-avatar w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 overflow-hidden relative">
                                                        {photoUrl ? (
                                                            <img
                                                                src={photoUrl}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = "none";
                                                                    const fallback = e.currentTarget.parentElement?.querySelector(".avatar-text");
                                                                    if (fallback) fallback.style.display = "flex";
                                                                }}
                                                            />
                                                        ) : null}
                                                        <span
                                                            className="avatar-text w-full h-full items-center justify-center"
                                                            style={{ display: photoUrl ? "none" : "flex" }}
                                                        >
                                                            {initials}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="ss-cell-primary text-[13.5px] font-semibold truncate">
                                                            {selectedEmployee.first_name} {selectedEmployee.last_name}
                                                        </p>
                                                        <p className="ss-cell-muted text-[12px] truncate">
                                                            {selectedEmployee.designation}
                                                            {selectedEmployee.employee_code ? ` · ${selectedEmployee.employee_code}` : ""}
                                                            {selectedEmployee.mobile ? ` · ${selectedEmployee.mobile}` : ""}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Pre-date informational banner if employee already has active structure */}
                                                {!formData.effective_from && activeStructuresForEmployee.length > 0 && (
                                                    <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-300 dark:border-amber-900/40 bg-amber-50/90 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-[12px] leading-relaxed">
                                                        <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-semibold text-amber-800 dark:text-amber-300">
                                                                Active structure exists for this employee
                                                            </p>
                                                            <p className="mt-0.5 opacity-90">
                                                                Currently assigned: <span className="font-medium">&ldquo;{activeStructuresForEmployee[0].structure_name || "Existing Structure"}&rdquo;</span> ({formatDate(activeStructuresForEmployee[0].effective_from)} {activeStructuresForEmployee[0].effective_to ? `to ${formatDate(activeStructuresForEmployee[0].effective_to)}` : "· Open-ended"}). Ensure new dates do not overlap.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </>
                            )}

                            {/* ── Edit mode: show read-only employee info ── */}
                            {isEdit && (() => {
                                const rawPhoto = structure?.photo_url || structure?.profile_image || structure?.photo || structure?.avatar || structure?.image;
                                const photoUrl = rawPhoto ? getFullImageUrl(rawPhoto) : null;
                                const initials = `${structure?.first_name?.[0] || ""}${structure?.last_name?.[0] || ""}`.toUpperCase() || "EM";
                                return (
                                    <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                                        style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
                                        <div className="ss-avatar w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 overflow-hidden relative">
                                            {photoUrl ? (
                                                <img
                                                    src={photoUrl}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                        const fallback = e.currentTarget.parentElement?.querySelector(".avatar-text-edit");
                                                        if (fallback) fallback.style.display = "flex";
                                                    }}
                                                />
                                            ) : null}
                                            <span
                                                className="avatar-text-edit w-full h-full items-center justify-center"
                                                style={{ display: photoUrl ? "none" : "flex" }}
                                            >
                                                {initials}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="ss-cell-primary text-[13.5px] font-semibold truncate">
                                                {structure?.first_name} {structure?.last_name}
                                            </p>
                                            <p className="ss-cell-muted text-[12px] truncate">{structure?.designation}</p>
                                        </div>
                                    </div>
                                );
                            })()}

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

                            {/* ── Overlap Warning Banner (Shows before submitting) ── */}
                            {overlappingStructure && (
                                <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-300 dark:border-rose-900/70 bg-rose-50/95 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 animate-in fade-in-50">
                                    <AlertTriangle size={19} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                    <div className="flex-1 text-[12.5px] leading-relaxed">
                                        <p className="font-bold text-[13px] text-rose-700 dark:text-rose-300">
                                            Active salary structure already exists for this date range
                                        </p>
                                        <p className="mt-1">
                                            An active structure <span className="font-semibold text-rose-950 dark:text-rose-100">&ldquo;{overlappingStructure.structure_name || "Existing Structure"}&rdquo;</span> is already active for this employee:
                                            <span className="font-semibold ml-1 text-rose-900 dark:text-rose-200">
                                                {formatDate(overlappingStructure.effective_from)} {overlappingStructure.effective_to ? `to ${formatDate(overlappingStructure.effective_to)}` : "(Open-ended)"}
                                            </span>.
                                        </p>
                                        <p className="mt-1.5 text-[11.5px] text-rose-800/90 dark:text-rose-300/80">
                                            An employee cannot have overlapping active salary structures. Please select a non-overlapping date range, or end the existing structure first.
                                        </p>
                                    </div>
                                </div>
                            )}

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
                                    <CustomDropdown
                                        className="w-full"
                                        options={[
                                            { value: "active", label: "Active" },
                                            { value: "inactive", label: "Inactive" },
                                        ]}
                                        value={formData.status}
                                        onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                                        placeholder="Select status"
                                    />
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
                            <button
                                type="button"
                                disabled={submitting || Boolean(overlappingStructure)}
                                onClick={handleSubmit}
                                title={overlappingStructure ? "Active salary structure already exists for this date range" : ""}
                                className={`ss-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors active:scale-[0.97] ${
                                    overlappingStructure ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
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