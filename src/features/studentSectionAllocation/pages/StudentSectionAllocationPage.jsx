import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus,
  Search,
  RotateCcw,
  UserCheck,
  Layers,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import CustomDropdown from "../../../common/components/dropdown/CustomDropdown.jsx";
import StudentSectionAllocationTable from "../components/StudentSectionAllocationTable.jsx";
import StudentSectionAllocationModal from "../components/StudentSectionAllocationModal.jsx";
import DeleteSectionAllocationModal from "../components/DeleteSectionAllocationModal.jsx";

import {
  fetchSectionAllocations,
  createSectionAllocationThunk,
  updateSectionAllocationThunk,
  deleteSectionAllocationThunk,
} from "../../../redux/studentSectionAllocation/studentSectionAllocationSlice.js";
import { fetchStudentAdmissions } from "../../../redux/studentsAdmission/studentAdmissionSlice.js";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { fetchClasses } from "../../../redux/schoolSetup/class/classSlice.js";
import { fetchSections } from "../../../redux/schoolSetup/section/sectionSlice.js";
import { fetchClassSections } from "../../../redux/schoolSetup/class-sections/classSectionSlice.js";
import { fetchAcademicYears } from "../../../redux/schoolSetup/academic-year/academicYearSlice.js";

const isCurrentAcademicYear = (ay) => {
  if (!ay) return false;
  if (ay.is_current === 1 || ay.is_current === true || ay.is_current === "1") return true;

  const now = new Date();
  if (ay.start_date && ay.end_date) {
    const start = new Date(ay.start_date);
    const end = new Date(ay.end_date);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && now >= start && now <= end) {
      return true;
    }
  }

  const currentYearStr = String(now.getFullYear());
  const yearName = String(ay.year || ay.name || "");
  if (yearName.includes(currentYearStr) && (ay.status === "active" || ay.is_active === 1)) {
    return true;
  }

  return false;
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "transferred", label: "Transferred" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function StudentSectionAllocationPage() {
  const dispatch = useDispatch();

  const { allocations = [], loading, error } = useSelector(
    (state) => state.studentSectionAllocations,
  );
  const { studentAdmissions = [] } = useSelector(
    (state) => state.studentAdmissions,
  );

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN") || user?.role === "ADMIN");
  const userSchoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const classes = useSelector((state) => state.classes?.classes || []);
  const sections = useSelector((state) => state.sections?.sections || []);
  const classSections = useSelector((state) => state.classSections?.classSections || []);
  const academicYears = useSelector((state) => state.academicYears?.academicYears || []);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const effectiveSchoolId = isAdmin ? selectedSchool : userSchoolId;

  // Initial loads
  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  // Load dependent lists whenever school changes
  useEffect(() => {
    const params = effectiveSchoolId ? { school_id: effectiveSchoolId, paginate: false } : { paginate: false };
    dispatch(fetchClasses(params));
    dispatch(fetchSections(params));
    dispatch(fetchClassSections(params));
    dispatch(fetchAcademicYears(params));
    dispatch(fetchStudentAdmissions(effectiveSchoolId ? { school_id: effectiveSchoolId } : {}));
  }, [dispatch, effectiveSchoolId]);

  const rawYearsList = useMemo(() => {
    if (Array.isArray(academicYears)) return academicYears;
    if (Array.isArray(academicYears?.data)) return academicYears.data;
    return [];
  }, [academicYears]);

  const scopedYears = useMemo(() => {
    if (!effectiveSchoolId) return rawYearsList;
    return rawYearsList.filter(
      (y) => !y.school_id || String(y.school_id) === String(effectiveSchoolId),
    );
  }, [rawYearsList, effectiveSchoolId]);

  // Academic Year options and auto-select current
  const academicYearOptions = useMemo(() => {
    if (effectiveSchoolId) {
      return [
        { value: "", label: "All Academic Years" },
        ...scopedYears.map((ay) => {
          const current = isCurrentAcademicYear(ay);
          return {
            value: String(ay.id),
            label: `${ay.name || ay.year}${current ? " [Current]" : ""}`,
            isCurrent: current,
          };
        }),
      ];
    }

    // When All Schools is selected: deduplicate by year name
    const yearMap = new Map();
    rawYearsList.forEach((ay) => {
      const name = String(ay.name || ay.year || "").trim();
      if (!name) return;
      if (!yearMap.has(name)) {
        const current = isCurrentAcademicYear(ay);
        yearMap.set(name, {
          value: name,
          label: `${name}${current ? " [Current]" : ""}`,
          isCurrent: current,
        });
      }
    });

    return [
      { value: "", label: "All Academic Years" },
      ...Array.from(yearMap.values()),
    ];
  }, [rawYearsList, scopedYears, effectiveSchoolId]);

  // Synchronize selected academic year whenever school/scopedYears changes
  useEffect(() => {
    if (scopedYears.length === 0) return;

    // Check if currently selectedYear matches any year in the new school scope (by ID or by name)
    const matching = scopedYears.find(
      (y) =>
        String(y.id) === String(selectedYear) ||
        (selectedYear && String(y.name || y.year || "").trim() === String(selectedYear).trim()),
    );

    if (matching) {
      const nextVal = effectiveSchoolId ? String(matching.id) : String(matching.name || matching.year).trim();
      if (nextVal !== selectedYear) {
        setSelectedYear(nextVal);
      }
    } else {
      // Default to current academic year of the selected school
      const currentOpt = scopedYears.find((y) => isCurrentAcademicYear(y)) || scopedYears[0];
      if (currentOpt) {
        const nextVal = effectiveSchoolId ? String(currentOpt.id) : String(currentOpt.name || currentOpt.year).trim();
        setSelectedYear(nextVal);
      } else {
        setSelectedYear("");
      }
    }
  }, [scopedYears, effectiveSchoolId]);

  // Fetch Section Allocations based on filters
  const reloadAllocations = useCallback(() => {
    const filters = {};
    if (effectiveSchoolId) filters.school_id = effectiveSchoolId;
    if (selectedYear) filters.academic_year_id = selectedYear;
    if (selectedClass) filters.class_id = selectedClass;
    if (selectedSection) filters.section_id = selectedSection;
    if (selectedStatus) filters.status = selectedStatus;
    dispatch(fetchSectionAllocations(filters));
  }, [dispatch, effectiveSchoolId, selectedYear, selectedClass, selectedSection, selectedStatus]);

  useEffect(() => {
    reloadAllocations();
  }, [reloadAllocations]);

  // Filter school options
  const schoolOptions = useMemo(() => {
    const list = Array.isArray(schools) ? schools : [];
    return [
      { value: "", label: "All Schools" },
      ...list.map((s) => ({ value: String(s.id), label: s.name })),
    ];
  }, [schools]);

const ROMAN_MAP = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6,
  vii: 7, viii: 8, ix: 9, x: 10, xi: 11, xii: 12,
};

