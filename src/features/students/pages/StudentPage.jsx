import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Download,
  Plus,
  ChevronDown,
  ArrowUpDown,
  FileText,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import AddStudentModal from "../components/AddStudentModal";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteStudent,
  getStudents,
} from "../../../redux/student/studentSlice";
import { avatarColors } from "../../../common/utils/colors";
import "../styles/StudentPage.css";
import { useNavigate } from "react-router-dom";

const CLASS_TABS = [
  "All Classes",
  "Class VIII",
  "Class IX",
  "Class X",
  "Class XI",
  "Class XII",
];
const PAGE_SIZE = 20;

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

// Formats an ISO date of birth into a short readable date; falls back to "—".
function formatDob(dob) {
  if (!dob) return "—";
  const d = new Date(dob);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const IMAGE_BASE_URL = "http://localhost:5000"; // Adjust this to your actual API base URL

export default function StudentsPage() {
  const dispatch = useDispatch();

  const { students, loading, error } = useSelector((state) => state.students);
  // console.log("Students from Redux state:", students);
  const [openModal, setOpenModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("All Classes");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const [statusFilter, setStatusFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getStudents());
  }, [dispatch]);

  // Resolve the class value regardless of which key the API uses.
  const getStudentClass = (s) =>
    s.student_class || s.class || s.studentClass || null;

  const filtered = useMemo(() => {
    let result = students || [];

    // Class filter
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
  }, [students, activeTab, statusFilter, genderFilter]);

  // console.log(filtered);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleAll = (e) =>
    setSelected(e.target.checked ? pageRows.map((s) => s.id) : []);
  const toggleOne = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const getAvatarColor = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?",
    );
    if (!confirmDelete) return;

    try {
      await dispatch(deleteStudent(id)).unwrap();
    } catch (err) {
      alert(err || "Failed to delete student");
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
    // Refresh the list in case something changed.
    dispatch(getStudents());
  };

  if (loading) {
    return <h3 className="sp-loading px-6 py-10">Loading...</h3>;
  }

  if (error) {
    return <h3 className="sp-error px-6 py-10">{error}</h3>;
  }

  return (
    <div className="sp-page min-h-screen p-6">
      {/* Header */}
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

      {/* Stat cards */}
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
          value={students?.length ?? 0}
          label="Active students"
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

      {/* Filter bar */}
      <div className="sp-filter-bar flex flex-wrap items-center gap-2.5 rounded-2xl px-4 py-3 mb-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          {CLASS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                activeTab === tab ? "sp-tab-active" : "sp-tab"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="sp-divider w-px h-6 mx-1" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          // className="sp-select-btn px-3.5 py-2 rounded-lg text-[13px] font-medium border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          className="sp-select-btn px-3.5 py-2 rounded-lg text-[13px] font-medium"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="graduated">Graduated</option>
          <option value="transferred">Transferred</option>
          <option value="dropped">Dropped</option>
        </select>

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          // className="sp-select-btn px-3.5 py-2 rounded-lg text-[13px] font-medium border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          className="sp-select-btn px-3.5 py-2 rounded-lg text-[13px] font-medium"
        >
          <option value="All">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <div className="ml-auto flex items-center gap-3">
          <span className="sp-count-text text-[12.5px]">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
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

      {/* Table card */}
      <div className="sp-table-card rounded-2xl overflow-hidden">
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
                      pageRows.every((s) => selected.includes(s.id))
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
              {pageRows.map((s) => {
                const initials =
                  `${s.first_name?.[0] || ""}${s.last_name?.[0] || ""}`.toUpperCase();
                const avatarColor = getAvatarColor(
                  `${s.id}-${s.first_name}-${s.last_name}`,
                );
                const studentClass = getStudentClass(s);
                const city = s.permanent_city || s.current_city || null;

                const imageUrl =
                  s.photo_url &&
                  s.photo_url !== "null" &&
                  s.photo_url.trim() !== ""
                    ? `${IMAGE_BASE_URL}${s.photo_url.startsWith("/") ? "" : "/"}${s.photo_url}`
                    : null;

                // console.log("Photo:", s.photo_url);
                // console.log("Image URL:", s.id, imageUrl);
                return (
                  <tr key={s.id} className="sp-row transition-colors">
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        className="sp-checkbox w-4 h-4 rounded"
                        checked={selected.includes(s.id)}
                        onChange={() => toggleOne(s.id)}
                      />
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-[12px] font-bold shrink-0 ${avatarColor}`}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={s.first_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>
                        <div>
                          <p className="sp-name text-[13.5px] font-semibold">
                            {s.first_name} {s.last_name}
                          </p>
                          <p className="sp-email text-[12px]">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="sp-cell px-3 py-3.5 text-[13.5px]">
                      {s.mobile_no || <span className="sp-cell-muted">—</span>}
                    </td>
                    <td className="sp-cell px-3 py-3.5 text-[13.5px] capitalize">
                      {s.gender || <span className="sp-cell-muted">—</span>}
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
                      {formatDob(s.date_of_birth)}
                    </td>
                    <td className="sp-cell px-3 py-3.5 text-[13.5px]">
                      {s.status ? (
                        <span className={`sp-status sp-status-${s.status}`}>
                          {s.status}
                        </span>
                      ) : (
                        <span className="sp-cell-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1 pr-2">
                        <button
                          className="sp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          title="View"
                          onClick={() => {
                            console.log(s.id);
                            navigate(`/students/${s.id}`);
                          }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="sp-action-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          title="Edit"
                          onClick={() => openEditModal(s)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="sp-action-btn sp-action-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          title="Delete"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="sp-empty-state px-5 py-10 text-center text-[13.5px]"
                  >
                    No students found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="sp-table-header flex items-center justify-between px-5 py-4">
          <p className="sp-pagination-text text-[12.5px]">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="sp-page-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-colors ${
                  n === page ? "sp-page-btn-active" : "sp-page-btn"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="sp-page-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <AddStudentModal
        isOpen={openModal}
        onClose={closeModal}
        student={editingStudent}
      />
    </div>
  );
}
