import React, { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { fetchClasses } from "../../../../redux/schoolSetup/class/classSlice.js";
import { fetchAcademicYears } from "../../../../redux/schoolSetup/academic-year/academicYearSlice.js";
import { fetchEmployees } from "../../../../redux/employee/employeeSlice.js";
import { fetchSubjects } from "../../../../redux/schoolSetup/subject/subjectSlice.js";
import { fetchSubjectGroups } from "../../../../redux/schoolSetup/subject_group/subjectGroupSlice.js";

const EMPTY_ROW = () => ({
  subject_id: "",
  subject_group_id: "",
  employee_id: "",
  is_optional: false,
});

/**
 * Bulk-assigns multiple subjects (each optionally with a subject group
 * and/or teacher) to a single class + academic year in one submission.
 *
 * Submits:
 * {
 *   school_id, class_id, academic_year_id,
 *   subjects: [{ subject_id, subject_group_id?, employee_id?, is_optional }]
 * }
 * subject_group_id/employee_id are omitted entirely (not sent as null)
 * when left blank, matching your sample payload.
 *
 * @param {(payload: object) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function BulkAssignSubjectsForm({
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
  const { subjects = [], loading: subjectsLoading } = useSelector(
    (state) => state.subjects,
  );
  const { subjectGroups = [], loading: subjectGroupsLoading } = useSelector(
    (state) => state.subjectGroups,
  );
  const { employees = [], loading: employeesLoading } = useSelector(
    (state) => state.employees,
  );
  const { academicYears = [], loading: yearsLoading } = useSelector(
    (state) => state.academicYears,
  );

  const [header, setHeader] = useState({
    school_id: isAdmin ? "" : (schoolId ?? ""),
    class_id: "",
    academic_year_id: "",
  });
  const [rows, setRows] = useState([EMPTY_ROW()]);
  const [errors, setErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});

  const rowKeyCounter = useRef(0);
  const [rowKeys, setRowKeys] = useState([rowKeyCounter.current]);

  const effectiveSchoolId = isAdmin ? header.school_id : schoolId;

  useEffect(() => {
    if (isAdmin) dispatch(fetchSchools());
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (isAdmin && !effectiveSchoolId) return;
    dispatch(fetchClasses(effectiveSchoolId));
    dispatch(fetchSubjects(effectiveSchoolId));
    dispatch(fetchSubjectGroups(effectiveSchoolId));
    dispatch(fetchEmployees(effectiveSchoolId));
    dispatch(fetchAcademicYears(effectiveSchoolId));
  }, [dispatch, isAdmin, effectiveSchoolId]);

  // Backfill school_id for a non-admin once the auth fetch resolves.
  useEffect(() => {
    if (!isAdmin && schoolId) {
      setHeader((h) => (h.school_id ? h : { ...h, school_id: schoolId }));
    }
  }, [schoolId, isAdmin]);

  const scopedTo = (list) =>
    !effectiveSchoolId
      ? list
      : list.filter(
          (item) =>
            item.school_id == null ||
            String(item.school_id) === String(effectiveSchoolId),
        );

  const filteredClasses = scopedTo(classes);
  const filteredSubjects = scopedTo(subjects);
  const filteredSubjectGroups = scopedTo(subjectGroups);
  const filteredEmployees = scopedTo(employees);
  const filteredAcademicYears = scopedTo(academicYears);

  const needsSchoolFirst = isAdmin && !effectiveSchoolId;

  const setHeaderField = (key) => (e) => {
    setHeader((h) => ({ ...h, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const addRow = () => {
    rowKeyCounter.current += 1;
    setRows((r) => [...r, EMPTY_ROW()]);
    setRowKeys((k) => [...k, rowKeyCounter.current]);
  };

  const removeRow = (index) => {
    setRows((r) => r.filter((_, i) => i !== index));
    setRowKeys((k) => k.filter((_, i) => i !== index));
    setRowErrors((er) => {
      const next = { ...er };
      delete next[index];
      return next;
    });
  };

  const setRowField = (index, key) => (e) => {
    const value = key === "is_optional" ? e.target.checked : e.target.value;
    setRows((r) =>
      r.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
    if (rowErrors[index]?.[key]) {
      setRowErrors((er) => ({
        ...er,
        [index]: { ...er[index], [key]: null },
      }));
    }
  };

  const validate = () => {
    const e = {};
    if (isAdmin && !header.school_id) e.school_id = "Please select a school";
    if (!header.class_id) e.class_id = "Class is required";
    if (!header.academic_year_id)
      e.academic_year_id = "Academic year is required";

    const rErrs = {};
    const seenSubjectIds = new Set();
    rows.forEach((row, i) => {
      const rowErr = {};
      if (!row.subject_id) rowErr.subject_id = "Required";
      else if (seenSubjectIds.has(row.subject_id)) {
        rowErr.subject_id = "Duplicate subject";
      } else {
        seenSubjectIds.add(row.subject_id);
      }
      if (Object.keys(rowErr).length) rErrs[i] = rowErr;
    });

    if (rows.length === 0) e.rows = "Add at least one subject";

    setErrors(e);
    setRowErrors(rErrs);
    return Object.keys(e).length === 0 && Object.keys(rErrs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const subjectsPayload = rows.map((row) => {
      const item = {
        subject_id: Number(row.subject_id),
        is_optional: Boolean(row.is_optional),
      };
      if (row.subject_group_id) {
        item.subject_group_id = Number(row.subject_group_id);
      }
      if (row.employee_id) {
        item.employee_id = Number(row.employee_id);
      }
      return item;
    });

    onSubmit({
      school_id: Number(isAdmin ? header.school_id : schoolId),
      class_id: Number(header.class_id),
      academic_year_id: Number(header.academic_year_id),
      subjects: subjectsPayload,
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
            value={header.school_id}
            onChange={setHeaderField("school_id")}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="cx-field-label text-[13px] font-medium">
            Class <span className="cx-field-required">*</span>
          </label>
          <select
            className={inputCls("class_id")}
            value={header.class_id}
            onChange={setHeaderField("class_id")}
            disabled={classesLoading || needsSchoolFirst}
          >
            <option value="">
              {needsSchoolFirst
                ? "Select a school first"
                : classesLoading
                  ? "Loading..."
                  : "Select Class"}
            </option>
            {filteredClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="h-4">
            {errors.class_id && (
              <p className="cx-field-error text-[11px]">{errors.class_id}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="cx-field-label text-[13px] font-medium">
            Academic Year <span className="cx-field-required">*</span>
          </label>
          <select
            className={inputCls("academic_year_id")}
            value={header.academic_year_id}
            onChange={setHeaderField("academic_year_id")}
            disabled={yearsLoading || needsSchoolFirst}
          >
            <option value="">
              {needsSchoolFirst
                ? "Select a school first"
                : yearsLoading
                  ? "Loading..."
                  : "Select Academic Year"}
            </option>
            {filteredAcademicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
          <div className="h-4">
            {errors.academic_year_id && (
              <p className="cx-field-error text-[11px]">
                {errors.academic_year_id}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="cx-bulk-divider" />

      <div className="flex items-center justify-between">
        <label className="cx-field-label text-[13px] font-medium">
          Subjects <span className="cx-field-required">*</span>
        </label>
        <button
          type="button"
          onClick={addRow}
          className="cx-add-row-btn inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={13} /> Add Subject
        </button>
      </div>
      {errors.rows && (
        <p className="cx-field-error text-[11px] -mt-2">{errors.rows}</p>
      )}

      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <div key={rowKeys[index]} className="cx-bulk-row rounded-xl p-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="cx-field-label text-[12px] font-medium">
                  Subject <span className="cx-field-required">*</span>
                </label>
                <select
                  className={`cx-input w-full rounded-lg px-3 py-2 text-[13.5px] outline-none transition-all duration-200 ${rowErrors[index]?.subject_id ? "cx-input-error" : ""}`}
                  value={row.subject_id}
                  onChange={setRowField(index, "subject_id")}
                  disabled={subjectsLoading || needsSchoolFirst}
                >
                  <option value="">
                    {subjectsLoading ? "Loading..." : "Select Subject"}
                  </option>
                  {filteredSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                      {s.code ? ` (${s.code})` : ""}
                    </option>
                  ))}
                </select>
                <div className="h-3.5">
                  {rowErrors[index]?.subject_id && (
                    <p className="cx-field-error text-[10.5px]">
                      {rowErrors[index].subject_id}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="cx-field-label text-[12px] font-medium">
                  Subject Group
                </label>
                <select
                  className="cx-select w-full rounded-lg px-3 py-2 text-[13.5px] outline-none transition-all duration-200"
                  value={row.subject_group_id}
                  onChange={setRowField(index, "subject_group_id")}
                  disabled={subjectGroupsLoading || needsSchoolFirst}
                >
                  <option value="">None</option>
                  {filteredSubjectGroups.map((sg) => (
                    <option key={sg.id} value={sg.id}>
                      {sg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="cx-field-label text-[12px] font-medium">
                  Teacher
                </label>
                <select
                  className="cx-select w-full rounded-lg px-3 py-2 text-[13.5px] outline-none transition-all duration-200"
                  value={row.employee_id}
                  onChange={setRowField(index, "employee_id")}
                  disabled={employeesLoading || needsSchoolFirst}
                >
                  <option value="">None</option>
                  {filteredEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name || ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end justify-between gap-2">
                <label className="cx-checkbox-row-sm flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium cursor-pointer transition-colors flex-1">
                  <input
                    type="checkbox"
                    className="cx-checkbox w-4 h-4 rounded"
                    checked={row.is_optional}
                    onChange={setRowField(index, "is_optional")}
                  />
                  Optional
                </label>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  disabled={rows.length === 1}
                  className="cx-remove-row-btn w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  title="Remove this subject"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
          Assign {rows.length} Subject{rows.length === 1 ? "" : "s"}
        </button>
      </div>
    </form>
  );
}
