import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Tag,
  Sun,
  Search,
  ChevronDown,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import "../styles/RoleFilterToolbar.css";

/**
 * RoleFilterToolbar — Tailwind UI-inspired Filter Toolbar for Role Management
 *
 * Provides:
 * - Quick switch toggle for "System Only"
 * - "Date" (Sort) dropdown with checkmark
 * - "Tags" (Role Type) dropdown with checkmark
 * - "Status" dropdown with checkmark
 * - Contextual search input with clear button
 * - Quick reset button for active filters
 */
export default function RoleFilterToolbar({
  searchTerm = "",
  onSearchChange = () => {},
  statusFilter = "all",
  onStatusChange = () => {},
  typeFilter = "all",
  onTypeChange = () => {},
  sortBy = "id",
  sortOrder = "ASC",
  onSortChange = () => {},
  onClearFilters = () => {},
  hasActiveFilters = false,
}) {
  const [openDropdown, setOpenDropdown] = useState(null); // 'date' | 'type' | 'status' | null
  const toolbarRef = useRef(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpenDropdown(null);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDropdown = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  // Sort Options
  const sortOptions = [
    { label: "Newest First", col: "created_at", dir: "DESC" },
    { label: "Oldest First", col: "created_at", dir: "ASC" },
    { label: "Name: A → Z", col: "name", dir: "ASC" },
    { label: "Name: Z → A", col: "name", dir: "DESC" },
    { label: "Role Code: A → Z", col: "role_code", dir: "ASC" },
    { label: "Role Code: Z → A", col: "role_code", dir: "DESC" },
    { label: "Default (ID)", col: "id", dir: "ASC" },
  ];

  // Type Options
  const typeOptions = [
    { label: "All Types", value: "all" },
    { label: "System Roles", value: "system" },
    { label: "Custom Roles", value: "custom" },
  ];

  // Status Options
  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const isSortActive = sortBy !== "id" || sortOrder !== "ASC";
  const isTypeActive = typeFilter !== "all";
  const isStatusActive = statusFilter !== "all";
  const isSystemOnly = typeFilter === "system";

  return (
    <div ref={toolbarRef} className="role-filter-toolbar">
      {/* ── 1. Quick Switch Toggle: System Only ── */}
      <button
        type="button"
        onClick={() => onTypeChange(isSystemOnly ? "all" : "system")}
        className={`role-filter-pill ${isSystemOnly ? "role-filter-pill-active" : ""}`}
        title="Toggle System Roles Only"
      >
        <span
          className={`role-filter-switch-track ${
            isSystemOnly ? "role-filter-switch-active" : ""
          }`}
        >
          <span
            className={`role-filter-switch-thumb ${
              isSystemOnly ? "role-filter-switch-thumb-active" : ""
            }`}
          />
        </span>
        <span>System Only</span>
      </button>

      {/* ── 2. Date / Sort Filter Pill ── */}
      <div className="role-filter-dropdown-wrapper">
        <button
          type="button"
          onClick={() => toggleDropdown("date")}
          className={`role-filter-pill ${isSortActive ? "role-filter-pill-active" : ""} ${
            openDropdown === "date" ? "role-filter-pill-open" : ""
          }`}
          title="Filter / Sort by Date or Name"
        >
          <Calendar size={15} className="role-filter-pill-icon" />
          <span>Date</span>
          <ChevronDown
            size={14}
            className={`role-filter-chevron ${
              openDropdown === "date" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openDropdown === "date" && (
          <div className="role-filter-menu animate-in">
            <div className="role-filter-menu-header">FILTER BY DATE</div>
            {sortOptions.map((opt) => {
              const isSelected = sortBy === opt.col && sortOrder === opt.dir;
              return (
                <button
                  key={`${opt.col}:${opt.dir}`}
                  type="button"
                  onClick={() => {
                    onSortChange(opt.col, opt.dir);
                    setOpenDropdown(null);
                  }}
                  className={`role-filter-menu-item ${
                    isSelected ? "role-filter-menu-active" : ""
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} className="role-filter-check" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 3. Tags / Type Filter Pill ── */}
      <div className="role-filter-dropdown-wrapper">
        <button
          type="button"
          onClick={() => toggleDropdown("type")}
          className={`role-filter-pill ${isTypeActive ? "role-filter-pill-active" : ""} ${
            openDropdown === "type" ? "role-filter-pill-open" : ""
          }`}
          title="Filter by Role Type"
        >
          <Tag size={15} className="role-filter-pill-icon" />
          <span>Tags</span>
          <ChevronDown
            size={14}
            className={`role-filter-chevron ${
              openDropdown === "type" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openDropdown === "type" && (
          <div className="role-filter-menu animate-in">
            <div className="role-filter-menu-header">FILTER BY TYPE</div>
            {typeOptions.map((opt) => {
              const isSelected = typeFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onTypeChange(opt.value);
                    setOpenDropdown(null);
                  }}
                  className={`role-filter-menu-item ${
                    isSelected ? "role-filter-menu-active" : ""
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} className="role-filter-check" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 4. Status Filter Pill ── */}
      <div className="role-filter-dropdown-wrapper">
        <button
          type="button"
          onClick={() => toggleDropdown("status")}
          className={`role-filter-pill ${isStatusActive ? "role-filter-pill-active" : ""} ${
            openDropdown === "status" ? "role-filter-pill-open" : ""
          }`}
          title="Filter by Status"
        >
          <Sun size={15} className="role-filter-pill-icon" />
          <span>Status</span>
          <ChevronDown
            size={14}
            className={`role-filter-chevron ${
              openDropdown === "status" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openDropdown === "status" && (
          <div className="role-filter-menu animate-in">
            <div className="role-filter-menu-header">FILTER BY STATUS</div>
            {statusOptions.map((opt) => {
              const isSelected = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onStatusChange(opt.value);
                    setOpenDropdown(null);
                  }}
                  className={`role-filter-menu-item ${
                    isSelected ? "role-filter-menu-active" : ""
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} className="role-filter-check" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 5. Search Pill ── */}
      <div className="role-filter-search-wrap">
        <Search size={15} className="role-filter-search-icon" />
        <input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search roles by name or code…"
          className="role-filter-search"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="role-filter-search-clear"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── 6. Clear / Reset Button ── */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="role-filter-reset"
          title="Reset all filters"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
