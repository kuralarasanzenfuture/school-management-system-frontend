import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { checkSectionExists } from "../../../../redux/schoolSetup/section/section.service.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import {
  handleRestrictedInput,
  toUpperCase,
} from "../../../../common/utils/inputHandlers.js";

const EMPTY = {
  school_id: "",
  class_id: "",
  name: "",
  capacity: "",
  status: "active",
};

const DEBOUNCE_MS = 500;

export default function SectionForm({
  initialData = null,
  availableClasses = [],
  onSubmit,
  onCancel,
  submitting,
}) {
  const dispatch = useDispatch();

  const isEdit = Boolean(initialData?.id);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [checkingName, setCheckingName] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  const skipNextCheck = useRef(true);

  useEffect(() => {
    if (initialData) {
      const classId =
        typeof initialData.class_id === "object"
          ? initialData.class_id?.id
          : (initialData.class_id ?? initialData.class?.id ?? "");

      const matchedClass = availableClasses.find(
        (c) => String(c.id) === String(classId),
      );

      setData({
        school_id: isAdmin ? (matchedClass?.school_id ?? "") : "",
        class_id: classId ? String(classId) : "",
        name: initialData.section_name || initialData.name || "",
        capacity:
          initialData.capacity === null || initialData.capacity === undefined
            ? ""
            : String(initialData.capacity),
        status: initialData.status || "active",
      });
    } else {
      setData({ ...EMPTY });
    }
    setErrors({});
    skipNextCheck.current = true;
  }, [initialData, availableClasses, isAdmin]);

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

  const filteredClasses = useMemo(() => {
    const list = Array.isArray(availableClasses)
      ? availableClasses
      : availableClasses?.data || [];
    if (!isAdmin) return list;
    if (!data.school_id) return [];
    return list.filter((c) => String(c.school_id) === String(data.school_id));
  }, [availableClasses, isAdmin, data.school_id]);

  const classOptions = useMemo(
    () => filteredClasses.map((c) => ({ value: String(c.id), label: c.name })),
    [filteredClasses],
  );

  // Live uniqueness check (debounced)
  useEffect(() => {
    if (skipNextCheck.current) {
      skipNextCheck.current = false;
      return;
    }

    const name = data.name.trim();
    const classId = data.class_id;

    if (!name || !classId) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }
    if (
      isEdit &&
      name === (initialData.section_name || initialData.name) &&
      String(classId) ===
        String(initialData.class_id?.id ?? initialData.class_id)
    ) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingName(true);
      try {
        const result = await checkSectionExists(classId, name);
        const exists =
          typeof result === "boolean" ? result : Boolean(result?.exists);
        setErrors((e) => ({
          ...e,
          name: exists ? "This section already exists in the class" : null,
        }));
      } catch {
        // network/server error
      } finally {
        setCheckingName(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [data.name, data.class_id, isEdit, initialData]);

  const validate = () => {
    const e = {};
    if (isAdmin && !data.school_id) e.school_id = "Please select a school";
    if (!data.class_id) e.class_id = "Class is required";

    if (!data.name.trim()) e.name = "Section name is required";
    else if (data.name.trim().length > 20) e.name = "Max 20 characters";

    if (data.capacity !== "" && data.capacity !== null) {
      const num = Number(data.capacity);
      if (!Number.isInteger(num) || num <= 0) {
        e.capacity = "Capacity must be a positive whole number";
      }
    }

    if (errors.name) e.name = errors.name;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checkingName) return;
    if (!validate()) return;

    onSubmit({
      class_id: Number(data.class_id),
      name: data.name.trim(),
      capacity: data.capacity === "" ? null : Number(data.capacity),
      status: data.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="sp-field-label text-[13px] font-medium">
            School <span className="sp-field-required">*</span>
          </label>
          <CustomDropdown
            options={schoolOptions}
            value={data.school_id}
            onChange={(val) => {
              setData((d) => ({ ...d, school_id: val, class_id: "" }));
              if (errors.school_id) setErrors((er) => ({ ...er, school_id: null }));
            }}
            placeholder={schoolsLoading ? "Loading schools..." : "Select a school"}
            searchable={schoolOptions.length > 5}
            searchPlaceholder="Search schools..."
            disabled={schoolsLoading}
            hasError={Boolean(errors.school_id)}
          />
          <div className="h-4">
            {errors.school_id && (
              <p className="sp-field-error text-[11px]">{errors.school_id}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="sp-field-label text-[13px] font-medium">
          Class <span className="sp-field-required">*</span>
        </label>
        <CustomDropdown
          options={classOptions}
          value={data.class_id}
          onChange={(val) => {
            setData((d) => ({ ...d, class_id: val }));
            if (errors.class_id) setErrors((er) => ({ ...er, class_id: null }));
          }}
          placeholder={
            isAdmin && !data.school_id
              ? "Select a school first…"
              : "Select a class…"
          }
          searchable={classOptions.length > 5}
          searchPlaceholder="Search classes..."
          disabled={isAdmin && !data.school_id}
          hasError={Boolean(errors.class_id)}
        />
        <div className="h-4">
          {errors.class_id && (
            <p className="sp-field-error text-[11px]">{errors.class_id}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="sp-field-label text-[13px] font-medium">
            Section Name <span className="sp-field-required">*</span>
          </label>
          <input
            autoFocus
            className={`sp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${
              errors.name ? "sp-input-error" : ""
            }`}
            placeholder="e.g. A"
            value={data.name}
            onChange={handleRestrictedInput(setData, "name", toUpperCase)}
            maxLength={20}
          />
          <div className="h-4">
            {checkingName ? (
              <p className="sp-field-hint text-[11px]">Checking…</p>
            ) : (
              errors.name && (
                <p className="sp-field-error text-[11px]">{errors.name}</p>
              )
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="sp-field-label text-[13px] font-medium">
            Capacity
          </label>
          <input
            type="number"
            min="1"
            className={`sp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${
              errors.capacity ? "sp-input-error" : ""
            }`}
            placeholder="Optional"
            value={data.capacity}
            onChange={(e) =>
              setData((d) => ({ ...d, capacity: e.target.value }))
            }
          />
          <div className="h-4">
            {errors.capacity && (
              <p className="sp-field-error text-[11px]">{errors.capacity}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="sp-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setData((d) => ({ ...d, status: s }))}
              className={`sp-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                data.status === s
                  ? s === "active"
                    ? "sp-status-toggle-active"
                    : "sp-status-toggle-inactive"
                  : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="sp-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="sp-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || checkingName}
          className="sp-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Update Section" : "Create Section"}
        </button>
      </div>
    </form>
  );
}
