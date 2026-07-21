// // /**
// //  * SalaryManagementModals.jsx
// //  * Shared modals used by both V1 and V2 pages:
// //  *   - SalaryStructureFormModal  (add / edit a structure)
// //  *   - SalaryDetailFormModal     (add / edit a component detail)
// //  *   - SalaryDeleteModal         (generic delete confirmation)
// //  */
// // import React, { useState, useEffect, useMemo } from "react";
// // import { AnimatePresence, motion } from "framer-motion";
// // import { X, CircleCheck, LayoutList, IndianRupee, Percent, Trash2, Search } from "lucide-react";
// // import { useDispatch, useSelector } from "react-redux";
// // import {
// //     addEmployeeSalaryStructure,
// //     editEmployeeSalaryStructure,
// //     removeEmployeeSalaryStructure,
// // } from "../../../../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
// // import {
// //     addEmployeeSalaryStructureDetail,
// //     editEmployeeSalaryStructureDetail,
// //     removeEmployeeSalaryStructureDetail,
// // } from "../../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";

// // /* ── shared primitives ───────────────────────────────────────────── */
// // function Overlay({ onClick, children }) {
// //     return (
// //         <motion.div
// //             className="sm-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
// //             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
// //             onClick={onClick}
// //         >
// //             {children}
// //         </motion.div>
// //     );
// // }
// // function Panel({ children, maxWidth = "max-w-lg" }) {
// //     return (
// //         <motion.div
// //             onClick={(e) => e.stopPropagation()}
// //             initial={{ opacity: 0, scale: 0.92, y: 32 }}
// //             animate={{ opacity: 1, scale: 1, y: 0 }}
// //             exit={{ opacity: 0, scale: 0.92, y: 32 }}
// //             transition={{ duration: 0.22 }}
// //             className={`sm-modal w-full ${maxWidth} rounded-2xl overflow-hidden`}
// //         >
// //             {children}
// //         </motion.div>
// //     );
// // }
// // function Field({ label, required, error, hint, children }) {
// //     return (
// //         <div className="flex flex-col gap-1">
// //             <label className="sm-field-label">
// //                 {label}{required && <span className="sm-field-required ml-0.5">*</span>}
// //             </label>
// //             {children}
// //             {hint && !error && <p className="sm-comp-muted text-[11px] mt-0.5">{hint}</p>}
// //             <div className="h-4">{error && <p className="sm-field-error">{error}</p>}</div>
// //         </div>
// //     );
// // }
// // const fi = (err) => `sm-form-input${err ? " sm-form-input-error" : ""}`;

// // /* ══════════════════════════════════════════════════════════════════
// //    1. SALARY STRUCTURE FORM MODAL  (add + edit)
// // ══════════════════════════════════════════════════════════════════ */
// // export function SalaryStructureFormModal({ isOpen, onClose, structure = null }) {
// //     const dispatch = useDispatch();
// //     const isEdit = Boolean(structure?.id);
// //     const employees = useSelector((state) => state.employees?.employees ?? []);
// //     const [empSearch, setEmpSearch] = useState("");
// //     const [form, setForm] = useState({ employee_id: "", effective_from: "", effective_to: "", status: "active", remarks: "" });
// //     const [errors, setErrors] = useState({});
// //     const [busy, setBusy] = useState(false);

// //     const filteredEmployees = useMemo(() => {
// //         const q = empSearch.trim().toLowerCase();
// //         return q
// //             ? employees.filter((e) =>
// //                 `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
// //                 e.employee_code?.toLowerCase().includes(q) ||
// //                 e.designation?.toLowerCase().includes(q),
// //             )
// //             : employees;
// //     }, [employees, empSearch]);

// //     useEffect(() => {
// //         if (!isOpen) return;
// //         if (isEdit && structure) {
// //             setForm({
// //                 employee_id: structure.employee_id ?? "",
// //                 effective_from: structure.effective_from?.split("T")[0]?.split(" ")[0] ?? "",
// //                 effective_to: structure.effective_to?.split("T")[0]?.split(" ")[0] ?? "",
// //                 status: structure.status ?? "active",
// //                 remarks: structure.remarks ?? "",
// //             });
// //         } else {
// //             setForm({ employee_id: "", effective_from: "", effective_to: "", status: "active", remarks: "" });
// //             setEmpSearch("");
// //         }
// //         setErrors({});
// //     }, [isOpen, isEdit, structure]);

// //     const set = (key) => (e) => {
// //         setForm((p) => ({ ...p, [key]: e.target.value }));
// //         setErrors((p) => (p[key] ? { ...p, [key]: null } : p));
// //     };

// //     const validate = () => {
// //         const errs = {};
// //         if (!isEdit && !form.employee_id) errs.employee_id = "Select an employee";
// //         if (!form.effective_from) errs.effective_from = "Effective from is required";
// //         if (form.effective_to && form.effective_from && new Date(form.effective_to) <= new Date(form.effective_from))
// //             errs.effective_to = "Must be after effective from";
// //         setErrors(errs);
// //         return !Object.keys(errs).length;
// //     };

// //     const selectedEmp = useMemo(
// //         () => employees.find((e) => String(e.id) === String(form.employee_id)),
// //         [employees, form.employee_id],
// //     );

// //     const previewName = useMemo(() => {
// //         if (!selectedEmp || !form.effective_from) return "";
// //         const yr = new Date(form.effective_from).getFullYear();
// //         const name = `${selectedEmp.first_name} ${selectedEmp.last_name}`.trim();
// //         return `${name}${selectedEmp.designation ? ` - ${selectedEmp.designation}` : ""} ${yr}`;
// //     }, [selectedEmp, form.effective_from]);

// //     const handleSubmit = async () => {
// //         if (!validate()) return;
// //         setBusy(true);
// //         try {
// //             if (isEdit) {
// //                 await dispatch(editEmployeeSalaryStructure({
// //                     id: structure.id,
// //                     data: { effective_to: form.effective_to || null, status: form.status, remarks: form.remarks.trim() || null },
// //                 })).unwrap();
// //             } else {
// //                 await dispatch(addEmployeeSalaryStructure({
// //                     employee_id: Number(form.employee_id),
// //                     effective_from: form.effective_from,
// //                     remarks: form.remarks.trim() || null,
// //                 })).unwrap();
// //             }
// //             onClose();
// //         } catch (err) { alert(err?.message ?? String(err)); }
// //         finally { setBusy(false); }
// //     };

