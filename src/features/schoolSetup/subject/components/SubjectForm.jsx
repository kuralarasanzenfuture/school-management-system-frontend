import React, { useEffect, useRef, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { checkSubjectExists } from "../../../../redux/schoolSetup/subject/subject.service.js";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import {
  handleRestrictedInput,
  toUpperCase,
} from "../../../../common/utils/inputHandlers.js";

const EMPTY = {
  school_id: "",
  name: "",
  code: "",
  subject_type: "theory",
  status: "active",
};

const SUBJECT_TYPES = ["theory", "practical", "both"];
const DEBOUNCE_MS = 500;

/**
 * Add/edit form for a single subject.
 *
 * Matches the `subjects` table: school_id, name, code,
 * subject_type (theory/practical/both), status.
 *
 * @param {object|null} initialData
 * @param {(payload: object) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function SubjectForm({
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

  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  const isEdit = Boolean(initialData?.id);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [checkingExists, setCheckingExists] = useState(false);

  const skipNextCheck = useRef(true);

  // Which school the uniqueness check should run against:
  // Admins check whatever they've picked in the dropdown so far,
  // everyone else checks their own fixed school.
  const effectiveSchoolId = isAdmin ? data.school_id : schoolId;

  // Resets the form only when switching between add/edit targets
  useEffect(() => {
    if (initialData) {
      setData({
        school_id: initialData.school_id ? String(initialData.school_id) : "",
        name: initialData.name || "",
        code: initialData.code || "",
        subject_type: initialData.subject_type || "theory",
        status: initialData.status || "active",
      });
    } else {
      setData({
        ...EMPTY,
        school_id: isAdmin ? "" : (schoolId ? String(schoolId) : ""),
      });
    }
    setErrors({});
    skipNextCheck.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Backfills school_id for a non-admin once auth resolves
  useEffect(() => {
    if (!initialData && !isAdmin && schoolId) {
      setData((d) => (d.school_id ? d : { ...d, school_id: String(schoolId) }));
    }
  }, [schoolId, isAdmin, initialData]);

  const setCode = (e) => {
    const value = e.target.value.toUpperCase().replace(/\s+/g, "");
    setData((d) => ({ ...d, code: value }));
    if (errors.code) setErrors((er) => ({ ...er, code: null }));
  };

  // Live uniqueness check (debounced, name + code together)
  useEffect(() => {
    if (skipNextCheck.current) {
      skipNextCheck.current = false;
      return;
    }

    const name = data.name.trim();
    const code = data.code.trim();

    if (!effectiveSchoolId || (!name && !code)) return;

    if (
      isEdit &&
      name === (initialData?.name || "") &&
      code === (initialData?.code || "")
    ) {
      setErrors((e) => ({ ...e, name: null, code: null }));
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingExists(true);
      try {
        const result = await checkSubjectExists({
          school_id: effectiveSchoolId,
          name,
          code,
        });

        const nameExists = Boolean(result?.match?.name);
        const codeExists = Boolean(result?.match?.code);

        setErrors((e) => ({
          ...e,
          name: nameExists
            ? "This subject name already exists in this school"
            : null,
          code:
            code && codeExists ? "This subject code is already in use" : null,
        }));
      } catch {
        // network/server error — skip check
      } finally {
        setCheckingExists(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.name, data.code, effectiveSchoolId]);

  const schoolOptions = useMemo(() => {
    const list = Array.isArray(schools)
      ? schools
      : Array.isArray(schools?.data)
        ? schools.data
        : [];
    return list.map((s) => ({ value: String(s.id), label: s.name }));
  }, [schools]);

  const validate = () => {
    const e = {};
    if (isAdmin && !data.school_id) e.school_id = "Please select a school";
    if (!data.name.trim()) e.name = "Subject name is required";
    else if (data.name.trim().length > 100) e.name = "Max 100 characters";

    if (data.code && data.code.length > 20) e.code = "Max 20 characters";

    if (errors.name) e.name = errors.name;
    if (errors.code) e.code = errors.code;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checkingExists) return;
    if (!validate()) return;

    onSubmit({
      school_id: Number(isAdmin ? data.school_id : schoolId),
      name: data.name.trim(),
      code: data.code.trim() || null,
      subject_type: data.subject_type,
      status: data.status,
    });
  };

  const inputCls = (key) =>
    `sj-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${
      errors[key] ? "sj-input-error" : ""
    }`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="sj-field-label text-[13px] font-medium">
            School <span className="sj-field-required">*</span>
          </label>
          <CustomDropdown
            options={schoolOptions}
            value={data.school_id ? String(data.school_id) : ""}
            onChange={(val) => {
              setData((d) => ({ ...d, school_id: val }));
              if (errors.school_id) {
                setErrors((er) => ({ ...er, school_id: null }));
              }
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
              <p className="sj-field-error text-[11px]">{errors.school_id}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="sj-field-label text-[13px] font-medium">
            Subject Name <span className="sj-field-required">*</span>
          </label>
          <input
            autoFocus
            className={inputCls("name")}
            placeholder="e.g. Mathematics"
            value={data.name}
            onChange={handleRestrictedInput(setData, "name", toUpperCase)}
            maxLength={100}
          />
          <div className="h-4">
            {checkingExists ? (
              <p className="sj-field-hint text-[11px]">Checking…</p>
            ) : (
              errors.name && (
                <p className="sj-field-error text-[11px]">{errors.name}</p>
              )
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sj-field-label text-[13px] font-medium">Code</label>
          <input
            className={inputCls("code")}
            placeholder="e.g. MATH101"
            value={data.code}
            onChange={setCode}
            maxLength={20}
          />
          <div className="h-4">
            {checkingExists ? (
              <p className="sj-field-hint text-[11px]">Checking…</p>
            ) : (
              errors.code && (
                <p className="sj-field-error text-[11px]">{errors.code}</p>
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="sj-field-label text-[13px] font-medium">
          Subject Type
        </label>
        <div className="flex gap-2">
          {SUBJECT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setData((d) => ({ ...d, subject_type: t }))}
              className={`sj-type-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                data.subject_type === t ? "sj-type-toggle-active" : ""
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="sj-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setData((d) => ({ ...d, status: s }))}
              className={`sj-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                data.status === s
                  ? s === "active"
                    ? "sj-status-toggle-active"
                    : "sj-status-toggle-inactive"
                  : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="sj-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="sj-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || checkingExists}
          className="sj-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Update Subject" : "Create Subject"}
        </button>
      </div>
    </form>
  );
}
