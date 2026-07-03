import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Building2, CircleCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  addDepartment,
  editDepartment,
} from "../../../../redux/schoolSetup/department/departmentSlice.js";


const INIT = { school_id: 1, name: "", description: "" };

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

  const [formData, setFormData] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* ── Hydrate on open ── */
  useEffect(() => {
    if (!isOpen) return;
    setFormData(
      isEdit && department
        ? {
            school_id: department.school_id ?? 1,
            name: department.name ?? "",
            description: department.description ?? "",
          }
        : INIT,
    );
    setErrors({});
  }, [isOpen, isEdit, department]);

  /* ── Field setter ── */
  const handleChange = (fieldKey) => (event) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldKey]: event.target.value,
    }));
    setErrors((prevErrors) =>
      prevErrors[fieldKey] ? { ...prevErrors, [fieldKey]: null } : prevErrors,
    );
  };

  /* ── Validate ── */
  const validate = () => {
    const validationErrors = {};
    if (!formData.name.trim())
      validationErrors.name = "Department name is required";
    else if (formData.name.trim().length < 2)
      validationErrors.name = "Name must be at least 2 characters";
    else if (formData.name.trim().length > 100)
      validationErrors.name = "Name must not exceed 100 characters";
    if (formData.description && formData.description.length > 255)
      validationErrors.description =
        "Description must not exceed 255 characters";
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await dispatch(
          editDepartment({ id: department.id, formData }),
        ).unwrap();
      } else {
        await dispatch(addDepartment(formData)).unwrap();
      }
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
              <Field label="Department Name" required error={errors.name}>
                <input
                  className={inputClass("name")}
                  placeholder="e.g. Mathematics"
                  value={formData.name}
                  onChange={handleChange("name")}
                  maxLength={100}
                />
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
                disabled={submitting}
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
