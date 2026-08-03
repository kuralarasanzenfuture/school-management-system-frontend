// /**
//  * MyAttendancePage.jsx — logged-in employee's own attendance
//  *
//  * Redux:
//  *   state.auth.user                          → { id, employee_id, roles[] }
//  *   state.employeeAttendance.myRecords       → logs[]
//  *   state.employeeAttendance.mySummary       → summary object
//  *   state.employeeAttendance.myLoading
//  *   state.employeeAttendance.myError
//  *
//  * Actions:
//  *   getEmployeeAttendanceByEmployeeId({ employeeId, filters })
//  *   markAttendance(payload)      → POST /manual
//  *   editAttendance({ id, payload }) → PUT /:id
//  *   removeAttendance(id)         → DELETE /:id
//  *
//  * Service also exposes checkInAttendance / checkOutAttendance
//  * which are called directly (not via slice) for simplicity.
//  */
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//     getEmployeeAttendanceByEmployeeId,
//     markAttendance,
//     editAttendance,
//     removeAttendance,
// } from "../../../../redux/employeeAttendance/employeeAttendanceSlice.js";
// import {
//     checkInAttendance,
//     checkOutAttendance,
//     getTodayAttendance,
// } from "../../../../redux/employeeAttendance/employeeAttendance.service.js";

// import MyAttendanceCalendar from "../components/MyAttendanceCalendar.jsx";
// import MyAttendanceTable from "../components/MyAttendanceTable.jsx";
// import { ManualAttendanceModal, DeleteAttendanceModal } from "../components/MyAttendanceModals.jsx";
// import Pagination from "../../../../common/components/table/Pagination.jsx";
// import usePagination from "../../../../common/components/table/usePagination.jsx";
// import "../styles/MyAttendance.css";

// import {
//     UserCheck, UserX, Clock, Umbrella,
//     CalendarOff, Timer, TrendingUp,
//     Calendar, List, RefreshCw, Plus, LogIn, LogOut,
// } from "lucide-react";

// /* ── helpers ── */
// const pad = (n) => String(n).padStart(2, "0");
// const ymFirst = (y, m) => `${y}-${pad(m + 1)}-01`;
// const ymLast = (y, m) => `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`;
// const MONTHS_S = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// const MONTHS_F = ["January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"];

// function fmtTime(v) {
//     if (!v) return null;
//     const d = new Date(v);
//     return isNaN(d) ? null : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
// }
// function fmtMins(m) {
//     if (!m && m !== 0) return "0m";
//     const h = Math.floor(m / 60), min = m % 60;
//     if (h === 0) return `${min}m`;
//     return min === 0 ? `${h}h` : `${h}h ${min}m`;
// }

// /* ── Stat card ── */
// function StatCard({ icon: Icon, bg, color, value, label, sub }) {
//     return (
//         <div className="ma-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
//             <div className={`${bg} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
//                 <Icon size={20} className={color} />
//             </div>
//             <div>
//                 <p className="ma-stat-value text-xl font-bold leading-none">{value}</p>
//                 <p className="ma-stat-label text-[12.5px] mt-0.5">{label}</p>
//                 {sub && <p className="ma-cell-muted text-[11px] mt-0.5">{sub}</p>}
//             </div>
//         </div>
//     );
// }

// /* ── Attendance % ring ── */
// function Ring({ pct }) {
//     const r = 36;
//     const circ = 2 * Math.PI * r;
//     const dash = ((pct ?? 0) / 100) * circ;
//     const color = pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)";
//     return (
//         <div className="flex flex-col items-center">
//             <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: "rotate(-90deg)" }}>
//                 <circle cx="46" cy="46" r={r} fill="none" strokeWidth="8" className="ma-ring-track" />
//                 <circle cx="46" cy="46" r={r} fill="none" strokeWidth="8"
//                     stroke={color} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
//             </svg>
//             <div style={{ marginTop: "-62px", textAlign: "center" }}>
//                 <p className="text-[20px] font-extrabold" style={{ color }}>{Math.round(pct ?? 0)}%</p>
//                 <p className="ma-cell-muted text-[10px]">Present</p>
//             </div>
//             <div style={{ marginTop: "30px" }} />
//         </div>
//     );
// }

// /* ══════════════════════════════════════════════════════
//    MAIN PAGE
// ══════════════════════════════════════════════════════ */
// export default function MyEmployeeAttendancePage() {
//     const dispatch = useDispatch();
//     const now = new Date();

//     /* ── Auth ── */
//     const { user } = useSelector((s) => s.auth);
//     /* employee_id may be nested under user object — adjust if different */
//     const employeeId = user?.employee_id ?? user?.id;

//     /* ── Redux state (employee-specific namespace) ──
//        myRecords / myLoading / myError / mySummary are kept separate
//        from the admin-wide records so that loading one employee's
//        attendance never overwrites another employee's data. ── */
//     const records = useSelector((s) => s.employeeAttendance?.myRecords ?? []);
//     const summary = useSelector((s) => s.employeeAttendance?.mySummary ?? null);
//     const loading = useSelector((s) => s.employeeAttendance?.loading ?? false);
//     const reduxErr = useSelector((s) => s.employeeAttendance?.error ?? null);

//     /* ── UI state ── */
//     const [year, setYear] = useState(now.getFullYear());
//     const [month, setMonth] = useState(now.getMonth());
//     const [statusFilter, setStatusFilter] = useState("");
//     const [viewMode, setViewMode] = useState("calendar");
//     const [deletingId, setDeletingId] = useState(null);

//     /* today attendance for check-in/out */
//     const [todayRecord, setTodayRecord] = useState(null);
//     const [todayLoading, setTodayLoading] = useState(false);
//     const [checkBusy, setCheckBusy] = useState(false);

//     /* modals */
//     const [showManual, setShowManual] = useState(false);
//     const [editTarget, setEditTarget] = useState(null);
//     const [deleteTarget, setDeleteTarget] = useState(null);

//     /* ── Fetch monthly records ── */
//     const loadRecords = useCallback(() => {
//         if (!employeeId) return;
//         dispatch(getEmployeeAttendanceByEmployeeId({
//             employeeId,
//             filters: {
//                 from_date: ymFirst(year, month),
//                 to_date: ymLast(year, month),
//                 month: month + 1,
//                 year,
//                 ...(statusFilter ? { status: statusFilter.toUpperCase() } : {}),
//             },
//         }));
//     }, [dispatch, employeeId, year, month, statusFilter]);

//     useEffect(() => { loadRecords(); }, [loadRecords]);

//     /* ── Fetch today's record ── */
//     const loadToday = useCallback(async () => {
//         if (!employeeId) return;
//         setTodayLoading(true);
//         try {
//             const res = await getTodayAttendance();
//             /* response may be { data: record } or { data: [] } or record directly */
//             const rec = Array.isArray(res?.data)
//                 ? res.data.find((r) => String(r.employee_id) === String(employeeId))
//                 : res?.data ?? res ?? null;
//             setTodayRecord(rec ?? null);
//         } catch {
//             setTodayRecord(null);
//         } finally {
//             setTodayLoading(false);
//         }
//     }, [employeeId]);

//     useEffect(() => { loadToday(); }, [loadToday]);

//     /* ── Normalise records ──
//        Shape A: records is array
//        Shape B: records is { summary, logs } object                  */
//     const logs = useMemo(() => {
//         if (Array.isArray(records)) return records;
//         if (Array.isArray(records?.logs)) return records.logs;
//         return [];
//     }, [records]);

//     const summaryData = useMemo(() => {
//         if (summary && typeof summary === "object") return summary;
//         /* derive from logs */
//         const cnt = (s) => logs.filter(r => r.status === s).length;
//         const present = cnt("present");
//         const late = cnt("late");
//         const half_day = cnt("half_day");
//         const holiday = cnt("holiday");
//         const week_off = cnt("week_off");
//         const attendable = logs.length - holiday - week_off;
//         return {
//             present_days: String(present),
//             absent_days: String(cnt("absent")),
//             late_days: String(late),
//             half_days: String(half_day),
//             leave_days: String(cnt("leave")),
//             holiday_days: String(holiday),
//             week_off_days: String(week_off),
//             total_work_hours: (logs.reduce((s, r) => s + (r.total_work_minutes ?? 0), 0) / 60).toFixed(2),
//             total_overtime_hours: (logs.reduce((s, r) => s + (r.overtime_minutes ?? 0), 0) / 60).toFixed(2),
//         };
//     }, [summary, logs]);

//     /* attendance % */
//     const attendable = logs.length - Number(summaryData.holiday_days ?? 0) - Number(summaryData.week_off_days ?? 0);
//     const presentDays = Number(summaryData.present_days ?? 0) + Number(summaryData.late_days ?? 0) + Number(summaryData.half_days ?? 0) * 0.5;
//     const pct = attendable > 0 ? (presentDays / attendable) * 100 : 0;

//     /* ── Client-side status filter ── */
//     const filteredLogs = useMemo(() => {
//         if (!statusFilter) return logs;
//         return logs.filter((r) => r.status === statusFilter);
//     }, [logs, statusFilter]);

//     /* ── Month navigation ── */
//     const goPrev = () => {
//         const d = new Date(year, month - 1, 1);
//         setYear(d.getFullYear()); setMonth(d.getMonth());
//     };
//     const goNext = () => {
//         const d = new Date(year, month + 1, 1);
//         setYear(d.getFullYear());
//         setMonth(d.getMonth());
//     };
//     const handleMonthChange = (y, m) => { setYear(y); setMonth(m); };
//     const isCurrentMonth = new Date(year, month) >= new Date(now.getFullYear(), now.getMonth());

//     /* ── Check-in / Check-out ── */
//     const handleCheckIn = async () => {
//         setCheckBusy(true);
//         try {
//             const res = await checkInAttendance({ employee_id: employeeId });
//             setTodayRecord(res?.data ?? res);
//             loadRecords();
//         } catch (e) { alert(e?.response?.data?.message ?? e.message); }
//         finally { setCheckBusy(false); }
//     };