const normalizeClassKey = (name) => {
  const clean = String(name || "").trim().toLowerCase();
  return clean.replace(/^(class|grade|standard|std)\s+/i, "");
};

const formatClassLabel = (name) => {
  const str = String(name || "").trim();
  if (!str) return "Unknown Class";
  if (str.toLowerCase().startsWith("class")) return str;
  if (!isNaN(Number(str))) return `Class ${str}`;
  return str;
};

const sortClassList = (classList) => {
  const getOrder = (name) => {
    const clean = String(name || "").trim().toLowerCase();
    if (clean === "play group" || clean === "pg") return -4;
    if (clean === "pre-kg" || clean === "prekg" || clean === "nursery") return -3;
    if (clean === "lkg" || clean === "jr. kg" || clean === "jr kg") return -2;
    if (clean === "ukg" || clean === "sr. kg" || clean === "sr kg") return -1;
    
    // Direct number check
    const num = parseInt(clean.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(num)) return num;

    // Roman numeral check (e.g. Class X, XII)
    const parts = clean.split(/\s+/);
    for (const part of parts) {
      if (ROMAN_MAP[part]) return ROMAN_MAP[part];
    }

    return 100;
  };

  return [...classList].sort((a, b) => {
    const orderA = getOrder(a.name || a.label);
    const orderB = getOrder(b.name || b.label);
    if (orderA !== orderB) return orderA - orderB;
    return String(a.name || a.label).localeCompare(String(b.name || b.label));
  });
};

  // Filter class options: strictly deduplicated by grade and naturally sorted
  const classOptions = useMemo(() => {
    const list = Array.isArray(classes) ? classes : [];
    
    // If a specific school is active, prefer classes belonging to that school
    let candidateList = list;
    if (effectiveSchoolId) {
      const scoped = list.filter((c) => String(c.school_id) === String(effectiveSchoolId));
      if (scoped.length > 0) {
        candidateList = scoped;
      }
    }

    // Deduplicate classes so each grade appears EXACTLY ONCE
    const classMap = new Map();
    candidateList.forEach((c) => {
      const rawName = String(c.name || "").trim();
      if (!rawName) return;
      const key = normalizeClassKey(rawName);
      if (!classMap.has(key)) {
        classMap.set(key, {
          // If a school is active, use the numeric ID; otherwise use the normalized name
          value: effectiveSchoolId ? String(c.id) : rawName,
          name: rawName,
          label: formatClassLabel(rawName),
          searchText: `${rawName} ${formatClassLabel(rawName)}`.toLowerCase(),
        });
      }
    });

    const uniqueClasses = Array.from(classMap.values());
    const sorted = sortClassList(uniqueClasses);

    return [
      { value: "", label: "All Classes" },
      ...sorted.map((c) => ({
        value: c.value,
        label: c.label,
        searchText: c.searchText,
      })),
    ];
  }, [classes, effectiveSchoolId]);

  // Filter section options strictly based on selectedClass
  const sectionOptions = useMemo(() => {
    if (!selectedClass) {
      return [{ value: "", label: "Select Class first" }];
    }

    const rawClasses = Array.isArray(classes) ? classes : [];
    const rawSections = Array.isArray(sections) ? sections : [];

    // Find class IDs matching selectedClass (handles both ID and Name values)
    const matchingClassIds = new Set(
      rawClasses
        .filter((c) => {
          if (effectiveSchoolId && c.school_id && String(c.school_id) !== String(effectiveSchoolId)) {
            return false;
          }
          return (
            String(c.id) === String(selectedClass) ||
            String(c.name).toLowerCase() === String(selectedClass).toLowerCase()
          );
        })
        .map((c) => String(c.id)),
    );

    const classSecs = rawSections.filter((s) => matchingClassIds.has(String(s.class_id)));

    // Deduplicate sections by name (e.g. A, B, C)
    const secMap = new Map();
    classSecs.forEach((s) => {
      const name = String(s.name || "").trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!secMap.has(key)) {
        secMap.set(key, {
          value: effectiveSchoolId ? String(s.id) : name,
          name: name,
          label: `Section ${name}`,
        });
      }
    });

    const uniqueSecs = Array.from(secMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return [
      { value: "", label: "All Sections" },
      ...uniqueSecs.map((s) => ({
        value: s.value,
        label: s.label,
      })),
    ];
  }, [classes, sections, selectedClass, effectiveSchoolId]);

  // Search filtering in UI
  const filteredAllocations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allocations;

    return allocations.filter((item) => {
      const studentName = `${item.first_name || ""} ${item.last_name || ""}`.toLowerCase();
      const code = String(item.student_code || "").toLowerCase();
      const adm = String(item.admission_number || "").toLowerCase();
      const roll = String(item.roll_no || "").toLowerCase();
      const cls = String(item.class_name || "").toLowerCase();
      const sec = String(item.section_name || item.section || "").toLowerCase();

      return (
        studentName.includes(term) ||
        code.includes(term) ||
        adm.includes(term) ||
        roll.includes(term) ||
        cls.includes(term) ||
        sec.includes(term)
      );
    });
  }, [allocations, search]);

  // Reset filters
  const handleResetFilters = () => {
    setSearch("");
    if (isAdmin) setSelectedSchool("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedStatus("");
    const currentOpt = academicYearOptions.find((o) => o.isCurrent && o.value);
    setSelectedYear(currentOpt ? currentOpt.value : "");
  };

  // Submit Handler for Add / Edit
  const handleSubmitModal = async (payload) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await dispatch(
          updateSectionAllocationThunk({
            id: editingItem.id,
            data: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(createSectionAllocationThunk(payload)).unwrap();
      }
      reloadAllocations();
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      alert(err || "Failed to save section allocation");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(deleteSectionAllocationThunk(deleteTarget.id)).unwrap();
      reloadAllocations();
      setDeleteTarget(null);
    } catch (err) {
      alert(err || "Failed to delete section allocation");
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = allocations.filter((a) => (a.status || "").toLowerCase() === "active").length;
  const transferredCount = allocations.filter((a) => (a.status || "").toLowerCase() === "transferred").length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Student Section Allocations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
              {allocations.length} Assigned
            </span>
          </div>
          <p className="text-[13.5px] text-slate-500 dark:text-slate-400 mt-1">
            Assign students to class sections, maintain roll numbers, and manage transfers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 active:scale-[0.98] transition-all"
        >
          <Plus size={16} /> Allocate Student
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Total Allocations</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{allocations.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Active Students</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Transferred Records</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{transferredCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <RotateCcw size={18} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, roll, adm no..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* School (Admin) */}
          {isAdmin && (
            <div className="w-full">
              <CustomDropdown
                className="w-full"
                options={schoolOptions}
                value={selectedSchool}
                onChange={(val) => {
                  setSelectedSchool(val);
                  setSelectedClass("");
                  setSelectedSection("");
                }}
                placeholder="All Schools"
                searchable={schoolOptions.length > 5}
                searchPlaceholder="Search school..."
              />
            </div>
          )}

          {/* Academic Year */}
          <div className="w-full">
            <CustomDropdown
              className="w-full"
              options={academicYearOptions}
              value={selectedYear}
              onChange={setSelectedYear}
              placeholder="Academic Year"
              searchable={academicYearOptions.length > 5}
              searchPlaceholder="Search year..."
            />
          </div>

          {/* Class */}
          <div className="w-full">
            <CustomDropdown
              className="w-full"
              options={classOptions}
              value={selectedClass}
              onChange={(val) => {
                setSelectedClass(val);
                setSelectedSection("");
              }}
              placeholder="All Classes"
              searchable={classOptions.length > 5}
              searchPlaceholder="Search class..."
            />
          </div>

          {/* Section */}
          <div className="w-full">
            <CustomDropdown
              className="w-full"
              options={sectionOptions}
              value={selectedSection}
              onChange={setSelectedSection}
              placeholder={selectedClass ? "All Sections" : "Select Class first"}
              disabled={!selectedClass}
            />
          </div>

          {/* Status */}
          <div className="w-full">
            <CustomDropdown
              className="w-full"
              options={STATUS_FILTER_OPTIONS}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Status"
            />
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        <div className="flex items-center justify-between text-[12px] text-slate-500 pt-1">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredAllocations.length}</span> of {allocations.length} allocations
          </div>
          {(search || selectedClass || selectedSection || selectedStatus || (isAdmin && selectedSchool)) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              <RotateCcw size={12} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <div className="inline-block animate-spin mb-2">
            <RotateCcw size={22} className="text-indigo-600" />
          </div>
          <div className="text-[13.5px]">Loading student section allocations...</div>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-8 text-center">
          <div className="text-rose-600 dark:text-rose-400 text-[14px] font-medium mb-3">
            {error}
          </div>
          <button
            type="button"
            onClick={reloadAllocations}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <StudentSectionAllocationTable
          allocations={filteredAllocations}
          onEdit={(item) => {
            setEditingItem(item);
            setModalOpen(true);
          }}
          onDelete={(item) => setDeleteTarget(item)}
          deletingId={deleteTarget?.id}
        />
      )}

      {/* Add / Edit Modal */}
      <StudentSectionAllocationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
        onSubmit={handleSubmitModal}
        submitting={submitting}
        admissions={studentAdmissions}
        classes={classes}
        sections={sections}
        classSections={classSections}
        academicYears={academicYears}
        effectiveSchoolId={effectiveSchoolId}
        schools={schools}
        isAdmin={isAdmin}
      />

      {/* Delete Confirmation Modal */}
      <DeleteSectionAllocationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        allocation={deleteTarget}
        deleting={deleting}
      />
    </div>
  );
}
