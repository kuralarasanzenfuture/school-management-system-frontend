import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CircleCheck, LayoutList, IndianRupee, Percent, Trash2, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    addEmployeeSalaryStructure,
    editEmployeeSalaryStructure,
    fetchEmployeeSalaryStructures,
    removeEmployeeSalaryStructure,
} from "../../../../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
import {
    addEmployeeSalaryStructureDetail,
    editEmployeeSalaryStructureDetail,
    fetchEmployeeSalaryStructureDetails,
    removeEmployeeSalaryStructureDetail,
} from "../../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";
// ASSUMPTION: follows the same naming pattern as the other list thunks in
// this app. Adjust the import path/thunk name if these slices actually
// export something different.
import { fetchEmployees } from "../../../../redux/employee/employeeSlice.js";
import { fetchEmployeeSalaryComponents } from "../../../../redux/employee_salary_component/employeeSalaryComponentSlice.js";

/* ── shared primitives ───────────────────────────────────────────── */
function Overlay({ onClick, children }) {
    return (
        <motion.div
            className="sm-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}
function Panel({ children, maxWidth = "max-w-lg" }) {
    return (
        <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 32 }}
            transition={{ duration: 0.22 }}
            className={`sm-modal w-full ${maxWidth} rounded-2xl overflow-hidden`}
        >
            {children}
        </motion.div>
    );
}
function Field({ label, required, error, hint, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="sm-field-label">
                {label}{required && <span className="sm-field-required ml-0.5">*</span>}
            </label>
            {children}
            {hint && !error && <p className="sm-comp-muted text-[11px] mt-0.5">{hint}</p>}
            <div className="h-4">{error && <p className="sm-field-error">{error}</p>}</div>
        </div>
    );
}
const fi = (err) => `sm-form-input${err ? " sm-form-input-error" : ""}`;

