import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";
import CustomDatePicker from "../../../../common/components/datepicker/CustomDatePicker.jsx";

const EMPTY = {
  school_id: "",
  start_date: "",
  end_date: "",
  status: "active",
  remarks: "",
};

/**
 * @param {boolean} isAdmin - if true, shows a school dropdown to pick from.
 *                            if false, silently uses `schoolId` prop.
 * @param {number} schoolId - current/only school id for non-admin users.
 */
export default function AcademicYearForm({
  initialData = null,
  schoolId,
  isAdmin = false,
  onSubmit,
  onCancel,
  submitting,
}) {
  const isEdit = Boolean(initialData?.id);
  const dispatch = useDispatch();

  const schools = useSelector((state) => state.schoolProfile?.schools || []);
  const schoolsLoading = useSelector(
    (state) => state.schoolProfile?.loading || false,
  );

  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  // Admin picks from a list — fetch it once.
  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [isAdmin, schools.length, dispatch]);

  useEffect(() => {
    setData(
      initialData
        ? {
            school_id: initialData.school_id ? String(initialData.school_id) : (schoolId ? String(schoolId) : ""),
            start_date: initialData.start_date
              ? initialData.start_date.slice(0, 10)
              : "",
            end_date: initialData.end_date
              ? initialData.end_date.slice(0, 10)
              : "",
            status: initialData.status || "active",
            remarks: initialData.remarks || "",
          }
        : { ...EMPTY, school_id: isAdmin ? "" : (schoolId ? String(schoolId) : "") },
    );
    setErrors({});
  }, [initialData, schoolId, isAdmin]);

  const schoolOptions = useMemo(
    () => schools.map((s) => ({ value: String(s.id), label: s.name })),
    [schools],
  );

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
    if (isAdmin && !data.school_id) e.school_id = "Please select a school";
    if (!data.start_date) e.start_date = "Start date is required";
    if (!data.end_date) e.end_date = "End date is required";

    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      if (end <= start) {
        e.end_date = "End date must be after start date";
      }
    }

    if (data.remarks && data.remarks.length > 255) {
      e.remarks = "Remarks cannot exceed 255 characters";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      school_id: isAdmin ? Number(data.school_id) : Number(schoolId),
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      remarks: data.remarks?.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex flex-col gap-1.5">
          <label className="ay-field-label text-[13px] font-medium">
            School <span className="ay-field-required">*</span>
          </label>
          <CustomDropdown
            options={schoolOptions}
            value={data.school_id}
            onChange={(val) => {
              setData((d) => ({ ...d, school_id: val }));
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
              <p className="ay-field-error text-[11px]">{errors.school_id}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="ay-field-label text-[13px] font-medium">
            Start Date <span className="ay-field-required">*</span>
          </label>
          <CustomDatePicker
            value={data.start_date}
            onChange={set("start_date")}
            hasError={Boolean(errors.start_date)}
            placeholder="Select start date..."
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
          <CustomDatePicker
            value={data.end_date}
            onChange={set("end_date")}
            hasError={Boolean(errors.end_date)}
            placeholder="Select end date..."
            align="right"
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

      <div className="flex flex-col gap-1.5">
        <label className="ay-field-label text-[13px] font-medium">Status</label>
        <div className="flex gap-2">
          {["active", "inactive", "archived"].map((s) => (
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

      <div className="flex flex-col gap-1.5">
        <label className="ay-field-label text-[13px] font-medium">Remarks</label>
        <input
          type="text"
          className="ay-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all duration-200"
          placeholder="Optional notes or remarks (max 255 chars)…"
          value={data.remarks}
          onChange={set("remarks")}
          maxLength={255}
        />
        <div className="h-4">
          {errors.remarks && (
            <p className="ay-field-error text-[11px]">{errors.remarks}</p>
          )}
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
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Saving…
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Add Academic Year"
          )}
        </button>
      </div>
    </form>
  );
}
