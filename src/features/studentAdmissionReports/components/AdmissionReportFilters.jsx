import React, { useState } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  Calendar,
  Layers,
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
  Columns3,
  X,
} from "lucide-react";
import CustomDropdown from "../../../common/components/dropdown/CustomDropdown.jsx";
import CustomDatePicker from "../../../common/components/datepicker/CustomDatePicker.jsx";

const DATE_PRESETS = [
  { label: "All Time", value: "all" },
  { label: "This Month", value: "this_month" },
  { label: "Last 30 Days", value: "last_30_days" },
  { label: "This Academic Year", value: "this_academic_year" },
  { label: "Custom Range", value: "custom" },
];

const ADMISSION_TYPES = [
  { value: "", label: "All Admission Types" },
  { value: "new", label: "New Admission" },
  { value: "transfer", label: "Transfer" },
  { value: "readmission", label: "Readmission" },
];

const FACILITY_OPTIONS = [
  { value: "all", label: "All Facilities" },
  { value: "transport", label: "Transport Required" },
  { value: "hostel", label: "Hostel Required" },
  { value: "both", label: "Both (Transport & Hostel)" },
  { value: "none", label: "Day Scholar (No Facilities)" },
];

const STATUS_PILLS = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active", color: "emerald" },
  { label: "Pending", value: "pending", color: "amber" },
  { label: "Completed", value: "completed", color: "blue" },
  { label: "Transferred", value: "transferred", color: "purple" },
  { label: "Inactive / Dropped", value: "inactive", color: "rose" },
];

export default function AdmissionReportFilters({
  search,
  setSearch,
  selectedSchool,
  setSelectedSchool,
  schoolOptions,
  isAdmin,
  selectedYear,
  setSelectedYear,
  academicYearOptions,
  selectedClass,
  setSelectedClass,
  classOptions,
  selectedSection,
  setSelectedSection,
  sectionOptions,
  admissionType,
  setAdmissionType,
  facilityFilter,
  setFacilityFilter,
  statusFilter,
  setStatusFilter,
  datePreset,
  setDatePreset,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onResetFilters,
  viewMode,
  setViewMode,
  activeFilterCount = 0,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="sar-card rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Top row: Search, View Switcher & Action controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name, admission no, code, phone, guardian..."
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-[13px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* View Mode Toggle & Advanced Filter Switch */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Mode Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-[11.5px] font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setViewMode("combined")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "combined"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Combined View (Charts + Table)"
            >
              <Columns3 size={13} />
              <span className="hidden md:inline">Combined</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Audit Table Only"
            >
              <TableIcon size={13} />
              <span>Roster Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("analytics")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "analytics"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Charts & Insights Only"
            >
              <LayoutGrid size={13} />
              <span>Visual Charts</span>
            </button>
          </div>

          {/* Reset Filters Button */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-800/60 transition-colors"
              title="Clear all filters"
            >
              <RotateCcw size={12} />
              <span>Reset ({activeFilterCount})</span>
            </button>
          )}

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              showAdvanced
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
          >
            <Filter size={13} />
            <span>More Filters</span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${
                showAdvanced ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Primary Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* School Dropdown (Admin only) */}
        {isAdmin && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              School
            </label>
            <CustomDropdown
              className="w-full text-xs"
              options={schoolOptions}
              value={selectedSchool}
              onChange={(val) => {
                setSelectedSchool(val);
                setSelectedClass("");
                setSelectedSection("");
              }}
              placeholder="All Schools"
              searchable={schoolOptions.length > 5}
            />
          </div>
        )}

        {/* Academic Year Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
            Academic Year
          </label>
          <CustomDropdown
            className="w-full text-xs"
            options={academicYearOptions}
            value={selectedYear}
            onChange={(val) => setSelectedYear(val)}
            placeholder="All Academic Years"
          />
        </div>

        {/* Class Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
            Class
          </label>
          <CustomDropdown
            className="w-full text-xs"
            options={classOptions}
            value={selectedClass}
            onChange={(val) => {
              setSelectedClass(val);
              setSelectedSection("");
            }}
            placeholder="All Classes"
            searchable={classOptions.length > 6}
          />
        </div>

        {/* Section Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
            Class Section
          </label>
          <CustomDropdown
            className="w-full text-xs"
            options={sectionOptions}
            value={selectedSection}
            onChange={(val) => setSelectedSection(val)}
            placeholder={
              !selectedClass
                ? "Select Class First"
                : sectionOptions.length <= 1
                ? "All Sections"
                : "Select Section..."
            }
            disabled={!selectedClass}
          />
        </div>

        {/* If Not Admin, show Date Preset in main grid to balance columns */}
        {!isAdmin && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Time Period
            </label>
            <CustomDropdown
              className="w-full text-xs"
              options={DATE_PRESETS}
              value={datePreset}
              onChange={(val) => setDatePreset(val)}
              placeholder="Select Date Range..."
            />
          </div>
        )}
      </div>

      {/* Advanced Filter Collapsible Section */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* If Admin, show Date Preset here */}
            {isAdmin && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Time Period
                </label>
                <CustomDropdown
                  className="w-full text-xs"
                  options={DATE_PRESETS}
                  value={datePreset}
                  onChange={(val) => setDatePreset(val)}
                  placeholder="Select Date Range..."
                />
              </div>
            )}

            {/* Admission Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Admission Type
              </label>
              <CustomDropdown
                className="w-full text-xs"
                options={ADMISSION_TYPES}
                value={admissionType}
                onChange={(val) => setAdmissionType(val)}
                placeholder="All Types"
              />
            </div>

            {/* Facility Requirement */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Facility Opt-In
              </label>
              <CustomDropdown
                className="w-full text-xs"
                options={FACILITY_OPTIONS}
                value={facilityFilter}
                onChange={(val) => setFacilityFilter(val)}
                placeholder="All Facilities"
              />
            </div>
          </div>

          {/* Custom Date Pickers (visible when datePreset === 'custom') */}
          {datePreset === "custom" && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  From Admission Date
                </label>
                <CustomDatePicker
                  value={fromDate}
                  onChange={(val) => setFromDate(val?.target?.value ?? val ?? "")}
                  placeholder="Select start date..."
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  To Admission Date
                </label>
                <CustomDatePicker
                  value={toDate}
                  onChange={(val) => setToDate(val?.target?.value ?? val ?? "")}
                  placeholder="Select end date..."
                  className="w-full text-xs"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Status Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
          Status:
        </span>
        {STATUS_PILLS.map((pill) => {
          const isSelected = statusFilter === pill.value;
          return (
            <button
              key={pill.value}
              type="button"
              onClick={() => setStatusFilter(pill.value)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all text-[11.5px] ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
