import React, { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Lock, Hash, AlignLeft, ToggleLeft } from "lucide-react";
import { generateRoleCodePreview, isSystemRole } from "../utils/roleUtils.js";

const EMPTY = {
  name: "",
  description: "",
  status: "active",
};

/**
 * Add / Edit form for a role with validation & system role protection.
 *
 * @param {object|null} initialData - role to edit, or null for creating a new role
 * @param {(payload: {name, description, status}) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function RoleForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const isSystem = isSystemRole(initialData);

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
    let val = e.target.value;
    if (key === "name") {
      val = val.toUpperCase();
    }
    setData((d) => ({ ...d, [key]: val }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const generatedCode = generateRoleCodePreview(data.name);

  const validate = () => {
    const e = {};
    const trimmedName = data.name.trim();

    if (!isSystem) {
      if (!trimmedName) {
        e.name = "Role name is required";
      } else if (trimmedName.length < 2) {
        e.name = "Role name must be at least 2 characters";
      } else if (trimmedName.length > 100) {
        e.name = "Role name cannot exceed 100 characters";
      } else if (!/^[A-Z0-9_ ]+$/.test(trimmedName)) {
        e.name = "Allowed characters: letters, numbers, spaces, and underscores only";
      }
    }

    if (data.description && data.description.trim().length > 500) {
      e.description = "Description cannot exceed 500 characters";
    }

    if (isSystem && data.status === "inactive") {
      e.status = "System roles cannot be deactivated";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: data.name.trim(),
      description: data.description.trim() || null,
      status: data.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* System Role Alert Banner */}
      {isSystem && (
        <div className="rp-system-banner flex items-start gap-2.5 p-3 rounded-xl text-[12.5px] border">
          <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-600 dark:text-amber-400">
              System Protected Role
            </p>
            <p className="text-muted-foreground mt-0.5 text-[12px]">
              This is a core system role. The name and role code are protected from modification to preserve system permissions. You may still update its description.
            </p>
          </div>
        </div>
      )}

      {/* Role Name */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="rp-field-label text-[13px] font-medium flex items-center gap-1.5">
            <Hash size={14} className="opacity-70" />
            Role Name {!isSystem && <span className="rp-field-required">*</span>}
          </label>
          {isSystem && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500">
              <Lock size={11} /> Locked
            </span>
          )}
        </div>

        <div className="relative">
          <input
            autoFocus={!isSystem}
            disabled={isSystem}
            className={`rp-input w-full rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium outline-none transition-all duration-200 ${
              errors.name ? "rp-input-error" : ""
            } ${isSystem ? "opacity-75 cursor-not-allowed bg-opacity-50" : ""}`}
            placeholder="e.g. CLASS TEACHER, HR MANAGER"
            value={data.name}
            onChange={set("name")}
            maxLength={100}
            style={{ textTransform: "uppercase" }}
          />
        </div>

        {/* Live Code Preview */}
        {!isSystem && generatedCode && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11.5px] rp-count-text">Generated Code:</span>
            <span className="rp-code-pill px-2 py-0.5 rounded text-[11.5px] font-mono font-semibold tracking-wider">
              {generatedCode}
            </span>
          </div>
        )}

        {errors.name && (
          <p className="rp-field-error text-[11px] mt-0.5">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="rp-field-label text-[13px] font-medium flex items-center gap-1.5">
            <AlignLeft size={14} className="opacity-70" />
            Description
          </label>
          <span className="text-[11px] rp-count-text">
            {data.description.length}/500
          </span>
        </div>
        <textarea
          rows={3}
          className={`rp-input w-full rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none transition-all duration-200 resize-none ${
            errors.description ? "rp-input-error" : ""
          }`}
          placeholder="Describe permissions, duties, or access scopes for this role..."
          value={data.description}
          onChange={set("description")}
          maxLength={500}
        />
        {errors.description && (
          <p className="rp-field-error text-[11px] mt-0.5">{errors.description}</p>
        )}
      </div>

      {/* Status Toggle */}
      <div className="flex flex-col gap-1.5">
        <label className="rp-field-label text-[13px] font-medium flex items-center gap-1.5">
          <ToggleLeft size={14} className="opacity-70" />
          Status
        </label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => {
            const isInactiveDisabled = isSystem && s === "inactive";
            return (
              <button
                key={s}
                type="button"
                disabled={isInactiveDisabled}
                onClick={() => setData((d) => ({ ...d, status: s }))}
                title={
                  isInactiveDisabled
                    ? "System roles cannot be deactivated"
                    : undefined
                }
                className={`rp-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-all duration-200 ${
                  data.status === s
                    ? s === "active"
                      ? "rp-status-toggle-active shadow-sm"
                      : "rp-status-toggle-inactive shadow-sm"
                    : ""
                } ${isInactiveDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {s}
              </button>
            );
          })}
        </div>
        {errors.status && (
          <p className="rp-field-error text-[11px] mt-0.5">{errors.status}</p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="rp-form-footer flex items-center justify-end gap-3 pt-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rp-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rp-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
        >
          {submitting && <Loader2 size={15} className="animate-spin" />}
          {initialData ? "Save Changes" : "Create Role"}
        </button>
      </div>
    </form>
  );
}
