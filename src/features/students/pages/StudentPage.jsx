import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle2,
  Download,
  Plus,
  Search,
  ArrowUpDown,
  FileText,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  RotateCcw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../../../redux/student/studentSlice";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice";
import AddStudentModal from "../components/AddStudentModal";
import DeleteStudentModal from "../components/DeleteStudentModal";
import Pagination from "../../../common/components/table/Pagination";
import usePagination from "../../../common/components/table/usePagination";
import CustomDropdown from "../../../common/components/dropdown/CustomDropdown";
import { avatarColors } from "../../../common/utils/colors";
import { IMAGE_BASE_URL, getFullImageUrl } from "../../../config/env.js";
import "../styles/StudentPage.css";


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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selected, setSelected] = useState([]);

  const statusOptions = useMemo(
    () => [
      { value: "All", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "graduated", label: "Graduated" },
      { value: "transferred", label: "Transferred" },
      { value: "dropped", label: "Dropped" },
    ],
    [],
  );

  const genderOptions = useMemo(
    () => [
      { value: "All", label: "All Genders" },
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
    ],
    [],
  );

  const schoolOptions = useMemo(() => {
    const list = Array.isArray(schools)
      ? schools
      : Array.isArray(schools?.data)
        ? schools.data
        : [];
    return [
      { value: "", label: "All Schools" },
      ...list.map((s) => ({ value: String(s.id), label: s.name })),
    ];
  }, [schools]);

  /* ── Query builder & Fetch ── */
  const buildQueryParams = useCallback(() => {
    const params = {};
    if (isAdmin && selectedSchool) {
      params.school_id = selectedSchool;
    }
    if (statusFilter && statusFilter !== "All") {
      params.status = statusFilter;
    }
    if (genderFilter && genderFilter !== "All") {
      params.gender = genderFilter;
    }
    if (search.trim()) {
      params.search = search.trim();
    }
    params.paginate = "false";
    return params;
  }, [isAdmin, selectedSchool, statusFilter, genderFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(getStudents(buildQueryParams()));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    if (isAdmin && schools.length === 0) dispatch(fetchSchools());
  }, [dispatch, isAdmin, schools.length]);

  const refetch = useCallback(() => {
    dispatch(getStudents(buildQueryParams()));
  }, [dispatch, buildQueryParams]);

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

    // Search — name, email, mobile, or admission number
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((student) => {
        const fullName =
          `${student.first_name || ""} ${student.last_name || ""}`.toLowerCase();
        return (
          fullName.includes(term) ||
          student.email?.toLowerCase().includes(term) ||
          student.mobile_no?.toLowerCase().includes(term) ||
          student.admission_number?.toLowerCase().includes(term)
        );
      });
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
    search,
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
  const handleSearch = (e) => {
    setSearch(e.target.value);
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
  // Looks the full student up from the already-loaded list rather than
  // trusting the row-level id alone — DeleteStudentModal needs the full
  // record (name, email) to show a meaningful confirmation. Same fix
  // applied to every other module's page after the School empty-name bug.
  const openDeleteModal = (id) => {
    const student = (students ?? []).find((s) => String(s.id) === String(id));
    setDeleteTarget(student ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    refetch(); // reload list after a successful delete
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
    refetch();
  };

  const resetAllFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setGenderFilter("All");
    setSelectedSchool("");
    reset();
  };

  const hasActiveFilters = Boolean(
    search ||
      (isAdmin && selectedSchool) ||
      statusFilter !== "All" ||
      genderFilter !== "All",
  );

  if (loading) return <StudentPageSkeleton />;
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
          icon={CheckCircle2}
          tone="warning"
          value={students?.filter((s) => s.status?.toLowerCase() === "active").length ?? 0}
          label="Active students"
        />
        <StatCard
          icon={UserX}
          tone="danger"
          value={selected.length}
          label="Selected"
        />
      </div>

      {/* ── Search bar ── */}
      <div className="sp-toolbar flex items-center gap-3 rounded-2xl px-4 py-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="sp-count-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search name, email, mobile, admission no…"
            className="sp-search-input w-full rounded-lg pl-9 pr-3 py-2 text-[13.5px] transition-all"
          />
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="sp-filter-bar flex flex-wrap items-center gap-2.5 rounded-2xl px-4 py-3 mb-6">
        {/* Status filter */}
        <CustomDropdown
          options={statusOptions}
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            reset();
          }}
          className="min-w-[140px]"
        />

        {/* Gender filter */}
        <CustomDropdown
          options={genderOptions}
          value={genderFilter}
          onChange={(val) => {
            setGenderFilter(val);
            reset();
          }}
          className="min-w-[140px]"
        />

        {/* School filter — ADMIN only */}
        {isAdmin && (
          <CustomDropdown
            options={schoolOptions}
            value={selectedSchool}
            onChange={(val) => {
              setSelectedSchool(val);
              reset();
            }}
            placeholder={schoolsLoading ? "Loading schools…" : "All Schools"}
            searchable={schoolOptions.length > 5}
            searchPlaceholder="Search schools…"
            className="min-w-[200px]"
            disabled={schoolsLoading}
          />
        )}

        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="sp-btn-outline inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors hover:text-red-600 hover:border-red-200"
            title="Reset all filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
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
                    colSpan={8}
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
                  const imageUrl = getFullImageUrl(student.photo_url);

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
                            onClick={() => openDeleteModal(student.id)}
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

      <DeleteStudentModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        student={deleteTarget}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Skeleton Loading Component for Students Directory
