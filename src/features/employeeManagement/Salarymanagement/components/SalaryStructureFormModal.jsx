import React, { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    X, CircleCheck, CheckCircle2, LayoutList, IndianRupee,
    Percent, Trash2, Search, ChevronDown, Users,
    Briefcase, Pencil, UserCheck, AlertTriangle, AlertCircle, Phone,
} from "lucide-react";
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

function getInitials(f, l) {
    return `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase() || "?";
}

export function SalaryStructureFormModal({ isOpen, onClose, structure = null }) {
    const dispatch = useDispatch();
    const isEdit = Boolean(structure?.id);
    const employees = useSelector((state) => state.employees?.employees ?? []);
    const empLoading = useSelector((state) => state.employees?.loading ?? false);
    const structures = useSelector((state) => state.employeeSalaryStructure?.employeeSalaryStructures ?? []);

    const [empSearch, setEmpSearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [serverError, setServerError] = useState(null);

    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);

    const [form, setForm] = useState({
        employee_id: "",
        effective_from: "",
        effective_to: "",
        status: "active",
        remarks: "",
    });
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchEmployees());
            dispatch(fetchEmployeeSalaryStructures());
        }
    }, [dispatch, isOpen]);

    // Map of employeeId -> active salary structure (for create mode detection)
    const employeeActiveStructureMap = useMemo(() => {
        const map = new Map();
        (structures ?? []).forEach((s) => {
            if (s.status === "active") {
                map.set(String(s.employee_id), s);
            }
        });
        return map;
    }, [structures]);

    // Check if the selected employee already has an active structure
    const existingActiveStructure = useMemo(() => {
        if (isEdit || !form.employee_id) return null;
        return employeeActiveStructureMap.get(String(form.employee_id)) || null;
    }, [isEdit, form.employee_id, employeeActiveStructureMap]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    const filteredEmployees = useMemo(() => {
        const q = empSearch.trim().toLowerCase();
        if (!q) return employees;
        return employees.filter((e) => {
            const name = `${e.first_name ?? ""} ${e.last_name ?? ""}`.toLowerCase();
            const code = (e.employee_code ?? "").toLowerCase();
            const designation = (e.designation ?? "").toLowerCase();
            const department = (e.department ?? "").toLowerCase();
            const phone = String(e.phone ?? e.mobile ?? e.contact_no ?? e.phone_number ?? "").toLowerCase();
            return (
                name.includes(q) ||
                code.includes(q) ||
                designation.includes(q) ||
                department.includes(q) ||
                phone.includes(q)
            );
        });
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
            setIsDropdownOpen(false);
            setHighlightedIndex(0);
        }
        setErrors({});
        setServerError(null);
    }, [isOpen, isEdit, structure]);

    const set = (key) => (e) => {
        setForm((p) => ({ ...p, [key]: e.target.value }));
        setErrors((p) => (p[key] ? { ...p, [key]: null } : p));
        setServerError(null);
    };

    const handleSelectEmployee = (emp) => {
        setForm((prev) => ({ ...prev, employee_id: emp.id }));
        setErrors((prev) => (prev.employee_id ? { ...prev, employee_id: null } : prev));
        setServerError(null);
        setIsDropdownOpen(false);
        setEmpSearch("");
    };

    const handleKeyDown = (e) => {
        if (!isDropdownOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setIsDropdownOpen(true);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev < filteredEmployees.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredEmployees.length - 1));
        } else if (e.key === "Enter") {
            if (isDropdownOpen && filteredEmployees[highlightedIndex]) {
                e.preventDefault();
                handleSelectEmployee(filteredEmployees[highlightedIndex]);
            }
        } else if (e.key === "Escape") {
            setIsDropdownOpen(false);
        }
    };

    const validate = () => {
        const errs = {};
        if (!isEdit && !form.employee_id) {
            errs.employee_id = "Please select an employee";
        } else if (!isEdit && existingActiveStructure) {
            errs.employee_id = `Active salary structure already exists for this employee`;
        }
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
        setServerError(null);
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
        } catch (err) {
            setServerError(err?.message ?? String(err));
        } finally {
            setBusy(false);
        }
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

                            {/* Server error banner (replaces native alert) */}
                            {serverError && (
                                <div className="sm-server-error-banner flex items-start justify-between gap-3 p-3.5">
                                    <div className="flex items-start gap-2.5 min-w-0">
                                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                        <div className="text-[13px] leading-snug">
                                            <p className="font-bold">Unable to save salary structure</p>
                                            <p className="mt-0.5 opacity-90">{serverError}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setServerError(null)}
                                        className="p-1 hover:bg-black/10 rounded-md transition-colors shrink-0"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {/* Employee Field */}
                            {isEdit ? (
                                <div className="flex flex-col gap-1.5">
                                    <label className="sm-field-label">Assigned Employee</label>
                                    <div className="sm-selected-card flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="sm-emp-avatar-gradient w-11 h-11 rounded-xl flex items-center justify-center text-[13.5px] font-bold shrink-0">
                                                {getInitials(structure?.first_name, structure?.last_name)}
                                            </div>
                                            <div className="min-w-0 flex flex-col">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="sm-structure-name text-[14px] font-bold truncate">
                                                        {structure?.first_name} {structure?.last_name}
                                                    </span>
                                                    {structure?.employee_code && (
                                                        <span className="sm-emp-code-badge px-2 py-0.5 rounded-md">
                                                            {structure.employee_code}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5 text-[12px] sm-comp-muted">
                                                    {structure?.designation && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Briefcase size={12} className="opacity-70" />
                                                            <span>{structure.designation}</span>
                                                        </span>
                                                    )}
                                                    {(structure?.phone || structure?.mobile) && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                                                                <Phone size={11} className="opacity-70" />
                                                                <span>{structure.phone || structure.mobile}</span>
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="sm-emp-locked-chip text-[11px] px-2.5 py-1 rounded-full shrink-0">
                                            Assigned
                                        </span>
                                    </div>
                                </div>
                            ) : selectedEmp ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <label className="sm-field-label font-semibold">
                                            Employee <span className="sm-field-required">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForm((p) => ({ ...p, employee_id: "" }));
                                                setServerError(null);
                                                setIsDropdownOpen(true);
                                                setTimeout(() => searchInputRef.current?.focus(), 50);
                                            }}
                                            className="sm-emp-change-btn inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-lg"
                                        >
                                            <Pencil size={12} />
                                            <span>Change</span>
                                        </button>
                                    </div>
                                    <div className={`sm-selected-card flex items-center justify-between p-3 ${
                                        existingActiveStructure ? "sm-selected-card-warn" : ""
                                    }`}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="sm-emp-avatar-gradient w-11 h-11 rounded-xl flex items-center justify-center text-[13.5px] font-bold shrink-0">
                                                {getInitials(selectedEmp.first_name, selectedEmp.last_name)}
                                            </div>
                                            <div className="min-w-0 flex flex-col">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="sm-structure-name text-[14px] font-bold truncate">
                                                        {selectedEmp.first_name} {selectedEmp.last_name}
                                                    </span>
                                                    {selectedEmp.employee_code && (
                                                        <span className="sm-emp-code-badge px-2 py-0.5 rounded-md">
                                                            {selectedEmp.employee_code}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5 text-[12px] sm-comp-muted">
                                                    {selectedEmp.designation && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Briefcase size={12} className="opacity-70" />
                                                            <span>{selectedEmp.designation}</span>
                                                        </span>
                                                    )}
                                                    {selectedEmp.department && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{selectedEmp.department}</span>
                                                        </>
                                                    )}
                                                    {(selectedEmp.phone || selectedEmp.mobile) && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="inline-flex items-center gap-1 font-mono text-[11.5px]">
                                                                <Phone size={11} className="opacity-70" />
                                                                <span>{selectedEmp.phone || selectedEmp.mobile}</span>
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {existingActiveStructure ? (
                                                <span className="sm-emp-warn-chip inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full">
                                                    <AlertTriangle size={12} /> Active Exists
                                                </span>
                                            ) : (
                                                <span className="sm-emp-selected-chip inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full">
                                                    <CheckCircle2 size={12} /> Selected
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                title="Remove selection"
                                                onClick={() => {
                                                    setForm((p) => ({ ...p, employee_id: "" }));
                                                    setServerError(null);
                                                    setIsDropdownOpen(true);
                                                }}
                                                className="sm-emp-clear-btn w-7 h-7 rounded-lg flex items-center justify-center"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Active Structure Warning Banner in Modal */}
                                    {existingActiveStructure && (
                                        <div className="sm-active-warn-banner flex items-start gap-3 p-3.5 mt-0.5">
                                            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                            <div className="flex-1 text-[12.5px] leading-relaxed">
                                                <p className="font-bold text-[13px] text-amber-700 dark:text-amber-300">
                                                    Active Salary Structure Already Exists
                                                </p>
                                                <p className="mt-1">
                                                    <span className="font-semibold text-[var(--text-primary)]">
                                                        {selectedEmp.first_name} {selectedEmp.last_name}
                                                    </span>{" "}
                                                    already has an active salary structure:{" "}
                                                    <span className="font-semibold text-amber-800 dark:text-amber-200">
                                                        &ldquo;{existingActiveStructure.structure_name || "Active Structure"}&rdquo;
                                                    </span>
                                                    {existingActiveStructure.effective_from && (
                                                        <span>
                                                            {" "}(from {new Date(existingActiveStructure.effective_from).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                            {existingActiveStructure.effective_to ? ` to ${new Date(existingActiveStructure.effective_to).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : " · Open-ended"})
                                                        </span>
                                                    )}.
                                                </p>
                                                <p className="mt-1 text-[11.5px] opacity-85">
                                                    An employee cannot have multiple active structures. To assign a new structure, please expire or edit the existing structure first, or choose another employee.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1.5" ref={dropdownRef}>
                                    <div className="flex items-center justify-between">
                                        <label className="sm-field-label font-semibold">
                                            Employee <span className="sm-field-required">*</span>
                                        </label>
                                        <span className="text-[11.5px] sm-comp-muted font-medium">
                                            {empLoading ? "Loading…" : `${filteredEmployees.length} available`}
                                        </span>
                                    </div>

                                    {/* Search Input Box */}
                                    <div className={`sm-emp-search-box relative flex items-center px-3 py-2 ${errors.employee_id ? "has-error" : ""}`}>
                                        <Search size={15} className="sm-search-icon shrink-0 mr-2 opacity-60" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            className="sm-search-input text-[13.5px] w-full"
                                            placeholder="Search name, phone, code, designation…"
                                            value={empSearch}
                                            onChange={(e) => {
                                                setEmpSearch(e.target.value);
                                                if (!isDropdownOpen) setIsDropdownOpen(true);
                                                setHighlightedIndex(0);
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            onKeyDown={handleKeyDown}
                                        />
                                        <div className="flex items-center gap-1 shrink-0 ml-1">
                                            {empSearch && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEmpSearch("");
                                                        searchInputRef.current?.focus();
                                                    }}
                                                    title="Clear search"
                                                    className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--divider)] transition-colors"
                                                >
                                                    <X size={13} />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setIsDropdownOpen((prev) => !prev)}
                                                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                            >
                                                <ChevronDown size={15} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Interactive Dropdown list */}
                                    {isDropdownOpen && (
                                        <div className="sm-emp-dropdown-list mt-1">
                                            <div className="max-h-[200px] overflow-y-auto sm-emp-scroll p-1.5 flex flex-col gap-0.5">
                                                {filteredEmployees.length === 0 ? (
                                                    <div className="py-6 px-4 text-center flex flex-col items-center justify-center gap-2 sm-comp-muted">
                                                        <Users size={22} className="opacity-40" />
                                                        <p className="text-[13px] font-medium">No employees found matching &ldquo;{empSearch}&rdquo;</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setEmpSearch(""); searchInputRef.current?.focus(); }}
                                                            className="text-[12px] text-[var(--btn-bg)] font-semibold hover:underline mt-0.5"
                                                        >
                                                            Reset search filter
                                                        </button>
                                                    </div>
                                                ) : (
                                                    filteredEmployees.map((emp, idx) => {
                                                        const isHighlighted = idx === highlightedIndex;
                                                        const activeStruct = employeeActiveStructureMap.get(String(emp.id));
                                                        return (
                                                            <div
                                                                key={emp.id}
                                                                onClick={() => handleSelectEmployee(emp)}
                                                                onMouseEnter={() => setHighlightedIndex(idx)}
                                                                className={`sm-emp-item-row flex items-center justify-between p-2.5 ${isHighlighted ? "is-active" : ""}`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className="sm-emp-avatar-subtle w-8 h-8 rounded-lg flex items-center justify-center text-[12px] shrink-0">
                                                                        {getInitials(emp.first_name, emp.last_name)}
                                                                    </div>
                                                                    <div className="flex flex-col min-w-0">
                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                            <span className="sm-structure-name text-[13px] font-semibold truncate">
                                                                                {emp.first_name} {emp.last_name}
                                                                            </span>
                                                                            {emp.employee_code && (
                                                                                <span className="sm-emp-code-pill text-[10px] font-mono px-1.5 py-0.2 rounded font-medium">
                                                                                    {emp.employee_code}
                                                                                </span>
                                                                            )}
                                                                            {activeStruct && (
                                                                                <span className="sm-emp-active-tag inline-flex items-center gap-0.5 text-[9.5px] px-1.5 py-0.2 rounded font-medium">
                                                                                    <AlertTriangle size={9} /> Active Exists
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 text-[11px] sm-comp-muted truncate">
                                                                            {emp.designation && <span>{emp.designation}</span>}
                                                                            {emp.department && (
                                                                                <>
                                                                                    <span>•</span>
                                                                                    <span>{emp.department}</span>
                                                                                </>
                                                                            )}
                                                                            {(emp.phone || emp.mobile) && (
                                                                                <>
                                                                                    <span>•</span>
                                                                                    <span className="inline-flex items-center gap-1 font-mono text-[10.5px]">
                                                                                        <Phone size={10} className="opacity-70" />
                                                                                        <span>{emp.phone || emp.mobile}</span>
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <span className="sm-emp-select-pill text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0">
                                                                    Select
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                            {filteredEmployees.length > 0 && (
                                                <div className="px-3 py-1.5 bg-[var(--input-bg)] border-t border-[var(--divider)] flex items-center justify-between text-[11px] sm-comp-muted">
                                                    <span>Click or press Enter to assign</span>
                                                    <span>{filteredEmployees.length} results</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {errors.employee_id && (
                                        <p className="sm-field-error mt-0.5">{errors.employee_id}</p>
                                    )}
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
                            <button
                                type="button"
                                disabled={busy || Boolean(!isEdit && existingActiveStructure)}
                                onClick={handleSubmit}
                                className={`sm-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold active:scale-[0.97] ${
                                    !isEdit && existingActiveStructure ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                            >
                                <CircleCheck size={15} />
                                {busy
                                    ? (isEdit ? "Updating…" : "Saving…")
                                    : (!isEdit && existingActiveStructure
                                        ? "Active Structure Exists"
                                        : (isEdit ? "Update" : "Create Structure"))}
                            </button>
                        </div>
                    </Panel>
                </Overlay>
            )}
        </AnimatePresence>
    );
}