//     const handleCheckOut = async () => {
//         setCheckBusy(true);
//         try {
//             const res = await checkOutAttendance({ employee_id: employeeId });
//             setTodayRecord(res?.data ?? res);
//             loadRecords();
//         } catch (e) { alert(e?.response?.data?.message ?? e.message); }
//         finally { setCheckBusy(false); }
//     };

//     /* ── Manual save (add/edit) ── */
//     const handleSave = async (payload, id) => {
//         if (id) {
//             await dispatch(editAttendance({ id, payload })).unwrap();
//         } else {
//             await dispatch(markAttendance({ ...payload, employee_id: employeeId })).unwrap();
//         }
//         loadRecords();
//         loadToday();
//     };

//     /* ── Delete ── */
//     const handleDelete = async (id) => {
//         setDeletingId(id);
//         try {
//             await dispatch(removeAttendance(id)).unwrap();
//             loadRecords();
//             loadToday();
//         } finally {
//             setDeletingId(null);
//         }
//     };

//     const openEdit = (r) => { setEditTarget(r); setShowManual(true); };
//     const closeModal = () => { setShowManual(false); setEditTarget(null); };

//     /* ── Today status helpers ── */
//     const hasCheckedIn = Boolean(todayRecord?.check_in);
//     const hasCheckedOut = Boolean(todayRecord?.check_out);
//     const todayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

//     return (
//         <div className="ma-page min-h-screen p-5 sm:p-6">

//             {/* ── Page header ── */}
//             <div className="flex items-start justify-between mb-5">
//                 <div>
//                     <h1 className="ma-title text-2xl font-bold">My Attendance</h1>
//                     <p className="ma-subtitle text-[13.5px] mt-1">
//                         Track your daily attendance, work hours and leave records.
//                     </p>
//                 </div>
//                 <button onClick={() => { setEditTarget(null); setShowManual(true); }}
//                     className="ma-manual-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors">
//                     <Plus size={15} /> Manual Entry
//                 </button>
//             </div>

//             {/* ── Today card ── */}
//             <div className="ma-today-card rounded-2xl px-5 py-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
//                 <div>
//                     <p className="ma-today-label text-[12px] uppercase tracking-wide mb-1">Today</p>
//                     <p className="ma-today-date text-[15px] font-bold">{todayStr}</p>
//                     {todayRecord?.status && (
//                         <p className="ma-today-status text-[13px] mt-0.5 capitalize flex items-center gap-2">
//                             <span className={`ma-status ma-status-${todayRecord.status}`}>
//                                 {todayRecord.status.replace("_", " ")}
//                             </span>
//                             {todayRecord.check_in && (
//                                 <span className="ma-cell-muted text-[12px]">
//                                     in {fmtTime(todayRecord.check_in)}
//                                     {todayRecord.check_out ? ` · out ${fmtTime(todayRecord.check_out)}` : ""}
//                                 </span>
//                             )}
//                         </p>
//                     )}
//                     {!todayRecord && !todayLoading && (
//                         <p className="ma-cell-muted text-[13px] mt-0.5">No record for today yet</p>
//                     )}
//                 </div>

//                 <div className="flex items-center gap-3">
//                     {/* Check-in button */}
//                     {!hasCheckedIn && (
//                         <button onClick={handleCheckIn} disabled={checkBusy || todayLoading}
//                             className="ma-checkin-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all active:scale-[0.97] disabled:opacity-60">
//                             <LogIn size={16} /> Check In
//                         </button>
//                     )}

//                     {/* Check-out button */}
//                     {hasCheckedIn && !hasCheckedOut && (
//                         <button onClick={handleCheckOut} disabled={checkBusy}
//                             className="ma-checkout-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all active:scale-[0.97] disabled:opacity-60">
//                             <LogOut size={16} /> Check Out
//                         </button>
//                     )}

//                     {/* Refresh today */}
//                     <button onClick={loadToday} disabled={todayLoading}
//                         className="ma-manual-btn w-9 h-9 rounded-xl flex items-center justify-center transition-colors">
//                         <RefreshCw size={14} className={todayLoading ? "animate-spin" : ""} />
//                     </button>
//                 </div>
//             </div>

//             {/* ── Stat cards ── */}
//             {logs.length > 0 && (
//                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5">
//                     {/* Ring */}
//                     <div className="ma-stat-card rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
//                         <Ring pct={pct} />
//                         <p className="ma-stat-label text-[12px] text-center mt-1">
//                             {presentDays.toFixed(0)} of {attendable} working days
//                         </p>
//                     </div>
//                     <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
//                         <StatCard icon={UserCheck} bg="ma-icon-present-bg" color="ma-icon-present" value={summaryData.present_days ?? 0} label="Present" />
//                         <StatCard icon={UserX} bg="ma-icon-absent-bg" color="ma-icon-absent" value={summaryData.absent_days ?? 0} label="Absent" />
//                         <StatCard icon={Clock} bg="ma-icon-late-bg" color="ma-icon-late" value={summaryData.late_days ?? 0} label="Late" />
//                         <StatCard icon={Umbrella} bg="ma-icon-leave-bg" color="ma-icon-leave" value={summaryData.leave_days ?? 0} label="Leave" />
//                         <StatCard icon={Timer} bg="ma-icon-work-bg" color="ma-icon-work" value={`${summaryData.total_work_hours ?? "0.00"}h`} label="Work Hours" />
//                         <StatCard icon={TrendingUp} bg="ma-icon-ot-bg" color="ma-icon-ot" value={`${summaryData.total_overtime_hours ?? "0.00"}h`} label="Overtime" />
//                     </div>
//                 </div>
//             )}

//             {/* ── Filter / control bar ── */}
//             <div className="ma-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">

//                 {/* Month nav */}
//                 <div className="flex items-center gap-1">
//                     <button onClick={goPrev}
//                         className="ma-action-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[16px]">‹</button>
//                     <span className="ma-cell-primary text-[13.5px] font-semibold px-2 min-w-[110px] text-center">
//                         {MONTHS_S[month]} {year}
//                     </span>
//                     <button onClick={goNext} disabled={isCurrentMonth}
//                         className="ma-action-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[16px] disabled:opacity-40">›</button>
//                 </div>

//                 {/* Status filter */}
//                 <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
//                     className="ma-select rounded-lg px-3.5 py-2.5 text-[13.5px]">
//                     <option value="">All Status</option>
//                     {["present", "absent", "late", "half_day", "leave", "holiday", "week_off"].map((s) => (
//                         <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
//                     ))}
//                 </select>

//                 {/* View toggle */}
//                 <div className="ma-view-toggle flex rounded-lg overflow-hidden">
//                     <button onClick={() => setViewMode("calendar")}
//                         className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors
//               ${viewMode === "calendar" ? "ma-view-btn-active" : "ma-view-btn"}`}>
//                         <Calendar size={13} /> Calendar
//                     </button>
//                     <button onClick={() => setViewMode("table")}
//                         className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors
//               ${viewMode === "table" ? "ma-view-btn-active" : "ma-view-btn"}`}>
//                         <List size={13} /> Table
//                     </button>
//                 </div>

//                 <span className="ma-count-text text-[12.5px] ml-auto">
//                     {filteredLogs.length} record{filteredLogs.length !== 1 ? "s" : ""} · {MONTHS_F[month]} {year}
//                 </span>

//                 <button onClick={() => { loadRecords(); loadToday(); }} disabled={loading}
//                     className="ma-manual-btn w-8 h-8 rounded-lg flex items-center justify-center">
//                     <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
//                 </button>
//             </div>

//             {/* ── Loading ── */}
//             {loading && (
//                 <div className="ma-table-card rounded-2xl p-10 text-center">
//                     <p className="ma-cell-muted text-[14px]">Loading attendance…</p>
//                 </div>
//             )}

//             {/* ── Error ── */}
//             {!loading && reduxErr && (
//                 <div className="ma-table-card rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
//                     <p className="text-[14px] font-semibold" style={{ color: "var(--danger)" }}>Failed to load attendance</p>
//                     <p className="ma-cell-muted text-[13px]">{typeof reduxErr === "string" ? reduxErr : "Please try again"}</p>
//                     <button onClick={loadRecords} className="ma-manual-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold mt-1">
//                         <RefreshCw size={13} /> Retry
//                     </button>
//                 </div>
//             )}

//             {/* ── No data ── */}
//             {!loading && !reduxErr && filteredLogs.length === 0 && (
//                 <div className="ma-table-card rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
//                     style={{ border: "2px dashed var(--divider)" }}>
//                     <CalendarOff size={36} className="ma-cell-muted opacity-40" />
//                     <p className="ma-cell-primary text-[14px] font-semibold">
//                         No attendance records for {MONTHS_F[month]} {year}
//                     </p>
//                     <p className="ma-cell-muted text-[13px]">
//                         {statusFilter ? "Try clearing the status filter" : "Records will appear once attendance is marked"}
//                     </p>
//                 </div>
//             )}

//             {/* ── CALENDAR VIEW ── */}
//             {!loading && !reduxErr && filteredLogs.length > 0 && viewMode === "calendar" && (
//                 <MyAttendanceCalendar
//                     records={filteredLogs}
//                     year={year}
//                     month={month}
//                     onMonthChange={handleMonthChange}
//                 />
//             )}

//             {/* ── TABLE VIEW ── */}
//             {!loading && !reduxErr && filteredLogs.length > 0 && viewMode === "table" && (
//                 <MyAttendanceTable
//                     records={filteredLogs}
//                     onEdit={openEdit}
//                     onDelete={(r) => setDeleteTarget(r)}
//                     deletingId={deletingId}
//                 />
//             )}

//             {/* ── Modals ── */}
//             <ManualAttendanceModal
//                 isOpen={showManual}
//                 onClose={closeModal}
//                 record={editTarget}
//                 onSave={handleSave}
//             />
//             <DeleteAttendanceModal
//                 isOpen={Boolean(deleteTarget)}
//                 onClose={() => setDeleteTarget(null)}
//                 record={deleteTarget}
//                 onConfirm={handleDelete}
//             />
//         </div>
//     );
// }


