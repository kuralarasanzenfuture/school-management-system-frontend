import React from "react";
import {
  handleRestrictedInput,
  toUpperCase,
} from "../../../../common/utils/inputHandlers.js";

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="dp-field-label text-[13px] font-medium">
        {label}
        {required && <span className="dp-field-required ml-0.5">*</span>}
      </label>
      {children}
      <div className="h-4">
        {error && <p className="dp-field-error text-[11px]">{error}</p>}
      </div>
    </div>
  );
}

/**
 * Pure presentational fields for the Add/Edit Department form. All state,
 * validation, and submission logic live in DepartmentModal — this
 * component only reads props and calls the setters it's given.
 *
 * @param {object} formData
 * @param {object} errors
 * @param {boolean} checkingName
 * @param {boolean} isAdmin
 * @param {Array<{id, name}>} schools
 * @param {boolean} schoolsLoading
 * @param {(key: string) => (e) => void} handleChange
 * @param {Function} setFormData - used directly for the Status toggle,
 *   which sets a value rather than reading from an input event
 */
export default function DepartmentForm({
  formData,
  errors,
  checkingName,
  isAdmin,
  schools,
  schoolsLoading,
  handleChange,
  setFormData,
}) {
  const inputClass = (fieldKey) =>
    `dp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] ${errors[fieldKey] ? "dp-input-error" : ""}`;

  return (
    <div className="px-6 py-5 flex flex-col gap-4">
      {isAdmin && (
        <Field label="School" required error={errors.school_id}>
          <select
            className={inputClass("school_id")}
            value={formData.school_id}
            onChange={handleChange("school_id")}
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
        </Field>
      )}

      <Field label="Department Name" required error={errors.name}>
        <input
          className={inputClass("name")}
          placeholder="e.g. Mathematics"
          value={formData.name}
          onChange={handleRestrictedInput(setFormData, "name", toUpperCase)}
          maxLength={100}
        />
        {checkingName && <p className="dp-cell-muted text-[11px]">Checking…</p>}
      </Field>

      <Field label="Description" error={errors.description}>
        <textarea
          rows={3}
          className={inputClass("description")}
          placeholder="Brief description of the department…"
          value={formData.description}
          onChange={handleChange("description")}
          maxLength={255}
        />
        <p className="dp-cell-muted text-[11px] text-right -mt-1">
          {formData.description.length}/255
        </p>
      </Field>

      <div className="flex flex-col gap-1.5">
        <label className="dp-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFormData((d) => ({ ...d, status: s }))}
              className={`dp-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                formData.status === s
                  ? s === "active"
                    ? "dp-status-toggle-active"
                    : "dp-status-toggle-inactive"
                  : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
