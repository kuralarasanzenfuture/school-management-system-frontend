import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, CheckCircle2, Trash2, X } from "lucide-react";

const CONFIRM_KEYWORD = "DELETE";

export default function DeleteSectionAllocationModal({
  isOpen,
  onClose,
  onConfirm,
  allocation = null,
  deleting = false,
}) {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef(null);

  const isConfirmed = confirmText.trim().toUpperCase() === CONFIRM_KEYWORD;

  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const studentName =
    `${allocation?.first_name || ""} ${allocation?.last_name || ""}`.trim() ||
    `Student #${allocation?.student_id}`;
  const sectionName = allocation?.section_name || allocation?.section || "—";
  const className = allocation?.class_name || "—";

  return createPortal(
    <AnimatePresence>
      {isOpen && allocation && (
        <motion.div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Trash2 size={16} />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-bold text-slate-900 dark:text-white leading-tight">
                    Delete Section Allocation
                  </h3>
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                    Irreversible action
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={deleting}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
              {/* Record Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-1.5 text-left">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Target Student Allocation
                </div>
                <div className="text-[14.5px] font-bold text-slate-900 dark:text-white truncate">
                  {studentName}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[12px] text-slate-600 dark:text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
                    {className} - Section {sectionName}
                  </span>
                  {allocation?.roll_no && (
                    <span className="text-slate-400 dark:text-slate-500 text-[11.5px]">
                      • Roll #{allocation.roll_no}
                    </span>
                  )}
                </div>
              </div>

              {/* Warning Text */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[12.5px] leading-relaxed">
                <AlertTriangle size={17} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  This action <strong>cannot be undone</strong>. The student will be de-allocated from this section.
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
                    onChange={(e) => setConfirmText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isConfirmed && !deleting) {
                        e.preventDefault();
                        onConfirm();
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
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
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
                onClick={onConfirm}
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
                    <span>Delete Allocation</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
