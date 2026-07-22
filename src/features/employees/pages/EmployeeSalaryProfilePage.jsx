/**
 * EmployeeSalaryProfilePage.jsx  — uses existing slice actions:
 *
 *   employeeSalaryStructureSlice:
 *     fetchEmployeeSalaryStructures          → state.employeeSalaryStructure.employeeSalaryStructures
 *
 *   employeeSalaryStructureDetailSlice:
 *     fetchEmployeeSalaryStructureDetailsByEmployeeId
 *                                            → state.employeeSalaryStructureDetail.employeeDetailsByEmployee
 *
 *   employees slice (adjust key if different):
 *     fetchEmployeeById (or similar)         → state.employees.selectedEmployee
 *
 * Route:  /salary/employee/:employeeId
 */
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { fetchEmployeeSalaryStructures }
    from "../../../redux/employee_salary_structure/employeeSalaryStructureSlice.js";
import { fetchEmployeeSalaryStructureDetailsByEmployeeId }
    from "../../../redux/employee_salary_structure_detail/employeeSalaryStructureDetailSlice.js";
import { fetchEmployeeById as getEmployeeById }
    from "../../../redux/employee/employeeSlice.js";

import "../styles/EmployeeSalaryProfile.css";
import {
    ArrowLeft, LayoutDashboard, LayoutList,
    IndianRupee, Percent, TrendingUp, TrendingDown,
    CalendarDays, CalendarCheck2, Building2,
    Users, CheckCircle, Minus, Clock,
    FileText, Gift,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TAB REGISTRY  — add future tabs here, zero other changes
═══════════════════════════════════════════════════════════ */
const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, future: false },
    { id: "structures", label: "Structures", icon: LayoutList, future: false },
    { id: "components", label: "Components", icon: IndianRupee, future: false },
    { id: "payslips", label: "Payslips", icon: FileText, future: true },
    { id: "allowances", label: "Allowances", icon: Gift, future: true },
];

/* ── helpers ── */
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtMoney = (n) => Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const getInit = (f, l) => `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase() || "?";
const isStructActive = (s) => {
    if (s?.status !== "active") return false;
    const today = new Date(), from = new Date(s.effective_from);
    if (today < from) return false;
    return !s.effective_to || today <= new Date(s.effective_to);
};

/* ── small shared UI pieces ── */
function StatCard({ icon: Icon, bg, color, value, label, sub }) {
    return (
        <div className="esp-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
            <div className={`${bg} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className={color} />
            </div>
            <div>
                <p className="esp-stat-value text-xl font-bold leading-none">{value}</p>
                <p className="esp-stat-label text-[12.5px] mt-0.5">{label}</p>
                {sub && <p className="esp-cell-muted text-[11px] mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-2.5">
            <span className="esp-info-label text-[13px]">{label}</span>
            <span className="esp-info-value text-[13px]">{value ?? "—"}</span>
        </div>
    );
}

