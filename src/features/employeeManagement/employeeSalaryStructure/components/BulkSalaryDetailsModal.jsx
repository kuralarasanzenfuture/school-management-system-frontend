import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    X, Plus, Trash2, Calculator, CheckCircle2,
    AlertCircle, Sparkles, HelpCircle, Layers, ArrowRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { bulkUpsertEmployeeSalaryStructureDetailsThunk } from "../../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";
import { fetchEmployeeSalaryComponents } from "../../../../redux/employee_salary_component/employeeSalaryComponentSlice.js";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";

const CALC_TYPE_OPTIONS = [
    { value: "fixed", label: "Fixed (₹)" },
    { value: "percentage", label: "Percentage (%)" },
];

const BASED_ON_OPTIONS = [
    { value: "basic", label: "Basic Pay" },
    { value: "gross", label: "Gross Salary" },
];

/**
 * Calculates live preview amounts for a list of component configs.
 * First resolves Basic Pay (fixed), then calculates percentages based on Basic or Gross.
 */
function calculatePreviewAmounts(rows, componentsMap) {
    let basicAmount = 0;
    const resolved = rows.map((row) => {
        const comp = componentsMap.get(String(row.component_id));
        const compType = comp?.component_type || "earning";
        const isBasic = comp?.code?.toLowerCase() === "basic" || comp?.name?.toLowerCase().includes("basic");

        let monthlyAmount = 0;
        if (row.calculation_type === "fixed") {
            monthlyAmount = Number(row.amount) || 0;
            if (isBasic) basicAmount = monthlyAmount;
        }

        return {
            ...row,
            component_name: comp?.name || "Unknown Component",
            component_code: comp?.code || "",
            component_type: compType,
            isBasic,
            monthlyAmount,
        };
    });

    // Pass 1: resolve earnings based on basic
    let totalGross = basicAmount;
    resolved.forEach((r) => {
        if (r.component_type === "earning" && !r.isBasic) {
            if (r.calculation_type === "percentage" && r.based_on === "basic") {
                const pct = Number(r.percentage) || 0;
                r.monthlyAmount = Math.round((basicAmount * pct) / 100);
            }
            if (r.calculation_type === "fixed") {
                // already set
            }
            totalGross += r.monthlyAmount;
        }
    });

    // Pass 2: resolve earnings based on gross & all deductions
    let totalDeductions = 0;
    resolved.forEach((r) => {
        if (r.component_type === "earning" && r.calculation_type === "percentage" && r.based_on === "gross") {
            const pct = Number(r.percentage) || 0;
            r.monthlyAmount = Math.round((totalGross * pct) / 100);
            totalGross += r.monthlyAmount;
        }
    });

    resolved.forEach((r) => {
        if (r.component_type === "deduction") {
            if (r.calculation_type === "fixed") {
                r.monthlyAmount = Number(r.amount) || 0;
            } else if (r.calculation_type === "percentage") {
                const pct = Number(r.percentage) || 0;
                const base = r.based_on === "gross" ? totalGross : basicAmount;
                r.monthlyAmount = Math.round((base * pct) / 100);
            }
            totalDeductions += r.monthlyAmount;
        }
    });

    const netSalary = Math.max(0, totalGross - totalDeductions);

    return {
        resolved,
        totalGross,
        totalDeductions,
        netSalary,
        basicAmount,
    };
}

