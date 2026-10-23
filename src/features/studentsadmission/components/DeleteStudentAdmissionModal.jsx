import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X, AlertCircle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteStudentAdmissionThunk } from "../../../redux/studentsAdmission/studentAdmissionSlice.js";
import "../styles/StudentAdmission.css";

const CONFIRM_KEYWORD = "DELETE";

export default function DeleteStudentAdmissionModal({
  isOpen,
  onClose,
  admission,
  studentName,
}) {
  const dispatch = useDispatch();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const isConfirmed = confirmText.trim().toUpperCase() === CONFIRM_KEYWORD;

  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      setError(null);
      setDeleting(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!admission?.id || !isConfirmed || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await dispatch(deleteStudentAdmissionThunk(admission.id)).unwrap();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (typeof err === "string" ? err : "Failed to delete student admission record.");
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const displayName =
    studentName ||
    `${admission?.first_name || ""} ${admission?.last_name || ""}`.trim() ||
    `Student #${admission?.student_id || ""}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="sa-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.2 }}
            className="sa-modal-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="sa-modal-header flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Trash2 size={16} />
                </div>
                <div>
                  <h2 className="sa-modal-title text-[15.5px] font-bold text-slate-900 dark:text-white leading-tight">
                    Delete Admission
                  </h2>
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                    Irreversible action
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={deleting}
                className="sa-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {/* Record Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-1.5 text-left">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Target Student
                </div>
                <div className="text-[14.5px] font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[12px] text-slate-600 dark:text-slate-300">
                  {admission?.admission_number && (
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-medium">
                      {admission.admission_number}
                    </span>
                  )}
                  {admission?.class_name && (
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
                      {admission.class_name}
                      {admission.section ? ` (${admission.section})` : ""}
                    </span>
                  )}
                  {admission?.academic_year_name && (
                    <span className="text-slate-400 dark:text-slate-500 text-[11.5px]">
                      • {admission.academic_year_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Warning Text */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[12.5px] leading-relaxed">
                <ShieldAlert size={17} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  This action <strong>cannot be undone</strong>. This will permanently delete the admission enrollment record and associated data.
                </div>
              </div>

              {/* Type to Confirm Field */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[12.5px] font-medium text-slate-700 dark:text-slate-300">
                  To confirm deletion, type{" "}
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/60 select-all">
                    {CONFIRM_KEYWORD}
                  </span>{" "}
                  below:
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={confirmText}
                    onChange={(e) => {
                      setConfirmText(e.target.value);
                      if (error) setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isConfirmed && !deleting) {
                        e.preventDefault();
                        handleDelete();
                      }
                    }}
                    placeholder={`Type "${CONFIRM_KEYWORD}" to proceed`}
                    disabled={deleting}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-[13.5px] font-medium transition-all outline-none ${
                      isConfirmed
                        ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    }`}
                  />
                  {isConfirmed && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11.5px] font-semibold animate-in fade-in duration-150">
                      <CheckCircle2 size={15} /> Confirmed
                    </span>
                  )}
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-[12.5px] font-medium flex items-start gap-2.5 text-left leading-normal animate-in fade-in duration-200">
                  <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">{error}</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sa-form-footer flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={onClose}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-[13px] font-semibold border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isConfirmed || deleting}
                onClick={handleDelete}
                className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-2 ${
                  isConfirmed && !deleting
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 active:scale-[0.98] cursor-pointer"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                }`}
              >
                {deleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}