/*****************************  ================================== */

/**
 * MyAttendancePage.jsx — logged-in employee's own attendance
 *
 * Redux:
 *   state.auth.user                          → { id, employee_id, roles[] }
 *   state.employeeAttendance.records         → logs[]
 *   state.employeeAttendance.summary         → summary object
 *   state.employeeAttendance.loading
 *   state.employeeAttendance.error
 *
 * Actions:
 *   getEmployeeAttendanceByEmployeeId({ employeeId, filters })
 *   markAttendance(payload)      → POST /manual
 *   editAttendance({ id, payload }) → PUT /:id
 *   removeAttendance(id)         → DELETE /:id
 *
 * Service also exposes checkInAttendance / checkOutAttendance
 * which are called directly (not via slice) for simplicity.
 */
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//     getEmployeeAttendanceByEmployeeId,
//     markAttendance,
//     editAttendance,
//     removeAttendance,
// } from "../../../../redux/employeeAttendance/employeeAttendanceSlice.js";
// import {
//     checkInAttendance,
//     checkOutAttendance,
//     getTodayAttendance,
// } from "../../../../redux/employeeAttendance/employeeAttendance.service.js";

// import MyAttendanceCalendar from "../components/MyAttendanceCalendar.jsx";
// import MyAttendanceTable from "../components/MyAttendanceTable.jsx";
// import { ManualAttendanceModal, DeleteAttendanceModal } from "../components/MyAttendanceModals.jsx";
// import Pagination from "../../../../common/components/table/Pagination.jsx";
// import usePagination from "../../../../common/components/table/usePagination.jsx";
// import "../styles/MyAttendance.css";

// import {
//     UserCheck, UserX, Clock, Umbrella,
//     CalendarOff, Timer, TrendingUp,
//     Calendar, List, RefreshCw, Plus, LogIn, LogOut,
// } from "lucide-react";

// /* ── helpers ── */
// const pad = (n) => String(n).padStart(2, "0");
// const ymFirst = (y, m) => `${y}-${pad(m + 1)}-01`;
// const ymLast = (y, m) => `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`;
// const MONTHS_S = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// const MONTHS_F = ["January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"];

// function fmtTime(v) {
//     if (!v) return null;
//     const d = new Date(v);
//     return isNaN(d) ? null : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
// }
// function fmtMins(m) {
//     if (!m && m !== 0) return "0m";
//     const h = Math.floor(m / 60), min = m % 60;
//     if (h === 0) return `${min}m`;
//     return min === 0 ? `${h}h` : `${h}h ${min}m`;
// }

// /* ── Stat card ── */
// function StatCard({ icon: Icon, bg, color, value, label, sub }) {
//     return (
//         <div className="ma-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
//             <div className={`${bg} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
//                 <Icon size={20} className={color} />
//             </div>
//             <div>
//                 <p className="ma-stat-value text-xl font-bold leading-none">{value}</p>
//                 <p className="ma-stat-label text-[12.5px] mt-0.5">{label}</p>
//                 {sub && <p className="ma-cell-muted text-[11px] mt-0.5">{sub}</p>}
//             </div>
//         </div>
//     );
// }

// /* ── Attendance % ring ── */
// function Ring({ pct }) {
//     const r = 36;
//     const circ = 2 * Math.PI * r;
//     const dash = ((pct ?? 0) / 100) * circ;
//     const color = pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)";
//     return (
//         <div className="flex flex-col items-center">
//             <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: "rotate(-90deg)" }}>
//                 <circle cx="46" cy="46" r={r} fill="none" strokeWidth="8" className="ma-ring-track" />
//                 <circle cx="46" cy="46" r={r} fill="none" strokeWidth="8"
//                     stroke={color} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
//             </svg>
//             <div style={{ marginTop: "-62px", textAlign: "center" }}>
//                 <p className="text-[20px] font-extrabold" style={{ color }}>{Math.round(pct ?? 0)}%</p>
//                 <p className="ma-cell-muted text-[10px]">Present</p>
//             </div>
//             <div style={{ marginTop: "30px" }} />
//         </div>
//     );
// }

// /* ══════════════════════════════════════════════════════
//    MAIN PAGE
// ══════════════════════════════════════════════════════ */
// export default function MyEmployeeAttendancePage() {
//     const dispatch = useDispatch();
//     const now = new Date();

//     /* ── Auth ── */
//     const { user } = useSelector((s) => s.auth);
//     /* employee_id may be nested under user object — adjust if different */
//     const employeeId = user?.employee_id ?? user?.id;

//     /* ── Redux state ── */
//     const records = useSelector((s) => s.employeeAttendance?.records ?? []);
//     const summary = useSelector((s) => s.employeeAttendance?.summary ?? null);
//     const loading = useSelector((s) => s.employeeAttendance?.loading ?? false);
//     const reduxErr = useSelector((s) => s.employeeAttendance?.error ?? null);

//     /* ── UI state ── */
//     const [year, setYear] = useState(now.getFullYear());
//     const [month, setMonth] = useState(now.getMonth());
//     const [statusFilter, setStatusFilter] = useState("");
//     const [viewMode, setViewMode] = useState("calendar");
//     const [deletingId, setDeletingId] = useState(null);

//     /* today attendance for check-in/out */
//     const [todayRecord, setTodayRecord] = useState(null);
//     const [todayLoading, setTodayLoading] = useState(false);
//     const [checkBusy, setCheckBusy] = useState(false);

//     /* modals */
//     const [showManual, setShowManual] = useState(false);
//     const [editTarget, setEditTarget] = useState(null);
//     const [deleteTarget, setDeleteTarget] = useState(null);

//     /* ── Fetch monthly records ── */
//     /* ── Fetch monthly records — always returns a Promise ── */
//     const loadRecords = useCallback(() => {
//         if (!employeeId) return Promise.resolve();
//         return dispatch(
//             getEmployeeAttendanceByEmployeeId({
//                 employeeId,
//                 filters: {
//                     from_date: ymFirst(year, month),
//                     to_date: ymLast(year, month),
//                     month: month + 1,
//                     year,
//                     /* status filter applied client-side so calendar has full month data */
//                 },
//             }),
//         ).unwrap().catch(() => null);
//     }, [dispatch, employeeId, year, month]);

//     useEffect(() => { loadRecords(); }, [loadRecords]);

//     /* ── Normalise today API response ── */
//     const normaliseTodayRes = useCallback((res) => {
//         if (!res) return null;
//         /* GET /today → { success, data: record } or { success, data: [] } */
//         if (Array.isArray(res?.data)) {
//             return res.data.find((r) => String(r.employee_id) === String(employeeId)) ?? null;
//         }
//         if (res?.data && typeof res.data === "object") return res.data;
//         if (res && typeof res === "object" && res.id) return res;
//         return null;
//     }, [employeeId]);

//     /* ── Fetch today's record ── */
//     const loadToday = useCallback(async () => {
//         if (!employeeId) return;
//         setTodayLoading(true);
//         try {
//             const res = await getTodayAttendance();
//             setTodayRecord(normaliseTodayRes(res));
//         } catch {
//             setTodayRecord(null);
//         } finally {
//             setTodayLoading(false);
//         }
//     }, [employeeId, normaliseTodayRes]);

//     useEffect(() => { loadToday(); }, [loadToday]);

//     /* ── Normalise records ──
//        Shape A: records is array
//        Shape B: records is { summary, logs } object                  */
//     const logs = useMemo(() => {
//         if (Array.isArray(records)) return records;
//         if (Array.isArray(records?.logs)) return records.logs;
//         return [];
//     }, [records]);

//     const summaryData = useMemo(() => {
//         if (summary && typeof summary === "object") return summary;
//         /* derive from logs */
//         const cnt = (s) => logs.filter(r => r.status === s).length;
//         const present = cnt("present");
//         const late = cnt("late");
//         const half_day = cnt("half_day");
//         const holiday = cnt("holiday");
//         const week_off = cnt("week_off");
//         const attendable = logs.length - holiday - week_off;
//         return {
//             present_days: String(present),
//             absent_days: String(cnt("absent")),
//             late_days: String(late),
//             half_days: String(half_day),
//             leave_days: String(cnt("leave")),
//             holiday_days: String(holiday),
//             week_off_days: String(week_off),
//             total_work_hours: (logs.reduce((s, r) => s + (r.total_work_minutes ?? 0), 0) / 60).toFixed(2),
//             total_overtime_hours: (logs.reduce((s, r) => s + (r.overtime_minutes ?? 0), 0) / 60).toFixed(2),
//         };
//     }, [summary, logs]);

//     /* attendance % */
//     const attendable = logs.length - Number(summaryData.holiday_days ?? 0) - Number(summaryData.week_off_days ?? 0);
//     const presentDays = Number(summaryData.present_days ?? 0) + Number(summaryData.late_days ?? 0) + Number(summaryData.half_days ?? 0) * 0.5;
//     const pct = attendable > 0 ? (presentDays / attendable) * 100 : 0;

//     /* ── Client-side status filter ── */
//     const filteredLogs = useMemo(() => {
//         if (!statusFilter) return logs;
//         return logs.filter((r) => r.status === statusFilter);
//     }, [logs, statusFilter]);

//     /* ── Month navigation ── */
//     const goPrev = () => { const d = new Date(year, month - 1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()); };
//     const goNext = () => { const d = new Date(year, month + 1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()); };
//     const handleMonthChange = (y, m) => { setYear(y); setMonth(m); };
//     const isCurrentMonth = new Date(year, month) >= new Date(now.getFullYear(), now.getMonth());

