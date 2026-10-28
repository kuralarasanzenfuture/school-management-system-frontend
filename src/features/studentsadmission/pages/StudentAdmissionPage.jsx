import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, RotateCcw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import StudentAdmissionTable, { StudentAdmissionTableSkeleton } from "../components/StudentAdmissionTable.jsx";
import StudentAdmissionModal from "../components/StudentAdmissionModal.jsx";
import DeleteStudentAdmissionModal from "../components/DeleteStudentAdmissionModal.jsx";
import StatusFilterDropdown from "../components/StatusFilterDropdown";
import CustomDropdown from "../../../common/components/dropdown/CustomDropdown.jsx";
import {
  fetchStudentAdmissions,
  createStudentAdmissionThunk,
  updateStudentAdmissionThunk,
} from "../../../redux/studentsAdmission/studentAdmissionSlice.js";
import { getStudents as fetchStudents } from "../../../redux/student/studentSlice.js";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { fetchAcademicYears } from "../../../redux/schoolSetup/academic-year/academicYearSlice.js";
import { fetchClasses } from "../../../redux/schoolSetup/class/classSlice.js";
import "../styles/StudentAdmission.css";

const isCurrentAcademicYear = (ay) => {
  if (!ay) return false;
  if (
    ay.is_current === true ||
    ay.is_current === 1 ||
    ay.is_current === "1" ||
    String(ay.is_current).toLowerCase() === "true"
  ) {
    return true;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (ay.start_date && ay.end_date) {
    const start = new Date(ay.start_date);
    const end = new Date(ay.end_date);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      if (now >= start && now <= end) {
        return true;
      }
    }
  }

  if (String(ay.status).toLowerCase() === "active" || ay.is_active === 1) {
    return true;
  }

  const currentYearStr = String(now.getFullYear());
  const yearName = String(ay.year || ay.name || "");
  if (yearName.includes(currentYearStr)) {
    return true;
  }

  return false;
};

const CLASS_SORT_ORDER = ["pre-kg", "lkg", "ukg"];

