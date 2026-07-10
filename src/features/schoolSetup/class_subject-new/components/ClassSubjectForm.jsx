import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { fetchClassSections } from "../../../../redux/schoolSetup/class-sections/classSectionSlice.js";
import { fetchEmployees } from "../../../../redux/employee/employeeSlice.js";
import { fetchSubjects } from "../../../../redux/schoolSetup/subject/subjectSlice.js";
import { fetchSubjectGroups } from "../../../../redux/schoolSetup/subject_group/subjectGroupSlice.js";

const EMPTY = {
  school_id: "",
  class_section_id: "",
  subject_id: "",
  subject_group_id: "",
  employee_id: "",
  is_optional: false,
  weekly_periods: "",
};

function idOf(value) {
  if (value == null) return "";
  if (typeof value === "object") return value.id ?? "";
  return value;
}

function classSectionLabel(cs) {
  const classPart = cs.class_name || cs.class_id;
  const sectionPart = cs.section_name || cs.section_id;
  const yearPart = cs.academic_year ? ` (${cs.academic_year})` : "";
  return `${classPart} - ${sectionPart}${yearPart}`;
}

/**
 * Add/edit form for a single class-subject assignment.
 *
 * UPDATED SCHEMA: class_subjects is now scoped by a single
 * class_section_id (which already encodes school + class + section +
 * academic year via the class_sections table) instead of separate
 * school_id/class_id/academic_year_id columns. `school_id` here is used
 * ONLY client-side, to narrow the Class Section dropdown for admins — it
 * is NOT part of the submitted payload.
 *
 * ASSUMPTION: I don't have your actual POST/GET samples for this updated
 * table, so field names below are inferred directly from the CREATE
 * TABLE statement (class_section_id, subject_id, subject_group_id,
 * employee_id, is_optional, weekly_periods). Please confirm these match
 * your real API.
 *
 * @param {object|null} initialData
 * @param {(payload: object) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function ClassSubjectForm({
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

  const { classSections = [], loading: classSectionsLoading } = useSelector(
    (state) => state.classSections,
  );
  const { subjects = [], loading: subjectsLoading } = useSelector(
    (state) => state.subjects,
  );
  const { subjectGroups = [], loading: subjectGroupsLoading } = useSelector(
    (state) => state.subjectGroups,
  );
  const { employees = [], loading: employeesLoading } = useSelector(
    (state) => state.employees,
  );

  const isEdit = Boolean(initialData?.id);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const effectiveSchoolId = isAdmin ? data.school_id : schoolId;

  useEffect(() => {
    if (isAdmin) dispatch(fetchSchools());
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (isAdmin && !effectiveSchoolId) return;
    dispatch(fetchClassSections());
    dispatch(fetchSubjects(effectiveSchoolId));
    dispatch(fetchSubjectGroups(effectiveSchoolId));
    dispatch(fetchEmployees(effectiveSchoolId));
  }, [dispatch, isAdmin, effectiveSchoolId]);

  useEffect(() => {
    if (initialData) {
      setData({
        school_id: idOf(initialData.school_id),
        class_section_id: idOf(initialData.class_section_id),
        subject_id: idOf(initialData.subject_id),
        subject_group_id: idOf(initialData.subject_group_id),
        employee_id: idOf(initialData.employee_id),
        is_optional: Boolean(
          initialData.is_optional === 1 || initialData.is_optional === true,
        ),
        weekly_periods:
          initialData.weekly_periods != null
            ? String(initialData.weekly_periods)
            : "0",
      });
    } else {
      setData({ ...EMPTY, school_id: isAdmin ? "" : (schoolId ?? "") });
    }
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  useEffect(() => {
    if (!initialData && !isAdmin && schoolId) {
      setData((d) => (d.school_id ? d : { ...d, school_id: schoolId }));
    }
  }, [schoolId, isAdmin, initialData]);

  const set = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const scopedTo = (list) =>
    !effectiveSchoolId
      ? list
      : list.filter(
          (item) =>
            item.school_id == null ||
            String(item.school_id) === String(effectiveSchoolId),
        );

  const filteredClassSections = scopedTo(classSections);
  const filteredSubjects = scopedTo(subjects);
  const filteredSubjectGroups = scopedTo(subjectGroups);
  const filteredEmployees = scopedTo(employees);

  const needsSchoolFirst = isAdmin && !effectiveSchoolId;

  const validate = () => {
    const e = {};
    if (isAdmin && !data.school_id) e.school_id = "Please select a school";
    if (!data.class_section_id)
      e.class_section_id = "Class section is required";
    if (!data.subject_id) e.subject_id = "Subject is required";
    if (
      data.weekly_periods !== "" &&
      (Number.isNaN(Number(data.weekly_periods)) ||
        Number(data.weekly_periods) < 0)
    ) {
      e.weekly_periods = "Enter a valid number";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      class_section_id: Number(data.class_section_id),
      subject_id: Number(data.subject_id),
      subject_group_id: data.subject_group_id
        ? Number(data.subject_group_id)
        : null,
      employee_id: data.employee_id ? Number(data.employee_id) : null,
      is_optional: data.is_optional,
      weekly_periods:
        data.weekly_periods === "" ? 0 : Number(data.weekly_periods),
    });
  };

  const inputCls = (key) =>
    `cx-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors[key] ? "cx-input-error" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="cx-field-label text-[13px] font-medium">
            School <span className="cx-field-required">*</span>
          </label>
          <select
            className={inputCls("school_id")}
            value={data.school_id}
            onChange={set("school_id")}
            disabled={schoolsLoading}
          >
            <option value="">
              {schoolsLoading ? "Loading schools..." : "Select a school"}
            </option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="h-4">
            {errors.school_id && (
              <p className="cx-field-error text-[11px]">{errors.school_id}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="cx-field-label text-[13px] font-medium">
          Class Section <span className="cx-field-required">*</span>
        </label>
        <select
          className={inputCls("class_section_id")}
          value={data.class_section_id}
          onChange={set("class_section_id")}
          disabled={classSectionsLoading || needsSchoolFirst}
        >
          <option value="">
            {needsSchoolFirst
              ? "Select a school first"
              : classSectionsLoading
                ? "Loading..."
                : "Select Class Section"}
          </option>
          {filteredClassSections.map((cs) => (
            <option key={cs.id} value={cs.id}>
              {classSectionLabel(cs)}
            </option>
          ))}
        </select>
        <div className="h-4">
          {errors.class_section_id && (
            <p className="cx-field-error text-[11px]">
              {errors.class_section_id}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="cx-field-label text-[13px] font-medium">
            Subject <span className="cx-field-required">*</span>
          </label>
          <select
            className={inputCls("subject_id")}
            value={data.subject_id}
            onChange={set("subject_id")}
            disabled={subjectsLoading || needsSchoolFirst}
          >
            <option value="">
              {needsSchoolFirst
                ? "Select a school first"
                : subjectsLoading
                  ? "Loading..."
                  : "Select Subject"}
            </option>
            {filteredSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.code ? ` (${s.code})` : ""}
              </option>
            ))}
          </select>
          <div className="h-4">
            {errors.subject_id && (
              <p className="cx-field-error text-[11px]">{errors.subject_id}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="cx-field-label text-[13px] font-medium">
            Weekly Periods
          </label>
          <input
            type="number"
            min="0"
            className={inputCls("weekly_periods")}
            value={data.weekly_periods}
            onChange={set("weekly_periods")}
          />
          <div className="h-4">
            {errors.weekly_periods && (
              <p className="cx-field-error text-[11px]">
                {errors.weekly_periods}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="cx-field-label text-[13px] font-medium">
            Subject Group
          </label>
          <select
            className="cx-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
            value={data.subject_group_id}
            onChange={set("subject_group_id")}
            disabled={subjectGroupsLoading || needsSchoolFirst}
          >
            <option value="">
              {needsSchoolFirst
                ? "Select a school first"
                : subjectGroupsLoading
                  ? "Loading..."
                  : "None"}
            </option>
            {filteredSubjectGroups.map((sg) => (
              <option key={sg.id} value={sg.id}>
                {sg.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="cx-field-label text-[13px] font-medium">
            Teacher
          </label>
          <select
            className="cx-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
            value={data.employee_id}
            onChange={set("employee_id")}
            disabled={employeesLoading || needsSchoolFirst}
          >
            <option value="">
              {needsSchoolFirst
                ? "Select a school first"
                : employeesLoading
                  ? "Loading..."
                  : "None"}
            </option>
            {filteredEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name || ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="cx-checkbox-row flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium cursor-pointer transition-colors">
        <input
          type="checkbox"
          className="cx-checkbox w-4 h-4 rounded"
          checked={data.is_optional}
          onChange={(e) =>
            setData((d) => ({ ...d, is_optional: e.target.checked }))
          }
        />
        This subject is optional/elective
      </label>

      <div className="cx-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="cx-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="cx-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Update Mapping" : "Create Mapping"}
        </button>
      </div>
    </form>
  );
}
