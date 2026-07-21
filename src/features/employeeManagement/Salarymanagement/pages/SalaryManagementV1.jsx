/**
 * VERSION 1 — Split-Panel (Master-Detail)
 * Left: scrollable structure list  |  Right: selected structure's components
 */
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployeeSalaryStructures } from "../../../../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
import { fetchEmployeeSalaryStructureDetails } from "../../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import {
    SalaryStructureFormModal,
    SalaryDetailFormModal,
    // SalaryDeleteModal,
} from "../components/SalaryManagementModals.jsx";

import {SalaryDeleteModal} from "../components/SalaryManagementModals.jsx";

import "../styles/SalaryManagement.css";
import {
    Plus, Search, Pencil, Trash2, IndianRupee,
    Percent, LayoutList, TrendingUp, TrendingDown,
    CalendarDays, CalendarCheck2, ChevronRight,
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
        <div className="sm-stat-card flex items-center gap-3 rounded-2xl px-4 py-3.5">
            <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} />
            </div>
            <div>
                <p className="sm-stat-value text-lg font-bold leading-none">{value}</p>
                <p className="sm-stat-label text-[12px] mt-0.5">{label}</p>
            </div>
        </div>
    );
}

export default function SalaryManagementV1() {
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

    /* ── State ── */
    const [selectedId, setSelectedId] = useState(null);
    const [structureSearch, setStructureSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedSchool, setSelectedSchool] = useState("");

    const [showStructureModal, setShowStructureModal] = useState(false);
    const [editStructure, setEditStructure] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editDetail, setEditDetail] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null); // { type, item }

    /* ── Fetch ── */
    useEffect(() => { dispatch(fetchEmployeeSalaryStructures()); dispatch(fetchEmployeeSalaryStructureDetails()); }, [dispatch]);
    useEffect(() => { if (isAdmin && !schools.length) dispatch(fetchSchools()); }, [dispatch, isAdmin, schools.length]);

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

    /* ── Selected structure object ── */
    const selectedStructure = useMemo(
        () => filteredStructures.find((s) => s.id === selectedId) ?? null,
        [filteredStructures, selectedId],
    );

    /* ── Details for selected structure ── */
    const selectedDetails = useMemo(
        () => (allDetails ?? []).filter((d) => d.salary_structure_id === selectedId),
        [allDetails, selectedId],
    );

    /* ── Totals ── */
    const totals = useMemo(() => {
        let earnings = 0, deductions = 0;
        selectedDetails.forEach((d) => {
            const val = d.calculation_type === "fixed" ? Number(d.amount ?? 0) : 0;
            if (d.component_type === "earning") earnings += val;
            if (d.component_type === "deduction") deductions += val;
        });
        return { earnings, deductions, net: earnings - deductions };
    }, [selectedDetails]);

    /* ── Stat counts ── */
    const scoped = useMemo(() => (structures ?? []).filter((s) => isAdmin ? (selectedSchool ? String(s.school_id) === String(selectedSchool) : true) : String(s.school_id) === String(schoolId)), [structures, isAdmin, schoolId, selectedSchool]);
    const totalCount = scoped.length;
    const activeCount = scoped.filter((s) => isActive(s)).length;
    const empCount = new Set(scoped.map((s) => s.employee_id)).size;

    /* ── Handlers ── */
    const openAddStructure = () => { setEditStructure(null); setShowStructureModal(true); };
    const openEditStructure = (s) => { setEditStructure(s); setShowStructureModal(true); };
    const closeStructureModal = () => { setShowStructureModal(false); setEditStructure(null); };

    const openAddDetail = () => { setEditDetail(null); setShowDetailModal(true); };
    const openEditDetail = (d) => { setEditDetail(d); setShowDetailModal(true); };
    const closeDetailModal = () => { setShowDetailModal(false); setEditDetail(null); };

    return (
        <div className="sm-page min-h-screen p-5 sm:p-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h1 className="sm-title text-2xl font-bold">Salary Management</h1>
                    <p className="sm-subtitle text-[13.5px] mt-1">
                        Manage salary structures and their component breakdowns in one place.
                    </p>
                </div>
                <button onClick={openAddStructure}
                    className="sm-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors active:scale-[0.97] shadow-sm">
                    <Plus size={16} /> New Structure
                </button>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <StatCard icon={LayoutList} bg="sm-icon-total-bg" color="sm-icon-total" value={totalCount} label="Total structures" />
                <StatCard icon={CheckCircle} bg="sm-icon-active-bg" color="sm-icon-active" value={activeCount} label="Active" />
                <StatCard icon={Users} bg="sm-icon-deduction-bg" color="sm-icon-deduction" value={empCount} label="Employees" />
                <StatCard icon={TrendingUp} bg="sm-icon-earning-bg" color="sm-icon-earning" value={(allDetails ?? []).length} label="Total components" />
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
                    <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}
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

            {/* ── Split layout ── */}
            <div className="sm-split">

                {/* ── LEFT: structure list ── */}
                <div className="sm-left-panel">
                    <div className="sm-left-header px-4 py-3 flex items-center justify-between">
                        <span className="sm-left-title text-[13.5px] font-bold">Structures</span>
                        <span className="sm-count-text text-[12px]">{filteredStructures.length}</span>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(100vh-260px)]">
                        {sLoading ? (
                            <p className="sm-comp-muted text-[13px] px-4 py-6 text-center">Loading…</p>
                        ) : filteredStructures.length === 0 ? (
                            <p className="sm-comp-muted text-[13px] px-4 py-6 text-center">No structures found.</p>
                        ) : (
                            filteredStructures.map((s) => {
                                const active = isActive(s);
                                const selected = s.id === selectedId;
                                return (
                                    <div key={s.id}
                                        onClick={() => setSelectedId(selected ? null : s.id)}
                                        className={`sm-structure-item px-4 py-3.5 flex items-center gap-3 ${selected ? "sm-structure-item-selected" : ""}`}
                                    >
                                        <div className="sm-structure-avatar w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0">
                                            {initials(s.first_name, s.last_name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${active ? "sm-dot-active" : "sm-dot-inactive"}`} />
                                                <p className="sm-structure-name text-[13px] font-semibold truncate">{s.structure_name}</p>
                                            </div>
                                            <p className="sm-structure-emp text-[12px] truncate">
                                                {s.first_name} {s.last_name}
                                                {s.designation ? ` · ${s.designation}` : ""}
                                            </p>
                                            <p className="sm-structure-meta text-[11px] mt-0.5">
                                                From {fmt(s.effective_from)}
                                                {s.effective_to ? ` → ${fmt(s.effective_to)}` : " · Open-ended"}
                                            </p>
                                        </div>
                                        <ChevronRight size={14} className={`sm-comp-muted shrink-0 transition-transform ${selected ? "rotate-90" : ""}`} />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── RIGHT: detail panel ── */}
                <div className="sm-right-panel">
                    {!selectedStructure ? (
                        <div className="sm-empty-placeholder flex flex-col items-center justify-center gap-3 m-6 py-16 text-center">
                            <LayoutList size={36} className="sm-comp-muted opacity-40" />
                            <p className="sm-comp-muted text-[14px] font-medium">Select a structure from the list</p>
                            <p className="sm-comp-muted text-[12.5px]">Click any structure on the left to view and manage its salary components</p>
                        </div>
                    ) : (
                        <>
                            {/* Right header */}
                            <div className="sm-right-header px-5 py-4 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="sm-right-title text-[15px] font-bold truncate">{selectedStructure.structure_name}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <p className="sm-structure-emp text-[12.5px]">
                                            {selectedStructure.first_name} {selectedStructure.last_name}
                                            {selectedStructure.designation ? ` · ${selectedStructure.designation}` : ""}
                                        </p>
                                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isActive(selectedStructure) ? "sm-icon-active-bg sm-icon-active" : "sm-icon-deduction-bg sm-icon-deduction"}`}>
                                            {isActive(selectedStructure) ? "Active" : selectedStructure.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                        <span className="sm-structure-meta text-[11.5px] flex items-center gap-1">
                                            <CalendarDays size={12} /> From {fmt(selectedStructure.effective_from)}
                                        </span>
                                        {selectedStructure.effective_to ? (
                                            <span className="sm-structure-meta text-[11.5px] flex items-center gap-1">
                                                <CalendarCheck2 size={12} /> To {fmt(selectedStructure.effective_to)}
                                            </span>
                                        ) : (
                                            <span className="sm-date-open text-[11.5px] flex items-center gap-1">
                                                <CalendarCheck2 size={12} /> Open-ended
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => openEditStructure(selectedStructure)}
                                        className="sm-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors" title="Edit structure">
                                        <Pencil size={15} />
                                    </button>
                                    <button onClick={() => setDeleteTarget({ type: "structure", item: selectedStructure })}
                                        className="sm-action-btn sm-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors" title="Delete structure">
                                        <Trash2 size={15} />
                                    </button>
                                    <button onClick={openAddDetail}
                                        className="sm-btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-colors active:scale-[0.97]">
                                        <Plus size={14} /> Add Component
                                    </button>
                                </div>
                            </div>

                            {/* Component list */}
                            {dLoading ? (
                                <p className="sm-comp-muted text-[13px] px-5 py-8 text-center">Loading components…</p>
                            ) : selectedDetails.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-12">
                                    <IndianRupee size={28} className="sm-comp-muted opacity-30" />
                                    <p className="sm-comp-muted text-[13.5px] font-medium">No components added yet</p>
                                    <button onClick={openAddDetail}
                                        className="sm-btn-outline inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-colors mt-1">
                                        <Plus size={14} /> Add first component
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Component rows */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="sm-comp-row text-[11px] uppercase tracking-wide sm-comp-muted">
                                                    <th className="px-5 py-2.5 font-semibold">Component</th>
                                                    <th className="px-3 py-2.5 font-semibold">Type</th>
                                                    <th className="px-3 py-2.5 font-semibold">Calc</th>
                                                    <th className="px-3 py-2.5 font-semibold">Value</th>
                                                    <th className="px-3 py-2.5 font-semibold text-right pr-5">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedDetails.map((d) => {
                                                    const isEarning = d.component_type === "earning";
                                                    const isPercent = d.calculation_type === "percentage";
                                                    return (
                                                        <tr key={d.id} className="sm-comp-row">
                                                            <td className="px-5 py-3">
                                                                <p className="sm-comp-name text-[13.5px] font-semibold">{d.component_name}</p>
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <span className={`sm-comp-type sm-comp-type-${d.component_type}`}>{d.component_type}</span>
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <span className={`sm-calc-chip sm-calc-${d.calculation_type}`}>
                                                                    {isPercent ? <Percent size={10} /> : <IndianRupee size={10} />}
                                                                    {isPercent ? "%" : "Fixed"}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className={`sm-amount ${isEarning ? "sm-amount-earning" : "sm-amount-deduction"}`}>
                                                                        {isPercent
                                                                            ? `${Number(d.percentage ?? 0).toFixed(2)}%`
                                                                            : `₹${Number(d.amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                                                                    </span>
                                                                    {isPercent && d.based_on && (
                                                                        <span className="sm-based-on">of {d.based_on}</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <div className="flex items-center justify-end gap-1 pr-2">
                                                                    <button onClick={() => openEditDetail(d)}
                                                                        className="sm-action-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors" title="Edit">
                                                                        <Pencil size={13} />
                                                                    </button>
                                                                    <button onClick={() => setDeleteTarget({ type: "detail", item: d })}
                                                                        className="sm-action-btn sm-action-btn-danger w-7 h-7 rounded-lg flex items-center justify-center transition-colors" title="Remove">
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Totals bar */}
                                    <div className="sm-totals-bar flex items-center justify-end gap-6 px-5 py-3 flex-wrap">
                                        <span className="sm-totals-label text-[12px]">
                                            Earnings: <span className="sm-totals-earning">₹{totals.earnings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                        </span>
                                        <span className="sm-totals-label text-[12px]">
                                            Deductions: <span className="sm-totals-deduction">₹{totals.deductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                        </span>
                                        <span className="sm-totals-label text-[12px]">
                                            Net: <span className="sm-totals-net">₹{totals.net.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                        </span>
                                    </div>
                                </>
                            )}
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