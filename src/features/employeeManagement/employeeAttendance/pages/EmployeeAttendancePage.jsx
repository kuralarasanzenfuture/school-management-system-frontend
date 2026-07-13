import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getAttendanceRecords,
    getAttendanceSummary,
    removeAttendance,
} from "../../../../redux/employeeAttendance/employeeAttendanceSlice";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice";
import AttendanceTable from "../components/AttendanceTable";
import MarkAttendanceModal from "../components/MarkAttendanceModal";
import "../styles/EmployeeAttendance.css";
import {
    UserCheck, UserX, Clock, CalendarOff,
    CalendarCheck2, Umbrella, Coffee,
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

    const { records, summary, loading, summaryLoading, error } =
        useSelector((state) => state.employeeAttendance);
    const { user } = useSelector((state) => state.auth);
    const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
    const schoolsLoading = useSelector((state) => state.schoolProfile?.loading ?? false);

    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const schoolId = isAdmin ? null : user?.school_id;

    /* ── Filters ── */
    const [selectedDate, setSelectedDate] = useState(todayString());
    const [selectedSchool, setSelectedSchool] = useState(isAdmin ? "" : String(schoolId ?? ""));
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

    /* ── Fetch records + summary when filters change ── */
    useEffect(() => {
        const params = {
            date: selectedDate,
            school_id: isAdmin ? (selectedSchool || undefined) : schoolId,
        };
        dispatch(getAttendanceRecords(params));
        dispatch(getAttendanceSummary(params));
    }, [dispatch, selectedDate, selectedSchool, isAdmin, schoolId]);

    /* ── Client-side filter (status + search) ── */
    const filteredRecords = useMemo(() => {
        let result = records ?? [];

        if (statusFilter !== "All") {
            result = result.filter(
                (record) => record.status === statusFilter,
            );
        }

        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            result = result.filter(
                (record) =>
                    `${record.first_name} ${record.last_name}`.toLowerCase().includes(query) ||
                    record.employee_code?.toLowerCase().includes(query),
            );
        }

        return result;
    }, [records, statusFilter, searchQuery]);

    /* ── Handlers ── */
    const handleDateChange = (event) => setSelectedDate(event.target.value);
    const handleSchoolChange = (event) => setSelectedSchool(event.target.value);
    const handleStatusChange = (event) => setStatusFilter(event.target.value);
    const handleSearch = (event) => setSearchQuery(event.target.value);

    const handleRefresh = () => {
        const params = {
            date: selectedDate,
            school_id: isAdmin ? (selectedSchool || undefined) : schoolId,
        };
        dispatch(getAttendanceRecords(params));
        dispatch(getAttendanceSummary(params));
    };

    const openMarkModal = () => { setEditTarget(null); setShowModal(true); };
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
                <StatCard icon={UserCheck} iconBgClass="ea-icon-present-bg" iconColorClass="ea-icon-present" value={summary?.present} label="Present" />
                <StatCard icon={UserX} iconBgClass="ea-icon-absent-bg" iconColorClass="ea-icon-absent" value={summary?.absent} label="Absent" />
                <StatCard icon={Clock} iconBgClass="ea-icon-late-bg" iconColorClass="ea-icon-late" value={summary?.late} label="Late" />
                <StatCard icon={Coffee} iconBgClass="ea-icon-halfday-bg" iconColorClass="ea-icon-halfday" value={summary?.half_day} label="Half Day" />
                <StatCard icon={Umbrella} iconBgClass="ea-icon-leave-bg" iconColorClass="ea-icon-leave" value={summary?.leave} label="On Leave" />
                <StatCard icon={CalendarOff} iconBgClass="ea-icon-holiday-bg" iconColorClass="ea-icon-holiday" value={summary?.holiday} label="Holiday" />
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
                date={selectedDate}
                schoolId={isAdmin ? (selectedSchool || null) : schoolId}
            />
        </div>
    );
}