───────────────────────────────────────────────────────────── */
function StudentPageSkeleton() {
  return (
    <div className="sp-page min-h-screen p-6">
      {/* ── Header Skeleton ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="sp-skeleton h-7 w-36 rounded-lg mb-2" />
          <div className="sp-skeleton h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="sp-skeleton h-10 w-24 rounded-xl" />
          <div className="sp-skeleton h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* ── Stat Cards Skeleton ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="sp-stat-card flex items-center gap-3.5 rounded-2xl px-5 py-4"
          >
            <div className="sp-skeleton w-11 h-11 rounded-xl shrink-0" />
            <div className="flex-1">
              <div className="sp-skeleton h-6 w-16 rounded-md mb-2" />
              <div className="sp-skeleton h-3.5 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Search Bar Skeleton ── */}
      <div className="sp-toolbar flex items-center gap-3 rounded-2xl px-4 py-3 mb-4">
        <div className="sp-skeleton h-9 w-80 rounded-lg" />
      </div>

      {/* ── Filter Bar Skeleton ── */}
      <div className="sp-filter-bar flex flex-wrap items-center gap-2.5 rounded-2xl px-4 py-3 mb-6">
        <div className="sp-skeleton h-9 w-36 rounded-lg" />
        <div className="sp-skeleton h-9 w-36 rounded-lg" />
        <div className="sp-skeleton h-9 w-44 rounded-lg" />
      </div>

      {/* ── Table Skeleton ── */}
      <div className="sp-table-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="sp-thead text-[11.5px] uppercase tracking-wide">
                <th className="px-5 py-3 w-10">
                  <div className="sp-skeleton w-4 h-4 rounded" />
                </th>
                <th className="px-3 py-3">
                  <div className="sp-skeleton h-3.5 w-20 rounded" />
                </th>
                <th className="px-3 py-3">
                  <div className="sp-skeleton h-3.5 w-16 rounded" />
                </th>
                <th className="px-3 py-3">
                  <div className="sp-skeleton h-3.5 w-16 rounded" />
                </th>
                <th className="px-3 py-3">
                  <div className="sp-skeleton h-3.5 w-16 rounded" />
                </th>
                <th className="px-3 py-3">
                  <div className="sp-skeleton h-3.5 w-24 rounded" />
                </th>
                <th className="px-3 py-3">
                  <div className="sp-skeleton h-3.5 w-16 rounded" />
                </th>
                <th className="px-3 py-3 text-right pr-5">
                  <div className="sp-skeleton h-3.5 w-16 rounded ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                <tr
                  key={row}
                  className="sp-row border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="px-5 py-3.5">
                    <div className="sp-skeleton w-4 h-4 rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="sp-skeleton w-9 h-9 rounded-full shrink-0" />
                      <div className="flex flex-col gap-1.5">
                        <div className="sp-skeleton h-3.5 w-32 rounded" />
                        <div className="sp-skeleton h-2.5 w-44 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="sp-skeleton h-3.5 w-24 rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="sp-skeleton h-3.5 w-16 rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="sp-skeleton h-3.5 w-20 rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="sp-skeleton h-3.5 w-20 rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="sp-skeleton h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1.5 pr-2">
                      <div className="sp-skeleton w-7 h-7 rounded-lg" />
                      <div className="sp-skeleton w-7 h-7 rounded-lg" />
                      <div className="sp-skeleton w-7 h-7 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="sp-skeleton h-4 w-32 rounded" />
          <div className="flex items-center gap-2">
            <div className="sp-skeleton h-8 w-20 rounded-lg" />
            <div className="sp-skeleton h-8 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