//     /* ── Check-in ── */
//     const handleCheckIn = async () => {
//         setCheckBusy(true);
//         try {
//             const res = await checkInAttendance({ employee_id: employeeId });
//             /* immediately update today card from response */
//             const rec = normaliseTodayRes(res) ?? res?.data ?? res;
//             if (rec?.id) setTodayRecord(rec);
//             /* await so table/calendar re-renders with new record */
//             await loadRecords();
//             /* also refresh today in background for accuracy */
//             loadToday();
//         } catch (e) {
//             alert(e?.response?.data?.message ?? e?.message ?? "Check-in failed");
//         } finally {
//             setCheckBusy(false);
//         }
//     };

//     /* ── Check-out ── */
//     const handleCheckOut = async () => {
//         setCheckBusy(true);
//         try {
//             const res = await checkOutAttendance({ employee_id: employeeId });
//             /* immediately patch check_out on the today record */
//             const rec = normaliseTodayRes(res) ?? res?.data ?? res;
//             if (rec?.id) {
//                 setTodayRecord(rec);
//             } else if (todayRecord?.id) {
//                 /* if response doesn't return full record, patch locally */
//                 setTodayRecord((prev) => ({
//                     ...prev,
//                     check_out: rec?.check_out ?? new Date().toISOString(),
//                 }));
//             }
//             /* await so table/calendar shows updated record */
//             await loadRecords();
//             loadToday();
//         } catch (e) {
//             alert(e?.response?.data?.message ?? e?.message ?? "Check-out failed");
//         } finally {
//             setCheckBusy(false);
//         }
//     };

//     /* ── Manual save (add / edit) ── */
//     const handleSave = async (payload, id) => {
//         if (id) {
//             await dispatch(editAttendance({ id, payload })).unwrap();
//         } else {
//             await dispatch(markAttendance({ ...payload, employee_id: employeeId })).unwrap();
//         }
//         /* await records refresh so UI updates immediately on modal close */
//         await loadRecords();
//         loadToday();
//     };

//     /* ── Delete ── */
//     const handleDelete = async (id) => {
//         setDeletingId(id);
//         try {
//             await dispatch(removeAttendance(id)).unwrap();
//             await loadRecords();
//             loadToday();
//         } finally {
//             setDeletingId(null);
//         }
//     };

//     const openEdit = (r) => { setEditTarget(r); setShowManual(true); };
//     const closeModal = () => { setShowManual(false); setEditTarget(null); };

//     /* ── Today status helpers ── */
//     const hasCheckedIn = Boolean(todayRecord?.check_in);
//     const hasCheckedOut = Boolean(todayRecord?.check_out);
//     const todayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

//     return (
//         <div className="ma-page min-h-screen p-5 sm:p-6">

//             {/* ── Page header ── */}
//             <div className="flex items-start justify-between mb-5">
//                 <div>
//                     <h1 className="ma-title text-2xl font-bold">My Attendance</h1>
//                     <p className="ma-subtitle text-[13.5px] mt-1">
//                         Track your daily attendance, work hours and leave records.
//                     </p>
//                 </div>
//                 <button onClick={() => { setEditTarget(null); setShowManual(true); }}
//                     className="ma-manual-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors">
//                     <Plus size={15} /> Manual Entry
//                 </button>
//             </div>

//             {/* ── Today card ── */}
//             <div className="ma-today-card rounded-2xl px-5 py-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
//                 <div>
//                     <p className="ma-today-label text-[12px] uppercase tracking-wide mb-1">Today</p>
//                     <p className="ma-today-date text-[15px] font-bold">{todayStr}</p>
//                     {todayRecord?.status && (
//                         <p className="ma-today-status text-[13px] mt-0.5 capitalize flex items-center gap-2">
//                             <span className={`ma-status ma-status-${todayRecord.status}`}>
//                                 {todayRecord.status.replace("_", " ")}
//                             </span>
//                             {todayRecord.check_in && (
//                                 <span className="ma-cell-muted text-[12px]">
//                                     in {fmtTime(todayRecord.check_in)}
//                                     {todayRecord.check_out ? ` · out ${fmtTime(todayRecord.check_out)}` : ""}
//                                 </span>
//                             )}
//                         </p>
//                     )}
//                     {!todayRecord && !todayLoading && (
//                         <p className="ma-cell-muted text-[13px] mt-0.5">No record for today yet</p>
//                     )}
//                 </div>

//                 <div className="flex items-center gap-3">
//                     {/* Check-in button */}
//                     {!hasCheckedIn && (
//                         <button onClick={handleCheckIn} disabled={checkBusy || todayLoading}
//                             className="ma-checkin-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all active:scale-[0.97] disabled:opacity-60">
//                             <LogIn size={16} /> Check In
//                         </button>
//                     )}

//                     {/* Check-out button */}
//                     {hasCheckedIn && !hasCheckedOut && (
//                         <button onClick={handleCheckOut} disabled={checkBusy}
//                             className="ma-checkout-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all active:scale-[0.97] disabled:opacity-60">
//                             <LogOut size={16} /> Check Out
//                         </button>
//                     )}

//                     {/* Refresh today */}
//                     <button onClick={loadToday} disabled={todayLoading}
//                         className="ma-manual-btn w-9 h-9 rounded-xl flex items-center justify-center transition-colors">
//                         <RefreshCw size={14} className={todayLoading ? "animate-spin" : ""} />
//                     </button>
//                 </div>
//             </div>

//             {/* ── Stat cards ── */}
//             {logs.length > 0 && (
//                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5">
//                     {/* Ring */}
//                     <div className="ma-stat-card rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
//                         <Ring pct={pct} />
//                         <p className="ma-stat-label text-[12px] text-center mt-1">
//                             {presentDays.toFixed(0)} of {attendable} working days
//                         </p>
//                     </div>
//                     <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
//                         <StatCard icon={UserCheck} bg="ma-icon-present-bg" color="ma-icon-present" value={summaryData.present_days ?? 0} label="Present" />
//                         <StatCard icon={UserX} bg="ma-icon-absent-bg" color="ma-icon-absent" value={summaryData.absent_days ?? 0} label="Absent" />
//                         <StatCard icon={Clock} bg="ma-icon-late-bg" color="ma-icon-late" value={summaryData.late_days ?? 0} label="Late" />
//                         <StatCard icon={Umbrella} bg="ma-icon-leave-bg" color="ma-icon-leave" value={summaryData.leave_days ?? 0} label="Leave" />
//                         <StatCard icon={Timer} bg="ma-icon-work-bg" color="ma-icon-work" value={`${summaryData.total_work_hours ?? "0.00"}h`} label="Work Hours" />
//                         <StatCard icon={TrendingUp} bg="ma-icon-ot-bg" color="ma-icon-ot" value={`${summaryData.total_overtime_hours ?? "0.00"}h`} label="Overtime" />
//                     </div>
//                 </div>
//             )}

//             {/* ── Filter / control bar ── */}
//             <div className="ma-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">

//                 {/* Month nav */}
//                 <div className="flex items-center gap-1">
//                     <button onClick={goPrev}
//                         className="ma-action-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[16px]">‹</button>
//                     <span className="ma-cell-primary text-[13.5px] font-semibold px-2 min-w-[110px] text-center">
//                         {MONTHS_S[month]} {year}
//                     </span>
//                     <button onClick={goNext} disabled={isCurrentMonth}
//                         className="ma-action-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[16px] disabled:opacity-40">›</button>
//                 </div>

//                 {/* Status filter */}
//                 <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
//                     className="ma-select rounded-lg px-3.5 py-2.5 text-[13.5px]">
//                     <option value="">All Status</option>
//                     {["present", "absent", "late", "half_day", "leave", "holiday", "week_off"].map((s) => (
//                         <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
//                     ))}
//                 </select>

//                 {/* View toggle */}
//                 <div className="ma-view-toggle flex rounded-lg overflow-hidden">
//                     <button onClick={() => setViewMode("calendar")}
//                         className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors
//               ${viewMode === "calendar" ? "ma-view-btn-active" : "ma-view-btn"}`}>
//                         <Calendar size={13} /> Calendar
//                     </button>
//                     <button onClick={() => setViewMode("table")}
//                         className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors
//               ${viewMode === "table" ? "ma-view-btn-active" : "ma-view-btn"}`}>
//                         <List size={13} /> Table
//                     </button>
//                 </div>

//                 <span className="ma-count-text text-[12.5px] ml-auto">
//                     {filteredLogs.length} record{filteredLogs.length !== 1 ? "s" : ""} · {MONTHS_F[month]} {year}
//                 </span>

//                 <button onClick={() => { loadRecords(); loadToday(); }} disabled={loading}
//                     className="ma-manual-btn w-8 h-8 rounded-lg flex items-center justify-center">
//                     <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
//                 </button>
//             </div>

//             {/* ── Loading ── */}
//             {loading && (
//                 <div className="ma-table-card rounded-2xl p-10 text-center">
//                     <p className="ma-cell-muted text-[14px]">Loading attendance…</p>
//                 </div>
//             )}

//             {/* ── Error ── */}
//             {!loading && reduxErr && (
//                 <div className="ma-table-card rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
//                     <p className="text-[14px] font-semibold" style={{ color: "var(--danger)" }}>Failed to load attendance</p>
//                     <p className="ma-cell-muted text-[13px]">{typeof reduxErr === "string" ? reduxErr : "Please try again"}</p>
//                     <button onClick={loadRecords} className="ma-manual-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold mt-1">
//                         <RefreshCw size={13} /> Retry
//                     </button>
//                 </div>
//             )}

//             {/* ── No data ── */}
//             {!loading && !reduxErr && filteredLogs.length === 0 && (
//                 <div className="ma-table-card rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
//                     style={{ border: "2px dashed var(--divider)" }}>
//                     <CalendarOff size={36} className="ma-cell-muted opacity-40" />
//                     <p className="ma-cell-primary text-[14px] font-semibold">
//                         No attendance records for {MONTHS_F[month]} {year}
//                     </p>
//                     <p className="ma-cell-muted text-[13px]">
//                         {statusFilter ? "Try clearing the status filter" : "Records will appear once attendance is marked"}
//                     </p>
//                 </div>
//             )}