export function SalaryStructureFormModal({ isOpen, onClose, structure = null }) {
    const dispatch = useDispatch();
    const isEdit = Boolean(structure?.id);
    const employees = useSelector((state) => state.employees?.employees ?? []);
    const [empSearch, setEmpSearch] = useState("");
    const [form, setForm] = useState({ employee_id: "", effective_from: "", effective_to: "", status: "active", remarks: "" });
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (isOpen) dispatch(fetchEmployees());
    }, [dispatch, isOpen]);

    const filteredEmployees = useMemo(() => {
        const q = empSearch.trim().toLowerCase();
        return q
            ? employees.filter((e) =>
                `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
                e.employee_code?.toLowerCase().includes(q) ||
                e.designation?.toLowerCase().includes(q),
            )
            : employees;
    }, [employees, empSearch]);

    useEffect(() => {
        if (!isOpen) return;
        if (isEdit && structure) {
            setForm({
                employee_id: structure.employee_id ?? "",
                effective_from: structure.effective_from?.split("T")[0]?.split(" ")[0] ?? "",
                effective_to: structure.effective_to?.split("T")[0]?.split(" ")[0] ?? "",
                status: structure.status ?? "active",
                remarks: structure.remarks ?? "",
            });
        } else {
            setForm({ employee_id: "", effective_from: "", effective_to: "", status: "active", remarks: "" });
            setEmpSearch("");
        }
        setErrors({});
    }, [isOpen, isEdit, structure]);

    const set = (key) => (e) => {
        setForm((p) => ({ ...p, [key]: e.target.value }));
        setErrors((p) => (p[key] ? { ...p, [key]: null } : p));
    };

    const validate = () => {
        const errs = {};
        if (!isEdit && !form.employee_id) errs.employee_id = "Select an employee";
        if (!form.effective_from) errs.effective_from = "Effective from is required";
        if (form.effective_to && form.effective_from && new Date(form.effective_to) <= new Date(form.effective_from))
            errs.effective_to = "Must be after effective from";
        setErrors(errs);
        return !Object.keys(errs).length;
    };

    const selectedEmp = useMemo(
        () => employees.find((e) => String(e.id) === String(form.employee_id)),
        [employees, form.employee_id],
    );

    const previewName = useMemo(() => {
        if (!selectedEmp || !form.effective_from) return "";
        const yr = new Date(form.effective_from).getFullYear();
        const name = `${selectedEmp.first_name} ${selectedEmp.last_name}`.trim();
        return `${name}${selectedEmp.designation ? ` - ${selectedEmp.designation}` : ""} ${yr}`;
    }, [selectedEmp, form.effective_from]);

    const handleSubmit = async () => {
        if (!validate()) return;
        setBusy(true);
        try {
            if (isEdit) {
                await dispatch(editEmployeeSalaryStructure({
                    id: structure.id,
                    data: { effective_to: form.effective_to || null, status: form.status, remarks: form.remarks.trim() || null },
                })).unwrap();
            } else {
                await dispatch(addEmployeeSalaryStructure({
                    employee_id: Number(form.employee_id),
                    effective_from: form.effective_from,
                    remarks: form.remarks.trim() || null,
                })).unwrap();
            }
            await dispatch(fetchEmployeeSalaryStructures()).unwrap();
            onClose();
        } catch (err) { alert(err?.message ?? String(err)); }
        finally { setBusy(false); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Overlay onClick={onClose}>
                    <Panel>
                        <div className="sm-modal-header flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="sm-icon-total-bg w-9 h-9 rounded-xl flex items-center justify-center">
                                    <LayoutList size={18} className="sm-icon-total" />
                                </div>
                                <div>
                                    <h2 className="sm-modal-title text-[16px] font-bold">{isEdit ? "Edit Structure" : "New Structure"}</h2>
                                    <p className="sm-comp-muted text-[12px]">{isEdit ? structure?.structure_name : "Assign to an employee"}</p>
                                </div>
                            </div>
                            <button type="button" onClick={onClose} className="sm-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"><X size={17} /></button>
                        </div>

                        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

                            {/* Employee (create only) */}
                            {!isEdit && (
                                <div className="flex flex-col gap-2">
                                    <label className="sm-field-label">Employee <span className="sm-field-required">*</span></label>
                                    <div className="sm-search-wrap flex items-center gap-2 rounded-lg px-3 py-2.5">
                                        <Search size={14} className="sm-search-icon shrink-0" />
                                        <input className="sm-search-input text-[13.5px]" placeholder="Search name, code, designation…"
                                            value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} />
                                    </div>
                                    <select className={`${fi(errors.employee_id)} h-[110px]`} size={4}
                                        value={form.employee_id} onChange={set("employee_id")}>
                                        <option value="">— Select employee —</option>
                                        {filteredEmployees.map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.first_name} {emp.last_name}
                                                {emp.employee_code ? ` (${emp.employee_code})` : ""}
                                                {emp.designation ? ` · ${emp.designation}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.employee_id && <p className="sm-field-error">{errors.employee_id}</p>}
                                </div>
                            )}

                            {/* Employee info card */}
                            {(isEdit || selectedEmp) && (
                                <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
                                    <div className="sm-structure-avatar w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0">
                                        {(isEdit ? structure?.first_name : selectedEmp?.first_name)?.[0]}
                                        {(isEdit ? structure?.last_name : selectedEmp?.last_name)?.[0]}
                                    </div>
                                    <div>
                                        <p className="sm-structure-name text-[13.5px]">
                                            {isEdit ? `${structure?.first_name} ${structure?.last_name}` : `${selectedEmp?.first_name} ${selectedEmp?.last_name}`}
                                        </p>
                                        <p className="sm-comp-muted text-[12px]">
                                            {isEdit ? structure?.designation : selectedEmp?.designation}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <p className="sm-section-label pb-1.5">Effective Period</p>
                            <div className="grid grid-cols-2 gap-x-5 gap-y-1">
                                {!isEdit ? (
                                    <Field label="Effective From" required error={errors.effective_from}>
                                        <input type="date" className={fi(errors.effective_from)} value={form.effective_from} onChange={set("effective_from")} />
                                    </Field>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <label className="sm-field-label">Effective From</label>
                                        <div className="sm-form-input sm-form-input-disabled">{structure?.effective_from?.split("T")[0]?.split(" ")[0]}</div>
                                        <div className="h-4" />
                                    </div>
                                )}
                                <Field label="Effective To" error={errors.effective_to} hint="Leave blank for open-ended">
                                    <input type="date" className={fi(errors.effective_to)} value={form.effective_to} onChange={set("effective_to")} />
                                </Field>
                            </div>

                            {!isEdit && previewName && (
                                <div className="flex flex-col gap-1">
                                    <label className="sm-field-label">Auto-generated Name</label>
                                    <div className="sm-preview-box">{previewName}</div>
                                </div>
                            )}

                            {isEdit && (
                                <Field label="Status">
                                    <select className={fi(false)} value={form.status} onChange={set("status")}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </Field>
                            )}

                            <Field label="Remarks">
                                <textarea className={fi(false)} rows={2} placeholder="Optional notes…" value={form.remarks} onChange={set("remarks")} />
                            </Field>
                        </div>

                        <div className="sm-modal-footer flex justify-end gap-3 px-6 py-4">
                            <button type="button" onClick={onClose} className="sm-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">Cancel</button>
                            <button type="button" disabled={busy} onClick={handleSubmit}
                                className="sm-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold active:scale-[0.97]">
                                <CircleCheck size={15} />
                                {busy ? (isEdit ? "Updating…" : "Saving…") : (isEdit ? "Update" : "Create Structure")}
                            </button>
                        </div>
                    </Panel>
                </Overlay>
            )}
        </AnimatePresence>
    );
}