// //     return (
// //         <AnimatePresence>
// //             {isOpen && (
// //                 <Overlay onClick={onClose}>
// //                     <Panel>
// //                         <div className="sm-modal-header flex items-center justify-between px-6 py-4">
// //                             <div className="flex items-center gap-3">
// //                                 <div className="sm-icon-total-bg w-9 h-9 rounded-xl flex items-center justify-center">
// //                                     <LayoutList size={18} className="sm-icon-total" />
// //                                 </div>
// //                                 <div>
// //                                     <h2 className="sm-modal-title text-[16px] font-bold">{isEdit ? "Edit Structure" : "New Structure"}</h2>
// //                                     <p className="sm-comp-muted text-[12px]">{isEdit ? structure?.structure_name : "Assign to an employee"}</p>
// //                                 </div>
// //                             </div>
// //                             <button type="button" onClick={onClose} className="sm-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"><X size={17} /></button>
// //                         </div>

// //                         <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

// //                             {/* Employee (create only) */}
// //                             {!isEdit && (
// //                                 <div className="flex flex-col gap-2">
// //                                     <label className="sm-field-label">Employee <span className="sm-field-required">*</span></label>
// //                                     <div className="sm-search-wrap flex items-center gap-2 rounded-lg px-3 py-2.5">
// //                                         <Search size={14} className="sm-search-icon shrink-0" />
// //                                         <input className="sm-search-input text-[13.5px]" placeholder="Search name, code, designation…"
// //                                             value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} />
// //                                     </div>
// //                                     <select className={`${fi(errors.employee_id)} h-[110px]`} size={4}
// //                                         value={form.employee_id} onChange={set("employee_id")}>
// //                                         <option value="">— Select employee —</option>
// //                                         {filteredEmployees.map((emp) => (
// //                                             <option key={emp.id} value={emp.id}>
// //                                                 {emp.first_name} {emp.last_name}
// //                                                 {emp.employee_code ? ` (${emp.employee_code})` : ""}
// //                                                 {emp.designation ? ` · ${emp.designation}` : ""}
// //                                             </option>
// //                                         ))}
// //                                     </select>
// //                                     {errors.employee_id && <p className="sm-field-error">{errors.employee_id}</p>}
// //                                 </div>
// //                             )}

// //                             {/* Employee info card */}
// //                             {(isEdit || selectedEmp) && (
// //                                 <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
// //                                     <div className="sm-structure-avatar w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0">
// //                                         {(isEdit ? structure?.first_name : selectedEmp?.first_name)?.[0]}
// //                                         {(isEdit ? structure?.last_name : selectedEmp?.last_name)?.[0]}
// //                                     </div>
// //                                     <div>
// //                                         <p className="sm-structure-name text-[13.5px]">
// //                                             {isEdit ? `${structure?.first_name} ${structure?.last_name}` : `${selectedEmp?.first_name} ${selectedEmp?.last_name}`}
// //                                         </p>
// //                                         <p className="sm-comp-muted text-[12px]">
// //                                             {isEdit ? structure?.designation : selectedEmp?.designation}
// //                                         </p>
// //                                     </div>
// //                                 </div>
// //                             )}

// //                             <p className="sm-section-label pb-1.5">Effective Period</p>
// //                             <div className="grid grid-cols-2 gap-x-5 gap-y-1">
// //                                 {!isEdit ? (
// //                                     <Field label="Effective From" required error={errors.effective_from}>
// //                                         <input type="date" className={fi(errors.effective_from)} value={form.effective_from} onChange={set("effective_from")} />
// //                                     </Field>
// //                                 ) : (
// //                                     <div className="flex flex-col gap-1">
// //                                         <label className="sm-field-label">Effective From</label>
// //                                         <div className="sm-form-input sm-form-input-disabled">{structure?.effective_from?.split("T")[0]?.split(" ")[0]}</div>
// //                                         <div className="h-4" />
// //                                     </div>
// //                                 )}
// //                                 <Field label="Effective To" error={errors.effective_to} hint="Leave blank for open-ended">
// //                                     <input type="date" className={fi(errors.effective_to)} value={form.effective_to} onChange={set("effective_to")} />
// //                                 </Field>
// //                             </div>

// //                             {!isEdit && previewName && (
// //                                 <div className="flex flex-col gap-1">
// //                                     <label className="sm-field-label">Auto-generated Name</label>
// //                                     <div className="sm-preview-box">{previewName}</div>
// //                                 </div>
// //                             )}

// //                             {isEdit && (
// //                                 <Field label="Status">
// //                                     <select className={fi(false)} value={form.status} onChange={set("status")}>
// //                                         <option value="active">Active</option>
// //                                         <option value="inactive">Inactive</option>
// //                                     </select>
// //                                 </Field>
// //                             )}

// //                             <Field label="Remarks">
// //                                 <textarea className={fi(false)} rows={2} placeholder="Optional notes…" value={form.remarks} onChange={set("remarks")} />
// //                             </Field>
// //                         </div>

// //                         <div className="sm-modal-footer flex justify-end gap-3 px-6 py-4">
// //                             <button type="button" onClick={onClose} className="sm-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">Cancel</button>
// //                             <button type="button" disabled={busy} onClick={handleSubmit}
// //                                 className="sm-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold active:scale-[0.97]">
// //                                 <CircleCheck size={15} />
// //                                 {busy ? (isEdit ? "Updating…" : "Saving…") : (isEdit ? "Update" : "Create Structure")}
// //                             </button>
// //                         </div>
// //                     </Panel>
// //                 </Overlay>
// //             )}
// //         </AnimatePresence>
// //     );
// // }

// // /* ══════════════════════════════════════════════════════════════════
// //    2. SALARY DETAIL FORM MODAL  (add + edit component)
// // ══════════════════════════════════════════════════════════════════ */
// // export function SalaryDetailFormModal({ isOpen, onClose, detail = null, structureId = null, structureName = "" }) {
// //     const dispatch = useDispatch();
// //     const isEdit = Boolean(detail?.id);
// //     const components = useSelector((state) => state.employeeSalaryComponents?.employeeSalaryComponents ?? []);

// //     const [form, setForm] = useState({ component_id: "", calculation_type: "fixed", amount: "", percentage: "", based_on: "basic" });
// //     const [errors, setErrors] = useState({});
// //     const [busy, setBusy] = useState(false);