//             {/* ── CALENDAR VIEW ── */}
//             {!loading && !reduxErr && filteredLogs.length > 0 && viewMode === "calendar" && (
//                 <MyAttendanceCalendar
//                     records={filteredLogs}
//                     year={year}
//                     month={month}
//                     onMonthChange={handleMonthChange}
//                 />
//             )}

//             {/* ── TABLE VIEW ── */}
//             {!loading && !reduxErr && filteredLogs.length > 0 && viewMode === "table" && (
//                 <MyAttendanceTable
//                     records={filteredLogs}
//                     onEdit={openEdit}
//                     onDelete={(r) => setDeleteTarget(r)}
//                     deletingId={deletingId}
//                 />
//             )}

//             {/* ── Modals ── */}
//             <ManualAttendanceModal
//                 isOpen={showManual}
//                 onClose={closeModal}
//                 record={editTarget}
//                 onSave={handleSave}
//             />
//             <DeleteAttendanceModal
//                 isOpen={Boolean(deleteTarget)}
//                 onClose={() => setDeleteTarget(null)}
//                 record={deleteTarget}
//                 onConfirm={handleDelete}
//             />
//         </div>
//     );
// }

/*****************************  ================================== */

/**
 * MyAttendancePage.jsx — logged-in employee's own attendance
 *
 * Redux:
 *   state.auth.user                          → { id, employee_id, roles[] }
 *   state.employeeAttendance.records         → logs[]
 *   state.employeeAttendance.summary         → summary object
 *   state.employeeAttendance.loading
 *   state.employeeAttendance.error
 *
 * Actions:
 *   getEmployeeAttendanceByEmployeeId({ employeeId, filters })
 *   markAttendance(payload)      → POST /manual
 *   editAttendance({ id, payload }) → PUT /:id
 *   removeAttendance(id)         → DELETE /:id
 *
 * Service also exposes checkInAttendance / checkOutAttendance
 * which are called directly (not via slice) for simplicity.
 */
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//     getEmployeeAttendanceByEmployeeId,
//     markAttendance,
//     editAttendance,
//     removeAttendance,
// } from "../../../../redux/employeeAttendance/employeeAttendanceSlice.js";
// import {
//     checkInAttendance,
//     checkOutAttendance,
//     getTodayAttendance,
// } from "../../../../redux/employeeAttendance/employeeAttendance.service.js";

// import MyAttendanceCalendar from "../components/MyAttendanceCalendar.jsx";
// import MyAttendanceTable from "../components/MyAttendanceTable.jsx";
// import { ManualAttendanceModal, DeleteAttendanceModal } from "../components/MyAttendanceModals.jsx";
// import Pagination from "../../../../common/components/table/Pagination.jsx";
// import usePagination from "../../../../common/components/table/usePagination.jsx";
// import "../styles/MyAttendance.css";

// import {
//     UserCheck, UserX, Clock, Umbrella,
//     CalendarOff, Timer, TrendingUp,
//     Calendar, List, RefreshCw, Plus, LogIn, LogOut,
// } from "lucide-react";

// /* ── helpers ── */
// const pad = (n) => String(n).padStart(2, "0");
// const ymFirst = (y, m) => `${y}-${pad(m + 1)}-01`;
// const ymLast = (y, m) => `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`;
// const MONTHS_S = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// const MONTHS_F = ["January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"];

// function fmtTime(v) {
//     if (!v) return null;
//     const d = new Date(v);
//     return isNaN(d) ? null : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
// }
// function fmtMins(m) {
//     if (!m && m !== 0) return "0m";
//     const h = Math.floor(m / 60), min = m % 60;
//     if (h === 0) return `${min}m`;
//     return min === 0 ? `${h}h` : `${h}h ${min}m`;
// }

// /* ── Stat card ── */
// function StatCard({ icon: Icon, bg, color, value, label, sub }) {
//     return (
//         <div className="ma-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
//             <div className={`${bg} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
//                 <Icon size={20} className={color} />
//             </div>
//             <div>
//                 <p className="ma-stat-value text-xl font-bold leading-none">{value}</p>
//                 <p className="ma-stat-label text-[12.5px] mt-0.5">{label}</p>
//                 {sub && <p className="ma-cell-muted text-[11px] mt-0.5">{sub}</p>}
//             </div>
//         </div>
//     );
// }

// /* ── Attendance % ring ── */
// function Ring({ pct }) {
//     const r = 36;
//     const circ = 2 * Math.PI * r;
//     const dash = ((pct ?? 0) / 100) * circ;
//     const color = pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)";
//     return (
//         <div className="flex flex-col items-center">
//             <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: "rotate(-90deg)" }}>
//                 <circle cx="46" cy="46" r={r} fill="none" strokeWidth="8" className="ma-ring-track" />
//                 <circle cx="46" cy="46" r={r} fill="none" strokeWidth="8"
//                     stroke={color} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
//             </svg>
//             <div style={{ marginTop: "-62px", textAlign: "center" }}>
//                 <p className="text-[20px] font-extrabold" style={{ color }}>{Math.round(pct ?? 0)}%</p>
//                 <p className="ma-cell-muted text-[10px]">Present</p>
//             </div>
//             <div style={{ marginTop: "30px" }} />
//         </div>
//     );
// }

// /* ══════════════════════════════════════════════════════
//    MAIN PAGE
// ══════════════════════════════════════════════════════ */
// export default function MyEmployeeAttendancePage() {
//     const dispatch = useDispatch();
//     const now = new Date();

//     /* ── Auth ── */
//     const { user } = useSelector((s) => s.auth);
//     /* employee_id may be nested under user object — adjust if different */
//     const employeeId = user?.employee_id ?? user?.id;

//     /* ── Redux state ── */
//     const records = useSelector((s) => s.employeeAttendance?.records ?? []);
//     const summary = useSelector((s) => s.employeeAttendance?.summary ?? null);
//     const loading = useSelector((s) => s.employeeAttendance?.loading ?? false);
//     const reduxErr = useSelector((s) => s.employeeAttendance?.error ?? null);

//     /* ── UI state ── */
//     const [year, setYear] = useState(now.getFullYear());
//     const [month, setMonth] = useState(now.getMonth());
//     const [statusFilter, setStatusFilter] = useState("");
//     const [viewMode, setViewMode] = useState("calendar");
//     const [deletingId, setDeletingId] = useState(null);

//     /* today attendance for check-in/out */
//     const [todayRecord, setTodayRecord] = useState(null);
//     const [todayLoading, setTodayLoading] = useState(false);
//     const [checkBusy, setCheckBusy] = useState(false);

//     /* modals */
//     const [showManual, setShowManual] = useState(false);
//     const [editTarget, setEditTarget] = useState(null);
//     const [deleteTarget, setDeleteTarget] = useState(null);

//     /* ── Fetch monthly records ── */
//     /* ── Fetch monthly records — always returns a Promise ── */
//     const loadRecords = useCallback(() => {
//         if (!employeeId) return Promise.resolve();
//         return dispatch(
//             getEmployeeAttendanceByEmployeeId({
//                 employeeId,
//                 filters: {
//                     from_date: ymFirst(year, month),
//                     to_date: ymLast(year, month),
//                     month: month + 1,
//                     year,
//                     /* status filter applied client-side so calendar has full month data */
//                 },
//             }),
//         ).unwrap().catch(() => null);
//     }, [dispatch, employeeId, year, month]);

//     useEffect(() => { loadRecords(); }, [loadRecords]);

//     /* ── Normalise today API response ── */
//     const normaliseTodayRes = useCallback((res) => {
//         if (!res) return null;
//         /* GET /today → { success, data: record } or { success, data: [] } */
//         if (Array.isArray(res?.data)) {
//             return res.data.find((r) => String(r.employee_id) === String(employeeId)) ?? null;
//         }
//         if (res?.data && typeof res.data === "object") return res.data;
//         if (res && typeof res === "object" && res.id) return res;
//         return null;
//     }, [employeeId]);

//     /* ── Fetch today's record ── */
//     const loadToday = useCallback(async () => {
//         if (!employeeId) return;
//         setTodayLoading(true);
//         try {
//             const res = await getTodayAttendance();
//             setTodayRecord(normaliseTodayRes(res));
//         } catch {
//             setTodayRecord(null);
//         } finally {
//             setTodayLoading(false);
//         }
//     }, [employeeId, normaliseTodayRes]);

//     useEffect(() => { loadToday(); }, [loadToday]);

//     /* ── Normalise records ──
//        The slice now stores state.records as a plain array (all shapes handled).
//        Guard here just in case of unexpected shapes.                          */
//     const logs = useMemo(() => {
//         if (Array.isArray(records)) return records;          // ✅ normal (slice normalised)
//         if (Array.isArray(records?.logs)) return records.logs;     // fallback Shape B
//         if (Array.isArray(records?.data)) return records.data;     // fallback Shape A
//         if (Array.isArray(records?.data?.logs)) return records.data.logs; // fallback Shape B nested
//         return [];
//     }, [records]);

//     const summaryData = useMemo(() => {
//         // Prefer Redux summary (populated by Shape B responses)
//         if (summary && typeof summary === "object" && !Array.isArray(summary)) {
//             return summary;
//         }
//         // Derive from logs array (Shape A responses / no summary in response)
//         const cnt = (s) => logs.filter(r => r.status === s).length;
//         const present = cnt("present");
//         const late = cnt("late");
//         const half_day = cnt("half_day");
//         const holiday = cnt("holiday");
//         const week_off = cnt("week_off");
//         return {
//             present_days: String(present),
//             absent_days: String(cnt("absent")),
//             late_days: String(late),
//             half_days: String(half_day),
//             leave_days: String(cnt("leave")),
//             holiday_days: String(holiday),
//             week_off_days: String(week_off),
//             total_records: logs.length,
//             total_work_hours: (logs.reduce((s, r) => s + (r.total_work_minutes ?? 0), 0) / 60).toFixed(2),
//             total_overtime_hours: (logs.reduce((s, r) => s + (r.overtime_minutes ?? 0), 0) / 60).toFixed(2),
//             total_late_minutes: String(logs.reduce((s, r) => s + (r.late_minutes ?? 0), 0)),
//         };
//     }, [summary, logs]);

