import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchEmployeeSalaryComponents,
    toggleEmployeeSalaryComponentStatus,
} from "../../../../redux/employee_salary_component/employeeSalaryComponentSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import SalaryComponentTable from "../components/SalaryComponentTable.jsx";
import SalaryComponentModal from "../components/SalaryComponentModal.jsx";
import DeleteSalaryComponentModal from "../components/DeleteSalaryComponentModal.jsx";
import SalaryComponentStatusModal from "../components/SalaryComponentStatusModal.jsx";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import "../styles/SalaryComponent.css";
import {
    DollarSign, Plus, Search, List, LayoutGrid,
    TrendingUp, TrendingDown, CheckCircle,
    Pencil, Trash2, Loader2,
} from "lucide-react";

const TYPE_OPTIONS = [
    { value: "", label: "All Types" },
    { value: "earning", label: "Earning" },
    { value: "deduction", label: "Deduction" },
];

const STATUS_OPTIONS = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

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

export default function SalaryComponentPage() {
    const dispatch = useDispatch();

    const { employeeSalaryComponents: components, loading, error } = useSelector(
        (state) => state.employeeSalaryComponents,
    );
    const { user } = useSelector((state) => state.auth);
    const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

    const schoolList = useMemo(() => {
        const raw = Array.isArray(schools)
            ? schools
            : schools?.schools || schools?.data || [];
        return Array.isArray(raw) ? raw : [];
    }, [schools]);

    const schoolOptions = useMemo(
        () => [
            { value: "", label: "All Schools" },
            ...schoolList.map((school) => ({
                value: String(school.id),
                label: school.name,
            })),
        ],
        [schoolList],
    );

    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const schoolId = isAdmin ? null : user?.school_id;

    /* ── Local filter state ── */
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedSchool, setSelectedSchool] = useState("");
    const [viewMode, setViewMode] = useState("grid");

    /* ── Modal state ── */
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    /* ── Status toggle modal state ── */
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [statusTargetComponent, setStatusTargetComponent] = useState(null);
    const [targetStatus, setTargetStatus] = useState("");
    const [statusSubmitting, setStatusSubmitting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    /* ── Fetch ── */
    useEffect(() => {
        dispatch(fetchEmployeeSalaryComponents());
    }, [dispatch]);

    useEffect(() => {
        if (isAdmin && schoolList.length === 0) dispatch(fetchSchools());
    }, [dispatch, isAdmin, schoolList.length]);

    /* ── Status toggle request ── */
    const handleStatusToggleRequest = (component, nextStatus) => {
        setStatusTargetComponent(component);
        setTargetStatus(
            nextStatus || (component.status === "active" ? "inactive" : "active"),
        );
        setStatusModalOpen(true);
    };

    const closeStatusModal = () => {
        setStatusModalOpen(false);
        setStatusTargetComponent(null);
        setTargetStatus("");
    };

    const handleConfirmStatusChange = async (componentId, next) => {
        setStatusSubmitting(true);
        setTogglingId(componentId);
        try {
            await dispatch(
                toggleEmployeeSalaryComponentStatus({
                    id: componentId,
                    status: next,
                }),
            ).unwrap();
            closeStatusModal();
        } catch (err) {
            alert(err || "Failed to update salary component status");
        } finally {
            setStatusSubmitting(false);
            setTogglingId(null);
        }
    };

    /* ── Filter ── */
    const filtered = useMemo(() => {
        let result = Array.isArray(components)
            ? components
            : components?.data || components?.components || [];

        /* school scope */
        result = result.filter((comp) =>
            isAdmin
                ? selectedSchool
                    ? String(comp.school_id) === String(selectedSchool)
                    : true
                : String(comp.school_id) === String(schoolId),
        );

        if (typeFilter && typeFilter !== "All")
            result = result.filter((comp) => (comp.component_type || comp.type) === typeFilter);

        if (statusFilter && statusFilter !== "All")
            result = result.filter((comp) => comp.status === statusFilter);

        const query = searchQuery.trim().toLowerCase();
        if (query)
            result = result.filter(
                (comp) =>
                    (comp.name ?? "").toLowerCase().includes(query) ||
                    (comp.code ?? "").toLowerCase().includes(query) ||
                    (comp.description ?? "").toLowerCase().includes(query),
            );

        return result;
    }, [components, isAdmin, schoolId, selectedSchool, typeFilter, statusFilter, searchQuery]);

    /* ── Stat counts ── */
    const scopedComponents = useMemo(() => {
        const raw = Array.isArray(components)
            ? components
            : components?.data || components?.components || [];
        return raw.filter((comp) =>
            isAdmin
                ? selectedSchool ? String(comp.school_id) === String(selectedSchool) : true
                : String(comp.school_id) === String(schoolId),
        );
    }, [components, isAdmin, schoolId, selectedSchool]);

    const totalCount = scopedComponents.length;
    const earningCount = scopedComponents.filter((c) => (c.component_type || c.type) === "earning").length;
    const deductionCount = scopedComponents.filter((c) => (c.component_type || c.type) === "deduction").length;
    const activeCount = scopedComponents.filter((c) => c.status === "active").length;

    /* ── Handlers ── */
    const handleSearch = (e) => setSearchQuery(e.target.value);

    const openAddModal = () => { setEditTarget(null); setShowModal(true); };
    const openEditModal = (comp) => { setEditTarget(comp); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditTarget(null); };

    const effectiveSchoolId = isAdmin
        ? (selectedSchool ? Number(selectedSchool) : null)
        : Number(schoolId);

    return (
        <div className="sc-page min-h-screen p-5 sm:p-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="sc-title text-2xl font-bold">Salary Components</h1>
                    <p className="sc-subtitle text-[13.5px] mt-1">
                        Manage earnings and deduction components for employee payroll.
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
                    <CustomDropdown
                        options={schoolOptions}
                        value={selectedSchool}
                        onChange={(val) => { setSelectedSchool(val); setSearchQuery(""); }}
                        placeholder={schoolsLoading ? "Loading schools…" : "All Schools"}
                        searchable={schoolOptions.length > 5}
                        searchPlaceholder="Search schools…"
                        disabled={schoolsLoading}
                        className="min-w-[200px]"
                    />
                )}

                {/* Type filter */}
                <CustomDropdown
                    options={TYPE_OPTIONS}
                    value={typeFilter}
                    onChange={(val) => setTypeFilter(val)}
                    placeholder="All Types"
                    className="min-w-[145px]"
                />

                {/* Status filter */}
                <CustomDropdown
                    options={STATUS_OPTIONS}
                    value={statusFilter}
                    onChange={(val) => setStatusFilter(val)}
                    placeholder="All Statuses"
                    className="min-w-[145px]"
                />

                {/* Count + view toggle */}
                <div className="ml-auto flex items-center gap-3">
                    <span className="sc-count-text text-[12.5px]">
                        {filtered.length === 0
                            ? "No results"
                            : `${filtered.length} component${filtered.length === 1 ? "" : "s"}`}
                    </span>
                    <div className="sc-toggle-group flex rounded-lg overflow-hidden">
                        <button onClick={() => setViewMode("table")}
                            title="Table view"
                            className={`p-2 ${viewMode === "table" ? "sc-toggle-btn-active" : "sc-toggle-btn"}`}>
                            <List size={15} />
                        </button>
                        <button onClick={() => setViewMode("grid")}
                            title="Grid card view"
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
                    onToggleStatus={handleStatusToggleRequest}
                    togglingId={togglingId}
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
                                <div key={comp.id} className="sc-card rounded-2xl p-5 flex flex-col justify-between gap-4">

                                    {/* Top Section */}
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-2.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="sc-code">{comp.code}</span>
                                                <span className={`sc-type ${
                                                    (comp.component_type || comp.type) === "earning"
                                                        ? "sc-type-earning"
                                                        : "sc-type-deduction"
                                                }`}>
                                                    {(comp.component_type || comp.type) === "earning"
                                                        ? "+ Earning"
                                                        : "- Deduction"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => openEditModal(comp)}
                                                    className="sc-action-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                                    title="Edit Component"
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(comp)}
                                                    className="sc-action-btn sc-action-btn-danger w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                                    title="Delete Component"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="sc-cell-primary text-[15px] font-bold leading-tight">
                                            {comp.name}
                                        </p>
                                        {isAdmin && comp.school_name && (
                                            <p className="sc-cell-muted text-[12px] mt-1 truncate">
                                                {comp.school_name}
                                            </p>
                                        )}
                                        {comp.description && (
                                            <p className="sc-cell-muted text-[12px] mt-1.5 line-clamp-2 leading-relaxed">
                                                {comp.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Bottom Section: Calculation & Status Switch */}
                                    <div>
                                        <div className="sc-card-divider h-px mb-3" />
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <p className="sc-cell-muted text-[10.5px] uppercase tracking-wider font-semibold mb-1">
                                                    Calculation Type
                                                </p>
                                                <span
                                                    className={`sc-badge ${
                                                        comp.calculation_type === "percentage"
                                                            ? "sc-badge-percentage"
                                                            : "sc-badge-fixed"
                                                    }`}
                                                >
                                                    {comp.calculation_type === "percentage"
                                                        ? "% Percentage"
                                                        : "₹ Fixed Amount"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={comp.status === "active"}
                                                    disabled={togglingId === comp.id}
                                                    onClick={() =>
                                                        handleStatusToggleRequest(
                                                            comp,
                                                            comp.status === "active" ? "inactive" : "active",
                                                        )
                                                    }
                                                    className={`sc-toggle-switch ${
                                                        comp.status === "active"
                                                            ? "sc-toggle-active"
                                                            : "sc-toggle-inactive"
                                                    }`}
                                                    title={`Click to ${comp.status === "active" ? "deactivate" : "activate"}`}
                                                >
                                                    {togglingId === comp.id ? (
                                                        <Loader2 size={12} className="animate-spin text-white mx-auto" />
                                                    ) : (
                                                        <span
                                                            aria-hidden="true"
                                                            className={`sc-toggle-knob ${
                                                                comp.status === "active"
                                                                    ? "sc-toggle-knob-active"
                                                                    : "sc-toggle-knob-inactive"
                                                            }`}
                                                        />
                                                    )}
                                                </button>
                                                <span className={`sc-status sc-status-${comp.status}`}>
                                                    {comp.status}
                                                </span>
                                            </div>
                                        </div>
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
            <SalaryComponentStatusModal
                isOpen={statusModalOpen}
                onClose={closeStatusModal}
                component={statusTargetComponent}
                targetStatus={targetStatus}
                onConfirm={handleConfirmStatusChange}
                submitting={statusSubmitting}
            />
        </div>
    );
}