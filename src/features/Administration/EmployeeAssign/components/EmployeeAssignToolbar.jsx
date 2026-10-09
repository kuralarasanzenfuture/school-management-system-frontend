import React from "react";
import { Search, X, School, Link2 } from "lucide-react";
import CustomDropdown from "../../../../common/components/dropdown/CustomDropdown.jsx";

/**
 * Filter toolbar for Employee User Assignment
 * Supports:
 * - Search by employee name, code, email, mobile
 * - Assignment status filter (All / Assigned / Unassigned)
 * - School filter (supports Super Admin and all available schools)
 */
export default function EmployeeAssignToolbar({
  search,
  onSearchChange,
  assignmentFilter,
  onAssignmentFilterChange,
  selectedSchool,
  onSchoolChange,
  schools = [],
  schoolsLoading = false,
  isAdmin = false,
  totalCount = 0,
}) {
  const assignmentOptions = [
    { value: "", label: "All Employees" },
    { value: "assigned", label: "Linked / Assigned" },
    { value: "unassigned", label: "Unlinked / Not Assigned" },
  ];

  const schoolOptions = [
    { value: "", label: "All Schools" },
    ...schools.map((s) => ({
      value: String(s.id ?? s.school_id ?? ""),
      label: s.name || s.school_name || `School #${s.id ?? s.school_id}`,
    })),
  ];

  return (
    <div className="ea-toolbar flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-5 shadow-sm border border-border/60">
      {/* Search Input */}
      <div className="ea-search-wrap">
        <Search size={15} className="ea-search-icon" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, code, phone, email…"
          className="ea-search-input"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="ea-search-clear"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Assignment Status Filter (CustomDropdown) */}
      <CustomDropdown
        options={assignmentOptions}
        value={assignmentFilter}
        onChange={onAssignmentFilterChange}
        placeholder="All Employees"
        leadingIcon={<Link2 size={14} />}
        className="min-w-[170px]"
      />

      {/* School Filter (CustomDropdown) — shown whenever schools exist or user is admin */}
      {(isAdmin || schools.length > 0) && (
        <CustomDropdown
          options={schoolOptions}
          value={selectedSchool}
          onChange={onSchoolChange}
          placeholder={schoolsLoading ? "Loading schools…" : "All Schools"}
          searchable={schools.length > 5}
          searchPlaceholder="Search schools…"
          disabled={schoolsLoading}
          leadingIcon={<School size={14} />}
          className="min-w-[210px]"
        />
      )}

      {/* Total Employee Count */}
      <span className="ea-count-text text-[12.5px] ml-auto text-muted-foreground font-medium">
        {totalCount} employee{totalCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}
