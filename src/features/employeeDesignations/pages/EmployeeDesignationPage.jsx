import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search } from "lucide-react";
import EmployeeDesignationTable from "../components/EmployeeDesignationTable";
import EmployeeDesignationModal from "../components/EmployeeDesignationModal";
import {
  fetchEmployeeDesignations,
  addEmployeeDesignation,
  editEmployeeDesignation,
  removeEmployeeDesignation,
} from "../../../redux/employeeDesignation/employeeDesignationSlice.js";
import "../styles/EmployeeDesignation.css";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

const EmployeeDesignationPage = () => {
  const dispatch = useDispatch();

  const { employeeDesignations, loading, error } = useSelector(
    (state) => state.employeeDesignations,
  );

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
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
    dispatch(fetchEmployeeDesignations());
  }, [dispatch]);

  // const filteredDesignations = useMemo(() => {
  //   const list = employeeDesignations || [];
  //   // const list = employeeDesignations.designations || [];
  //   const term = search.trim().toLowerCase();
  //   if (!term) return list;
  //   return list.filter(
  //     (d) =>
  //       d.name?.toLowerCase().includes(term) ||
  //       d.description?.toLowerCase().includes(term),
  //   );
  // }, [employeeDesignations, search]);

  const filteredDesignations = useMemo(() => {
    let list = employeeDesignations || [];

    // Search
    if (search.trim()) {
      const term = search.toLowerCase();

      list = list.filter(
        (d) =>
          d.name?.toLowerCase().includes(term) ||
          d.description?.toLowerCase().includes(term),
      );
    }

    // School filter (Admin only)
    if (isAdmin && selectedSchool) {
      list = list.filter((d) => d.school_id === Number(selectedSchool));
    }

    return list;
  }, [employeeDesignations, search, selectedSchool, isAdmin]);

  //   console.log("employeeDesignations:", employeeDesignations);
  //   console.log("filteredDesignations:", filteredDesignations);
  //   console.log(Array.isArray(filteredDesignations));

  const openAddModal = () => {
    setEditingDesignation(null);
    setModalOpen(true);
  };

  const openEditModal = (designation) => {
    setEditingDesignation(designation);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDesignation(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingDesignation) {
        await dispatch(
          editEmployeeDesignation({
            id: editingDesignation.id,
            formData: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(addEmployeeDesignation(payload)).unwrap();
      }
      await dispatch(fetchEmployeeDesignations());
      closeModal();
    } catch (err) {
      alert(err || "Failed to save designation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this designation? This can't be undone.",
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await dispatch(removeEmployeeDesignation(id)).unwrap();
    } catch (err) {
      alert(err || "Failed to delete designation");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="edp-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="edp-title text-2xl font-bold">
            Employee Designations
          </h1>
          <p className="edp-subtitle text-[13.5px] mt-1">
            Manage the job titles/designations available for employees.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="edp-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Designation
        </button>
      </div>

      {/* Toolbar */}
      <div className="edp-toolbar flex items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="edp-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search designations…"
            className="edp-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>

        {/* School Filter */}
        {isAdmin && (
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="edp-search-input rounded-lg px-3 py-2 text-[13.5px] min-w-[220px]"
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

        <span className="edp-count-text text-[12.5px] ml-auto">
          {filteredDesignations.length} designation
          {filteredDesignations.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading &&
      (!employeeDesignations || employeeDesignations.length === 0) ? (
        <p className="edp-loading px-2 py-10 text-[13.5px]">
          Loading designations…
        </p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="edp-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchEmployeeDesignations())}
            className="edp-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <EmployeeDesignationTable
          designations={filteredDesignations}
          onEdit={openEditModal}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      <EmployeeDesignationModal
        isOpen={modalOpen}
        onClose={closeModal}
        designation={editingDesignation}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default EmployeeDesignationPage;
