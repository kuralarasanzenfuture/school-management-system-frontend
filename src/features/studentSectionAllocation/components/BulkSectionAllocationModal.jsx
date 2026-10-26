import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Loader2,
  AlertCircle,
  Hash,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Search,
  Minus,
  Users,
  RotateCcw,
  ArrowRight,
  Filter,
  Check,
  UserCheck,
  HelpCircle,
  ArrowDownAZ,
  ArrowUpZA,
} from "lucide-react";
import CustomDropdown, { DropdownAvatar } from "../../../common/components/dropdown/CustomDropdown.jsx";
import CustomDatePicker from "../../../common/components/datepicker/CustomDatePicker.jsx";
import { getFullImageUrl } from "../../../config/env.js";
import {
  fetchClassStudentsForAllocationThunk,
  bulkCreateSectionAllocationThunk,
} from "../../../redux/studentSectionAllocation/studentSectionAllocationSlice.js";
import { fetchClassSections } from "../../../redux/schoolSetup/class-sections/classSectionSlice.js";
import { fetchClasses } from "../../../redux/schoolSetup/class/classSlice.js";

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
    const num = parseInt(clean.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(num)) return num;
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
  if (ay.start_date && ay.end_date) {
    const start = new Date(ay.start_date);
    const end = new Date(ay.end_date);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && now >= start && now <= end) {
      return true;
    }
  }

  if (String(ay.status || "").toLowerCase() === "active" || ay.is_active === 1) {
    return true;
  }

  const currentYearStr = String(now.getFullYear());
  const yearName = String(ay.year || ay.name || "");
  if (yearName.includes(currentYearStr)) {
    return true;
  }

  return false;
};

/**
 * Modern Tailwind CSS Checkbox with DaisyUI / Tailwind UI aesthetics.
 * Provides accessible input, smooth micro-interactions, and supports checked, unchecked, and indeterminate states.
 */
