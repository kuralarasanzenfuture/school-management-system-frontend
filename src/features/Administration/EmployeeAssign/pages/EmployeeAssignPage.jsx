import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import EmployeeAssignTable from "../components/EmployeeAssignTable.jsx";
import EmployeeAssignModal from "../components/EmployeeAssignModal.jsx";
import {
    fetchEmployees,
    assignEmployeeUser,
    unassignEmployeeUser,
} from "../../../../redux/employee/employeeSlice.js"; // adjust to your actual path
import { fetchUsers } from "../../../../redux/Administration/users/userSlice.js";
import "../styles/EmployeeAssign.css";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

const EmployeeAssignPage = () => {
    const dispatch = useDispatch();

    const { employees, loading, error } = useSelector((state) => state.employees);
    const { users } = useSelector((state) => state.users);

    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [unassigningId, setUnassigningId] = useState(null);
    const [selectedSchool, setSelectedSchool] = useState("");

    const { user, loading: authLoading } = useSelector((state) => state.auth);

    const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

    const schoolId = isAdmin ? null : user?.school_id;

    const schools = useSelector((state) => state.schoolProfile?.schools || []);
    const schoolsLoading = useSelector(
        (state) => state.schoolProfile?.loading || false,
    );

    // Admin picks from a list — fetch it once.
    useEffect(() => {
        if (isAdmin && schools.length === 0) {
            dispatch(fetchSchools());
        }
    }, [dispatch, isAdmin, schools.length]);

    useEffect(() => {
        dispatch(fetchEmployees());
        dispatch(fetchUsers());
    }, [dispatch]);

    // const filteredEmployees = useMemo(() => {
    //     const term = search.trim().toLowerCase();
    //     const list = employees || [];
    //     if (!term) return list;

    //     return list.filter((emp) => {
    //         const name = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
    //         return (
    //             name.includes(term) ||
    //             emp.name?.toLowerCase().includes(term) ||
    //             emp.email?.toLowerCase().includes(term)
    //         );
    //     });
    // }, [employees, search]);

    const filteredEmployees = useMemo(() => {
        const term = search.trim().toLowerCase();

        return (employees || []).filter((emp) => {
            const fullName =
                `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();

            const matchesSearch =
                !term ||
                fullName.includes(term) ||
                emp.employee_code?.toLowerCase().includes(term) ||
                emp.email?.toLowerCase().includes(term);

            const matchesSchool = isAdmin
                ? selectedSchool
                    ? String(emp.school_id) === String(selectedSchool)
                    : true
                : String(emp.school_id) === String(schoolId);

            return matchesSearch && matchesSchool;
        });
    }, [employees, search, selectedSchool, isAdmin, schoolId]);

    const openAssignModal = (employee) => {
        setSelectedEmployee(employee);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleAssignSubmit = async (userId) => {
        setSubmitting(true);
        try {
            await dispatch(
                assignEmployeeUser({ employeeId: selectedEmployee.id, userId }),
            ).unwrap();
            await dispatch(fetchEmployees());
            closeModal();
        } catch (err) {
            alert(err || "Failed to assign user");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnassign = async (employee) => {
        if (!window.confirm(`Unlink the user account from this employee?`)) return;

        setUnassigningId(employee.id);
        try {
            await dispatch(unassignEmployeeUser(employee.id)).unwrap();
            await dispatch(fetchEmployees());
        } catch (err) {
            alert(err || "Failed to unassign user");
        } finally {
            setUnassigningId(null);
        }
    };

    return (
        <div className="ea-page min-h-screen p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="ea-title text-2xl font-bold">Employee User Assignment</h1>
                <p className="ea-subtitle text-[13.5px] mt-1">
                    Link employees to their login accounts so they can sign in.
                </p>
            </div>

            {/* Toolbar */}
            <div className="ea-toolbar flex items-center gap-3 rounded-2xl px-4 py-3 mb-5">
                <div className="relative flex-1 max-w-xs">
                    <Search size={15} className="ea-count-text absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search employees…"
                        className="ea-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
                    />
                </div>
                {/* School Filter — admin only */}
                {isAdmin && (
                    <select
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        className="up-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
                        disabled={schoolsLoading}
                    >
                        <option value="">All Schools</option>
                        {schools.map((school) => (
                            <option key={school.id} value={school.id}>
                                {school.name}
                            </option>
                        ))}
                    </select>
                )}
                <span className="ea-count-text text-[12.5px] ml-auto">
                    {filteredEmployees.length} employee{filteredEmployees.length === 1 ? "" : "s"}
                </span>
            </div>

            {/* Content */}
            {loading && (!employees || employees.length === 0) ? (
                <p className="ea-loading px-2 py-10 text-[13.5px]">Loading employees…</p>
            ) : error ? (
                <div className="text-center py-10">
                    <p className="ea-error text-[13.5px] mb-3">{error}</p>
                    <button
                        onClick={() => dispatch(fetchEmployees())}
                        className="ea-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <EmployeeAssignTable
                    employees={filteredEmployees}
                    users={users || []}
                    onAssign={openAssignModal}
                    onUnassign={handleUnassign}
                    unassigningId={unassigningId}
                />
            )}

            <EmployeeAssignModal
                isOpen={modalOpen}
                onClose={closeModal}
                employee={selectedEmployee}
                users={users || []}
                employees={employees || []}
                onSubmit={handleAssignSubmit}
                submitting={submitting}
            />
        </div>
    );
};

export default EmployeeAssignPage;