export default function BulkSalaryDetailsModal({
    isOpen,
    onClose,
    structure,
    existingDetails = [],
    onSuccess,
}) {
    const dispatch = useDispatch();

    const { employeeSalaryComponents: rawComponents } = useSelector(
        (state) => state.employeeSalaryComponents || {},
    );

    const [rows, setRows] = useState([]);
    const [serverError, setServerError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Load components on open
    useEffect(() => {
        if (isOpen && structure?.school_id) {
            dispatch(fetchEmployeeSalaryComponents({ school_id: structure.school_id, all: true }));
        }
    }, [dispatch, isOpen, structure?.school_id]);

    const componentList = useMemo(() => {
        const raw = Array.isArray(rawComponents)
            ? rawComponents
            : rawComponents?.data || rawComponents?.components || [];
        return raw.filter((c) => c.status === "active");
    }, [rawComponents]);

    const componentsMap = useMemo(() => {
        const map = new Map();
        componentList.forEach((c) => map.set(String(c.id), c));
        return map;
    }, [componentList]);

    const componentOptions = useMemo(() => {
        return componentList.map((comp) => ({
            value: String(comp.id),
            label: comp.name,
            code: comp.code || null,
            sublabel: comp.component_type === "earning" ? "Earning Allowance" : "Payroll Deduction",
            badge: comp.component_type === "earning" ? "Earning" : "Deduction",
            badgeVariant: comp.component_type === "earning" ? "success" : "danger",
            searchText: `${comp.name} ${comp.code || ""} ${comp.component_type || ""}`.toLowerCase(),
        }));
    }, [componentList]);

    // Populate existing details when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setServerError(null);

        if (Array.isArray(existingDetails) && existingDetails.length > 0) {
            setRows(
                existingDetails.map((d) => ({
                    component_id: String(d.component_id),
                    calculation_type: d.calculation_type || "fixed",
                    amount: d.calculation_type === "fixed" ? (d.amount != null ? String(d.amount) : "") : "",
                    percentage: d.calculation_type === "percentage" ? (d.percentage != null ? String(d.percentage) : "") : "",
                    based_on: d.based_on || "basic",
                })),
            );
        } else {
            // Suggest default Basic Pay if available
            const basic = componentList.find((c) => c.code?.toLowerCase() === "basic" || c.name?.toLowerCase().includes("basic"));
            if (basic) {
                setRows([
                    {
                        component_id: String(basic.id),
                        calculation_type: "fixed",
                        amount: "",
                        percentage: "",
                        based_on: "basic",
                    },
                ]);
            } else {
                setRows([]);
            }
        }
    }, [isOpen, existingDetails, componentList]);

    const { resolved, totalGross, totalDeductions, netSalary, basicAmount } = useMemo(() => {
        return calculatePreviewAmounts(rows, componentsMap);
    }, [rows, componentsMap]);

    // Available components not yet selected
    const selectedCompIds = new Set(rows.map((r) => String(r.component_id)));

    const addRow = (componentId = "") => {
        let defaultType = "fixed";
        let defaultBasedOn = "basic";
        if (componentId) {
            const comp = componentsMap.get(String(componentId));
            if (comp?.calculation_type) defaultType = comp.calculation_type;
        }
        setRows((prev) => [
            ...prev,
            {
                component_id: componentId ? String(componentId) : "",
                calculation_type: defaultType,
                amount: "",
                percentage: "",
                based_on: defaultBasedOn,
            },
        ]);
    };

    const removeRow = (index) => {
        setRows((prev) => prev.filter((_, i) => i !== index));
    };

    const updateRow = (index, field, value) => {
        setRows((prev) => {
            const copy = [...prev];
            const updated = { ...copy[index], [field]: value };

            if (field === "component_id") {
                const comp = componentsMap.get(String(value));
                if (comp?.calculation_type) {
                    updated.calculation_type = comp.calculation_type;
                    if (comp.calculation_type === "fixed") {
                        updated.percentage = "";
                    } else {
                        updated.amount = "";
                    }
                }
            } else if (field === "calculation_type") {
                if (value === "fixed") {
                    updated.percentage = "";
                } else {
                    updated.amount = "";
                    if (!updated.based_on) updated.based_on = "basic";
                }
            }

            copy[index] = updated;
            return copy;
        });
    };

    // Quick add all missing standard components
    const handleAddAllMissing = () => {
        const toAdd = componentList.filter((c) => !selectedCompIds.has(String(c.id)));
        if (!toAdd.length) return;

        const newRows = toAdd.map((c) => ({
            component_id: String(c.id),
            calculation_type: c.calculation_type || "fixed",
            amount: "",
            percentage: "",
            based_on: "basic",
        }));

        setRows((prev) => [...prev, ...newRows]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError(null);

        if (!rows.length) {
            setServerError("Please add at least one salary component.");
            return;
        }

        // Validate rows
        const seen = new Set();
        const payloadComponents = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row.component_id) {
                setServerError(`Row #${i + 1}: Please select a component.`);
                return;
            }
            if (seen.has(String(row.component_id))) {
                const comp = componentsMap.get(String(row.component_id));
                setServerError(`Duplicate component: '${comp?.name || row.component_id}' is selected more than once.`);
                return;
            }
            seen.add(String(row.component_id));

            if (row.calculation_type === "fixed") {
                const num = Number(row.amount);
                if (isNaN(num) || num <= 0) {
                    setServerError(`Row #${i + 1}: Amount must be a positive number.`);
                    return;
                }
                payloadComponents.push({
                    component_id: Number(row.component_id),
                    calculation_type: "fixed",
                    amount: num,
                    percentage: null,
                    based_on: "basic",
                });
            } else if (row.calculation_type === "percentage") {
                const pct = Number(row.percentage);
                if (isNaN(pct) || pct <= 0 || pct > 100) {
                    setServerError(`Row #${i + 1}: Percentage must be between 0.1 and 100.`);
                    return;
                }
                payloadComponents.push({
                    component_id: Number(row.component_id),
                    calculation_type: "percentage",
                    amount: null,
                    percentage: pct,
                    based_on: row.based_on || "basic",
                });
            }
        }

        // Check if Basic Pay is included and fixed
        const hasBasic = payloadComponents.some((p) => {
            const comp = componentsMap.get(String(p.component_id));
            return (comp?.code?.toLowerCase() === "basic" || comp?.name?.toLowerCase().includes("basic")) && p.calculation_type === "fixed";
        });

        if (!hasBasic) {
            const confirmWithoutBasic = window.confirm(
                "Notice: 'Basic Pay' (fixed amount) is recommended for accurate percentage calculations. Continue anyway?"
            );
            if (!confirmWithoutBasic) return;
        }

        setSubmitting(true);
        try {
            const payload = {
                salary_structure_id: Number(structure.id),
                components: payloadComponents,
            };

            await dispatch(bulkUpsertEmployeeSalaryStructureDetailsThunk(payload)).unwrap();
            onSuccess?.();
            onClose();
        } catch (err) {
            setServerError(err || "Failed to update salary components. Please check input values.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ duration: 0.18 }}
                    className="ss-modal w-full max-w-5xl xl:max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-[var(--divider)] flex items-center justify-between shrink-0 bg-[var(--panel-bg)]">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                    <Layers size={17} />
                                </span>
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                                        Bulk Manage Salary Components
                                    </h2>
                                    <p className="text-[12px] text-[var(--text-muted)]">
                                        Configure earnings and deductions for <span className="font-semibold text-[var(--text-primary)]">{structure?.structure_name}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="ss-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Live Metric Ribbon */}
                    <div className="px-6 py-3 bg-[var(--input-bg)] border-b border-[var(--divider)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shrink-0">
                        <div className="px-3 py-1.5 rounded-xl bg-[var(--panel-bg)] border border-[var(--divider)]">
                            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block">
                                Basic Pay
                            </span>
                            <span className="text-[15px] font-bold text-[var(--text-primary)]">
                                ₹{basicAmount.toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-[var(--panel-bg)] border border-[var(--divider)]">
                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                                Gross Earnings
                            </span>
                            <span className="text-[15px] font-bold text-emerald-600 dark:text-emerald-400">
                                ₹{totalGross.toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-[var(--panel-bg)] border border-[var(--divider)]">
                            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                                Total Deductions
                            </span>
                            <span className="text-[15px] font-bold text-rose-600 dark:text-rose-400">
                                ₹{totalDeductions.toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-[var(--panel-bg)] border border-indigo-500/20 shadow-sm">
                            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                                Net Monthly
                            </span>
                            <span className="text-[15px] font-extrabold text-indigo-600 dark:text-indigo-400">
                                ₹{netSalary.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>

                    {/* Form & Table */}
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 pb-48">
                            {serverError && (
                                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-[12.5px] flex items-start gap-2.5">
                                    <AlertCircle size={17} className="text-rose-600 shrink-0 mt-0.5" />
                                    <div className="flex-1">{serverError}</div>
                                </div>
                            )}

                            {/* Toolbar */}
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="text-[13px] font-semibold text-[var(--text-primary)]">
                                    Configured Components ({rows.length})
                                </div>

                                <div className="flex items-center gap-2">
                                    {componentList.length > rows.length && (
                                        <button
                                            type="button"
                                            onClick={handleAddAllMissing}
                                            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
                                        >
                                            <Sparkles size={13} />
                                            Add All Remaining ({componentList.length - rows.length})
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => addRow()}
                                        className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold text-white bg-[var(--btn-bg)] hover:bg-[var(--btn-hover)] transition-colors inline-flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Plus size={14} /> Add Row
                                    </button>
                                </div>
                            </div>

                            {/* Components List / Table */}
                            {rows.length === 0 ? (
                                <div className="p-10 border border-dashed border-[var(--divider)] rounded-2xl text-center">
                                    <Calculator size={28} className="mx-auto text-[var(--text-muted)] mb-2 opacity-60" />
                                    <p className="text-[13.5px] text-[var(--text-secondary)] font-medium">
                                        No components configured yet
                                    </p>
                                    <p className="text-[12px] text-[var(--text-muted)] mt-1 mb-4">
                                        Click below to start configuring salary components for this structure.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => addRow()}
                                        className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[var(--btn-bg)] hover:bg-[var(--btn-hover)] inline-flex items-center gap-1.5 transition-colors shadow-sm"
                                    >
                                        <Plus size={15} /> Add First Component
                                    </button>
                                </div>
                            ) : (
                                <div className="border border-[var(--divider)] rounded-2xl overflow-visible">
                                    <div className="overflow-visible min-w-full">
                                        <table className="w-full text-left text-[13px]">
                                            <thead>
                                                <tr className="bg-[var(--input-bg)] border-b border-[var(--divider)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                                    <th className="px-4 py-3 min-w-[280px]">Component</th>
                                                    <th className="px-3 py-3 w-28 text-center">Type</th>
                                                    <th className="px-3 py-3 w-44 min-w-[155px]">Calc Type</th>
                                                    <th className="px-3 py-3 min-w-[260px]">Value Configuration</th>
                                                    <th className="px-3 py-3 w-32 text-right">Monthly Est.</th>
                                                    <th className="px-3 py-3 text-center w-12">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--divider)]">
                                                {rows.map((row, idx) => {
                                                    const res = resolved[idx] || {};
                                                    const isEarning = res.component_type !== "deduction";
                                                    const rowZIndex = rows.length - idx + 20;

                                                    return (
                                                        <tr
                                                            key={idx}
                                                            style={{ zIndex: rowZIndex }}
                                                            className="relative hover:bg-[var(--input-bg)]/40 transition-colors"
                                                        >
                                                            {/* Component selector */}
                                                            <td className="px-4 py-3 min-w-[280px] relative">
                                                                <CustomDropdown
                                                                    options={componentOptions.map((opt) => ({
                                                                        ...opt,
                                                                        disabled: selectedCompIds.has(opt.value) && opt.value !== String(row.component_id),
                                                                    }))}
                                                                    value={row.component_id}
                                                                    onChange={(val) => updateRow(idx, "component_id", val)}
                                                                    placeholder="Select Component…"
                                                                    searchable={componentList.length > 5}
                                                                    searchPlaceholder="Search component…"
                                                                    className="w-full"
                                                                />
                                                            </td>

                                                            {/* Component type badge */}
                                                            <td className="px-3 py-3 w-28 text-center">
                                                                <span
                                                                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                                        isEarning
                                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                                    }`}
                                                                >
                                                                    {isEarning ? "Earning" : "Deduction"}
                                                                </span>
                                                            </td>

                                                            {/* Calculation type toggle */}
                                                            <td className="px-3 py-3 w-44 min-w-[155px] relative">
                                                                <CustomDropdown
                                                                    options={CALC_TYPE_OPTIONS}
                                                                    value={row.calculation_type}
                                                                    onChange={(val) => updateRow(idx, "calculation_type", val)}
                                                                    className="w-full"
                                                                />
                                                            </td>

                                                            {/* Value configuration */}
                                                            <td className="px-3 py-3 min-w-[260px] relative">
                                                                {row.calculation_type === "fixed" ? (
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold text-[13px]">
                                                                            ₹
                                                                        </span>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            step="1"
                                                                            placeholder="Enter amount (e.g. 15000)"
                                                                            value={row.amount}
                                                                            onChange={(e) => updateRow(idx, "amount", e.target.value)}
                                                                            className="w-full pl-7 pr-3 py-2 rounded-xl text-[13px] bg-[var(--panel-bg)] border border-[var(--input-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--btn-bg)] font-medium"
                                                                            required
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="relative w-24 shrink-0">
                                                                            <input
                                                                                type="number"
                                                                                min="0.1"
                                                                                max="100"
                                                                                step="0.1"
                                                                                placeholder="10"
                                                                                value={row.percentage}
                                                                                onChange={(e) => updateRow(idx, "percentage", e.target.value)}
                                                                                className="w-full pr-6 pl-2.5 py-2 rounded-xl text-[13px] bg-[var(--panel-bg)] border border-[var(--input-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--btn-bg)] font-medium"
                                                                                required
                                                                            />
                                                                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold text-[12px]">
                                                                                %
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-[12px] text-[var(--text-muted)] shrink-0 font-medium">of</span>
                                                                        <CustomDropdown
                                                                            options={BASED_ON_OPTIONS}
                                                                            value={row.based_on}
                                                                            onChange={(val) => updateRow(idx, "based_on", val)}
                                                                            className="flex-1 min-w-[130px]"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </td>

                                                            {/* Estimated monthly amount */}
                                                            <td className="px-3 py-3 w-32 text-right font-bold text-[var(--text-primary)]">
                                                                <span className={isEarning ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                                                    {isEarning ? "+" : "-"} ₹{(res.monthlyAmount || 0).toLocaleString("en-IN")}
                                                                </span>
                                                            </td>

                                                            {/* Delete button */}
                                                            <td className="px-3 py-3 text-center w-12">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeRow(idx)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors mx-auto"
                                                                    title="Remove row"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-[var(--divider)] flex items-center justify-between shrink-0 bg-[var(--panel-bg)]">
                            <button
                                type="button"
                                onClick={onClose}
                                className="ss-btn-outline px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={submitting || rows.length === 0}
                                className="ss-btn-primary px-5 py-2.5 rounded-xl text-[13.5px] font-semibold inline-flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-98"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving Components…
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={16} /> Save All Components
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
