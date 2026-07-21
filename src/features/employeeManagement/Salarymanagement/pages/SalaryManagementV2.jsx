/**
 * VERSION 2 — Accordion Table
 * Single table; clicking a structure row expands it inline
 * to reveal its salary components with add / edit / delete.
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
import Pagination from "../../../../common/components/table/Pagination";
import usePagination from "../../../../common/components/table/usePagination";
import "../styles/SalaryManagement.css";
import {
    Plus, Search, Pencil, Trash2, IndianRupee,
    Percent, LayoutList, TrendingUp, TrendingDown,
    CalendarDays, CalendarCheck2, ChevronDown,
    Users, CheckCircle,
} from "lucide-react";

/* ── helpers ── */
function fmt(v) {
    if (!v) return null;
    return new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function initials(f, l) { return `${f?.[0] ?? ''}${l?.[0] ?? ''}`.toUpperCase() || "?"; }
function isActive(s) {
    if (s.status !== "active") return false;
    const today = new Date(), from = new Date(s.effective_from);
    if (today < from) return false;
    if (!s.effective_to) return true;
    return today <= new Date(s.effective_to);
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

/* ── Inline component row ── */
function ComponentRow({ d, onEdit, onDelete }) {
    const isEarning = d.component_type === "earning";
    const isPercent = d.calculation_type === "percentage";
    return (
        <tr className="sm-comp-row">
            <td className="pl-14 pr-3 py-2.5">
                <p className="sm-comp-name text-[13px] font-semibold">{d.component_name}</p>
            </td>
            <td className="px-3 py-2.5">
                <span className={`sm-comp-type sm-comp-type-${d.component_type}`}>{d.component_type}</span>
            </td>
            <td className="px-3 py-2.5">
                <span className={`sm-calc-chip sm-calc-${d.calculation_type}`}>
                    {isPercent ? <Percent size={10} /> : <IndianRupee size={10} />}
                    {isPercent ? "Percentage" : "Fixed"}
                </span>
            </td>
            <td className="px-3 py-2.5">
                <div className="flex flex-col gap-0.5">
                    <span className={`sm-amount text-[13.5px] ${isEarning ? "sm-amount-earning" : "sm-amount-deduction"}`}>
                        {isPercent
                            ? `${Number(d.percentage ?? 0).toFixed(2)}%`
                            : `₹${Number(d.amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                    </span>
                    {isPercent && d.based_on && (
                        <span className="sm-based-on">of {d.based_on}</span>
                    )}
                </div>
            </td>
            <td className="px-3 py-2.5">
                <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(d)}
                        className="sm-action-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors" title="Edit">
                        <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(d)}
                        className="sm-action-btn sm-action-btn-danger w-7 h-7 rounded-lg flex items-center justify-center transition-colors" title="Remove">
                        <Trash2 size={13} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

/* ══ Main page ══════════════════════════════════════════════════ */
export default function SalaryManagementV2() {
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
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [structureSearch, setStructureSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedSchool, setSelectedSchool] = useState("");

    /* ── Modal state ── */
    const [showStructureModal, setShowStructureModal] = useState(false);
    const [editStructure, setEditStructure] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editDetail, setEditDetail] = useState(null);
    const [activeStructureId, setActiveStructureId] = useState(null); // for "Add Component"
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
            s.structure_name.toLowerCase().includes(q) ||
            (s.designation ?? "").toLowerCase().includes(q),
        );
        return result;
    }, [structures, isAdmin, schoolId, selectedSchool, statusFilter, structureSearch]);

    /* ── Pagination ── */
    const {
        pagedData: pagedStructures,
        currentPage, pageSize, totalItems,
        setPage, setPageSize,
    } = usePagination({ data: filteredStructures, initialSize: 10 });

    /* ── Stats ── */
    const scoped = useMemo(() => (structures ?? []).filter((s) => isAdmin ? (selectedSchool ? String(s.school_id) === String(selectedSchool) : true) : String(s.school_id) === String(schoolId)), [structures, isAdmin, schoolId, selectedSchool]);
    const totalCount = scoped.length;
    const activeCount = scoped.filter((s) => isActive(s)).length;
    const empCount = new Set(scoped.map((s) => s.employee_id)).size;
    const detailCount = (allDetails ?? []).length;

    /* ── Toggle expand ── */
    const toggleExpand = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    /* ── Details helper ── */
    const detailsFor = (structureId) =>
        (allDetails ?? []).filter((d) => d.salary_structure_id === structureId);

    const totalsFor = (structureId) => {
        const rows = detailsFor(structureId);
        let earnings = 0, deductions = 0;
        rows.forEach((d) => {
            const val = d.calculation_type === "fixed" ? Number(d.amount ?? 0) : 0;
            if (d.component_type === "earning") earnings += val;
            if (d.component_type === "deduction") deductions += val;
        });
        return { earnings, deductions, net: earnings - deductions };
    };

    /* ── Handlers ── */
    const openAddStructure = () => { setEditStructure(null); setShowStructureModal(true); };
    const openEditStructure = (s, e) => { e.stopPropagation(); setEditStructure(s); setShowStructureModal(true); };
    const closeStructureModal = () => { setShowStructureModal(false); setEditStructure(null); };

    const openAddDetail = (structureId, e) => {
        e.stopPropagation();
        setActiveStructureId(structureId);
        setEditDetail(null);
        setShowDetailModal(true);
    };
    const openEditDetail = (d) => { setActiveStructureId(d.salary_structure_id); setEditDetail(d); setShowDetailModal(true); };
    const closeDetailModal = () => { setShowDetailModal(false); setEditDetail(null); setActiveStructureId(null); };

    const activeStructure = useMemo(
        () => (structures ?? []).find((s) => s.id === activeStructureId) ?? null,
        [structures, activeStructureId],
    );

    return (
        <div className="sm-page min-h-screen p-5 sm:p-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h1 className="sm-title text-2xl font-bold">Salary Management</h1>
                    <p className="sm-subtitle text-[13.5px] mt-1">
                        Expand any structure row to view and manage its salary components.
                    </p>
                </div>
                <button onClick={openAddStructure}
                    className="sm-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors active:scale-[0.97] shadow-sm">
                    <Plus size={16} /> New Structure
                </button>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <StatCard icon={LayoutList} bg="sm-icon-total-bg" color="sm-icon-total" value={totalCount} label="Total structures" />
                <StatCard icon={CheckCircle} bg="sm-icon-active-bg" color="sm-icon-active" value={activeCount} label="Active" />
                <StatCard icon={Users} bg="sm-icon-deduction-bg" color="sm-icon-deduction" value={empCount} label="Employees" />
                <StatCard icon={TrendingUp} bg="sm-icon-earning-bg" color="sm-icon-earning" value={detailCount} label="Total components" />
            </div>

            {/* ── Filter bar ── */}
            <div className="sm-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
                <div className="sm-search-wrap flex items-center gap-2 flex-1 min-w-[180px] rounded-lg px-3 py-2.5">
                    <Search size={15} className="sm-search-icon shrink-0" />
                    <input className="sm-search-input text-[13.5px]"
                        placeholder="Search employee or structure name…"
                        value={structureSearch} onChange={(e) => setStructureSearch(e.target.value)} />
                </div>
                {isAdmin && (
                    <select value={selectedSchool}
                        onChange={(e) => { setSelectedSchool(e.target.value); setPage(1); }}
                        disabled={schoolsLoading}
                        className="sm-select rounded-lg px-3.5 py-2.5 text-[13.5px] min-w-[200px]">
                        <option value="">All Schools</option>
                        {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                )}
                <select value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="sm-select rounded-lg px-3.5 py-2.5 text-[13.5px]">
                    <option value="All">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <span className="sm-count-text text-[12.5px] ml-auto">
                    {filteredStructures.length} structure{filteredStructures.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* ── Accordion Table ── */}
            <div className="sm-right-panel rounded-2xl overflow-hidden">

                {/* Table head */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="sm-comp-row text-[11.5px] uppercase tracking-wide sm-comp-muted"
                                style={{ background: "var(--input-bg)" }}>
                                <th className="px-5 py-3 w-8 font-semibold" />
                                <th className="px-3 py-3 font-semibold">Employee</th>
                                <th className="px-3 py-3 font-semibold">Structure Name</th>
                                <th className="px-3 py-3 font-semibold">Effective Period</th>
                                {isAdmin && <th className="px-3 py-3 font-semibold">School</th>}
                                <th className="px-3 py-3 font-semibold text-center">Status</th>
                                <th className="px-3 py-3 font-semibold text-right pr-5">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sLoading ? (
                                <tr><td colSpan={isAdmin ? 7 : 6} className="px-5 py-12 text-center sm-comp-muted text-[13.5px]">Loading structures…</td></tr>
                            ) : pagedStructures.length === 0 ? (
                                <tr><td colSpan={isAdmin ? 7 : 6} className="px-5 py-12 text-center sm-comp-muted text-[13.5px]">No structures found.</td></tr>
                            ) : (
                                pagedStructures.map((s) => {
                                    const expanded = expandedIds.has(s.id);
                                    const active = isActive(s);
                                    const details = detailsFor(s.id);
                                    const totals = totalsFor(s.id);

                                    return (
                                        <React.Fragment key={s.id}>

                                            {/* ── Structure row ── */}
                                            <tr
                                                className={`sm-comp-row cursor-pointer select-none ${expanded ? "sm-structure-item-selected" : ""}`}
                                                onClick={() => toggleExpand(s.id)}
                                            >
                                                {/* Expand chevron */}
                                                <td className="px-5 py-3.5 w-8">
                                                    <motion.div
                                                        animate={{ rotate: expanded ? 180 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="sm-comp-muted"
                                                    >
                                                        <ChevronDown size={16} />
                                                    </motion.div>
                                                </td>

                                                {/* Employee */}
                                                <td className="px-3 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="sm-structure-avatar w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0">
                                                            {initials(s.first_name, s.last_name)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="sm-structure-name text-[13.5px] truncate">{s.first_name} {s.last_name ?? ""}</p>
                                                            {s.designation && (
                                                                <p className="sm-structure-meta text-[12px] truncate">{s.designation}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Structure name */}
                                                <td className="px-3 py-3.5 max-w-[200px]">
                                                    <p className="sm-comp-name text-[13.5px] font-semibold truncate">{s.structure_name}</p>
                                                    {s.remarks && (
                                                        <p className="sm-comp-muted text-[12px] mt-0.5 truncate">{s.remarks}</p>
                                                    )}
                                                </td>

                                                {/* Effective period */}
                                                <td className="px-3 py-3.5">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="sm-structure-meta text-[12px] flex items-center gap-1">
                                                            <CalendarDays size={11} /> {fmt(s.effective_from)}
                                                        </span>
                                                        {s.effective_to ? (
                                                            <span className="sm-structure-meta text-[12px] flex items-center gap-1">
                                                                <CalendarCheck2 size={11} /> {fmt(s.effective_to)}
                                                            </span>
                                                        ) : (
                                                            <span className="sm-date-open text-[12px] flex items-center gap-1">
                                                                <CalendarCheck2 size={11} /> Open-ended
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* School — admin only */}
                                                {isAdmin && (
                                                    <td className="sm-comp-muted px-3 py-3.5 text-[12.5px] max-w-[140px]">
                                                        <span className="truncate block">{s.school_name ?? "—"}</span>
                                                    </td>
                                                )}

                                                {/* Status */}
                                                <td className="px-3 py-3.5 text-center">
                                                    <span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${active ? "sm-icon-active-bg sm-icon-active" : "sm-icon-deduction-bg sm-icon-deduction"}`}>
                                                        {active ? "Active" : s.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3 py-3.5">
                                                    <div className="flex items-center justify-end gap-1 pr-2">
                                                        <button
                                                            onClick={(e) => openEditStructure(s, e)}
                                                            className="sm-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors" title="Edit structure">
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "structure", item: s }); }}
                                                            className="sm-action-btn sm-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors" title="Delete structure">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* ── Expanded: component sub-section ── */}
                                            <AnimatePresence initial={false}>
                                                {expanded && (
                                                    <tr>
                                                        <td colSpan={isAdmin ? 7 : 6} className="p-0">
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                                                style={{ overflow: "hidden" }}
                                                            >
                                                                <div style={{ background: "color-mix(in srgb, var(--btn-bg) 4%, var(--panel-bg))", borderTop: "1px solid var(--divider)", borderBottom: "1px solid var(--divider)" }}>

                                                                    {/* Sub-header */}
                                                                    <div className="flex items-center justify-between px-5 py-3">
                                                                        <p className="sm-comp-secondary text-[12.5px] font-semibold">
                                                                            {details.length} component{details.length !== 1 ? "s" : ""}
                                                                            {details.length > 0 && (
                                                                                <span className="sm-comp-muted font-normal ml-2">
                                                                                    · Net: <span className={totals.net >= 0 ? "sm-totals-earning" : "sm-totals-deduction"}>
                                                                                        ₹{totals.net.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                                                    </span>
                                                                                </span>
                                                                            )}
                                                                        </p>
                                                                        <button
                                                                            onClick={(e) => openAddDetail(s.id, e)}
                                                                            className="sm-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors active:scale-[0.97]">
                                                                            <Plus size={13} /> Add Component
                                                                        </button>
                                                                    </div>

                                                                    {/* Component table */}
                                                                    {dLoading ? (
                                                                        <p className="sm-comp-muted text-[13px] px-5 py-4 text-center">Loading…</p>
                                                                    ) : details.length === 0 ? (
                                                                        <p className="sm-comp-muted text-[13px] px-5 pb-4 text-center">
                                                                            No components yet — click "Add Component" to get started.
                                                                        </p>
                                                                    ) : (
                                                                        <table className="w-full text-left">
                                                                            <thead>
                                                                                <tr className="text-[11px] uppercase tracking-wide sm-comp-muted" style={{ background: "var(--input-bg)" }}>
                                                                                    <th className="pl-14 pr-3 py-2 font-semibold">Component</th>
                                                                                    <th className="px-3 py-2 font-semibold">Type</th>
                                                                                    <th className="px-3 py-2 font-semibold">Calc</th>
                                                                                    <th className="px-3 py-2 font-semibold">Value</th>
                                                                                    <th className="px-3 py-2 font-semibold">Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {details.map((d) => (
                                                                                    <ComponentRow
                                                                                        key={d.id}
                                                                                        d={d}
                                                                                        onEdit={openEditDetail}
                                                                                        onDelete={(d) => setDeleteTarget({ type: "detail", item: d })}
                                                                                    />
                                                                                ))}
                                                                            </tbody>
                                                                            {/* Totals row */}
                                                                            <tfoot>
                                                                                <tr className="sm-totals-bar">
                                                                                    <td colSpan={2} className="pl-14 pr-3 py-2.5 sm-totals-label text-[12px]">
                                                                                        Earnings: <span className="sm-totals-earning">₹{totals.earnings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                                                                    </td>
                                                                                    <td colSpan={2} className="px-3 py-2.5 sm-totals-label text-[12px]">
                                                                                        Deductions: <span className="sm-totals-deduction">₹{totals.deductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                                                                    </td>
                                                                                    <td className="px-3 py-2.5 sm-totals-label text-[12px]">
                                                                                        Net: <span className="sm-totals-net">₹{totals.net.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                                                                    </td>
                                                                                </tr>
                                                                            </tfoot>
                                                                        </table>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>

                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />
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
                structureId={activeStructure?.id}
                structureName={activeStructure?.structure_name}
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