const StudentAdmissionPage = () => {
  const dispatch = useDispatch();
  const { studentAdmissions = [], loading, error } = useSelector(
    (state) => state.studentAdmissions,
  );
  const { students = [] } = useSelector((state) => state.students);
  const { academicYears = [], loading: yearsLoading } = useSelector(
    (state) => state.academicYears,
  );
  const { classes = [], loading: classesLoading } = useSelector(
    (state) => state.classes,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(["active", "inactive"]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN") || user?.role === "ADMIN");
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  const effectiveSchoolId = isAdmin ? selectedSchool : schoolId;

  // Admin: load schools once
  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  // Load classes, academic years, students whenever effective school changes
  useEffect(() => {
    const filterArg = effectiveSchoolId
      ? { school_id: effectiveSchoolId, paginate: false }
      : { paginate: false };
    dispatch(fetchAcademicYears(filterArg));
    dispatch(fetchClasses(filterArg));
    dispatch(fetchStudents(filterArg));
  }, [dispatch, effectiveSchoolId]);

  const schoolList = useMemo(() => {
    if (Array.isArray(schools)) return schools;
    if (Array.isArray(schools?.data)) return schools.data;
    if (Array.isArray(schools?.schools)) return schools.schools;
    return [];
  }, [schools]);

  const schoolOptions = useMemo(
    () => [
      { value: "", label: "All Schools" },
      ...schoolList.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [schoolList],
  );

  const rawYearsList = useMemo(() => {
    if (Array.isArray(academicYears)) return academicYears;
    if (Array.isArray(academicYears?.data)) return academicYears.data;
    return [];
  }, [academicYears]);

  const scopedYears = useMemo(() => {
    if (!effectiveSchoolId) return rawYearsList;
    return rawYearsList.filter(
      (y) => y.school_id == null || String(y.school_id) === String(effectiveSchoolId),
    );
  }, [rawYearsList, effectiveSchoolId]);

  // Deduplicated academic year options
  const academicYearOptions = useMemo(() => {
    const yearMap = new Map();
    scopedYears.forEach((y) => {
      const name = String(y.name || y.year || "").trim();
      if (!name) return;
      if (!yearMap.has(name)) {
        const isCurr = isCurrentAcademicYear(y);
        yearMap.set(name, {
          value: name,
          label: `${name}${isCurr ? " [Current]" : ""}`,
          isCurrent: isCurr,
        });
      }
    });

    return [
      { value: "", label: "All Academic Years" },
      ...Array.from(yearMap.values()),
    ];
  }, [scopedYears]);

  // Auto-default selectedYear to Current Academic Year Name
  useEffect(() => {
    if (scopedYears.length > 0) {
      const currentYear = scopedYears.find((y) => isCurrentAcademicYear(y));
      if (currentYear) {
        const currentName = String(currentYear.name || currentYear.year || "").trim();
        setSelectedYear((prev) => {
          const exists = scopedYears.some(
            (y) => String(y.name || y.year || "").trim() === prev || String(y.id) === prev,
          );
          return exists && prev !== "" ? prev : currentName;
        });
      }
    }
  }, [scopedYears]);

  const rawClassesList = useMemo(() => {
    if (Array.isArray(classes)) return classes;
    if (Array.isArray(classes?.data)) return classes.data;
    return [];
  }, [classes]);

  // Deduplicated class options sorted naturally (Pre-KG, LKG, UKG, 1, 2, ..., 12)
  const classOptions = useMemo(() => {
    const list = !effectiveSchoolId
      ? rawClassesList
      : rawClassesList.filter(
          (c) => c.school_id == null || String(c.school_id) === String(effectiveSchoolId),
        );

    const ROMAN_MAP = {
      i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6,
      vii: 7, viii: 8, ix: 9, x: 10, xi: 11, xii: 12,
    };

    const getOrder = (name) => {
      const clean = String(name || "").trim().toLowerCase();
      if (clean === "play group" || clean === "pg") return -4;
      if (clean === "pre-kg" || clean === "prekg" || clean === "nursery") return -3;
      if (clean === "lkg" || clean === "jr. kg" || clean === "jr kg") return -2;
      if (clean === "ukg" || clean === "sr. kg" || clean === "sr kg") return -1;
      const num = parseInt(clean.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(num)) return num;
      const parts = clean.split(/\s+/);
      for (const part of parts) {
        if (ROMAN_MAP[part]) return ROMAN_MAP[part];
      }
      return 100;
    };

    const classMap = new Map();
    list.forEach((c) => {
      const rawName = String(c.name || "").trim();
      if (!rawName) return;
      const key = rawName.toLowerCase().replace(/^(class|grade|standard|std)\s+/i, "");
      if (!classMap.has(key)) {
        classMap.set(key, {
          value: rawName,
          label: rawName.toLowerCase().startsWith("class") || isNaN(Number(rawName)) ? rawName : `Class ${rawName}`,
          rawName,
        });
      }
    });

    const unique = Array.from(classMap.values());
    unique.sort((a, b) => {
      const orderA = getOrder(a.rawName);
      const orderB = getOrder(b.rawName);
      if (orderA !== orderB) return orderA - orderB;
      return a.rawName.localeCompare(b.rawName);
    });

    return [
      { value: "", label: "All Classes" },
      ...unique.map((item) => ({
        value: item.value,
        label: item.label,
      })),
    ];
  }, [rawClassesList, effectiveSchoolId]);

  // Fetch admissions whenever filters change
  useEffect(() => {
    const params = {};
    if (effectiveSchoolId) params.school_id = effectiveSchoolId;
    if (selectedYear) {
      params.academic_year_id = selectedYear;
      params.academic_year_name = selectedYear;
    }
    if (selectedClass) {
      params.class_id = selectedClass;
      params.class_name = selectedClass;
    }
    dispatch(fetchStudentAdmissions(params));
  }, [dispatch, effectiveSchoolId, selectedYear, selectedClass]);

  const studentsById = useMemo(
    () => Object.fromEntries((Array.isArray(students) ? students : []).map((s) => [s.id, s])),
    [students],
  );

  const admissionsList = Array.isArray(studentAdmissions)
    ? studentAdmissions
    : (studentAdmissions?.data || []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return admissionsList.filter((a) => {
      const student = studentsById[a.student_id];
      const studentName = (
        a.student_name ||
        (student ? `${student.first_name || ""} ${student.last_name || ""}` : "")
      ).trim();

      const matchesSearch = term
        ? `${studentName} ${a.admission_number || ""} ${a.class_name || ""} ${a.section || ""}`
            .toLowerCase()
            .includes(term)
        : true;

      const admissionStatus = (a.status || "active").toLowerCase();
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(admissionStatus);

      // School filter
      const matchesSchool = !effectiveSchoolId
        ? true
        : (a.school_id != null && String(a.school_id) === String(effectiveSchoolId)) ||
          (a.schoolId != null && String(a.schoolId) === String(effectiveSchoolId));

      // Academic Year filter: match by academic_year_name or academic_year_id
      const matchesYear = !selectedYear
        ? true
        : String(a.academic_year_name || a.academic_year || a.academic_year_id).toLowerCase() ===
            String(selectedYear).toLowerCase() ||
          String(a.academic_year_id) === String(selectedYear);

      // Class filter: match by class_name or class_id
      const matchesClass = !selectedClass
        ? true
        : String(a.class_name || "").toLowerCase() === String(selectedClass).toLowerCase() ||
          String(a.class_id) === String(selectedClass);

      return matchesSearch && matchesStatus && matchesSchool && matchesYear && matchesClass;
    });
  }, [
    admissionsList,
    studentsById,
    search,
    statusFilter,
    effectiveSchoolId,
    selectedYear,
    selectedClass,
  ]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedClass("");
    setStatusFilter(["active", "inactive"]);
    const currentYear = scopedYears.find((y) => isCurrentAcademicYear(y));
    if (currentYear) {
      setSelectedYear(String(currentYear.name || currentYear.year || currentYear.id).trim());
    } else {
      setSelectedYear("");
    }
  };

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
      const params = {};
      if (effectiveSchoolId) params.school_id = effectiveSchoolId;
      if (selectedYear) {
        params.academic_year_id = selectedYear;
        params.academic_year_name = selectedYear;
      }
      if (selectedClass) {
        params.class_id = selectedClass;
        params.class_name = selectedClass;
      }
      dispatch(fetchStudentAdmissions(params));
      closeModal();
    } catch (err) {
      alert(err || "Failed to save student admission");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    const admission = admissionsList.find(
      (a) => String(a.id) === String(id),
    );
    setDeleteTarget(admission ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    const params = {};
    if (effectiveSchoolId) params.school_id = effectiveSchoolId;
    if (selectedYear) {
      params.academic_year_id = selectedYear;
      params.academic_year_name = selectedYear;
    }
    if (selectedClass) {
      params.class_id = selectedClass;
      params.class_name = selectedClass;
    }
    dispatch(fetchStudentAdmissions(params));
  };

  const deleteTargetStudent = deleteTarget
    ? studentsById[deleteTarget.student_id]
    : null;
  const deleteTargetStudentName = (
    deleteTarget?.student_name ||
    (deleteTargetStudent
      ? `${deleteTargetStudent.first_name || ""} ${deleteTargetStudent.last_name || ""}`
      : "")
  ).trim();

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

      {/* Toolbar & Filters */}
      <div className="sa-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={15}
            className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, admission no, class…"
            className="w-full h-[40px] pl-9 pr-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13.5px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-xs"
          />
        </div>

        {/* School Filter (Admin only) */}
        {isAdmin && (
          <div className="min-w-[200px]">
            <CustomDropdown
              options={schoolOptions}
              value={selectedSchool}
              onChange={(val) => {
                setSelectedSchool(val);
                setSelectedClass("");
              }}
              placeholder={schoolsLoading ? "Loading schools..." : "All Schools"}
              searchable={schoolOptions.length > 5}
              searchPlaceholder="Search schools..."
              disabled={schoolsLoading}
            />
          </div>
        )}

        {/* Academic Year Filter */}
        <div className="min-w-[190px]">
          <CustomDropdown
            options={academicYearOptions}
            value={selectedYear}
            onChange={setSelectedYear}
            placeholder={yearsLoading ? "Loading years..." : "All Academic Years"}
            searchable={academicYearOptions.length > 5}
            searchPlaceholder="Search academic year..."
            disabled={yearsLoading}
          />
        </div>

        {/* Class Filter */}
        <div className="min-w-[150px]">
          <CustomDropdown
            options={classOptions}
            value={selectedClass}
            onChange={setSelectedClass}
            placeholder={classesLoading ? "Loading classes..." : "All Classes"}
            searchable={classOptions.length > 5}
            searchPlaceholder="Search classes..."
            disabled={classesLoading}
          />
        </div>

        {/* Status Filter */}
        <StatusFilterDropdown
          selected={statusFilter}
          onChange={setStatusFilter}
        />

        {/* Reset Filters Button */}
        <button
          onClick={handleResetFilters}
          className="h-[40px] w-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 shadow-xs flex items-center justify-center transition-all active:scale-95 shrink-0"
          title="Reset to current year & default filters"
        >
          <RotateCcw size={15} />
        </button>

        {/* Count badge */}
        <span className="sa-count-text text-[12.5px] ml-auto">
          {filtered.length} admission{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <StudentAdmissionTableSkeleton />
      ) : error ? (
        <div className="text-center py-10">
          <p className="sa-error text-[13.5px] mb-3">{error}</p>
          <button
            onClick={() => {
              const params = {};
              if (effectiveSchoolId) params.school_id = effectiveSchoolId;
              if (selectedYear) {
                params.academic_year_id = selectedYear;
                params.academic_year_name = selectedYear;
              }
              if (selectedClass) {
                params.class_id = selectedClass;
                params.class_name = selectedClass;
              }
              dispatch(fetchStudentAdmissions(params));
            }}
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
          onDelete={openDeleteModal}
          deletingId={deleteTarget?.id ?? null}
        />
      )}

      <StudentAdmissionModal
        isOpen={modalOpen}
        onClose={closeModal}
        admission={editingItem}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteStudentAdmissionModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        admission={deleteTarget}
        studentName={deleteTargetStudentName}
      />
    </div>
  );
};

export default StudentAdmissionPage;
