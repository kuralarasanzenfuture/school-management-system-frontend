import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const EMPTY = {
  start_date: "",
  end_date: "",
  is_current: false,
  status: "active",
};

/**
 * Add/edit form for a single academic year.
 *
 * NOTE: there is no `name` field — the backend derives it (e.g. "2026-2027")
 * from start_date/end_date, matching the POST payload you're sending
 * (school_id, start_date, end_date[, is_current]). We show a computed
 * preview here purely for the admin's benefit; it is not submitted.
 *
 * @param {object|null} initialData - pass an existing academic year to edit
 * @param {number} schoolId - current school's id, included in the payload
 * @param {(payload) => void} onSubmit
 * @param {() => void} onCancel
 * @param {boolean} submitting
 */
export default function AcademicYearForm({
  initialData = null,
  schoolId,
  onSubmit,
  onCancel,
  submitting,
}) {
  const isEdit = Boolean(initialData?.id);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setData(
      initialData
        ? {
            start_date: initialData.start_date
              ? initialData.start_date.slice(0, 10)
              : "",
            end_date: initialData.end_date
              ? initialData.end_date.slice(0, 10)
              : "",
            is_current: Boolean(initialData.is_current),
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

  const previewName = (() => {
    if (!data.start_date || !data.end_date) return null;
    const startYear = new Date(data.start_date).getFullYear();
    const endYear = new Date(data.end_date).getFullYear();
    if (Number.isNaN(startYear) || Number.isNaN(endYear)) return null;
    return `${startYear}-${endYear}`;
  })();

  const validate = () => {
    const e = {};
    if (!data.start_date) e.start_date = "Start date is required";
    if (!data.end_date) e.end_date = "End date is required";

    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      if (end <= start) {
        e.end_date = "End date must be after start date";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      school_id: schoolId,
      start_date: data.start_date,
      end_date: data.end_date,
      is_current: data.is_current,
      status: data.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="ay-field-label text-[13px] font-medium">
            Start Date <span className="ay-field-required">*</span>
          </label>
          <input
            autoFocus
            type="date"
            className={`ay-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.start_date ? "ay-input-error" : ""}`}
            value={data.start_date}
            onChange={set("start_date")}
          />
          <div className="h-4">
            {errors.start_date && (
              <p className="ay-field-error text-[11px]">{errors.start_date}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="ay-field-label text-[13px] font-medium">
            End Date <span className="ay-field-required">*</span>
          </label>
          <input
            type="date"
            className={`ay-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200 ${errors.end_date ? "ay-input-error" : ""}`}
            value={data.end_date}
            onChange={set("end_date")}
          />
          <div className="h-4">
            {errors.end_date && (
              <p className="ay-field-error text-[11px]">{errors.end_date}</p>
            )}
          </div>
        </div>
      </div>

      {previewName && (
        <div className="ay-preview-name rounded-lg px-3.5 py-2.5 text-[13px]">
          Academic year name will be:{" "}
          <span className="font-semibold">{previewName}</span>
        </div>
      )}

      <label
        className={`ay-checkbox-row flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium cursor-pointer transition-colors ${
          data.is_current ? "ay-checkbox-row-checked" : ""
        }`}
      >
        <input
          type="checkbox"
          className="ay-checkbox w-4 h-4 rounded"
          checked={data.is_current}
          onChange={(e) =>
            setData((d) => ({ ...d, is_current: e.target.checked }))
          }
        />
        Set as the current academic year
      </label>

      <div className="flex flex-col gap-1.5">
        <label className="ay-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setData((d) => ({ ...d, status: s }))}
              className={`ay-status-toggle flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold capitalize transition-colors ${
                data.status === s
                  ? s === "active"
                    ? "ay-status-toggle-active"
                    : "ay-status-toggle-inactive"
                  : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="ay-form-footer flex items-center justify-end gap-3 pt-4 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="ay-btn-cancel text-[13.5px] font-semibold px-4 py-2.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="ay-btn-primary inline-flex items-center gap-2 text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Update Academic Year" : "Create Academic Year"}
        </button>
      </div>
    </form>
  );
}
