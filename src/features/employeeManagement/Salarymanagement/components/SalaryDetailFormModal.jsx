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

export function SalaryDetailFormModal({ isOpen, onClose, detail = null, structureId = null, structureName = "" }) {
    const dispatch = useDispatch();
    const isEdit = Boolean(detail?.id);
    // Tries both the singular- and plural-key convention, whichever your
    // store actually registers this reducer under — see the same fix (and
    // the reasoning behind it) in SalaryStructureDetailModal.jsx.
    const components = useSelector(
        (state) =>
            state.employeeSalaryComponent?.employeeSalaryComponents ??
            state.employeeSalaryComponents?.employeeSalaryComponents ??
            [],
    );

    const [form, setForm] = useState({ component_id: "", calculation_type: "fixed", amount: "", percentage: "", based_on: "basic" });
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    // THE FIX: nothing here ever dispatched a fetch for components either
    // — same bug as SalaryStructureDetailModal.jsx, just duplicated into
    // this consolidated file. Without this, the dropdown is empty unless
    // whatever page you visited previously happened to load them first.
    useEffect(() => {
        if (isOpen) dispatch(fetchEmployeeSalaryComponents());
    }, [dispatch, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (isEdit && detail) {
            setForm({
                component_id: detail.component_id ?? "",
                calculation_type: detail.calculation_type ?? "fixed",
                amount: detail.amount != null ? String(detail.amount) : "",
                percentage: detail.percentage != null ? String(detail.percentage) : "",
                based_on: detail.based_on ?? "basic",
            });
        } else {
            setForm({ component_id: "", calculation_type: "fixed", amount: "", percentage: "", based_on: "basic" });
        }
        setErrors({});
    }, [isOpen, isEdit, detail]);

    const set = (key) => (e) => {
        setForm((p) => ({ ...p, [key]: e.target.value }));
        setErrors((p) => (p[key] ? { ...p, [key]: null } : p));
    };

    const selectCalc = (type) => {
        setForm((p) => ({ ...p, calculation_type: type, amount: "", percentage: "" }));
        setErrors((p) => ({ ...p, amount: null, percentage: null }));
    };

    const selectedComp = useMemo(
        () => components.find((c) => String(c.id) === String(form.component_id)),
        [components, form.component_id],
    );

    const validate = () => {
        const errs = {};
        if (!isEdit && !form.component_id) errs.component_id = "Select a component";
        if (form.calculation_type === "fixed") {
            if (!form.amount || isNaN(+form.amount) || +form.amount < 0) errs.amount = "Enter a valid amount";
        } else {
            if (!form.percentage || isNaN(+form.percentage) || +form.percentage < 0) errs.percentage = "Enter a valid percentage";
            if (+form.percentage > 100) errs.percentage = "Cannot exceed 100";
        }
        setErrors(errs);
        return !Object.keys(errs).length;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setBusy(true);
        const payload = form.calculation_type === "fixed"
            ? { salary_structure_id: Number(structureId), component_id: Number(form.component_id), calculation_type: "fixed", amount: Number(form.amount) }
            : { salary_structure_id: Number(structureId), component_id: Number(form.component_id), calculation_type: "percentage", percentage: Number(form.percentage), based_on: form.based_on };
        try {
            if (isEdit) {
                await dispatch(editEmployeeSalaryStructureDetail({ id: detail.id, data: payload })).unwrap();
            } else {
                await dispatch(addEmployeeSalaryStructureDetail(payload)).unwrap();
            }
            await dispatch(fetchEmployeeSalaryStructureDetails()).unwrap();
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
                                <div className="sm-icon-earning-bg w-9 h-9 rounded-xl flex items-center justify-center">
                                    <IndianRupee size={18} className="sm-icon-earning" />
                                </div>
                                <div>
                                    <h2 className="sm-modal-title text-[16px] font-bold">{isEdit ? "Edit Component" : "Add Component"}</h2>
                                    <p className="sm-comp-muted text-[12px]">{structureName}</p>
                                </div>
                            </div>
                            <button type="button" onClick={onClose} className="sm-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"><X size={17} /></button>
                        </div>

                        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

                            {/* Component selector */}
                            <Field label="Salary Component" required error={errors.component_id}>
                                <select className={fi(errors.component_id)} value={form.component_id} onChange={set("component_id")} disabled={isEdit}>
                                    <option value="">
                                        {components.length === 0 ? "No components available" : "— Select component —"}
                                    </option>
                                    {/* NOTE: groups/filters on c.type here, but the
                                        standalone SalaryStructureDetailModal.jsx uses
                                        c.component_type for the same purpose. Only one
                                        of these can be the real field on your API
                                        response — worth confirming which, since whichever
                                        is wrong will silently show 0 components in every
                                        group (empty optgroups just don't render) even
                                        though `components` itself is non-empty. */}
                                    {["earning", "deduction", "benefit"].map((type) => {
                                        const grp = components.filter((c) => c.component_type === type && c.status === "active");
                                        if (!grp.length) return null;
                                        return (
                                            <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
                                                {grp.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                                            </optgroup>
                                        );
                                    })}
                                </select>
                            </Field>

                            {/* Component preview */}
                            {selectedComp && (
                                <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
                                    <div>
                                        <p className="sm-comp-name text-[13px] font-semibold">{selectedComp.name}</p>
                                        <p className="sm-comp-muted text-[12px]">{selectedComp.code}</p>
                                    </div>
                                    <span className={`sm-comp-type sm-comp-type-${selectedComp.type}`}>{selectedComp.type}</span>
                                </div>
                            )}

                            {/* Calc type */}
                            <p className="sm-section-label pb-1.5">Calculation Type</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => selectCalc("fixed")}
                                    className={`sm-calc-option sm-calc-option-fixed ${form.calculation_type === "fixed" ? "sm-selected" : ""}`}>
                                    <IndianRupee size={20} className="mx-auto mb-1" />Fixed Amount
                                </button>
                                <button type="button" onClick={() => selectCalc("percentage")}
                                    className={`sm-calc-option sm-calc-option-percentage ${form.calculation_type === "percentage" ? "sm-selected" : ""}`}>
                                    <Percent size={20} className="mx-auto mb-1" />Percentage
                                </button>
                            </div>

                            {form.calculation_type === "fixed" && (
                                <Field label="Amount (₹)" required error={errors.amount}>
                                    <input type="number" min="0" step="0.01" className={fi(errors.amount)} placeholder="e.g. 25000" value={form.amount} onChange={set("amount")} />
                                </Field>
                            )}
                            {form.calculation_type === "percentage" && (
                                <div className="grid grid-cols-2 gap-x-5 gap-y-1">
                                    <Field label="Percentage (%)" required error={errors.percentage} hint="0–100">
                                        <input type="number" min="0" max="100" step="0.01" className={fi(errors.percentage)} placeholder="e.g. 12.5" value={form.percentage} onChange={set("percentage")} />
                                    </Field>
                                    <Field label="Based On">
                                        <select className={fi(false)} value={form.based_on} onChange={set("based_on")}>
                                            <option value="basic">Basic Salary</option>
                                            <option value="gross">Gross Salary</option>
                                        </select>
                                    </Field>
                                </div>
                            )}
                        </div>

                        <div className="sm-modal-footer flex justify-end gap-3 px-6 py-4">
                            <button type="button" onClick={onClose} className="sm-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">Cancel</button>
                            <button type="button" disabled={busy} onClick={handleSubmit}
                                className="sm-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold active:scale-[0.97]">
                                <CircleCheck size={15} />
                                {busy ? (isEdit ? "Updating…" : "Saving…") : (isEdit ? "Update" : "Add Component")}
                            </button>
                        </div>
                    </Panel>
                </Overlay>
            )}
        </AnimatePresence>
    );
}