// //     useEffect(() => {
// //         if (!isOpen) return;
// //         if (isEdit && detail) {
// //             setForm({
// //                 component_id: detail.component_id ?? "",
// //                 calculation_type: detail.calculation_type ?? "fixed",
// //                 amount: detail.amount != null ? String(detail.amount) : "",
// //                 percentage: detail.percentage != null ? String(detail.percentage) : "",
// //                 based_on: detail.based_on ?? "basic",
// //             });
// //         } else {
// //             setForm({ component_id: "", calculation_type: "fixed", amount: "", percentage: "", based_on: "basic" });
// //         }
// //         setErrors({});
// //     }, [isOpen, isEdit, detail]);

// //     const set = (key) => (e) => {
// //         setForm((p) => ({ ...p, [key]: e.target.value }));
// //         setErrors((p) => (p[key] ? { ...p, [key]: null } : p));
// //     };

// //     const selectCalc = (type) => {
// //         setForm((p) => ({ ...p, calculation_type: type, amount: "", percentage: "" }));
// //         setErrors((p) => ({ ...p, amount: null, percentage: null }));
// //     };

// //     const selectedComp = useMemo(
// //         () => components.find((c) => String(c.id) === String(form.component_id)),
// //         [components, form.component_id],
// //     );

// //     const validate = () => {
// //         const errs = {};
// //         if (!isEdit && !form.component_id) errs.component_id = "Select a component";
// //         if (form.calculation_type === "fixed") {
// //             if (!form.amount || isNaN(+form.amount) || +form.amount < 0) errs.amount = "Enter a valid amount";
// //         } else {
// //             if (!form.percentage || isNaN(+form.percentage) || +form.percentage < 0) errs.percentage = "Enter a valid percentage";
// //             if (+form.percentage > 100) errs.percentage = "Cannot exceed 100";
// //         }
// //         setErrors(errs);
// //         return !Object.keys(errs).length;
// //     };

// //     const handleSubmit = async () => {
// //         if (!validate()) return;
// //         setBusy(true);
// //         const payload = form.calculation_type === "fixed"
// //             ? { salary_structure_id: Number(structureId), component_id: Number(form.component_id), calculation_type: "fixed", amount: Number(form.amount) }
// //             : { salary_structure_id: Number(structureId), component_id: Number(form.component_id), calculation_type: "percentage", percentage: Number(form.percentage), based_on: form.based_on };
// //         try {
// //             if (isEdit) {
// //                 await dispatch(editEmployeeSalaryStructureDetail({ id: detail.id, data: payload })).unwrap();
// //             } else {
// //                 await dispatch(addEmployeeSalaryStructureDetail(payload)).unwrap();
// //             }
// //             onClose();
// //         } catch (err) { alert(err?.message ?? String(err)); }
// //         finally { setBusy(false); }
// //     };

// //     return (
// //         <AnimatePresence>
// //             {isOpen && (
// //                 <Overlay onClick={onClose}>
// //                     <Panel>
// //                         <div className="sm-modal-header flex items-center justify-between px-6 py-4">
// //                             <div className="flex items-center gap-3">
// //                                 <div className="sm-icon-earning-bg w-9 h-9 rounded-xl flex items-center justify-center">
// //                                     <IndianRupee size={18} className="sm-icon-earning" />
// //                                 </div>
// //                                 <div>
// //                                     <h2 className="sm-modal-title text-[16px] font-bold">{isEdit ? "Edit Component" : "Add Component"}</h2>
// //                                     <p className="sm-comp-muted text-[12px]">{structureName}</p>
// //                                 </div>
// //                             </div>
// //                             <button type="button" onClick={onClose} className="sm-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"><X size={17} /></button>
// //                         </div>

// //                         <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

// //                             {/* Component selector */}
// //                             <Field label="Salary Component" required error={errors.component_id}>
// //                                 <select className={fi(errors.component_id)} value={form.component_id} onChange={set("component_id")} disabled={isEdit}>
// //                                     <option value="">— Select component —</option>
// //                                     {["earning", "deduction", "benefit"].map((type) => {
// //                                         const grp = components.filter((c) => c.type === type && c.status === "active");
// //                                         if (!grp.length) return null;
// //                                         return (
// //                                             <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
// //                                                 {grp.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
// //                                             </optgroup>
// //                                         );
// //                                     })}
// //                                 </select>
// //                             </Field>

// //                             {/* Component preview */}
// //                             {selectedComp && (
// //                                 <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
// //                                     <div>
// //                                         <p className="sm-comp-name text-[13px] font-semibold">{selectedComp.name}</p>
// //                                         <p className="sm-comp-muted text-[12px]">{selectedComp.code}</p>
// //                                     </div>
// //                                     <span className={`sm-comp-type sm-comp-type-${selectedComp.type}`}>{selectedComp.type}</span>
// //                                 </div>
// //                             )}

// //                             {/* Calc type */}
// //                             <p className="sm-section-label pb-1.5">Calculation Type</p>
// //                             <div className="grid grid-cols-2 gap-3">
// //                                 <button type="button" onClick={() => selectCalc("fixed")}
// //                                     className={`sm-calc-option sm-calc-option-fixed ${form.calculation_type === "fixed" ? "sm-selected" : ""}`}>
// //                                     <IndianRupee size={20} className="mx-auto mb-1" />Fixed Amount
// //                                 </button>
// //                                 <button type="button" onClick={() => selectCalc("percentage")}
// //                                     className={`sm-calc-option sm-calc-option-percentage ${form.calculation_type === "percentage" ? "sm-selected" : ""}`}>
// //                                     <Percent size={20} className="mx-auto mb-1" />Percentage
// //                                 </button>
// //                             </div>

// //                             {form.calculation_type === "fixed" && (
// //                                 <Field label="Amount (₹)" required error={errors.amount}>
// //                                     <input type="number" min="0" step="0.01" className={fi(errors.amount)} placeholder="e.g. 25000" value={form.amount} onChange={set("amount")} />
// //                                 </Field>
// //                             )}
// //                             {form.calculation_type === "percentage" && (
// //                                 <div className="grid grid-cols-2 gap-x-5 gap-y-1">
// //                                     <Field label="Percentage (%)" required error={errors.percentage} hint="0–100">
// //                                         <input type="number" min="0" max="100" step="0.01" className={fi(errors.percentage)} placeholder="e.g. 12.5" value={form.percentage} onChange={set("percentage")} />
// //                                     </Field>
// //                                     <Field label="Based On">
// //                                         <select className={fi(false)} value={form.based_on} onChange={set("based_on")}>
// //                                             <option value="basic">Basic Salary</option>
// //                                             <option value="gross">Gross Salary</option>
// //                                         </select>
// //                                     </Field>
// //                                 </div>
// //                             )}
// //                         </div>

