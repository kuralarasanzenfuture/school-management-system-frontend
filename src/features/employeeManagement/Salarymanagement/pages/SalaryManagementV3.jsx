/**
 * VERSION 3 — Payslip-Style UI
 *
 * Layout:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  Left: Structure list (searchable cards)                │
 *  │  Right: Payslip-style breakdown when structure selected │
 *  │    ┌── Employee header card ─────────────────────────┐  │
 *  │    │  Name · Designation · School · Period           │  │
 *  │    └────────────────────────────────────────────────-┘  │
 *  │    ┌── Earnings ──────┐ ┌── Deductions ───────────────┐ │
 *  │    │  + Add           │ │  + Add                      │ │
 *  │    │  Row rows rows   │ │  Row rows rows               │ │
 *  │    │  Subtotal        │ │  Subtotal                   │ │
 *  │    └──────────────────┘ └─────────────────────────────┘ │
 *  │    ┌── Net Salary summary ──────────────────────────────┐│
 *  │    │  Gross  −  Deductions  =  Net                     ││
 *  │    └───────────────────────────────────────────────────┘│
 *  └─────────────────────────────────────────────────────────┘
 */
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { fetchEmployeeSalaryStructures } from "../../../../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
import { fetchEmployeeSalaryStructureDetails } from "../../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import {
    SalaryStructureFormModal,
    SalaryDetailFormModal,
    SalaryDeleteModal,
} from "../components/SalaryManagementModals.jsx";
import "../styles/SalaryManagement.css";
import {
    Plus, Search, Pencil, Trash2, IndianRupee, Percent,
    LayoutList, TrendingUp, TrendingDown, CalendarDays,
    CalendarCheck2, ChevronRight, Users, CheckCircle,
    Building2, BadgeIndianRupee, Minus,
} from "lucide-react";

/* ── helpers ── */
function fmt(v) {
    if (!v) return null;
    return new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function initials(f, l) { return `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase() || "?"; }
function isActive(s) {
    if (s.status !== "active") return false;
    const today = new Date(), from = new Date(s.effective_from);
    if (today < from) return false;
    if (!s.effective_to) return true;
    return today <= new Date(s.effective_to);
}
function fmtMoney(n) {
    return Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

/* ── Stat card ── */
function StatCard({ icon: Icon, bg, color, value, label }) {
    return (
        <div className="sm-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
            <div className={`${bg} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className={color} />
            </div>
            <div>
                <p className="sm-stat-value text-xl font-bold leading-none">{value}</p>
                <p className="sm-stat-label text-[12.5px] mt-1">{label}</p>
            </div>
        </div>
    );
}

/* ── Component row inside a section ── */
function CompRow({ d, onEdit, onDelete, tone }) {
    const isPercent = d.calculation_type === "percentage";
    return (
        <motion.tr
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="sm-comp-row"
        >
            <td className="px-4 py-3">
                <p className="sm-comp-name text-[13.5px] font-semibold">{d.component_name}</p>
            </td>
            <td className="px-3 py-3">
                {isPercent ? (
                    <div className="flex flex-col gap-0.5">
                        <span className="sm-calc-chip sm-calc-percentage inline-flex items-center gap-1">
                            <Percent size={10} />{Number(d.percentage ?? 0).toFixed(2)}%
                        </span>
                        <span className="sm-based-on">of {d.based_on}</span>
                    </div>
                ) : (
                    <span className="sm-calc-chip sm-calc-fixed inline-flex items-center gap-1">
                        <IndianRupee size={10} />{fmtMoney(d.amount)}
                    </span>
                )}
            </td>
            <td className="px-3 py-3 text-right">
                <span className={`sm-amount text-[14px] ${tone === "earning" ? "sm-amount-earning" : "sm-amount-deduction"}`}>
                    {isPercent ? "—" : `₹${fmtMoney(d.amount)}`}
                </span>
            </td>
            <td className="px-3 py-3">
                <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(d)}
                        className="sm-action-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors">
                        <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(d)}
                        className="sm-action-btn sm-action-btn-danger w-7 h-7 rounded-lg flex items-center justify-center transition-colors">
                        <Trash2 size={13} />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
}

