import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const EMPTY = {
  name: "",
  description: "",
  status: "active",
};

/**
 * Add/edit form for a single role.
 *
 * @param {object|null} initialData - pass an existing role to edit it;
 *   omit (or pass null) to create a new one.
 * @param {(payload: {name, description, status}) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting - disables the form while a save is in flight
 */
export default function RoleForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setData(
      initialData
        ? {
          name: initialData.name || "",
          description: initialData.description || "",
          status: initialData.status || "active",
        }
        : EMPTY,
    );
    setErrors({});
  }, [initialData]);

  const set = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!data.name.trim()) e.name = "Role name is required";
    else if (data.name.trim().length > 100) e.name = "Max 100 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: data.name.trim(),
      description: data.description.trim(),
      status: data.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="rp-field-label text-[13px] font-medium">
          Role Name <span className="rp-field-required">*</span>
        </label>
        <input
          autoFocus
          className={`rp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.name ? "rp-input-error" : ""} uppercase`}
          placeholder="e.g. Class Teacher"
          value={data.name}
          onChange={set("name")}
          maxLength={100}
          style={{ textTransform: "uppercase" }}
        />
        <div className="h-4">
          {errors.name && (
            <p className="rp-field-error text-[11px]">{errors.name}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="rp-field-label text-[13px] font-medium">
          Description
        </label>
        <textarea
          rows={3}
          className="rp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 resize-none"
          placeholder="What can this role do?"
          value={data.description}
          onChange={set("description")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="rp-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setData((d) => ({ ...d, status: s }))}
              className={`rp-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${data.status === s
                  ? s === "active"
                    ? "rp-status-toggle-active"
                    : "rp-status-toggle-inactive"
                  : ""
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rp-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rp-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rp-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {initialData ? "Update Role" : "Create Role"}
        </button>
      </div>
    </form>
  );
}