// //                         <div className="sm-modal-footer flex justify-end gap-3 px-6 py-4">
// //                             <button type="button" onClick={onClose} className="sm-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">Cancel</button>
// //                             <button type="button" disabled={busy} onClick={handleSubmit}
// //                                 className="sm-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold active:scale-[0.97]">
// //                                 <CircleCheck size={15} />
// //                                 {busy ? (isEdit ? "Updating…" : "Saving…") : (isEdit ? "Update" : "Add Component")}
// //                             </button>
// //                         </div>
// //                     </Panel>
// //                 </Overlay>
// //             )}
// //         </AnimatePresence>
// //     );
// // }

// // /* ══════════════════════════════════════════════════════════════════
// //    3. GENERIC DELETE MODAL
// // ══════════════════════════════════════════════════════════════════ */
// // export function SalaryDeleteModal({ isOpen, onClose, type = "structure", item = null }) {
// //     const dispatch = useDispatch();
// //     const [busy, setBusy] = useState(false);

// //     const isStructure = type === "structure";

// //     const handleDelete = async () => {
// //         if (!item?.id) return;
// //         setBusy(true);
// //         try {
// //             if (isStructure) {
// //                 await dispatch(removeEmployeeSalaryStructure(item.id)).unwrap();
// //             } else {
// //                 await dispatch(removeEmployeeSalaryStructureDetail(item.id)).unwrap();
// //             }
// //             onClose();
// //         } catch (err) { alert(err?.message ?? String(err)); }
// //         finally { setBusy(false); }
// //     };

// //     const title = isStructure ? "Delete Salary Structure" : "Remove Component";
// //     const desc = isStructure
// //         ? <>Delete <span className="font-semibold">"{item?.structure_name}"</span> for <span className="font-semibold">{item?.first_name} {item?.last_name}</span>? All component details will also be removed.</>
// //         : <>Remove <span className="font-semibold">{item?.component_name}</span> from <span className="font-semibold">"{item?.structure_name}"</span>?</>;

// //     return (
// //         <AnimatePresence>
// //             {isOpen && (
// //                 <Overlay onClick={onClose}>
// //                     <Panel maxWidth="max-w-sm">
// //                         <div className="sm-modal-header flex items-center justify-between px-5 py-4">
// //                             <h2 className="sm-modal-title text-[15px] font-bold">{title}</h2>
// //                             <button type="button" onClick={onClose} className="sm-close-btn w-7 h-7 rounded-full flex items-center justify-center transition-colors"><X size={15} /></button>
// //                         </div>
// //                         <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
// //                             <div className="sm-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
// //                                 <Trash2 size={24} className="sm-delete-icon" />
// //                             </div>
// //                             <p className="sm-delete-title text-[15px] font-semibold">Are you sure?</p>
// //                             <p className="sm-delete-desc text-[13px] leading-relaxed">{desc} This cannot be undone.</p>
// //                         </div>
// //                         <div className="sm-modal-footer flex justify-center gap-3 px-5 py-4">
// //                             <button type="button" onClick={onClose} className="sm-modal-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">Cancel</button>
// //                             <button type="button" disabled={busy} onClick={handleDelete}
// //                                 className="sm-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]">
// //                                 {busy ? "Deleting…" : isStructure ? "Delete" : "Remove"}
// //                             </button>
// //                         </div>
// //                     </Panel>
// //                 </Overlay>
// //             )}
// //         </AnimatePresence>
// //     );
// // }

// /**
//  * SalaryManagementModals.jsx
//  * Shared modals used by both V1 and V2 pages:
//  *   - SalaryStructureFormModal  (add / edit a structure)
//  *   - SalaryDetailFormModal     (add / edit a component detail)
//  *   - SalaryDeleteModal         (generic delete confirmation)
//  */
// import React, { useState, useEffect, useMemo } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { X, CircleCheck, LayoutList, IndianRupee, Percent, Trash2, Search } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//     addEmployeeSalaryStructure,
//     editEmployeeSalaryStructure,
//     fetchEmployeeSalaryStructures,
//     removeEmployeeSalaryStructure,
// } from "../../../../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
// import {
//     addEmployeeSalaryStructureDetail,
//     editEmployeeSalaryStructureDetail,
//     fetchEmployeeSalaryStructureDetails,
//     removeEmployeeSalaryStructureDetail,
// } from "../../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";
// // ASSUMPTION: follows the same naming pattern as the other list thunks in
// // this app. Adjust the import path/thunk name if these slices actually
// // export something different.
// import { fetchEmployees } from "../../../../redux/employee/employeeSlice.js";
// import { fetchEmployeeSalaryComponents } from "../../../../redux/employee_salary_component/employeeSalaryComponentSlice.js";

// /* ── shared primitives ───────────────────────────────────────────── */
// function Overlay({ onClick, children }) {
//     return (
//         <motion.div
//             className="sm-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             onClick={onClick}
//         >
//             {children}
//         </motion.div>
//     );
// }
// function Panel({ children, maxWidth = "max-w-lg" }) {
//     return (
//         <motion.div
//             onClick={(e) => e.stopPropagation()}
//             initial={{ opacity: 0, scale: 0.92, y: 32 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.92, y: 32 }}
//             transition={{ duration: 0.22 }}
//             className={`sm-modal w-full ${maxWidth} rounded-2xl overflow-hidden`}
//         >
//             {children}
//         </motion.div>
//     );
// }
// function Field({ label, required, error, hint, children }) {
//     return (
//         <div className="flex flex-col gap-1">
//             <label className="sm-field-label">
//                 {label}{required && <span className="sm-field-required ml-0.5">*</span>}
//             </label>
//             {children}
//             {hint && !error && <p className="sm-comp-muted text-[11px] mt-0.5">{hint}</p>}
//             <div className="h-4">{error && <p className="sm-field-error">{error}</p>}</div>
//         </div>
//     );
// }
// const fi = (err) => `sm-form-input${err ? " sm-form-input-error" : ""}`;

// /* ══════════════════════════════════════════════════════════════════
//    1. SALARY STRUCTURE FORM MODAL  (add + edit)
// ══════════════════════════════════════════════════════════════════ */
// export function SalaryStructureFormModal({ isOpen, onClose, structure = null }) {
//     const dispatch = useDispatch();
//     const isEdit = Boolean(structure?.id);
//     const employees = useSelector((state) => state.employees?.employees ?? []);
//     const [empSearch, setEmpSearch] = useState("");
//     const [form, setForm] = useState({ employee_id: "", effective_from: "", effective_to: "", status: "active", remarks: "" });
//     const [errors, setErrors] = useState({});
//     const [busy, setBusy] = useState(false);

