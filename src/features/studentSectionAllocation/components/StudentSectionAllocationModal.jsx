import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, AlertCircle, Calendar, Hash, FileText, CheckCircle2, User, Building } from "lucide-react";
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

export default function StudentSectionAllocationModal({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
  submitting = false,
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

  const activeSchoolId = isAdmin
    ? formData.school_id
    : (effectiveSchoolId || formData.school_id);

  useEffect(() => {
    if (!isOpen) return;

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
    setErrors({});
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

  // Rich Admission / Student options strictly filtered by activeSchoolId
  const studentOptions = useMemo(() => {
    if (!activeSchoolId) return [];
    const list = Array.isArray(admissions) ? admissions : [];
    const filtered = list.filter(
      (a) => !a.school_id || String(a.school_id) === String(activeSchoolId),
    );

    return filtered.map((a) => {
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
      const subparts = [admNo, clsName, code].filter(Boolean);

      return {
        value: String(a.id),
        label: fullName,
        sublabel: subparts.join(" • "),
        avatarUrl,
        initials,
        badge: clsName || null,
        badgeVariant: "primary",
        searchText: `${fullName} ${admNo} ${code} ${clsName}`.toLowerCase(),
        student_id: a.student_id,
        class_id: a.class_id,
        rawStudent: a,
      };
    });
  }, [admissions, activeSchoolId]);

  // Selected student object for preview card
  const selectedStudent = useMemo(() => {
    if (!formData.admission_id) return null;
    return studentOptions.find((opt) => String(opt.value) === String(formData.admission_id));
  }, [studentOptions, formData.admission_id]);

  // Handle student admission change in Add mode: auto-fill class_id if available
  const handleAdmissionChange = (admId) => {
    const selected = studentOptions.find((opt) => opt.value === String(admId));
    setFormData((prev) => ({
      ...prev,
      admission_id: admId,
      student_id: selected?.student_id ? String(selected.student_id) : prev.student_id,
      class_id: selected?.class_id ? String(selected.class_id) : prev.class_id,
      class_section_id: "", // reset section when student/class changes
    }));
    setErrors((prev) => ({ ...prev, admission_id: null, class_section_id: null }));
  };

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

  // Class Section options filtered by selected class and active school
  const classSectionOptions = useMemo(() => {
    if (!formData.class_id) return [];
    const list = Array.isArray(classSections) ? classSections : [];
    const filtered = list.filter((cs) => {
      const matchClass = String(cs.class_id) === String(formData.class_id);
      if (!matchClass) return false;
      if (activeSchoolId && cs.school_id && String(cs.school_id) !== String(activeSchoolId)) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) =>
      String(a.section_name || a.section || "").localeCompare(String(b.section_name || b.section || ""))
    );

    return filtered.map((cs) => {
      const secName = cs.section_name || cs.section || `Sec #${cs.section_id}`;
      return {
        value: String(cs.id),
        label: `Section ${secName}`,
      };
    });
  }, [classSections, formData.class_id, activeSchoolId]);

  const validate = () => {
    const newErrors = {};
    if (isAdmin && !isEdit && !formData.school_id) {
      newErrors.school_id = "Please select a school first";
    }
    if (!isEdit && !formData.admission_id && !formData.student_id) {
      newErrors.admission_id = "Please select a student admission";
    }
    if (!formData.class_section_id) {
      newErrors.class_section_id = "Please select a class section";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

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

    onSubmit(payload);
  };

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
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[11.5px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                    Student
                  </div>
                  <div className="text-[14px] font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {`${initialData?.first_name || ""} ${initialData?.last_name || ""}`.trim() || `Student #${initialData?.student_id}`}
                  </div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Admission #{initialData?.admission_number || initialData?.admission_id} | Academic Year: {initialData?.academic_year_name || initialData?.academic_year || "—"}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
                    Student Admission <span className="text-rose-500">*</span>
                  </label>
                  <CustomDropdown
                    className="w-full"
                    options={studentOptions}
                    value={formData.admission_id}
                    onChange={handleAdmissionChange}
                    placeholder={
                      !activeSchoolId
                        ? "Select School first..."
                        : studentOptions.length === 0
                        ? "No admitted students found for this school"
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

                  {/* Selected student preview banner */}
                  {selectedStudent && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 animate-in fade-in duration-200">
                      <DropdownAvatar
                        src={selectedStudent.avatarUrl}
                        initials={selectedStudent.initials}
                        size="w-10 h-10"
                        textSize="text-[12px]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
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
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    </div>
                  )}
                </div>
              )}

              {/* Class Filter & Class Section Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Class
                  </label>
                  <CustomDropdown
                    className="w-full"
                    options={classOptions}
                    value={formData.class_id}
                    onChange={(val) => {
                      setFormData((prev) => ({
                        ...prev,
                        class_id: val,
                        class_section_id: "",
                      }));
                    }}
                    placeholder={!activeSchoolId ? "Select School first..." : "Filter by class..."}
                    searchable={classOptions.length > 5}
                    searchPlaceholder="Search class..."
                    disabled={!activeSchoolId}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Section <span className="text-rose-500">*</span>
                  </label>
                  <CustomDropdown
                    className="w-full"
                    options={classSectionOptions}
                    value={formData.class_section_id}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, class_section_id: val }));
                      setErrors((prev) => ({ ...prev, class_section_id: null }));
                    }}
                    placeholder={
                      !activeSchoolId
                        ? "Select School first..."
                        : formData.class_id
                        ? "Select section..."
                        : "Pick student / class first..."
                    }
                    disabled={!activeSchoolId || !formData.class_id}
                    hasError={Boolean(errors.class_section_id)}
                  />
                  {errors.class_section_id && (
                    <p className="text-[12px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={13} /> {errors.class_section_id}
                    </p>
                  )}
                </div>
              </div>

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
                  onChange={(e) => setFormData((prev) => ({ ...prev, roll_no: e.target.value }))}
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
                onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                placeholder="e.g. Transferred from section A on request"
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
              {isEdit ? "Save Changes" : "Create Allocation"}
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
