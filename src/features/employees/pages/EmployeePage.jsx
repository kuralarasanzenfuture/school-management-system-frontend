import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EmployeeTable from "../components/EmployeeTable";
import EmployeeModal from "../components/EmployeeModal";
import DeleteEmployeeModal from "../components/DeleteEmployeeModal";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployees,
  addEmployee,
  editEmployee,
} from "../../../redux/employee/employeeSlice.js";
import { fetchEmployeeDesignations } from "../../../redux/employeeDesignation/employeeDesignationSlice.js";

import "../styles/Employee.css";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import CustomDropdown from "../../../common/components/dropdown/CustomDropdown.jsx";

const STATUS_OPTIONS = ["active", "inactive", "resigned", "terminated"];

const EmployeePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { employees, loading, error } = useSelector((state) => state.employees);
  const { employeeDesignations } = useSelector(
    (state) => state.employeeDesignations,
  );

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { user } = useSelector((state) => state.auth);

  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  const schoolList = useMemo(() => {
    const raw = Array.isArray(schools)
      ? schools
      : schools?.schools || schools?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [schools]);

  useEffect(() => {
    if (isAdmin && schoolList.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schoolList.length]);

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchEmployeeDesignations());
  }, [dispatch]);

  useEffect(() => {
    if (editId && employees.length > 0) {
      const target = employees.find((e) => String(e.id) === String(editId));
      if (target) {
        setEditingEmployee(target);
        setModalOpen(true);
      }
    }
  }, [editId, employees]);

  const designationList = useMemo(() => {
    const raw = Array.isArray(employeeDesignations)
      ? employeeDesignations
      : employeeDesignations?.data || employeeDesignations?.designations || [];
    return Array.isArray(raw) ? raw : [];
  }, [employeeDesignations]);

  const designationOptions = useMemo(() => {
    return [
      { value: "", label: "All Designations" },
      ...designationList.map((d) => ({
        value: String(d.id),
        label: d.name,
      })),
    ];
  }, [designationList]);

  const statusOptions = useMemo(
    () => [
      { value: "", label: "All Statuses" },
      ...STATUS_OPTIONS.map((s) => ({
        value: s,
        label: s.charAt(0).toUpperCase() + s.slice(1),
      })),
    ],
    [],
  );

  const schoolOptions = useMemo(
    () => [
      { value: "", label: "All Schools" },
      ...schoolList.map((school) => ({
        value: String(school.id),
        label: school.name,
      })),
    ],
    [schoolList],
  );

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();
    const selDesignation = designationFilter
      ? designationList.find((d) => String(d.id) === String(designationFilter))?.name?.toLowerCase()
      : null;

    return employees.filter((e) => {
      const matchesSearch = term
        ? `${e.first_name} ${e.last_name || ""}`.toLowerCase().includes(term) ||
          e.employee_code?.toLowerCase().includes(term) ||
          e.mobile?.toLowerCase().includes(term) ||
          e.email?.toLowerCase().includes(term)
        : true;

      const matchesStatus = statusFilter ? e.status === statusFilter : true;

      const matchesDesignation = designationFilter
        ? String(e.designation_id) === String(designationFilter) ||
          String(e.designation || "").toLowerCase() === String(designationFilter).toLowerCase() ||
          (selDesignation && String(e.designation || "").toLowerCase() === selDesignation)
        : true;

      // Admin: filter by selected school
      // Non-admin: show only their school
      const matchesSchool = isAdmin
        ? selectedSchool
          ? Number(e.school_id) === Number(selectedSchool)
          : true
        : Number(e.school_id) === Number(schoolId);

      return matchesSearch && matchesStatus && matchesDesignation && matchesSchool;
    });
  }, [
    employees,
    search,
    statusFilter,
    designationFilter,
    selectedSchool,
    isAdmin,
    schoolId,
    designationList,
  ]);

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
    if (searchParams.get("edit")) {
      searchParams.delete("edit");
      setSearchParams(searchParams, { replace: true });
    }
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

  // EmployeeTable calls onDelete(id) — matching every other table in this
  // app. DeleteEmployeeModal needs the full record (first_name, last_name,
  // employee_code) to show a meaningful confirmation.
  const openDeleteModal = (id) => {
    const employee = employees.find((e) => String(e.id) === String(id));
    setDeleteTarget(employee ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    dispatch(fetchEmployees()); // reload list after a successful delete
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


        {/* Designation Filter */}
        <CustomDropdown
          options={designationOptions}
          value={designationFilter}
          onChange={(val) => setDesignationFilter(val)}
          placeholder="All Designations"
          searchable={designationOptions.length > 5}
          searchPlaceholder="Search designations…"
          className="min-w-[170px]"
        />

        {/* Status Filter */}
        <CustomDropdown
          options={statusOptions}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          placeholder="All Statuses"
          className="min-w-[150px]"
        />

        {/* School Filter */}
        {isAdmin && (
          <CustomDropdown
            options={schoolOptions}
            value={selectedSchool}
            onChange={(val) => setSelectedSchool(val)}
            placeholder={schoolsLoading ? "Loading schools…" : "All Schools"}
            searchable={schoolOptions.length > 5}
            searchPlaceholder="Search schools…"
            disabled={schoolsLoading}
            className="min-w-[220px]"
          />
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
          onDelete={openDeleteModal}
          deletingId={deleteTarget?.id ?? null}
          initialPageSize={10}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}

      <EmployeeModal
        isOpen={modalOpen}
        onClose={closeModal}
        employee={editingEmployee}
        schoolId={selectedSchool || schoolId}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteEmployeeModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        employee={deleteTarget}
      />
    </div>
  );
};

export default EmployeePage;
