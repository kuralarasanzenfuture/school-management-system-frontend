import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
// import { checkSectionExists } from "../../../../redux/Administration/sections/sectionService.js";

const EMPTY = {
  class_id: "",
  name: "",
  capacity: "",
  status: "active",
};

const DEBOUNCE_MS = 500;

/**
 * Add/edit form for a single section (e.g. "A", "B", "C" within a class).
 *
 * @param {object|null} initialData - pass an existing section to edit it;
 *   the `class_id` on it may be a plain id or a nested `class` object —
 *   both are normalized below.
 * @param {Array<{id, name}>} availableClasses - full class list to render
 *   as a dropdown (fetched once by the parent page).
 * @param {(payload: {class_id, name, capacity, status}) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function SectionForm({
  initialData = null,
  availableClasses = [],
  onSubmit,
  onCancel,
  submitting,
}) {
  const isEdit = Boolean(initialData?.id);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [checkingName, setCheckingName] = useState(false);

  const skipNextCheck = useRef(true);

  useEffect(() => {
    if (initialData) {
      const classId =
        typeof initialData.class_id === "object"
          ? initialData.class_id?.id
          : (initialData.class_id ?? initialData.class?.id ?? "");

      setData({
        class_id: classId ?? "",
        name: initialData.name || "",
        capacity:
          initialData.capacity === null || initialData.capacity === undefined
            ? ""
            : String(initialData.capacity),
        status: initialData.status || "active",
      });
    } else {
      setData(EMPTY);
    }
    setErrors({});
    skipNextCheck.current = true;
  }, [initialData]);

  const set = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  // ── Live uniqueness check (debounced, scoped to selected class) ───
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
      name === initialData.name &&
      String(classId) ===
        String(initialData.class_id?.id ?? initialData.class_id)
    ) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingName(true);
      try {
        const exists = await checkSectionExists(classId, name);
        setErrors((e) => ({
          ...e,
          name: exists ? "This section already exists in the class" : null,
        }));
      } catch {
        // network/server error — don't block the user, just skip the check
      } finally {
        setCheckingName(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.name, data.class_id]);

  const validate = () => {
    const e = {};
    if (!data.class_id) e.class_id = "Class is required";

    if (!data.name.trim()) e.name = "Section name is required";
    else if (data.name.trim().length > 20) e.name = "Max 20 characters";

    if (data.capacity !== "" && data.capacity !== null) {
      const num = Number(data.capacity);
      if (!Number.isInteger(num) || num < 0) {
        e.capacity = "Capacity must be a positive whole number";
      }
    }

    // Preserve an "already exists" error surfaced by the live check.
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
      <div className="flex flex-col gap-1.5">
        <label className="sp-field-label text-[13px] font-medium">
          Class <span className="sp-field-required">*</span>
        </label>
        <select
          className={`sp-select w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.class_id ? "sp-select-error" : ""}`}
          value={data.class_id}
          onChange={set("class_id")}
        >
          <option value="">Select a class…</option>
          {availableClasses.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
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
            className={`sp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.name ? "sp-input-error" : ""}`}
            placeholder="e.g. A"
            value={data.name}
            onChange={set("name")}
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
            min="0"
            className={`sp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.capacity ? "sp-input-error" : ""}`}
            placeholder="Optional"
            value={data.capacity}
            onChange={set("capacity")}
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
