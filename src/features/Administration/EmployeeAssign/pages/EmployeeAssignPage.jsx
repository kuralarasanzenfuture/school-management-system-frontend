import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, AlertCircle, RefreshCw } from "lucide-react";
import EmployeeAssignToolbar from "../components/EmployeeAssignToolbar.jsx";
import EmployeeAssignTable from "../components/EmployeeAssignTable.jsx";
import EmployeeAssignModal from "../components/EmployeeAssignModal.jsx";
import UnassignUserModal from "../components/UnassignUserModal.jsx";
import {
  fetchEmployees,
  assignEmployeeUser,
} from "../../../../redux/employee/employeeSlice.js";
import { fetchUsers } from "../../../../redux/Administration/users/userSlice.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import "../styles/EmployeeAssign.css";

const EmployeeAssignPage = () => {
  const dispatch = useDispatch();

  const { employees = [], loading, error } = useSelector((state) => state.employees);
  const { users = [] } = useSelector((state) => state.users);
  const { user: authUser } = useSelector((state) => state.auth);

  // Filters state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [unassignModalOpen, setUnassignModalOpen] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState(null);

  // Comprehensive check for Super Admin status
  const isAdmin = useMemo(() => {
    if (!authUser) return true;
    if (authUser.is_admin || authUser.isAdmin) return true;
    if (authUser.role && String(authUser.role).toUpperCase().includes("ADMIN")) return true;
    if (authUser.role_name && String(authUser.role_name).toUpperCase().includes("ADMIN")) return true;
    if (authUser.roles) {
      if (Array.isArray(authUser.roles)) {
        return authUser.roles.some((r) => {
          const name = typeof r === "object" ? r?.name || "" : String(r);
          return name.toUpperCase().includes("ADMIN");
        });
      }
      return String(authUser.roles).toUpperCase().includes("ADMIN");
    }
    // If user has no school_id, they have multi-school access
    if (!authUser.school_id) return true;
    return false;
  }, [authUser]);

  const schoolId = isAdmin ? null : authUser?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  // Always fetch schools list so school filter and school names are available
  useEffect(() => {
    if (schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, schools.length]);

  // Fetch users list once
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Helper to load employees with backend get filters
  const loadEmployees = useCallback(() => {
    const params = { all: "true" };
    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    // Only send school_id if a specific school is picked; empty string = "All Schools"
    if (selectedSchool) {
      params.school_id = selectedSchool;
    }
    if (assignmentFilter === "assigned") {
      params.user_assigned = "true";
    } else if (assignmentFilter === "unassigned") {
      params.user_assigned = "false";
    }

    dispatch(fetchEmployees(params));
  }, [dispatch, debouncedSearch, selectedSchool, assignmentFilter]);

  // Trigger backend fetch when filter parameters change
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Dual-layer client-side filtering (guarantees accurate display even if backend route fallbacks)
  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (employees || []).filter((emp) => {
      // 1. Search term match
      const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
      const code = (emp.employee_code || "").toLowerCase();
      const email = (emp.email || "").toLowerCase();
      const phone = (emp.mobile || emp.phone || "").toLowerCase();
      const dept = (emp.department || emp.department_name || "").toLowerCase();
      const desig = (emp.designation || emp.designation_name || "").toLowerCase();

      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        code.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        dept.includes(term) ||
        desig.includes(term);

      // 2. School match:
      // If a school is selected in the dropdown, filter by that school.
      // If "All Schools" (selectedSchool is ""), display all schools.
      const empSchoolId = emp.school_id ?? emp.school?.id;
      const matchesSchool = selectedSchool
        ? String(empSchoolId) === String(selectedSchool)
        : isAdmin
        ? true
        : schoolId
        ? String(empSchoolId) === String(schoolId)
        : true;

      // 3. Assignment filter match
      let matchesAssignment = true;
      const isAssigned = Boolean(emp.user_id || (emp.user && emp.user.id));
      if (assignmentFilter === "assigned") {
        matchesAssignment = isAssigned;
      } else if (assignmentFilter === "unassigned") {
        matchesAssignment = !isAssigned;
      }

      return matchesSearch && matchesSchool && matchesAssignment;
    });
  }, [employees, search, selectedSchool, assignmentFilter, isAdmin, schoolId]);

  // Modal Handlers
  const openAssignModal = (employee) => {
    setSelectedEmployee(employee);
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleAssignSubmit = async (userId) => {
    const empId = selectedEmployee?.id ?? selectedEmployee?.employee_id;
    if (!empId) {
      alert("Employee ID is missing");
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(
        assignEmployeeUser({
          employee_id: Number(empId),
          user_id: Number(userId),
        }),
      ).unwrap();
      closeAssignModal();
      loadEmployees();
    } catch (err) {
      alert(typeof err === "string" ? err : err?.message || "Failed to assign user");
    } finally {
      setSubmitting(false);
    }
  };

  const openUnassignModal = (employee) => {
    setUnassignTarget(employee);
    setUnassignModalOpen(true);
  };

  const closeUnassignModal = () => {
    setUnassignModalOpen(false);
    setUnassignTarget(null);
  };

  const handleUnassignSuccess = () => {
    loadEmployees();
  };

  return (
    <div className="ea-page min-h-screen p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <h1 className="ea-title text-2xl font-bold tracking-tight">
              Employee User Assignment
            </h1>
          </div>
          <p className="ea-subtitle text-[13.5px] mt-1.5 ml-0.5">
            Link school employees to active user login accounts so they can sign into the portal.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEmployees}
          disabled={loading}
          className="ea-btn-outline inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all self-start md:self-auto cursor-pointer shadow-sm hover:shadow"
          title="Refresh employees list"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Toolbar with backend and local filters */}
      <EmployeeAssignToolbar
        search={search}
        onSearchChange={setSearch}
        assignmentFilter={assignmentFilter}
        onAssignmentFilterChange={setAssignmentFilter}
        selectedSchool={selectedSchool}
        onSchoolChange={setSelectedSchool}
        schools={schools}
        schoolsLoading={schoolsLoading}
        isAdmin={isAdmin}
        totalCount={filteredEmployees.length}
      />

      {/* Main Table Content */}
      {loading && employees.length === 0 ? (
        <div className="ea-table-card rounded-2xl p-12 text-center shadow-sm border border-border/60">
          <RefreshCw size={24} className="animate-spin text-primary mx-auto mb-3" />
          <p className="ea-loading text-[14px]">Loading employees…</p>
        </div>
      ) : error && employees.length === 0 ? (
        <div className="ea-table-card rounded-2xl p-10 text-center shadow-sm border border-border/60">
          <AlertCircle size={28} className="text-destructive mx-auto mb-2" />
          <p className="ea-error text-[14px] font-semibold mb-3">{error}</p>
          <button
            type="button"
            onClick={loadEmployees}
            className="ea-btn-outline px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <EmployeeAssignTable
          employees={filteredEmployees}
          users={users}
          schools={schools}
          isAdmin={isAdmin}
          onAssign={openAssignModal}
          onUnassign={openUnassignModal}
        />
      )}

      {/* Assign User Modal */}
      <EmployeeAssignModal
        isOpen={assignModalOpen}
        onClose={closeAssignModal}
        employee={selectedEmployee}
        users={users}
        employees={employees}
        onSubmit={handleAssignSubmit}
        submitting={submitting}
      />

      {/* Unassign Confirmation Modal */}
      <UnassignUserModal
        isOpen={unassignModalOpen}
        onClose={closeUnassignModal}
        employee={unassignTarget}
        onSuccess={handleUnassignSuccess}
      />
    </div>
  );
};

export default EmployeeAssignPage;