/* ── Section (Earnings or Deductions) ── */
function ComponentSection({ title, tone, rows, onAdd, onEdit, onDelete }) {
    const subtotal = rows.filter(r => r.calculation_type === "fixed")
        .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);

    const headerStyle = tone === "earning"
        ? { background: "var(--success-bg)", color: "var(--success)" }
        : { background: "var(--danger-bg)", color: "var(--danger)" };

    const btnStyle = tone === "earning"
        ? "sm-icon-earning-bg sm-icon-earning"
        : "sm-icon-deduction-bg sm-icon-deduction";

    return (
        <div className="sm-right-panel rounded-2xl overflow-hidden flex flex-col">

            {/* Section header */}
            <div className="flex items-center justify-between px-4 py-3" style={headerStyle}>
                <div className="flex items-center gap-2">
                    {tone === "earning"
                        ? <TrendingUp size={16} />
                        : <TrendingDown size={16} />}
                    <span className="text-[14px] font-bold">{title}</span>
                    <span className="text-[12px] font-medium opacity-75">({rows.length})</span>
                </div>
                <button
                    onClick={onAdd}
                    className={`${btnStyle} inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors`}
                    style={{ background: "rgba(255,255,255,0.25)" }}
                >
                    <Plus size={12} /> Add
                </button>
            </div>

            {/* Column headers */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[11px] uppercase tracking-wide sm-comp-muted"
                            style={{ background: "var(--input-bg)", borderBottom: "1px solid var(--divider)" }}>
                            <th className="px-4 py-2 font-semibold">Component</th>
                            <th className="px-3 py-2 font-semibold">Calc</th>
                            <th className="px-3 py-2 font-semibold text-right">Amount</th>
                            <th className="px-3 py-2 font-semibold w-16" />
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence initial={false}>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-5 text-center sm-comp-muted text-[13px]">
                                        No {title.toLowerCase()} added yet
                                    </td>
                                </tr>
                            ) : (
                                rows.map((r) => (
                                    <CompRow key={r.id} d={r} tone={tone} onEdit={onEdit} onDelete={onDelete} />
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>

                    {/* Subtotal footer */}
                    {rows.length > 0 && (
                        <tfoot>
                            <tr style={{ borderTop: "2px solid var(--divider)", background: "var(--input-bg)" }}>
                                <td colSpan={2} className="px-4 py-2.5 text-[12px] font-bold sm-comp-secondary">
                                    Subtotal (Fixed)
                                </td>
                                <td className={`px-3 py-2.5 text-right text-[14px] font-bold ${tone === "earning" ? "sm-amount-earning" : "sm-amount-deduction"}`}>
                                    ₹{fmtMoney(subtotal)}
                                </td>
                                <td />
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}

/* ══ Main page ════════════════════════════════════════════════ */
export default function SalaryManagementV3() {
    const dispatch = useDispatch();

    const { employeeSalaryStructures: structures, loading: sLoading } =
        useSelector((state) => state.employeeSalaryStructure);
    const { employeeSalaryStructureDetails: allDetails, loading: dLoading } =
        useSelector((state) => state.employeeSalaryStructureDetails);
    const { user } = useSelector((state) => state.auth);
    const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const schoolId = isAdmin ? null : user?.school_id;

    /* ── UI state ── */
    const [selectedId, setSelectedId] = useState(null);
    const [structureSearch, setStructureSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedSchool, setSelectedSchool] = useState("");

    /* ── Modal state ── */
    const [showStructureModal, setShowStructureModal] = useState(false);
    const [editStructure, setEditStructure] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editDetail, setEditDetail] = useState(null);
    const [detailTone, setDetailTone] = useState("earning");
    const [deleteTarget, setDeleteTarget] = useState(null);

    /* ── Fetch ── */
    useEffect(() => {
        dispatch(fetchEmployeeSalaryStructures());
        dispatch(fetchEmployeeSalaryStructureDetails());
    }, [dispatch]);
    useEffect(() => {
        if (isAdmin && !schools.length) dispatch(fetchSchools());
    }, [dispatch, isAdmin, schools.length]);

    /* ── Filtered structures ── */
    const filteredStructures = useMemo(() => {
        let result = structures ?? [];
        result = result.filter((s) =>
            isAdmin
                ? selectedSchool ? String(s.school_id) === String(selectedSchool) : true
                : String(s.school_id) === String(schoolId),
        );
        if (statusFilter !== "All") result = result.filter((s) => s.status === statusFilter);
        const q = structureSearch.trim().toLowerCase();
        if (q) result = result.filter((s) =>
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
            s.structure_name.toLowerCase().includes(q),
        );
        return result;
    }, [structures, isAdmin, schoolId, selectedSchool, statusFilter, structureSearch]);

    /* ── Selected structure + its details ── */
    const selectedStructure = useMemo(
        () => filteredStructures.find((s) => s.id === selectedId) ?? null,
        [filteredStructures, selectedId],
    );
    const selectedDetails = useMemo(
        () => (allDetails ?? []).filter((d) => d.salary_structure_id === selectedId),
        [allDetails, selectedId],
    );

    const earnings = selectedDetails.filter((d) => d.component_type === "earning");
    const deductions = selectedDetails.filter((d) => d.component_type === "deduction");
    const benefits = selectedDetails.filter((d) => d.component_type === "benefit");

    const grossEarnings = earnings.filter(d => d.calculation_type === "fixed").reduce((s, d) => s + Number(d.amount ?? 0), 0);
    const totalDeductions = deductions.filter(d => d.calculation_type === "fixed").reduce((s, d) => s + Number(d.amount ?? 0), 0);
    const netSalary = grossEarnings - totalDeductions;

    /* ── Stats ── */
    const scoped = useMemo(() => (structures ?? []).filter((s) => isAdmin ? (selectedSchool ? String(s.school_id) === String(selectedSchool) : true) : String(s.school_id) === String(schoolId)), [structures, isAdmin, schoolId, selectedSchool]);
    const totalCount = scoped.length;
    const activeCount = scoped.filter((s) => isActive(s)).length;
    const empCount = new Set(scoped.map((s) => s.employee_id)).size;
    const compCount = (allDetails ?? []).length;

    /* ── Modal handlers ── */
    const openAddStructure = () => { setEditStructure(null); setShowStructureModal(true); };
    const openEditStructure = (s) => { setEditStructure(s); setShowStructureModal(true); };
    const closeStructureModal = () => { setShowStructureModal(false); setEditStructure(null); };

    const openAddDetail = (tone) => {
        setDetailTone(tone);
        setEditDetail(null);
        setShowDetailModal(true);
    };
    const openEditDetail = (d) => { setDetailTone(d.component_type); setEditDetail(d); setShowDetailModal(true); };
    const closeDetailModal = () => { setShowDetailModal(false); setEditDetail(null); };

    return (
        <div className="sm-page min-h-screen p-5 sm:p-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h1 className="sm-title text-2xl font-bold">Salary Management</h1>
                    <p className="sm-subtitle text-[13.5px] mt-1">
                        Select a structure to view its payslip-style salary breakdown.
                    </p>
                </div>
                <button onClick={openAddStructure}
                    className="sm-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors active:scale-[0.97] shadow-sm">
                    <Plus size={16} /> New Structure
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <StatCard icon={LayoutList} bg="sm-icon-total-bg" color="sm-icon-total" value={totalCount} label="Total structures" />
                <StatCard icon={CheckCircle} bg="sm-icon-active-bg" color="sm-icon-active" value={activeCount} label="Active" />
                <StatCard icon={Users} bg="sm-icon-deduction-bg" color="sm-icon-deduction" value={empCount} label="Employees" />
                <StatCard icon={BadgeIndianRupee} bg="sm-icon-earning-bg" color="sm-icon-earning" value={compCount} label="Components" />
            </div>

            {/* ── Filters ── */}
            <div className="sm-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
                <div className="sm-search-wrap flex items-center gap-2 flex-1 min-w-[160px] rounded-lg px-3 py-2.5">
                    <Search size={14} className="sm-search-icon shrink-0" />
                    <input className="sm-search-input text-[13.5px]"
                        placeholder="Search employee or structure…"
                        value={structureSearch} onChange={(e) => setStructureSearch(e.target.value)} />
                </div>
                {isAdmin && (
                    <select value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        disabled={schoolsLoading}
                        className="sm-select rounded-lg px-3.5 py-2.5 text-[13.5px] min-w-[180px]">
                        <option value="">All Schools</option>
                        {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                )}
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="sm-select rounded-lg px-3.5 py-2.5 text-[13.5px]">
                    <option value="All">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <span className="sm-count-text text-[12.5px] ml-auto">
                    {filteredStructures.length} structure{filteredStructures.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* ── Split: structure list + payslip ── */}
            <div className="sm-split">

                {/* ── LEFT: Structure list ── */}
                <div className="sm-left-panel">
                    <div className="sm-left-header px-4 py-3 flex items-center justify-between">
                        <span className="sm-left-title text-[13.5px] font-bold">Structures</span>
                        <span className="sm-count-text text-[12px]">{filteredStructures.length}</span>
                    </div>
                    <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                        {sLoading ? (
                            <p className="sm-comp-muted text-[13px] px-4 py-8 text-center">Loading…</p>
                        ) : filteredStructures.length === 0 ? (
                            <p className="sm-comp-muted text-[13px] px-4 py-8 text-center">No structures found.</p>
                        ) : (
                            filteredStructures.map((s) => {
                                const active = isActive(s);
                                const selected = s.id === selectedId;
                                const detCount = (allDetails ?? []).filter((d) => d.salary_structure_id === s.id).length;
                                return (
                                    <div key={s.id}
                                        onClick={() => setSelectedId(selected ? null : s.id)}
                                        className={`sm-structure-item px-4 py-3.5 flex items-center gap-3 ${selected ? "sm-structure-item-selected" : ""}`}
                                    >
                                        {/* Avatar */}
                                        <div className="sm-structure-avatar w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0">
                                            {initials(s.first_name, s.last_name)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${active ? "sm-dot-active" : "sm-dot-inactive"}`} />
                                                <p className="sm-structure-name text-[13px] font-semibold truncate">
                                                    {s.first_name} {s.last_name}
                                                </p>
                                            </div>
                                            <p className="sm-structure-meta text-[11.5px] truncate">{s.structure_name}</p>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span className="sm-structure-meta text-[11px] flex items-center gap-0.5">
                                                    <CalendarDays size={10} /> {fmt(s.effective_from)}
                                                </span>
                                                <span className={`text-[11px] font-semibold ${detCount > 0 ? "sm-icon-earning" : "sm-comp-muted"}`}>
                                                    {detCount} component{detCount !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        </div>

                                        <ChevronRight size={14}
                                            className={`sm-comp-muted shrink-0 transition-transform duration-200 ${selected ? "rotate-90 sm-icon-active" : ""}`} />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Payslip view ── */}
                <div className="flex flex-col gap-4">

                    {!selectedStructure ? (
                        <div className="sm-right-panel rounded-2xl">
                            <div className="sm-empty-placeholder flex flex-col items-center justify-center gap-3 m-6 py-20 text-center">
                                <BadgeIndianRupee size={40} className="sm-comp-muted opacity-30" />
                                <p className="sm-comp-muted text-[15px] font-semibold">No structure selected</p>
                                <p className="sm-comp-muted text-[13px]">
                                    Choose a salary structure from the list to see the full payslip breakdown.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ── Employee header card ── */}
                            <div className="sm-right-panel rounded-2xl px-5 py-4">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    {/* Left: employee info */}
                                    <div className="flex items-center gap-4">
                                        <div className="sm-structure-avatar w-14 h-14 rounded-2xl flex items-center justify-center text-[18px] font-bold shrink-0">
                                            {initials(selectedStructure.first_name, selectedStructure.last_name)}
                                        </div>
                                        <div>
                                            <p className="sm-right-title text-[17px] font-bold">
                                                {selectedStructure.first_name} {selectedStructure.last_name}
                                            </p>
                                            {selectedStructure.designation && (
                                                <p className="sm-structure-emp text-[13px] mt-0.5">{selectedStructure.designation}</p>
                                            )}
                                            {isAdmin && selectedStructure.school_name && (
                                                <p className="sm-structure-meta text-[12px] flex items-center gap-1 mt-0.5">
                                                    <Building2 size={11} /> {selectedStructure.school_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: structure meta + actions */}
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-full ${isActive(selectedStructure) ? "sm-icon-active-bg sm-icon-active" : "sm-icon-deduction-bg sm-icon-deduction"}`}>
                                                {isActive(selectedStructure) ? "Active" : selectedStructure.status}
                                            </span>
                                            <button onClick={() => openEditStructure(selectedStructure)}
                                                className="sm-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors" title="Edit structure">
                                                <Pencil size={15} />
                                            </button>
                                            <button onClick={() => setDeleteTarget({ type: "structure", item: selectedStructure })}
                                                className="sm-action-btn sm-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors" title="Delete structure">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap justify-end">
                                            <span className="sm-structure-meta text-[12px] flex items-center gap-1">
                                                <CalendarDays size={12} /> From {fmt(selectedStructure.effective_from)}
                                            </span>
                                            {selectedStructure.effective_to ? (
                                                <span className="sm-structure-meta text-[12px] flex items-center gap-1">
                                                    <CalendarCheck2 size={12} /> To {fmt(selectedStructure.effective_to)}
                                                </span>
                                            ) : (
                                                <span className="sm-date-open text-[12px] flex items-center gap-1">
                                                    <CalendarCheck2 size={12} /> Open-ended
                                                </span>
                                            )}
                                        </div>
                                        <p className="sm-structure-meta text-[12px] italic">{selectedStructure.structure_name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Earnings + Deductions side by side ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <ComponentSection
                                    title="Earnings"
                                    tone="earning"
                                    rows={earnings}
                                    onAdd={() => openAddDetail("earning")}
                                    onEdit={openEditDetail}
                                    onDelete={(d) => setDeleteTarget({ type: "detail", item: d })}
                                />
                                <ComponentSection
                                    title="Deductions"
                                    tone="deduction"
                                    rows={deductions}
                                    onAdd={() => openAddDetail("deduction")}
                                    onEdit={openEditDetail}
                                    onDelete={(d) => setDeleteTarget({ type: "detail", item: d })}
                                />
                            </div>

                            {/* ── Benefits (if any) ── */}
                            {benefits.length > 0 && (
                                <ComponentSection
                                    title="Benefits"
                                    tone="earning"
                                    rows={benefits}
                                    onAdd={() => openAddDetail("benefit")}
                                    onEdit={openEditDetail}
                                    onDelete={(d) => setDeleteTarget({ type: "detail", item: d })}
                                />
                            )}

                            {/* ── Net Salary summary card ── */}
                            <div className="sm-right-panel rounded-2xl px-5 py-4">
                                <p className="sm-comp-secondary text-[12px] font-bold uppercase tracking-wider mb-3">
                                    Salary Summary
                                </p>
                                <div className="flex items-center justify-between flex-wrap gap-4">

                                    {/* Gross earnings */}
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="sm-comp-muted text-[12px]">Gross Earnings</p>
                                        <p className="sm-amount-earning text-[22px] font-extrabold">
                                            ₹{fmtMoney(grossEarnings)}
                                        </p>
                                    </div>

                                    <Minus size={20} className="sm-comp-muted" />

                                    {/* Deductions */}
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="sm-comp-muted text-[12px]">Total Deductions</p>
                                        <p className="sm-amount-deduction text-[22px] font-extrabold">
                                            ₹{fmtMoney(totalDeductions)}
                                        </p>
                                    </div>

                                    {/* Equals sign */}
                                    <div className="sm-comp-muted text-[24px] font-light">=</div>

                                    {/* Net salary */}
                                    <div className="flex flex-col items-center gap-1 rounded-xl px-6 py-3" style={{ background: netSalary >= 0 ? "var(--success-bg)" : "var(--danger-bg)" }}>
                                        <p className="text-[12px] font-semibold" style={{ color: netSalary >= 0 ? "var(--success)" : "var(--danger)" }}>
                                            Net Salary
                                        </p>
                                        <p className="text-[26px] font-extrabold" style={{ color: netSalary >= 0 ? "var(--success)" : "var(--danger)" }}>
                                            ₹{fmtMoney(netSalary)}
                                        </p>
                                        <p className="text-[11px] font-medium sm-comp-muted">
                                            {selectedDetails.length} component{selectedDetails.length !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>

                                {/* Percentage-based components note */}
                                {selectedDetails.some(d => d.calculation_type === "percentage") && (
                                    <p className="sm-structure-meta text-[11.5px] mt-3 pt-3 flex items-center gap-1" style={{ borderTop: "1px solid var(--divider)" }}>
                                        <Percent size={11} /> Some components are percentage-based — amounts shown as "—" until applied to actual salary.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Modals ── */}
            <SalaryStructureFormModal
                isOpen={showStructureModal}
                onClose={closeStructureModal}
                structure={editStructure}
            />
            <SalaryDetailFormModal
                isOpen={showDetailModal}
                onClose={closeDetailModal}
                detail={editDetail}
                structureId={selectedStructure?.id}
                structureName={selectedStructure?.structure_name}
            />
            <SalaryDeleteModal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                type={deleteTarget?.type ?? "structure"}
                item={deleteTarget?.item ?? null}
            />
        </div>
    );
}