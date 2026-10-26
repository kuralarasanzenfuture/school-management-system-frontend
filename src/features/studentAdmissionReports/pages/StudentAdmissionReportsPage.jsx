import React, { useEffect, useMemo, useState, useRef } from "react";
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

// Module-level persistent cache across route/tab switches
let lastFetchedReportKey = null;
let savedAcademicYear = "";
let savedSchool = "";
let savedClass = "";

export default function StudentAdmissionReportsPage() {
  const dispatch = useDispatch();

  const {
    studentAdmissions = [],
    admissionsReport = [],
    admissionsReportStats = null,
    loading: admissionsLoading,
    error: admissionsError,
  } = useSelector((state) => state.studentAdmissions);

  const { students = [] } = useSelector((state) => state.students);
  const { academicYears = [] } = useSelector((state) => state.academicYears);
  const { classes = [] } = useSelector((state) => state.classes);
  const { classSections = [] } = useSelector((state) => state.classSections);

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN") || user?.role === "ADMIN");
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);

  // Filter states initialized from module-level cache to prevent re-render loops on tab switch
  const [selectedSchool, setSelectedSchool] = useState(() => savedSchool);
  const [selectedYear, setSelectedYear] = useState(() => savedAcademicYear);
  const [selectedClass, setSelectedClass] = useState(() => savedClass);
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

  // Persist user selected filters across route switches
  useEffect(() => {
    savedSchool = selectedSchool;
  }, [selectedSchool]);

  useEffect(() => {
    savedAcademicYear = selectedYear;
  }, [selectedYear]);

  useEffect(() => {
    savedClass = selectedClass;
  }, [selectedClass]);

  // Options: Raw collections
  const rawYearsList = useMemo(() => {
    if (Array.isArray(academicYears)) return academicYears;
    if (Array.isArray(academicYears?.data)) return academicYears.data;
    return [];
  }, [academicYears]);

  const rawClassesList = useMemo(() => {
    if (Array.isArray(classes)) return classes;
    if (Array.isArray(classes?.data)) return classes.data;
    return [];
  }, [classes]);

  const rawSectionsList = useMemo(() => {
    if (Array.isArray(classSections)) return classSections;
    if (Array.isArray(classSections?.data)) return classSections.data;
    return [];
  }, [classSections]);

  const scopedYears = useMemo(() => {
    if (!effectiveSchoolId) return rawYearsList;
    return rawYearsList.filter(
      (y) => y.school_id == null || String(y.school_id) === String(effectiveSchoolId),
    );
  }, [rawYearsList, effectiveSchoolId]);

  // Compute default current academic year from scoped list
  const defaultCurrentYear = useMemo(() => {
    if (!scopedYears.length) return "";
    const currentYear = scopedYears.find((y) => isCurrentAcademicYear(y));
    return currentYear ? String(currentYear.name || currentYear.year || "").trim() : "";
  }, [scopedYears]);

  // Synchronize selectedYear with defaultCurrentYear if empty
  useEffect(() => {
    if (!selectedYear && defaultCurrentYear) {
      setSelectedYear(defaultCurrentYear);
      savedAcademicYear = defaultCurrentYear;
    }
  }, [defaultCurrentYear, selectedYear]);

  // 1. Load initial meta data (only if empty to avoid tab switch delay)
  useEffect(() => {
    if (isAdmin && (!schools || schools.length === 0)) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools?.length]);

  useEffect(() => {
    const filterArg = effectiveSchoolId
      ? { school_id: effectiveSchoolId, paginate: false }
      : { paginate: false };

    if (!rawYearsList || rawYearsList.length === 0) {
      dispatch(fetchAcademicYears(filterArg));
    }
    if (!rawClassesList || rawClassesList.length === 0) {
      dispatch(fetchClasses(filterArg));
    }
    if (!rawSectionsList || rawSectionsList.length === 0) {
      dispatch(fetchClassSections(filterArg));
    }
  }, [
    dispatch,
    effectiveSchoolId,
    rawYearsList?.length,
    rawClassesList?.length,
    rawSectionsList?.length,
  ]);

  // 2. Fetch Admissions Data whenever school, year or class changes (with persistent module-level cache)
  const loadAdmissions = React.useCallback(
    (force = false) => {
      const params = {};
      if (effectiveSchoolId) params.school_id = effectiveSchoolId;

      const yearToUse = selectedYear || defaultCurrentYear;
      if (yearToUse) {
        if (effectiveSchoolId) {
          const foundAy = scopedYears.find(
            (y) =>
              String(y.name || y.year || "").trim().toLowerCase() === yearToUse.toLowerCase() ||
              String(y.id) === String(yearToUse),
          );
          if (foundAy) params.academic_year_id = String(foundAy.id);
        }
        params.academic_year_name = yearToUse;
        params.academic_year = yearToUse;
      }
      if (selectedClass) {
        if (effectiveSchoolId) {
          params.class_id = selectedClass;
        }
        params.class_name = selectedClass;
      }

      const queryKey = `${effectiveSchoolId || ""}_${params.academic_year_name || params.academic_year_id || ""}_${params.class_name || params.class_id || ""}`;

      // Skip redundant network fetch if already loaded into Redux for these parameters
      const hasExistingData =
        (Array.isArray(admissionsReport) && admissionsReport.length > 0) ||
        (Array.isArray(studentAdmissions) && studentAdmissions.length > 0);

      if (!force && lastFetchedReportKey === queryKey && hasExistingData) {
        return;
      }

      lastFetchedReportKey = queryKey;
      dispatch(fetchStudentAdmissionsReport(params));
    },
    [
      dispatch,
      effectiveSchoolId,
      selectedYear,
      defaultCurrentYear,
      selectedClass,
      scopedYears,
      admissionsReport?.length,
      studentAdmissions?.length,
    ],
  );

  useEffect(() => {
    loadAdmissions();
  }, [loadAdmissions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAdmissions(true);
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

  // Options: Classes (Sorted)
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
      return a.rawName < b.rawName ? -1 : a.rawName > b.rawName ? 1 : 0;
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
  const sectionOptions = useMemo(() => {
    if (!selectedClass) return [{ value: "", label: "All Sections" }];

    const target = selectedClass.trim().toLowerCase();
    const cleanTarget = target.replace(/^(class|grade|standard|std)\s+/i, "");

    const matching = rawSectionsList.filter((cs) => {
      const cName = String(cs.class_name || cs.class?.name || "").trim().toLowerCase();
      return (
        cName === target ||
        cName.replace(/^(class|grade|standard|std)\s+/i, "") === cleanTarget
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

  // Students map by student_id (High-performance single pass without intermediate array allocations)
  const studentsById = useMemo(() => {
    const map = {};
    const list = Array.isArray(students) ? students : [];
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      if (s && s.id != null) {
        map[s.id] = s;
      }
    }
    return map;
  }, [students]);

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

  // Filter Admissions Dataset (Ultra-optimized with loop invariants hoisted outside the 15k-iteration loop)
  const filteredAdmissions = useMemo(() => {
    const term = search.trim().toLowerCase();
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Precalculate target Academic Year info outside the 15k items loop
    let targetYearName = "";
    let targetYearId = "";
    if (selectedYear) {
      const target = selectedYear.trim().toLowerCase();
      const matchedYear = scopedYears.find(
        (y) =>
          String(y.name || y.year || "").trim().toLowerCase() === target ||
          String(y.id) === target,
      );
      targetYearName = matchedYear
        ? String(matchedYear.name || matchedYear.year || "").trim().toLowerCase()
        : target;
      targetYearId = matchedYear ? String(matchedYear.id) : target;
    }

    // Precalculate target class name outside loop
    const targetClassClean = selectedClass
      ? selectedClass.toLowerCase().replace(/^(class|grade|standard|std)\s+/i, "")
      : "";

    // Precalculate target section outside loop
    const targetSectionClean = selectedSection ? selectedSection.toLowerCase() : "";

    // Precalculate target admission type outside loop
    const targetAdmissionType = admissionType ? admissionType.toLowerCase() : "";

    // Precalculate custom dates outside loop
    let customStartMs = null;
    let customEndMs = null;
    if (datePreset === "custom") {
      if (fromDate) {
        const s = new Date(fromDate);
        s.setHours(0, 0, 0, 0);
        customStartMs = s.getTime();
      }
      if (toDate) {
        const e = new Date(toDate);
        e.setHours(23, 59, 59, 999);
        customEndMs = e.getTime();
      }
    }
    const checkDate = datePreset !== "all" || fromDate || toDate;

    return rawAdmissions.filter((a) => {
      // 1. School filter
      if (effectiveSchoolId) {
        const aSchoolId = a.school_id ?? a.schoolId;
        if (aSchoolId != null && String(aSchoolId) !== String(effectiveSchoolId)) {
          return false;
        }
      }

      // 2. Academic Year filter
      if (selectedYear) {
        const aYearName = String(a.academic_year_name || a.academic_year || "").trim().toLowerCase();
        const aYearId = String(a.academic_year_id || "").trim();
        const matchesYear =
          (aYearName && aYearName === targetYearName) ||
          (aYearId && (aYearId === targetYearId || aYearId === targetYearName)) ||
          (!aYearName && !aYearId);

        if (!matchesYear) return false;
      }

      // 3. Class filter
      if (selectedClass) {
        const aClass = String(a.class_name || a.class_id || "").toLowerCase().replace(/^(class|grade|standard|std)\s+/i, "");
        if (aClass !== targetClassClean && String(a.class_id) !== selectedClass) {
          return false;
        }
      }

      // 4. Section filter
      if (selectedSection) {
        const aSection = String(a.section || "").trim().toLowerCase();
        if (aSection !== targetSectionClean) {
          return false;
        }
      }

      // 5. Admission Type filter
      if (admissionType) {
        const aType = String(a.admission_type || "").toLowerCase();
        if (aType !== targetAdmissionType) return false;
      }

      // 6. Facility filter
      if (facilityFilter === "transport") {
        if (!isTrue(a.transport_required)) return false;
      } else if (facilityFilter === "hostel") {
        if (!isTrue(a.hostel_required)) return false;
      } else if (facilityFilter === "both") {
        if (!isTrue(a.transport_required) || !isTrue(a.hostel_required)) return false;
      } else if (facilityFilter === "none") {
        if (isTrue(a.transport_required) || isTrue(a.hostel_required)) return false;
      }

      // 7. Status filter
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

      // 8. Date Range Presets
      if (checkDate) {
        const rawDate = a.joining_date;
        if (!rawDate) {
          if (datePreset === "custom" && (fromDate || toDate)) return false;
        } else {
          const joining = new Date(rawDate);
          const joiningTime = joining.getTime();
          if (isNaN(joiningTime)) {
            if (datePreset === "custom" && (fromDate || toDate)) return false;
          } else {
            if (datePreset === "this_month") {
              if (joining.getMonth() !== thisMonth || joining.getFullYear() !== thisYear) {
                return false;
              }
            } else if (datePreset === "last_30_days") {
              const diffDays = (now.getTime() - joiningTime) / 86400000;
              if (diffDays < 0 || diffDays > 30) return false;
            } else if (datePreset === "custom") {
              if (customStartMs != null && joiningTime < customStartMs) return false;
              if (customEndMs != null && joiningTime > customEndMs) return false;
            }
          }
        }
      }

      // 9. Search match (evaluated only after surviving fast filter criteria)
      if (term) {
        const student = studentsById[a.student_id];
        const studentName = (
          a.student_name ||
          (student ? `${student.first_name || ""} ${student.last_name || ""}` : "")
        ).trim();
        const composite = `${studentName} ${a.admission_number || ""} ${student?.student_code || a.student_code || ""} ${a.class_name || ""} ${a.section || ""} ${student?.phone || a.mobile_no || ""} ${student?.father_name || a.father_name || ""}`.toLowerCase();
        if (!composite.includes(term)) return false;
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
    scopedYears,
  ]);

  // Single-pass computation for KPI stats and all 4 Chart aggregations (Ultra-fast O(N) pass)
  const { computedKpiStats, timelineChartData, classChartData, genderChartData, facilityChartData } = useMemo(() => {
    let active = 0;
    let pending = 0;
    let transport = 0;
    let hostel = 0;
    let male = 0;
    let female = 0;
    let otherGender = 0;
    let transportOnly = 0;
    let hostelOnly = 0;
    let bothFacilities = 0;
    let dayScholar = 0;

    const monthMap = new Map();
    const classMap = new Map();

    const len = filteredAdmissions.length;
    for (let i = 0; i < len; i++) {
      const a = filteredAdmissions[i];
      const sKey = String(a.status || "active").toLowerCase();
      if (sKey === "active" || sKey === "completed") active++;
      if (sKey === "pending") pending++;

      const hasTrans = isTrue(a.transport_required);
      const hasHost = isTrue(a.hostel_required);
      if (hasTrans) transport++;
      if (hasHost) hostel++;

      if (hasTrans && hasHost) bothFacilities++;
      else if (hasTrans) transportOnly++;
      else if (hasHost) hostelOnly++;
      else dayScholar++;

      // Gender
      const gRaw = a.gender || studentsById[a.student_id]?.gender || "";
      const gender = String(gRaw).toLowerCase();
      if (gender === "male" || gender === "m") male++;
      else if (gender === "female" || gender === "f") female++;
      else if (gender) otherGender++;

      // Timeline
      if (a.joining_date) {
        const d = new Date(a.joining_date);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = d.getMonth() + 1;
          const key = `${y}-${m < 10 ? "0" + m : m}`;
          let entry = monthMap.get(key);
          if (!entry) {
            const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
            entry = { key, label, count: 0 };
            monthMap.set(key, entry);
          }
          entry.count++;
        }
      }

      // Class
      const cName = a.class_name ? String(a.class_name).trim() : "Unassigned";
      let classEntry = classMap.get(cName);
      if (!classEntry) {
        classEntry = {
          className: cName,
          count: 0,
          sortOrder: getClassSortOrder(cName),
        };
        classMap.set(cName, classEntry);
      }
      classEntry.count++;
    }

    const sortedTimeline = Array.from(monthMap.values()).sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    const sortedClasses = Array.from(classMap.values()).sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.className < b.className ? -1 : a.className > b.className ? 1 : 0;
    });

    const genderData = [];
    if (male > 0) genderData.push({ name: "Male", count: male });
    if (female > 0) genderData.push({ name: "Female", count: female });
    if (otherGender > 0) genderData.push({ name: "Other", count: otherGender });

    const facilityData = [];
    if (dayScholar > 0) facilityData.push({ name: "Day Scholar", count: dayScholar });
    if (transportOnly > 0) facilityData.push({ name: "Transport Only", count: transportOnly });
    if (hostelOnly > 0) facilityData.push({ name: "Hostel Only", count: hostelOnly });
    if (bothFacilities > 0) facilityData.push({ name: "Transport & Hostel", count: bothFacilities });

    return {
      computedKpiStats: { total: len, active, pending, transport, hostel, male, female },
      timelineChartData: sortedTimeline,
      classChartData: sortedClasses,
      genderChartData: genderData,
      facilityChartData: facilityData,
    };
  }, [filteredAdmissions, studentsById]);

  // Use pre-aggregated stats directly from reports backend API itself,
  // seamlessly falling back to locally filtered stats when in-browser local filters are active
  const hasLocalFilters = Boolean(
    search.trim() ||
    facilityFilter !== "all" ||
    statusFilter !== "all" ||
    datePreset !== "all" ||
    fromDate ||
    toDate ||
    selectedSection
  );

  const kpiStats = useMemo(() => {
    if (!hasLocalFilters && admissionsReportStats) {
      return admissionsReportStats;
    }
    return computedKpiStats;
  }, [hasLocalFilters, admissionsReportStats, computedKpiStats]);

  const currentSchoolObj = schoolList.find((s) => String(s.id) === String(effectiveSchoolId));
  const currentSchoolName = currentSchoolObj?.name || "School";

  // Only show full skeleton placeholder screens if we have NO existing data loaded in memory
  const isInitialLoading = Boolean(admissionsLoading && rawAdmissions.length === 0);
  const isSyncing = Boolean(admissionsLoading || isRefreshing);

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
              {isSyncing ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                  Syncing Dataset...
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  Live Audit
                </span>
              )}
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
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs transition-all active:scale-95 disabled:opacity-50"
            title="Refresh admissions dataset"
          >
            <RefreshCw
              size={14}
              className={`${isSyncing ? "animate-spin text-indigo-600" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Sleek Indeterminate Loading Bar (shown non-intrusively only during active syncing) */}
      {isSyncing && (
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative -mt-3 mb-2 no-print">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 rounded-full animate-sar-indeterminate" />
        </div>
      )}

      {/* Error Alert if any */}
      {admissionsError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle size={17} className="shrink-0 text-rose-500" />
          <span>{admissionsError}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <AdmissionReportKPIs stats={kpiStats} loading={isInitialLoading} />

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
          loading={isInitialLoading}
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
          loading={isInitialLoading}
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
