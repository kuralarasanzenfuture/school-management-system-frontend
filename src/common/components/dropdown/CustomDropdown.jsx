import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import "./CustomDropdown.css";

/**
 * Reusable CustomDropdown component
 */
export default function CustomDropdown({
  options = [],
  value = "",
  onChange,
  placeholder = "Select option",
  searchable = false,
  searchPlaceholder = "Search…",
  disabled = false,
  hasError = false,
  className = "",
  menuClassName = "",
  leadingIcon = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value));
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) =>
      String(opt.label || "").toLowerCase().includes(q),
    );
  }, [options, searchable, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    setSearchQuery("");
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div
      ref={dropdownRef}
      className={`custom-dropdown-root ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`custom-dropdown-trigger ${isOpen ? "open" : ""} ${
          hasError ? "error" : ""
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {leadingIcon && (
            <span className="shrink-0 text-muted-foreground">{leadingIcon}</span>
          )}
          <span
            className={`truncate ${
              selectedOption ? "text-foreground font-medium" : "text-muted-foreground"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          size={15}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`custom-dropdown-menu animate-in fade-in-50 zoom-in-95 ${menuClassName}`}
        >
          {searchable && options.length > 5 && (
            <div className="px-2 pb-1.5 mb-1 border-b border-border/40">
              <div className="relative flex items-center">
                <Search
                  size={13}
                  className="absolute left-2.5 text-muted-foreground pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-7 pr-7 py-1 text-[12.5px] rounded-md border border-border/60 bg-muted/40 text-foreground outline-none focus:border-primary/60 focus:bg-background transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-[12.5px] text-muted-foreground text-center">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`custom-dropdown-item ${
                      isSelected ? "active" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <Check size={14} className="shrink-0 text-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