//     /* attendance % */
//     const attendable = logs.length - Number(summaryData.holiday_days ?? 0) - Number(summaryData.week_off_days ?? 0);
//     const presentDays = Number(summaryData.present_days ?? 0) + Number(summaryData.late_days ?? 0) + Number(summaryData.half_days ?? 0) * 0.5;
//     const pct = attendable > 0 ? (presentDays / attendable) * 100 : 0;

//     /* ── Client-side status filter ── */
//     const filteredLogs = useMemo(() => {
//         if (!statusFilter) return logs;
//         return logs.filter((r) => r.status === statusFilter);
//     }, [logs, statusFilter]);

//     /* ── Month navigation ── */
//     const goPrev = () => { const d = new Date(year, month - 1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()); };
//     const goNext = () => { const d = new Date(year, month + 1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()); };
//     const handleMonthChange = (y, m) => { setYear(y); setMonth(m); };
//     const isCurrentMonth = new Date(year, month) >= new Date(now.getFullYear(), now.getMonth());

//     /* ── Check-in ── */
//     const handleCheckIn = async () => {
//         setCheckBusy(true);
//         try {
//             const res = await checkInAttendance({ employee_id: employeeId });
//             /* immediately update today card from response */
//             const rec = normaliseTodayRes(res) ?? res?.data ?? res;
//             if (rec?.id) setTodayRecord(rec);
//             /* await so table/calendar re-renders with new record */
//             await loadRecords();
//             /* also refresh today in background for accuracy */
//             loadToday();
//         } catch (e) {
//             alert(e?.response?.data?.message ?? e?.message ?? "Check-in failed");
//         } finally {
//             setCheckBusy(false);
//         }
//     };

//     /* ── Check-out ── */
//     const handleCheckOut = async () => {
//         setCheckBusy(true);
//         try {
//             const res = await checkOutAttendance({ employee_id: employeeId });
//             /* immediately patch check_out on the today record */
//             const rec = normaliseTodayRes(res) ?? res?.data ?? res;
//             if (rec?.id) {
//                 setTodayRecord(rec);
//             } else if (todayRecord?.id) {
//                 /* if response doesn't return full record, patch locally */
//                 setTodayRecord((prev) => ({
//                     ...prev,
//                     check_out: rec?.check_out ?? new Date().toISOString(),
//                 }));
//             }
//             /* await so table/calendar shows updated record */
//             await loadRecords();
//             loadToday();
//         } catch (e) {
//             alert(e?.response?.data?.message ?? e?.message ?? "Check-out failed");
//         } finally {
//             setCheckBusy(false);
//         }
//     };

//     /* ── Manual save (add / edit) ── */
//     const handleSave = async (payload, id) => {
//         if (id) {
//             await dispatch(editAttendance({ id, payload })).unwrap();
//         } else {
//             await dispatch(markAttendance({ ...payload, employee_id: employeeId })).unwrap();
//         }
//         /* await records refresh so UI updates immediately on modal close */
//         await loadRecords();
//         loadToday();
//     };

//     /* ── Delete ── */
//     const handleDelete = async (id) => {
//         setDeletingId(id);
//         try {
//             await dispatch(removeAttendance(id)).unwrap();
//             await loadRecords();
//             loadToday();
//         } finally {
//             setDeletingId(null);
//         }
//     };

//     const openEdit = (r) => { setEditTarget(r); setShowManual(true); };
//     const closeModal = () => { setShowManual(false); setEditTarget(null); };

//     /* ── Today status helpers ── */
//     const hasCheckedIn = Boolean(todayRecord?.check_in);
//     const hasCheckedOut = Boolean(todayRecord?.check_out);
//     const todayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

//     return (
//         <div className="ma-page min-h-screen p-5 sm:p-6">

//             {/* ── Page header ── */}
//             <div className="flex items-start justify-between mb-5">
//                 <div>
//                     <h1 className="ma-title text-2xl font-bold">My Attendance</h1>
//                     <p className="ma-subtitle text-[13.5px] mt-1">
//                         Track your daily attendance, work hours and leave records.
//                     </p>
//                 </div>
//                 <button onClick={() => { setEditTarget(null); setShowManual(true); }}
//                     className="ma-manual-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors">
//                     <Plus size={15} /> Manual Entry
//                 </button>
//             </div>

//             {/* ── Today card ── */}
//             <div className="ma-today-card rounded-2xl px-5 py-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
//                 <div>
//                     <p className="ma-today-label text-[12px] uppercase tracking-wide mb-1">Today</p>
//                     <p className="ma-today-date text-[15px] font-bold">{todayStr}</p>
//                     {todayRecord?.status && (
//                         <p className="ma-today-status text-[13px] mt-0.5 capitalize flex items-center gap-2">
//                             <span className={`ma-status ma-status-${todayRecord.status}`}>
//                                 {todayRecord.status.replace("_", " ")}
//                             </span>
//                             {todayRecord.check_in && (
//                                 <span className="ma-cell-muted text-[12px]">
//                                     in {fmtTime(todayRecord.check_in)}
//                                     {todayRecord.check_out ? ` · out ${fmtTime(todayRecord.check_out)}` : ""}
//                                 </span>
//                             )}
//                         </p>
//                     )}
//                     {!todayRecord && !todayLoading && (
//                         <p className="ma-cell-muted text-[13px] mt-0.5">No record for today yet</p>
//                     )}
//                 </div>

//                 <div className="flex items-center gap-3">
//                     {/* Check-in button */}
//                     {!hasCheckedIn && (
//                         <button onClick={handleCheckIn} disabled={checkBusy || todayLoading}
//                             className="ma-checkin-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all active:scale-[0.97] disabled:opacity-60">
//                             <LogIn size={16} /> Check In
//                         </button>
//                     )}

//                     {/* Check-out button */}
//                     {hasCheckedIn && !hasCheckedOut && (
//                         <button onClick={handleCheckOut} disabled={checkBusy}
//                             className="ma-checkout-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all active:scale-[0.97] disabled:opacity-60">
//                             <LogOut size={16} /> Check Out
//                         </button>
//                     )}

//                     {/* Refresh today */}
//                     <button onClick={loadToday} disabled={todayLoading}
//                         className="ma-manual-btn w-9 h-9 rounded-xl flex items-center justify-center transition-colors">
//                         <RefreshCw size={14} className={todayLoading ? "animate-spin" : ""} />
//                     </button>
//                 </div>
//             </div>

//             {/* ── Stat cards ── */}
//             {logs.length > 0 && (
//                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5">
//                     {/* Ring */}
//                     <div className="ma-stat-card rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
//                         <Ring pct={pct} />
//                         <p className="ma-stat-label text-[12px] text-center mt-1">
//                             {presentDays.toFixed(0)} of {attendable} working days
//                         </p>
//                     </div>
//                     <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
//                         <StatCard icon={UserCheck} bg="ma-icon-present-bg" color="ma-icon-present" value={summaryData.present_days ?? 0} label="Present" />
//                         <StatCard icon={UserX} bg="ma-icon-absent-bg" color="ma-icon-absent" value={summaryData.absent_days ?? 0} label="Absent" />
//                         <StatCard icon={Clock} bg="ma-icon-late-bg" color="ma-icon-late" value={summaryData.late_days ?? 0} label="Late" />
//                         <StatCard icon={Umbrella} bg="ma-icon-leave-bg" color="ma-icon-leave" value={summaryData.leave_days ?? 0} label="Leave" />
//                         <StatCard icon={Timer} bg="ma-icon-work-bg" color="ma-icon-work" value={`${summaryData.total_work_hours ?? "0.00"}h`} label="Work Hours" />
//                         <StatCard icon={TrendingUp} bg="ma-icon-ot-bg" color="ma-icon-ot" value={`${summaryData.total_overtime_hours ?? "0.00"}h`} label="Overtime" />
//                     </div>
//                 </div>
//             )}

//             {/* ── Filter / control bar ── */}
//             <div className="ma-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">

//                 {/* Month nav */}
//                 <div className="flex items-center gap-1">
//                     <button onClick={goPrev}
//                         className="ma-action-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[16px]">‹</button>
//                     <span className="ma-cell-primary text-[13.5px] font-semibold px-2 min-w-[110px] text-center">
//                         {MONTHS_S[month]} {year}
//                     </span>
//                     <button onClick={goNext} disabled={isCurrentMonth}
//                         className="ma-action-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[16px] disabled:opacity-40">›</button>
//                 </div>

//                 {/* Status filter */}
//                 <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
//                     className="ma-select rounded-lg px-3.5 py-2.5 text-[13.5px]">
//                     <option value="">All Status</option>
//                     {["present", "absent", "late", "half_day", "leave", "holiday", "week_off"].map((s) => (
//                         <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
//                     ))}
//                 </select>

//                 {/* View toggle */}
//                 <div className="ma-view-toggle flex rounded-lg overflow-hidden">
//                     <button onClick={() => setViewMode("calendar")}
//                         className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors
//               ${viewMode === "calendar" ? "ma-view-btn-active" : "ma-view-btn"}`}>
//                         <Calendar size={13} /> Calendar
//                     </button>
//                     <button onClick={() => setViewMode("table")}
//                         className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors
//               ${viewMode === "table" ? "ma-view-btn-active" : "ma-view-btn"}`}>
//                         <List size={13} /> Table
//                     </button>
//                 </div>

//                 <span className="ma-count-text text-[12.5px] ml-auto">
//                     {filteredLogs.length} record{filteredLogs.length !== 1 ? "s" : ""} · {MONTHS_F[month]} {year}
//                 </span>

//                 <button onClick={() => { loadRecords(); loadToday(); }} disabled={loading}
//                     className="ma-manual-btn w-8 h-8 rounded-lg flex items-center justify-center">
//                     <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
//                 </button>
//             </div>