//     // Same bug class as the standalone SalaryStructureModal.jsx fixed
//     // earlier: nothing was ever dispatching a fetch for employees — this
//     // only "worked" if some other page had already loaded them into
//     // Redux first. Only needed in create mode (edit mode doesn't show the
//     // employee picker), but harmless to fetch either way.
//     useEffect(() => {
//         if (isOpen) dispatch(fetchEmployees());
//     }, [dispatch, isOpen]);

//     const filteredEmployees = useMemo(() => {
//         const q = empSearch.trim().toLowerCase();
//         return q
//             ? employees.filter((e) =>
//                 `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
//                 e.employee_code?.toLowerCase().includes(q) ||
//                 e.designation?.toLowerCase().includes(q),
//             )
//             : employees;
//     }, [employees, empSearch]);

//     useEffect(() => {
//         if (!isOpen) return;
//         if (isEdit && structure) {
//             setForm({
//                 employee_id: structure.employee_id ?? "",
//                 effective_from: structure.effective_from?.split("T")[0]?.split(" ")[0] ?? "",
//                 effective_to: structure.effective_to?.split("T")[0]?.split(" ")[0] ?? "",
//                 status: structure.status ?? "active",
//                 remarks: structure.remarks ?? "",
//             });
//         } else {
//             setForm({ employee_id: "", effective_from: "", effective_to: "", status: "active", remarks: "" });
//             setEmpSearch("");
//         }
//         setErrors({});
//     }, [isOpen, isEdit, structure]);

//     const set = (key) => (e) => {
//         setForm((p) => ({ ...p, [key]: e.target.value }));
//         setErrors((p) => (p[key] ? { ...p, [key]: null } : p));
//     };

//     const validate = () => {
//         const errs = {};
//         if (!isEdit && !form.employee_id) errs.employee_id = "Select an employee";
//         if (!form.effective_from) errs.effective_from = "Effective from is required";
//         if (form.effective_to && form.effective_from && new Date(form.effective_to) <= new Date(form.effective_from))
//             errs.effective_to = "Must be after effective from";
//         setErrors(errs);
//         return !Object.keys(errs).length;
//     };

//     const selectedEmp = useMemo(
//         () => employees.find((e) => String(e.id) === String(form.employee_id)),
//         [employees, form.employee_id],
//     );

//     const previewName = useMemo(() => {
//         if (!selectedEmp || !form.effective_from) return "";
//         const yr = new Date(form.effective_from).getFullYear();
//         const name = `${selectedEmp.first_name} ${selectedEmp.last_name}`.trim();
//         return `${name}${selectedEmp.designation ? ` - ${selectedEmp.designation}` : ""} ${yr}`;
//     }, [selectedEmp, form.effective_from]);

//     const handleSubmit = async () => {
//         if (!validate()) return;
//         setBusy(true);
//         try {
//             if (isEdit) {
//                 await dispatch(editEmployeeSalaryStructure({
//                     id: structure.id,
//                     data: { effective_to: form.effective_to || null, status: form.status, remarks: form.remarks.trim() || null },
//                 })).unwrap();
//             } else {
//                 await dispatch(addEmployeeSalaryStructure({
//                     employee_id: Number(form.employee_id),
//                     effective_from: form.effective_from,
//                     remarks: form.remarks.trim() || null,
//                 })).unwrap();
//             }
//             await dispatch(fetchEmployeeSalaryStructures()).unwrap();
//             onClose();
//         } catch (err) { alert(err?.message ?? String(err)); }
//         finally { setBusy(false); }
//     };

//     return (
//         <AnimatePresence>
//             {isOpen && (
//                 <Overlay onClick={onClose}>
//                     <Panel>
//                         <div className="sm-modal-header flex items-center justify-between px-6 py-4">
//                             <div className="flex items-center gap-3">
//                                 <div className="sm-icon-total-bg w-9 h-9 rounded-xl flex items-center justify-center">
//                                     <LayoutList size={18} className="sm-icon-total" />
//                                 </div>
//                                 <div>
//                                     <h2 className="sm-modal-title text-[16px] font-bold">{isEdit ? "Edit Structure" : "New Structure"}</h2>
//                                     <p className="sm-comp-muted text-[12px]">{isEdit ? structure?.structure_name : "Assign to an employee"}</p>
//                                 </div>
//                             </div>
//                             <button type="button" onClick={onClose} className="sm-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"><X size={17} /></button>
//                         </div>

//                         <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

//                             {/* Employee (create only) */}
//                             {!isEdit && (
//                                 <div className="flex flex-col gap-2">
//                                     <label className="sm-field-label">Employee <span className="sm-field-required">*</span></label>
//                                     <div className="sm-search-wrap flex items-center gap-2 rounded-lg px-3 py-2.5">
//                                         <Search size={14} className="sm-search-icon shrink-0" />
//                                         <input className="sm-search-input text-[13.5px]" placeholder="Search name, code, designation…"
//                                             value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} />
//                                     </div>
//                                     <select className={`${fi(errors.employee_id)} h-[110px]`} size={4}
//                                         value={form.employee_id} onChange={set("employee_id")}>
//                                         <option value="">— Select employee —</option>
//                                         {filteredEmployees.map((emp) => (
//                                             <option key={emp.id} value={emp.id}>
//                                                 {emp.first_name} {emp.last_name}
//                                                 {emp.employee_code ? ` (${emp.employee_code})` : ""}
//                                                 {emp.designation ? ` · ${emp.designation}` : ""}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     {errors.employee_id && <p className="sm-field-error">{errors.employee_id}</p>}
//                                 </div>
//                             )}

//                             {/* Employee info card */}
//                             {(isEdit || selectedEmp) && (
//                                 <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
//                                     <div className="sm-structure-avatar w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0">
//                                         {(isEdit ? structure?.first_name : selectedEmp?.first_name)?.[0]}
//                                         {(isEdit ? structure?.last_name : selectedEmp?.last_name)?.[0]}
//                                     </div>
//                                     <div>
//                                         <p className="sm-structure-name text-[13.5px]">
//                                             {isEdit ? `${structure?.first_name} ${structure?.last_name}` : `${selectedEmp?.first_name} ${selectedEmp?.last_name}`}
//                                         </p>
//                                         <p className="sm-comp-muted text-[12px]">
//                                             {isEdit ? structure?.designation : selectedEmp?.designation}
//                                         </p>
//                                     </div>
//                                 </div>
//                             )}

