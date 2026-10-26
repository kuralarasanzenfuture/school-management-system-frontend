import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileBarChart2,
  RotateCcw,
  RefreshCw,
  Sparkles,
  Calendar,
  School,
  AlertCircle,
  Loader2,
} from "lucide-react";

import AdmissionReportKPIs from "../components/AdmissionReportKPIs.jsx";
import AdmissionReportFilters from "../components/AdmissionReportFilters.jsx";
import AdmissionReportCharts from "../components/AdmissionReportCharts.jsx";
import AdmissionReportTable from "../components/AdmissionReportTable.jsx";
import AdmissionStudentDetailModal from "../components/AdmissionStudentDetailModal.jsx";

import {
  fetchStudentAdmissions,
  fetchStudentAdmissionsReport,
} from "../../../redux/studentsAdmission/studentAdmissionSlice.js";
import { getStudents as fetchStudents } from "../../../redux/student/studentSlice.js";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { fetchAcademicYears } from "../../../redux/schoolSetup/academic-year/academicYearSlice.js";
import { fetchClasses } from "../../../redux/schoolSetup/class/classSlice.js";
import { fetchClassSections } from "../../../redux/schoolSetup/class-sections/classSectionSlice.js";

import "../styles/StudentAdmissionReports.css";

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
      if (now >= start && now <= end) return true;
    }
  }

  if (String(ay.status).toLowerCase() === "active" || ay.is_active === 1) {
    return true;
  }

  const currentYearStr = String(now.getFullYear());
  const yearName = String(ay.year || ay.name || "");
  if (yearName.includes(currentYearStr)) return true;

  return false;
};

const ROMAN_MAP = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6,
  vii: 7, viii: 8, ix: 9, x: 10, xi: 11, xii: 12,
};

