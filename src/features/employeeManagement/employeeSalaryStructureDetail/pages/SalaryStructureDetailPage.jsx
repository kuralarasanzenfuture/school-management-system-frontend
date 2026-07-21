import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchEmployeeSalaryStructureDetails,
} from "../../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";
import SalaryStructureDetailTable from "../components/SalaryStructureDetailTable.jsx";
import SalaryStructureDetailModal from "../components/SalaryStructureDetailModal.jsx";
import DeleteSalaryStructureDetailModal from "../components/DeleteSalaryStructureDetailModal.jsx";
import "../styles/SalaryStructureDetail.css";
import {
    IndianRupee, Plus, Search,
    TrendingUp, TrendingDown, LayoutList, Percent,
} from "lucide-react";

/* ── Stat card ── */
function StatCard({ icon: Icon, iconBgClass, iconColorClass, value, label }) {
    return (
        <div className="ssd-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
            <div className={`${iconBgClass} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className={iconColorClass} />
            </div>
            <div>
                <p className="ssd-stat-value text-xl font-bold leading-none">{value}</p>
                <p className="ssd-stat-label text-[12.5px] mt-1">{label}</p>
            </div>
        </div>
    );
}

export default function SalaryStructureDetailPage() {
    const dispatch = useDispatch();

    const { employeeSalaryStructureDetails: details, loading, error } = useSelector(
        (state) => state.employeeSalaryStructureDetails,
    );
    const structures = useSelector((state) => state.employeeSalaryStructure?.employeeSalaryStructures ?? []);

    /* ── Filter state ── */
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [calcFilter, setCalcFilter] = useState("All");
    const [structureFilter, setStructureFilter] = useState("");

    /* ── Modal state ── */
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    /* ── Fetch ── */
    useEffect(() => {
        dispatch(fetchEmployeeSalaryStructureDetails());
    }, [dispatch]);

    /* ── Filtered list ── */
    const filtered = useMemo(() => {
        let result = details ?? [];

        if (structureFilter)
            result = result.filter((d) => String(d.salary_structure_id) === String(structureFilter));

        if (typeFilter !== "All")
            result = result.filter((d) => d.component_type === typeFilter);

        if (calcFilter !== "All")
            result = result.filter((d) => d.calculation_type === calcFilter);

        const query = searchQuery.trim().toLowerCase();
        if (query)
            result = result.filter(
                (d) =>
                    d.component_name?.toLowerCase().includes(query) ||
                    d.structure_name?.toLowerCase().includes(query),
            );

        return result;
    }, [details, structureFilter, typeFilter, calcFilter, searchQuery]);

    /* ── Stat counts ── */
    const allDetails = details ?? [];
    const totalCount = allDetails.length;
    const earningCount = allDetails.filter((d) => d.component_type === "earning").length;
    const deductCount = allDetails.filter((d) => d.component_type === "deduction").length;
    const percentCount = allDetails.filter((d) => d.calculation_type === "percentage").length;

    /* ── Handlers ── */
    const handleSearch = (e) => setSearchQuery(e.target.value);

    const openAddModal = () => { setEditTarget(null); setShowModal(true); };
    const openEditModal = (d) => { setEditTarget(d); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditTarget(null); };

    return (
        <div className="ssd-page min-h-screen p-5 sm:p-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="ssd-title text-2xl font-bold">Salary Structure Details</h1>
                    <p className="ssd-subtitle text-[13.5px] mt-1">
                        Manage salary components assigned to each salary structure.
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="ssd-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors active:scale-[0.97] shadow-sm"
                >
                    <Plus size={16} /> Add Detail
                </button>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={LayoutList} iconBgClass="ssd-icon-total-bg" iconColorClass="ssd-icon-total" value={totalCount} label="Total details" />
                <StatCard icon={TrendingUp} iconBgClass="ssd-icon-earning-bg" iconColorClass="ssd-icon-earning" value={earningCount} label="Earnings" />
                <StatCard icon={TrendingDown} iconBgClass="ssd-icon-deduction-bg" iconColorClass="ssd-icon-deduction" value={deductCount} label="Deductions" />
                <StatCard icon={Percent} iconBgClass="ssd-icon-total-bg" iconColorClass="ssd-icon-total" value={percentCount} label="% Based" />
            </div>

            {/* ── Filter bar ── */}
            <div className="ssd-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-6">

                {/* Search */}
                <div className="ssd-search-wrap flex items-center gap-2 flex-1 min-w-[180px] rounded-lg px-3 py-2.5">
                    <Search size={15} className="ssd-search-icon shrink-0" />
                    <input
                        className="ssd-search-input text-[13.5px]"
                        placeholder="Search by component or structure name…"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                {/* Structure filter */}
                <select
                    value={structureFilter}
                    onChange={(e) => setStructureFilter(e.target.value)}
                    className="ssd-select rounded-lg px-3.5 py-2.5 text-[13.5px] min-w-[220px]"
                >
                    <option value="">All Structures</option>
                    {structures.map((s) => (
                        <option key={s.id} value={s.id}>{s.structure_name}</option>
                    ))}
                </select>

                {/* Component type filter */}
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="ssd-select rounded-lg px-3.5 py-2.5 text-[13.5px]"
                >
                    <option value="All">All Types</option>
                    <option value="earning">Earning</option>
                    <option value="deduction">Deduction</option>
                    <option value="benefit">Benefit</option>
                </select>

                {/* Calc type filter */}
                <select
                    value={calcFilter}
                    onChange={(e) => setCalcFilter(e.target.value)}
                    className="ssd-select rounded-lg px-3.5 py-2.5 text-[13.5px]"
                >
                    <option value="All">All Calc Types</option>
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                </select>

                <span className="ssd-count-text text-[12.5px] ml-auto">
                    {filtered.length === 0
                        ? "No results"
                        : `${filtered.length} detail${filtered.length === 1 ? "" : "s"}`}
                </span>
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="ssd-table-card rounded-2xl p-12 text-center">
                    <p className="ssd-cell-muted text-[14px]">Loading salary details…</p>
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="ssd-table-card rounded-2xl p-12 text-center">
                    <p className="ssd-field-error text-[14px]">{error}</p>
                </div>
            )}

            {/* ── Table ── */}
            {!loading && !error && (
                <SalaryStructureDetailTable
                    details={filtered}
                    onEdit={openEditModal}
                    onDelete={(d) => setDeleteTarget(d)}
                    showStructureColumn={!structureFilter}
                />
            )}

            {/* ── Modals ── */}
            <SalaryStructureDetailModal
                isOpen={showModal}
                onClose={closeModal}
                detail={editTarget}
                structureId={structureFilter || null}
            />
            <DeleteSalaryStructureDetailModal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                detail={deleteTarget}
            />
        </div>
    );
}