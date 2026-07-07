import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Building2, CircleCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addDepartment,
  editDepartment,
  fetchDepartments,
} from "../../../../redux/schoolSetup/department/departmentSlice.js";
import { checkDepartmentExist } from "../../../../redux/schoolSetup/department/departmentService.js";
import { fetchSchools } from "../../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";
import { handleRestrictedInput, toUpperCase } from "../../../../common/utils/inputHandlers.js";

const DEBOUNCE_MS = 500;

const EMPTY = { school_id: "", name: "", description: "", status: "active" };

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

export default function AddDepartmentModal({
  isOpen,
  onClose,
  department = null,
}) {
  const dispatch = useDispatch();
  const isEdit = Boolean(department?.id);

  const [formData, setFormData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkingName, setCheckingName] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));

  // Non-admins only ever belong to one school — use theirs directly.
  // Admins pick a school in the dropdown instead.
  const fixedSchoolId = isAdmin ? null : user?.school_id;

  // Which school the uniqueness check should run against: whatever the
  // admin has picked so far (may be empty), or the non-admin's own school.
  const effectiveSchoolId = isAdmin ? formData.school_id : fixedSchoolId;

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

  /* ── Hydrate on open ── */
  useEffect(() => {
    if (!isOpen) return;
    setFormData(
      isEdit && department
        ? {
            school_id: department.school_id ?? "",
            name: department.name ?? "",
            description: department.description ?? "",
            status: department.status ?? "active",
          }
        : { ...EMPTY, school_id: isAdmin ? "" : (fixedSchoolId ?? "") },
    );
    setErrors({});
    skipNextCheck.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEdit, department]);

  // Backfill school_id for a non-admin creating a new department, in case
  // fixedSchoolId wasn't available yet when the modal first opened
  // (async auth load). Only touches a brand-new record.
  useEffect(() => {
    if (isOpen && !isEdit && !isAdmin && fixedSchoolId) {
      setFormData((d) =>
        d.school_id ? d : { ...d, school_id: fixedSchoolId },
      );
    }
  }, [isOpen, isEdit, isAdmin, fixedSchoolId]);

  /* ── Field setter ── */
  const handleChange = (fieldKey) => (event) => {
    const value = event.target.value;
    setFormData((prevData) => ({
      ...prevData,
      [fieldKey]: value,
      // Changing school invalidates any "name already exists" result,
      // since uniqueness is scoped per school.
      ...(fieldKey === "school_id" ? {} : {}),
    }));
    setErrors((prevErrors) =>
      prevErrors[fieldKey] ? { ...prevErrors, [fieldKey]: null } : prevErrors,
    );
  };

  /* ── Live uniqueness check (debounced, scoped to selected school) ── */
  useEffect(() => {
    if (skipNextCheck.current) {
      skipNextCheck.current = false;
      return;
    }

    const name = formData.name.trim();

    if (!name || !effectiveSchoolId) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }
    if (isEdit && name === department?.name) {
      setErrors((e) => ({ ...e, name: null }));
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingName(true);
      try {
        const result = await checkDepartmentExist(effectiveSchoolId, name);
        // Normalize whatever shape the API returns — a plain boolean, or
        // an object like { exists: true }. Treating any truthy *object*
        // (including { exists: false }) as "exists" is the bug to avoid.
        const exists =
          typeof result === "boolean" ? result : Boolean(result?.exists);
        setErrors((e) => ({
          ...e,
          name: exists ? "This department already exists" : null,
        }));
      } catch {
        // network/server error — don't block the user, just skip the check
      } finally {
        setCheckingName(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.name, effectiveSchoolId]);

  /* ── Validate ── */
  const validate = () => {
    const validationErrors = {};
    if (isAdmin && !formData.school_id)
      validationErrors.school_id = "Please select a school";
    if (!formData.name.trim())
      validationErrors.name = "Department name is required";
    else if (formData.name.trim().length < 2)
      validationErrors.name = "Name must be at least 2 characters";
    else if (formData.name.trim().length > 100)
      validationErrors.name = "Name must not exceed 100 characters";
    if (formData.description && formData.description.length > 255)
      validationErrors.description =
        "Description must not exceed 255 characters";

    // Preserve an "already exists" error surfaced by the live check.
    if (errors.name) validationErrors.name = errors.name;

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (checkingName) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        school_id: isAdmin ? formData.school_id : fixedSchoolId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
      };

      if (isEdit) {
        await dispatch(
          editDepartment({ id: department.id, formData: payload }),
        ).unwrap();
      } else {
        await dispatch(addDepartment(payload)).unwrap();
      }
      dispatch(fetchDepartments());
      onClose();
    } catch (submissionError) {
      alert(submissionError?.message ?? String(submissionError));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (fieldKey) =>
    `dp-input w-full rounded-lg px-3.5 py-2.5 text-[14px] ${errors[fieldKey] ? "dp-input-error" : ""}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="dp-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(clickEvent) => clickEvent.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 32 }}
            transition={{ duration: 0.22 }}
            className="dp-modal w-full max-w-md rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="dp-modal-header flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="dp-icon-primary-bg w-9 h-9 rounded-xl flex items-center justify-center">
                  <Building2 size={18} className="dp-icon-primary" />
                </div>
                <div>
                  <h2 className="dp-modal-title text-[16px] font-bold tracking-tight">
                    {isEdit ? "Edit Department" : "New Department"}
                  </h2>
                  <p className="dp-cell-muted text-[12px]">
                    {isEdit
                      ? "Update department details"
                      : "Add a department to this school"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="dp-close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            {/* Body */}
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
                      {schoolsLoading
                        ? "Loading schools..."
                        : "Select a school"}
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
                  // onChange={handleChange("name")}
                  onChange={handleRestrictedInput(setFormData, "name", toUpperCase)}
                  maxLength={100}
                />
                {checkingName && (
                  <p className="dp-cell-muted text-[11px]">Checking…</p>
                )}
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
                <label className="dp-field-label text-[13px] font-medium">
                  Status
                </label>
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

            {/* Footer */}
            <div className="dp-modal-footer flex items-center justify-end gap-3 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="dp-modal-btn-cancel px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || checkingName}
                onClick={handleSubmit}
                className="dp-modal-btn-submit inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors active:scale-[0.97]"
              >
                <CircleCheck size={15} />
                {submitting
                  ? isEdit
                    ? "Updating…"
                    : "Saving…"
                  : isEdit
                    ? "Update Department"
                    : "Save Department"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
