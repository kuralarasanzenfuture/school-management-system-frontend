import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, LayoutGrid, List, Clock, CheckCircle2, PauseCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import EmployeeShiftCard from "../components/EmployeeShiftCard";
import EmployeeShiftTable from "../components/EmployeeShiftTable";
import EmployeeShiftModal from "../components/EmployeeShiftModal";
import StatusFilterDropdown from "../components/StatusFilterDropdown";
import {
    fetchEmployeeShifts,
    createEmployeeShiftThunk,
    updateEmployeeShiftThunk,
    deleteEmployeeShiftThunk,
} from "../../../../redux/employeeShift/employeeShiftSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import "../styles/EmployeeShift.css";

const EmployeeShiftPage = () => {
    const dispatch = useDispatch();
    const { employeeShifts, loading, error } = useSelector(
        (state) => state.employeeShifts,
    );
    const { user } = useSelector((state) => state.auth);
    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
    const schoolId = isAdmin ? null : user?.school_id;

    const schools = useSelector((state) => state.schoolProfile?.schools || []);

    const [search, setSearch] = useState("");
    const [selectedSchool, setSelectedSchool] = useState("");
    const [statusFilter, setStatusFilter] = useState(["active", "inactive"]);
    const [view, setView] = useState("cards"); // "cards" | "table"

    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        dispatch(fetchEmployeeShifts());
        if (isAdmin) dispatch(fetchSchools());
    }, [dispatch, isAdmin]);

    const schoolScoped = useMemo(() => {
        return employeeShifts.filter((s) => {
            if (isAdmin && selectedSchool) {
                return String(s.school_id) === String(selectedSchool);
            }
            if (!isAdmin && schoolId) {
                return String(s.school_id) === String(schoolId);
            }
            return true;
        });
    }, [employeeShifts, isAdmin, selectedSchool, schoolId]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return schoolScoped.filter((s) => {
            const matchesSearch = term ? s.name.toLowerCase().includes(term) : true;
            const matchesStatus = statusFilter.includes(s.status);
            return matchesSearch && matchesStatus;
        });
    }, [schoolScoped, search, statusFilter]);

    const stats = useMemo(() => {
        const active = schoolScoped.filter((s) => s.status === "active");
        const totalHours = active.reduce(
            (sum, s) => sum + (Number(s.working_hours) || 0),
            0,
        );
        return {
            total: schoolScoped.length,
            active: active.length,
            inactive: schoolScoped.length - active.length,
            avgHours: active.length ? (totalHours / active.length).toFixed(1) : "0.0",
        };
    }, [schoolScoped]);

    const openAddModal = () => {
        setEditingItem(null);
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = async (payload) => {
        setSubmitting(true);
        try {
            if (editingItem) {
                await dispatch(
                    updateEmployeeShiftThunk({ id: editingItem.id, shiftData: payload }),
                ).unwrap();
            } else {
                await dispatch(createEmployeeShiftThunk(payload)).unwrap();
            }
            dispatch(fetchEmployeeShifts());
            closeModal();
        } catch (err) {
            alert(err || "Failed to save shift");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this shift?")) return;
        setDeletingId(id);
        try {
            await dispatch(deleteEmployeeShiftThunk(id)).unwrap();
        } catch (err) {
            alert(err || "Delete failed");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="es-page min-h-screen p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="es-title text-2xl font-bold">Employee Shifts</h1>
                    <p className="es-subtitle text-[13.5px] mt-1">
                        Define working hours and attendance grace periods for staff.
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="es-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
                >
                    <Plus size={16} /> Add Shift
                </button>
            </div>

            {/* Stat summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="es-stat-card rounded-2xl p-4">
                    <div className="flex items-center gap-2 es-stat-label text-[11.5px] uppercase tracking-wide font-semibold">
                        <Clock size={13} /> Total Shifts
                    </div>
                    <p className="es-stat-value text-2xl font-bold mt-1">
                        {stats.total}
                    </p>
                </div>
                <div className="es-stat-card rounded-2xl p-4">
                    <div className="flex items-center gap-2 es-stat-label text-[11.5px] uppercase tracking-wide font-semibold">
                        <CheckCircle2 size={13} /> Active
                    </div>
                    <p className="es-stat-value es-stat-value-active text-2xl font-bold mt-1">
                        {stats.active}
                    </p>
                </div>
                <div className="es-stat-card rounded-2xl p-4">
                    <div className="flex items-center gap-2 es-stat-label text-[11.5px] uppercase tracking-wide font-semibold">
                        <PauseCircle size={13} /> Inactive
                    </div>
                    <p className="es-stat-value text-2xl font-bold mt-1">
                        {stats.inactive}
                    </p>
                </div>
                <div className="es-stat-card rounded-2xl p-4">
                    <div className="flex items-center gap-2 es-stat-label text-[11.5px] uppercase tracking-wide font-semibold">
                        <Clock size={13} /> Avg. Hours
                    </div>
                    <p className="es-stat-value text-2xl font-bold mt-1">
                        {stats.avgHours}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="es-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
                <div className="relative flex-1 max-w-xs">
                    <Search
                        size={15}
                        className="es-count-text absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search shifts…"
                        className="es-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
                    />
                </div>

                {isAdmin && (
                    <select
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        className="es-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
                    >
                        <option value="">All Schools</option>
                        {schools.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                )}

                <StatusFilterDropdown selected={statusFilter} onChange={setStatusFilter} />

                <div className="es-view-toggle flex items-center gap-0.5 rounded-lg p-0.5 ml-auto">
                    <button
                        onClick={() => setView("cards")}
                        className={`es-view-toggle-btn w-8 h-8 rounded-md flex items-center justify-center transition-colors ${view === "cards" ? "es-view-toggle-btn-active" : ""}`}
                        title="Card view"
                    >
                        <LayoutGrid size={15} />
                    </button>
                    <button
                        onClick={() => setView("table")}
                        className={`es-view-toggle-btn w-8 h-8 rounded-md flex items-center justify-center transition-colors ${view === "table" ? "es-view-toggle-btn-active" : ""}`}
                        title="Table view"
                    >
                        <List size={15} />
                    </button>
                </div>

                <span className="es-count-text text-[12.5px]">
                    {filtered.length} shift{filtered.length === 1 ? "" : "s"}
                </span>
            </div>

            {/* Content */}
            {loading ? (
                <p className="es-loading px-2 py-10 text-[13.5px]">
                    Loading shifts…
                </p>
            ) : error ? (
                <div className="text-center py-10">
                    <p className="es-error text-[13.5px] mb-3">{error}</p>
                    <button
                        onClick={() => dispatch(fetchEmployeeShifts())}
                        className="es-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : view === "cards" ? (
                filtered.length === 0 ? (
                    <div className="es-empty-state-card rounded-2xl px-5 py-14 text-center text-[13.5px]">
                        No shifts found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((shift) => (
                            <EmployeeShiftCard
                                key={shift.id}
                                shift={shift}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                                deleting={deletingId === shift.id}
                            />
                        ))}
                    </div>
                )
            ) : (
                <EmployeeShiftTable
                    shifts={filtered}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                    showSchoolColumn={isAdmin && !selectedSchool}
                />
            )}

            <EmployeeShiftModal
                isOpen={modalOpen}
                onClose={closeModal}
                shift={editingItem}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </div>
    );
};

export default EmployeeShiftPage;