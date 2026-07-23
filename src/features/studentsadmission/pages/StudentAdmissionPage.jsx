import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import StudentAdmissionTable from "../components/StudentAdmissionTable.jsx";
import StudentAdmissionModal from "../components/StudentAdmissionModal.jsx";
import StatusFilterDropdown from "../components/StatusFilterDropdown";
import {
  fetchStudentAdmissions,
  createStudentAdmissionThunk,
  updateStudentAdmissionThunk,
  deleteStudentAdmissionThunk,
} from "../../../redux/studentsAdmission/studentAdmissionSlice.js";
// ASSUMPTION: fetchStudents follows the same naming pattern as other list
// thunks — used here to build the id -> name lookup for the table, since
// the admissions GET response doesn't include a joined student_name.
import { getStudents as fetchStudents } from "../../../redux/student/studentSlice.js";
import "../styles/StudentAdmission.css";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

const StudentAdmissionPage = () => {
  const dispatch = useDispatch();
  const { studentAdmissions, loading, error } = useSelector(
    (state) => state.studentAdmissions,
  );
  const { students = [] } = useSelector((state) => state.students);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(["active", "inactive"]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState("");

  const { user, loading: authLoading } = useSelector((state) => state.auth);

  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  const effectiveSchoolId = isAdmin ? selectedSchool : schoolId;

  // Admin picks from a list — fetch it once.
  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  useEffect(() => {
    dispatch(fetchStudentAdmissions());
    dispatch(fetchStudents());
  }, [dispatch]);

  const studentsById = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, s])),
    [students],
  );

  // const filtered = useMemo(() => {
  //   const term = search.trim().toLowerCase();

  //   return studentAdmissions.filter((a) => {
  //     const student = studentsById[a.student_id];
  //     const studentName = student
  //       ? `${student.first_name} ${student.last_name || ""}`
  //       : "";

  //     const matchesSearch = term
  //       ? `${studentName} ${a.admission_number || ""} ${a.class_name || ""}`
  //         .toLowerCase()
  //         .includes(term)
  //       : true;

  //     const matchesStatus = statusFilter.includes(a.status);

  //     return matchesSearch && matchesStatus;
  //   });
  // }, [studentAdmissions, search, statusFilter, studentsById]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return studentAdmissions.filter((a) => {
      const student = studentsById[a.student_id];

      const studentName = student
        ? `${student.first_name || ""} ${student.last_name || ""}`
        : "";

      const matchesSearch = term
        ? `${studentName} ${a.admission_number || ""} ${a.class_name || ""}`
          .toLowerCase()
          .includes(term)
        : true;

      const matchesStatus = statusFilter.includes(a.status);

      // School filter
      const matchesSchool = effectiveSchoolId
        ? String(a.school_id) === String(effectiveSchoolId)
        : true;

      return matchesSearch && matchesStatus && matchesSchool;
    });
  }, [
    studentAdmissions,
    studentsById,
    search,
    statusFilter,
    effectiveSchoolId,
  ]);

  // console.log("filtered:", filtered);

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
          updateStudentAdmissionThunk({
            id: editingItem.id,
            studentData: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(createStudentAdmissionThunk(payload)).unwrap();
      }
      dispatch(fetchStudentAdmissions());
      closeModal();
    } catch (err) {
      alert(err || "Failed to save student admission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student admission?")) return;
    setDeletingId(id);
    try {
      await dispatch(deleteStudentAdmissionThunk(id)).unwrap();
    } catch (err) {
      alert(err || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="sa-page min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="sa-title text-2xl font-bold">
            Student Admission Management
          </h1>
          <p className="sa-subtitle text-[13.5px] mt-1">
            Enroll students into a class, section, and academic year.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="sa-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={16} /> Add Admission
        </button>
      </div>

      {/* Toolbar */}
      <div className="sa-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="sa-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, admission no, class…"
            className="sa-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
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

        <StatusFilterDropdown
          selected={statusFilter}
          onChange={setStatusFilter}
        />

        <span className="sa-count-text text-[12.5px] ml-auto">
          {filtered.length} admission{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <p className="sa-loading px-2 py-10 text-[13.5px]">
          Loading student admissions…
        </p>
      ) : error ? (
        <div className="text-center py-10">
          <p className="sa-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchStudentAdmissions())}
            className="sa-btn-outline px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <StudentAdmissionTable
          admissions={filtered}
          studentsById={studentsById}
          onEdit={openEditModal}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      <StudentAdmissionModal
        isOpen={modalOpen}
        onClose={closeModal}
        admission={editingItem}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default StudentAdmissionPage;