function ComponentSection({ title, tone, rows }) {
    const subtotal = rows.filter(r => r.calculation_type === "fixed")
        .reduce((s, r) => s + Number(r.amount ?? 0), 0);

    const headerClass = {
        earning: "esp-section-earning",
        deduction: "esp-section-deduction",
        benefit: "esp-section-benefit",
    }[tone] ?? "esp-section-benefit";

    return (
        <div className="esp-panel rounded-2xl overflow-hidden">
            <div className={`flex items-center justify-between px-4 py-3 ${headerClass}`}>
                <div className="flex items-center gap-2">
                    {tone === "earning" && <TrendingUp size={15} />}
                    {tone === "deduction" && <TrendingDown size={15} />}
                    {tone === "benefit" && <CheckCircle size={15} />}
                    <span className="text-[13.5px] font-bold">{title}</span>
                    <span className="text-[11.5px] font-medium opacity-70">({rows.length})</span>
                </div>
                <span className="text-[13px] font-bold">₹{fmtMoney(subtotal)}</span>
            </div>
            <table className="w-full text-left">
                <thead>
                    <tr className="esp-thead text-[11px] uppercase tracking-wide">
                        <th className="px-4 py-2 font-semibold">Component</th>
                        <th className="px-3 py-2 font-semibold">Calculation</th>
                        <th className="px-3 py-2 font-semibold text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-5 text-center esp-cell-muted text-[13px]">
                            No {title.toLowerCase()} added
                        </td></tr>
                    ) : rows.map((d) => {
                        const isPct = d.calculation_type === "percentage";
                        return (
                            <tr key={d.id} className="esp-row">
                                <td className="px-4 py-3">
                                    <p className="esp-cell-primary text-[13.5px] font-semibold">{d.component_name}</p>
                                </td>
                                <td className="px-3 py-3">
                                    {isPct ? (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="esp-calc-chip esp-calc-percentage inline-flex items-center gap-1">
                                                <Percent size={10} />{Number(d.percentage ?? 0).toFixed(2)}%
                                            </span>
                                            <span className="esp-based-on">of {d.based_on}</span>
                                        </div>
                                    ) : (
                                        <span className="esp-calc-chip esp-calc-fixed inline-flex items-center gap-1">
                                            <IndianRupee size={10} />{fmtMoney(d.amount)}
                                        </span>
                                    )}
                                </td>
                                <td className="px-3 py-3 text-right">
                                    <span className={`esp-amount text-[14px] ${tone === "earning" ? "esp-amount-earning" : "esp-amount-deduction"}`}>
                                        {isPct ? "—" : `₹${fmtMoney(d.amount)}`}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                {rows.length > 0 && (
                    <tfoot>
                        <tr style={{ borderTop: "2px solid var(--divider)", background: "var(--input-bg)" }}>
                            <td colSpan={2} className="px-4 py-2.5 esp-cell-secondary text-[12px] font-bold">Subtotal (Fixed)</td>
                            <td className={`px-3 py-2.5 text-right text-[14px] font-bold ${tone === "earning" ? "esp-amount-earning" : "esp-amount-deduction"}`}>
                                ₹{fmtMoney(subtotal)}
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}

/* ════ TAB 1: OVERVIEW ════════════════════════════════════ */
function OverviewTab({ employee, structures, allDetailsByEmployee }) {
    const activeStruct = structures.find(isStructActive) ?? structures[0] ?? null;
    const activeDetails = allDetailsByEmployee.filter(
        (d) => String(d.salary_structure_id) === String(activeStruct?.id),
    );
    const gross = activeDetails.filter(d => d.component_type === "earning" && d.calculation_type === "fixed").reduce((s, d) => s + Number(d.amount ?? 0), 0);
    const deduct = activeDetails.filter(d => d.component_type === "deduction" && d.calculation_type === "fixed").reduce((s, d) => s + Number(d.amount ?? 0), 0);
    const net = gross - deduct;

    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={LayoutList} bg="esp-icon-total-bg" color="esp-icon-total"
                    value={structures.length} label="Structures" />
                <StatCard icon={CheckCircle} bg="esp-icon-active-bg" color="esp-icon-active"
                    value={structures.filter(isStructActive).length} label="Active" />
                <StatCard icon={TrendingUp} bg="esp-icon-earning-bg" color="esp-icon-earning"
                    value={`₹${fmtMoney(gross)}`} label="Gross Earnings" sub="Fixed · active structure" />
                <StatCard icon={TrendingDown} bg="esp-icon-deduction-bg" color="esp-icon-deduction"
                    value={`₹${fmtMoney(deduct)}`} label="Deductions" sub="Fixed · active structure" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Employee info */}
                <div className="esp-panel rounded-2xl overflow-hidden">
                    <div className="esp-panel-header px-5 py-3.5">
                        <p className="esp-panel-title text-[14px] font-bold">Employee Information</p>
                    </div>
                    <div className="px-5 divide-y" style={{ borderColor: "var(--divider)" }}>
                        <InfoRow label="Full Name" value={`${employee?.first_name ?? ""} ${employee?.last_name ?? ""}`} />
                        <InfoRow label="Employee Code" value={employee?.employee_code} />
                        <InfoRow label="Designation" value={employee?.designation} />
                        <InfoRow label="Department" value={employee?.department} />
                        <InfoRow label="Email" value={employee?.email} />
                        <InfoRow label="Mobile" value={employee?.mobile} />
                        <InfoRow label="Joining Date" value={fmtDate(employee?.joining_date)} />
                        <InfoRow label="Status" value={
                            <span className={`esp-status esp-status-${employee?.status ?? "inactive"}`}>
                                {employee?.status}
                            </span>
                        } />
                    </div>
                </div>

                {/* Active structure summary */}
                <div className="esp-panel rounded-2xl overflow-hidden">
                    <div className="esp-panel-header px-5 py-3.5 flex items-center justify-between">
                        <p className="esp-panel-title text-[14px] font-bold">Active Salary Structure</p>
                        {activeStruct && <span className="esp-status esp-status-active text-[11.5px]">Current</span>}
                    </div>
                    {!activeStruct ? (
                        <div className="esp-empty flex flex-col items-center justify-center gap-2 m-5 py-8 text-center">
                            <LayoutList size={28} className="opacity-30" />
                            <p className="text-[13px]">No active salary structure</p>
                        </div>
                    ) : (
                        <div className="px-5 divide-y" style={{ borderColor: "var(--divider)" }}>
                            <InfoRow label="Structure Name" value={activeStruct.structure_name} />
                            <InfoRow label="Effective From" value={fmtDate(activeStruct.effective_from)} />
                            <InfoRow label="Effective To" value={activeStruct.effective_to ? fmtDate(activeStruct.effective_to) : "Open-ended"} />
                            <InfoRow label="Components" value={activeDetails.length} />
                            <InfoRow label="Gross Earnings" value={<span className="esp-net-earning font-bold">₹{fmtMoney(gross)}</span>} />
                            <InfoRow label="Deductions" value={<span className="esp-net-deduction font-bold">₹{fmtMoney(deduct)}</span>} />
                            <InfoRow label="Net Salary" value={
                                <span className={`text-[14px] font-extrabold ${net >= 0 ? "esp-net-earning" : "esp-net-deduction"}`}>
                                    ₹{fmtMoney(net)}
                                </span>
                            } />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ════ TAB 2: STRUCTURES ══════════════════════════════════ */
function StructuresTab({ structures, selectedStructId, allDetailsByEmployee, onSelect }) {
    if (structures.length === 0) {
        return (
            <div className="esp-empty flex flex-col items-center justify-center gap-3 py-16 text-center">
                <LayoutList size={36} className="opacity-30" />
                <p className="esp-cell-muted text-[14px] font-medium">No salary structures found</p>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-3">
            {structures.map((s) => {
                const active = isStructActive(s);
                const selected = String(s.id) === String(selectedStructId);
                const compCount = allDetailsByEmployee.filter(d => String(d.salary_structure_id) === String(s.id)).length;
                return (
                    <div key={s.id}
                        onClick={() => onSelect(s.id)}
                        className={`esp-struct-item rounded-2xl px-5 py-4 cursor-pointer ${selected ? "esp-struct-item-active" : ""}`}
                    >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${active ? "esp-dot-active" : "esp-dot-inactive"}`} />
                                    <p className="esp-struct-name text-[14px] font-bold truncate">{s.structure_name}</p>
                                    {selected && <span className="esp-status esp-status-active text-[11px] px-2 py-0.5">Viewing</span>}
                                </div>
                                <div className="flex items-center gap-4 flex-wrap mt-1">
                                    <span className="esp-struct-meta text-[12.5px] flex items-center gap-1">
                                        <CalendarDays size={12} /> From: {fmtDate(s.effective_from)}
                                    </span>
                                    {s.effective_to ? (
                                        <span className="esp-struct-meta text-[12.5px] flex items-center gap-1">
                                            <CalendarCheck2 size={12} /> To: {fmtDate(s.effective_to)}
                                        </span>
                                    ) : (
                                        <span className="esp-icon-active text-[12.5px] flex items-center gap-1">
                                            <CalendarCheck2 size={12} /> Open-ended
                                        </span>
                                    )}
                                    <span className={`text-[12px] font-semibold ${compCount > 0 ? "esp-icon-earning" : "esp-cell-muted"}`}>
                                        {compCount} component{compCount !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                {s.remarks && <p className="esp-struct-meta text-[12px] mt-1 italic">{s.remarks}</p>}
                            </div>
                            <span className={`esp-status esp-status-${s.status}`}>{s.status}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ════ TAB 3: COMPONENTS ══════════════════════════════════ */
function ComponentsTab({ structures, selectedStructId, allDetailsByEmployee, loading }) {
    const activeStruct = structures.find((s) => String(s.id) === String(selectedStructId))
        ?? structures.find(isStructActive)
        ?? structures[0]
        ?? null;

    const details = allDetailsByEmployee.filter(
        (d) => String(d.salary_structure_id) === String(activeStruct?.id),
    );
    const earnings = details.filter((d) => d.component_type === "earning");
    const deductions = details.filter((d) => d.component_type === "deduction");
    const benefits = details.filter((d) => d.component_type === "benefit");

    const grossFixed = earnings.filter(d => d.calculation_type === "fixed").reduce((s, d) => s + Number(d.amount ?? 0), 0);
    const deductFixed = deductions.filter(d => d.calculation_type === "fixed").reduce((s, d) => s + Number(d.amount ?? 0), 0);
    const net = grossFixed - deductFixed;

    if (loading) {
        return <p className="esp-loading text-[13.5px] px-4 py-10 text-center">Loading components…</p>;
    }
    if (!activeStruct) {
        return (
            <div className="esp-empty flex flex-col items-center justify-center gap-3 py-16 text-center">
                <IndianRupee size={36} className="opacity-30" />
                <p className="esp-cell-muted text-[14px] font-medium">No structure available</p>
            </div>
        );
    }
    if (details.length === 0) {
        return (
            <div className="esp-empty flex flex-col items-center justify-center gap-2 py-16 text-center">
                <IndianRupee size={36} className="opacity-30" />
                <p className="esp-cell-muted text-[14px] font-medium">No components in this structure</p>
                <p className="esp-cell-muted text-[12.5px]">{activeStruct.structure_name}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Structure info bar */}
            <div className="esp-panel rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
                <LayoutList size={16} className="esp-icon-total shrink-0" />
                <p className="esp-cell-primary text-[13.5px] font-semibold flex-1 truncate">{activeStruct.structure_name}</p>
                <span className="esp-cell-muted text-[12.5px] flex items-center gap-1">
                    <CalendarDays size={12} /> {fmtDate(activeStruct.effective_from)}
                </span>
                <span className={`esp-status esp-status-${activeStruct.status}`}>{activeStruct.status}</span>
            </div>

            {/* Payslip columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ComponentSection title="Earnings" tone="earning" rows={earnings} />
                <ComponentSection title="Deductions" tone="deduction" rows={deductions} />
            </div>
            {benefits.length > 0 && (
                <ComponentSection title="Benefits" tone="benefit" rows={benefits} />
            )}

            {/* Net salary */}
            <div className="esp-net-card rounded-2xl px-5 py-4">
                <p className="esp-cell-secondary text-[12px] font-bold uppercase tracking-wider mb-4">Salary Summary</p>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="text-center">
                        <p className="esp-cell-muted text-[12px] mb-1">Gross Earnings</p>
                        <p className="esp-net-earning text-[22px] font-extrabold">₹{fmtMoney(grossFixed)}</p>
                    </div>
                    <Minus size={22} className="esp-cell-muted" />
                    <div className="text-center">
                        <p className="esp-cell-muted text-[12px] mb-1">Total Deductions</p>
                        <p className="esp-net-deduction text-[22px] font-extrabold">₹{fmtMoney(deductFixed)}</p>
                    </div>
                    <span className="esp-cell-muted text-[24px] font-light">=</span>
                    <div className={`text-center rounded-xl px-6 py-3 ${net >= 0 ? "esp-net-positive" : "esp-net-negative"}`}>
                        <p className="text-[12px] font-semibold mb-1">Net Salary</p>
                        <p className="text-[26px] font-extrabold">₹{fmtMoney(net)}</p>
                        <p className="text-[11px] font-medium opacity-75">
                            {details.length} component{details.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                {details.some(d => d.calculation_type === "percentage") && (
                    <p className="esp-cell-muted text-[11.5px] mt-3 pt-3 flex items-center gap-1"
                        style={{ borderTop: "1px solid var(--divider)" }}>
                        <Percent size={11} /> % based components are excluded from fixed totals above.
                    </p>
                )}
            </div>
        </div>
    );
}

/* ════ FUTURE TAB PLACEHOLDER ════════════════════════════ */
function ComingSoonTab({ tab }) {
    const Icon = tab.icon;
    return (
        <div className="esp-coming-soon flex flex-col items-center justify-center gap-4 py-20 text-center rounded-2xl">
            <div className="w-16 h-16 rounded-2xl esp-icon-total-bg flex items-center justify-center">
                <Icon size={28} className="esp-icon-total" />
            </div>
            <div>
                <p className="esp-coming-soon-title text-[16px] font-bold mb-1">{tab.label} — Coming Soon</p>
                <p className="esp-cell-muted text-[13px]">This section is planned for a future release.</p>
            </div>
            <span className="esp-calc-chip esp-calc-percentage text-[12px]">Planned</span>
        </div>
    );
}

/* ════ MAIN PAGE ══════════════════════════════════════════ */
export default function EmployeeSalaryProfilePage() {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    /* ── Selectors — adjust key names if different ── */
    const structures = useSelector((s) => s.employeeSalaryStructure?.employeeSalaryStructures ?? []);
    const structLoading = useSelector((s) => s.employeeSalaryStructure?.loading ?? false);
    const allDetailsByEmployee = useSelector((s) => s.employeeSalaryStructureDetail?.employeeDetailsByEmployee ?? []);
    const detailLoading = useSelector((s) => s.employeeSalaryStructureDetail?.loading ?? false);
    const employee = useSelector((s) => s.employees?.selectedEmployee ?? s.employees?.employee ?? null);
    const empLoading = useSelector((s) => s.employees?.loading ?? false);

    /* ── Local UI state ── */
    const [activeTabId, setActiveTabId] = useState("overview");
    const [selectedStructId, setSelectedStructId] = useState(null);

    /* ── Fetch on mount ──
       Single call gets ALL details for this employee.
       No need to re-fetch per structure — filter client-side.       ── */
    useEffect(() => {
        if (!employeeId) return;
        const id = Number(employeeId);
        dispatch(getEmployeeById(id));
        dispatch(fetchEmployeeSalaryStructures({ employee_id: id }));
        dispatch(fetchEmployeeSalaryStructureDetailsByEmployeeId(id));
    }, [dispatch, employeeId]);

    /* ── Auto-select the active (or first) structure ── */
    useEffect(() => {
        if (!selectedStructId && structures.length > 0) {
            const active = structures.find(isStructActive) ?? structures[0];
            setSelectedStructId(active.id);
        }
    }, [structures, selectedStructId]);

    /* ── Handlers ── */
    const handleSelectStructure = (structId) => {
        setSelectedStructId(structId);
        setActiveTabId("components");
    };

    /* ── Tab badge counts ── */
    const tabBadge = (tabId) => {
        if (tabId === "structures") return structures.length || null;
        if (tabId === "components") {
            const count = allDetailsByEmployee.filter(
                (d) => String(d.salary_structure_id) === String(selectedStructId),
            ).length;
            return count || null;
        }
        return null;
    };

    const isInitialLoading = (empLoading || structLoading) && !employee;

    if (isInitialLoading) {
        return (
            <div className="esp-page min-h-screen p-6 flex items-center justify-center">
                <p className="esp-loading text-[14px]">Loading salary profile…</p>
            </div>
        );
    }

    return (
        <div className="esp-page min-h-screen p-5 sm:p-6">

            {/* ── Back ── */}
            <button onClick={() => navigate(-1)}
                className="esp-btn-outline inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-colors mb-5">
                <ArrowLeft size={15} /> Back
            </button>

            {/* ── Employee header card ── */}
            {employee && (
                <div className="esp-header-card rounded-2xl px-5 py-5 mb-5">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="esp-avatar w-16 h-16 rounded-2xl flex items-center justify-center text-[20px] font-extrabold shrink-0">
                            {getInit(employee.first_name, employee.last_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                <h1 className="esp-emp-name text-[20px] font-bold">
                                    {employee.first_name} {employee.last_name}
                                </h1>
                                {employee.employee_code && (
                                    <span className="esp-emp-code-chip">{employee.employee_code}</span>
                                )}
                                <span className={`esp-status esp-status-${employee.status ?? "active"}`}>
                                    {employee.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                                {employee.designation && (
                                    <span className="esp-emp-meta text-[13px] flex items-center gap-1">
                                        <Users size={13} /> {employee.designation}
                                    </span>
                                )}
                                {employee.department && (
                                    <span className="esp-emp-muted text-[13px] flex items-center gap-1">
                                        <Building2 size={13} /> {employee.department}
                                    </span>
                                )}
                                {employee.joining_date && (
                                    <span className="esp-emp-muted text-[13px] flex items-center gap-1">
                                        <Clock size={13} /> Joined {fmtDate(employee.joining_date)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="esp-emp-name text-[22px] font-extrabold">{structures.length}</p>
                            <p className="esp-emp-muted text-[12px]">structure{structures.length !== 1 ? "s" : ""}</p>
                            <p className="esp-emp-muted text-[11px]">{allDetailsByEmployee.length} components total</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tab bar ── */}
            <div className="esp-tab-bar rounded-2xl px-2 mb-5 overflow-x-auto">
                <div className="flex items-center gap-1 min-w-max">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = tab.id === activeTabId;
                        const badge = tabBadge(tab.id);
                        return (
                            <button key={tab.id} onClick={() => setActiveTabId(tab.id)}
                                className={`esp-tab inline-flex items-center gap-2 px-4 py-4 text-[13.5px] transition-all ${isActive ? "esp-tab-active" : ""}`}>
                                <Icon size={15} />
                                {tab.label}
                                {tab.future ? (
                                    <span className="esp-tab-badge-muted">Soon</span>
                                ) : badge != null ? (
                                    <span className="esp-tab-badge">{badge}</span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Tab content ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTabId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18 }}
                >
                    {activeTabId === "overview" && (
                        <OverviewTab
                            employee={employee}
                            structures={structures}
                            allDetailsByEmployee={allDetailsByEmployee}
                        />
                    )}
                    {activeTabId === "structures" && (
                        <StructuresTab
                            structures={structures}
                            selectedStructId={selectedStructId}
                            allDetailsByEmployee={allDetailsByEmployee}
                            onSelect={handleSelectStructure}
                        />
                    )}
                    {activeTabId === "components" && (
                        <ComponentsTab
                            structures={structures}
                            selectedStructId={selectedStructId}
                            allDetailsByEmployee={allDetailsByEmployee}
                            loading={detailLoading}
                        />
                    )}
                    {TABS.filter((t) => t.future).map((t) =>
                        activeTabId === t.id ? <ComingSoonTab key={t.id} tab={t} /> : null,
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}