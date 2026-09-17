import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getAttendanceRecords,
    getAttendanceMatrix,
    removeAttendance,
} from "../../../../redux/employeeAttendance/employeeAttendanceSlice.js";
import { fetchEmployees } from "../../../../redux/employee/employeeSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { fetchEmployeeShifts } from "../../../../redux/employeeShift/employeeShiftSlice.js";
import AttendanceTable from "../components/AttendanceTable.jsx";
import AttendanceMatrix from "../components/AttendanceMatrix.jsx";
import MarkAttendanceModal from "../components/MarkAttendanceModal.jsx";
import "../styles/EmployeeAttendance.css";
import {
    UserCheck, UserX, Clock, CalendarOff,
    Umbrella, Coffee,
    Plus, Download, Search, RefreshCw,
    RotateCcw, X, FilterX,
    ChevronLeft, ChevronRight,
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

    const { records, loading, error, matrixData, matrixLoading } =
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

    /* ── View Mode: "monthly" | "weekly" | "daily" ── */
    const [viewMode, setViewMode] = useState("monthly");

    /* ── Helper to find Monday of a given date (YYYY-MM-DD) ── */
    const getMondayDateStr = (refDate = new Date()) => {
        const d = new Date(refDate);
        const day = d.getDay(); // 0 is Sun, 1 is Mon
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        return new Intl.DateTimeFormat("en-CA").format(d);
    };

    /* ── Month & Year for Monthly Matrix ── */
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    /* ── Week Start Date for Weekly Matrix ── */
    const [weekStartDate, setWeekStartDate] = useState(() => getMondayDateStr());

    /* ── Handlers for week updates ── */
    const handleWeekChange = (newWeekStart) => {
        setWeekStartDate(newWeekStart);
        const d = new Date(`${newWeekStart}T00:00:00`);
        setCurrentMonth(d.getMonth() + 1);
        setCurrentYear(d.getFullYear());
    };

    const handlePrevWeek = () => {
        const current = new Date(`${weekStartDate}T00:00:00`);
        current.setDate(current.getDate() - 7);
        const prevStr = new Intl.DateTimeFormat("en-CA").format(current);
        handleWeekChange(prevStr);
    };

    const handleNextWeek = () => {
        const current = new Date(`${weekStartDate}T00:00:00`);
        current.setDate(current.getDate() + 7);
        const nextStr = new Intl.DateTimeFormat("en-CA").format(current);
        handleWeekChange(nextStr);
    };

    const handleCurrentWeek = () => {
        const thisWeek = getMondayDateStr();
        handleWeekChange(thisWeek);
    };

    /* ── Department Filter ── */
    const [selectedDepartment, setSelectedDepartment] = useState("");

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
    const [modalEmployee, setModalEmployee] = useState(null);

    /* ── Unique Departments derived from active employees ── */
    const departments = useMemo(() => {
        const set = new Set();
        (allEmployees || []).forEach((e) => {
            if (e.department && typeof e.department === "string" && e.department.trim()) {
                set.add(e.department.trim());
            }
        });
        return Array.from(set).sort();
    }, [allEmployees]);

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
    /* ── Fetch attendance records scoped to current date and school ── */
    useEffect(() => {
        const activeSchoolId = isAdmin ? selectedSchool : schoolId;
        const params = {};
        if (selectedDate) params.date = selectedDate;
        if (activeSchoolId) params.school_id = activeSchoolId;
        dispatch(getAttendanceRecords(params));
    }, [dispatch, selectedDate, selectedSchool, schoolId, isAdmin]);

    /* ── Fetch Attendance Matrix (structured monthly / weekly / daily grid) ── */
    const fetchMatrix = () => {
        const params = {
            view: viewMode,
        };

        if (viewMode === "weekly") {
            params.from_date = weekStartDate;
            const start = new Date(`${weekStartDate}T00:00:00`);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            params.to_date = new Intl.DateTimeFormat("en-CA").format(end);
            params.date = weekStartDate;
        } else if (viewMode === "daily") {
            params.date = selectedDate;
            params.view = "daily";
        } else {
            params.month = currentMonth;
            params.year = currentYear;
        }

        const activeSchoolId = isAdmin ? selectedSchool : schoolId;
        if (activeSchoolId) {
            params.school_id = activeSchoolId;
        }
        if (selectedDepartment) {
            params.department = selectedDepartment;
        }
        if (searchQuery.trim()) {
            params.search = searchQuery.trim();
        }
        dispatch(getAttendanceMatrix(params));
    };

    useEffect(() => {
        fetchMatrix();
    }, [dispatch, currentMonth, currentYear, weekStartDate, selectedDate, viewMode, selectedSchool, schoolId, selectedDepartment, isAdmin]);

    /* ── Employees scoped to the current school ── */
    const scopedEmployees = useMemo(() => {
        if (isAdmin) {
            if (selectedSchool) {
                return allEmployees.filter(
                    (emp) => String(emp.school_id) === String(selectedSchool),
                );
            }
            return allEmployees;
        }
        return allEmployees.filter(
            (emp) => String(emp.school_id) === String(schoolId),
        );
    }, [allEmployees, isAdmin, schoolId, selectedSchool]);

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

    /* ── Normalize status helper for consistent counting and filtering ── */
    const normalizeStatus = (status) => {
        if (!status) return null;
        const s = String(status).toLowerCase().trim().replace(/[\s-]+/g, "_");
        if (s === "present") return "present";
        if (s === "absent") return "absent";
        if (s === "late") return "late";
        if (s === "half_day" || s === "halfday") return "half_day";
        if (s === "leave" || s === "on_leave") return "leave";
        if (s === "holiday") return "holiday";
        if (s === "week_off" || s === "weekoff") return "week_off";
        return s;
    };

    /* ── Base filtered records (date, shift, employee, school, search) ── */
    const baseFilteredRecords = useMemo(() => {
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
    }, [records, selectedDate, selectedShift, selectedEmployee, selectedSchool, isAdmin, searchQuery, employeeShifts]);

    /* ── Client-side filter including status ── */
    const filteredRecords = useMemo(() => {
        if (statusFilter === "All") return baseFilteredRecords;
        const normalizedTarget = normalizeStatus(statusFilter);
        return baseFilteredRecords.filter(
            (record) => normalizeStatus(record.status) === normalizedTarget,
        );
    }, [baseFilteredRecords, statusFilter]);

    /* ── Compute summary from base filtered records (shows true distribution for the scope) ── */
    const computedSummary = useMemo(() => {
        const summary = {
            present: 0,
            absent: 0,
            late: 0,
            half_day: 0,
            leave: 0,
            holiday: 0,
            week_off: 0,
            total: baseFilteredRecords.length,
        };

        baseFilteredRecords.forEach((record) => {
            const norm = normalizeStatus(record.status);
            if (norm && summary.hasOwnProperty(norm)) {
                summary[norm]++;
            }
        });

        return summary;
    }, [baseFilteredRecords]);

    /* ── Handlers ── */
    const handleDateChange = (eventOrValue) => {
        const val = typeof eventOrValue === "object" && eventOrValue?.target
            ? eventOrValue.target.value
            : eventOrValue;
        if (val) setSelectedDate(val);
    };

    const handlePrevDay = () => {
        const d = new Date(`${selectedDate}T00:00:00`);
        d.setDate(d.getDate() - 1);
        setSelectedDate(new Intl.DateTimeFormat("en-CA").format(d));
    };

    const handleNextDay = () => {
        const d = new Date(`${selectedDate}T00:00:00`);
        d.setDate(d.getDate() + 1);
        setSelectedDate(new Intl.DateTimeFormat("en-CA").format(d));
    };

    const handleToday = () => {
        setSelectedDate(todayString());
    };

    const handleExportDailyCSV = () => {
        if (!filteredRecords || filteredRecords.length === 0) {
            alert("No attendance records to export for this date.");
            return;
        }
        const headers = ["Employee Code", "Employee Name", "Department", "Shift", "Status", "Check-in", "Check-out", "Work Minutes", "Late Minutes", "Remarks"];
        const rows = filteredRecords.map((r) => [
            `"${r.employee_code || ""}"`,
            `"${r.first_name || ""} ${r.last_name || ""}"`,
            `"${r.department || ""}"`,
            `"${r.shift_name || ""}"`,
            `"${r.status || ""}"`,
            `"${r.check_in || ""}"`,
            `"${r.check_out || ""}"`,
            `"${r.total_work_minutes || 0}"`,
            `"${r.late_minutes || 0}"`,
            `"${(r.remarks || "").replace(/"/g, '""')}"`,
        ]);
        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Employee_Attendance_Daily_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSchoolChange = (eventOrValue) => {
        const val = typeof eventOrValue === "object" && eventOrValue?.target
            ? eventOrValue.target.value
            : eventOrValue;
        setSelectedSchool(val || "");
        setSelectedEmployee(null);
        setSelectedShift("");
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

    const handleRefresh = () => {
        const activeSchoolId = isAdmin ? selectedSchool : schoolId;
        const params = {};
        if (selectedDate) params.date = selectedDate;
        if (activeSchoolId) params.school_id = activeSchoolId;
        dispatch(getAttendanceRecords(params));
        fetchMatrix();
    };

    const handleModalSuccess = () => {
        const activeSchoolId = isAdmin ? selectedSchool : schoolId;
        const params = {};
        if (selectedDate) params.date = selectedDate;
        if (activeSchoolId) params.school_id = activeSchoolId;
        dispatch(getAttendanceRecords(params));
        fetchMatrix();
    };

    const handleMonthChange = (newMonth, newYear) => {
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const handleCellClick = (emp, dayMeta, cell) => {
        if (cell && cell.id) {
            const existingRecord = (records || []).find((r) => Number(r.id) === Number(cell.id));
            if (existingRecord) {
                openEditModal(existingRecord);
                return;
            }
            openEditModal({
                id: cell.id,
                employee_id: emp.employee_id,
                employee_name: emp.name,
                first_name: emp.first_name,
                last_name: emp.last_name,
                attendance_date: dayMeta.date,
                status: cell.status,
                shift_id: cell.shift_id,
                shift_name: cell.shift_name,
                school_id: emp.school_id,
            });
            return;
        }

        setSelectedDate(dayMeta.date);
        const targetEmp = (scopedEmployees || []).find(
            (e) => Number(e.id) === Number(emp.employee_id),
        );
        openMarkModal(targetEmp || {
            id: emp.employee_id,
            first_name: emp.first_name,
            last_name: emp.last_name,
            employee_code: emp.employee_code,
            school_id: emp.school_id,
        });
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
        <div className="ea-page min-h-screen p-3 sm:p-5 lg:p-6 w-full max-w-full min-w-0 space-y-5">
            {viewMode !== "daily" ? (
                <AttendanceMatrix
                    matrixData={matrixData}
                    loading={matrixLoading}
                    month={currentMonth}
                    year={currentYear}
                    onMonthChange={handleMonthChange}
                    weekStartDate={weekStartDate}
                    onPrevWeek={handlePrevWeek}
                    onNextWeek={handleNextWeek}
                    onCurrentWeek={handleCurrentWeek}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    departments={departments}
                    selectedDepartment={selectedDepartment}
                    onDepartmentChange={setSelectedDepartment}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    schools={schools}
                    selectedSchool={selectedSchool}
                    onSchoolChange={handleSchoolChange}
                    isAdmin={isAdmin}
                    shifts={scopedShifts}
                    selectedShift={selectedShift}
                    onShiftChange={setSelectedShift}
                    onCellClick={handleCellClick}
                    onBulkMark={() => openMarkModal()}
                    allEmployees={scopedEmployees}
                    records={records}
                />
            ) : (
                <div className="space-y-5">
                    {/* View Mode Bar for Daily */}
                    <div className="ea-table-card rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold ea-cell-muted uppercase tracking-wider">Active View:</span>
                            <span className="text-xs font-bold text-[#1a237e] dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-xl shadow-2xs">
                                Daily Attendance Detail ({new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })})
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs ea-cell-muted font-medium">Switch mode:</span>
                            <div className="flex items-center p-1 bg-[var(--input-bg)] rounded-xl border border-[var(--input-border)] text-xs font-medium text-[var(--text-muted)] shadow-2xs">
                                <button
                                    onClick={() => setViewMode("daily")}
                                    className="px-3.5 py-1.5 rounded-lg ea-btn-primary font-semibold shadow-xs cursor-pointer"
                                    type="button"
                                >
                                    Daily
                                </button>
                                <button
                                    onClick={() => setViewMode("weekly")}
                                    className="px-3.5 py-1.5 rounded-lg hover:text-[var(--text-primary)] transition cursor-pointer"
                                    type="button"
                                >
                                    Weekly
                                </button>
                                <button
                                    onClick={() => setViewMode("monthly")}
                                    className="px-3.5 py-1.5 rounded-lg hover:text-[var(--text-primary)] transition cursor-pointer"
                                    type="button"
                                >
                                    Monthly Matrix
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Page header ── */}
                    <div className="flex items-start justify-between">
                <div>
                    <h1 className="ea-title text-2xl font-bold">Employee Attendance</h1>
                    <p className="ea-subtitle text-[13.5px] mt-1">
                        Track daily attendance, check-in/out times and leave records.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        className="ea-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors cursor-pointer"
                    >
                        <RefreshCw size={15} /> Refresh
                    </button>
                    <button
                        onClick={handleExportDailyCSV}
                        className="ea-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors cursor-pointer"
                    >
                        <Download size={15} /> Export
                    </button>
                    <button
                        onClick={openMarkModal}
                        className="ea-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors active:scale-[0.97] shadow-sm cursor-pointer"
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

                {/* Date navigator with day stepper */}
                <div className="flex items-center gap-1 bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--input-border)] shadow-2xs">
                    <button
                        type="button"
                        onClick={handlePrevDay}
                        className="p-1.5 hover:bg-[var(--panel-bg)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
                        title="Previous Day"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="bg-transparent border-none text-xs font-bold text-[var(--text-primary)] px-2 py-1 outline-none cursor-pointer"
                    />
                    <button
                        type="button"
                        onClick={handleNextDay}
                        className="p-1.5 hover:bg-[var(--panel-bg)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
                        title="Next Day"
                    >
                        <ChevronRight size={16} />
                    </button>
                    {selectedDate !== todayString() && (
                        <button
                            type="button"
                            onClick={handleToday}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                        >
                            Today
                        </button>
                    )}
                </div>

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
                </div>
            )}

            {/* ── Modal ── */}
            <MarkAttendanceModal
                isOpen={showModal}
                onClose={closeModal}
                onSuccess={handleModalSuccess}
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