//                             <p className="sm-section-label pb-1.5">Effective Period</p>
//                             <div className="grid grid-cols-2 gap-x-5 gap-y-1">
//                                 {!isEdit ? (
//                                     <Field label="Effective From" required error={errors.effective_from}>
//                                         <input type="date" className={fi(errors.effective_from)} value={form.effective_from} onChange={set("effective_from")} />
//                                     </Field>
//                                 ) : (
//                                     <div className="flex flex-col gap-1">
//                                         <label className="sm-field-label">Effective From</label>
//                                         <div className="sm-form-input sm-form-input-disabled">{structure?.effective_from?.split("T")[0]?.split(" ")[0]}</div>
//                                         <div className="h-4" />
//                                     </div>
//                                 )}
//                                 <Field label="Effective To" error={errors.effective_to} hint="Leave blank for open-ended">
//                                     <input type="date" className={fi(errors.effective_to)} value={form.effective_to} onChange={set("effective_to")} />
//                                 </Field>
//                             </div>

//                             {!isEdit && previewName && (
//                                 <div className="flex flex-col gap-1">
//                                     <label className="sm-field-label">Auto-generated Name</label>
//                                     <div className="sm-preview-box">{previewName}</div>
//                                 </div>
//                             )}

//                             {isEdit && (
//                                 <Field label="Status">
//                                     <select className={fi(false)} value={form.status} onChange={set("status")}>
//                                         <option value="active">Active</option>
//                                         <option value="inactive">Inactive</option>
//                                     </select>
//                                 </Field>
//                             )}

//                             <Field label="Remarks">
//                                 <textarea className={fi(false)} rows={2} placeholder="Optional notes…" value={form.remarks} onChange={set("remarks")} />
//                             </Field>
//                         </div>

//                         <div className="sm-modal-footer flex justify-end gap-3 px-6 py-4">
//                             <button type="button" onClick={onClose} className="sm-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">Cancel</button>
//                             <button type="button" disabled={busy} onClick={handleSubmit}
//                                 className="sm-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold active:scale-[0.97]">
//                                 <CircleCheck size={15} />
//                                 {busy ? (isEdit ? "Updating…" : "Saving…") : (isEdit ? "Update" : "Create Structure")}
//                             </button>
//                         </div>
//                     </Panel>
//                 </Overlay>
//             )}
//         </AnimatePresence>
//     );
// }

// /* ══════════════════════════════════════════════════════════════════
//    2. SALARY DETAIL FORM MODAL  (add + edit component)
// ══════════════════════════════════════════════════════════════════ */
// export function SalaryDetailFormModal({ isOpen, onClose, detail = null, structureId = null, structureName = "" }) {
//     const dispatch = useDispatch();
//     const isEdit = Boolean(detail?.id);
//     // Tries both the singular- and plural-key convention, whichever your
//     // store actually registers this reducer under — see the same fix (and
//     // the reasoning behind it) in SalaryStructureDetailModal.jsx.
//     const components = useSelector(
//         (state) =>
//             state.employeeSalaryComponent?.employeeSalaryComponents ??
//             state.employeeSalaryComponents?.employeeSalaryComponents ??
//             [],
//     );

//     const [form, setForm] = useState({ component_id: "", calculation_type: "fixed", amount: "", percentage: "", based_on: "basic" });
//     const [errors, setErrors] = useState({});
//     const [busy, setBusy] = useState(false);

//     // THE FIX: nothing here ever dispatched a fetch for components either
//     // — same bug as SalaryStructureDetailModal.jsx, just duplicated into
//     // this consolidated file. Without this, the dropdown is empty unless
//     // whatever page you visited previously happened to load them first.
//     useEffect(() => {
//         if (isOpen) dispatch(fetchEmployeeSalaryComponents());
//     }, [dispatch, isOpen]);

//     useEffect(() => {
//         if (!isOpen) return;
//         if (isEdit && detail) {
//             setForm({
//                 component_id: detail.component_id ?? "",
//                 calculation_type: detail.calculation_type ?? "fixed",
//                 amount: detail.amount != null ? String(detail.amount) : "",
//                 percentage: detail.percentage != null ? String(detail.percentage) : "",
//                 based_on: detail.based_on ?? "basic",
//             });
//         } else {
//             setForm({ component_id: "", calculation_type: "fixed", amount: "", percentage: "", based_on: "basic" });
//         }
//         setErrors({});
//     }, [isOpen, isEdit, detail]);

//     const set = (key) => (e) => {
//         setForm((p) => ({ ...p, [key]: e.target.value }));
//         setErrors((p) => (p[key] ? { ...p, [key]: null } : p));
//     };

//     const selectCalc = (type) => {
//         setForm((p) => ({ ...p, calculation_type: type, amount: "", percentage: "" }));
//         setErrors((p) => ({ ...p, amount: null, percentage: null }));
//     };

//     const selectedComp = useMemo(
//         () => components.find((c) => String(c.id) === String(form.component_id)),
//         [components, form.component_id],
//     );

//     const validate = () => {
//         const errs = {};
//         if (!isEdit && !form.component_id) errs.component_id = "Select a component";
//         if (form.calculation_type === "fixed") {
//             if (!form.amount || isNaN(+form.amount) || +form.amount < 0) errs.amount = "Enter a valid amount";
//         } else {
//             if (!form.percentage || isNaN(+form.percentage) || +form.percentage < 0) errs.percentage = "Enter a valid percentage";
//             if (+form.percentage > 100) errs.percentage = "Cannot exceed 100";
//         }
//         setErrors(errs);
//         return !Object.keys(errs).length;
//     };

//     const handleSubmit = async () => {
//         if (!validate()) return;
//         setBusy(true);
//         const payload = form.calculation_type === "fixed"
//             ? { salary_structure_id: Number(structureId), component_id: Number(form.component_id), calculation_type: "fixed", amount: Number(form.amount) }
//             : { salary_structure_id: Number(structureId), component_id: Number(form.component_id), calculation_type: "percentage", percentage: Number(form.percentage), based_on: form.based_on };
//         try {
//             if (isEdit) {
//                 await dispatch(editEmployeeSalaryStructureDetail({ id: detail.id, data: payload })).unwrap();
//             } else {
//                 await dispatch(addEmployeeSalaryStructureDetail(payload)).unwrap();
//             }
//             await dispatch(fetchEmployeeSalaryStructureDetailsy()).unwrap();
//             onClose();
//         } catch (err) { alert(err?.message ?? String(err)); }
//         finally { setBusy(false); }
//     };

