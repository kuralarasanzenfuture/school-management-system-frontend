import React, { useEffect, useRef, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { checkSubjectGroupExists } from "../../../../redux/schoolSetup/subject_group/subject_group.service.js";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import {
  handleRestrictedInput,
  toUpperCase,
} from "../../../../common/utils/inputHandlers.js";

const EMPTY = {
  school_id: "",
  name: "",
  description: "",
  status: "active",
};

const DEBOUNCE_MS = 500;

/**
 * Add/edit form for a single subject group (e.g. "Science Stream",
 * "Commerce with Computer Science" — used for higher secondary electives).
 *
 * @param {object|null} initialData
 * @param {(payload: object) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function SubjectGroupForm({
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
  const effectiveSchoolId = isAdmin ? data.school_id : schoolId;

  // Resets the form only when switching between add/edit targets
  useEffect(() => {
    if (initialData) {
      setData({
        school_id: initialData.school_id ? String(initialData.school_id) : "",
        name: initialData.name || "",
        description: initialData.description || "",
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

  // Backfills school_id for a non-admin once the auth fetch resolves
  useEffect(() => {
    if (!initialData && !isAdmin && schoolId) {
      setData((d) => (d.school_id ? d : { ...d, school_id: String(schoolId) }));
    }
  }, [schoolId, isAdmin, initialData]);

  const handleChange = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  // Live uniqueness check (debounced)
  useEffect(() => {
    if (skipNextCheck.current) {
      skipNextCheck.current = false;
      return;
    }

    const name = data.name.trim();

    if (!effectiveSchoolId || !name) return;

    if (isEdit && name === (initialData?.name || "")) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingExists(true);
      try {
        const result = await checkSubjectGroupExists({
          school_id: effectiveSchoolId,
          name,
          id: initialData?.id,
        });

        const exists =
          typeof result === "boolean"
            ? result
            : Boolean(result?.exists || !result?.available);

        setErrors((e) => ({
          ...e,
          name: exists
            ? "This subject group name already exists in this school"
            : null,
        }));
      } catch {
        // network/server error — skip check
      } finally {
        setCheckingExists(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.name, effectiveSchoolId]);

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
    if (!data.name.trim()) e.name = "Group name is required";
    else if (data.name.trim().length < 2)
      e.name = "Name must be at least 2 characters";
    else if (data.name.trim().length > 100)
      e.name = "Max 100 characters";

    if (data.description && data.description.length > 255)
      e.description = "Max 255 characters";

    if (errors.name) e.name = errors.name;

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
      description: data.description.trim() || null,
      status: data.status,
    });
  };

  const inputCls = (key) =>
    `sg-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${
      errors[key] ? "sg-input-error" : ""
    }`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="sg-field-label text-[13px] font-medium">
            School <span className="sg-field-required">*</span>
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
              <p className="sg-field-error text-[11px]">{errors.school_id}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="sg-field-label text-[13px] font-medium">
          Group Name <span className="sg-field-required">*</span>
        </label>
        <input
          autoFocus
          className={inputCls("name")}
          placeholder="e.g. Science Stream"
          value={data.name}
          onChange={handleRestrictedInput(setData, "name", toUpperCase)}
          maxLength={100}
        />
        <div className="h-4">
          {checkingExists ? (
            <p className="sg-field-hint text-[11px]">Checking…</p>
          ) : (
            errors.name && (
              <p className="sg-field-error text-[11px]">{errors.name}</p>
            )
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="sg-field-label text-[13px] font-medium">
          Description
        </label>
        <textarea
          rows={3}
          className={`${inputCls("description")} resize-none`}
          placeholder="Optional description of this subject group…"
          value={data.description}
          onChange={handleChange("description")}
          maxLength={255}
        />
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
          <span>{errors.description && <span className="text-destructive">{errors.description}</span>}</span>
          <span>{data.description.length}/255</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="sg-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setData((d) => ({ ...d, status: s }))}
              className={`sg-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                data.status === s
                  ? s === "active"
                    ? "sg-status-toggle-active"
                    : "sg-status-toggle-inactive"
                  : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="sg-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="sg-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || checkingExists}
          className="sg-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Update Group" : "Create Group"}
        </button>
      </div>
    </form>
  );
}
