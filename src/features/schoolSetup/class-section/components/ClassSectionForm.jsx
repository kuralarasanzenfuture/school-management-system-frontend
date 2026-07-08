import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
// ASSUMPTION: fetchClasses / fetchSections follow the same naming pattern as
// fetchAcademicYears / fetchEmployees elsewhere in your app. Adjust these
// two imports + export names if your classSlice.js / sectionSlice.js use
// different thunk names.
import { fetchClasses } from "../../../../redux/schoolSetup/class/classSlice.js";
import { fetchSections } from "../../../../redux/schoolSetup/section/sectionSlice.js";
import { fetchAcademicYears } from "../../../../redux/schoolSetup/academic-year/academicYearSlice.js";
import { fetchEmployees } from "../../../../redux/employee/employeeSlice.js";

const EMPTY = {
  school_id: "",
  class_id: "",
  section_id: "",
  academic_year_id: "",
  class_teacher_id: "",
  capacity: "",
  status: "active",
};

/**
 * Add/edit form for a single class-section mapping.
 *
 * @param {object|null} initialData - existing record to edit
 * @param {(payload: object) => void} onSubmit - receives a plain JSON
 *   object (no files involved for this endpoint)
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function ClassSectionForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting,
}) {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  // Non-admins only ever belong to one school — use theirs directly.
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
    if (isAdmin) dispatch(fetchSchools());
  }, [dispatch, isAdmin]);

  const isEdit = Boolean(initialData?.id);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const skipSectionResetRef = useRef(true);

  // The school that class/section/academic-year/teacher options should be
  // scoped to: whatever the admin has picked, or the non-admin's own school.
  const effectiveSchoolId = isAdmin ? data.school_id : schoolId;

  // Re-fetch whenever the effective school changes, passing it along in
  // case your fetchClasses/fetchSections/fetchAcademicYears thunks accept
  // a school_id argument to filter server-side.
  //
  // IMPORTANT: I'm guessing these thunks accept an optional school_id
  // param the same way other scoped fetches in this app likely do. If
  // they don't, this argument is just ignored and harmless — but if the
  // real bug is "fetchSections requires school_id and silently fails
  // without it," passing it here is exactly what fixes the "only works
  // after visiting the Sections page first" symptom (that other page is
  // probably the one correctly supplying the id). Please confirm the
  // actual signatures of these three thunks so I can tighten this up.
  useEffect(() => {
    if (isAdmin && !effectiveSchoolId) return; // nothing to scope to yet
    dispatch(fetchClasses(effectiveSchoolId));
    dispatch(fetchSections(effectiveSchoolId));
    dispatch(fetchAcademicYears(effectiveSchoolId));
    dispatch(fetchEmployees(effectiveSchoolId));
  }, [dispatch, isAdmin, effectiveSchoolId]);

  // Resets the form only when switching between add/edit targets — not
  // whenever schoolId/isAdmin change (those come from an async auth fetch
  // and could otherwise flip mid-edit and wipe what the user typed).
  useEffect(() => {
    console.log("initialData:", initialData);
    if (initialData) {
      console.log("initialData.section_id:", initialData.section_id);
      const sectionId =
        typeof initialData.section_id === "object"
          ? initialData.section_id?.id
          : (initialData.section_id ?? "");

      console.log("Setting section_id:", sectionId);
      setData({
        school_id: initialData.school_id ?? "",
        class_id: initialData.class_id ?? "",
        section_id: initialData.section_id ?? "",
        academic_year_id: initialData.academic_year_id ?? "",
        class_teacher_id: initialData.class_teacher_id ?? "",
        capacity:
          initialData.capacity != null ? String(initialData.capacity) : "",
        status: initialData.status || "active",
      });
    } else {
      setData({ ...EMPTY, school_id: isAdmin ? "" : (schoolId ?? "") });
    }
    setErrors({});
    skipSectionResetRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // console.log("section_id from API:", initialData.section_id);

  useEffect(() => {
    console.log("Current data:", data);
  }, [data]);

  // If the selected class changes (after the initial load), clear the
  // section — a previously-picked section may belong to a different
  // class. Skipped on the render right after switching add/edit targets,
  // so an existing record's correct section isn't wiped out on open.
  useEffect(() => {
    if (skipSectionResetRef.current) {
      skipSectionResetRef.current = false;
      return;
    }
    setData((d) => ({ ...d, section_id: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.class_id]);

  // Backfills school_id for a non-admin once the auth fetch resolves,
  // without disturbing anything else already typed into a new record.
  useEffect(() => {
    if (!initialData && !isAdmin && schoolId) {
      setData((d) => (d.school_id ? d : { ...d, school_id: schoolId }));
    }
  }, [schoolId, isAdmin, initialData]);

  const set = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  // Belt-and-suspenders: even if the backend fetches ignore the school_id
  // argument above and return everything, don't let cross-school options
  // show up in the dropdowns. Records with no school_id field at all are
  // kept (so this doesn't break setups where these lists aren't
  // school-scoped server-side to begin with).
  const scopedTo = (list) =>
    !effectiveSchoolId
      ? list
      : list.filter(
          (item) =>
            item.school_id == null ||
            String(item.school_id) === String(effectiveSchoolId),
        );

  const filteredClasses = scopedTo(classes);
  // Sections belong to a specific class (each section record carries its
  // own class_id/class_name), not just a school — so Section options must
  // narrow further once a Class is picked, or a school with e.g. Class 9
  // (sections A, B) and Class 10 (sections A, B, C) would show all 5
  // sections regardless of which class is selected.
  const filteredSections = scopedTo(sections).filter(
    (s) =>
      !data.class_id ||
      s.class_id == null ||
      String(s.class_id) === String(data.class_id),
  );
  const filteredAcademicYears = scopedTo(academicYears);
  const filteredEmployees = scopedTo(employees);

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
    `cs-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors[key] ? "cs-input-error" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="cs-field-label text-[13px] font-medium">
            School <span className="cs-field-required">*</span>
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
              <p className="cs-field-error text-[11px]">{errors.school_id}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="cs-field-label text-[13px] font-medium">
            Class <span className="cs-field-required">*</span>
          </label>
          <select
            className={inputCls("class_id")}
            value={data.class_id}
            onChange={set("class_id")}
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
              <p className="cs-field-error text-[11px]">{errors.class_id}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="cs-field-label text-[13px] font-medium">
            Section <span className="cs-field-required">*</span>
          </label>
          <select
            className={inputCls("section_id")}
            value={data.section_id}
            onChange={set("section_id")}
            disabled={sectionsLoading || needsSchoolFirst || needsClassFirst}
          >
            <option value="">
              {needsSchoolFirst
                ? "Select a school first"
                : needsClassFirst
                  ? "Select a class first"
                  : sectionsLoading
                    ? "Loading..."
                    : "Select Section"}
            </option>
            {filteredSections.map((s) => {
              console.log(s);
              console.log("Edit section_id:", data.section_id);
              console.log("Filtered Sections:", filteredSections);
              console.log(
                "Option id:",
                s.id,
                "Selected:",
                data.section_id,
                "Equal:",
                String(s.id) === String(data.section_id),
              );
              return (
                <option key={s.id} value={s.id}>
                  {s.section_name}
                </option>
              );
            })}
          </select>
          <div className="h-4">
            {errors.section_id && (
              <p className="cs-field-error text-[11px]">{errors.section_id}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="cs-field-label text-[13px] font-medium">
            Academic Year <span className="cs-field-required">*</span>
          </label>
          <select
            className={inputCls("academic_year_id")}
            value={data.academic_year_id}
            onChange={set("academic_year_id")}
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
              <p className="cs-field-error text-[11px]">
                {errors.academic_year_id}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="cs-field-label text-[13px] font-medium">
            Class Teacher
          </label>
          <select
            className="cs-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
            value={data.class_teacher_id}
            onChange={set("class_teacher_id")}
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

        <div className="flex flex-col gap-1.5">
          <label className="cs-field-label text-[13px] font-medium">
            Capacity <span className="cs-field-required">*</span>
          </label>
          <input
            type="number"
            min="1"
            className={inputCls("capacity")}
            value={data.capacity}
            onChange={set("capacity")}
          />
          <div className="h-4">
            {errors.capacity && (
              <p className="cs-field-error text-[11px]">{errors.capacity}</p>
            )}
          </div>
        </div>
      </div>

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


