import React, { useEffect, useRef, useState } from "react";
import { Filter, Check, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = ["active", "inactive"];

/**
 * Checkbox-style multi-select filter dropdown (Select all + individual
 * options), matching the pattern of a filter icon button that opens a
 * checklist panel.
 *
 * @param {string[]} selected - currently-checked statuses, e.g. ["active"]
 * @param {(next: string[]) => void} onChange
 */
export default function StatusFilterDropdown({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = selected.length === STATUS_OPTIONS.length;

  const toggleAll = () => {
    onChange(allSelected ? [] : [...STATUS_OPTIONS]);
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
        className="cp-filter-btn inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors"
        title="Filter by status"
      >
        <Filter size={15} />
        <ChevronDown
          size={13}
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div className="cp-filter-dropdown absolute left-0 mt-2 w-52 rounded-xl overflow-hidden z-20 py-1.5">
          <label className="cp-filter-item flex items-center gap-2.5 px-3.5 py-2.5 text-[13.5px] font-medium cursor-pointer">
            <span
              className={`cp-filter-checkbox w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                allSelected ? "cp-filter-checkbox-checked" : ""
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
            Select all
          </label>

          <div className="cp-filter-divider h-px mx-3 my-1" />

          {STATUS_OPTIONS.map((status) => {
            const checked = selected.includes(status);
            return (
              <label
                key={status}
                className="cp-filter-item flex items-center gap-2.5 px-3.5 py-2.5 text-[13.5px] font-medium cursor-pointer capitalize"
              >
                <span
                  className={`cp-filter-checkbox w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                    checked ? "cp-filter-checkbox-checked" : ""
                  }`}
                >
                  {checked && <Check size={12} strokeWidth={3} />}
                </span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={checked}
                  onChange={() => toggleOne(status)}
                />
                {status}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}