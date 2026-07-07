import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmployeeTable from "../components/EmployeeTable";
import EmployeeModal from "../components/EmployeeModal";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployees,
  addEmployee,
  editEmployee,
  removeEmployee,
} from "../../../redux/employee/employeeSlice.js";

import "../styles/Employee.css";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

// TODO: wire this up to wherever your app stores the logged-in admin's
// current school (same assumption used across Class/Section/AcademicYear).
// const CURRENT_SCHOOL_ID = 1;

const STATUS_OPTIONS = ["active", "inactive", "resigned", "terminated"];

const EmployeePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employees, loading, error } = useSelector((state) => state.employees);

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { user, loading: authLoading } = useSelector((state) => state.auth);

  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  // const filteredEmployees = useMemo(() => {
  //   const term = search.trim().toLowerCase();

  //   return employees.filter((e) => {
  //     const matchesSearch = term
  //       ? `${e.first_name} ${e.last_name || ""}`.toLowerCase().includes(term) ||
  //         e.employee_code?.toLowerCase().includes(term) ||
  //         e.mobile?.toLowerCase().includes(term) ||
  //         e.email?.toLowerCase().includes(term)
  //       : true;

  //     const matchesStatus = statusFilter ? e.status === statusFilter : true;

  //     return matchesSearch && matchesStatus;
  //   });
  // }, [employees, search, statusFilter]);

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    return employees.filter((e) => {
      const matchesSearch = term
        ? `${e.first_name} ${e.last_name || ""}`.toLowerCase().includes(term) ||
          e.employee_code?.toLowerCase().includes(term) ||
          e.mobile?.toLowerCase().includes(term) ||
          e.email?.toLowerCase().includes(term)
        : true;

      const matchesStatus = statusFilter ? e.status === statusFilter : true;

      // Admin: filter by selected school
      // Non-admin: show only their school
      const matchesSchool = isAdmin
        ? selectedSchool
          ? Number(e.school_id) === Number(selectedSchool)
          : true
        : Number(e.school_id) === Number(schoolId);

      return matchesSearch && matchesStatus && matchesSchool;
    });
  }, [employees, search, statusFilter, selectedSchool, isAdmin, schoolId]);

  // Navigates to the read-only details page (EmployeeDetailsPage), which
  // expects a route registered like <Route path="/employees/:id" ... />.
  const openViewPage = (employee) => {
    navigate(`/employees/${employee.id}`);
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      if (editingEmployee) {
        await dispatch(
          editEmployee({
            id: editingEmployee.id,
            formData: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(addEmployee(payload)).unwrap();
      }

      dispatch(fetchEmployees());
      closeModal();
    } catch (err) {
      alert(err || "Failed to save employee");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;

    setDeletingId(id);

    try {
      await dispatch(removeEmployee(id)).unwrap();
    } catch (err) {
      alert(err || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="ep-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="ep-title text-2xl font-bold">Employee Management</h1>
          <p className="ep-subtitle text-[13.5px] mt-1">
            Create and manage the staff working at your school.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="ep-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Toolbar */}
      <div className="ep-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="ep-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees…"
            className="ep-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="ep-filter-select rounded-lg px-3 py-2 text-[13.5px] transition-all"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        {/* School Filter */}
        {isAdmin && (
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="ep-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
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

        <span className="ep-count-text text-[12.5px] ml-auto">
          {filteredEmployees.length} employee
          {filteredEmployees.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <p className="ep-loading px-2 py-10 text-[13.5px]">
          Loading employees…
        </p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="ep-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchEmployees())}
            className="ep-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <EmployeeTable
          employees={filteredEmployees}
          onView={openViewPage}
          onEdit={openEditModal}
          onDelete={handleDelete}
          deletingId={deletingId}
          initialPageSize={10}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}

      <EmployeeModal
        isOpen={modalOpen}
        onClose={closeModal}
        employee={editingEmployee}
        // schoolId={CURRENT_SCHOOL_ID}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default EmployeePage;