function TailwindCheckbox({
  checked = false,
  indeterminate = false,
  onChange,
  title,
  id,
  className = "",
}) {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center justify-center cursor-pointer select-none group p-1 -m-1 ${className}`}
      title={title}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate;
        }}
        onChange={onChange}
        className="sr-only"
      />
      <div
        className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-all duration-150 shadow-2xs group-hover:scale-105 active:scale-95 group-focus-within:ring-2 group-focus-within:ring-indigo-500/30 ${
          checked || indeterminate
            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs shadow-indigo-500/25"
            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-400 dark:hover:border-indigo-400 group-hover:ring-2 group-hover:ring-indigo-500/20"
        }`}
      >
        {indeterminate ? (
          <Minus size={13} strokeWidth={3} className="text-white" />
        ) : (
          <svg
            className={`w-3 h-3 text-white transition-all duration-150 ${
              checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 7.5L5.5 10.5L11.5 3.5"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </label>
  );
}

export default function BulkSectionAllocationModal({
  isOpen,
  onClose,
  onSuccess,
  effectiveSchoolId = "",
  schools = [],
  classes = [],
  classSections = [],
  academicYears = [],
  isAdmin = false,
}) {
  const dispatch = useDispatch();

  const { classStudents = [], classStudentsLoading } = useSelector(
    (state) => state.studentSectionAllocations,
  );

  // Configuration state
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [allocationDate, setAllocationDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [remarks, setRemarks] = useState("Bulk class section assignment");

  // Filter & Search inside student list
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'unassigned' | 'assigned'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' (A-Z) | 'desc' (Z-A)

  // Student row assignments mapping: { [admission_id]: { selected: boolean, class_section_id: string, roll_no: string } }
  const [assignments, setAssignments] = useState({});

  // Bulk Apply Controls
  const [bulkSectionId, setBulkSectionId] = useState("");
  const [autoRollNumbers, setAutoRollNumbers] = useState(true);
  const [rollStartNumber, setRollStartNumber] = useState(1);

  // Feedback states
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  const activeSchoolId = isAdmin ? selectedSchool : effectiveSchoolId;

  // Filter strictly to current active academic years
  const currentAcademicYears = useMemo(() => {
    const list = Array.isArray(academicYears) ? academicYears : [];
    const currentList = list.filter((y) => isCurrentAcademicYear(y));
    return currentList.length > 0 ? currentList : list;
  }, [academicYears]);

  // Sync initial school & default to current academic year
  useEffect(() => {
    if (!isOpen) return;
    setServerError("");
    setSuccessResult(null);
    setSearch("");
    setStatusFilter("all");
    setBulkSectionId("");

    const sId = effectiveSchoolId ? String(effectiveSchoolId) : "";
    setSelectedSchool(sId);

    // Auto-select current academic year (matching school if provided, else first current)
    let curYear = null;
    if (sId) {
      curYear = currentAcademicYears.find((y) => String(y.school_id) === String(sId));
    }
    if (!curYear && currentAcademicYears.length > 0) {
      curYear = currentAcademicYears[0];
    }
    if (curYear) {
      setSelectedYear(String(curYear.id));
    }

    setSelectedClass("");
    setAssignments({});
  }, [isOpen, effectiveSchoolId, currentAcademicYears]);

  // When activeSchoolId changes, automatically sync selectedYear to that school's current year
  useEffect(() => {
    if (!isOpen || !activeSchoolId) return;
    const curYear = currentAcademicYears.find(
      (y) => String(y.school_id) === String(activeSchoolId)
    );
    if (curYear) {
      setSelectedYear(String(curYear.id));
    }
  }, [isOpen, activeSchoolId, currentAcademicYears]);

  // Load dependent class sections if school changes
  useEffect(() => {
    if (!isOpen || !activeSchoolId) return;
    dispatch(fetchClasses({ school_id: activeSchoolId, paginate: false }));
    dispatch(fetchClassSections({ school_id: activeSchoolId, paginate: false }));
  }, [dispatch, isOpen, activeSchoolId]);

  // School options
  const schoolOptions = useMemo(() => {
    const list = Array.isArray(schools) ? schools : [];
    return list.map((s) => ({ value: String(s.id), label: s.name }));
  }, [schools]);

  // Academic Year options - strictly current academic year only, deduplicated
  const yearOptions = useMemo(() => {
    let candidateYears = currentAcademicYears;
    if (activeSchoolId) {
      const scoped = currentAcademicYears.filter(
        (y) => !y.school_id || String(y.school_id) === String(activeSchoolId)
      );
      if (scoped.length > 0) candidateYears = scoped;
    }

    // Deduplicate by year name so we never show duplicate entries
    const yearMap = new Map();
    candidateYears.forEach((y) => {
      const name = String(y.name || y.year || "").trim();
      if (!name) return;
      if (!yearMap.has(name)) {
        yearMap.set(name, {
          value: String(y.id),
          label: `${name} [Current]`,
          name,
        });
      }
    });

    return Array.from(yearMap.values());
  }, [currentAcademicYears, activeSchoolId]);

  // Class options: deduplicated and sorted
  const classOptions = useMemo(() => {
    const list = Array.isArray(classes) ? classes : [];
    let candidateList = list;
    if (activeSchoolId) {
      const scoped = list.filter((c) => !c.school_id || String(c.school_id) === String(activeSchoolId));
      if (scoped.length > 0) candidateList = scoped;
    }

    const classMap = new Map();
    candidateList.forEach((c) => {
      const rawName = String(c.name || `Class #${c.id}`).trim();
      const key = normalizeClassKey(rawName);
      if (!classMap.has(key)) {
        classMap.set(key, {
          value: String(c.id),
          name: rawName,
          label: formatClassLabel(rawName),
          searchText: `${rawName} ${formatClassLabel(rawName)}`.toLowerCase(),
        });
      }
    });

    return sortClassList(Array.from(classMap.values()));
  }, [classes, activeSchoolId]);

  // Sections configured for the selected class and academic year
  const availableSectionOptions = useMemo(() => {
    if (!selectedClass) return [];
    const list = Array.isArray(classSections) ? classSections : [];
    const selectedYearObj = (academicYears || []).find((y) => String(y.id) === String(selectedYear));

    const filtered = list.filter((cs) => {
      if (String(cs.class_id) !== String(selectedClass)) return false;
      if (activeSchoolId && cs.school_id && String(cs.school_id) !== String(activeSchoolId)) {
        return false;
      }
      if (selectedYear && cs.academic_year_id) {
        const sameId = String(cs.academic_year_id) === String(selectedYear);
        const csYearObj = (academicYears || []).find((y) => String(y.id) === String(cs.academic_year_id));
        const sameName = selectedYearObj && csYearObj && selectedYearObj.name === csYearObj.name;
        if (!sameId && !sameName) {
          return false;
        }
      }
      return true;
    });

    filtered.sort((a, b) =>
      String(a.section_name || a.section || "").localeCompare(String(b.section_name || b.section || "")),
    );

    return filtered.map((cs) => {
      const secName = cs.section_name || cs.section || `Sec #${cs.section_id}`;
      return {
        value: String(cs.id),
        label: `Section ${secName}`,
      };
    });
  }, [classSections, selectedClass, activeSchoolId, selectedYear, academicYears]);

  // Fetch students whenever selectedClass / school / year changes
  const loadClassStudents = useCallback(() => {
    if (!selectedClass) return;
    const filters = {
      class_id: selectedClass,
    };
    if (activeSchoolId) filters.school_id = activeSchoolId;
    if (selectedYear) filters.academic_year_id = selectedYear;

    dispatch(fetchClassStudentsForAllocationThunk(filters));
  }, [dispatch, selectedClass, activeSchoolId, selectedYear]);

  useEffect(() => {
    if (isOpen && selectedClass) {
      loadClassStudents();
    }
  }, [isOpen, selectedClass, loadClassStudents]);

  // Initialize assignments map when classStudents change
  useEffect(() => {
    const newMap = {};
    (classStudents || []).forEach((s) => {
      newMap[s.admission_id] = {
        selected: true, // Selected by default for quick allocation
        class_section_id: s.current_class_section_id ? String(s.current_class_section_id) : "",
        roll_no: s.current_roll_no ? String(s.current_roll_no) : "",
      };
    });
    setAssignments(newMap);
  }, [classStudents]);

  // Filtered students for table
  const filteredStudents = useMemo(() => {
    const list = Array.isArray(classStudents) ? classStudents : [];
    const term = search.trim().toLowerCase();

    const filtered = list.filter((s) => {
      // Status filter
      if (statusFilter === "unassigned" && s.current_allocation_id) return false;
      if (statusFilter === "assigned" && !s.current_allocation_id) return false;

      // Search term
      if (term) {
        const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
        const adm = String(s.admission_number || "").toLowerCase();
        const code = String(s.student_code || "").toLowerCase();
        const sec = String(s.current_section_name || "").toLowerCase();
        const roll = String(s.current_roll_no || "").toLowerCase();

        return (
          fullName.includes(term) ||
          adm.includes(term) ||
          code.includes(term) ||
          sec.includes(term) ||
          roll.includes(term)
        );
      }
      return true;
    });

    // Sort strictly in Alphabetical Order (A-Z by default)
    return filtered.sort((a, b) => {
      const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
      const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
      const cmp = nameA.localeCompare(nameB);
      if (cmp !== 0) {
        return sortOrder === "desc" ? -cmp : cmp;
      }
      return (a.admission_id || 0) - (b.admission_id || 0);
    });
  }, [classStudents, search, statusFilter, sortOrder]);

  // Selection counts
  const selectedCount = useMemo(() => {
    let count = 0;
    filteredStudents.forEach((s) => {
      if (assignments[s.admission_id]?.selected) count++;
    });
    return count;
  }, [filteredStudents, assignments]);

  const allFilteredSelected = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every((s) => assignments[s.admission_id]?.selected);
  }, [filteredStudents, assignments]);

  const isIndeterminate = useMemo(() => {
    return selectedCount > 0 && selectedCount < filteredStudents.length;
  }, [selectedCount, filteredStudents.length]);

  // Handle Master Checkbox
  const handleToggleSelectAll = () => {
    const nextState = !allFilteredSelected;
    setAssignments((prev) => {
      const updated = { ...prev };
      filteredStudents.forEach((s) => {
        if (updated[s.admission_id]) {
          updated[s.admission_id].selected = nextState;
        } else {
          updated[s.admission_id] = {
            selected: nextState,
            class_section_id: s.current_class_section_id ? String(s.current_class_section_id) : "",
            roll_no: s.current_roll_no ? String(s.current_roll_no) : "",
          };
        }
      });
      return updated;
    });
  };

  // Toggle single student row selection
  const handleToggleSelectRow = (admId) => {
    setAssignments((prev) => ({
      ...prev,
      [admId]: {
        ...prev[admId],
        selected: !prev[admId]?.selected,
      },
    }));
  };

  // Update target section for single student row
  const handleRowSectionChange = (admId, newSectionId) => {
    setAssignments((prev) => ({
      ...prev,
      [admId]: {
        ...prev[admId],
        class_section_id: newSectionId,
      },
    }));
  };

  // Update roll no for single student row
  const handleRowRollChange = (admId, newRoll) => {
    setAssignments((prev) => ({
      ...prev,
      [admId]: {
        ...prev[admId],
        roll_no: newRoll,
      },
    }));
  };

  // Bulk Apply: Assign selected section & auto-numbered roll to selected students
  const handleApplyToSelected = () => {
    if (!bulkSectionId) {
      setServerError("Please choose a Target Section in the bulk assignment bar to apply.");
      return;
    }
    setServerError("");

    let currentRoll = parseInt(rollStartNumber, 10);
    if (isNaN(currentRoll) || currentRoll < 1) currentRoll = 1;

    setAssignments((prev) => {
      const updated = { ...prev };
      filteredStudents.forEach((s) => {
        if (updated[s.admission_id]?.selected) {
          let assignedRoll = updated[s.admission_id].roll_no;
          if (autoRollNumbers) {
            assignedRoll = currentRoll < 10 ? `0${currentRoll}` : String(currentRoll);
            currentRoll++;
          }

          updated[s.admission_id] = {
            ...updated[s.admission_id],
            class_section_id: bulkSectionId,
            roll_no: assignedRoll,
          };
        }
      });
      return updated;
    });
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessResult(null);

    // Validate that at least one student is selected
    const selectedList = filteredStudents.filter((s) => assignments[s.admission_id]?.selected);

    if (selectedList.length === 0) {
      setServerError("Please select at least one student to allocate.");
      return;
    }

    // Validate that all selected students have a target section chosen
    const missingSection = selectedList.find(
      (s) => !assignments[s.admission_id]?.class_section_id,
    );

    if (missingSection) {
      const studentName = `${missingSection.first_name || ""} ${missingSection.last_name || ""}`.trim();
      setServerError(
        `Target section is required for all selected students. Please select a section for ${studentName || `Admission #${missingSection.admission_id}`}.`,
      );
      return;
    }

    // Build allocations payload
    const allocationsPayload = selectedList.map((s) => {
      const state = assignments[s.admission_id];
      return {
        admission_id: Number(s.admission_id),
        student_id: Number(s.student_id),
        class_section_id: Number(state.class_section_id),
        roll_no: state.roll_no ? String(state.roll_no).trim() : null,
        allocation_date: allocationDate,
        remarks: remarks ? String(remarks).trim() : null,
      };
    });

    const payload = {
      school_id: activeSchoolId ? Number(activeSchoolId) : null,
      class_id: selectedClass ? Number(selectedClass) : null,
      academic_year_id: selectedYear ? Number(selectedYear) : null,
      allocation_date: allocationDate,
      status: "active",
      remarks,
      allocations: allocationsPayload,
    };

    setSubmitting(true);
    try {
      const result = await dispatch(bulkCreateSectionAllocationThunk(payload)).unwrap();
      setSuccessResult(result);
      if (onSuccess) onSuccess();
      // Reload students to reflect updated sections
      loadClassStudents();
    } catch (err) {
      setServerError(typeof err === "string" ? err : err?.message || "Failed to complete bulk allocation.");
    } finally {
      setSubmitting(false);
    }
  };

  const unassignedCount = (classStudents || []).filter((s) => !s.current_allocation_id).length;
  const assignedCount = (classStudents || []).filter((s) => s.current_allocation_id).length;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Bulk Class Section Allocation
                  </h3>
                  <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Select a class, preview student roster, and batch-assign classroom sections & roll numbers.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto overflow-x-hidden flex-1">
              {/* Success Result Banner */}
              {successResult && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[14px]">Bulk Allocation Successful!</div>
                      <div className="text-[12.5px] mt-0.5 leading-relaxed text-emerald-700 dark:text-emerald-300">
                        {successResult.message || `Processed ${successResult.total} student allocations.`}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[12px] font-medium">
                        <span className="bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full text-emerald-800 dark:text-emerald-200">
                          {successResult.allocated_count || 0} Newly Assigned
                        </span>
                        <span className="bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full text-amber-800 dark:text-amber-200">
                          {successResult.transferred_count || 0} Transferred
                        </span>
                        <span className="bg-blue-100 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-full text-blue-800 dark:text-blue-200">
                          {successResult.updated_count || 0} Updated
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSuccessResult(null)}
                    className="text-emerald-500 hover:text-emerald-700 p-1"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* Server Error Banner */}
              {serverError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[13px] text-rose-700 dark:text-rose-300 flex items-start justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-rose-800 dark:text-rose-200">Bulk Assignment Error</div>
                      <div className="mt-0.5 text-[12.5px] leading-relaxed">{serverError}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setServerError("")}
                    className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 p-1"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* Top Configuration Controls */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
                <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <GraduationCap size={15} className="text-indigo-500" />
                  Target Class & Academic Year
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* School Selector (for Admin) */}
                  {isAdmin && (
                    <div>
                      <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                        School <span className="text-rose-500">*</span>
                      </label>
                      <CustomDropdown
                        className="w-full text-xs"
                        options={schoolOptions}
                        value={selectedSchool}
                        onChange={(val) => {
                          setSelectedSchool(val);
                          setSelectedClass("");
                          setBulkSectionId("");
                        }}
                        placeholder="Select School..."
                        searchable={schoolOptions.length > 5}
                      />
                    </div>
                  )}

                  {/* Academic Year Selector (Current Academic Year Only) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300">
                        Academic Year
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-1.5 py-0.5 rounded-full">
                        Current Year
                      </span>
                    </div>
                    <CustomDropdown
                      className="w-full text-xs"
                      options={yearOptions}
                      value={selectedYear}
                      onChange={(val) => setSelectedYear(val)}
                      placeholder="Current Academic Year..."
                    />
                  </div>

                  {/* Class Selector (e.g. 1st Std, Class 10) */}
                  <div>
                    <label className="block text-[12px] font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                      Select Class (e.g. 1st Std) <span className="text-rose-500">*</span>
                    </label>
                    <CustomDropdown
                      className="w-full text-xs"
                      options={classOptions}
                      value={selectedClass}
                      onChange={(val) => {
                        setSelectedClass(val);
                        setBulkSectionId("");
                        setServerError("");
                      }}
                      placeholder="Pick class to load students..."
                      searchable={classOptions.length > 5}
                      searchPlaceholder="Search class (e.g. 1, 10, LKG)..."
                    />
                  </div>
                </div>
              </div>

              {/* Roster & Bulk Action Card */}
              {selectedClass ? (
                <div className="space-y-4">
                  {/* Bulk Action Controls Bar */}
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-1.5">
                          <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400" />
                          Apply Section to Selected Students
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-600 text-white shadow-xs">
                          {selectedCount} Selected
                        </span>
                      </div>

                      {/* Quick Filter Tabs */}
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                        <button
                          type="button"
                          onClick={() => setStatusFilter("all")}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            statusFilter === "all"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                          }`}
                        >
                          All ({classStudents.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusFilter("unassigned")}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            statusFilter === "unassigned"
                              ? "bg-amber-500 text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                          }`}
                        >
                          Unassigned ({unassignedCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusFilter("assigned")}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            statusFilter === "assigned"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                          }`}
                        >
                          Assigned ({assignedCount})
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                      {/* Bulk Section Selector */}
                      <div className="sm:col-span-4">
                        <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Target Section
                        </label>
                        <CustomDropdown
                          className="w-full text-xs"
                          options={availableSectionOptions}
                          value={bulkSectionId}
                          onChange={(val) => setBulkSectionId(val)}
                          placeholder={
                            availableSectionOptions.length === 0
                              ? "No sections configured"
                              : "Select target section..."
                          }
                          disabled={availableSectionOptions.length === 0}
                        />
                      </div>

                      {/* Auto Roll Number options */}
                      <div className="sm:col-span-5 flex items-center gap-3 pt-5">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[12px] font-medium text-slate-700 dark:text-slate-300">
                          <TailwindCheckbox
                            checked={autoRollNumbers}
                            onChange={(e) => setAutoRollNumbers(e.target.checked)}
                          />
                          <span>Auto-assign Roll Nos starting from:</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          disabled={!autoRollNumbers}
                          value={rollStartNumber}
                          onChange={(e) => setRollStartNumber(e.target.value)}
                          className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center text-xs font-bold text-slate-800 dark:text-white disabled:opacity-40"
                        />
                      </div>

                      {/* Apply button */}
                      <div className="sm:col-span-3 flex items-end">
                        <button
                          type="button"
                          onClick={handleApplyToSelected}
                          disabled={!bulkSectionId || selectedCount === 0}
                          className="w-full py-2 px-3 rounded-xl text-[12.5px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm inline-flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-40"
                        >
                          <Check size={14} />
                          Apply to {selectedCount}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Search Bar & Table Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search student by name, admission no, code..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="text-[12px] text-slate-500 dark:text-slate-400">
                      Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredStudents.length}</span> students
                    </div>
                  </div>

                  {/* Students Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                    <div className="max-h-[380px] overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                          <tr>
                            <th className="px-4 py-3 w-10 text-center">
                              <TailwindCheckbox
                                checked={allFilteredSelected}
                                indeterminate={isIndeterminate}
                                onChange={handleToggleSelectAll}
                                title={
                                  allFilteredSelected
                                    ? "Deselect all students"
                                    : "Select all filtered students"
                                }
                              />
                            </th>
                            <th className="px-3 py-3">
                              <button
                                type="button"
                                onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                                className="inline-flex items-center gap-1.5 uppercase font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors select-none"
                                title={`Sort order: ${sortOrder === "asc" ? "A to Z" : "Z to A"}. Click to toggle.`}
                              >
                                <span>Student</span>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                                  {sortOrder === "asc" ? "A → Z" : "Z → A"}
                                  {sortOrder === "asc" ? <ArrowDownAZ size={13} /> : <ArrowUpZA size={13} />}
                                </span>
                              </button>
                            </th>
                            <th className="px-3 py-3">Admission No</th>
                            <th className="px-3 py-3">Current Status</th>
                            <th className="px-3 py-3">Target Section</th>
                            <th className="px-3 py-3 w-28">Roll No</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[12.5px] text-slate-700 dark:text-slate-200">
                          {classStudentsLoading ? (
                            <tr>
                              <td colSpan="6" className="py-12 text-center text-slate-400">
                                <div className="inline-flex items-center gap-2">
                                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                                  Loading student roster for this class...
                                </div>
                              </td>
                            </tr>
                          ) : filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="py-12 text-center text-slate-400">
                                No students found for the selected class and filter.
                              </td>
                            </tr>
                          ) : (
                            filteredStudents.map((s) => {
                              const isSelected = Boolean(assignments[s.admission_id]?.selected);
                              const assignedSection = assignments[s.admission_id]?.class_section_id || "";
                              const assignedRoll = assignments[s.admission_id]?.roll_no || "";

                              const studentName = `${s.first_name || ""} ${s.last_name || ""}`.trim() || `Student #${s.student_id}`;
                              const initials = `${s.first_name?.[0] || ""}${s.last_name?.[0] || ""}`.toUpperCase() || "ST";

                              const isTransferring =
                                assignedSection &&
                                s.current_class_section_id &&
                                String(s.current_class_section_id) !== String(assignedSection);

                              return (
                                <tr
                                  key={s.admission_id}
                                  className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                                    isSelected
                                      ? "bg-indigo-50/35 dark:bg-indigo-950/20"
                                      : "opacity-75 hover:opacity-100"
                                  }`}
                                >
                                  {/* Row Checkbox */}
                                  <td className="px-4 py-2.5 text-center">
                                    <TailwindCheckbox
                                      checked={isSelected}
                                      onChange={() => handleToggleSelectRow(s.admission_id)}
                                      title={isSelected ? "Deselect student" : "Select student"}
                                    />
                                  </td>

                                  {/* Student Name & Avatar */}
                                  <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-2.5">
                                      <DropdownAvatar
                                        src={getFullImageUrl(s.photo_url)}
                                        initials={initials}
                                        size="w-8 h-8"
                                        textSize="text-[11px]"
                                      />
                                      <div className="min-w-0">
                                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                                          {studentName}
                                        </div>
                                        {s.student_code && (
                                          <div className="text-[11px] text-slate-400 font-mono">
                                            {s.student_code}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Admission No */}
                                  <td className="px-3 py-2.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                                    {s.admission_number || `Adm #${s.admission_id}`}
                                  </td>

                                  {/* Current Status */}
                                  <td className="px-3 py-2.5">
                                    {s.current_section_name ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        <UserCheck size={12} />
                                        Sec {s.current_section_name} {s.current_roll_no ? `(#${s.current_roll_no})` : ""}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                        Unassigned
                                      </span>
                                    )}
                                  </td>

                                  {/* Target Section (Editable per student!) */}
                                  <td className="px-3 py-2.5">
                                    <div className="w-36">
                                      <CustomDropdown
                                        className="w-full text-xs"
                                        options={availableSectionOptions}
                                        value={assignedSection}
                                        onChange={(val) => handleRowSectionChange(s.admission_id, val)}
                                        placeholder="Pick Section..."
                                        disabled={!isSelected}
                                      />
                                    </div>
                                    {isTransferring && (
                                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5 flex items-center gap-1">
                                        <RotateCcw size={10} /> Transfer from Sec {s.current_section_name}
                                      </div>
                                    )}
                                  </td>

                                  {/* Roll No (Editable per student!) */}
                                  <td className="px-3 py-2.5">
                                    <div className="relative">
                                      <Hash size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                      <input
                                        type="text"
                                        disabled={!isSelected}
                                        value={assignedRoll}
                                        onChange={(e) => handleRowRollChange(s.admission_id, e.target.value)}
                                        placeholder="Roll #"
                                        className="w-full pl-7 pr-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white disabled:opacity-40"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                    <GraduationCap size={24} />
                  </div>
                  <h4 className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
                    No Class Selected
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Please select a target class from the dropdown above (e.g. 1st Std, Class 10) to load and allocate students in bulk.
                  </p>
                </div>
              )}

              {/* Bottom Allocation Details */}
              {selectedClass && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Effective Allocation Date <span className="text-rose-500">*</span>
                    </label>
                    <CustomDatePicker
                      value={allocationDate}
                      onChange={(e) => setAllocationDate(e.target.value)}
                      placeholder="Select allocation date..."
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Batch Allocation Remarks
                    </label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Class 1 Section Allocation 2026-2027"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {selectedClass ? (
                  <span>
                    Ready to allocate <strong className="text-indigo-600 dark:text-indigo-400">{selectedCount}</strong> students to their designated sections.
                  </span>
                ) : (
                  <span>Select class above to begin.</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !selectedClass || selectedCount === 0}
                  className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm inline-flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  Allocate {selectedCount} Students
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