//     return (
//         <AnimatePresence>
//             {isOpen && (
//                 <Overlay onClick={onClose}>
//                     <Panel>
//                         <div className="sm-modal-header flex items-center justify-between px-6 py-4">
//                             <div className="flex items-center gap-3">
//                                 <div className="sm-icon-earning-bg w-9 h-9 rounded-xl flex items-center justify-center">
//                                     <IndianRupee size={18} className="sm-icon-earning" />
//                                 </div>
//                                 <div>
//                                     <h2 className="sm-modal-title text-[16px] font-bold">{isEdit ? "Edit Component" : "Add Component"}</h2>
//                                     <p className="sm-comp-muted text-[12px]">{structureName}</p>
//                                 </div>
//                             </div>
//                             <button type="button" onClick={onClose} className="sm-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"><X size={17} /></button>
//                         </div>

//                         <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

//                             {/* Component selector */}
//                             <Field label="Salary Component" required error={errors.component_id}>
//                                 <select className={fi(errors.component_id)} value={form.component_id} onChange={set("component_id")} disabled={isEdit}>
//                                     <option value="">
//                                         {components.length === 0 ? "No components available" : "— Select component —"}
//                                     </option>
//                                     {/* NOTE: groups/filters on c.type here, but the
//                                         standalone SalaryStructureDetailModal.jsx uses
//                                         c.component_type for the same purpose. Only one
//                                         of these can be the real field on your API
//                                         response — worth confirming which, since whichever
//                                         is wrong will silently show 0 components in every
//                                         group (empty optgroups just don't render) even
//                                         though `components` itself is non-empty. */}
//                                     {["earning", "deduction", "benefit"].map((type) => {
//                                         const grp = components.filter((c) => c.component_type === type && c.status === "active");
//                                         if (!grp.length) return null;
//                                         return (
//                                             <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
//                                                 {grp.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
//                                             </optgroup>
//                                         );
//                                     })}
//                                 </select>
//                             </Field>

//                             {/* Component preview */}
//                             {selectedComp && (
//                                 <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
//                                     <div>
//                                         <p className="sm-comp-name text-[13px] font-semibold">{selectedComp.name}</p>
//                                         <p className="sm-comp-muted text-[12px]">{selectedComp.code}</p>
//                                     </div>
//                                     <span className={`sm-comp-type sm-comp-type-${selectedComp.type}`}>{selectedComp.type}</span>
//                                 </div>
//                             )}

//                             {/* Calc type */}
//                             <p className="sm-section-label pb-1.5">Calculation Type</p>
//                             <div className="grid grid-cols-2 gap-3">
//                                 <button type="button" onClick={() => selectCalc("fixed")}
//                                     className={`sm-calc-option sm-calc-option-fixed ${form.calculation_type === "fixed" ? "sm-selected" : ""}`}>
//                                     <IndianRupee size={20} className="mx-auto mb-1" />Fixed Amount
//                                 </button>
//                                 <button type="button" onClick={() => selectCalc("percentage")}
//                                     className={`sm-calc-option sm-calc-option-percentage ${form.calculation_type === "percentage" ? "sm-selected" : ""}`}>
//                                     <Percent size={20} className="mx-auto mb-1" />Percentage
//                                 </button>
//                             </div>

//                             {form.calculation_type === "fixed" && (
//                                 <Field label="Amount (₹)" required error={errors.amount}>
//                                     <input type="number" min="0" step="0.01" className={fi(errors.amount)} placeholder="e.g. 25000" value={form.amount} onChange={set("amount")} />
//                                 </Field>
//                             )}
//                             {form.calculation_type === "percentage" && (
//                                 <div className="grid grid-cols-2 gap-x-5 gap-y-1">
//                                     <Field label="Percentage (%)" required error={errors.percentage} hint="0–100">
//                                         <input type="number" min="0" max="100" step="0.01" className={fi(errors.percentage)} placeholder="e.g. 12.5" value={form.percentage} onChange={set("percentage")} />
//                                     </Field>
//                                     <Field label="Based On">
//                                         <select className={fi(false)} value={form.based_on} onChange={set("based_on")}>
//                                             <option value="basic">Basic Salary</option>
//                                             <option value="gross">Gross Salary</option>
//                                         </select>
//                                     </Field>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="sm-modal-footer flex justify-end gap-3 px-6 py-4">
//                             <button type="button" onClick={onClose} className="sm-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">Cancel</button>
//                             <button type="button" disabled={busy} onClick={handleSubmit}
//                                 className="sm-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold active:scale-[0.97]">
//                                 <CircleCheck size={15} />
//                                 {busy ? (isEdit ? "Updating…" : "Saving…") : (isEdit ? "Update" : "Add Component")}
//                             </button>
//                         </div>
//                     </Panel>
//                 </Overlay>
//             )}
//         </AnimatePresence>
//     );
// }

// /* ══════════════════════════════════════════════════════════════════
//    3. GENERIC DELETE MODAL
// ══════════════════════════════════════════════════════════════════ */
// export function SalaryDeleteModal({ isOpen, onClose, type = "structure", item = null }) {
//     const dispatch = useDispatch();
//     const [busy, setBusy] = useState(false);

//     const isStructure = type === "structure";

//     const handleDelete = async () => {
//         if (!item?.id) return;
//         setBusy(true);
//         try {
//             if (isStructure) {
//                 await dispatch(removeEmployeeSalaryStructure(item.id)).unwrap();
//             } else {
//                 await dispatch(removeEmployeeSalaryStructureDetail(item.id)).unwrap();
//             }
//             onClose();
//         } catch (err) { alert(err?.message ?? String(err)); }
//         finally { setBusy(false); }
//     };

//     const title = isStructure ? "Delete Salary Structure" : "Remove Component";
//     const desc = isStructure
//         ? <>Delete <span className="font-semibold">"{item?.structure_name}"</span> for <span className="font-semibold">{item?.first_name} {item?.last_name}</span>? All component details will also be removed.</>
//         : <>Remove <span className="font-semibold">{item?.component_name}</span> from <span className="font-semibold">"{item?.structure_name}"</span>?</>;

