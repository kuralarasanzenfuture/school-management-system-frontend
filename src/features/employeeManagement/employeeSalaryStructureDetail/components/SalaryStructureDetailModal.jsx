// import React, { useState, useEffect, useMemo } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { X, CircleCheck, IndianRupee, Percent } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//     addEmployeeSalaryStructureDetail,
//     editEmployeeSalaryStructureDetail,
// } from "../../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";
// import "../styles/SalaryStructureDetail.css";

// const INIT = {
//     salary_structure_id: "",
//     component_id: "",
//     calculation_type: "fixed",
//     amount: "",
//     percentage: "",
//     based_on: "basic",
// };

// function Field({ label, required, error, hint, children }) {
//     return (
//         <div className="flex flex-col gap-1">
//             <label className="ssd-field-label">
//                 {label}{required && <span className="ssd-field-required ml-0.5">*</span>}
//             </label>
//             {children}
//             {hint && !error && <p className="ssd-cell-muted text-[11px] mt-0.5">{hint}</p>}
//             <div className="h-4">
//                 {error && <p className="ssd-field-error">{error}</p>}
//             </div>
//         </div>
//     );
// }

// const fi = (hasError) => `ssd-form-input${hasError ? " ssd-form-input-error" : ""}`;

// export default function SalaryStructureDetailModal({
//     isOpen,
//     onClose,
//     detail = null,
//     structureId = null,   // pre-select when opened from a structure's detail page
// }) {
//     const dispatch = useDispatch();
//     const isEdit = Boolean(detail?.id);

//     const structures = useSelector((state) => state.employeeSalaryStructure?.employeeSalaryStructures ?? []);
//     const components = useSelector((state) => state.employeeSalaryComponents?.employeeSalaryComponents ?? []);

//     console.log("structures", structures);
//     console.log("components", components);

//     const [formData, setFormData] = useState({ ...INIT, salary_structure_id: structureId ?? "" });
//     const [errors, setErrors] = useState({});
//     const [submitting, setSubmitting] = useState(false);

//     /* ── Hydrate ── */
//     useEffect(() => {
//         if (!isOpen) return;
//         if (isEdit && detail) {
//             setFormData({
//                 salary_structure_id: detail.salary_structure_id ?? "",
//                 component_id: detail.component_id ?? "",
//                 calculation_type: detail.calculation_type ?? "fixed",
//                 amount: detail.amount != null ? String(detail.amount) : "",
//                 percentage: detail.percentage != null ? String(detail.percentage) : "",
//                 based_on: detail.based_on ?? "basic",
//             });
//         } else {
//             setFormData({ ...INIT, salary_structure_id: structureId ?? "" });
//         }
//         setErrors({});
//     }, [isOpen, isEdit, detail, structureId]);

//     /* ── Handler ── */
//     const handleChange = (key) => (e) => {
//         setFormData((prev) => ({ ...prev, [key]: e.target.value }));
//         setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev));
//     };

//     const selectCalcType = (type) => {
//         setFormData((prev) => ({
//             ...prev,
//             calculation_type: type,
//             amount: "",
//             percentage: "",
//         }));
//         setErrors((prev) => ({ ...prev, amount: null, percentage: null }));
//     };

//     /* ── Selected structure / component info ── */
//     const selectedStructure = useMemo(
//         () => structures.find((s) => String(s.id) === String(formData.salary_structure_id)),
//         [structures, formData.salary_structure_id],
//     );

//     const selectedComponent = useMemo(
//         () => components.find((c) => String(c.id) === String(formData.component_id)),
//         [components, formData.component_id],
//     );

//     /* ── Validate ── */
//     const validate = () => {
//         const errs = {};
//         if (!formData.salary_structure_id)
//             errs.salary_structure_id = "Please select a salary structure";
//         if (!formData.component_id)
//             errs.component_id = "Please select a component";
//         if (formData.calculation_type === "fixed") {
//             if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) < 0)
//                 errs.amount = "Enter a valid amount";
//         } else {
//             if (!formData.percentage || isNaN(Number(formData.percentage)) || Number(formData.percentage) < 0)
//                 errs.percentage = "Enter a valid percentage";
//             if (Number(formData.percentage) > 100)
//                 errs.percentage = "Percentage cannot exceed 100";
//         }
//         setErrors(errs);
//         return Object.keys(errs).length === 0;
//     };

//     /* ── Submit ── */
//     const handleSubmit = async () => {
//         if (!validate()) return;
//         setSubmitting(true);

//         const payload =
//             formData.calculation_type === "fixed"
//                 ? {
//                     salary_structure_id: Number(formData.salary_structure_id),
//                     component_id: Number(formData.component_id),
//                     calculation_type: "fixed",
//                     amount: Number(formData.amount),
//                 }
//                 : {
//                     salary_structure_id: Number(formData.salary_structure_id),
//                     component_id: Number(formData.component_id),
//                     calculation_type: "percentage",
//                     percentage: Number(formData.percentage),
//                     based_on: formData.based_on,
//                 };

