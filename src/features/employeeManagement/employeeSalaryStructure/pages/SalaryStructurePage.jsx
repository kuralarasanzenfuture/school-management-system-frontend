import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchEmployeeSalaryStructures,
} from "../../../../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import SalaryStructureTable from "../components/SalaryStructureTable.jsx";
import SalaryStructureModal from "../components/SalaryStructureModal.jsx";
import DeleteSalaryStructureModal from "../components/DeleteSalaryStructureModal.jsx";
import "../styles/SalaryStructure.css";
import {
    LayoutList, Plus, Search,
    CheckCircle, XCircle, Users, Building2,
} from "lucide-react";

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

    const { employeeSalaryStructures: structures, loading, error } = useSelector(
        (state) => state.employeeSalaryStructure,
    );
    const { user } = useSelector((state) => state.auth);
    const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const schoolId = isAdmin ? null : user?.school_id;

    /* ── Filter state ── */
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedSchool, setSelectedSchool] = useState("");

    /* ── Modal state ── */
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    /* ── Fetch ── */
    useEffect(() => {
        dispatch(fetchEmployeeSalaryStructures());
    }, [dispatch]);

    useEffect(() => {
        if (isAdmin && schools.length === 0) dispatch(fetchSchools());
    }, [dispatch, isAdmin, schools.length]);

    /* ── Filtered list ── */
    const filtered = useMemo(() => {
        let result = structures ?? [];

        /* school scope */
        result = result.filter((s) =>
            isAdmin
                ? selectedSchool
                    ? String(s.school_id) === String(selectedSchool)
                    : true
                : String(s.school_id) === String(schoolId),
        );

        /* status */
        if (statusFilter !== "All")
            result = result.filter((s) => s.status === statusFilter);

        /* search by employee name or structure name */
        const query = searchQuery.trim().toLowerCase();
        if (query)
            result = result.filter(
                (s) =>
                    `${s.first_name} ${s.last_name}`.toLowerCase().includes(query) ||
                    s.structure_name.toLowerCase().includes(query) ||
                    (s.designation ?? "").toLowerCase().includes(query) ||
                    (s.remarks ?? "").toLowerCase().includes(query),
            );

        return result;
    }, [structures, isAdmin, schoolId, selectedSchool, statusFilter, searchQuery]);

    /* ── Stat counts (scoped by school) ── */
    const scoped = useMemo(() =>
        (structures ?? []).filter((s) =>
            isAdmin
                ? selectedSchool ? String(s.school_id) === String(selectedSchool) : true
                : String(s.school_id) === String(schoolId),
        ),
        [structures, isAdmin, schoolId, selectedSchool],
    );

    const totalCount = scoped.length;
    const activeCount = scoped.filter((s) => s.status === "active").length;
    const inactiveCount = scoped.filter((s) => s.status === "inactive").length;
    const uniqueEmps = new Set(scoped.map((s) => s.employee_id)).size;

    /* ── Handlers ── */
    const handleSearch = (e) => setSearchQuery(e.target.value);
    const handleSchoolChange = (e) => { setSelectedSchool(e.target.value); setSearchQuery(""); };

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
                <div className="ss-search-wrap flex items-center gap-2 flex-1 min-w-[180px] rounded-lg px-3 py-2.5">
                    <Search size={15} className="ss-search-icon shrink-0" />
                    <input
                        className="ss-search-input text-[13.5px]"
                        placeholder="Search by employee name or structure…"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                {/* Admin school filter */}
                {isAdmin && (
                    <select
                        value={selectedSchool}
                        onChange={handleSchoolChange}
                        disabled={schoolsLoading}
                        className="ss-select rounded-lg px-3.5 py-2.5 text-[13.5px] min-w-[200px]"
                    >
                        <option value="">All Schools</option>
                        {schools.map((school) => (
                            <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                    </select>
                )}

                {/* Status filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="ss-select rounded-lg px-3.5 py-2.5 text-[13.5px]"
                >
                    <option value="All">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                {/* Count */}
                <span className="ss-count-text text-[12.5px] ml-auto">
                    {filtered.length === 0
                        ? "No results"
                        : `${filtered.length} structure${filtered.length === 1 ? "" : "s"}`}
                </span>
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="ss-table-card rounded-2xl p-12 text-center">
                    <p className="ss-cell-muted text-[14px]">Loading salary structures…</p>
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="ss-table-card rounded-2xl p-12 text-center">
                    <p className="ss-field-error text-[14px]">{error}</p>
                </div>
            )}

            {/* ── Table ── */}
            {!loading && !error && (
                <SalaryStructureTable
                    structures={filtered}
                    onEdit={openEditModal}
                    onDelete={(s) => setDeleteTarget(s)}
                    showSchoolColumn={isAdmin && !selectedSchool}
                />
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