//             {/* ── Loading ── */}
//             {loading && (
//                 <div className="ma-table-card rounded-2xl p-10 text-center">
//                     <p className="ma-cell-muted text-[14px]">Loading attendance…</p>
//                 </div>
//             )}

//             {/* ── Error ── */}
//             {!loading && reduxErr && (
//                 <div className="ma-table-card rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
//                     <p className="text-[14px] font-semibold" style={{ color: "var(--danger)" }}>Failed to load attendance</p>
//                     <p className="ma-cell-muted text-[13px]">{typeof reduxErr === "string" ? reduxErr : "Please try again"}</p>
//                     <button onClick={loadRecords} className="ma-manual-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold mt-1">
//                         <RefreshCw size={13} /> Retry
//                     </button>
//                 </div>
//             )}

//             {/* ── No data ── */}
//             {!loading && !reduxErr && filteredLogs.length === 0 && (
//                 <div className="ma-table-card rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
//                     style={{ border: "2px dashed var(--divider)" }}>
//                     <CalendarOff size={36} className="ma-cell-muted opacity-40" />
//                     <p className="ma-cell-primary text-[14px] font-semibold">
//                         No attendance records for {MONTHS_F[month]} {year}
//                     </p>
//                     <p className="ma-cell-muted text-[13px]">
//                         {statusFilter ? "Try clearing the status filter" : "Records will appear once attendance is marked"}
//                     </p>
//                 </div>
//             )}

//             {/* ── CALENDAR VIEW ── */}
//             {!loading && !reduxErr && filteredLogs.length > 0 && viewMode === "calendar" && (
//                 <MyAttendanceCalendar
//                     records={filteredLogs}
//                     year={year}
//                     month={month}
//                     onMonthChange={handleMonthChange}
//                 />
//             )}

//             {/* ── TABLE VIEW ── */}
//             {!loading && !reduxErr && filteredLogs.length > 0 && viewMode === "table" && (
//                 <MyAttendanceTable
//                     records={filteredLogs}
//                     onEdit={openEdit}
//                     onDelete={(r) => setDeleteTarget(r)}
//                     deletingId={deletingId}
//                 />
//             )}

//             {/* ── Modals ── */}
//             <ManualAttendanceModal
//                 isOpen={showManual}
//                 onClose={closeModal}
//                 record={editTarget}
//                 onSave={handleSave}
//             />
//             <DeleteAttendanceModal
//                 isOpen={Boolean(deleteTarget)}
//                 onClose={() => setDeleteTarget(null)}
//                 record={deleteTarget}
//                 onConfirm={handleDelete}
//             />
//         </div>
//     );
// }


/* ===================================================*/

/**
 * MyAttendancePage.jsx
 *
 * Fetches data directly via the service (avoids Redux state-key ambiguity).
 * Uses Redux dispatch ONLY for mutations: mark / edit / delete.
 *
 * Adjust:
 *   employeeId  → user?.employee_id  (or whatever field your auth slice uses)
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  markAttendance,
  editAttendance,
  removeAttendance,
} from "../../../../redux/employeeAttendance/employeeAttendanceSlice.js";
import {
  getEmployeeAttendanceByEmployeeId as fetchByEmployee,
  getTodayAttendance,
  checkInAttendance,
  checkOutAttendance,
} from "../../../../redux/employeeAttendance/employeeAttendance.service.js";

import MyAttendanceCalendar from "../components/MyAttendanceCalendar.jsx";
import MyAttendanceTable    from "../components/MyAttendanceTable.jsx";
import { ManualAttendanceModal, DeleteAttendanceModal }
  from "../components/MyAttendanceModals.jsx";
import "../styles/MyAttendance.css";

import {
  UserCheck, UserX, Clock, Umbrella, Timer,
  TrendingUp, CalendarOff, Calendar, List,
  RefreshCw, Plus, LogIn, LogOut,
} from "lucide-react";

/* ── date helpers ── */
const pad     = (n)    => String(n).padStart(2, "0");
const ymFirst = (y, m) => `${y}-${pad(m + 1)}-01`;
const ymLast  = (y, m) => `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`;

const MONTHS_S = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_F = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];

function fmtTime(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
}
function fmtMins(m) {
  if (!m && m !== 0) return "0m";
  const h = Math.floor(m / 60), min = m % 60;
  if (h === 0) return `${min}m`;
  return min === 0 ? `${h}h` : `${h}h ${min}m`;
}

/* ── Normalise API response → plain array of records ── */
function extractLogs(res) {
  if (!res) return [];
  // Shape A: { success, data: [] }
  if (Array.isArray(res?.data))           return res.data;
  // Shape B: { success, data: { logs[], summary } }
  if (Array.isArray(res?.data?.logs))     return res.data.logs;
  // Shape C: already an array
  if (Array.isArray(res))                 return res;
  // Shape D: { logs[] }
  if (Array.isArray(res?.logs))           return res.logs;
  return [];
}

function extractSummary(res) {
  if (!res) return null;
  if (res?.data?.summary && typeof res.data.summary === "object") return res.data.summary;
  if (res?.summary && typeof res.summary === "object")            return res.summary;
  return null;
}

function extractTodayRecord(res, employeeId) {
  if (!res) return null;
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d.find((r) => String(r.employee_id) === String(employeeId)) ?? null;
  if (d && typeof d === "object" && d.id) return d;
  return null;
}