//     return (
//         <AnimatePresence>
//             {isOpen && (
//                 <Overlay onClick={onClose}>
//                     <Panel maxWidth="max-w-sm">
//                         <div className="sm-modal-header flex items-center justify-between px-5 py-4">
//                             <h2 className="sm-modal-title text-[15px] font-bold">{title}</h2>
//                             <button type="button" onClick={onClose} className="sm-close-btn w-7 h-7 rounded-full flex items-center justify-center transition-colors"><X size={15} /></button>
//                         </div>
//                         <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
//                             <div className="sm-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
//                                 <Trash2 size={24} className="sm-delete-icon" />
//                             </div>
//                             <p className="sm-delete-title text-[15px] font-semibold">Are you sure?</p>
//                             <p className="sm-delete-desc text-[13px] leading-relaxed">{desc} This cannot be undone.</p>
//                         </div>
//                         <div className="sm-modal-footer flex justify-center gap-3 px-5 py-4">
//                             <button type="button" onClick={onClose} className="sm-modal-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">Cancel</button>
//                             <button type="button" disabled={busy} onClick={handleDelete}
//                                 className="sm-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]">
//                                 {busy ? "Deleting…" : isStructure ? "Delete" : "Remove"}
//                             </button>
//                         </div>
//                     </Panel>
//                 </Overlay>
//             )}
//         </AnimatePresence>
//     );
// }


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

/* ══════════════════════════════════════════════════════════════════
   1. SALARY STRUCTURE FORM MODAL  (add + edit)
══════════════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════════════
   2. SALARY DETAIL FORM MODAL  (add + edit component)
══════════════════════════════════════════════════════════════════ */
export function SalaryDetailFormModal({ isOpen, onClose, detail = null, structureId = null, structureName = "" }) {
    const dispatch = useDispatch();
    const isEdit = Boolean(detail?.id);
    // Tries both the singular- and plural-key convention, whichever your
    // store actually registers this reducer under.
    const components = useSelector(
        (state) =>
            state.employeeSalaryComponent?.employeeSalaryComponents ??
            state.employeeSalaryComponents?.employeeSalaryComponents ??
            [],
    );

    // THE CRASH: this modal only ever received structureId (a raw id), not
    // a full structure object — but the school-scoping filter below needs
    // selectedStructure.school_id. That variable was never defined
    // anywhere in this file (only in the *other* modal in this codebase,
    // SalaryStructureDetailModal.jsx, which does have the full structures
    // list). Referencing an undefined variable isn't optional-chainable
    // away — it's a ReferenceError on every render. Fixed by pulling the
    // structures list here too and deriving selectedStructure from
    // structureId, the same way the other modal derives it from a
    // dropdown selection.
    const structures = useSelector((state) => state.employeeSalaryStructure?.employeeSalaryStructures ?? []);
    const selectedStructure = useMemo(
        () => structures.find((s) => String(s.id) === String(structureId)),
        [structures, structureId],
    );

    const [form, setForm] = useState({ component_id: "", calculation_type: "fixed", amount: "", percentage: "", based_on: "basic" });
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

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

    // Looked up against the FULL components list, not the school-filtered
    // one — once a component_id is already set (e.g. editing an existing
    // detail), we want its info regardless of the current school filter.
    const selectedComp = useMemo(
        () => components.find((c) => String(c.id) === String(form.component_id)),
        [components, form.component_id],
    );

    /* ── School-scoped components ──
       Same fallback every other scoping helper in this app uses: a
       component with no school_id at all (typical for shared master data
       like Basic, HRA, PF) is always available, not excluded by a strict
       equality check against undefined. Before selectedStructure resolves
       (structures list still loading, or a bad structureId), falls back
       to the full component list rather than an unexplained empty one. */
    const filteredComponents = useMemo(() => {
        if (!selectedStructure) return components;
        return components.filter(
            (c) =>
                c.school_id == null ||
                String(c.school_id) === String(selectedStructure.school_id),
        );
    }, [components, selectedStructure]);

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
            await dispatch(fetchEmployeeSalaryStructureDetails(structureId)).unwrap();
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
                                        {filteredComponents.length === 0 ? "No components available" : "— Select component —"}
                                    </option>
                                    {["earning", "deduction", "benefit"].map((type) => {
                                        const grp = filteredComponents.filter((c) => c.component_type === type && c.status === "active");
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
                                    <span className={`sm-comp-type sm-comp-type-${selectedComp.component_type}`}>{selectedComp.component_type}</span>
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

/* ══════════════════════════════════════════════════════════════════
   3. GENERIC DELETE MODAL
══════════════════════════════════════════════════════════════════ */
export function SalaryDeleteModal({ isOpen, onClose, type = "structure", item = null }) {
    const dispatch = useDispatch();
    const [busy, setBusy] = useState(false);

    const isStructure = type === "structure";

    const handleDelete = async () => {
        if (!item?.id) return;
        setBusy(true);
        try {
            if (isStructure) {
                await dispatch(removeEmployeeSalaryStructure(item.id)).unwrap();
            } else {
                await dispatch(removeEmployeeSalaryStructureDetail(item.id)).unwrap();
            }
            onClose();
        } catch (err) { alert(err?.message ?? String(err)); }
        finally { setBusy(false); }
    };

    const title = isStructure ? "Delete Salary Structure" : "Remove Component";
    const desc = isStructure
        ? <>Delete <span className="font-semibold">"{item?.structure_name}"</span> for <span className="font-semibold">{item?.first_name} {item?.last_name}</span>? All component details will also be removed.</>
        : <>Remove <span className="font-semibold">{item?.component_name}</span> from <span className="font-semibold">"{item?.structure_name}"</span>?</>;

    return (
        <AnimatePresence>
            {isOpen && (
                <Overlay onClick={onClose}>
                    <Panel maxWidth="max-w-sm">
                        <div className="sm-modal-header flex items-center justify-between px-5 py-4">
                            <h2 className="sm-modal-title text-[15px] font-bold">{title}</h2>
                            <button type="button" onClick={onClose} className="sm-close-btn w-7 h-7 rounded-full flex items-center justify-center transition-colors"><X size={15} /></button>
                        </div>
                        <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
                            <div className="sm-delete-icon-wrap w-14 h-14 rounded-full flex items-center justify-center">
                                <Trash2 size={24} className="sm-delete-icon" />
                            </div>
                            <p className="sm-delete-title text-[15px] font-semibold">Are you sure?</p>
                            <p className="sm-delete-desc text-[13px] leading-relaxed">{desc} This cannot be undone.</p>
                        </div>
                        <div className="sm-modal-footer flex justify-center gap-3 px-5 py-4">
                            <button type="button" onClick={onClose} className="sm-modal-btn-cancel flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">Cancel</button>
                            <button type="button" disabled={busy} onClick={handleDelete}
                                className="sm-modal-btn-danger flex-1 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all active:scale-[0.97]">
                                {busy ? "Deleting…" : isStructure ? "Delete" : "Remove"}
                            </button>
                        </div>
                    </Panel>
                </Overlay>
            )}
        </AnimatePresence>
    );
}