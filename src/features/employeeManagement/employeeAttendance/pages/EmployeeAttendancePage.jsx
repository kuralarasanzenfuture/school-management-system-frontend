import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getAttendanceRecords,
    removeAttendance,
} from "../../../../redux/employeeAttendance/employeeAttendanceSlice.js";
import { fetchEmployees } from "../../../../redux/employee/employeeSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import AttendanceTable from "../components/AttendanceTable.jsx";
import MarkAttendanceModal from "../components/MarkAttendanceModal.jsx";
import "../styles/EmployeeAttendance.css";
import {
    UserCheck, UserX, Clock, CalendarOff,
    Umbrella, Coffee,
    Plus, Download, Search, RefreshCw,
} from "lucide-react";

/* ── today as YYYY-MM-DD ── */
const todayString = () => new Date().toISOString().split("T")[0];

/* ── Stat card ── */
function StatCard({ icon: Icon, iconBgClass, iconColorClass, value, label }) {
    return (
        <div className="ea-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
            <div className={`${iconBgClass} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className={iconColorClass} />
            </div>
            <div>
                <p className="ea-stat-value text-xl font-bold leading-none">{value ?? 0}</p>
                <p className="ea-stat-label text-[12.5px] mt-1">{label}</p>
            </div>
        </div>
    );
}

export default function EmployeeAttendancePage() {
    const dispatch = useDispatch();

    const { records, loading, error } =
        useSelector((state) => state.employeeAttendance);
    const { user } = useSelector((state) => state.auth);
    const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

    /* ── Employees (for the selector) ── */
    const { employees: allEmployees, loading: employeesLoading } =
        useSelector((state) => state.employees);

    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const schoolId = isAdmin ? null : user?.school_id;

    /* ── Filters ── */
    const [selectedDate, setSelectedDate] = useState(todayString());
    const [selectedSchool, setSelectedSchool] = useState(isAdmin ? "" : String(schoolId ?? ""));
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    /* ── Modal ── */
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    /* ── Fetch schools for admin ── */
    useEffect(() => {
        if (isAdmin && schools.length === 0) dispatch(fetchSchools());
    }, [dispatch, isAdmin, schools.length]);

    /* ── Fetch employees (needed for the selector) ── */
    useEffect(() => {
        if (allEmployees.length === 0) dispatch(fetchEmployees());
    }, [dispatch, allEmployees.length]);

    /* ── Fetch all attendance records (token endpoint returns
          records with employee/school names via JOINs; date
          and employee filtering is done client-side) ── */
    useEffect(() => {
        dispatch(getAttendanceRecords());
    }, [dispatch]);

    /* ── Employees scoped to the current school (non-admin only) ── */
    const scopedEmployees = useMemo(() => {
        if (isAdmin) return allEmployees;
        return allEmployees.filter(
            (emp) => Number(emp.school_id) === Number(schoolId),
        );
    }, [allEmployees, isAdmin, schoolId]);

    /* ── Client-side filter (date, employee, school, status, search) ── */
    const filteredRecords = useMemo(() => {
        let result = records ?? [];

        // Filter by date
        if (selectedDate) {
            result = result.filter(
                (record) =>
                    record.attendance_date &&
                    new Date(record.attendance_date).toISOString().split("T")[0] === selectedDate,
            );
        }

        // Filter by employee
        if (selectedEmployee) {
            result = result.filter(
                (record) => Number(record.employee_id) === Number(selectedEmployee.id),
            );
        }

        // Filter by school (admin only)
        if (isAdmin && selectedSchool) {
            result = result.filter(
                (record) => Number(record.school_id) === Number(selectedSchool),
            );
        }

        // Filter by status
        if (statusFilter !== "All") {
            result = result.filter(
                (record) => record.status === statusFilter,
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            result = result.filter(
                (record) =>
                    `${record.first_name} ${record.last_name}`.toLowerCase().includes(query) ||
                    record.employee_code?.toLowerCase().includes(query),
            );
        }

        return result;
    }, [records, selectedDate, selectedEmployee, selectedSchool, isAdmin, statusFilter, searchQuery]);

    /* ── Compute summary from filtered records ── */
    const computedSummary = useMemo(() => {
        const summary = {
            present: 0,
            absent: 0,
            late: 0,
            half_day: 0,
            leave: 0,
            holiday: 0,
            week_off: 0,
            total: filteredRecords.length,
        };

        filteredRecords.forEach((record) => {
            if (record.status && summary.hasOwnProperty(record.status)) {
                summary[record.status]++;
            }
        });

        return summary;
    }, [filteredRecords]);

    /* ── Handlers ── */
    const handleDateChange = (event) => setSelectedDate(event.target.value);
    const handleSchoolChange = (event) => {
        setSelectedSchool(event.target.value);
        setSelectedEmployee(null);
    };
    const handleEmployeeChange = (event) => {
        const emp = scopedEmployees.find(
            (e) => String(e.id) === event.target.value,
        );
        setSelectedEmployee(emp ?? null);
    };
    const handleStatusChange = (event) => setStatusFilter(event.target.value);
    const handleSearch = (event) => setSearchQuery(event.target.value);

    const handleRefresh = () => {
        dispatch(getAttendanceRecords());
    };

    const openMarkModal = () => {
        if (!selectedEmployee) {
            alert("Please select an employee before marking attendance.");
            return;
        }
        setEditTarget(null);
        setShowModal(true);
    };
    const openEditModal = (record) => { setEditTarget(record); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditTarget(null); };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this attendance record?")) return;
        setDeletingId(id);
        try {
            await dispatch(removeAttendance(id)).unwrap();
        } catch (deleteError) {
            alert(deleteError?.message ?? String(deleteError));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="ea-page min-h-screen p-5 sm:p-6">

            {/* ── Page header ── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="ea-title text-2xl font-bold">Employee Attendance</h1>
                    <p className="ea-subtitle text-[13.5px] mt-1">
                        Track daily attendance, check-in/out times and leave records.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        className="ea-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors"
                    >
                        <RefreshCw size={15} /> Refresh
                    </button>
                    <button
                        className="ea-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors"
                    >
                        <Download size={15} /> Export
                    </button>
                    <button
                        onClick={openMarkModal}
                        className="ea-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors active:scale-[0.97] shadow-sm"
                    >
                        <Plus size={16} /> Mark Attendance
                    </button>
                </div>
            </div>

            {/* ── Summary stat cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <StatCard icon={UserCheck} iconBgClass="ea-icon-present-bg" iconColorClass="ea-icon-present" value={computedSummary.present} label="Present" />
                <StatCard icon={UserX} iconBgClass="ea-icon-absent-bg" iconColorClass="ea-icon-absent" value={computedSummary.absent} label="Absent" />
                <StatCard icon={Clock} iconBgClass="ea-icon-late-bg" iconColorClass="ea-icon-late" value={computedSummary.late} label="Late" />
                <StatCard icon={Coffee} iconBgClass="ea-icon-halfday-bg" iconColorClass="ea-icon-halfday" value={computedSummary.half_day} label="Half Day" />
                <StatCard icon={Umbrella} iconBgClass="ea-icon-leave-bg" iconColorClass="ea-icon-leave" value={computedSummary.leave} label="On Leave" />
                <StatCard icon={CalendarOff} iconBgClass="ea-icon-holiday-bg" iconColorClass="ea-icon-holiday" value={computedSummary.holiday} label="Holiday" />
            </div>

            {/* ── Filter bar ── */}
            <div className="ea-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-6">

                {/* Date picker */}
                <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="ea-input rounded-lg px-3.5 py-2.5 text-[13.5px]"
                />

                {/* School filter — admin only */}
                {isAdmin && (
                    <select
                        value={selectedSchool}
                        onChange={handleSchoolChange}
                        disabled={schoolsLoading}
                        className="ea-input rounded-lg px-3.5 py-2.5 text-[13.5px] min-w-[200px]"
                    >
                        <option value="">All Schools</option>
                        {schools.map((school) => (
                            <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                    </select>
                )}

                {/* Employee filter */}
                <div className="flex flex-col gap-1">
                    {/* <label className="ea-filter-label text-[11.5px] font-semibold">Employee</label> */}
                    <select
                        value={selectedEmployee?.id ?? ""}
                        onChange={handleEmployeeChange}
                        disabled={employeesLoading || scopedEmployees.length === 0}
                        className="ea-input rounded-lg px-3.5 py-2.5 text-[13.5px] min-w-[220px]"
                    >
                        <option value="">
                            {employeesLoading
                                ? "Loading employees…"
                                : scopedEmployees.length === 0
                                    ? "No employees"
                                    : "Select employee"}
                        </option>
                        {scopedEmployees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name} — {emp.employee_code}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status filter */}
                <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="ea-input rounded-lg px-3.5 py-2.5 text-[13.5px]"
                >
                    <option value="All">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                    <option value="leave">Leave</option>
                    <option value="holiday">Holiday</option>
                    <option value="week_off">Week Off</option>
                </select>

                {/* Employee search */}
                <div className="ea-input flex items-center gap-2 flex-1 min-w-[180px] rounded-lg px-3 py-2.5">
                    <Search size={15} className="ea-search-icon shrink-0" />
                    <input
                        className="bg-transparent outline-none w-full text-[13.5px] ea-cell-primary"
                        placeholder="Search employee name or code…"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                {/* Record count */}
                <span className="ea-count-text text-[12.5px] ml-auto">
                    {filteredRecords.length === 0
                        ? "No records"
                        : `${filteredRecords.length} record${filteredRecords.length === 1 ? "" : "s"}`}
                </span>
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="ea-table-card rounded-2xl p-12 text-center">
                    <p className="ea-cell-muted text-[14px]">Loading attendance…</p>
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="ea-table-card rounded-2xl p-12 text-center">
                    <p className="ea-field-error text-[14px]">{error}</p>
                </div>
            )}

            {/* ── Table ── */}
            {!loading && !error && (
                <AttendanceTable
                    records={filteredRecords}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                    showSchoolColumn={isAdmin}
                />
            )}

            {/* ── Modal ── */}
            <MarkAttendanceModal
                isOpen={showModal}
                onClose={closeModal}
                attendance={editTarget}
                employee={selectedEmployee}
                date={selectedDate}
                schoolId={isAdmin ? (selectedSchool || null) : schoolId}
            />
        </div>
    );
}
