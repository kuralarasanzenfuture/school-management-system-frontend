import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchEmployeeSalaryComponents,
} from "../../../../redux/employee_salary_component/employeeSalaryComponentSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import SalaryComponentTable from "../components/SalaryComponentTable.jsx";
import SalaryComponentModal from "../components/SalaryComponentModal.jsx";
import DeleteSalaryComponentModal from "../components/DeleteSalaryComponentModal.jsx";
import "../styles/SalaryComponent.css";
import {
    DollarSign, Plus, Search, List, LayoutGrid,
    TrendingUp, TrendingDown, CheckCircle, Zap,
    Pencil, Trash2, Check, X,
} from "lucide-react";

/* ── Stat card ── */
function StatCard({ icon: Icon, iconBgClass, iconColorClass, value, label }) {
    return (
        <div className="sc-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
            <div className={`${iconBgClass} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className={iconColorClass} />
            </div>
            <div>
                <p className="sc-stat-value text-xl font-bold leading-none">{value}</p>
                <p className="sc-stat-label text-[12.5px] mt-1">{label}</p>
            </div>
        </div>
    );
}

/* ── Bool pill for grid cards ── */
function BoolPill({ value, yesLabel = "Yes", noLabel = "No" }) {
    return (
        <span className={`sc-pill ${value ? "sc-pill-yes" : "sc-pill-no"}`}>
            {value ? <Check size={11} /> : <X size={11} />}
            {value ? yesLabel : noLabel}
        </span>
    );
}

export default function SalaryComponentPage() {
    const dispatch = useDispatch();

    const { employeeSalaryComponents: components, loading, error } = useSelector(
        (state) => state.employeeSalaryComponents,
    );
    const { user } = useSelector((state) => state.auth);
    const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const schoolId = isAdmin ? null : user?.school_id;

    /* ── Local filter state ── */
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedSchool, setSelectedSchool] = useState("");
    const [viewMode, setViewMode] = useState("table");

    /* ── Modal state ── */
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    /* ── Fetch ── */
    useEffect(() => {
        dispatch(fetchEmployeeSalaryComponents());
    }, [dispatch]);

    useEffect(() => {
        if (isAdmin && schools.length === 0) dispatch(fetchSchools());
    }, [dispatch, isAdmin, schools.length]);

    /* ── Filter ── */
    const filtered = useMemo(() => {
        let result = components ?? [];

        /* school scope */
        result = result.filter((comp) =>
            isAdmin
                ? selectedSchool
                    ? String(comp.school_id) === String(selectedSchool)
                    : true
                : String(comp.school_id) === String(schoolId),
        );

        if (typeFilter !== "All")
            result = result.filter((comp) => comp.component_type === typeFilter);

        if (statusFilter !== "All")
            result = result.filter((comp) => comp.status === statusFilter);

        const query = searchQuery.trim().toLowerCase();
        if (query)
            result = result.filter(
                (comp) =>
                    comp.name.toLowerCase().includes(query) ||
                    comp.code.toLowerCase().includes(query) ||
                    (comp.description ?? "").toLowerCase().includes(query),
            );

        return result;
    }, [components, isAdmin, schoolId, selectedSchool, typeFilter, statusFilter, searchQuery]);

    /* ── Stat counts ── */
    const scopedComponents = useMemo(() =>
        (components ?? []).filter((comp) =>
            isAdmin
                ? selectedSchool ? String(comp.school_id) === String(selectedSchool) : true
                : String(comp.school_id) === String(schoolId),
        ),
        [components, isAdmin, schoolId, selectedSchool],
    );

    const totalCount = scopedComponents.length;
    const earningCount = scopedComponents.filter((c) => c.component_type === "earning").length;
    const deductionCount = scopedComponents.filter((c) => c.component_type === "deduction").length;
    const activeCount = scopedComponents.filter((c) => c.status === "active").length;

    /* ── Handlers ── */
    const handleSearch = (e) => setSearchQuery(e.target.value);
    const handleSchoolChange = (e) => { setSelectedSchool(e.target.value); setSearchQuery(""); };

    const openAddModal = () => { setEditTarget(null); setShowModal(true); };
    const openEditModal = (comp) => { setEditTarget(comp); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditTarget(null); };

    const effectiveSchoolId = isAdmin
        ? selectedSchool ? Number(selectedSchool) : null
        : Number(schoolId);

    return (
        <div className="sc-page min-h-screen p-5 sm:p-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="sc-title text-2xl font-bold">Salary Components</h1>
                    <p className="sc-subtitle text-[13.5px] mt-1">
                        Manage earnings, deductions and benefit components for payroll.
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="sc-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors active:scale-[0.97] shadow-sm"
                >
                    <Plus size={16} /> Add Component
                </button>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={DollarSign} iconBgClass="sc-icon-total-bg" iconColorClass="sc-icon-total" value={totalCount} label="Total components" />
                <StatCard icon={TrendingUp} iconBgClass="sc-icon-earning-bg" iconColorClass="sc-icon-earning" value={earningCount} label="Earnings" />
                <StatCard icon={TrendingDown} iconBgClass="sc-icon-deduction-bg" iconColorClass="sc-icon-deduction" value={deductionCount} label="Deductions" />
                <StatCard icon={CheckCircle} iconBgClass="sc-icon-active-bg" iconColorClass="sc-icon-active" value={activeCount} label="Active" />
            </div>

            {/* ── Filter bar ── */}
            <div className="sc-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-6">
                {/* Search */}
                <div className="sc-search-wrap flex items-center gap-2 flex-1 min-w-[180px] rounded-lg px-3 py-2.5">
                    <Search size={15} className="sc-search-icon shrink-0" />
                    <input
                        className="sc-search-input text-[13.5px]"
                        placeholder="Search by name or code…"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                {/* Admin school filter */}
                {isAdmin && (
                    <select value={selectedSchool} onChange={handleSchoolChange}
                        disabled={schoolsLoading}
                        className="sc-select rounded-lg px-3.5 py-2.5 text-[13.5px] min-w-[200px]">
                        <option value="">All Schools</option>
                        {schools.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                )}

                {/* Type filter */}
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                    className="sc-select rounded-lg px-3.5 py-2.5 text-[13.5px]">
                    <option value="All">All Types</option>
                    <option value="earning">Earning</option>
                    <option value="deduction">Deduction</option>
                    <option value="benefit">Benefit</option>
                </select>

                {/* Status filter */}
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="sc-select rounded-lg px-3.5 py-2.5 text-[13.5px]">
                    <option value="All">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                {/* Count + view toggle */}
                <div className="ml-auto flex items-center gap-3">
                    <span className="sc-count-text text-[12.5px]">
                        {filtered.length === 0
                            ? "No results"
                            : `${filtered.length} component${filtered.length === 1 ? "" : "s"}`}
                    </span>
                    <div className="sc-toggle-group flex rounded-lg overflow-hidden">
                        <button onClick={() => setViewMode("table")}
                            className={`p-2 ${viewMode === "table" ? "sc-toggle-btn-active" : "sc-toggle-btn"}`}>
                            <List size={15} />
                        </button>
                        <button onClick={() => setViewMode("grid")}
                            className={`p-2 ${viewMode === "grid" ? "sc-toggle-btn-active" : "sc-toggle-btn"}`}>
                            <LayoutGrid size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="sc-table-card rounded-2xl p-12 text-center">
                    <p className="sc-cell-muted text-[14px]">Loading salary components…</p>
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="sc-table-card rounded-2xl p-12 text-center">
                    <p className="sc-field-error text-[14px]">{error}</p>
                </div>
            )}

            {/* ── TABLE view ── */}
            {!loading && !error && viewMode === "table" && (
                <SalaryComponentTable
                    components={filtered}
                    onEdit={openEditModal}
                    onDelete={(comp) => setDeleteTarget(comp)}
                    showSchoolColumn={isAdmin && !selectedSchool}
                />
            )}

            {/* ── GRID view ── */}
            {!loading && !error && viewMode === "grid" && (
                <>
                    {filtered.length === 0 ? (
                        <div className="sc-table-card rounded-2xl p-12 text-center">
                            <p className="sc-empty-state text-[13.5px]">No salary components found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map((comp) => (
                                <div key={comp.id} className="sc-card rounded-2xl p-5 flex flex-col gap-3">

                                    {/* Card header */}
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="sc-code">{comp.code}</span>
                                                <span className={`sc-type sc-type-${comp.type}`}>{comp.type}</span>
                                            </div>
                                            <p className="sc-cell-primary text-[14px] font-bold leading-tight truncate">
                                                {comp.name}
                                            </p>
                                            {isAdmin && comp.school_name && (
                                                <p className="sc-cell-muted text-[11.5px] mt-0.5 truncate">
                                                    {comp.school_name}
                                                </p>
                                            )}
                                            {comp.description && (
                                                <p className="sc-cell-muted text-[12px] mt-1 line-clamp-2 leading-relaxed">
                                                    {comp.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 ml-2 shrink-0">
                                            <button onClick={() => openEditModal(comp)}
                                                className="sc-action-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors">
                                                <Pencil size={13} />
                                            </button>
                                            <button onClick={() => setDeleteTarget(comp)}
                                                className="sc-action-btn sc-action-btn-danger w-7 h-7 rounded-lg flex items-center justify-center transition-colors">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Value */}
                                    <div className="sc-card-divider h-px" />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="sc-cell-muted text-[11px] uppercase tracking-wide mb-0.5">
                                                {comp.calculation_type === "percentage" ? "Percentage" : "Fixed Amount"}
                                            </p>
                                            <p className="sc-cell-primary text-[20px] font-bold">
                                                {comp.calculation_type === "percentage" ? "" : "₹"}
                                                {Number(comp.value).toLocaleString("en-IN")}
                                                {comp.calculation_type === "percentage" ? "%" : ""}
                                            </p>
                                        </div>
                                        <span className={`sc-status sc-status-${comp.status}`}>{comp.status}</span>
                                    </div>

                                    {/* Pills */}
                                    <div className="sc-card-divider h-px" />
                                    <div className="flex flex-wrap gap-1.5">
                                        <BoolPill
                                            value={Boolean(Number(comp.is_taxable))}
                                            yesLabel="Taxable"
                                            noLabel="Tax-free"
                                        />
                                        <span className={`sc-calc ${comp.calculation_type === "percentage" ? "sc-calc-percentage" : "sc-calc-fixed"}`}>
                                            {comp.calculation_type === "percentage" ? "% Based" : "Fixed"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ── Modals ── */}
            <SalaryComponentModal
                isOpen={showModal}
                onClose={closeModal}
                component={editTarget}
                schoolId={effectiveSchoolId}
            />
            <DeleteSalaryComponentModal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                component={deleteTarget}
            />
        </div>
    );
}