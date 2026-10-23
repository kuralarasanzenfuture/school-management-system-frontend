import React, { useEffect, useState, useMemo } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import CustomDropdown from "../../../common/components/dropdown/CustomDropdown.jsx";
import CustomDatePicker from "../../../common/components/datepicker/CustomDatePicker.jsx";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { getStudents as fetchStudents, getNonAdmissionStudents } from "../../../redux/student/studentSlice.js";
import { fetchClasses } from "../../../redux/schoolSetup/class/classSlice.js";
import { fetchSections } from "../../../redux/schoolSetup/section/sectionSlice.js";
import { fetchClassSections } from "../../../redux/schoolSetup/class-sections/classSectionSlice.js";
import { fetchAcademicYears } from "../../../redux/schoolSetup/academic-year/academicYearSlice.js";
import { getFullImageUrl } from "../../../config/env.js";
import "../styles/StudentAdmission.css";

const EMPTY = {
  school_id: "",
  student_id: "",
  academic_year_id: "",
  class_id: "",
  section: "",
  joining_date: new Date().toISOString().slice(0, 10),
  subject_group: "",
  transport_required: false,
  hostel_required: false,
  admission_type: "new",
  status: "active",
};

const ADMISSION_TYPE_OPTIONS = [
  { value: "new", label: "New Admission" },
  { value: "transfer", label: "Transfer" },
  { value: "promoted", label: "Promoted" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "transferred", label: "Transferred" },
  { value: "dropped", label: "Dropped" },
  { value: "cancelled", label: "Cancelled" },
];

const SUBJECT_GROUP_OPTIONS = [
  { value: "", label: "None" },
  { value: "Science", label: "Science" },
  { value: "Commerce", label: "Commerce" },
  { value: "Arts", label: "Arts" },
  { value: "General", label: "General" },
];

function idOf(value) {
  if (value == null) return "";
  if (typeof value === "object") return value.id ?? "";
  return String(value);
}

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

