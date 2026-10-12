import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { fetchClasses } from "../../../../redux/schoolSetup/class/classSlice.js";
import { fetchSections } from "../../../../redux/schoolSetup/section/sectionSlice.js";
import { fetchAcademicYears } from "../../../../redux/schoolSetup/academic-year/academicYearSlice.js";
import { fetchEmployees } from "../../../../redux/employee/employeeSlice.js";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";

const EMPTY = {
  school_id: "",
  class_id: "",
  section_id: "",
  academic_year_id: "",
  class_teacher_id: "",
  capacity: "",
  status: "active",
};

function idOf(value) {
  if (value == null) return "";
  if (typeof value === "object") return value.id ?? "";
  return String(value);
}

export default function ClassSectionForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting,
}) {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const schoolId = isAdmin ? null : user?.school_id;

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  const { classes = [], loading: classesLoading } = useSelector(
    (state) => state.classes,
  );
  const { sections = [], loading: sectionsLoading } = useSelector(
    (state) => state.sections,
  );
  const { academicYears = [], loading: yearsLoading } = useSelector(
    (state) => state.academicYears,
  );
  const { employees = [], loading: employeesLoading } = useSelector(
    (state) => state.employees,
  );

  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  const isEdit = Boolean(initialData?.id);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const effectiveSchoolId = isAdmin ? data.school_id : schoolId;

  useEffect(() => {
    if (isAdmin && !effectiveSchoolId) return;
    dispatch(fetchClasses({ school_id: effectiveSchoolId, paginate: false }));
    dispatch(fetchSections({ school_id: effectiveSchoolId, paginate: false }));
    dispatch(fetchAcademicYears({ school_id: effectiveSchoolId, paginate: false }));
    dispatch(fetchEmployees(effectiveSchoolId));
  }, [dispatch, isAdmin, effectiveSchoolId]);

  useEffect(() => {
    if (initialData) {
      setData({
        school_id: idOf(initialData.school_id),
        class_id: idOf(initialData.class_id),
        section_id: idOf(initialData.section_id),
        academic_year_id: idOf(initialData.academic_year_id),
        class_teacher_id: idOf(initialData.class_teacher_id),
        capacity:
          initialData.capacity != null ? String(initialData.capacity) : "",
        status: initialData.status || "active",
      });
    } else {
      setData({ ...EMPTY, school_id: isAdmin ? "" : (schoolId ? String(schoolId) : "") });
    }
    setErrors({});
  }, [initialData, isAdmin, schoolId]);

  useEffect(() => {
    if (!initialData && !isAdmin && schoolId) {
      setData((d) => (d.school_id ? d : { ...d, school_id: String(schoolId) }));
    }
  }, [schoolId, isAdmin, initialData]);

  const handleClassChange = (value) => {
    setData((d) => ({ ...d, class_id: value, section_id: "" }));
    setErrors((er) => ({ ...er, class_id: null, section_id: null }));
  };

  const scopedTo = (list) => {
    const arr = Array.isArray(list) ? list : list?.data || [];
    if (!effectiveSchoolId) return arr;
    return arr.filter(
      (item) =>
        item.school_id == null ||
        String(item.school_id) === String(effectiveSchoolId),
    );
  };

  const schoolList = useMemo(() => {
    if (Array.isArray(schools)) return schools;
    if (Array.isArray(schools?.data)) return schools.data;
    if (Array.isArray(schools?.schools)) return schools.schools;
    return [];
  }, [schools]);

  const schoolOptions = useMemo(
    () => schoolList.map((s) => ({ value: String(s.id), label: s.name })),
    [schoolList],
  );

  const filteredClasses = scopedTo(classes);
  const classOptions = useMemo(
    () => filteredClasses.map((c) => ({ value: String(c.id), label: c.name })),
    [filteredClasses],
  );

  const filteredSections = scopedTo(sections).filter(
    (s) =>
      !data.class_id ||
      s.class_id == null ||
      String(s.class_id) === String(data.class_id),
  );
  const sectionOptions = useMemo(
    () =>
      filteredSections.map((s) => ({
        value: String(s.id),
        label: s.section_name || s.name,
      })),
    [filteredSections],
  );

  const filteredAcademicYears = scopedTo(academicYears);
  const yearOptions = useMemo(
    () => filteredAcademicYears.map((y) => ({ value: String(y.id), label: y.name })),
    [filteredAcademicYears],
  );

  const filteredEmployees = scopedTo(employees);
  const teacherOptions = useMemo(
    () => [
      { value: "", label: "None" },
      ...filteredEmployees.map((emp) => ({
        value: String(emp.id),
        label: `${emp.first_name} ${emp.last_name || ""}`.trim(),
      })),
    ],
    [filteredEmployees],
  );

  const needsSchoolFirst = isAdmin && !effectiveSchoolId;
  const needsClassFirst = !needsSchoolFirst && !data.class_id;

  const validate = () => {
    const e = {};
    if (isAdmin && !data.school_id) e.school_id = "Please select a school";
    if (!data.class_id) e.class_id = "Class is required";
    if (!data.section_id) e.section_id = "Section is required";
    if (!data.academic_year_id)
      e.academic_year_id = "Academic year is required";
    if (!data.capacity) e.capacity = "Capacity is required";
    else if (Number.isNaN(Number(data.capacity)) || Number(data.capacity) <= 0)
      e.capacity = "Enter a valid capacity";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      school_id: Number(isAdmin ? data.school_id : schoolId),
      class_id: Number(data.class_id),
      section_id: Number(data.section_id),
      academic_year_id: Number(data.academic_year_id),
      class_teacher_id: data.class_teacher_id
        ? Number(data.class_teacher_id)
        : null,
      capacity: Number(data.capacity),
      status: data.status,
    });
  };

  const inputCls = (key) =>
    `cs-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${
      errors[key] ? "cs-input-error" : ""
    }`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="cs-field-label text-[13px] font-medium">
            School <span className="cs-field-required">*</span>
          </label>
          <CustomDropdown
            options={schoolOptions}
            value={data.school_id}
            onChange={(val) => {
              setData((d) => ({
                ...d,
                school_id: val,
                class_id: "",
                section_id: "",
              }));
              if (errors.school_id)
                setErrors((er) => ({ ...er, school_id: null }));
            }}
            placeholder={
              schoolsLoading ? "Loading schools..." : "Select a school"
            }
            searchable={schoolOptions.length > 5}
            searchPlaceholder="Search schools..."
            disabled={schoolsLoading}
            hasError={Boolean(errors.school_id)}
          />
          <div className="h-4">
            {errors.school_id && (
              <p className="cs-field-error text-[11px]">{errors.school_id}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Class */}
        <div className="flex flex-col gap-1.5">
          <label className="cs-field-label text-[13px] font-medium">
            Class <span className="cs-field-required">*</span>
          </label>
          <CustomDropdown
            options={classOptions}
            value={data.class_id}
            onChange={handleClassChange}
            placeholder={
              needsSchoolFirst
                ? "Select a school first"
                : classesLoading
                  ? "Loading..."
                  : "Select Class"
            }
            searchable={classOptions.length > 5}
            searchPlaceholder="Search classes..."
            disabled={classesLoading || needsSchoolFirst}
            hasError={Boolean(errors.class_id)}
          />
          <div className="h-4">
            {errors.class_id && (
              <p className="cs-field-error text-[11px]">{errors.class_id}</p>
            )}
          </div>
        </div>

        {/* Section */}
        <div className="flex flex-col gap-1.5">
          <label className="cs-field-label text-[13px] font-medium">
            Section <span className="cs-field-required">*</span>
          </label>
          <CustomDropdown
            options={sectionOptions}
            value={data.section_id}
            onChange={(val) => {
              setData((d) => ({ ...d, section_id: val }));
              if (errors.section_id)
                setErrors((er) => ({ ...er, section_id: null }));
            }}
            placeholder={
              needsSchoolFirst
                ? "Select a school first"
                : needsClassFirst
                  ? "Select a class first"
                  : sectionsLoading
                    ? "Loading..."
                    : "Select Section"
            }
            searchable={sectionOptions.length > 5}
            searchPlaceholder="Search sections..."
            disabled={sectionsLoading || needsSchoolFirst || needsClassFirst}
            hasError={Boolean(errors.section_id)}
          />
          <div className="h-4">
            {errors.section_id && (
              <p className="cs-field-error text-[11px]">{errors.section_id}</p>
            )}
          </div>
        </div>

        {/* Academic Year */}
        <div className="flex flex-col gap-1.5">
          <label className="cs-field-label text-[13px] font-medium">
            Academic Year <span className="cs-field-required">*</span>
          </label>
          <CustomDropdown
            options={yearOptions}
            value={data.academic_year_id}
            onChange={(val) => {
              setData((d) => ({ ...d, academic_year_id: val }));
              if (errors.academic_year_id)
                setErrors((er) => ({ ...er, academic_year_id: null }));
            }}
            placeholder={
              needsSchoolFirst
                ? "Select a school first"
                : yearsLoading
                  ? "Loading..."
                  : "Select Academic Year"
            }
            searchable={yearOptions.length > 5}
            searchPlaceholder="Search academic years..."
            disabled={yearsLoading || needsSchoolFirst}
            hasError={Boolean(errors.academic_year_id)}
          />
          <div className="h-4">
            {errors.academic_year_id && (
              <p className="cs-field-error text-[11px]">
                {errors.academic_year_id}
              </p>
            )}
          </div>
        </div>

        {/* Class Teacher */}
        <div className="flex flex-col gap-1.5">
          <label className="cs-field-label text-[13px] font-medium">
            Class Teacher
          </label>
          <CustomDropdown
            options={teacherOptions}
            value={data.class_teacher_id}
            onChange={(val) =>
              setData((d) => ({ ...d, class_teacher_id: val }))
            }
            placeholder={
              needsSchoolFirst
                ? "Select a school first"
                : employeesLoading
                  ? "Loading..."
                  : "None"
            }
            searchable={teacherOptions.length > 5}
            searchPlaceholder="Search teachers..."
            disabled={employeesLoading || needsSchoolFirst}
          />
        </div>

        {/* Capacity */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="cs-field-label text-[13px] font-medium">
            Capacity <span className="cs-field-required">*</span>
          </label>
          <input
            type="number"
            min="1"
            className={inputCls("capacity")}
            value={data.capacity}
            onChange={(e) =>
              setData((d) => ({ ...d, capacity: e.target.value }))
            }
            placeholder="e.g. 40"
          />
          <div className="h-4">
            {errors.capacity && (
              <p className="cs-field-error text-[11px]">{errors.capacity}</p>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <label className="cs-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setData((d) => ({ ...d, status: s }))}
              className={`cs-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                data.status === s
                  ? s === "active"
                    ? "cs-status-toggle-active"
                    : "cs-status-toggle-inactive"
                  : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Form Footer */}
      <div className="cs-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="cs-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="cs-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Update Class Section" : "Create Class Section"}
        </button>
      </div>
    </form>
  );
}
