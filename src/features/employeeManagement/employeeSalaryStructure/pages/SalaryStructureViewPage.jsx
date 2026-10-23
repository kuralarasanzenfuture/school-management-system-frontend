import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowLeft, Pencil, Trash2, Plus, Layers,
    TrendingUp, TrendingDown, IndianRupee, Calendar,
    Building2, CheckCircle, XCircle, AlertCircle, RefreshCw,
    ShieldAlert, Sparkles, User, Briefcase, FileText
} from "lucide-react";
import api from "../../../../common/services/api.js";
import { getFullImageUrl } from "../../../../config/env.js";
import { fetchEmployees } from "../../../../redux/employee/employeeSlice.js";
import {
    removeEmployeeSalaryStructureDetail,
} from "../../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";
import BulkSalaryDetailsModal from "../components/BulkSalaryDetailsModal.jsx";
import SalaryStructureModal from "../components/SalaryStructureModal.jsx";
import "../styles/SalaryStructure.css";

/* ── Helpers ── */
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
    if (!structure) return "unknown";
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

export default function SalaryStructureViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [structure, setStructure] = useState(null);
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter tab: "all", "earning", "deduction"
    const [activeTab, setActiveTab] = useState("all");

    // Modals
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showEditStructureModal, setShowEditStructureModal] = useState(false);
    const [deleteDetailTarget, setDeleteDetailTarget] = useState(null);
    const [deletingDetail, setDeletingDetail] = useState(false);
    const [deleteDetailError, setDeleteDetailError] = useState(null);

    // Employees lookup map
    const employees = useSelector((state) => state.employees?.employees ?? []);
    useEffect(() => {
        dispatch(fetchEmployees());
    }, [dispatch]);

    const employeeMap = useMemo(() => {
        const map = new Map();
        const raw = Array.isArray(employees) ? employees : employees?.employees || [];
        raw.forEach((e) => {
            if (e?.id != null) map.set(String(e.id), e);
        });
        return map;
    }, [employees]);

    // Load structure and details
    const loadData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            // Fetch structure header
            const structRes = await api.get(`/employee-salary-structures/${id}`);
            const structData = structRes.data?.data || structRes.data?.structure || structRes.data;
            setStructure(structData);

            // Fetch details for this structure
            const detailsRes = await api.get(`/employee-salary-structures-details`, {
                params: { salary_structure_id: id, all: true },
            });
            const detailsData = detailsRes.data?.data || detailsRes.data?.rows || detailsRes.data || [];
            setDetails(Array.isArray(detailsData) ? detailsData : []);
        } catch (err) {
            console.error("Failed to load salary structure view:", err);
            setError(err.response?.data?.message || err.message || "Failed to load salary structure details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Employee photo resolution
    const empFromMap = structure ? employeeMap.get(String(structure.employee_id)) : null;
    const rawPhoto =
        structure?.photo_url ||
        structure?.passport_size_photo_url ||
        structure?.profile_image ||
        structure?.photo ||
        empFromMap?.photo_url ||
        empFromMap?.passport_size_photo_url ||
        empFromMap?.profile_image;
    const photoUrl = rawPhoto ? getFullImageUrl(rawPhoto) : null;
    const initials = getInitials(structure?.first_name, structure?.last_name);

    // Financial Calculation
    const { totalGross, totalDeductions, netSalary, basicPay, calculatedDetails } = useMemo(() => {
        let basic = 0;
        const list = Array.isArray(details) ? [...details] : [];

        // Identify basic pay
        list.forEach((d) => {
            const isBasic = d.component_code?.toLowerCase() === "basic" || d.component_name?.toLowerCase().includes("basic");
            if (isBasic && d.calculation_type === "fixed") {
                basic = Number(d.amount) || 0;
            }
        });

        // Pass 1: Gross earnings
        let gross = basic;
        const calculated = list.map((d) => {
            const isBasic = d.component_code?.toLowerCase() === "basic" || d.component_name?.toLowerCase().includes("basic");
            let monthly = 0;

            if (d.component_type === "earning") {
                if (isBasic) {
                    monthly = basic;
                } else if (d.calculation_type === "fixed") {
                    monthly = Number(d.amount) || 0;
                    gross += monthly;
                } else if (d.calculation_type === "percentage" && d.based_on === "basic") {
                    const pct = Number(d.percentage) || 0;
                    monthly = Math.round((basic * pct) / 100);
                    gross += monthly;
                }
            }

            return { ...d, monthlyAmount: monthly };
        });

        // Pass 2: Gross-based earnings & deductions
        let deductions = 0;
        calculated.forEach((d) => {
            if (d.component_type === "earning" && d.calculation_type === "percentage" && d.based_on === "gross") {
                const pct = Number(d.percentage) || 0;
                d.monthlyAmount = Math.round((gross * pct) / 100);
                gross += d.monthlyAmount;
            } else if (d.component_type === "deduction") {
                if (d.calculation_type === "fixed") {
                    d.monthlyAmount = Number(d.amount) || 0;
                } else if (d.calculation_type === "percentage") {
                    const pct = Number(d.percentage) || 0;
                    const base = d.based_on === "gross" ? gross : basic;
                    d.monthlyAmount = Math.round((base * pct) / 100);
                }
                deductions += d.monthlyAmount;
            }
        });

        const net = Math.max(0, gross - deductions);

        return {
            totalGross: gross,
            totalDeductions: deductions,
            netSalary: net,
            basicPay: basic,
            calculatedDetails: calculated,
        };
    }, [details]);

    // Filter by tab
    const filteredDetails = useMemo(() => {
        if (activeTab === "earning") return calculatedDetails.filter((d) => d.component_type === "earning");
        if (activeTab === "deduction") return calculatedDetails.filter((d) => d.component_type === "deduction");
        return calculatedDetails;
    }, [calculatedDetails, activeTab]);

    const earningsList = calculatedDetails.filter((d) => d.component_type === "earning");
    const deductionsList = calculatedDetails.filter((d) => d.component_type === "deduction");

    const validity = getValidityState(structure);

    // Delete single detail handler
    const handleDeleteDetail = async () => {
        if (!deleteDetailTarget) return;
        setDeletingDetail(true);
        setDeleteDetailError(null);
        try {
            await dispatch(removeEmployeeSalaryStructureDetail(deleteDetailTarget.id)).unwrap();
            setDetails((prev) => prev.filter((d) => d.id !== deleteDetailTarget.id));
            setDeleteDetailTarget(null);
            setDeleteDetailError(null);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                (typeof err === "string" ? err : "Failed to delete component");
            setDeleteDetailError(msg);
        } finally {
            setDeletingDetail(false);
        }
    };

    return (
        <div className="ss-page min-h-screen p-5 sm:p-7">
            {/* ── Top Bar ── */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <button
                    onClick={() => navigate("/employee-salary-structures")}
                    className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Salary Structures
                </button>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={loadData}
                        disabled={loading}
                        className="ss-btn-outline p-2.5 rounded-xl transition-colors hover:text-[var(--text-primary)]"
                        title="Refresh data"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowEditStructureModal(true)}
                        className="ss-btn-outline px-4 py-2.5 rounded-xl text-[13px] font-semibold inline-flex items-center gap-2 transition-colors"
                    >
                        <Pencil size={14} /> Edit Structure
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowBulkModal(true)}
                        className="ss-btn-primary px-4 py-2.5 rounded-xl text-[13px] font-semibold inline-flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-98"
                    >
                        <Layers size={15} /> Bulk Manage Components
                    </button>
                </div>
            </div>

            {/* ── Loading state ── */}
            {loading && !structure && (
                <div className="ss-table-card rounded-3xl p-16 text-center">
                    <div className="w-10 h-10 border-2 border-[var(--btn-bg)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="ss-cell-muted text-[14px]">Loading salary structure…</p>
                </div>
            )}

            {/* ── Error state ── */}
            {!loading && error && (
                <div className="ss-table-card rounded-3xl p-12 text-center max-w-lg mx-auto">
                    <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                        Could not load salary structure
                    </h3>
                    <p className="text-[13px] text-rose-600 dark:text-rose-400 mb-6">{error}</p>
                    <button
                        onClick={loadData}
                        className="ss-btn-primary px-5 py-2.5 rounded-xl text-[13.5px] font-semibold inline-flex items-center gap-2"
                    >
                        <RefreshCw size={15} /> Try Again
                    </button>
                </div>
            )}

            {/* ── Main View Content ── */}
            {structure && (
                <div className="flex flex-col gap-6">

                    {/* ── Structure & Employee Hero Card ── */}
                    <div className="ss-card rounded-3xl p-6 sm:p-7 shadow-sm border border-[var(--divider)]">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

                            {/* Employee info with Avatar */}
                            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                                <div className="ss-avatar w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden relative shadow-sm border-2 border-[var(--divider)]">
                                    {photoUrl ? (
                                        <img
                                            src={photoUrl}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                                const fb = e.currentTarget.parentElement?.querySelector(".view-avatar-fb");
                                                if (fb) fb.style.display = "flex";
                                            }}
                                        />
                                    ) : null}
                                    <span
                                        className="view-avatar-fb w-full h-full items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                        style={{ display: photoUrl ? "none" : "flex" }}
                                    >
                                        {initials}
                                    </span>
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">
                                            {structure.first_name} {structure.last_name ?? ""}
                                        </h2>
                                        {structure.employee_code && (
                                            <span className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--badge-bg)] text-[var(--text-secondary)] border border-[var(--divider)]">
                                                {structure.employee_code}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2.5 text-[13px] text-[var(--text-secondary)] flex-wrap">
                                        {structure.designation && (
                                            <span className="font-semibold text-[var(--btn-bg)] bg-[var(--badge-bg)] px-2.5 py-0.5 rounded-lg">
                                                {structure.designation}
                                            </span>
                                        )}
                                        {structure.department && (
                                            <span className="text-[var(--text-muted)]">
                                                • {structure.department}
                                            </span>
                                        )}
                                        {structure.school_name && (
                                            <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
                                                • <Building2 size={13} /> {structure.school_name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Structure Name Subtitle */}
                                    <div className="mt-2 text-[13px]">
                                        <span className="text-[var(--text-muted)]">Structure: </span>
                                        <span className="font-bold text-[var(--text-primary)]">
                                            {structure.structure_name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Validity Badges */}
                            <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between w-full lg:w-auto gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-[var(--divider)]">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`ss-status ss-status-${structure.status} text-[12px] px-3 py-1 font-semibold`}>
                                        {structure.status === "active" ? "Active" : "Inactive"}
                                    </span>

                                    {validity === "current" && (
                                        <span className="text-[11.5px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                            Currently Effective
                                        </span>
                                    )}
                                    {validity === "upcoming" && (
                                        <span className="text-[11.5px] font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
                                            Upcoming
                                        </span>
                                    )}
                                    {validity === "expired" && (
                                        <span className="text-[11.5px] font-semibold text-slate-500 bg-slate-500/10 px-2.5 py-1 rounded-full">
                                            Expired
                                        </span>
                                    )}
                                </div>

                                <div className="text-[12.5px] text-[var(--text-muted)] flex items-center gap-2">
                                    <Calendar size={13} />
                                    <span>
                                        {formatDate(structure.effective_from)}
                                        {" → "}
                                        {structure.effective_to ? formatDate(structure.effective_to) : "Open-ended"}
                                    </span>
                                </div>

                                {structure.remarks && (
                                    <p className="text-[12px] text-[var(--text-muted)] italic max-w-xs text-left lg:text-right">
                                        "{structure.remarks}"
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* ── Key Metrics Cards ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Gross Earnings */}
                        <div className="ss-stat-card rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <TrendingUp size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                    Gross Salary
                                </p>
                                <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-tight">
                                    ₹{totalGross.toLocaleString("en-IN")}
                                </p>
                                <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                                    {earningsList.length} earning component{earningsList.length === 1 ? "" : "s"}
                                </span>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="ss-stat-card rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                <TrendingDown size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                    Deductions
                                </p>
                                <p className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 leading-tight">
                                    ₹{totalDeductions.toLocaleString("en-IN")}
                                </p>
                                <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                                    {deductionsList.length} deduction component{deductionsList.length === 1 ? "" : "s"}
                                </span>
                            </div>
                        </div>

                        {/* Net Monthly Salary */}
                        <div className="ss-stat-card rounded-2xl p-5 flex items-center gap-4 border-indigo-500/30">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                <IndianRupee size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                    Net Monthly
                                </p>
                                <p className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] leading-tight">
                                    ₹{netSalary.toLocaleString("en-IN")}
                                </p>
                                <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                                    Take-home pay
                                </span>
                            </div>
                        </div>

                        {/* Annual CTC */}
                        <div className="ss-stat-card rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <Sparkles size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                    Annual Net
                                </p>
                                <p className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] leading-tight">
                                    ₹{(netSalary * 12).toLocaleString("en-IN")}
                                </p>
                                <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                                    Gross: ₹{(totalGross * 12).toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Components Breakdown Section ── */}
                    <div className="ss-table-card rounded-3xl overflow-hidden shadow-sm border border-[var(--divider)]">

                        {/* Section Header & Tabs */}
                        <div className="p-5 sm:p-6 border-b border-[var(--divider)] flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                    Assigned Salary Details ({details.length})
                                </h3>
                                <p className="text-[12.5px] text-[var(--text-muted)] mt-0.5">
                                    Breakdown of earning allowances and payroll deductions.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Filter Tabs */}
                                <div className="ss-toggle-group flex rounded-xl overflow-hidden p-1 bg-[var(--input-bg)] border border-[var(--divider)]">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("all")}
                                        className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors ${
                                            activeTab === "all" ? "ss-toggle-btn-active" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        All ({details.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("earning")}
                                        className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors ${
                                            activeTab === "earning" ? "ss-toggle-btn-active text-emerald-600" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        Earnings ({earningsList.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("deduction")}
                                        className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors ${
                                            activeTab === "deduction" ? "ss-toggle-btn-active text-rose-600" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        Deductions ({deductionsList.length})
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowBulkModal(true)}
                                    className="ss-btn-primary px-3.5 py-2 rounded-xl text-[12.5px] font-semibold inline-flex items-center gap-1.5 shadow-sm"
                                >
                                    <Plus size={14} /> Add / Edit Bulk
                                </button>
                            </div>
                        </div>

                        {/* Components Table */}
                        {filteredDetails.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                                    <Layers size={24} />
                                </div>
                                <h4 className="text-[15px] font-bold text-[var(--text-primary)]">
                                    No components in this view
                                </h4>
                                <p className="text-[13px] text-[var(--text-muted)] mt-1 mb-5 max-w-sm mx-auto">
                                    {details.length === 0
                                        ? "This salary structure does not have any salary components configured yet. Add them now in bulk."
                                        : "No components match the selected filter tab."}
                                </p>
                                {details.length === 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowBulkModal(true)}
                                        className="ss-btn-primary px-5 py-2.5 rounded-xl text-[13px] font-semibold inline-flex items-center gap-2 shadow-sm"
                                    >
                                        <Plus size={15} /> Add Salary Components (Bulk)
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="ss-thead text-[11.5px] uppercase tracking-wide border-b border-[var(--divider)]">
                                            <th className="px-6 py-3.5 font-semibold">Component</th>
                                            <th className="px-4 py-3.5 font-semibold">Type</th>
                                            <th className="px-4 py-3.5 font-semibold">Calculation Rule</th>
                                            <th className="px-4 py-3.5 font-semibold text-right">Monthly Amount</th>
                                            <th className="px-4 py-3.5 font-semibold text-right">Annualized</th>
                                            <th className="px-6 py-3.5 font-semibold text-right w-20">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--divider)]">
                                        {filteredDetails.map((item) => {
                                            const isEarning = item.component_type === "earning";
                                            const monthly = item.monthlyAmount || 0;
                                            const annual = monthly * 12;

                                            return (
                                                <tr key={item.id} className="ss-row hover:bg-[var(--input-bg)]/40 transition-colors">
                                                    {/* Component Name & Code */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-[11px] ${
                                                                isEarning
                                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                            }`}>
                                                                {isEarning ? "+" : "-"}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-[13.5px] text-[var(--text-primary)]">
                                                                    {item.component_name}
                                                                </p>
                                                                {item.component_code && (
                                                                    <span className="text-[11px] font-mono text-[var(--text-muted)]">
                                                                        {item.component_code}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Type badge */}
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11.5px] font-bold ${
                                                            isEarning
                                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                        }`}>
                                                            {isEarning ? "Earning" : "Deduction"}
                                                        </span>
                                                    </td>

                                                    {/* Calculation Rule */}
                                                    <td className="px-4 py-4 text-[13px] text-[var(--text-secondary)]">
                                                        {item.calculation_type === "fixed" ? (
                                                            <span className="inline-flex items-center gap-1 font-medium">
                                                                Fixed Amount
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                                                                {item.percentage}% of {item.based_on === "gross" ? "Gross Salary" : "Basic Pay"}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Monthly */}
                                                    <td className="px-4 py-4 text-right font-bold text-[14px]">
                                                        <span className={isEarning ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                                            {isEarning ? "+" : "-"} ₹{monthly.toLocaleString("en-IN")}
                                                        </span>
                                                    </td>

                                                    {/* Annualized */}
                                                    <td className="px-4 py-4 text-right text-[13px] font-medium text-[var(--text-muted)]">
                                                        ₹{annual.toLocaleString("en-IN")}
                                                    </td>

                                                    {/* Delete button */}
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteDetailTarget(item)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors ml-auto"
                                                            title="Delete Component"
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
                        )}

                        {/* Breakdown Totals Footer */}
                        {filteredDetails.length > 0 && (
                            <div className="p-5 bg-[var(--input-bg)] border-t border-[var(--divider)] flex flex-wrap items-center justify-between gap-4 text-[13px]">
                                <div className="text-[var(--text-muted)] font-medium">
                                    Displaying {filteredDetails.length} of {details.length} components
                                </div>

                                <div className="flex items-center gap-6 font-bold">
                                    <div>
                                        <span className="text-[var(--text-muted)] font-normal mr-2">Total Gross:</span>
                                        <span className="text-emerald-600 dark:text-emerald-400">₹{totalGross.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--text-muted)] font-normal mr-2">Deductions:</span>
                                        <span className="text-rose-600 dark:text-rose-400">₹{totalDeductions.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="px-3 py-1 rounded-xl bg-[var(--panel-bg)] border border-indigo-500/30">
                                        <span className="text-indigo-600 dark:text-indigo-400 font-normal mr-2">Net Pay:</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 text-[14px]">₹{netSalary.toLocaleString("en-IN")}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            )}

            {/* ── Bulk Components Modal ── */}
            {structure && (
                <BulkSalaryDetailsModal
                    isOpen={showBulkModal}
                    onClose={() => setShowBulkModal(false)}
                    structure={structure}
                    existingDetails={details}
                    onSuccess={loadData}
                />
            )}

            {/* ── Edit Structure Modal ── */}
            {structure && (
                <SalaryStructureModal
                    isOpen={showEditStructureModal}
                    onClose={() => {
                        setShowEditStructureModal(false);
                        loadData();
                    }}
                    structure={structure}
                />
            )}

            {/* ── Delete Component Confirmation Modal ── */}
            {deleteDetailTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="ss-modal w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[var(--divider)]">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                            <Trash2 size={22} />
                        </div>

                        <h3 className="text-lg font-bold text-[var(--text-primary)]">
                            Remove Salary Component?
                        </h3>

                        <p className="text-[13px] text-[var(--text-muted)] mt-1.5 mb-4 leading-relaxed">
                            Are you sure you want to remove <span className="font-semibold text-[var(--text-primary)]">"{deleteDetailTarget.component_name}"</span> from this structure? This will adjust the employee's gross and net salary.
                        </p>

                        {deleteDetailError && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-[12.5px] font-medium flex items-start gap-2.5 text-left leading-normal">
                                <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                <div className="flex-1">{deleteDetailError}</div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setDeleteDetailTarget(null);
                                    setDeleteDetailError(null);
                                }}
                                className="ss-btn-outline px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deletingDetail}
                                onClick={handleDeleteDetail}
                                className="ss-btn-primary bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {deletingDetail ? "Removing…" : "Remove Component"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