//         try {
//             if (isEdit) {
//                 await dispatch(editEmployeeSalaryStructureDetail({ id: detail.id, data: payload })).unwrap();
//             } else {
//                 await dispatch(addEmployeeSalaryStructureDetail(payload)).unwrap();
//             }
//             onClose();
//         } catch (err) {
//             alert(err?.message ?? String(err));
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     return (
//         <AnimatePresence>
//             {isOpen && (
//                 <motion.div
//                     className="ssd-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
//                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                     onClick={onClose}
//                 >
//                     <motion.div
//                         onClick={(e) => e.stopPropagation()}
//                         initial={{ opacity: 0, scale: 0.92, y: 32 }}
//                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.92, y: 32 }}
//                         transition={{ duration: 0.22 }}
//                         className="ssd-modal w-full max-w-lg rounded-2xl overflow-hidden"
//                     >
//                         {/* Header */}
//                         <div className="ssd-modal-header flex items-center justify-between px-6 py-4">
//                             <div className="flex items-center gap-3">
//                                 <div className="ssd-icon-total-bg w-9 h-9 rounded-xl flex items-center justify-center">
//                                     <IndianRupee size={18} className="ssd-icon-total" />
//                                 </div>
//                                 <div>
//                                     <h2 className="ssd-modal-title text-[16px] font-bold tracking-tight">
//                                         {isEdit ? "Edit Salary Detail" : "Add Salary Detail"}
//                                     </h2>
//                                     <p className="ssd-cell-muted text-[12px]">
//                                         {isEdit
//                                             ? `Editing: ${detail?.component_name}`
//                                             : "Assign a component to a salary structure"}
//                                     </p>
//                                 </div>
//                             </div>
//                             <button type="button" onClick={onClose}
//                                 className="ssd-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors">
//                                 <X size={17} />
//                             </button>
//                         </div>

//                         {/* Body */}
//                         <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

//                             {/* Structure */}
//                             <p className="ssd-section-label pb-1.5">Assignment</p>
//                             <Field label="Salary Structure" required error={errors.salary_structure_id}>
//                                 <select
//                                     className={fi(errors.salary_structure_id)}
//                                     value={formData.salary_structure_id}
//                                     onChange={handleChange("salary_structure_id")}
//                                     disabled={Boolean(structureId) || isEdit}
//                                 >
//                                     <option value="">— Select salary structure —</option>
//                                     {structures.map((s) => (
//                                         <option key={s.id} value={s.id}>
//                                             {s.structure_name}
//                                             {s.first_name ? ` · ${s.first_name} ${s.last_name}` : ""}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </Field>

//                             {/* Show employee info if structure selected */}
//                             {selectedStructure && (
//                                 <div className="flex items-center gap-3 rounded-xl px-4 py-3"
//                                     style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
//                                     <div>
//                                         <p className="ssd-cell-primary text-[13px] font-semibold">
//                                             {selectedStructure.structure_name}
//                                         </p>
//                                         {selectedStructure.first_name && (
//                                             <p className="ssd-cell-muted text-[12px]">
//                                                 {selectedStructure.first_name} {selectedStructure.last_name}
//                                                 {selectedStructure.designation ? ` · ${selectedStructure.designation}` : ""}
//                                             </p>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Component */}
//                             <Field label="Salary Component" required error={errors.component_id}>
//                                 <select
//                                     className={fi(errors.component_id)}
//                                     value={formData.component_id}
//                                     onChange={handleChange("component_id")}
//                                     disabled={isEdit}
//                                 >
//                                     <option value="">— Select component —</option>
//                                     {/* Group by type */}
//                                     {["earning", "deduction", "benefit"].map((type) => {
//                                         const group = components.filter((c) => c.type === type);
//                                         if (group.length === 0) return null;
//                                         return (
//                                             <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
//                                                 {group.map((c) => (
//                                                     <option key={c.id} value={c.id}>
//                                                         {c.name} ({c.code})
//                                                     </option>
//                                                 ))}
//                                             </optgroup>
//                                         );
//                                     })}
//                                 </select>
//                             </Field>

//                             {/* Show component info */}
//                             {selectedComponent && (
//                                 <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
//                                     style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
//                                     <div>
//                                         <p className="ssd-cell-primary text-[13px] font-semibold">{selectedComponent.name}</p>
//                                         <p className="ssd-cell-muted text-[12px]">{selectedComponent.code}</p>
//                                     </div>
//                                     <span className={`ssd-comp-type ssd-comp-type-${selectedComponent.type}`}>
//                                         {selectedComponent.type}
//                                     </span>
//                                 </div>
//                             )}

//                             {/* Calculation type selector */}
//                             <p className="ssd-section-label pb-1.5">Calculation</p>
//                             <div className="grid grid-cols-2 gap-3">
//                                 <button
//                                     type="button"
//                                     onClick={() => selectCalcType("fixed")}
//                                     className={`ssd-calc-option ssd-calc-option-fixed ${formData.calculation_type === "fixed" ? "ssd-selected" : ""
//                                         }`}
//                                 >
//                                     <IndianRupee size={20} className="mx-auto mb-1" />
//                                     Fixed Amount
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={() => selectCalcType("percentage")}
//                                     className={`ssd-calc-option ssd-calc-option-percentage ${formData.calculation_type === "percentage" ? "ssd-selected" : ""
//                                         }`}
//                                 >
//                                     <Percent size={20} className="mx-auto mb-1" />
//                                     Percentage
//                                 </button>
//                             </div>

//                             {/* Fixed amount */}
//                             {formData.calculation_type === "fixed" && (
//                                 <Field label="Amount (₹)" required error={errors.amount}>
//                                     <input
//                                         type="number" min="0" step="0.01"
//                                         className={fi(errors.amount)}
//                                         placeholder="e.g. 25000"
//                                         value={formData.amount}
//                                         onChange={handleChange("amount")}
//                                     />
//                                 </Field>
//                             )}

//                             {/* Percentage + based_on */}
//                             {formData.calculation_type === "percentage" && (
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">
//                                     <Field label="Percentage (%)" required error={errors.percentage}
//                                         hint="Enter value between 0–100">
//                                         <input
//                                             type="number" min="0" max="100" step="0.01"
//                                             className={fi(errors.percentage)}
//                                             placeholder="e.g. 12.5"
//                                             value={formData.percentage}
//                                             onChange={handleChange("percentage")}
//                                         />
//                                     </Field>
//                                     <Field label="Based On" required>
//                                         <select className={fi(false)} value={formData.based_on}
//                                             onChange={handleChange("based_on")}>
//                                             <option value="basic">Basic Salary</option>
//                                             <option value="gross">Gross Salary</option>
//                                         </select>
//                                     </Field>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Footer */}
//                         <div className="ssd-modal-footer flex items-center justify-end gap-3 px-6 py-4">
//                             <button type="button" onClick={onClose}
//                                 className="ssd-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">
//                                 Cancel
//                             </button>
//                             <button type="button" disabled={submitting} onClick={handleSubmit}
//                                 className="ssd-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors active:scale-[0.97]">
//                                 <CircleCheck size={15} />
//                                 {submitting
//                                     ? isEdit ? "Updating…" : "Saving…"
//                                     : isEdit ? "Update Detail" : "Add Detail"}
//                             </button>
//                         </div>
//                     </motion.div>
//                 </motion.div>
//             )}
//         </AnimatePresence>
//     );
// }

/*-------------------------------------------------------------*/

// import React, { useState, useEffect, useMemo } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { X, CircleCheck, IndianRupee, Percent } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//     addEmployeeSalaryStructureDetail,
//     editEmployeeSalaryStructureDetail,
// } from "../../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";
// // Fixes the empty-dropdown bug: nothing was ever dispatching a fetch for
// // either list — the modal only worked if some other page (e.g. Components)
// // happened to have already loaded them into Redux first.
// import { fetchEmployeeSalaryStructures } from "../../../../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
// // ASSUMPTION: follows the same naming pattern as the other slices in this
// // app. Adjust the import path/thunk name if employeeSalaryComponentSlice.js
// // actually exports something different.
// import { fetchEmployeeSalaryComponents } from "../../../../redux/employee_salary_component/employeeSalaryComponentSlice.js";
// import "../styles/SalaryStructureDetail.css";

// const INIT = {
//     salary_structure_id: "",
//     component_id: "",
//     calculation_type: "fixed",
//     amount: "",
//     percentage: "",
//     based_on: "basic",
// };

// function Field({ label, required, error, hint, children }) {
//     return (
//         <div className="flex flex-col gap-1">
//             <label className="ssd-field-label">
//                 {label}{required && <span className="ssd-field-required ml-0.5">*</span>}
//             </label>
//             {children}
//             {hint && !error && <p className="ssd-cell-muted text-[11px] mt-0.5">{hint}</p>}
//             <div className="h-4">
//                 {error && <p className="ssd-field-error">{error}</p>}
//             </div>
//         </div>
//     );
// }

// const fi = (hasError) => `ssd-form-input${hasError ? " ssd-form-input-error" : ""}`;

// export default function SalaryStructureDetailModal({
//     isOpen,
//     onClose,
//     detail = null,
//     structureId = null,   // pre-select when opened from a structure's detail page
// }) {
//     const dispatch = useDispatch();
//     const isEdit = Boolean(detail?.id);

//     const structures = useSelector((state) => state.employeeSalaryStructure?.employeeSalaryStructures ?? []);
//     const components = useSelector((state) => state.employeeSalaryComponents?.employeeSalaryComponents ?? []);

//     // console.log("structures", structures);
//     console.log("components", components);

//     const { user } = useSelector((state) => state.auth);
//     const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
//     const schoolId = isAdmin ? null : user?.school_id;

//     const [formData, setFormData] = useState({ ...INIT, salary_structure_id: structureId ?? "" });
//     const [errors, setErrors] = useState({});
//     const [submitting, setSubmitting] = useState(false);

//     /* ── Fetch both lists whenever the modal opens ──
//        Both thunks are dispatched unconditionally (not gated behind an
//        "if empty" check) so re-opening the modal always shows current data,
//        not a stale snapshot from whenever some other page last fetched it. */
//     useEffect(() => {
//         if (!isOpen) return;
//         dispatch(fetchEmployeeSalaryStructures());
//         dispatch(fetchEmployeeSalaryComponents());
//     }, [dispatch, isOpen]);

//     /* ── School-scoped structures ──
//        ASSUMPTION: each structure record carries its own school_id (same
//        convention as every other list in this app — students, departments,
//        employees, etc). Admins see every structure; everyone else only
//        sees their own school's. Components are treated as shared master
//        data (Basic, HRA, etc.) and are NOT scoped by school here — if your
//        components actually are school-specific, say so and I'll scope
//        those the same way. */
//     const scopedStructures = useMemo(() => {
//         if (isAdmin || !schoolId) return structures;
//         return structures.filter(
//             (s) => s.school_id == null || String(s.school_id) === String(schoolId),
//         );
//     }, [structures, isAdmin, schoolId]);

//     /* ── Hydrate ── */
//     useEffect(() => {
//         if (!isOpen) return;
//         if (isEdit && detail) {
//             setFormData({
//                 salary_structure_id: detail.salary_structure_id ?? "",
//                 component_id: detail.component_id ?? "",
//                 calculation_type: detail.calculation_type ?? "fixed",
//                 amount: detail.amount != null ? String(detail.amount) : "",
//                 percentage: detail.percentage != null ? String(detail.percentage) : "",
//                 based_on: detail.based_on ?? "basic",
//             });
//         } else {
//             setFormData({ ...INIT, salary_structure_id: structureId ?? "" });
//         }
//         setErrors({});
//     }, [isOpen, isEdit, detail, structureId]);

//     /* ── Handler ── */
//     const handleChange = (key) => (e) => {
//         setFormData((prev) => ({ ...prev, [key]: e.target.value }));
//         setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev));
//     };

//     const selectCalcType = (type) => {
//         setFormData((prev) => ({
//             ...prev,
//             calculation_type: type,
//             amount: "",
//             percentage: "",
//         }));
//         setErrors((prev) => ({ ...prev, amount: null, percentage: null }));
//     };

//     /* ── Selected structure / component info ── */
//     const selectedStructure = useMemo(
//         () => scopedStructures.find((s) => String(s.id) === String(formData.salary_structure_id)),
//         [scopedStructures, formData.salary_structure_id],
//     );

//     const selectedComponent = useMemo(
//         () => components.find((c) => String(c.id) === String(formData.component_id)),
//         [components, formData.component_id],
//     );

//     // console.log("selectedStructure", selectedStructure);
//     console.log("selectedComponent", selectedComponent);

//     /* ── Validate ── */
//     const validate = () => {
//         const errs = {};
//         if (!formData.salary_structure_id)
//             errs.salary_structure_id = "Please select a salary structure";
//         if (!formData.component_id)
//             errs.component_id = "Please select a component";
//         if (formData.calculation_type === "fixed") {
//             if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) < 0)
//                 errs.amount = "Enter a valid amount";
//         } else {
//             if (!formData.percentage || isNaN(Number(formData.percentage)) || Number(formData.percentage) < 0)
//                 errs.percentage = "Enter a valid percentage";
//             if (Number(formData.percentage) > 100)
//                 errs.percentage = "Percentage cannot exceed 100";
//         }
//         setErrors(errs);
//         return Object.keys(errs).length === 0;
//     };

//     /* ── Submit ── */
//     const handleSubmit = async () => {
//         if (!validate()) return;
//         setSubmitting(true);

//         const payload =
//             formData.calculation_type === "fixed"
//                 ? {
//                     salary_structure_id: Number(formData.salary_structure_id),
//                     component_id: Number(formData.component_id),
//                     calculation_type: "fixed",
//                     amount: Number(formData.amount),
//                 }
//                 : {
//                     salary_structure_id: Number(formData.salary_structure_id),
//                     component_id: Number(formData.component_id),
//                     calculation_type: "percentage",
//                     percentage: Number(formData.percentage),
//                     based_on: formData.based_on,
//                 };

//         try {
//             if (isEdit) {
//                 await dispatch(editEmployeeSalaryStructureDetail({ id: detail.id, data: payload })).unwrap();
//             } else {
//                 await dispatch(addEmployeeSalaryStructureDetail(payload)).unwrap();
//             }
//             onClose();
//         } catch (err) {
//             alert(err?.message ?? String(err));
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     return (
//         <AnimatePresence>
//             {isOpen && (
//                 <motion.div
//                     className="ssd-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
//                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                     onClick={onClose}
//                 >
//                     <motion.div
//                         onClick={(e) => e.stopPropagation()}
//                         initial={{ opacity: 0, scale: 0.92, y: 32 }}
//                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.92, y: 32 }}
//                         transition={{ duration: 0.22 }}
//                         className="ssd-modal w-full max-w-lg rounded-2xl overflow-hidden"
//                     >
//                         {/* Header */}
//                         <div className="ssd-modal-header flex items-center justify-between px-6 py-4">
//                             <div className="flex items-center gap-3">
//                                 <div className="ssd-icon-total-bg w-9 h-9 rounded-xl flex items-center justify-center">
//                                     <IndianRupee size={18} className="ssd-icon-total" />
//                                 </div>
//                                 <div>
//                                     <h2 className="ssd-modal-title text-[16px] font-bold tracking-tight">
//                                         {isEdit ? "Edit Salary Detail" : "Add Salary Detail"}
//                                     </h2>
//                                     <p className="ssd-cell-muted text-[12px]">
//                                         {isEdit
//                                             ? `Editing: ${detail?.component_name}`
//                                             : "Assign a component to a salary structure"}
//                                     </p>
//                                 </div>
//                             </div>
//                             <button type="button" onClick={onClose}
//                                 className="ssd-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors">
//                                 <X size={17} />
//                             </button>
//                         </div>

//                         {/* Body */}
//                         <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

//                             {/* Structure */}
//                             <p className="ssd-section-label pb-1.5">Assignment</p>
//                             <Field label="Salary Structure" required error={errors.salary_structure_id}>
//                                 <select
//                                     className={fi(errors.salary_structure_id)}
//                                     value={formData.salary_structure_id}
//                                     onChange={handleChange("salary_structure_id")}
//                                     disabled={Boolean(structureId) || isEdit}
//                                 >
//                                     <option value="">— Select salary structure —</option>
//                                     {scopedStructures.map((s) => (
//                                         <option key={s.id} value={s.id}>
//                                             {s.structure_name}
//                                             {s.first_name ? ` · ${s.first_name} ${s.last_name}` : ""}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </Field>

//                             {/* Show employee info if structure selected */}
//                             {selectedStructure && (
//                                 <div className="flex items-center gap-3 rounded-xl px-4 py-3"
//                                     style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
//                                     <div>
//                                         <p className="ssd-cell-primary text-[13px] font-semibold">
//                                             {selectedStructure.structure_name}
//                                         </p>
//                                         {selectedStructure.first_name && (
//                                             <p className="ssd-cell-muted text-[12px]">
//                                                 {selectedStructure.first_name} {selectedStructure.last_name}
//                                                 {selectedStructure.designation ? ` · ${selectedStructure.designation}` : ""}
//                                             </p>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Component */}
//                             <Field label="Salary Component" required error={errors.component_id}>
//                                 <select
//                                     className={fi(errors.component_id)}
//                                     value={formData.component_id}
//                                     onChange={handleChange("component_id")}
//                                     disabled={isEdit}
//                                 >
//                                     <option value="">— Select component —</option>
//                                     {/* Group by type */}
//                                     {["earning", "deduction", "benefit"].map((type) => {
//                                         const group = components.filter((c) => c.type === type);
//                                         if (group.length === 0) return null;
//                                         return (
//                                             <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
//                                                 {group.map((c) => (
//                                                     <option key={c.id} value={c.id}>
//                                                         {c.name} ({c.code})
//                                                     </option>
//                                                 ))}
//                                             </optgroup>
//                                         );
//                                     })}
//                                 </select>
//                             </Field>

//                             {/* Show component info */}
//                             {selectedComponent && (
//                                 <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
//                                     style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
//                                     <div>
//                                         <p className="ssd-cell-primary text-[13px] font-semibold">{selectedComponent.name}</p>
//                                         <p className="ssd-cell-muted text-[12px]">{selectedComponent.code}</p>
//                                     </div>
//                                     <span className={`ssd-comp-type ssd-comp-type-${selectedComponent.type}`}>
//                                         {selectedComponent.type}
//                                     </span>
//                                 </div>
//                             )}

//                             {/* Calculation type selector */}
//                             <p className="ssd-section-label pb-1.5">Calculation</p>
//                             <div className="grid grid-cols-2 gap-3">
//                                 <button
//                                     type="button"
//                                     onClick={() => selectCalcType("fixed")}
//                                     className={`ssd-calc-option ssd-calc-option-fixed ${formData.calculation_type === "fixed" ? "ssd-selected" : ""
//                                         }`}
//                                 >
//                                     <IndianRupee size={20} className="mx-auto mb-1" />
//                                     Fixed Amount
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={() => selectCalcType("percentage")}
//                                     className={`ssd-calc-option ssd-calc-option-percentage ${formData.calculation_type === "percentage" ? "ssd-selected" : ""
//                                         }`}
//                                 >
//                                     <Percent size={20} className="mx-auto mb-1" />
//                                     Percentage
//                                 </button>
//                             </div>

//                             {/* Fixed amount */}
//                             {formData.calculation_type === "fixed" && (
//                                 <Field label="Amount (₹)" required error={errors.amount}>
//                                     <input
//                                         type="number" min="0" step="0.01"
//                                         className={fi(errors.amount)}
//                                         placeholder="e.g. 25000"
//                                         value={formData.amount}
//                                         onChange={handleChange("amount")}
//                                     />
//                                 </Field>
//                             )}

//                             {/* Percentage + based_on */}
//                             {formData.calculation_type === "percentage" && (
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">
//                                     <Field label="Percentage (%)" required error={errors.percentage}
//                                         hint="Enter value between 0–100">
//                                         <input
//                                             type="number" min="0" max="100" step="0.01"
//                                             className={fi(errors.percentage)}
//                                             placeholder="e.g. 12.5"
//                                             value={formData.percentage}
//                                             onChange={handleChange("percentage")}
//                                         />
//                                     </Field>
//                                     <Field label="Based On" required>
//                                         <select className={fi(false)} value={formData.based_on}
//                                             onChange={handleChange("based_on")}>
//                                             <option value="basic">Basic Salary</option>
//                                             <option value="gross">Gross Salary</option>
//                                         </select>
//                                     </Field>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Footer */}
//                         <div className="ssd-modal-footer flex items-center justify-end gap-3 px-6 py-4">
//                             <button type="button" onClick={onClose}
//                                 className="ssd-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">
//                                 Cancel
//                             </button>
//                             <button type="button" disabled={submitting} onClick={handleSubmit}
//                                 className="ssd-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors active:scale-[0.97]">
//                                 <CircleCheck size={15} />
//                                 {submitting
//                                     ? isEdit ? "Updating…" : "Saving…"
//                                     : isEdit ? "Update Detail" : "Add Detail"}
//                             </button>
//                         </div>
//                     </motion.div>
//                 </motion.div>
//             )}
//         </AnimatePresence>
//     );
// }
import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CircleCheck, IndianRupee, Percent } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    addEmployeeSalaryStructureDetail,
    editEmployeeSalaryStructureDetail,
} from "../../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";
import { fetchEmployeeSalaryStructures } from "../../../../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
// ASSUMPTION: follows the same naming pattern as the other slices in this
// app. Adjust the import path/thunk name if employeeSalaryComponentSlice.js
// actually exports something different.
import { fetchEmployeeSalaryComponents } from "../../../../redux/employee_salary_component/employeeSalaryComponentSlice.js";
import "../styles/SalaryStructureDetail.css";

