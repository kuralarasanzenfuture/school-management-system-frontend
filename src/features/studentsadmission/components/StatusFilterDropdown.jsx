import React, { useEffect, useRef, useState } from "react";
import { Filter, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "active", label: "Active", dotColor: "bg-emerald-500", badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" },
  { value: "inactive", label: "Inactive", dotColor: "bg-rose-500", badgeBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300" },
  { value: "pending", label: "Pending", dotColor: "bg-amber-500", badgeBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300" },
  { value: "completed", label: "Completed", dotColor: "bg-blue-500", badgeBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" },
];

export default function StatusFilterDropdown({ selected = ["active", "inactive"], onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allValues = STATUS_OPTIONS.map((s) => s.value);
  const allSelected = allValues.every((val) => selected.includes(val));
  const isPartiallyFiltered = selected.length > 0 && selected.length < allValues.length;

  const toggleAll = () => {
    onChange(allSelected ? [] : [...allValues]);
  };

  const toggleOne = (status) => {
    onChange(
      selected.includes(status)
        ? selected.filter((s) => s !== status)
        : [...selected, status],
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`h-[40px] px-3.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs inline-flex items-center gap-2 font-medium text-[13px] transition-all cursor-pointer ${
          open
            ? "border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-600 dark:text-indigo-400"
            : isPartiallyFiltered
            ? "border-indigo-400 dark:border-indigo-600 text-indigo-600 dark:text-indigo-300 bg-indigo-50/30 dark:bg-indigo-950/20"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
        title="Filter by status"
      >
        <Filter size={15} className={isPartiallyFiltered ? "text-indigo-500" : "text-slate-500 dark:text-slate-400"} />
        <span className="hidden sm:inline">Status</span>
        {isPartiallyFiltered && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
        )}
        <ChevronDown
          size={13}
          className={`text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-indigo-500" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-50 p-1.5"
          >
            {/* Header / Select All */}
            <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer select-none transition-colors">
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  allSelected
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                }`}
              >
                {allSelected && <Check size={12} strokeWidth={3} />}
              </span>
              <input
                type="checkbox"
                className="hidden"
                checked={allSelected}
                onChange={toggleAll}
              />
              <span>Select all statuses</span>
            </label>

            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2" />

            {/* Individual Statuses */}
            <div className="flex flex-col gap-0.5">
              {STATUS_OPTIONS.map((item) => {
                const checked = selected.includes(item.value);
                return (
                  <label
                    key={item.value}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          checked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        }`}
                      >
                        {checked && <Check size={12} strokeWidth={3} />}
                      </span>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={checked}
                        onChange={() => toggleOne(item.value)}
                      />
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.dotColor} shrink-0`} />
                        <span>{item.label}</span>
                      </span>
                    </div>

                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${item.badgeBg}`}>
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}