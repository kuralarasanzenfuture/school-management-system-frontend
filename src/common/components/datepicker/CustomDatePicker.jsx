import React, { useState, useRef, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const WEEKDAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Creates a hybrid value that works both when callers expect:
 * 1) A string: `onChange={(val) => ...}` (via .toString() / .valueOf())
 * 2) An event object: `onChange={(e) => ... e.target.value}`
 */
function createSyntheticDateEvent(dateStr, name, id) {
  if (!dateStr) {
    const empty = new String("");
    empty.target = { name, id, value: "" };
    empty.currentTarget = empty.target;
    return empty;
  }
  const hybrid = new String(dateStr);
  hybrid.target = { name, id, value: dateStr };
  hybrid.currentTarget = hybrid.target;
  return hybrid;
}

/**
 * Reusable, modern CustomDatePicker component
 * Replaces native HTML <input type="date"> with a sleek, polished calendar popover.
 */
export default function CustomDatePicker({
  value = "",
  onChange,
  placeholder = "Select date...",
  displayFormat = "DD-MM-YYYY",
  minDate = null,
  maxDate = null,
  disabled = false,
  hasError = false,
  error = false,
  isClearable = true,
  className = "",
  id = "",
  name = "",
  autoCloseOnSelect = true,
  align = "auto", // "auto" | "left" | "right"
  direction = "down", // "down" | "up" | "auto"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("days"); // "days" | "months" | "years"
  const containerRef = useRef(null);

  // Parse current value
  const parsedValue = useMemo(() => {
    if (!value) return null;
    const d = dayjs(value);
    return d.isValid() ? d : null;
  }, [value]);

  // View state date: tracks which month/year the calendar is displaying
  const [viewDate, setViewDate] = useState(() => {
    return parsedValue || dayjs();
  });

  // Year range start for years grid view (12 years block)
  const yearRangeStart = useMemo(() => {
    const y = viewDate.year();
    return Math.floor(y / 12) * 12;
  }, [viewDate]);

  // Keep viewDate aligned when value changes externally
  useEffect(() => {
    if (parsedValue) {
      setViewDate(parsedValue);
    }
  }, [parsedValue]);

  // Auto-placement calculation (top/bottom, left/right)
  const [placement, setPlacement] = useState({ vertical: "bottom", horizontal: "left" });

  const calculatePlacement = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverHeight = 350;
    const popoverWidth = 284;

    // Find nearest boundary: scrollable parent, modal dialog, or body
    let boundary = containerRef.current.parentElement;
    while (boundary && boundary !== document.body) {
      const style = window.getComputedStyle(boundary);
      if (
        style.overflowY === "auto" ||
        style.overflowY === "scroll" ||
        style.overflowX === "auto" ||
        style.overflowX === "scroll" ||
        style.overflowX === "hidden" ||
        boundary.classList.contains("modal") ||
        boundary.getAttribute("role") === "dialog"
      ) {
        break;
      }
      boundary = boundary.parentElement;
    }
    if (!boundary) boundary = document.body;

    const boundaryRect = boundary.getBoundingClientRect();

    // Check right space
    const maxRight = Math.min(boundaryRect.right - 8, window.innerWidth - 8);
    const minLeft = Math.max(boundaryRect.left + 8, 8);

    const spaceRight = maxRight - rect.left;
    const spaceLeft = rect.right - minLeft;

    const spaceBelow = Math.min(boundaryRect.bottom - rect.bottom, window.innerHeight - rect.bottom);
    const spaceAbove = Math.min(rect.top - boundaryRect.top, rect.top);

    let vertical = "bottom";
    if (direction === "up") {
      vertical = "top";
    } else if (direction === "down") {
      vertical = "bottom";
    } else {
      // "auto": only flip upwards if space below is severely cramped AND full space is available above
      vertical = spaceBelow < 200 && spaceAbove >= popoverHeight + 20 ? "top" : "bottom";
    }

    let horizontal = "left";
    if (align === "right") {
      horizontal = "right";
    } else if (align === "left") {
      horizontal = "left";
    } else {
      // Auto detection:
      // If trigger is past mid-width of parent OR not enough space to the right, align right
      const parentMid = boundaryRect.left + boundaryRect.width / 2;
      const isPastMid = rect.left > parentMid;

      if (spaceRight < popoverWidth + 12 || (isPastMid && spaceLeft >= popoverWidth)) {
        horizontal = "right";
      } else {
        horizontal = "left";
      }
    }

    setPlacement({ vertical, horizontal });
  };

  useEffect(() => {
    if (isOpen) {
      calculatePlacement();
    }
  }, [isOpen, align, direction]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setViewMode("days");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setViewMode("days");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Trigger change handler
  const triggerChange = (dateStr) => {
    if (!onChange || disabled) return;
    const event = createSyntheticDateEvent(dateStr, name, id);
    onChange(event, { target: { name, id, value: dateStr } });
  };

  const handleSelectDay = (dayObj) => {
    const isoString = dayObj.format("YYYY-MM-DD");
    triggerChange(isoString);
    if (autoCloseOnSelect) {
      setIsOpen(false);
      setViewMode("days");
    }
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    triggerChange("");
  };

  const handleToday = () => {
    const today = dayjs();
    setViewDate(today);
    triggerChange(today.format("YYYY-MM-DD"));
    if (autoCloseOnSelect) {
      setIsOpen(false);
      setViewMode("days");
    }
  };

  // Navigations
  const prevMonth = (e) => {
    e.stopPropagation();
    setViewDate((prev) => prev.subtract(1, "month"));
  };
  const nextMonth = (e) => {
    e.stopPropagation();
    setViewDate((prev) => prev.add(1, "month"));
  };

  // Generate 42 days grid (6 weeks)
  const calendarDays = useMemo(() => {
    const startOfMonth = viewDate.startOf("month");
    const endOfMonth = viewDate.endOf("month");
    const startDayOfWeek = startOfMonth.day(); // 0 = Sunday
    const daysInMonth = viewDate.daysInMonth();

    const days = [];

    // Trailing days from previous month
    const prevMonthDate = viewDate.subtract(1, "month");
    const prevMonthDaysCount = prevMonthDate.daysInMonth();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDate.date(prevMonthDaysCount - i),
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: viewDate.date(d),
        isCurrentMonth: true,
      });
    }

    // Leading days of next month to complete 42 cells (6 rows)
    const remaining = 42 - days.length;
    const nextMonthDate = viewDate.add(1, "month");
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: nextMonthDate.date(d),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewDate]);

  const today = dayjs();
  const minDay = minDate ? dayjs(minDate) : null;
  const maxDay = maxDate ? dayjs(maxDate) : null;

  const isDayDisabled = (d) => {
    if (minDay && d.isBefore(minDay, "day")) return true;
    if (maxDay && d.isAfter(maxDay, "day")) return true;
    return false;
  };

  const isErrorState = Boolean(hasError || error);

  return (
    <div ref={containerRef} className={`relative ${className ? className : "w-full"}`}>
      {/* Input Trigger Button */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full h-[42px] px-3.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all select-none ${
          disabled
            ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
            : isErrorState
            ? "bg-white dark:bg-slate-800 border-rose-400 dark:border-rose-500/80 text-slate-900 dark:text-white hover:border-rose-500 cursor-pointer shadow-xs focus:ring-2 focus:ring-rose-500/20"
            : isOpen
            ? "bg-white dark:bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/20 text-slate-900 dark:text-white cursor-pointer shadow-xs"
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer shadow-xs"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <CalendarIcon
            size={16}
            className={`shrink-0 transition-colors ${
              disabled
                ? "text-slate-400"
                : isOpen
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          />
          <span
            className={`text-[13px] truncate ${
              parsedValue
                ? "font-medium text-slate-800 dark:text-slate-100"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {parsedValue ? parsedValue.format(displayFormat) : placeholder}
          </span>
        </div>

        {/* Clear Button & Action indicator */}
        <div className="flex items-center gap-1 shrink-0">
          {parsedValue && isClearable && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
              title="Clear date"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Popover Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: placement.vertical === "top" ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement.vertical === "top" ? -4 : 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={`absolute z-[1300] w-[280px] p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 select-none backdrop-blur-md ${
              placement.vertical === "top" ? "bottom-full mb-2" : "top-full mt-2"
            } ${placement.horizontal === "right" ? "right-0" : "left-0"}`}
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
              {/* Prev Month Navigation */}
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Previous month"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Month / Year Clickable Selector */}
              <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-slate-800 dark:text-slate-100">
                <button
                  type="button"
                  onClick={() => setViewMode((m) => (m === "months" ? "days" : "months"))}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    viewMode === "months"
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {viewDate.format("MMMM")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode((m) => (m === "years" ? "days" : "years"))}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    viewMode === "years"
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {viewDate.format("YYYY")}
                </button>
              </div>

              {/* Next Month Navigation */}
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View Mode: Days View */}
            {viewMode === "days" && (
              <div>
                {/* Weekdays Header */}
                <div className="grid grid-cols-7 mb-1 text-center">
                  {WEEKDAYS_SHORT.map((day) => (
                    <span
                      key={day}
                      className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-0.5"
                    >
                      {day}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                    const isSelected = parsedValue && date.isSame(parsedValue, "day");
                    const isToday = date.isSame(today, "day");
                    const disabledDay = isDayDisabled(date);

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={disabledDay}
                        onClick={() => handleSelectDay(date)}
                        className={`h-8 w-8 mx-auto rounded-lg flex flex-col items-center justify-center text-[12px] font-medium transition-all relative ${
                          isSelected
                            ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30 active:scale-95 z-10"
                            : disabledDay
                            ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                            : isCurrentMonth
                            ? isToday
                              ? "text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                              : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            : "text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-[11px]"
                        }`}
                      >
                        <span>{date.date()}</span>
                        {isToday && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 absolute bottom-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View Mode: Months View */}
            {viewMode === "months" && (
              <div className="grid grid-cols-3 gap-2 py-2">
                {MONTHS_SHORT.map((mName, mIdx) => {
                  const isCurrent = viewDate.month() === mIdx;
                  return (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => {
                        setViewDate((prev) => prev.set("month", mIdx));
                        setViewMode("days");
                      }}
                      className={`py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                        isCurrent
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* View Mode: Years View */}
            {viewMode === "years" && (
              <div>
                <div className="flex items-center justify-between px-1 mb-2 text-[12px] text-slate-400 font-medium">
                  <span>
                    {yearRangeStart} - {yearRangeStart + 11}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewDate((prev) => prev.subtract(12, "year"))}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      title="Previous 12 years"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewDate((prev) => prev.add(12, "year"))}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      title="Next 12 years"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const y = yearRangeStart + i;
                    const isSelectedYear = viewDate.year() === y;
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          setViewDate((prev) => prev.set("year", y));
                          setViewMode("days");
                        }}
                        className={`py-2 rounded-xl text-[13px] font-semibold transition-all ${
                          isSelectedYear
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer Toolbar */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-[12px]">
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-semibold transition-colors"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