const getClassSortOrder = (name) => {
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

function isTrue(val) {
  return val === true || val === 1 || val === "1" || String(val).toLowerCase() === "true";
}

export default function StudentAdmissionReportsPage() {
  const dispatch = useDispatch();

  const {
    studentAdmissions = [],
    admissionsReport = [],
    loading: admissionsLoading,
    error: admissionsError,
  } = useSelector((state) => state.studentAdmissions);

  const { students = [], loading: studentsLoading } = useSelector(
    (state) => state.students,
  );
  const { academicYears = [] } = useSelector((state) => state.academicYears);
  const { classes = [] } = useSelector((state) => state.classes);
  const { classSections = [] } = useSelector((state) => state.classSections);

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN") || user?.role === "ADMIN");
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);

  // Filter states
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [admissionType, setAdmissionType] = useState("");
  const [facilityFilter, setFacilityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [datePreset, setDatePreset] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  // UI View state: 'combined' | 'table' | 'analytics'
  const [viewMode, setViewMode] = useState("combined");
  const [modalAdmission, setModalAdmission] = useState(null);
  const [modalStudent, setModalStudent] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const effectiveSchoolId = isAdmin ? selectedSchool : schoolId;

  // 1. Load initial meta data
  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  useEffect(() => {
    const filterArg = effectiveSchoolId
      ? { school_id: effectiveSchoolId, paginate: false }
      : { paginate: false };
    dispatch(fetchAcademicYears(filterArg));
    dispatch(fetchClasses(filterArg));
    dispatch(fetchClassSections(filterArg));
    dispatch(fetchStudents(filterArg));
  }, [dispatch, effectiveSchoolId]);

  // 2. Fetch Admissions Data whenever school, year or class changes
  const loadAdmissions = React.useCallback(() => {
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
    // Also try fetch report endpoint if supported
    dispatch(fetchStudentAdmissions(params));
    dispatch(fetchStudentAdmissionsReport(params));
  }, [dispatch, effectiveSchoolId, selectedYear, selectedClass]);

  useEffect(() => {
    loadAdmissions();
  }, [loadAdmissions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAdmissions();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Options: Schools
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

  // Options: Academic Years
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

  // Auto-default selectedYear to Current Academic Year
  useEffect(() => {
    if (scopedYears.length > 0 && !selectedYear) {
      const currentYear = scopedYears.find((y) => isCurrentAcademicYear(y));
      if (currentYear) {
        const currentName = String(currentYear.name || currentYear.year || "").trim();
        setSelectedYear(currentName);
      }
    }
  }, [scopedYears, selectedYear]);

  // Options: Classes (Sorted)
  const rawClassesList = useMemo(() => {
    if (Array.isArray(classes)) return classes;
    if (Array.isArray(classes?.data)) return classes.data;
    return [];
  }, [classes]);

  const classOptions = useMemo(() => {
    const list = !effectiveSchoolId
      ? rawClassesList
      : rawClassesList.filter(
          (c) => c.school_id == null || String(c.school_id) === String(effectiveSchoolId),
        );

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
      const orderA = getClassSortOrder(a.rawName);
      const orderB = getClassSortOrder(b.rawName);
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

  // Options: Sections (Filtered by selectedClass)
  const rawSectionsList = useMemo(() => {
    if (Array.isArray(classSections)) return classSections;
    if (Array.isArray(classSections?.data)) return classSections.data;
    return [];
  }, [classSections]);

  const sectionOptions = useMemo(() => {
    if (!selectedClass) return [{ value: "", label: "All Sections" }];

    const matching = rawSectionsList.filter((cs) => {
      const cName = String(cs.class_name || cs.class?.name || "").trim().toLowerCase();
      const target = selectedClass.trim().toLowerCase();
      return (
        cName === target ||
        cName.replace(/^(class|grade|standard|std)\s+/i, "") ===
          target.replace(/^(class|grade|standard|std)\s+/i, "")
      );
    });

    const sectionSet = new Set();
    matching.forEach((cs) => {
      const sName = cs.section_name || cs.section?.name || cs.section;
      if (sName) sectionSet.add(String(sName).trim());
    });

    const sorted = Array.from(sectionSet).sort();
    return [
      { value: "", label: "All Sections" },
      ...sorted.map((s) => ({ value: s, label: `Section ${s}` })),
    ];
  }, [rawSectionsList, selectedClass]);

  // Students map by student_id
  const studentsById = useMemo(
    () => Object.fromEntries((Array.isArray(students) ? students : []).map((s) => [s.id, s])),
    [students],
  );

  // Raw admissions list (combines admissionsReport or studentAdmissions)
  const rawAdmissions = useMemo(() => {
    if (Array.isArray(admissionsReport) && admissionsReport.length > 0) {
      return admissionsReport;
    }
    if (Array.isArray(studentAdmissions)) {
      return studentAdmissions;
    }
    if (Array.isArray(studentAdmissions?.data)) {
      return studentAdmissions.data;
    }
    return [];
  }, [admissionsReport, studentAdmissions]);

  // Compute Active Filter Count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedSchool) count++;
    if (selectedYear) count++;
    if (selectedClass) count++;
    if (selectedSection) count++;
    if (admissionType) count++;
    if (facilityFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (datePreset !== "all") count++;
    if (fromDate || toDate) count++;
    if (search.trim()) count++;
    return count;
  }, [
    selectedSchool,
    selectedYear,
    selectedClass,
    selectedSection,
    admissionType,
    facilityFilter,
    statusFilter,
    datePreset,
    fromDate,
    toDate,
    search,
  ]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedSchool("");
    setSelectedClass("");
    setSelectedSection("");
    setAdmissionType("");
    setFacilityFilter("all");
    setStatusFilter("all");
    setDatePreset("all");
    setFromDate("");
    setToDate("");
    setSearch("");
  };

  // Filter Admissions Dataset
  const filteredAdmissions = useMemo(() => {
    const term = search.trim().toLowerCase();
    const now = new Date();

    return rawAdmissions.filter((a) => {
      const student = studentsById[a.student_id];
      const studentName = (
        a.student_name ||
        (student ? `${student.first_name || ""} ${student.last_name || ""}` : "")
      ).trim();

      // Search match
      if (term) {
        const composite = `${studentName} ${a.admission_number || ""} ${student?.student_code || a.student_code || ""} ${a.class_name || ""} ${a.section || ""} ${student?.phone || ""} ${student?.father_name || ""}`.toLowerCase();
        if (!composite.includes(term)) return false;
      }

      // School filter
      if (effectiveSchoolId) {
        const matchesSchool =
          String(a.school_id) === String(effectiveSchoolId) ||
          String(a.schoolId) === String(effectiveSchoolId);
        if (!matchesSchool) return false;
      }

      // Academic Year filter
      if (selectedYear) {
        const aYear = String(a.academic_year_name || a.academic_year || a.academic_year_id || "").toLowerCase();
        const targetYear = selectedYear.toLowerCase();
        if (aYear !== targetYear && String(a.academic_year_id) !== selectedYear) {
          return false;
        }
      }

      // Class filter
      if (selectedClass) {
        const aClass = String(a.class_name || a.class_id || "").toLowerCase().replace(/^(class|grade|standard|std)\s+/i, "");
        const targetClass = selectedClass.toLowerCase().replace(/^(class|grade|standard|std)\s+/i, "");
        if (aClass !== targetClass && String(a.class_id) !== selectedClass) {
          return false;
        }
      }

      // Section filter
      if (selectedSection) {
        const aSection = String(a.section || "").trim().toLowerCase();
        if (aSection !== selectedSection.toLowerCase()) {
          return false;
        }
      }

      // Admission Type filter
      if (admissionType) {
        const aType = String(a.admission_type || "").toLowerCase();
        if (aType !== admissionType.toLowerCase()) return false;
      }

      // Facility filter
      if (facilityFilter === "transport") {
        if (!isTrue(a.transport_required)) return false;
      } else if (facilityFilter === "hostel") {
        if (!isTrue(a.hostel_required)) return false;
      } else if (facilityFilter === "both") {
        if (!isTrue(a.transport_required) || !isTrue(a.hostel_required)) return false;
      } else if (facilityFilter === "none") {
        if (isTrue(a.transport_required) || isTrue(a.hostel_required)) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const aStatus = String(a.status || "active").toLowerCase();
        if (statusFilter === "inactive") {
          if (aStatus !== "inactive" && aStatus !== "dropped" && aStatus !== "cancelled") {
            return false;
          }
        } else if (aStatus !== statusFilter) {
          return false;
        }
      }

      // Date Range Presets
      if (datePreset !== "all" || fromDate || toDate) {
        const joining = a.joining_date ? new Date(a.joining_date) : null;
        if (!joining || isNaN(joining.getTime())) {
          if (datePreset === "custom" && (fromDate || toDate)) return false;
        } else {
          if (datePreset === "this_month") {
            if (
              joining.getMonth() !== now.getMonth() ||
              joining.getFullYear() !== now.getFullYear()
            ) {
              return false;
            }
          } else if (datePreset === "last_30_days") {
            const diffDays = (now - joining) / (1000 * 60 * 60 * 24);
            if (diffDays < 0 || diffDays > 30) return false;
          } else if (datePreset === "custom") {
            if (fromDate) {
              const start = new Date(fromDate);
              start.setHours(0, 0, 0, 0);
              if (joining < start) return false;
            }
            if (toDate) {
              const end = new Date(toDate);
              end.setHours(23, 59, 59, 999);
              if (joining > end) return false;
            }
          }
        }
      }

      return true;
    });
  }, [
    rawAdmissions,
    studentsById,
    search,
    effectiveSchoolId,
    selectedYear,
    selectedClass,
    selectedSection,
    admissionType,
    facilityFilter,
    statusFilter,
    datePreset,
    fromDate,
    toDate,
  ]);

  // Aggregate KPI Stats
  const kpiStats = useMemo(() => {
    let total = filteredAdmissions.length;
    let active = 0;
    let pending = 0;
    let transport = 0;
    let hostel = 0;
    let male = 0;
    let female = 0;

    filteredAdmissions.forEach((a) => {
      const sKey = String(a.status || "active").toLowerCase();
      if (sKey === "active" || sKey === "completed") active++;
      if (sKey === "pending") pending++;
      if (isTrue(a.transport_required)) transport++;
      if (isTrue(a.hostel_required)) hostel++;

      const student = studentsById[a.student_id];
      const gender = String(student?.gender || a.gender || "").toLowerCase();
      if (gender === "male" || gender === "m") male++;
      else if (gender === "female" || gender === "f") female++;
    });

    return { total, active, pending, transport, hostel, male, female };
  }, [filteredAdmissions, studentsById]);

  // Chart 1: Timeline Intake Trend
  const timelineChartData = useMemo(() => {
    const monthMap = new Map();
    filteredAdmissions.forEach((a) => {
      const d = a.joining_date ? new Date(a.joining_date) : null;
      if (!d || isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      if (!monthMap.has(key)) {
        monthMap.set(key, { key, label, count: 0 });
      }
      monthMap.get(key).count++;
    });

    const sorted = Array.from(monthMap.values()).sort((a, b) => a.key.localeCompare(b.key));
    return sorted;
  }, [filteredAdmissions]);

  // Chart 2: Class-wise Intake Distribution
  const classChartData = useMemo(() => {
    const classMap = new Map();
    filteredAdmissions.forEach((a) => {
      const cName = a.class_name ? String(a.class_name).trim() : "Unassigned";
      if (!classMap.has(cName)) {
        classMap.set(cName, {
          className: cName,
          count: 0,
          sortOrder: getClassSortOrder(cName),
        });
      }
      classMap.get(cName).count++;
    });

    const sorted = Array.from(classMap.values()).sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.className.localeCompare(b.className);
    });

    return sorted;
  }, [filteredAdmissions]);

  // Chart 3: Gender Breakdown
  const genderChartData = useMemo(() => {
    let male = 0;
    let female = 0;
    let other = 0;

    filteredAdmissions.forEach((a) => {
      const student = studentsById[a.student_id];
      const gender = String(student?.gender || a.gender || "").toLowerCase();
      if (gender === "male" || gender === "m") male++;
      else if (gender === "female" || gender === "f") female++;
      else other++;
    });

    const res = [];
    if (male > 0) res.push({ name: "Male", count: male });
    if (female > 0) res.push({ name: "Female", count: female });
    if (other > 0) res.push({ name: "Other", count: other });
    return res;
  }, [filteredAdmissions, studentsById]);

  // Chart 4: Facility Breakdown
  const facilityChartData = useMemo(() => {
    let transportOnly = 0;
    let hostelOnly = 0;
    let both = 0;
    let dayScholar = 0;

    filteredAdmissions.forEach((a) => {
      const hasTrans = isTrue(a.transport_required);
      const hasHost = isTrue(a.hostel_required);
      if (hasTrans && hasHost) both++;
      else if (hasTrans) transportOnly++;
      else if (hasHost) hostelOnly++;
      else dayScholar++;
    });

    const res = [];
    if (dayScholar > 0) res.push({ name: "Day Scholar", count: dayScholar });
    if (transportOnly > 0) res.push({ name: "Transport Only", count: transportOnly });
    if (hostelOnly > 0) res.push({ name: "Hostel Only", count: hostelOnly });
    if (both > 0) res.push({ name: "Transport & Hostel", count: both });
    return res;
  }, [filteredAdmissions]);

  const currentSchoolObj = schoolList.find((s) => String(s.id) === String(effectiveSchoolId));
  const currentSchoolName = currentSchoolObj?.name || "School";

  return (
    <div className="sar-container p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <FileBarChart2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Admission Reports & Analytics
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                Live Audit
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-dimensional enrollment reports, facility tracking, class intake breakdowns, and audit rosters.
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto no-print">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={admissionsLoading || isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs transition-all active:scale-95 disabled:opacity-50"
            title="Refresh admissions dataset"
          >
            <RefreshCw
              size={14}
              className={`${admissionsLoading || isRefreshing ? "animate-spin text-indigo-600" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Alert if any */}
      {admissionsError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle size={17} className="shrink-0 text-rose-500" />
          <span>{admissionsError}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <AdmissionReportKPIs stats={kpiStats} />

      {/* Advanced Filter Bar */}
      <AdmissionReportFilters
        search={search}
        setSearch={setSearch}
        selectedSchool={selectedSchool}
        setSelectedSchool={setSelectedSchool}
        schoolOptions={schoolOptions}
        isAdmin={isAdmin}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        academicYearOptions={academicYearOptions}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        classOptions={classOptions}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        sectionOptions={sectionOptions}
        admissionType={admissionType}
        setAdmissionType={setAdmissionType}
        facilityFilter={facilityFilter}
        setFacilityFilter={setFacilityFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onResetFilters={handleResetFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeFilterCount={activeFilterCount}
      />

      {/* Visual Analytics Section (Charts) */}
      {(viewMode === "analytics" || viewMode === "combined") && (
        <AdmissionReportCharts
          timelineData={timelineChartData}
          classData={classChartData}
          genderData={genderChartData}
          facilityData={facilityChartData}
          totalAdmissions={filteredAdmissions.length}
        />
      )}

      {/* Detailed Audit Table Section */}
      {(viewMode === "table" || viewMode === "combined") && (
        <AdmissionReportTable
          admissions={filteredAdmissions}
          studentsById={studentsById}
          onSelectAdmission={(adm, std) => {
            setModalAdmission(adm);
            setModalStudent(std);
          }}
          currentSchoolName={currentSchoolName}
          currentAcademicYearName={selectedYear || "All Academic Years"}
        />
      )}

      {/* Student Admission Snapshot Modal */}
      <AdmissionStudentDetailModal
        isOpen={Boolean(modalAdmission)}
        onClose={() => {
          setModalAdmission(null);
          setModalStudent(null);
        }}
        admission={modalAdmission}
        student={modalStudent}
      />
    </div>
  );
}
