import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
// import { checkClassExists } from "../../../../redux/schoolSetup/class/classService.js";

const EMPTY = {
  name: "",
  status: "active",
};

const DEBOUNCE_MS = 500;

/**
 * Add/edit form for a single class (e.g. "10", "9", "1").
 *
 * @param {object|null} initialData - pass an existing class to edit it;
 *   omit (or pass null) to create a new one.
 * @param {(payload: {name, status}) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting - disables the form while a save is in flight
 */
export default function ClassForm({
  initialData = null,
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
    setData(
      initialData
        ? {
            name: initialData.name || "",
            status: initialData.status || "active",
          }
        : EMPTY,
    );
    setErrors({});
    skipNextCheck.current = true;
  }, [initialData]);

  const set = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  // ── Live uniqueness check (debounced) ─────────────────────────────
  useEffect(() => {
    if (skipNextCheck.current) {
      skipNextCheck.current = false;
      return;
    }
    const value = data.name.trim();
    if (!value) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }
    if (isEdit && value === initialData.name) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingName(true);
      try {
        const exists = await checkClassExists(value);
        setErrors((e) => ({
          ...e,
          name: exists ? "This class already exists" : null,
        }));
      } catch {
        // network/server error — don't block the user, just skip the check
      } finally {
        setCheckingName(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.name]);

  const validate = () => {
    const e = {};
    if (!data.name.trim()) e.name = "Class name is required";
    else if (data.name.trim().length > 50) e.name = "Max 50 characters";

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
      name: data.name.trim(),
      status: data.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="cp-field-label text-[13px] font-medium">
          Class Name <span className="cp-field-required">*</span>
        </label>
        <input
          autoFocus
          className={`cp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.name ? "cp-input-error" : ""}`}
          placeholder="e.g. 10"
          value={data.name}
          onChange={set("name")}
          maxLength={50}
        />
        <div className="h-4">
          {checkingName ? (
            <p className="cp-field-hint text-[11px]">Checking…</p>
          ) : (
            errors.name && (
              <p className="cp-field-error text-[11px]">{errors.name}</p>
            )
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="cp-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setData((d) => ({ ...d, status: s }))}
              className={`cp-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                data.status === s
                  ? s === "active"
                    ? "cp-status-toggle-active"
                    : "cp-status-toggle-inactive"
                  : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="cp-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="cp-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || checkingName}
          className="cp-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Update Class" : "Create Class"}
        </button>
      </div>
    </form>
  );
}
