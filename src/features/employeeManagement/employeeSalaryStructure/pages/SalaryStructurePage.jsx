import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchEmployeeSalaryStructures,
} from "../../../../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
import { fetchEmployees } from "../../../../redux/employee/employeeSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import SalaryStructureTable from "../components/SalaryStructureTable.jsx";
import SalaryStructureModal from "../components/SalaryStructureModal.jsx";
import DeleteSalaryStructureModal from "../components/DeleteSalaryStructureModal.jsx";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import { getFullImageUrl } from "../../../../config/env.js";
import "../styles/SalaryStructure.css";
import {
    LayoutList, Plus, Search, List, LayoutGrid,
    CheckCircle, XCircle, Users, Building2, Calendar,
    Pencil, Trash2, CalendarDays, CalendarCheck2, X, RefreshCw, Eye,
} from "lucide-react";

const STATUS_OPTIONS = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const VALIDITY_OPTIONS = [
    { value: "", label: "All Validity" },
    { value: "current", label: "Currently Effective" },
    { value: "upcoming", label: "Upcoming" },
    { value: "expired", label: "Expired / Ended" },
];

/* ── Format date helper ── */
function formatDate(value) {
    if (!value) return null;
    const dateObj = new Date(value);
    if (isNaN(dateObj)) return null;
    return dateObj.toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

function getInitials(firstName, lastName) {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function getValidityState(structure) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const from = new Date(structure.effective_from);
    if (isNaN(from)) return "unknown";
    from.setHours(0, 0, 0, 0);

    if (today < from) return "upcoming";

    if (!structure.effective_to) return "current";
    const to = new Date(structure.effective_to);
    if (isNaN(to)) return "current";
    to.setHours(23, 59, 59, 999);

    if (today > to) return "expired";
    return "current";
}

/* ── Stat card ── */
function StatCard({ icon: Icon, iconBgClass, iconColorClass, value, label }) {
    return (
        <div className="ss-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
            <div className={`${iconBgClass} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className={iconColorClass} />
            </div>
            <div>
                <p className="ss-stat-value text-xl font-bold leading-none">{value}</p>
                <p className="ss-stat-label text-[12.5px] mt-1">{label}</p>
            </div>
        </div>
    );
}

export default function SalaryStructurePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { employeeSalaryStructures: structures, loading, error } = useSelector(
        (state) => state.employeeSalaryStructure,
    );
    const { user } = useSelector((state) => state.auth);
    const employees = useSelector((state) => state.employees?.employees ?? []);
    const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

    const isAdmin = Boolean(user?.roles?.includes("ADMIN") || user?.roles?.includes("SUPER_ADMIN") || user?.role === "ADMIN");
    const schoolId = isAdmin ? null : user?.school_id;

    /* ── Local filter state ── */
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [validityFilter, setValidityFilter] = useState("");
    const [designationFilter, setDesignationFilter] = useState("");
    const [selectedSchool, setSelectedSchool] = useState("");
    const [viewMode, setViewMode] = useState("table");

    /* ── Modal state ── */
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    /* ── School Options ── */
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

    /* ── Fetch: passes school_id parameter to backend ── */
    useEffect(() => {
        const params = {};
        if (isAdmin && selectedSchool) {
            params.school_id = selectedSchool;
        } else if (!isAdmin && schoolId) {
            params.school_id = schoolId;
        }
        dispatch(fetchEmployeeSalaryStructures(params));
    }, [dispatch, isAdmin, schoolId, selectedSchool]);

    useEffect(() => {
        dispatch(fetchEmployees());
    }, [dispatch]);

    useEffect(() => {
        if (isAdmin && schoolList.length === 0) dispatch(fetchSchools());
    }, [dispatch, isAdmin, schoolList.length]);

    /* ── Lookup map for employees by ID ── */
    const employeeMap = useMemo(() => {
        const map = new Map();
        const raw = Array.isArray(employees)
            ? employees
            : employees?.employees || employees?.data || [];
        if (Array.isArray(raw)) {
            raw.forEach((emp) => {
                if (emp?.id != null) {
                    map.set(String(emp.id), emp);
                }
            });
        }
        return map;
    }, [employees]);

    /* ── Robust school matching (checks ID, nested relations, and school_name) ── */
    const matchSchool = (s, targetSchoolId) => {
        if (!targetSchoolId) return true;
        if (s.school_id != null && String(s.school_id) === String(targetSchoolId)) return true;
        if (s.schoolId != null && String(s.schoolId) === String(targetSchoolId)) return true;
        if (s.school?.id != null && String(s.school.id) === String(targetSchoolId)) return true;
        if (s.employee?.school_id != null && String(s.employee.school_id) === String(targetSchoolId)) return true;

        const targetSchoolObj = schoolList.find((sch) => String(sch.id) === String(targetSchoolId));
        if (targetSchoolObj?.name && s.school_name) {
            if (s.school_name.trim().toLowerCase() === targetSchoolObj.name.trim().toLowerCase()) {
                return true;
            }
        }
        return false;
    };

    /* ── Stat counts (scoped by school) ── */
    const scoped = useMemo(() => {
        const raw = Array.isArray(structures)
            ? structures
            : structures?.data || structures?.structures || [];
        return raw.filter((s) =>
            isAdmin
                ? matchSchool(s, selectedSchool)
                : matchSchool(s, schoolId),
        );
    }, [structures, isAdmin, schoolId, selectedSchool, schoolList]);

    const totalCount = scoped.length;
    const activeCount = scoped.filter((s) => s.status === "active").length;
    const inactiveCount = scoped.filter((s) => s.status === "inactive").length;
    const uniqueEmps = new Set(scoped.map((s) => s.employee_id)).size;

    /* ── Dynamic Designation Options ── */
    const designationOptions = useMemo(() => {
        const set = new Set();
        scoped.forEach((s) => {
            if (s.designation) set.add(s.designation);
        });
        return [
            { value: "", label: "All Designations" },
            ...Array.from(set).sort().map((d) => ({ value: d, label: d })),
        ];
    }, [scoped]);

    /* ── Filtered list ── */
    const filtered = useMemo(() => {
        let result = scoped;

        /* status */
        if (statusFilter && statusFilter !== "All") {
            result = result.filter((s) => s.status === statusFilter);
        }

        /* validity */
        if (validityFilter && validityFilter !== "All") {
            result = result.filter((s) => getValidityState(s) === validityFilter);
        }

        /* designation */
        if (designationFilter && designationFilter !== "All") {
            result = result.filter((s) => s.designation === designationFilter);
        }

        /* search by employee name, code, designation, structure name, or remarks */
        const query = searchQuery.trim().toLowerCase();
        if (query) {
            result = result.filter(
                (s) =>
                    `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase().includes(query) ||
                    (s.structure_name || "").toLowerCase().includes(query) ||
                    (s.designation || "").toLowerCase().includes(query) ||
                    (s.employee_code || "").toLowerCase().includes(query) ||
                    (s.remarks || "").toLowerCase().includes(query),
            );
        }

        return result;
    }, [scoped, statusFilter, validityFilter, designationFilter, searchQuery]);

    /* ── Handlers ── */
    const handleSearch = (e) => setSearchQuery(e.target.value);

    const openAddModal = () => { setEditTarget(null); setShowModal(true); };
    const openEditModal = (s) => { setEditTarget(s); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditTarget(null); };

    return (
        <div className="ss-page min-h-screen p-5 sm:p-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="ss-title text-2xl font-bold">Salary Structures</h1>
                    <p className="ss-subtitle text-[13.5px] mt-1">
                        Assign and manage salary structures for employees.
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="ss-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors active:scale-[0.97] shadow-sm"
                >
                    <Plus size={16} /> Add Structure
                </button>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={LayoutList} iconBgClass="ss-icon-total-bg" iconColorClass="ss-icon-total" value={totalCount} label="Total structures" />
                <StatCard icon={CheckCircle} iconBgClass="ss-icon-active-bg" iconColorClass="ss-icon-active" value={activeCount} label="Active" />
                <StatCard icon={XCircle} iconBgClass="ss-icon-inactive-bg" iconColorClass="ss-icon-inactive" value={inactiveCount} label="Inactive" />
                <StatCard icon={Users} iconBgClass="ss-icon-school-bg" iconColorClass="ss-icon-school" value={uniqueEmps} label="Employees" />
            </div>

            {/* ── Filter bar ── */}
            <div className="ss-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-6">

                {/* Search */}
                <div className="ss-search-wrap flex items-center gap-2 flex-1 min-w-[200px] rounded-lg px-3 py-2.5">
                    <Search size={15} className="ss-search-icon shrink-0" />
                    <input
                        className="ss-search-input text-[13.5px]"
                        placeholder="Search by employee name, code, structure…"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
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
                        className="min-w-[190px]"
                    />
                )}

                {/* Designation filter */}
                {designationOptions.length > 1 && (
                    <CustomDropdown
                        options={designationOptions}
                        value={designationFilter}
                        onChange={(val) => setDesignationFilter(val)}
                        placeholder="All Designations"
                        searchable={designationOptions.length > 5}
                        searchPlaceholder="Search designation…"
                        className="min-w-[170px]"
                    />
                )}

                {/* Validity filter */}
                <CustomDropdown
                    options={VALIDITY_OPTIONS}
                    value={validityFilter}
                    onChange={(val) => setValidityFilter(val)}
                    placeholder="All Validity"
                    className="min-w-[155px]"
                />

                {/* Status filter */}
                <CustomDropdown
                    options={STATUS_OPTIONS}
                    value={statusFilter}
                    onChange={(val) => setStatusFilter(val)}
                    placeholder="All Statuses"
                    className="min-w-[140px]"
                />

                {/* Count + view toggle */}
                <div className="ml-auto flex items-center gap-3">
                    <span className="ss-count-text text-[12.5px]">
                        {filtered.length === 0
                            ? "No results"
                            : `${filtered.length} structure${filtered.length === 1 ? "" : "s"}`}
                    </span>
                    <div className="ss-toggle-group flex rounded-lg overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setViewMode("table")}
                            title="Table view"
                            className={`p-2 transition-colors ${viewMode === "table" ? "ss-toggle-btn-active" : "ss-toggle-btn"}`}
                        >
                            <List size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            title="Grid card view"
                            className={`p-2 transition-colors ${viewMode === "grid" ? "ss-toggle-btn-active" : "ss-toggle-btn"}`}
                        >
                            <LayoutGrid size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="ss-table-card rounded-2xl p-12 text-center">
                    <div className="w-10 h-10 border-2 border-[var(--btn-bg)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="ss-cell-muted text-[14px]">Loading salary structures…</p>
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="ss-table-card rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                        <XCircle size={28} className="text-red-600 dark:text-red-400" />
                    </div>

                    <h3 className="text-lg font-semibold ss-text-primary mb-2">
                        Failed to load salary structures
                    </h3>

                    <p className="ss-field-error text-sm mb-5 max-w-md">
                        {error}
                    </p>

                    <button
                        onClick={() => dispatch(fetchEmployeeSalaryStructures())}
                        className="ss-btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <RefreshCw size={15} />
                        Retry
                    </button>
                </div>
            )}

            {/* ── TABLE view ── */}
            {!loading && !error && viewMode === "table" && (
                <SalaryStructureTable
                    structures={filtered}
                    onView={(s) => navigate(`/employee-salary-structures/view/${s.id}`)}
                    onEdit={openEditModal}
                    onDelete={(s) => setDeleteTarget(s)}
                    showSchoolColumn={isAdmin && !selectedSchool}
                    employeeMap={employeeMap}
                />
            )}

            {/* ── GRID view ── */}
            {!loading && !error && viewMode === "grid" && (
                <>
                    {filtered.length === 0 ? (
                        <div className="ss-table-card rounded-2xl p-12 text-center">
                            <p className="ss-empty-state text-[13.5px]">No salary structures found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map((structure) => {
                                const validity = getValidityState(structure);
                                const isEnded = structure.effective_to && validity === "expired";
                                return (
                                    <div
                                        key={structure.id}
                                        className="ss-card rounded-2xl p-5 flex flex-col justify-between gap-4"
                                    >
                                        {/* Top Section */}
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className={`ss-status ss-status-${structure.status}`}>
                                                        {structure.status}
                                                    </span>
                                                    {validity === "current" && (
                                                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                            Effective
                                                        </span>
                                                    )}
                                                    {validity === "upcoming" && (
                                                        <span className="text-[11px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                            Upcoming
                                                        </span>
                                                    )}
                                                    {validity === "expired" && (
                                                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded-full">
                                                            Ended
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => navigate(`/employee-salary-structures/view/${structure.id}`)}
                                                        className="ss-action-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                                        title="View Details & Components"
                                                    >
                                                        <Eye size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(structure)}
                                                        className="ss-action-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                                        title="Edit Structure"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(structure)}
                                                        className="ss-action-btn ss-action-btn-danger w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                                        title="Delete Structure"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Employee info */}
                                            <div className="flex items-center gap-3 mb-2.5">
                                                {(() => {
                                                    const emp = employeeMap.get(String(structure.employee_id));
                                                    const rawPhoto =
                                                        structure.photo_url ||
                                                        structure.passport_size_photo_url ||
                                                        structure.profile_image ||
                                                        structure.photo ||
                                                        structure.avatar ||
                                                        structure.image ||
                                                        emp?.photo_url ||
                                                        emp?.passport_size_photo_url ||
                                                        emp?.profile_image ||
                                                        emp?.photo ||
                                                        emp?.avatar;
                                                    const photoUrl = rawPhoto ? getFullImageUrl(rawPhoto) : null;
                                                    const initials = getInitials(structure.first_name, structure.last_name);
                                                    return (
                                                        <div className="ss-avatar w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 overflow-hidden relative">
                                                            {photoUrl ? (
                                                                <img
                                                                    src={photoUrl}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = "none";
                                                                        const fb = e.currentTarget.parentElement?.querySelector(".grid-avatar-fb");
                                                                        if (fb) fb.style.display = "flex";
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <span
                                                                className="grid-avatar-fb w-full h-full items-center justify-center"
                                                                style={{ display: photoUrl ? "none" : "flex" }}
                                                            >
                                                                {initials}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                                <div className="min-w-0">
                                                    <p className="ss-cell-primary text-[14px] font-bold leading-tight truncate">
                                                        {structure.first_name} {structure.last_name ?? ""}
                                                    </p>
                                                    {structure.designation && (
                                                        <span className="ss-designation mt-1 inline-block truncate max-w-[170px]">
                                                            {structure.designation}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Structure name */}
                                            <div className="mt-2">
                                                <p className="ss-structure-name text-[13px] truncate">
                                                    {structure.structure_name}
                                                </p>
                                                {isAdmin && structure.school_name && !selectedSchool && (
                                                    <p className="ss-cell-muted text-[11.5px] mt-0.5 truncate">
                                                        {structure.school_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom section: Dates & remarks */}
                                        <div className="pt-3 border-t border-[var(--divider)] flex flex-col gap-1.5 text-[12px]">
                                            <div className="flex items-center justify-between text-[var(--text-secondary)]">
                                                <span className="inline-flex items-center gap-1 text-[var(--text-muted)] text-[11.5px]">
                                                    <CalendarDays size={13} /> From
                                                </span>
                                                <span className="font-medium">
                                                    {formatDate(structure.effective_from) ?? "—"}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-[var(--text-secondary)]">
                                                <span className="inline-flex items-center gap-1 text-[var(--text-muted)] text-[11.5px]">
                                                    <CalendarCheck2 size={13} /> To
                                                </span>
                                                <span className={`font-medium ${isEnded ? "ss-date-chip-ended" : "ss-date-chip-active"}`}>
                                                    {structure.effective_to ? formatDate(structure.effective_to) : "Open-ended"}
                                                </span>
                                            </div>

                                            {structure.remarks && (
                                                <p className="ss-cell-muted text-[11px] mt-1 truncate italic">
                                                    {structure.remarks}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* ── Modals ── */}
            <SalaryStructureModal
                isOpen={showModal}
                onClose={closeModal}
                structure={editTarget}
            />
            <DeleteSalaryStructureModal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                structure={deleteTarget}
            />
        </div>
    );
}