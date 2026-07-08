import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Download,
  Plus,
  ArrowUpDown,
  FileText,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  deleteStudent,
  getStudents,
} from "../../../redux/student/studentSlice";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice";
import AddStudentModal from "../components/AddStudentModal";
import Pagination from "../../../common/components/table/Pagination";
import usePagination from "../../../common/components/table/usePagination";
import { avatarColors } from "../../../common/utils/colors";
import "../styles/StudentPage.css";

const CLASS_TABS = [
  "All Classes",
  "Class VIII",
  "Class IX",
  "Class X",
  "Class XI",
  "Class XII",
];
const IMAGE_BASE_URL = "http://localhost:5000";

/* ── helpers ── */
function StatCard({ icon: Icon, tone, value, label }) {
  return (
    <div className="sp-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4">
      <div
        className={`sp-stat-icon-${tone}-bg w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}
      >
        <Icon size={20} className={`sp-stat-icon-${tone}-color`} />
      </div>
      <div>
        <p className="sp-stat-value text-xl font-bold leading-none">{value}</p>
        <p className="sp-stat-label text-[12.5px] mt-1">{label}</p>
      </div>
    </div>
  );
}

function Badge({ children, className = "sp-badge-neutral" }) {
  return (
    <span
      className={`${className} inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold`}
    >
      {children}
    </span>
  );
}

function formatDob(dob) {
  if (!dob) return "—";
  const dateObj = new Date(dob);
  if (isNaN(dateObj)) return "—";
  return dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStudentClass(student) {
  return student.student_class || student.class || student.studentClass || null;
}

function getAvatarColor(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

/* ───────────────────────────────────────────────────── */

export default function StudentsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { students, loading, error } = useSelector((state) => state.students);
  const { user } = useSelector((state) => state.auth);
  const schools = useSelector((state) => state.schoolProfile?.schools ?? []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading ?? false,
  );

  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const schoolId = isAdmin ? null : user?.school_id;

  const [openModal, setOpenModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("All Classes");
  const [statusFilter, setStatusFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selected, setSelected] = useState([]);

  /* ── Fetch ── */
  useEffect(() => {
    dispatch(getStudents());
  }, [dispatch]);
  useEffect(() => {
    if (isAdmin && schools.length === 0) dispatch(fetchSchools());
  }, [dispatch, isAdmin, schools.length]);

  /* ── Filter ── */
  const filtered = useMemo(() => {
    let result = students ?? [];

    // School filter:
    //   Admin → use dropdown (empty = all schools)
    //   Non-admin → always restrict to their own school_id
    result = result.filter((student) => {
      if (isAdmin) {
        return selectedSchool
          ? String(student.school_id) === String(selectedSchool)
          : true;
      }
      return String(student.school_id) === String(schoolId);
    });

    // Class tab filter
    if (activeTab !== "All Classes") {
      const cls = activeTab.replace("Class ", "");
      result = result.filter(
        (student) =>
          student.student_class === cls ||
          student.class === cls ||
          student.studentClass === cls,
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter(
        (student) =>
          student.status?.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    // Gender filter
    if (genderFilter !== "All") {
      result = result.filter(
        (student) =>
          student.gender?.toLowerCase() === genderFilter.toLowerCase(),
      );
    }

    return result;
  }, [
    students,
    isAdmin,
    schoolId,
    selectedSchool,
    activeTab,
    statusFilter,
    genderFilter,
  ]);

  /* ── Pagination ── */
  const {
    pagedData: pageRows,
    currentPage: page,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset,
  } = usePagination({ data: filtered, initialSize: 20 });

  /* ── Filter change handlers — reset to page 1 ── */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    reset();
  };
  const handleStatus = (e) => {
    setStatusFilter(e.target.value);
    reset();
  };
  const handleGender = (e) => {
    setGenderFilter(e.target.value);
    reset();
  };
  const handleSchool = (e) => {
    setSelectedSchool(e.target.value);
    reset();
  };

  /* ── Checkbox helpers ── */
  const toggleAll = (event) =>
    setSelected(
      event.target.checked ? pageRows.map((student) => student.id) : [],
    );

  const toggleOne = (id) =>
    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((existingId) => existingId !== id)
        : [...prevSelected, id],
    );

  /* ── CRUD actions ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    try {
      await dispatch(deleteStudent(id)).unwrap();
    } catch (deleteError) {
      alert(deleteError || "Failed to delete student");
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setOpenModal(true);
  };
  const openEditModal = (student) => {
    setEditingStudent(student);
    setOpenModal(true);
  };
  const closeModal = () => {
    setOpenModal(false);
    setEditingStudent(null);
    dispatch(getStudents());
  };

  if (loading) return <h3 className="sp-loading px-6 py-10">Loading...</h3>;
  if (error) return <h3 className="sp-error px-6 py-10">{error}</h3>;

  return (
    <div className="sp-page min-h-screen p-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="sp-title text-2xl font-bold">Students</h1>
          <p className="sp-subtitle text-[13.5px] mt-1">
            Manage all enrolled students, track performance and attendance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="sp-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors">
            <Download size={16} /> Export
          </button>
          <button
            onClick={openAddModal}
            className="sp-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold active:scale-[0.97] transition-all shadow-sm"
          >
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          tone="primary"
          value={students?.length ?? 0}
          label="Total enrolled"
        />
        <StatCard
          icon={UserCheck}
          tone="success"
          value={filtered.length}
          label="Showing"
        />
        <StatCard
          icon={AlertTriangle}
          tone="warning"
          value={CLASS_TABS.length - 1}
          label="Classes tracked"
        />
        <StatCard
          icon={UserX}
          tone="danger"
          value={selected.length}
          label="Selected"
        />
      </div>

      {/* ── Filter bar ── */}
      <div className="sp-filter-bar flex flex-wrap items-center gap-2.5 rounded-2xl px-4 py-3 mb-6">
        {/* Class tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CLASS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                activeTab === tab ? "sp-tab-active" : "sp-tab"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="sp-divider w-px h-6 mx-1" />

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={handleStatus}
          className="sp-select-btn px-3.5 py-2 rounded-lg text-[13px] font-medium"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="graduated">Graduated</option>
          <option value="transferred">Transferred</option>
          <option value="dropped">Dropped</option>
        </select>

        {/* Gender filter */}
        <select
          value={genderFilter}
          onChange={handleGender}
          className="sp-select-btn px-3.5 py-2 rounded-lg text-[13px] font-medium"
        >
          <option value="All">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        {/* School filter — ADMIN only */}
        {isAdmin && (
          <select
            value={selectedSchool}
            onChange={handleSchool}
            className="sp-select-btn px-3.5 py-2 rounded-lg text-[13px] font-medium min-w-[200px]"
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

        {/* Count + view toggle */}
        <div className="ml-auto flex items-center gap-3">
          <span className="sp-count-text text-[12.5px]">
            {totalItems === 0
              ? "No results"
              : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalItems)} of ${totalItems}`}
          </span>
          <div className="sp-toggle-group flex items-center rounded-lg overflow-hidden">
            <button className="sp-toggle-btn-active p-2">
              <List size={15} />
            </button>
            <button className="sp-toggle-btn p-2">
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="sp-table-card rounded-2xl overflow-hidden">
        {/* Card header */}
        <div className="sp-table-header flex items-center justify-between px-5 py-4">
          <h2 className="sp-table-title text-[15px] font-bold">
            Student directory
          </h2>
          <button className="sp-export-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-colors">
            <FileText size={14} /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="sp-thead text-[11.5px] uppercase tracking-wide">
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    className="sp-checkbox w-4 h-4 rounded"
                    onChange={toggleAll}
                    checked={
                      pageRows.length > 0 &&
                      pageRows.every((student) => selected.includes(student.id))
                    }
                  />
                </th>
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Student <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Phone <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-3 py-3 font-semibold">Gender</th>
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Class <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    City <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Date of Birth <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold text-right pr-5">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="sp-empty-state px-5 py-10 text-center text-[13.5px]"
                  >
                    No students found for this filter.
                  </td>
                </tr>
              ) : (
                pageRows.map((student) => {
                  const initials =
                    `${student.first_name?.[0] ?? ""}${student.last_name?.[0] ?? ""}`.toUpperCase();
                  const avatarColor = getAvatarColor(
                    `${student.id}-${student.first_name}-${student.last_name}`,
                  );
                  const studentClass = getStudentClass(student);
                  const city =
                    student.permanent_city || student.current_city || null;
                  const imageUrl =
                    student.photo_url &&
                    student.photo_url !== "null" &&
                    student.photo_url.trim() !== ""
                      ? `${IMAGE_BASE_URL}${student.photo_url.startsWith("/") ? "" : "/"}${student.photo_url}`
                      : null;

                  return (
                    <tr key={student.id} className="sp-row transition-colors">
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          className="sp-checkbox w-4 h-4 rounded"
                          checked={selected.includes(student.id)}
                          onChange={() => toggleOne(student.id)}
                        />
                      </td>

                      {/* Name + avatar */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-[12px] font-bold shrink-0 ${avatarColor}`}
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={student.first_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <p className="sp-name text-[13.5px] font-semibold">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="sp-email text-[12px]">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="sp-cell px-3 py-3.5 text-[13.5px]">
                        {student.mobile_no || (
                          <span className="sp-cell-muted">—</span>
                        )}
                      </td>

                      <td className="sp-cell px-3 py-3.5 text-[13.5px] capitalize">
                        {student.gender || (
                          <span className="sp-cell-muted">—</span>
                        )}
                      </td>

                      <td className="px-3 py-3.5">
                        {studentClass ? (
                          <Badge>{studentClass}</Badge>
                        ) : (
                          <Badge className="sp-badge-fallback">—</Badge>
                        )}
                      </td>

                      <td className="sp-cell px-3 py-3.5 text-[13.5px]">
                        {city || <span className="sp-cell-muted">—</span>}
                      </td>

                      <td className="sp-cell px-3 py-3.5 text-[13.5px]">
                        {formatDob(student.date_of_birth)}
                      </td>

                      <td className="sp-cell px-3 py-3.5 text-[13.5px]">
                        {student.status ? (
                          <span
                            className={`sp-status sp-status-${student.status}`}
                          >
                            {student.status}
                          </span>
                        ) : (
                          <span className="sp-cell-muted">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-end gap-1 pr-2">
                          <button
                            onClick={() => navigate(`/students/${student.id}`)}
                            className="sp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="sp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="sp-action-btn sp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Global Pagination ── */}
        <Pagination
          currentPage={page}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <AddStudentModal
        isOpen={openModal}
        onClose={closeModal}
        student={editingStudent}
      />
    </div>
  );
}