export default function StudentAdmissionForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting,
}) {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN") || user?.role === "ADMIN");
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector((state) => state.schoolProfile?.loading || false);

  const {
    students = [],
    unadmittedStudents = [],
    loading: studentsLoading,
    unadmittedLoading = false,
  } = useSelector((state) => state.students);
  const { classes = [], loading: classesLoading } = useSelector((state) => state.classes);
  const { sections = [], loading: sectionsLoading } = useSelector((state) => state.sections);
  const { classSections = [] } = useSelector((state) => state.classSections);
  const { academicYears = [], loading: yearsLoading } = useSelector((state) => state.academicYears);

  const isEdit = Boolean(initialData?.id);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const effectiveSchoolId = isAdmin ? data.school_id : schoolId;

  useEffect(() => {
    if (isAdmin) dispatch(fetchSchools());
  }, [dispatch, isAdmin]);

  // Re-fetch dependent lists when school changes
  useEffect(() => {
    if (isAdmin && !effectiveSchoolId) return;
    const filterArg = effectiveSchoolId
      ? { school_id: effectiveSchoolId, paginate: false }
      : { paginate: false };
    if (isEdit) {
      dispatch(fetchStudents(filterArg));
    }
    dispatch(fetchClasses(filterArg));
    dispatch(fetchSections(filterArg));
    dispatch(fetchClassSections(filterArg));
    dispatch(fetchAcademicYears(filterArg));
  }, [dispatch, isAdmin, effectiveSchoolId, isEdit]);

  // Re-fetch non-admitted students when school or academic year changes (in add mode)
  useEffect(() => {
    if (isEdit) return;
    if (isAdmin && !effectiveSchoolId) return;

    const unadmittedArg = {
      ...(effectiveSchoolId ? { school_id: effectiveSchoolId } : {}),
      ...(data.academic_year_id ? { academic_year_id: data.academic_year_id } : {}),
      status: "active",
      paginate: false,
    };
    dispatch(getNonAdmissionStudents(unadmittedArg));
  }, [dispatch, isAdmin, effectiveSchoolId, data.academic_year_id, isEdit]);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setData({
        school_id: idOf(initialData.school_id),
        student_id: idOf(initialData.student_id),
        academic_year_id: idOf(initialData.academic_year_id),
        class_id: idOf(initialData.class_id),
        section: initialData.section || "",
        joining_date: initialData.joining_date
          ? String(initialData.joining_date).slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        subject_group: initialData.subject_group || "",
        transport_required: Boolean(
          initialData.transport_required === 1 || initialData.transport_required === true,
        ),
        hostel_required: Boolean(
          initialData.hostel_required === 1 || initialData.hostel_required === true,
        ),
        admission_type: initialData.admission_type || "new",
        status: initialData.status || "active",
      });
    } else {
      setData({
        ...EMPTY,
        school_id: isAdmin ? "" : (schoolId ? String(schoolId) : ""),
        joining_date: new Date().toISOString().slice(0, 10),
      });
    }
    setErrors({});
  }, [initialData, isAdmin, schoolId]);

  // Helper to filter items by effective school
  const scopedTo = (list) => {
    const arr = Array.isArray(list) ? list : (list?.data || []);
    if (!effectiveSchoolId) return arr;
    return arr.filter(
      (item) => item.school_id == null || String(item.school_id) === String(effectiveSchoolId),
    );
  };

  const filteredStudents = scopedTo(students);
  const filteredClasses = scopedTo(classes);
  const filteredSections = scopedTo(sections).filter(
    (s) =>
      !data.class_id ||
      s.class_id == null ||
      String(s.class_id) === String(data.class_id),
  );
  const filteredAcademicYears = scopedTo(academicYears);

  // Only current academic year for admissions
  const currentAcademicYears = useMemo(() => {
    const list = filteredAcademicYears.filter((ay) => isCurrentAcademicYear(ay));
    return list.length > 0 ? list : filteredAcademicYears;
  }, [filteredAcademicYears]);

  // Auto-select current academic year for admissions
  useEffect(() => {
    if (!isEdit && currentAcademicYears.length > 0) {
      const curId = String(currentAcademicYears[0].id);
      if (data.academic_year_id !== curId) {
        setData((d) => ({ ...d, academic_year_id: curId }));
      }
    }
  }, [isEdit, currentAcademicYears, data.academic_year_id]);

  // School Options
  const schoolOptions = useMemo(() => {
    const list = Array.isArray(schools) ? schools : (schools?.data || []);
    return list.map((s) => ({ value: String(s.id), label: s.name }));
  }, [schools]);

  // Student Options: only non-admissions students for new admissions, or full list in edit mode
  const scopedUnadmitted = scopedTo(unadmittedStudents);
  const activeStudentList = isEdit ? filteredStudents : scopedUnadmitted;

  const studentOptions = useMemo(
    () => {
      const sorted = [...activeStudentList].sort((a, b) => {
        const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
        const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
        return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
      });

      const opts = sorted.map((s) => {
        const name = `${s.first_name || ""} ${s.last_name || ""}`.trim() || `Student #${s.id}`;
        const code = s.student_code ? `Code: ${s.student_code}` : "";
        const adm = s.admission_number ? `Adm: ${s.admission_number}` : "";
        const subtitle = [code, adm].filter(Boolean).join(" | ");
        const initials =
          `${s.first_name?.[0] || ""}${s.last_name?.[0] || ""}`.toUpperCase() || "S";
        const rawPhoto = s.photo_url || s.avatar || s.image || s.profile_image || null;

        return {
          value: String(s.id),
          label: name,
          sublabel: subtitle,
          searchText: `${name} ${s.admission_number || ""} ${s.student_code || ""}`.toLowerCase(),
          avatarUrl: getFullImageUrl(rawPhoto),
          initials,
        };
      });

      // In edit mode, ensure the currently admitted student is present in the options list
      if (isEdit && initialData?.student_id && !opts.some((o) => String(o.value) === String(initialData.student_id))) {
        const currentName = initialData.student_name || `Student #${initialData.student_id}`;
        opts.unshift({
          value: String(initialData.student_id),
          label: currentName,
          sublabel: initialData.student_code ? `Code: ${initialData.student_code}` : "",
          searchText: currentName.toLowerCase(),
          avatarUrl: getFullImageUrl(initialData.photo_url),
          initials: `${currentName[0] || "S"}`.toUpperCase(),
        });
      }

      return opts;
    },
    [activeStudentList, isEdit, initialData],
  );

  // Academic Year Options - strictly current academic year
  const academicYearOptions = useMemo(
    () =>
      currentAcademicYears.map((ay) => ({
        value: String(ay.id),
        label: `${ay.name || ay.year} [Current]`,
        isCurrent: true,
      })),
    [currentAcademicYears],
  );

  // Class Options
  const classOptions = useMemo(
    () =>
      filteredClasses.map((c) => ({
        value: String(c.id),
        label: c.name || `Class #${c.id}`,
      })),
    [filteredClasses],
  );

  // Section Options (Optional - can be assigned later)
  const sectionOptions = useMemo(() => {
    const opts = [{ value: "", label: "No Section (Allocate Later)" }];
    const names = new Set();

    filteredSections.forEach((s) => {
      const secName = s.section_name || s.name || s.section;
      if (secName && !names.has(secName)) {
        names.add(secName);
        opts.push({ value: secName, label: `Section ${secName}` });
      }
    });

    // Also look up classSections junction table if filteredSections had none
    if (data.class_id) {
      const csList = Array.isArray(classSections) ? classSections : [];
      csList
        .filter((cs) => String(cs.class_id) === String(data.class_id))
        .forEach((cs) => {
          const secName = cs.section_name || cs.section || cs.name;
          if (secName && !names.has(secName)) {
            names.add(secName);
            opts.push({ value: secName, label: `Section ${secName}` });
          }
        });
    }

    return opts;
  }, [filteredSections, classSections, data.class_id]);

  const needsSchoolFirst = isAdmin && !effectiveSchoolId;

  // Validation: Only required fields are validated. Section is NOT required.
  const validate = () => {
    const e = {};
    if (isAdmin && !data.school_id) e.school_id = "Please select a school";
    if (!data.student_id) e.student_id = "Student is required";
    if (!data.academic_year_id) e.academic_year_id = "Academic year is required";
    if (!data.class_id) e.class_id = "Class is required";
    if (!data.admission_type) e.admission_type = "Admission type is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...(effectiveSchoolId ? { school_id: Number(effectiveSchoolId) } : {}),
      student_id: Number(data.student_id),
      academic_year_id: Number(data.academic_year_id),
      class_id: Number(data.class_id),
      section: data.section ? data.section.trim() : null,
      joining_date: data.joining_date || null,
      subject_group: data.subject_group || null,
      transport_required: Boolean(data.transport_required),
      hostel_required: Boolean(data.hostel_required),
      admission_type: data.admission_type || "new",
      status: data.status || "active",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* School (Admin only) */}
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
            School <span className="text-rose-500">*</span>
          </label>
          <CustomDropdown
            options={schoolOptions}
            value={data.school_id}
            onChange={(val) => {
              setData((d) => ({
                ...d,
                school_id: val,
                student_id: "",
                class_id: "",
                section: "",
                academic_year_id: "",
              }));
              setErrors((er) => ({ ...er, school_id: null }));
            }}
            placeholder={schoolsLoading ? "Loading schools..." : "Select a school"}
            searchable={schoolOptions.length > 5}
            searchPlaceholder="Search schools..."
            disabled={schoolsLoading}
            error={Boolean(errors.school_id)}
          />
          {errors.school_id && (
            <p className="text-[12px] text-rose-500 mt-0.5 flex items-center gap-1">
              <AlertCircle size={13} /> {errors.school_id}
            </p>
          )}
        </div>
      )}

      {/* Student Combobox */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
          Student <span className="text-rose-500">*</span>
        </label>
        <CustomDropdown
          options={studentOptions}
          value={data.student_id}
          onChange={(val) => {
            setData((d) => ({ ...d, student_id: val }));
            setErrors((er) => ({ ...er, student_id: null }));
          }}
          placeholder={
            needsSchoolFirst
              ? "Select a school first..."
              : unadmittedLoading || studentsLoading
              ? "Loading non-admitted students..."
              : studentOptions.length === 0
              ? (isEdit ? "No students found" : "All students already admitted")
              : "Search and select non-admitted student..."
          }
          searchable={true}
          searchPlaceholder="Search by name, code..."
          disabled={studentsLoading || unadmittedLoading || needsSchoolFirst || (!isEdit && studentOptions.length === 0)}
          error={Boolean(errors.student_id)}
        />
        {errors.student_id && (
          <p className="text-[12px] text-rose-500 mt-0.5 flex items-center gap-1">
            <AlertCircle size={13} /> {errors.student_id}
          </p>
        )}
        {!isEdit && !needsSchoolFirst && !unadmittedLoading && !studentsLoading && studentOptions.length === 0 && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[12px] mt-1">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              All students in this school are already admitted for the selected academic year. To admit a new student, first register them in Student Management.
            </span>
          </div>
        )}
      </div>

      {/* Academic Year & Class */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Academic Year <span className="text-rose-500">*</span>
          </label>
          <CustomDropdown
            options={academicYearOptions}
            value={data.academic_year_id}
            onChange={(val) => {
              setData((d) => ({ ...d, academic_year_id: val }));
              setErrors((er) => ({ ...er, academic_year_id: null }));
            }}
            placeholder={
              needsSchoolFirst
                ? "Select a school first..."
                : yearsLoading
                ? "Loading..."
                : "Select Academic Year"
            }
            disabled={yearsLoading || needsSchoolFirst}
            error={Boolean(errors.academic_year_id)}
          />
          {errors.academic_year_id && (
            <p className="text-[12px] text-rose-500 mt-0.5 flex items-center gap-1">
              <AlertCircle size={13} /> {errors.academic_year_id}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Class <span className="text-rose-500">*</span>
          </label>
          <CustomDropdown
            options={classOptions}
            value={data.class_id}
            onChange={(val) => {
              setData((d) => ({ ...d, class_id: val, section: "" }));
              setErrors((er) => ({ ...er, class_id: null }));
            }}
            placeholder={
              needsSchoolFirst
                ? "Select a school first..."
                : classesLoading
                ? "Loading..."
                : "Select Class"
            }
            disabled={classesLoading || needsSchoolFirst}
            error={Boolean(errors.class_id)}
          />
          {errors.class_id && (
            <p className="text-[12px] text-rose-500 mt-0.5 flex items-center gap-1">
              <AlertCircle size={13} /> {errors.class_id}
            </p>
          )}
        </div>
      </div>

      {/* Section (Optional) & Joining Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Section</span>
            <span className="text-slate-400 font-normal text-xs">(Optional)</span>
          </label>
          <CustomDropdown
            options={sectionOptions}
            value={data.section}
            onChange={(val) => setData((d) => ({ ...d, section: val }))}
            placeholder={
              !data.class_id
                ? "Select Class first (Optional)"
                : sectionOptions.length <= 1
                ? "No sections (Can allocate later)"
                : "Select Section (Optional)"
            }
            disabled={!data.class_id && !data.section}
          />
          <p className="text-[11px] text-slate-400">
            Can be allocated now or managed later in Section Allocations.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Joining Date
          </label>
          <CustomDatePicker
            value={data.joining_date}
            onChange={(e) => setData((d) => ({ ...d, joining_date: e.target.value }))}
            placeholder="Select joining date..."
            align="right"
            direction="down"
          />
        </div>
      </div>

      {/* Subject Group */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
          Subject Group
        </label>
        <CustomDropdown
          options={SUBJECT_GROUP_OPTIONS}
          value={data.subject_group}
          onChange={(val) => setData((d) => ({ ...d, subject_group: val }))}
          placeholder="Select Subject Group"
        />
      </div>

      {/* Admission Type & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Admission Type <span className="text-rose-500">*</span>
          </label>
          <CustomDropdown
            options={ADMISSION_TYPE_OPTIONS}
            value={data.admission_type}
            onChange={(val) => setData((d) => ({ ...d, admission_type: val }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Admission Status
          </label>
          <CustomDropdown
            options={STATUS_OPTIONS}
            value={data.status}
            onChange={(val) => setData((d) => ({ ...d, status: val }))}
          />
        </div>
      </div>

      {/* Facilities Checkboxes */}
      <div className="flex flex-col gap-2 pt-1">
        <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
          Facilities Required
        </label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-[13px] text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={data.transport_required}
              onChange={(e) =>
                setData((d) => ({ ...d, transport_required: e.target.checked }))
              }
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            Transport Required
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-[13px] text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={data.hostel_required}
              onChange={(e) =>
                setData((d) => ({ ...d, hostel_required: e.target.checked }))
              }
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            Hostel Required
          </label>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
        <button
          type="button"
          onClick={onCancel}
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
          {isEdit ? "Update Admission" : "Enroll Student"}
        </button>
      </div>
    </form>
  );
}
