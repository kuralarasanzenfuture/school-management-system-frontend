import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployeeLeaveTypes } from "../../../../redux/employeeLeaveType/employeeLeaveTypeSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import LeaveTypeTable from "../components/LeaveTypeTable.jsx";
import LeaveTypeModal from "../components/LeaveTypeModal.jsx";
import DeleteLeaveTypeModal from "../components/DeleteLeaveTypeModal.jsx";
import "../styles/LeaveType.css";
import {
    FileText, Plus, Search, List, LayoutGrid,
    CheckCircle, XCircle, DollarSign, RotateCcw,
    Pencil, Trash2, Check, X,
} from "lucide-react";

/* ── Stat card ── */
function StatCard({ icon: Icon, iconBgClass, iconColorClass, value, label }) {
    return (
        <div className="lt-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
            <div className={`${iconBgClass} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className={iconColorClass} />
            </div>
            <div>
                <p className="lt-stat-value text-xl font-bold leading-none">{value}</p>
                <p className="lt-stat-label text-[12.5px] mt-1">{label}</p>
            </div>
        </div>
    );
}

/* ── Boolean pill (for grid cards) ── */
function BoolPill({ value, yesLabel = "Yes", noLabel = "No" }) {
    return (
        <span className={`lt-pill ${value ? "lt-pill-yes" : "lt-pill-no"}`}>
            {value ? <Check size={11} /> : <X size={11} />}
            {value ? yesLabel : noLabel}
        </span>
    );
}

export default function LeaveTypePage() {
    const dispatch = useDispatch();

    // const { leaveTypes, loading, error } = useSelector((state) => state.leaveTypes);
    const { employeeLeaveTypes: leaveTypes, loading, error } = useSelector(
        (state) => state.employeeLeaveTypes
    );
    const { user } = useSelector((state) => state.auth);
    const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const schoolId = isAdmin ? null : user?.school_id;

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [paidFilter, setPaidFilter] = useState("All");
    const [selectedSchool, setSelectedSchool] = useState("");
    const [viewMode, setViewMode] = useState("table");

    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    /* ── Fetch ── */
    useEffect(() => { dispatch(fetchEmployeeLeaveTypes()); }, [dispatch]);
    useEffect(() => {
        if (isAdmin && schools.length === 0) dispatch(fetchSchools());
    }, [dispatch, isAdmin, schools.length]);

    /* ── Filter ── */
    const filtered = useMemo(() => {
        let result = leaveTypes ?? [];

        // School
        result = result.filter((lt) =>
            isAdmin
                ? selectedSchool ? String(lt.school_id) === String(selectedSchool) : true
                : String(lt.school_id) === String(schoolId),
        );

        // Status
        if (statusFilter !== "All")
            result = result.filter((lt) => lt.status === statusFilter);

        // Paid
        if (paidFilter !== "All")
            result = result.filter((lt) =>
                paidFilter === "Paid" ? Boolean(Number(lt.is_paid)) : !Boolean(Number(lt.is_paid)),
            );

        // Search
        const query = searchQuery.trim().toLowerCase();
        if (query)
            result = result.filter(
                (lt) =>
                    lt.name.toLowerCase().includes(query) ||
                    lt.code.toLowerCase().includes(query) ||
                    (lt.description ?? "").toLowerCase().includes(query),
            );

        return result;
    }, [leaveTypes, isAdmin, schoolId, selectedSchool, statusFilter, paidFilter, searchQuery]);

    /* ── Stat counts ── */
    const totalCount = leaveTypes.length;
    const activeCount = leaveTypes.filter((lt) => lt.status === "active").length;
    const paidCount = leaveTypes.filter((lt) => Boolean(Number(lt.is_paid))).length;
    const carryFwdCount = leaveTypes.filter((lt) => Boolean(Number(lt.carry_forward))).length;

    /* ── Handlers ── */
    const handleSearch = (e) => setSearchQuery(e.target.value);
    const handleSchool = (e) => setSelectedSchool(e.target.value);

    const openAddModal = () => { setEditTarget(null); setShowModal(true); };
    const openEditModal = (lt) => { setEditTarget(lt); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditTarget(null); };

    const effectiveSchoolId = isAdmin
        ? (selectedSchool ? Number(selectedSchool) : null)
        : schoolId;

    return (
        <div className="lt-page min-h-screen p-5 sm:p-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="lt-title text-2xl font-bold">Leave Types</h1>
                    <p className="lt-subtitle text-[13.5px] mt-1">
                        Configure leave categories, entitlements and policies.
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="lt-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors active:scale-[0.97] shadow-sm"
                >
                    <Plus size={16} /> Add Leave Type
                </button>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={FileText} iconBgClass="lt-icon-total-bg" iconColorClass="lt-icon-total" value={totalCount} label="Total types" />
                <StatCard icon={CheckCircle} iconBgClass="lt-icon-active-bg" iconColorClass="lt-icon-active" value={activeCount} label="Active" />
                <StatCard icon={DollarSign} iconBgClass="lt-icon-paid-bg" iconColorClass="lt-icon-paid" value={paidCount} label="Paid leaves" />
                <StatCard icon={RotateCcw} iconBgClass="lt-icon-unpaid-bg" iconColorClass="lt-icon-unpaid" value={carryFwdCount} label="Carry forward" />
            </div>

            {/* ── Filter bar ── */}
            <div className="lt-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-6">
                {/* Search */}
                <div className="lt-search-wrap flex items-center gap-2 flex-1 min-w-[180px] rounded-lg px-3 py-2.5">
                    <Search size={15} className="lt-search-icon shrink-0" />
                    <input
                        className="lt-search-input text-[13.5px]"
                        placeholder="Search by name or code…"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                {/* Admin school filter */}
                {isAdmin && (
                    <select value={selectedSchool} onChange={handleSchool} disabled={schoolsLoading}
                        className="lt-select rounded-lg px-3.5 py-2.5 text-[13.5px] min-w-[200px]">
                        <option value="">All Schools</option>
                        {schools.map((school) => (
                            <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                    </select>
                )}

                {/* Status filter */}
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="lt-select rounded-lg px-3.5 py-2.5 text-[13.5px]">
                    <option value="All">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                {/* Paid filter */}
                <select value={paidFilter} onChange={(e) => setPaidFilter(e.target.value)}
                    className="lt-select rounded-lg px-3.5 py-2.5 text-[13.5px]">
                    <option value="All">All Types</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                </select>

                {/* Count + view toggle */}
                <div className="ml-auto flex items-center gap-3">
                    <span className="lt-count-text text-[12.5px]">
                        {filtered.length === 0 ? "No results" : `${filtered.length} type${filtered.length === 1 ? "" : "s"}`}
                    </span>
                    <div className="lt-toggle-group flex rounded-lg overflow-hidden">
                        <button onClick={() => setViewMode("table")}
                            className={`p-2 ${viewMode === "table" ? "lt-toggle-btn-active" : "lt-toggle-btn"}`}>
                            <List size={15} />
                        </button>
                        <button onClick={() => setViewMode("grid")}
                            className={`p-2 ${viewMode === "grid" ? "lt-toggle-btn-active" : "lt-toggle-btn"}`}>
                            <LayoutGrid size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="lt-table-card rounded-2xl p-12 text-center">
                    <p className="lt-cell-muted text-[14px]">Loading leave types…</p>
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="lt-table-card rounded-2xl p-12 text-center">
                    <p className="lt-field-error text-[14px]">{error}</p>
                </div>
            )}

            {/* ── TABLE view ── */}
            {!loading && !error && viewMode === "table" && (
                <LeaveTypeTable
                    leaveTypes={filtered}
                    onEdit={openEditModal}
                    onDelete={(lt) => setDeleteTarget(lt)}
                    showSchoolColumn={isAdmin}
                />
            )}

            {/* ── GRID view ── */}
            {!loading && !error && viewMode === "grid" && (
                <>
                    {filtered.length === 0 ? (
                        <div className="lt-table-card rounded-2xl p-12 text-center">
                            <p className="lt-empty-state text-[13.5px]">No leave types found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map((lt) => (
                                <div key={lt.id} className="lt-card rounded-2xl p-5 flex flex-col gap-3">

                                    {/* Card header */}
                                    <div className="lt-card-header-bar flex items-start justify-between pb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="lt-code">{lt.code}</span>
                                                <span className={`lt-status lt-status-${lt.status}`}>{lt.status}</span>
                                            </div>
                                            <p className="lt-cell-primary text-[14px] font-bold leading-tight">{lt.name}</p>
                                            {lt.description && (
                                                <p className="lt-cell-muted text-[12px] mt-1 line-clamp-2 leading-relaxed">
                                                    {lt.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 ml-2 shrink-0">
                                            <button onClick={() => openEditModal(lt)}
                                                className="lt-action-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors">
                                                <Pencil size={13} />
                                            </button>
                                            <button onClick={() => setDeleteTarget(lt)}
                                                className="lt-action-btn lt-action-btn-danger w-7 h-7 rounded-lg flex items-center justify-center transition-colors">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Days info */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="lt-card-stat-label text-[11px] uppercase tracking-wide mb-0.5">Days / Year</p>
                                            <p className="lt-card-stat-value text-[18px] font-bold">{lt.days_per_year}</p>
                                        </div>
                                        <div>
                                            <p className="lt-card-stat-label text-[11px] uppercase tracking-wide mb-0.5">Max / Request</p>
                                            <p className="lt-card-stat-value text-[18px] font-bold">
                                                {lt.max_days_per_request ?? "—"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="lt-card-divider h-px" />

                                    {/* Pills */}
                                    <div className="flex flex-wrap gap-1.5">
                                        <BoolPill value={Boolean(Number(lt.is_paid))} yesLabel="Paid" noLabel="Unpaid" />
                                        <BoolPill value={Boolean(Number(lt.carry_forward))} yesLabel="Carry Fwd" noLabel="No Carry" />
                                        <BoolPill value={Boolean(Number(lt.allow_half_day))} yesLabel="½ Day" noLabel="Full Only" />
                                        <BoolPill value={Boolean(Number(lt.requires_approval))} yesLabel="Approval" noLabel="Auto" />
                                    </div>

                                    {/* Gender + carry forward days */}
                                    <div className="flex items-center justify-between mt-auto pt-1">
                                        <span className={`lt-pill lt-gender-${lt.applicable_gender ?? "all"} text-[11.5px]`}>
                                            {lt.applicable_gender === "all" ? "All genders" :
                                                lt.applicable_gender === "male" ? "Male only" : "Female only"}
                                        </span>
                                        {Boolean(Number(lt.carry_forward)) && Number(lt.max_carry_forward_days) > 0 && (
                                            <span className="lt-cell-muted text-[11.5px]">
                                                Max carry: {lt.max_carry_forward_days}d
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ── Modals ── */}
            <LeaveTypeModal
                isOpen={showModal}
                onClose={closeModal}
                leaveType={editTarget}
                schoolId={effectiveSchoolId}
            />
            <DeleteLeaveTypeModal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                leaveType={deleteTarget}
            />
        </div>
    );
}