const INIT = {
    salary_structure_id: "",
    component_id: "",
    calculation_type: "fixed",
    amount: "",
    percentage: "",
    based_on: "basic",
};

function Field({ label, required, error, hint, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="ssd-field-label">
                {label}{required && <span className="ssd-field-required ml-0.5">*</span>}
            </label>
            {children}
            {hint && !error && <p className="ssd-cell-muted text-[11px] mt-0.5">{hint}</p>}
            <div className="h-4">
                {error && <p className="ssd-field-error">{error}</p>}
            </div>
        </div>
    );
}

const fi = (hasError) => `ssd-form-input${hasError ? " ssd-form-input-error" : ""}`;

export default function SalaryStructureDetailModal({
    isOpen,
    onClose,
    detail = null,
    structureId = null,   // pre-select when opened from a structure's detail page
}) {
    const dispatch = useDispatch();
    const isEdit = Boolean(detail?.id);

    const structures = useSelector((state) => state.employeeSalaryStructure?.employeeSalaryStructures ?? []);
    // Tries BOTH the singular-key convention (matches structures above) and
    // the plural key, whichever your store actually uses — since I can't
    // see employeeSalaryComponentSlice.js / your rootReducer, this avoids
    // guessing wrong a second time and silently reading an empty state.
    const components = useSelector(
        (state) =>
            state.employeeSalaryComponent?.employeeSalaryComponents ??
            state.employeeSalaryComponents?.employeeSalaryComponents ??
            [],
    );

    const { user } = useSelector((state) => state.auth);
    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const schoolId = isAdmin ? null : user?.school_id;

    const [formData, setFormData] = useState({ ...INIT, salary_structure_id: structureId ?? "" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    /* ── Fetch both lists whenever the modal opens ──
       Both thunks are dispatched unconditionally (not gated behind an
       "if empty" check) so re-opening the modal always shows current data,
       not a stale snapshot from whenever some other page last fetched it. */
    useEffect(() => {
        if (!isOpen) return;
        dispatch(fetchEmployeeSalaryStructures());
        dispatch(fetchEmployeeSalaryComponents());
    }, [dispatch, isOpen]);

    /* ── School-scoped structures ──
       ASSUMPTION: each structure record carries its own school_id (same
       convention as every other list in this app). Admins see every
       structure; everyone else only sees their own school's. */
    const scopedStructures = useMemo(() => {
        if (isAdmin || !schoolId) return structures;
        return structures.filter(
            (s) => s.school_id == null || String(s.school_id) === String(schoolId),
        );
    }, [structures, isAdmin, schoolId]);

    /* ── Hydrate ── */
    useEffect(() => {
        if (!isOpen) return;
        if (isEdit && detail) {
            setFormData({
                salary_structure_id: detail.salary_structure_id ?? "",
                component_id: detail.component_id ?? "",
                calculation_type: detail.calculation_type ?? "fixed",
                amount: detail.amount != null ? String(detail.amount) : "",
                percentage: detail.percentage != null ? String(detail.percentage) : "",
                based_on: detail.based_on ?? "basic",
            });
        } else {
            setFormData({ ...INIT, salary_structure_id: structureId ?? "" });
        }
        setErrors({});
    }, [isOpen, isEdit, detail, structureId]);

    /* ── Handler ── */
    const handleChange = (key) => (e) => {
        setFormData((prev) => ({ ...prev, [key]: e.target.value }));
        setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev));
    };

    const selectCalcType = (type) => {
        setFormData((prev) => ({
            ...prev,
            calculation_type: type,
            amount: "",
            percentage: "",
        }));
        setErrors((prev) => ({ ...prev, amount: null, percentage: null }));
    };

    /* ── Selected structure ── */
    const selectedStructure = useMemo(
        () => scopedStructures.find((s) => String(s.id) === String(formData.salary_structure_id)),
        [scopedStructures, formData.salary_structure_id],
    );

    /* ── School-scoped components ──
       THE ACTUAL BUG: this filter had no "or it's global/unscoped" escape
       hatch (unlike scopedStructures above, and every other scoping helper
       in this app — StudentAdmissionForm's scopedTo(), etc). Salary
       components (Basic, HRA, PF...) are typically shared master data with
       no school_id at all — a strict String(c.school_id) === ... match
       against that throws away every single one. Now: components with no
       school_id are always available; once a structure is picked, its
       school's own components are included too. Before a structure is
       picked, ALL components show (nothing to scope against yet) instead
       of an unexplained empty list. */
    const scopedComponents = useMemo(() => {
        if (!selectedStructure) return components;
        return components.filter(
            (c) =>
                c.school_id == null ||
                String(c.school_id) === String(selectedStructure.school_id),
        );
    }, [components, selectedStructure]);

    const selectedComponent = useMemo(
        () => scopedComponents.find((c) => String(c.id) === String(formData.component_id)),
        [scopedComponents, formData.component_id],
    );

    /* ── Validate ── */
    const validate = () => {
        const errs = {};
        if (!formData.salary_structure_id)
            errs.salary_structure_id = "Please select a salary structure";
        if (!formData.component_id)
            errs.component_id = "Please select a component";
        if (formData.calculation_type === "fixed") {
            if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) < 0)
                errs.amount = "Enter a valid amount";
        } else {
            if (!formData.percentage || isNaN(Number(formData.percentage)) || Number(formData.percentage) < 0)
                errs.percentage = "Enter a valid percentage";
            if (Number(formData.percentage) > 100)
                errs.percentage = "Percentage cannot exceed 100";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);

        const payload =
            formData.calculation_type === "fixed"
                ? {
                    salary_structure_id: Number(formData.salary_structure_id),
                    component_id: Number(formData.component_id),
                    calculation_type: "fixed",
                    amount: Number(formData.amount),
                }
                : {
                    salary_structure_id: Number(formData.salary_structure_id),
                    component_id: Number(formData.component_id),
                    calculation_type: "percentage",
                    percentage: Number(formData.percentage),
                    based_on: formData.based_on,
                };

        try {
            if (isEdit) {
                await dispatch(editEmployeeSalaryStructureDetail({ id: detail.id, data: payload })).unwrap();
            } else {
                await dispatch(addEmployeeSalaryStructureDetail(payload)).unwrap();
            }
            // THE OTHER BUG: this called an undefined fetchStructures(),
            // which threw a ReferenceError right after a successful save —
            // the record saved fine, but the catch block below still fired,
            // showed an error alert, and the modal never closed. If you do
            // want the structures list refreshed after saving a detail
            // (e.g. because it shows a computed total), dispatch the real
            // thunk instead:
            await dispatch(fetchEmployeeSalaryStructures());
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
                    className="ssd-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 32 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 32 }}
                        transition={{ duration: 0.22 }}
                        className="ssd-modal w-full max-w-lg rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="ssd-modal-header flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="ssd-icon-total-bg w-9 h-9 rounded-xl flex items-center justify-center">
                                    <IndianRupee size={18} className="ssd-icon-total" />
                                </div>
                                <div>
                                    <h2 className="ssd-modal-title text-[16px] font-bold tracking-tight">
                                        {isEdit ? "Edit Salary Detail" : "Add Salary Detail"}
                                    </h2>
                                    <p className="ssd-cell-muted text-[12px]">
                                        {isEdit
                                            ? `Editing: ${detail?.component_name}`
                                            : "Assign a component to a salary structure"}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={onClose}
                                className="ssd-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                                <X size={17} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-5">

                            {/* Structure */}
                            <p className="ssd-section-label pb-1.5">Assignment</p>
                            <Field label="Salary Structure" required error={errors.salary_structure_id}>
                                <select
                                    className={fi(errors.salary_structure_id)}
                                    value={formData.salary_structure_id}
                                    onChange={handleChange("salary_structure_id")}
                                    disabled={Boolean(structureId) || isEdit}
                                >
                                    <option value="">— Select salary structure —</option>
                                    {scopedStructures.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.structure_name}
                                            {s.first_name ? ` · ${s.first_name} ${s.last_name}` : ""}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            {/* Show employee info if structure selected */}
                            {selectedStructure && (
                                <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                                    style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
                                    <div>
                                        <p className="ssd-cell-primary text-[13px] font-semibold">
                                            {selectedStructure.structure_name}
                                        </p>
                                        {selectedStructure.first_name && (
                                            <p className="ssd-cell-muted text-[12px]">
                                                {selectedStructure.first_name} {selectedStructure.last_name}
                                                {selectedStructure.designation ? ` · ${selectedStructure.designation}` : ""}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Component */}
                            <Field label="Salary Component" required error={errors.component_id}>
                                <select
                                    className={fi(errors.component_id)}
                                    value={formData.component_id}
                                    onChange={handleChange("component_id")}
                                    disabled={isEdit}
                                >
                                    <option value="">
                                        {scopedComponents.length === 0
                                            ? "No components available"
                                            : "— Select component —"}
                                    </option>
                                    {/* Group by type */}
                                    {["earning", "deduction", "benefit"].map((type) => {
                                        const group = scopedComponents.filter((c) => c.component_type === type);
                                        if (group.length === 0) return null;
                                        return (
                                            <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
                                                {group.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name} ({c.code})
                                                    </option>
                                                ))}
                                            </optgroup>
                                        );
                                    })}
                                </select>
                            </Field>

                            {/* Show component info */}
                            {selectedComponent && (
                                <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                                    style={{ background: "var(--input-bg)", border: "1px solid var(--divider)" }}>
                                    <div>
                                        <p className="ssd-cell-primary text-[13px] font-semibold">{selectedComponent.name}</p>
                                        <p className="ssd-cell-muted text-[12px]">{selectedComponent.code}</p>
                                    </div>
                                    <span className={`ssd-comp-type ssd-comp-type-${selectedComponent.component_type}`}>
                                        {selectedComponent.component_type}
                                    </span>
                                </div>
                            )}

                            {/* Calculation type selector */}
                            <p className="ssd-section-label pb-1.5">Calculation</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => selectCalcType("fixed")}
                                    className={`ssd-calc-option ssd-calc-option-fixed ${formData.calculation_type === "fixed" ? "ssd-selected" : ""
                                        }`}
                                >
                                    <IndianRupee size={20} className="mx-auto mb-1" />
                                    Fixed Amount
                                </button>
                                <button
                                    type="button"
                                    onClick={() => selectCalcType("percentage")}
                                    className={`ssd-calc-option ssd-calc-option-percentage ${formData.calculation_type === "percentage" ? "ssd-selected" : ""
                                        }`}
                                >
                                    <Percent size={20} className="mx-auto mb-1" />
                                    Percentage
                                </button>
                            </div>

                            {/* Fixed amount */}
                            {formData.calculation_type === "fixed" && (
                                <Field label="Amount (₹)" required error={errors.amount}>
                                    <input
                                        type="number" min="0" step="0.01"
                                        className={fi(errors.amount)}
                                        placeholder="e.g. 25000"
                                        value={formData.amount}
                                        onChange={handleChange("amount")}
                                    />
                                </Field>
                            )}

                            {/* Percentage + based_on */}
                            {formData.calculation_type === "percentage" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1">
                                    <Field label="Percentage (%)" required error={errors.percentage}
                                        hint="Enter value between 0–100">
                                        <input
                                            type="number" min="0" max="100" step="0.01"
                                            className={fi(errors.percentage)}
                                            placeholder="e.g. 12.5"
                                            value={formData.percentage}
                                            onChange={handleChange("percentage")}
                                        />
                                    </Field>
                                    <Field label="Based On" required>
                                        <select className={fi(false)} value={formData.based_on}
                                            onChange={handleChange("based_on")}>
                                            <option value="basic">Basic Salary</option>
                                            <option value="gross">Gross Salary</option>
                                        </select>
                                    </Field>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="ssd-modal-footer flex items-center justify-end gap-3 px-6 py-4">
                            <button type="button" onClick={onClose}
                                className="ssd-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors">
                                Cancel
                            </button>
                            <button type="button" disabled={submitting} onClick={handleSubmit}
                                className="ssd-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors active:scale-[0.97]">
                                <CircleCheck size={15} />
                                {submitting
                                    ? isEdit ? "Updating…" : "Saving…"
                                    : isEdit ? "Update Detail" : "Add Detail"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}