/* ── Stat card ── */
function StatCard({ icon: Icon, bg, color, value, label, sub }) {
  return (
    <div className="ma-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
      <div className={`${bg} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
        <Icon size={20} className={color}/>
      </div>
      <div>
        <p className="ma-stat-value text-xl font-bold leading-none">{value}</p>
        <p className="ma-stat-label text-[12.5px] mt-0.5">{label}</p>
        {sub && <p className="ma-cell-muted text-[11px] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Circular % ring ── */
function Ring({ pct }) {
  const r = 36, circ = 2 * Math.PI * r;
  const dash  = ((pct ?? 0) / 100) * circ;
  const color = pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)";
  return (
    <div className="flex flex-col items-center">
      <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="46" cy="46" r={r} fill="none" strokeWidth="8" stroke="var(--input-bg)"/>
        <circle cx="46" cy="46" r={r} fill="none" strokeWidth="8"
          stroke={color} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div style={{ marginTop:"-62px", textAlign:"center" }}>
        <p className="text-[20px] font-extrabold" style={{ color }}>{Math.round(pct ?? 0)}%</p>
        <p className="ma-cell-muted text-[10px]">Present</p>
      </div>
      <div style={{ marginTop:"30px" }}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function MyEmployeeAttendancePage() {
  const dispatch = useDispatch();
  const now      = new Date();

  /* ── Auth — adjust field name if your user object differs ── */
  const { user } = useSelector((s) => s.auth);
  /*
   * Common patterns — try in order:
   *   user.employee_id  (dedicated employee FK)
   *   user.id           (user ID that matches employee table)
   */
  const employeeId = user?.employee_id ?? user?.id;

  /* ── Local data state (direct service calls) ── */
  const [logs,        setLogs]        = useState([]);
  const [summary,     setSummary]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [todayLoad,   setTodayLoad]   = useState(false);
  const [checkBusy,   setCheckBusy]   = useState(false);

  /* ── UI state ── */
  const [year,         setYear]         = useState(now.getFullYear());
  const [month,        setMonth]        = useState(now.getMonth());
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode,     setViewMode]     = useState("calendar");
  const [deletingId,   setDeletingId]   = useState(null);
  const [showManual,   setShowManual]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ── Fetch monthly records ── */
  const loadRecords = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchByEmployee(employeeId, {
        from_date: ymFirst(year, month),
        to_date:   ymLast(year, month),
        month:     month + 1,
        year,
      });
      setLogs(extractLogs(res));
      setSummary(extractSummary(res));
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, [employeeId, year, month]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  /* ── Fetch today's record ── */
  const loadToday = useCallback(async () => {
    if (!employeeId) return;
    setTodayLoad(true);
    try {
      const res = await getTodayAttendance();
      setTodayRecord(extractTodayRecord(res, employeeId));
    } catch {
      setTodayRecord(null);
    } finally {
      setTodayLoad(false);
    }
  }, [employeeId]);

  useEffect(() => { loadToday(); }, [loadToday]);

  /* ── Summary counts ── */
  const stats = useMemo(() => {
    // prefer server-provided summary
    if (summary) return summary;
    // derive from logs
    const cnt = (s) => logs.filter(r => r.status === s).length;
    const holiday  = cnt("holiday");
    const week_off = cnt("week_off");
    const present  = cnt("present");
    const late     = cnt("late");
    const half_day = cnt("half_day");
    return {
      present_days:         present,
      absent_days:          cnt("absent"),
      late_days:            late,
      half_days:            half_day,
      leave_days:           cnt("leave"),
      holiday_days:         holiday,
      week_off_days:        week_off,
      total_work_hours:     (logs.reduce((s,r) => s+(r.total_work_minutes??0),0)/60).toFixed(2),
      total_overtime_hours: (logs.reduce((s,r) => s+(r.overtime_minutes??0),0)/60).toFixed(2),
      _attendable:          logs.length - holiday - week_off,
      _presentDays:         present + late + half_day * 0.5,
    };
  }, [summary, logs]);

  const pct = stats._attendable > 0
    ? (stats._presentDays / stats._attendable) * 100
    : (summary
        ? (Number(summary.present_days ?? 0) + Number(summary.late_days ?? 0) + Number(summary.half_days ?? 0) * 0.5)
          / Math.max(1, Number(summary.total_records ?? 1) - Number(summary.holiday_days ?? 0)) * 100
        : 0);

  /* ── Client-side status filter ── */
  const filteredLogs = useMemo(() =>
    statusFilter ? logs.filter(r => r.status === statusFilter) : logs,
    [logs, statusFilter],
  );

  /* ── Month nav ── */
  const goPrev = () => { const d = new Date(year,month-1,1); setYear(d.getFullYear()); setMonth(d.getMonth()); };
  const goNext = () => { const d = new Date(year,month+1,1); setYear(d.getFullYear()); setMonth(d.getMonth()); };
  const isCurrentMonth = new Date(year, month) >= new Date(now.getFullYear(), now.getMonth());

  /* ── Check-in ── */
  const handleCheckIn = async () => {
    setCheckBusy(true);
    try {
      const res = await checkInAttendance({ employee_id: employeeId });
      const rec = extractTodayRecord(res, employeeId) ?? res?.data ?? res;
      if (rec?.id) setTodayRecord(rec);
      await loadRecords();
      loadToday();
    } catch (e) {
      alert(e?.response?.data?.message ?? e?.message ?? "Check-in failed");
    } finally { setCheckBusy(false); }
  };

  /* ── Check-out ── */
  const handleCheckOut = async () => {
    setCheckBusy(true);
    try {
      const res = await checkOutAttendance({ employee_id: employeeId });
      const rec = extractTodayRecord(res, employeeId) ?? res?.data ?? res;
      if (rec?.id) {
        setTodayRecord(rec);
      } else {
        setTodayRecord(p => p ? { ...p, check_out: new Date().toISOString() } : p);
      }
      await loadRecords();
      loadToday();
    } catch (e) {
      alert(e?.response?.data?.message ?? e?.message ?? "Check-out failed");
    } finally { setCheckBusy(false); }
  };

  /* ── Manual save ── */
  const handleSave = async (payload, id) => {
    if (id) {
      await dispatch(editAttendance({ id, payload })).unwrap();
    } else {
      await dispatch(markAttendance({ ...payload, employee_id: employeeId })).unwrap();
    }
    await loadRecords();
    loadToday();
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await dispatch(removeAttendance(id)).unwrap();
      setLogs(prev => prev.filter(r => r.id !== id));
      loadToday();
    } finally { setDeletingId(null); }
  };

  const hasCheckedIn  = Boolean(todayRecord?.check_in);
  const hasCheckedOut = Boolean(todayRecord?.check_out);
  const todayStr = now.toLocaleDateString("en-IN",{
    weekday:"long", day:"2-digit", month:"long", year:"numeric",
  });

  return (
    <div className="ma-page min-h-screen p-5 sm:p-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="ma-title text-2xl font-bold">My Attendance</h1>
          <p className="ma-subtitle text-[13.5px] mt-1">Track your attendance, work hours and leave records.</p>
        </div>
        <button onClick={() => { setEditTarget(null); setShowManual(true); }}
          className="ma-manual-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors">
          <Plus size={15}/> Manual Entry
        </button>
      </div>

      {/* ── Today card ── */}
      <div className="ma-today-card rounded-2xl px-5 py-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="ma-today-label text-[12px] uppercase tracking-wide mb-1">Today</p>
          <p className="ma-today-date text-[15px] font-bold">{todayStr}</p>
          {todayRecord?.status ? (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`ma-status ma-status-${todayRecord.status}`}>
                {todayRecord.status.replace("_"," ")}
              </span>
              {todayRecord.check_in && (
                <span className="ma-cell-muted text-[12.5px]">
                  In: {fmtTime(todayRecord.check_in)}
                  {todayRecord.check_out ? ` · Out: ${fmtTime(todayRecord.check_out)}` : ""}
                </span>
              )}
            </div>
          ) : (
            <p className="ma-cell-muted text-[13px] mt-1">
              {todayLoad ? "Checking…" : "No record for today yet"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!hasCheckedIn && (
            <button onClick={handleCheckIn} disabled={checkBusy || todayLoad}
              className="ma-checkin-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all active:scale-[0.97] disabled:opacity-60">
              <LogIn size={16}/> {checkBusy ? "Please wait…" : "Check In"}
            </button>
          )}
          {hasCheckedIn && !hasCheckedOut && (
            <button onClick={handleCheckOut} disabled={checkBusy}
              className="ma-checkout-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all active:scale-[0.97] disabled:opacity-60">
              <LogOut size={16}/> {checkBusy ? "Please wait…" : "Check Out"}
            </button>
          )}
          {hasCheckedIn && hasCheckedOut && (
            <span className="ma-cell-muted text-[13px] flex items-center gap-1">
              <UserCheck size={14} style={{ color:"var(--success)" }}/> Day completed
            </span>
          )}
          <button onClick={() => { loadToday(); loadRecords(); }} disabled={todayLoad || loading}
            className="ma-manual-btn w-9 h-9 rounded-xl flex items-center justify-center">
            <RefreshCw size={14} className={(todayLoad || loading) ? "animate-spin" : ""}/>
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      {logs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5">
          <div className="ma-stat-card rounded-2xl p-4 flex flex-col items-center justify-center">
            <Ring pct={pct}/>
            <p className="ma-stat-label text-[12px] text-center mt-1">
              {Number(stats.present_days ?? 0) + Number(stats.late_days ?? 0)} of {stats._attendable ?? "?"} days present
            </p>
          </div>
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon={UserCheck}  bg="ma-icon-present-bg" color="ma-icon-present" value={stats.present_days  ?? 0} label="Present"     />
            <StatCard icon={UserX}      bg="ma-icon-absent-bg"  color="ma-icon-absent"  value={stats.absent_days   ?? 0} label="Absent"      />
            <StatCard icon={Clock}      bg="ma-icon-late-bg"    color="ma-icon-late"    value={stats.late_days     ?? 0} label="Late"        />
            <StatCard icon={Umbrella}   bg="ma-icon-leave-bg"   color="ma-icon-leave"   value={stats.leave_days    ?? 0} label="Leave"       />
            <StatCard icon={Timer}      bg="ma-icon-work-bg"    color="ma-icon-work"
              value={`${stats.total_work_hours ?? "0.00"}h`} label="Work Hours"/>
            <StatCard icon={TrendingUp} bg="ma-icon-ot-bg"      color="ma-icon-ot"
              value={`${stats.total_overtime_hours ?? "0.00"}h`} label="Overtime"/>
          </div>
        </div>
      )}

      {/* ── Filter / control bar ── */}
      <div className="ma-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        {/* Month nav */}
        <div className="flex items-center gap-1">
          <button onClick={goPrev}
            className="ma-action-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[16px]">‹</button>
          <span className="ma-cell-primary text-[13.5px] font-semibold px-2 min-w-[110px] text-center">
            {MONTHS_S[month]} {year}
          </span>
          <button onClick={goNext} disabled={isCurrentMonth}
            className="ma-action-btn w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[16px] disabled:opacity-40">›</button>
        </div>

        {/* Status */}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="ma-select rounded-lg px-3.5 py-2.5 text-[13.5px]">
          <option value="">All Status</option>
          {["present","absent","late","half_day","leave","holiday","week_off"].map(s => (
            <option key={s} value={s}>{s.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>
          ))}
        </select>

        {/* View toggle */}
        <div className="ma-view-toggle flex rounded-lg overflow-hidden">
          <button onClick={() => setViewMode("calendar")}
            className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors
              ${viewMode === "calendar" ? "ma-view-btn-active" : "ma-view-btn"}`}>
            <Calendar size={13}/> Calendar
          </button>
          <button onClick={() => setViewMode("table")}
            className={`px-3 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors
              ${viewMode === "table" ? "ma-view-btn-active" : "ma-view-btn"}`}>
            <List size={13}/> Table
          </button>
        </div>

        <span className="ma-count-text text-[12.5px] ml-auto">
          {loading ? "Loading…"
            : `${filteredLogs.length} record${filteredLogs.length !== 1 ? "s" : ""} · ${MONTHS_F[month]} ${year}`}
        </span>

        <button onClick={() => { loadRecords(); loadToday(); }} disabled={loading}
          className="ma-manual-btn w-8 h-8 rounded-lg flex items-center justify-center">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>
        </button>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="ma-table-card rounded-2xl p-10 text-center">
          <p className="ma-cell-muted text-[14px]">Loading attendance…</p>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="ma-table-card rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <p className="text-[14px] font-semibold" style={{ color:"var(--danger)" }}>
            Failed to load attendance
          </p>
          <p className="ma-cell-muted text-[13px]">{error}</p>
          <button onClick={loadRecords}
            className="ma-manual-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold mt-1">
            <RefreshCw size={13}/> Retry
          </button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && filteredLogs.length === 0 && (
        <div className="ma-table-card rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
          style={{ border:"2px dashed var(--divider)" }}>
          <CalendarOff size={36} className="ma-cell-muted opacity-40"/>
          <p className="ma-cell-primary text-[14px] font-semibold">
            No records for {MONTHS_F[month]} {year}
          </p>
          <p className="ma-cell-muted text-[13px]">
            {statusFilter ? "Clear the status filter to see all records" : "Attendance will appear here once marked"}
          </p>
          {statusFilter && (
            <button onClick={() => setStatusFilter("")}
              className="ma-manual-btn px-4 py-2 rounded-lg text-[13px] font-semibold mt-1">
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* ── Calendar ── */}
      {!loading && !error && filteredLogs.length > 0 && viewMode === "calendar" && (
        <MyAttendanceCalendar
          records={filteredLogs}
          year={year}
          month={month}
          onMonthChange={(y, m) => { setYear(y); setMonth(m); }}
        />
      )}

      {/* ── Table ── */}
      {!loading && !error && filteredLogs.length > 0 && viewMode === "table" && (
        <MyAttendanceTable
          records={filteredLogs}
          onEdit={(r) => { setEditTarget(r); setShowManual(true); }}
          onDelete={(r) => setDeleteTarget(r)}
          deletingId={deletingId}
        />
      )}

      {/* ── Modals ── */}
      <ManualAttendanceModal
        isOpen={showManual}
        onClose={() => { setShowManual(false); setEditTarget(null); }}
        record={editTarget}
        onSave={handleSave}
      />
      <DeleteAttendanceModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        record={deleteTarget}
        onConfirm={handleDelete}
      />
    </div>
  );
}
