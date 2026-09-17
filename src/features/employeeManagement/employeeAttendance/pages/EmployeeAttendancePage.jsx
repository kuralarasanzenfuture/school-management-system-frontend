import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getAttendanceRecords,
    removeAttendance,
} from "../../../../redux/employeeAttendance/employeeAttendanceSlice.js";
import { fetchEmployees } from "../../../../redux/employee/employeeSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { fetchEmployeeShifts } from "../../../../redux/employeeShift/employeeShiftSlice.js";
import AttendanceTable from "../components/AttendanceTable.jsx";
import MarkAttendanceModal from "../components/MarkAttendanceModal.jsx";
import "../styles/EmployeeAttendance.css";
import {
    UserCheck, UserX, Clock, CalendarOff,
    Umbrella, Coffee,
    Plus, Download, Search, RefreshCw,
    RotateCcw, X, FilterX,
} from "lucide-react";
import SearchableSelect from "../components/SearchableSelect.jsx";
import { getImageUrl } from "../../../../common/utils/imageUrl.js";

/* ── today as YYYY-MM-DD (local timezone safe) ── */
const todayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

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

    /* ── Employee Shifts ── */
    const { employeeShifts } = useSelector((state) => state.employeeShifts);

    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const schoolId = isAdmin ? null : user?.school_id;

    /* ── Filters ── */
    const [selectedDate, setSelectedDate] = useState(todayString());
    const [selectedSchool, setSelectedSchool] = useState(isAdmin ? "" : String(schoolId ?? ""));
    const [selectedShift, setSelectedShift] = useState("");
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

    /* ── Fetch employee shifts ── */
    useEffect(() => {
        if (!employeeShifts || employeeShifts.length === 0) {
            dispatch(fetchEmployeeShifts());
        }
    }, [dispatch, employeeShifts]);

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

    /* ── Shifts scoped to the current school or selected employee's school ── */
    const scopedShifts = useMemo(() => {
        const list = Array.isArray(employeeShifts) ? employeeShifts : [];
        const targetSchool = (isAdmin && selectedSchool)
            ? Number(selectedSchool)
            : selectedEmployee?.school_id
              ? Number(selectedEmployee.school_id)
              : (!isAdmin && schoolId)
                ? Number(schoolId)
                : null;

        const filtered = list.filter((s) => {
            if (s.status === "inactive") return false;
            if (targetSchool) {
                return Number(s.school_id) === targetSchool;
            }
            return true;
        });

        // When viewing all schools without a school/employee filter, deduplicate by shift name to avoid duplicate options
        if (!targetSchool) {
            const seen = new Set();
            const unique = [];
            for (const s of filtered) {
                const key = s.name?.trim().toLowerCase();
                if (key && !seen.has(key)) {
                    seen.add(key);
                    unique.push(s);
                }
            }
            return unique;
        }

        return filtered;
    }, [employeeShifts, isAdmin, selectedSchool, selectedEmployee, schoolId]);

    /* ── Reset shift filter if it no longer belongs to the active school scope ── */
    useEffect(() => {
        if (selectedShift && scopedShifts.length > 0) {
            const selectedShiftObj = (employeeShifts ?? []).find(
                (s) => String(s.id) === String(selectedShift),
            );
            const existsInScoped = scopedShifts.some(
                (s) =>
                    Number(s.id) === Number(selectedShift) ||
                    (selectedShiftObj && s.name?.trim().toLowerCase() === selectedShiftObj.name?.trim().toLowerCase()),
            );
            if (!existsInScoped) {
                setSelectedShift("");
            }
        }
    }, [scopedShifts, selectedShift, employeeShifts]);

    /* ── Client-side filter (date, employee, school, shift, status, search) ── */
    const filteredRecords = useMemo(() => {
        let result = records ?? [];

        // Filter by date
        if (selectedDate) {
            result = result.filter((record) => {
                if (!record.attendance_date) return false;
                const recDate = String(record.attendance_date).slice(0, 10);
                return recDate === selectedDate;
            });
        }

        // Filter by shift
        if (selectedShift) {
            const selectedShiftObj = (employeeShifts ?? []).find(
                (s) => String(s.id) === String(selectedShift),
            );
            const targetName = selectedShiftObj?.name?.trim().toLowerCase();

            result = result.filter((record) => {
                // Direct ID match
                if (Number(record.shift_id) === Number(selectedShift)) return true;
                // Match by shift name (important when filtering across schools as admin)
                if (targetName && record.shift_name?.trim().toLowerCase() === targetName) {
                    return true;
                }
                return false;
            });
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
    }, [records, selectedDate, selectedShift, selectedEmployee, selectedSchool, isAdmin, statusFilter, searchQuery, employeeShifts]);

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
        const id = event.target.value;
        const emp = scopedEmployees.find(
            (e) => String(e.id) === String(id),
        );
        setSelectedEmployee(emp ?? null);
    };
    const handleStatusChange = (event) => setStatusFilter(event.target.value);
    const handleSearch = (event) => setSearchQuery(event.target.value);

    const handleClearFilters = () => {
        setSelectedEmployee(null);
        setSelectedShift("");
        setStatusFilter("All");
        setSearchQuery("");
        if (isAdmin) setSelectedSchool("");
        setSelectedDate(todayString());
    };

    const hasActiveFilters = Boolean(
        selectedEmployee ||
        selectedShift ||
        statusFilter !== "All" ||
        searchQuery.trim() ||
        (isAdmin && selectedSchool) ||
        selectedDate !== todayString()
    );

    const [modalEmployee, setModalEmployee] = useState(null);

    const handleRefresh = () => {
        dispatch(getAttendanceRecords());
    };

    const openMarkModal = (empToMark = null) => {
        setEditTarget(null);
        if (empToMark && empToMark.id) {
            setModalEmployee(empToMark);
        } else {
            setModalEmployee(selectedEmployee || null);
        }
        setShowModal(true);
    };
    const openEditModal = (record) => { setEditTarget(record); setShowModal(true); };
    const closeModal = () => {
        setShowModal(false);
        setEditTarget(null);
        setModalEmployee(null);
    };

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

    // const IMAGE_BASE_URL = "http://localhost:5000";

    // console.log(scopedEmployees);

    // // ── Employee options: photo if the employee has one, initials otherwise ──
    // const employeeOptions = scopedEmployees.map((emp) => ({
    //     value: emp.id,
    //     label: `${emp.first_name} ${emp.last_name}`,
    //     sublabel: emp.mobile || "",
    //     avatarUrl:
    //         emp.photo_url && emp.photo_url !== "null"
    //             ? `${IMAGE_BASE_URL}${emp.photo_url}`
    //             : null,
    //     initials: `${emp.first_name?.[0] ?? ""}${emp.last_name?.[0] ?? ""}`.toUpperCase(),
    // }));

    // ── Employee options: photo if the employee has one, initials otherwise ──
    // Keep the bold label to just the name — cramming the phone number in
    // there too is what caused truncation mid-digit ("98000...") in a narrow
    // trigger. Phone + employee code both fit fine as the smaller sublabel.
    const employeeOptions = scopedEmployees.map((emp) => ({
        value: emp.id,
        label: `${emp.first_name} ${emp.last_name}`,
        sublabel: [emp.mobile, emp.employee_code].filter(Boolean).join(" · "),
        avatarUrl:
            emp.photo_url && emp.photo_url !== "null" ? getImageUrl(emp.photo_url) : null,
        initials: `${emp.first_name?.[0] ?? ""}${emp.last_name?.[0] ?? ""}`.toUpperCase(),
    }));

    console.log(employeeOptions);

    console.log(selectedEmployee)

    return (
        <div className="ea-page min-h-screen p-6 max-w-7xl mx-auto">

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
            <div className="ea-filter-bar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-3">

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
                {/* <div className="flex flex-col gap-1"> */}
                {/* <label className="ea-filter-label text-[11.5px] font-semibold">Employee</label> */}
                {/* <select
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
                </div> */}

                {/* Employee filter */}
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <SearchableSelect
                        options={employeeOptions}
                        value={selectedEmployee?.id ?? ""}
                        onChange={(id) => handleEmployeeChange({ target: { value: id } })}
                        // handleEmployeeChange was written for a native <select>'s onChange
                        // event (reads e.target.value) — this shim keeps that signature so
                        // nothing else about handleEmployeeChange needs to change.
                        placeholder="Select employee"
                        loading={employeesLoading}
                        loadingText="Loading employees…"
                        disabled={employeesLoading || scopedEmployees.length === 0}
                        showAvatars
                    />
                </div>

                {/* Shift filter */}
                <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="ea-input rounded-lg px-3.5 py-2.5 text-[13.5px] min-w-[150px]"
                >
                    <option value="">All Shifts</option>
                    {scopedShifts.map((sh) => (
                        <option key={sh.id} value={sh.id}>
                            {sh.name} ({sh.start_time?.slice(0, 5)} - {sh.end_time?.slice(0, 5)})
                        </option>
                    ))}
                </select>

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
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            title="Clear search"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Clear all filters button */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="ea-btn-outline inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold text-rose-600 dark:text-rose-400 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer shrink-0"
                        title="Clear all active filters"
                    >
                        <RotateCcw size={13} />
                        Clear Filters
                    </button>
                )}

                {/* Record count */}
                <span className="ea-count-text text-[12.5px] ml-auto">
                    {filteredRecords.length === 0
                        ? "No records"
                        : `${filteredRecords.length} record${filteredRecords.length === 1 ? "" : "s"}`}
                </span>
            </div>

            {/* ── Active Filter Tags / Chips ── */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap mb-5 px-1">
                    <span className="text-[12px] font-semibold ea-cell-muted flex items-center gap-1">
                        <FilterX size={13} /> Active filters:
                    </span>
                    {selectedEmployee && (
                        <span className="ea-filter-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            Employee: {selectedEmployee.first_name} {selectedEmployee.last_name || ""}
                            <button
                                type="button"
                                onClick={() => setSelectedEmployee(null)}
                                className="hover:text-indigo-900 dark:hover:text-indigo-100 p-0.5"
                                title="Remove employee filter"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {selectedShift && (
                        <span className="ea-filter-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Shift: {scopedShifts.find((s) => String(s.id) === String(selectedShift))?.name || "Selected Shift"}
                            <button
                                type="button"
                                onClick={() => setSelectedShift("")}
                                className="hover:text-blue-900 dark:hover:text-blue-100 p-0.5"
                                title="Remove shift filter"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {statusFilter !== "All" && (
                        <span className="ea-filter-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 capitalize">
                            Status: {statusFilter.replace("_", " ")}
                            <button
                                type="button"
                                onClick={() => setStatusFilter("All")}
                                className="hover:text-amber-900 dark:hover:text-amber-100 p-0.5"
                                title="Remove status filter"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {searchQuery.trim() && (
                        <span className="ea-filter-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            Search: "{searchQuery.trim()}"
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="hover:text-slate-900 dark:hover:text-slate-100 p-0.5"
                                title="Remove search filter"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {selectedDate !== todayString() && (
                        <span className="ea-filter-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            Date: {selectedDate}
                            <button
                                type="button"
                                onClick={() => setSelectedDate(todayString())}
                                className="hover:text-purple-900 dark:hover:text-purple-100 p-0.5"
                                title="Reset date to today"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {isAdmin && selectedSchool && (
                        <span className="ea-filter-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            School: {schools.find((s) => String(s.id) === String(selectedSchool))?.name || "Selected School"}
                            <button
                                type="button"
                                onClick={() => setSelectedSchool("")}
                                className="hover:text-emerald-900 dark:hover:text-emerald-100 p-0.5"
                                title="Remove school filter"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="text-[12px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 ml-1 underline cursor-pointer"
                    >
                        Clear all
                    </button>
                </div>
            )}

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
                    showSchoolColumn={isAdmin && !selectedSchool}
                    selectedEmployee={selectedEmployee}
                    onMarkAttendance={openMarkModal}
                    onClearFilters={hasActiveFilters ? handleClearFilters : null}
                />
            )}

            {/* ── Modal ── */}
            <MarkAttendanceModal
                isOpen={showModal}
                onClose={closeModal}
                attendance={editTarget}
                employee={
                    editTarget
                        ? (allEmployees.find((e) => Number(e.id) === Number(editTarget.employee_id)) || selectedEmployee)
                        : (modalEmployee || selectedEmployee)
                }
                employees={scopedEmployees}
                shifts={employeeShifts}
                initialShiftId={selectedShift}
                existingRecords={records}
                onSwitchToEdit={openEditModal}
                date={selectedDate}
                schoolId={isAdmin ? (selectedSchool || null) : schoolId}
            />
        </div>
    );
}
