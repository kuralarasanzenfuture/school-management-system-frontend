import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Calendar,
  ArrowUpDown,
  Hash,
} from "lucide-react";
import dayjs from "dayjs";
import CustomDropdown from "../../../common/components/dropdown/CustomDropdown.jsx";
import CustomDatePicker from "../../../common/components/datepicker/CustomDatePicker.jsx";
import {
  AUDIT_ACTIONS,
  AUDIT_MODULES,
  AUDIT_ENTITIES,
  AUDIT_STATUSES,
  SORT_OPTIONS,
  DATE_PRESETS,
} from "../constants/auditConstants.js";

export default function AuditLogFilters({
  filters,
  onChange,
  onReset,
  totalRecords = 0,
  schools = [],
  isAdmin = false,
}) {
  const [showMore, setShowMore] = useState(false);

  // Active filters count (excluding default page/limit/sortBy)
  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.action) count++;
    if (filters.module) count++;
    if (filters.entity_type) count++;
    if (filters.status) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.school_id) count++;
    if (filters.entity_id) count++;
    return count;
  }, [filters]);

  const actionOptions = useMemo(() => [
    { value: "", label: "All Actions" },
    ...AUDIT_ACTIONS.map((a) => ({ value: a.value, label: a.label })),
  ], []);

  const moduleOptions = useMemo(() => [
    { value: "", label: "All Modules" },
    ...AUDIT_MODULES.map((m) => ({ value: m.value, label: m.label })),
  ], []);

  const entityTypeOptions = useMemo(() => [
    { value: "", label: "All Entity Types" },
    ...AUDIT_ENTITIES.map((e) => ({ value: e.value, label: e.label })),
  ], []);

  const statusOptions = useMemo(() => [
    { value: "", label: "All Statuses" },
    ...AUDIT_STATUSES.map((s) => ({ value: s.value, label: s.label })),
  ], []);

  const schoolOptions = useMemo(() => [
    { value: "", label: "All Schools" },
    ...schools.map((s) => ({
      value: String(s.id || s._id),
      label: s.name || s.school_name || `School #${s.id}`,
    })),
  ], [schools]);

  const currentSort = `${filters.sortBy || "created_at"}:${filters.sortOrder || "DESC"}`;

  const handleDatePreset = (key) => {
    const now = dayjs();
    let startDate = "";
    let endDate = "";

    if (key === "today") {
      startDate = now.format("YYYY-MM-DD");
      endDate = now.format("YYYY-MM-DD");
    } else if (key === "yesterday") {
      startDate = now.subtract(1, "day").format("YYYY-MM-DD");
      endDate = now.subtract(1, "day").format("YYYY-MM-DD");
    } else if (key === "last7") {
      startDate = now.subtract(7, "day").format("YYYY-MM-DD");
      endDate = now.format("YYYY-MM-DD");
    } else if (key === "last30") {
      startDate = now.subtract(30, "day").format("YYYY-MM-DD");
      endDate = now.format("YYYY-MM-DD");
    } else if (key === "thisMonth") {
      startDate = now.startOf("month").format("YYYY-MM-DD");
      endDate = now.endOf("month").format("YYYY-MM-DD");
    }

    onChange({ startDate, endDate, page: 1 });
  };

  return (
    <div className="al-toolbar rounded-2xl px-4 py-3.5 mb-5 space-y-3">
      {/* ── Main Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            placeholder="Search activity, description, user…"
            className="al-search-input w-full rounded-xl pl-9 pr-8 py-2 text-[13.5px] transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ search: "", page: 1 })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Filter */}
        <CustomDropdown
          options={actionOptions}
          value={filters.action || ""}
          onChange={(val) => onChange({ action: val, page: 1 })}
          placeholder="All Actions"
          searchable
          className="min-w-[145px]"
        />

        {/* Module Filter */}
        <CustomDropdown
          options={moduleOptions}
          value={filters.module || ""}
          onChange={(val) => onChange({ module: val, page: 1 })}
          placeholder="All Modules"
          searchable
          className="min-w-[150px]"
        />

        {/* Entity Type Filter */}
        <CustomDropdown
          options={entityTypeOptions}
          value={filters.entity_type || ""}
          onChange={(val) => onChange({ entity_type: val, page: 1 })}
          placeholder="All Entities"
          searchable
          className="min-w-[145px]"
        />

        {/* Status Filter */}
        <CustomDropdown
          options={statusOptions}
          value={filters.status || ""}
          onChange={(val) => onChange({ status: val, page: 1 })}
          placeholder="All Statuses"
          className="min-w-[130px]"
        />

        {/* School Filter (if Admin) */}
        {isAdmin && schools.length > 0 && (
          <CustomDropdown
            options={schoolOptions}
            value={filters.school_id || ""}
            onChange={(val) => onChange({ school_id: val, page: 1 })}
            placeholder="All Schools"
            searchable
            className="min-w-[150px]"
          />
        )}

        {/* More Filters Toggle */}
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium border transition-colors ${showMore || filters.startDate || filters.endDate || filters.entity_id
              ? "border-indigo-500/40 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
              : "al-btn-outline"
            }`}
        >
          <SlidersHorizontal size={14} />
          <span>More Filters</span>
          {(filters.startDate || filters.endDate || filters.entity_id) && (
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
          )}
        </button>

        {/* Reset Filter Button */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}

        {/* Total Count Display */}
        <div className="ml-auto text-xs text-slate-400 font-medium whitespace-nowrap">
          {totalRecords.toLocaleString()} {totalRecords === 1 ? "log" : "logs"}
        </div>
      </div>

      {/* ── Expandable Secondary Filters ── */}
      {showMore && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-150">
          {/* Start Date */}
          <div>
            <label className="block text-[11.5px] font-medium text-slate-500 mb-1">
              From Date
            </label>
            <CustomDatePicker
              value={filters.startDate || ""}
              onChange={(val) => onChange({ startDate: val ? String(val) : "", page: 1 })}
              placeholder="Select start date"
              displayFormat="DD-MM-YYYY"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11.5px] font-medium text-slate-500 mb-1">
              To Date
            </label>
            <CustomDatePicker
              value={filters.endDate || ""}
              onChange={(val) => onChange({ endDate: val ? String(val) : "", page: 1 })}
              placeholder="Select end date"
              displayFormat="DD-MM-YYYY"
            />
          </div>

          {/* Entity ID */}
          <div>
            <label className="block text-[11.5px] font-medium text-slate-500 mb-1">
              Specific Record ID
            </label>
            <div className="relative">
              <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filters.entity_id || ""}
                onChange={(e) => onChange({ entity_id: e.target.value.trim(), page: 1 })}
                placeholder="e.g. 104"
                className="al-search-input w-full rounded-xl pl-8 pr-3 py-2 text-[13px]"
              />
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[11.5px] font-medium text-slate-500 mb-1">
              Sort By
            </label>
            <CustomDropdown
              options={SORT_OPTIONS}
              value={currentSort}
              onChange={(val) => {
                if (!val) return;
                const [sortBy, sortOrder] = val.split(":");
                onChange({ sortBy, sortOrder, page: 1 });
              }}
              leadingIcon={<ArrowUpDown size={14} className="text-slate-400" />}
            />
          </div>

          {/* Date Presets Row */}
          <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-1.5 pt-1 overflow-x-auto">
            <span className="text-[11.5px] text-slate-400 font-medium flex items-center gap-1 mr-1">
              <Calendar size={13} /> Quick dates:
            </span>
            {DATE_PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => handleDatePreset(p.key)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Active Filter Tags ── */}
      {activeCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-slate-500">
          <span>Active:</span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Query: &ldquo;{filters.search}&rdquo;
              <button onClick={() => onChange({ search: "", page: 1 })} className="hover:text-rose-500">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.action && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Action: {filters.action}
              <button onClick={() => onChange({ action: "", page: 1 })} className="hover:text-rose-500">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.module && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Module: {filters.module}
              <button onClick={() => onChange({ module: "", page: 1 })} className="hover:text-rose-500">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.entity_type && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Entity: {filters.entity_type}
              <button onClick={() => onChange({ entity_type: "", page: 1 })} className="hover:text-rose-500">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Status: {filters.status}
              <button onClick={() => onChange({ status: "", page: 1 })} className="hover:text-rose-500">
                <X size={12} />
              </button>
            </span>
          )}
          {(filters.startDate || filters.endDate) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Date: {filters.startDate || "start"} → {filters.endDate || "now"}
              <button onClick={() => onChange({ startDate: "", endDate: "", page: 1 })} className="hover:text-rose-500">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.entity_id && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              ID: #{filters.entity_id}
              <button onClick={() => onChange({ entity_id: "", page: 1 })} className="hover:text-rose-500">
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
