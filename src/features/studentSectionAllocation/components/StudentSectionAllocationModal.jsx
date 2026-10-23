import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Loader2,
  AlertCircle,
  Hash,
  FileText,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Info,
  Filter,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import CustomDropdown, { DropdownAvatar } from "../../../common/components/dropdown/CustomDropdown.jsx";
import CustomDatePicker from "../../../common/components/datepicker/CustomDatePicker.jsx";
import { getFullImageUrl } from "../../../config/env.js";
import { fetchStudentAdmissions } from "../../../redux/studentsAdmission/studentAdmissionSlice.js";
import { fetchClasses } from "../../../redux/schoolSetup/class/classSlice.js";
import { fetchClassSections } from "../../../redux/schoolSetup/class-sections/classSectionSlice.js";

const EMPTY_FORM = {
  school_id: "",
  admission_id: "",
  student_id: "",
  class_id: "",
  class_section_id: "",
  roll_no: "",
  allocation_date: new Date().toISOString().slice(0, 10),
  effective_to: "",
  status: "active",
  remarks: "",
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "transferred", label: "Transferred" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

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

export default function StudentSectionAllocationModal({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
  submitting = false,
  allocations = [],
  admissions = [],
  classes = [],
  sections = [],
  classSections = [],
  academicYears = [],
  effectiveSchoolId = "",
  schools = [],
  isAdmin = false,
}) {
  const dispatch = useDispatch();
  const isEdit = Boolean(initialData?.id);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterUnassignedOnly, setFilterUnassignedOnly] = useState(false);

  const activeSchoolId = isAdmin
    ? formData.school_id
    : (effectiveSchoolId || formData.school_id);

  useEffect(() => {
    if (!isOpen) return;

    setServerError("");
    setErrors({});
    setFilterClassId("");
    setFilterUnassignedOnly(false);

    if (initialData) {
      const sId = initialData.school_id
        ? String(initialData.school_id)
        : (effectiveSchoolId ? String(effectiveSchoolId) : "");
      setFormData({
        school_id: sId,
        admission_id: initialData.admission_id ? String(initialData.admission_id) : "",
        student_id: initialData.student_id ? String(initialData.student_id) : "",
        class_id: initialData.class_id ? String(initialData.class_id) : "",
        class_section_id: initialData.class_section_id ? String(initialData.class_section_id) : "",
        roll_no: initialData.roll_no ? String(initialData.roll_no) : "",
        allocation_date: initialData.allocation_date
          ? String(initialData.allocation_date).slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        effective_to: initialData.effective_to
          ? String(initialData.effective_to).slice(0, 10)
          : "",
        status: initialData.status || "active",
        remarks: initialData.remarks || "",
      });
      if (sId) {
        dispatch(fetchStudentAdmissions({ school_id: sId }));
        dispatch(fetchClasses({ school_id: sId, paginate: false }));
        dispatch(fetchClassSections({ school_id: sId, paginate: false }));
      }
    } else {
      const sId = effectiveSchoolId ? String(effectiveSchoolId) : "";
      setFormData({
        ...EMPTY_FORM,
        school_id: sId,
        allocation_date: new Date().toISOString().slice(0, 10),
      });
      if (sId) {
        dispatch(fetchStudentAdmissions({ school_id: sId }));
        dispatch(fetchClasses({ school_id: sId, paginate: false }));
        dispatch(fetchClassSections({ school_id: sId, paginate: false }));
      }
    }
  }, [isOpen, initialData, effectiveSchoolId, dispatch]);

  // School options for admin
  const schoolOptions = useMemo(() => {
    const list = Array.isArray(schools) ? schools : [];
    return list.map((s) => ({
      value: String(s.id),
      label: s.name,
    }));
  }, [schools]);

  // Handle school selection in Add mode
  const handleSchoolChange = (newSchoolId) => {
    setServerError("");
    setFilterClassId("");
    setFormData((prev) => ({
      ...prev,
      school_id: newSchoolId,
      admission_id: "",
      student_id: "",
      class_id: "",
      class_section_id: "",
      roll_no: "",
    }));
    setErrors((prev) => ({
      ...prev,
      school_id: null,
      admission_id: null,
      class_section_id: null,
    }));

    if (newSchoolId) {
      dispatch(fetchStudentAdmissions({ school_id: newSchoolId }));
      dispatch(fetchClasses({ school_id: newSchoolId, paginate: false }));
      dispatch(fetchClassSections({ school_id: newSchoolId, paginate: false }));
    }
  };

  // Class options: strictly deduplicated & naturally sorted for active school
  const classOptions = useMemo(() => {
    const list = Array.isArray(classes) ? classes : [];
    let candidateList = list;
    if (activeSchoolId) {
      const scoped = list.filter((c) => !c.school_id || String(c.school_id) === String(activeSchoolId));
      if (scoped.length > 0) {
        candidateList = scoped;
      }
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

  // Quick filter options for student admissions by class
  const classFilterDropdownOptions = useMemo(() => {
    return [
      { value: "", label: "All Classes" },
      ...classOptions.map((c) => ({
        value: c.value,
        label: c.label,
      })),
    ];
  }, [classOptions]);

  // Rich Admission / Student options strictly filtered by activeSchoolId, class, and unassigned status
  const studentOptions = useMemo(() => {
    if (!activeSchoolId) return [];
    const list = Array.isArray(admissions) ? admissions : [];
    const filteredBySchool = list.filter(
      (a) => !a.school_id || String(a.school_id) === String(activeSchoolId),
    );

    // Active allocations map
    const activeAllocMap = new Map();
    (allocations || []).forEach((alloc) => {
      if ((alloc.status || "active").toLowerCase() === "active") {
        activeAllocMap.set(String(alloc.admission_id), alloc);
      }
    });

    let result = filteredBySchool;

    // Filter by Class filter if chosen
    if (filterClassId) {
      const targetClass = classOptions.find((c) => String(c.value) === String(filterClassId));
      const targetName = targetClass?.name?.toLowerCase();
      result = result.filter((a) => {
        if (String(a.class_id) === String(filterClassId)) return true;
        if (targetName && String(a.class_name || "").toLowerCase() === targetName) return true;
        return false;
      });
    }

    // Filter by Unassigned Only if active
    if (filterUnassignedOnly) {
      result = result.filter((a) => !activeAllocMap.has(String(a.id)));
    }

    return result.map((a) => {
      const firstName = a.first_name || "";
      const lastName = a.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim() || `Student #${a.student_id || a.id}`;
      const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "ST";
      const isFemale = String(a.gender || "").toLowerCase() === "female";
      const bgHex = isFemale ? "db2777" : "4f46e5";
      const rawPhoto = a.photo_url || a.student_photo || a.photo || a.avatar || a.image || a.profile_image || null;
      const photoUrl = getFullImageUrl(rawPhoto);
      const avatarUrl = photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=${bgHex}&color=fff&size=80`;

      const admNo = a.admission_number || `Adm #${a.id}`;
      const clsName = a.class_name ? `Class ${a.class_name}` : "";
      const code = a.student_code || "";

      const activeAlloc = activeAllocMap.get(String(a.id));
      const activeSectionName = activeAlloc?.section_name || activeAlloc?.section;
      const activeRoll = activeAlloc?.roll_no;

      const subparts = [admNo, clsName, code].filter(Boolean);
      if (activeAlloc) {
        subparts.push(`Currently in: Sec ${activeSectionName}${activeRoll ? ` (#${activeRoll})` : ""}`);
      } else {
        subparts.push("Unassigned");
      }

      return {
        value: String(a.id),
        label: fullName,
        sublabel: subparts.join(" • "),
        avatarUrl,
        initials,
        badge: activeAlloc ? `Sec ${activeSectionName}` : "Unassigned",
        badgeVariant: activeAlloc ? "primary" : "warning",
        searchText: `${fullName} ${admNo} ${code} ${clsName} ${activeSectionName || "unassigned"}`.toLowerCase(),
        student_id: a.student_id,
        class_id: a.class_id,
        academic_year_id: a.academic_year_id,
        class_name: a.class_name,
        activeAlloc: activeAlloc || null,
        rawStudent: a,
      };
    });
  }, [admissions, activeSchoolId, allocations, filterClassId, filterUnassignedOnly, classOptions]);

  // Selected student object for preview card
  const selectedStudent = useMemo(() => {
    if (!formData.admission_id) return null;
    const found = studentOptions.find((opt) => String(opt.value) === String(formData.admission_id));
    if (found) return found;

    // Fallback search in raw admissions
    const raw = (admissions || []).find((a) => String(a.id) === String(formData.admission_id));
    if (!raw) return null;

    const firstName = raw.first_name || "";
    const lastName = raw.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || `Student #${raw.student_id || raw.id}`;
    const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "ST";
    const rawPhoto = raw.photo_url || raw.student_photo || raw.photo || null;
    const photoUrl = getFullImageUrl(rawPhoto);
    const avatarUrl = photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4f46e5&color=fff&size=80`;
    const admNo = raw.admission_number || `Adm #${raw.id}`;
    const clsName = raw.class_name ? `Class ${raw.class_name}` : "";

    const activeAlloc = (allocations || []).find(
      (al) => String(al.admission_id) === String(raw.id) && (al.status || "active").toLowerCase() === "active"
    );

    return {
      value: String(raw.id),
      label: fullName,
      sublabel: [admNo, clsName, raw.student_code].filter(Boolean).join(" • "),
      avatarUrl,
      initials,
      badge: activeAlloc ? `Sec ${activeAlloc.section_name || activeAlloc.section}` : "Unassigned",
      badgeVariant: activeAlloc ? "primary" : "warning",
      student_id: raw.student_id,
      class_id: raw.class_id,
      academic_year_id: raw.academic_year_id,
      class_name: raw.class_name,
      activeAlloc: activeAlloc || null,
      rawStudent: raw,
    };
  }, [formData.admission_id, studentOptions, admissions, allocations]);

  // Handle student admission change in Add mode: lock class_id strictly to student's admitted class
  const handleAdmissionChange = (admId) => {
    setServerError("");
    const selected = studentOptions.find((opt) => String(opt.value) === String(admId));
    setFormData((prev) => ({
      ...prev,
      admission_id: admId,
      student_id: selected?.student_id ? String(selected.student_id) : prev.student_id,
      class_id: selected?.class_id ? String(selected.class_id) : prev.class_id,
      class_section_id: "", // reset section when student changes
      roll_no: "",
    }));
    setErrors((prev) => ({ ...prev, admission_id: null, class_section_id: null }));
  };

  // Class Section options filtered by student's admitted class, academic year, and active school
  const classSectionOptions = useMemo(() => {
    const targetClassId = isEdit
      ? (initialData?.class_id || formData.class_id)
      : (selectedStudent?.class_id || formData.class_id);

    if (!targetClassId) return [];

    const list = Array.isArray(classSections) ? classSections : [];
    const targetYearId = isEdit
      ? (initialData?.academic_year_id || initialData?.academic_year)
      : (selectedStudent?.academic_year_id || selectedStudent?.rawStudent?.academic_year_id);

    const filtered = list.filter((cs) => {
      if (String(cs.class_id) !== String(targetClassId)) return false;

      if (activeSchoolId && cs.school_id && String(cs.school_id) !== String(activeSchoolId)) {
        return false;
      }

      if (targetYearId && cs.academic_year_id && String(cs.academic_year_id) !== String(targetYearId)) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) =>
      String(a.section_name || a.section || "").localeCompare(String(b.section_name || b.section || ""))
    );

    return filtered.map((cs) => {
      const secName = cs.section_name || cs.section || `Sec #${cs.section_id}`;
      const isAlreadyActiveInThisSec =
        !isEdit &&
        selectedStudent?.activeAlloc &&
        Number(cs.id) === Number(selectedStudent.activeAlloc.class_section_id);

      return {
        value: String(cs.id),
        label: isAlreadyActiveInThisSec
          ? `Section ${secName} (Current Active Section)`
          : `Section ${secName}`,
        disabled: Boolean(isAlreadyActiveInThisSec),
        badge: isAlreadyActiveInThisSec ? "Current" : null,
        badgeVariant: isAlreadyActiveInThisSec ? "warning" : "default",
      };
    });
  }, [classSections, isEdit, initialData, selectedStudent, formData.class_id, activeSchoolId]);

  // Is this allocation a transfer to a different section?
  const isTransfer = useMemo(() => {
    if (isEdit) return false;
    if (!selectedStudent?.activeAlloc || !formData.class_section_id) return false;
    return Number(formData.class_section_id) !== Number(selectedStudent.activeAlloc.class_section_id);
  }, [isEdit, selectedStudent, formData.class_section_id]);

  const validate = () => {
    const newErrors = {};
    if (isAdmin && !isEdit && !formData.school_id) {
      newErrors.school_id = "Please select a school first";
    }
    if (!isEdit && !formData.admission_id && !formData.student_id) {
      newErrors.admission_id = "Please select a student admission";
    }
    if (!formData.class_section_id) {
      newErrors.class_section_id = "Please select a target class section";
    }
    if (!formData.allocation_date) {
      newErrors.allocation_date = "Allocation date is required";
    }
    if (formData.allocation_date && formData.effective_to && formData.effective_to < formData.allocation_date) {
      newErrors.effective_to = "Effective to cannot be earlier than allocation date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setServerError("");

    const payload = {
      class_section_id: Number(formData.class_section_id),
      roll_no: formData.roll_no ? String(formData.roll_no).trim() : null,
      allocation_date: formData.allocation_date,
      effective_to: formData.effective_to || null,
      status: formData.status,
      remarks: formData.remarks ? String(formData.remarks).trim() : null,
    };

    if (!isEdit) {
      if (formData.admission_id) {
        payload.admission_id = Number(formData.admission_id);
      }
      if (formData.student_id) {
        payload.student_id = Number(formData.student_id);
      }
      if (formData.school_id) {
        payload.school_id = Number(formData.school_id);
      }
    }

    const res = await onSubmit(payload);
    if (res && res.success === false) {
      setServerError(res.error);
    }
  };

  const activeAlloc = selectedStudent?.activeAlloc;
  const admittedClassName = selectedStudent?.rawStudent?.class_name || initialData?.class_name || "";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isEdit ? "Update Section Allocation" : "Allocate Student to Section"}
                </h3>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isEdit
                    ? "Modify section assignment, roll number, or status."
                    : "Assign an admitted student to their designated classroom section."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto overflow-x-hidden flex-1">
              {/* Server Error Banner */}
              {serverError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[13px] text-rose-700 dark:text-rose-300 flex items-start justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-rose-800 dark:text-rose-200">Unable to Save Allocation</div>
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

              {/* School Selector (for Admin when allocating) */}
              {isAdmin && !isEdit && (
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    School <span className="text-rose-500">*</span>
                  </label>
                  <CustomDropdown
                    className="w-full"
                    options={schoolOptions}
                    value={formData.school_id}
                    onChange={handleSchoolChange}
                    placeholder="Select school first..."
                    searchable={schoolOptions.length > 5}
                    searchPlaceholder="Search school..."
                    hasError={Boolean(errors.school_id)}
                  />
                  {errors.school_id && (
                    <p className="text-[12px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={13} /> {errors.school_id}
                    </p>
                  )}
                </div>
              )}

              {/* Student / Admission Selector */}
              {isEdit ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3.5">
                  <DropdownAvatar
                    src={getFullImageUrl(initialData?.photo_url || initialData?.photo)}
                    initials={initialData?.first_name?.[0] || "ST"}
                    size="w-11 h-11"
                    textSize="text-[13px]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                      Student Details
                    </div>
                    <div className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mt-0.5 truncate">
                      {`${initialData?.first_name || ""} ${initialData?.last_name || ""}`.trim() || `Student #${initialData?.student_id}`}
                    </div>
                    <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono truncate">
                      Adm #{initialData?.admission_number || initialData?.admission_id} • Year: {initialData?.academic_year_name || initialData?.academic_year || "—"}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <GraduationCap size={13} />
                      {formatClassLabel(initialData?.class_name)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
                      Student Admission <span className="text-rose-500">*</span>
                    </label>

                    {/* Quick Filters for students */}
                    {activeSchoolId && (
                      <div className="flex items-center gap-2">
                        <div className="w-40">
                          <CustomDropdown
                            className="w-full text-xs"
                            options={classFilterDropdownOptions}
                            value={filterClassId}
                            onChange={(val) => {
                              setFilterClassId(val);
                              setFormData((prev) => ({ ...prev, admission_id: "", class_section_id: "" }));
                            }}
                            placeholder="Filter by Class"
                            searchable={classFilterDropdownOptions.length > 5}
                            searchPlaceholder="Search class..."
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setFilterUnassignedOnly((prev) => !prev);
                            setFormData((prev) => ({ ...prev, admission_id: "", class_section_id: "" }));
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium border transition-colors inline-flex items-center gap-1.5 shrink-0 ${
                            filterUnassignedOnly
                              ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                          }`}
                          title="Show only students without section assigned"
                        >
                          <Filter size={12} />
                          {filterUnassignedOnly ? "Unassigned Only ✓" : "Unassigned Only"}
                        </button>
                      </div>
                    )}
                  </div>

                  <CustomDropdown
                    className="w-full"
                    options={studentOptions}
                    value={formData.admission_id}
                    onChange={handleAdmissionChange}
                    placeholder={
                      !activeSchoolId
                        ? "Select School first..."
                        : studentOptions.length === 0
                        ? filterUnassignedOnly
                          ? "No unassigned students found for this class"
                          : "No admitted students found for this school"
                        : "Search and select student admission..."
                    }
                    searchable={studentOptions.length > 0}
                    searchPlaceholder="Type to search by student name, adm no, code..."
                    disabled={!activeSchoolId}
                    hasError={Boolean(errors.admission_id)}
                  />
                  {errors.admission_id && (
                    <p className="text-[12px] text-rose-500 flex items-center gap-1">
                      <AlertCircle size={13} /> {errors.admission_id}
                    </p>
                  )}
                  {!activeSchoolId && !errors.admission_id && (
                    <p className="text-[11.5px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      Please select a school above to load admitted students.
                    </p>
                  )}

                  {/* Selected student preview card */}
                  {selectedStudent && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 animate-in fade-in duration-200 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <DropdownAvatar
                          src={selectedStudent.avatarUrl}
                          initials={selectedStudent.initials}
                          size="w-10 h-10"
                          textSize="text-[12px]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13.5px] font-bold text-slate-900 dark:text-white truncate">
                              {selectedStudent.label}
                            </span>
                            {selectedStudent.rawStudent?.gender && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium capitalize bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {selectedStudent.rawStudent.gender}
                              </span>
                            )}
                          </div>
                          <div className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {selectedStudent.sublabel}
                          </div>
                        </div>
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      </div>

                      {/* Current Status Pill */}
                      <div className="pt-2 border-t border-indigo-100/80 dark:border-indigo-800/40 flex items-center justify-between text-[12px]">
                        <span className="text-slate-500 dark:text-slate-400">Current Assignment:</span>
                        {activeAlloc ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <UserCheck size={13} />
                            Section {activeAlloc.section_name || activeAlloc.section} {activeAlloc.roll_no ? `(Roll #${activeAlloc.roll_no})` : ""}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Info size={13} />
                            Unassigned (Ready for Placement)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Admitted Class Display & Target Section Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Admitted Class (Strictly bound to Student Admission) */}
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Admitted Class
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-[13px] font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between min-h-[42px]">
                    <div className="flex items-center gap-2 truncate">
                      <GraduationCap size={16} className="text-indigo-500 shrink-0" />
                      <span className="truncate">
                        {admittedClassName ? formatClassLabel(admittedClassName) : "Auto-filled from Student"}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider shrink-0">
                      Admission
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Classroom sections are filtered for this specific class.
                  </p>
                </div>

                {/* Target Section */}
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Section <span className="text-rose-500">*</span>
                  </label>
                  <CustomDropdown
                    className="w-full"
                    options={classSectionOptions}
                    value={formData.class_section_id}
                    onChange={(val) => {
                      setServerError("");
                      setFormData((prev) => ({ ...prev, class_section_id: val }));
                      setErrors((prev) => ({ ...prev, class_section_id: null }));
                    }}
                    placeholder={
                      !activeSchoolId
                        ? "Select School first..."
                        : (!isEdit && !formData.admission_id)
                        ? "Select student admission first..."
                        : classSectionOptions.length === 0
                        ? "No sections configured for this class"
                        : "Select section..."
                    }
                    disabled={!activeSchoolId || (!isEdit && !formData.admission_id)}
                    hasError={Boolean(errors.class_section_id)}
                  />
                  {errors.class_section_id && (
                    <p className="text-[12px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={13} /> {errors.class_section_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Transfer Notice if student is already in a different section */}
              {isTransfer && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[12.5px] text-amber-800 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <Sparkles size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Automatic Section Transfer:</span> Student is currently active in{" "}
                    <span className="font-semibold underline">Section {activeAlloc?.section_name || activeAlloc?.section}</span>.
                    Saving will assign this new section and automatically mark the previous section assignment as transferred.
                  </div>
                </div>
              )}

              {/* Roll Number & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Roll Number
                  </label>
                  <div className="relative">
                    <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.roll_no}
                      onChange={(e) => {
                        setServerError("");
                        setFormData((prev) => ({ ...prev, roll_no: e.target.value }));
                      }}
                      placeholder="e.g. 101"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Status
                  </label>
                  <CustomDropdown
                    options={STATUS_OPTIONS}
                    value={formData.status}
                    onChange={(val) => {
                      setServerError("");
                      setFormData((prev) => ({ ...prev, status: val }));
                    }}
                  />
                </div>
              </div>

              {/* Allocation Date & Effective To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Allocation Date <span className="text-rose-500">*</span>
                  </label>
                  <CustomDatePicker
                    value={formData.allocation_date}
                    onChange={(e) => {
                      setServerError("");
                      setFormData((prev) => ({ ...prev, allocation_date: e.target.value }));
                      setErrors((prev) => ({ ...prev, allocation_date: null }));
                    }}
                    hasError={Boolean(errors.allocation_date)}
                    placeholder="Select allocation date..."
                    direction="down"
                  />
                  {errors.allocation_date && (
                    <p className="text-[12px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={13} /> {errors.allocation_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Effective To <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <CustomDatePicker
                    value={formData.effective_to}
                    onChange={(e) => {
                      setServerError("");
                      setFormData((prev) => ({ ...prev, effective_to: e.target.value }));
                      setErrors((prev) => ({ ...prev, effective_to: null }));
                    }}
                    hasError={Boolean(errors.effective_to)}
                    placeholder="Select effective to date..."
                    align="right"
                    direction="down"
                  />
                  {errors.effective_to && (
                    <p className="text-[12px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={13} /> {errors.effective_to}
                    </p>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Remarks
                </label>
                <div className="relative">
                  <FileText size={15} className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    value={formData.remarks}
                    onChange={(e) => {
                      setServerError("");
                      setFormData((prev) => ({ ...prev, remarks: e.target.value }));
                    }}
                    placeholder="e.g. Assigned on admission / Transferred from section A on request"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm inline-flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {isEdit ? "Save Changes" : isTransfer ? "Transfer Section" : "Create Allocation"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
