import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import "./CustomDropdown.css";

/* ── Rich Badge Renderer for Dropdown Items & Trigger ── */
function renderDropdownBadge(badge, variant) {
  if (!badge) return null;
  const badgeStr = String(badge);
  const lower = badgeStr.toLowerCase();

  const isWarning =
    variant === "warning" ||
    lower.includes("active exists") ||
    lower.includes("active structure") ||
    lower.includes("already active") ||
    lower.includes("exists");

  const isDanger =
    variant === "danger" ||
    lower.includes("inactive") ||
    lower.includes("expired") ||
    lower.includes("terminated") ||
    lower.includes("error");

  const isSuccess =
    variant === "success" ||
    (lower === "active" && !isWarning) ||
    lower.includes("available");

  if (isWarning) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
        {badgeStr}
      </span>
    );
  }

  if (isDanger) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 shrink-0 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
        {badgeStr}
      </span>
    );
  }

  if (isSuccess) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        {badgeStr}
      </span>
    );
  }

  // Modern clean code/tag pill
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 tracking-wide">
      {badgeStr}
    </span>
  );
}

/* ── Fail-Safe Avatar with Fallback ── */
export function DropdownAvatar({ src, initials, size = "w-8 h-8", textSize = "text-[11px]" }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    if (!initials) return null;
    return (
      <div
        className={`${size} rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center ${textSize} font-bold shrink-0 border border-indigo-200 dark:border-indigo-800/80 shadow-xs select-none`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`${size} rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 relative shadow-xs`}
    >
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

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
    if (value === undefined || value === null) return undefined;
    const strVal = String(value).trim();
    if (!strVal) return undefined;
    const exact = options.find((opt) => String(opt.value) === strVal);
    if (exact) return exact;
    const lowerVal = strVal.toLowerCase();
    return options.find(
      (opt) => opt.value && String(opt.value).toLowerCase() === lowerVal,
    );
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => {
      const labelMatch = String(opt.label || "").toLowerCase().includes(q);
      const sublabelMatch = opt.sublabel && String(opt.sublabel).toLowerCase().includes(q);
      const badgeMatch = opt.badge && String(opt.badge).toLowerCase().includes(q);
      const searchMatch = opt.searchText && String(opt.searchText).toLowerCase().includes(q);
      return labelMatch || sublabelMatch || badgeMatch || searchMatch;
    });
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
      className={`custom-dropdown-root ${className} ${isOpen ? "open is-open" : ""}`}
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
          <DropdownAvatar
            src={selectedOption?.avatarUrl}
            initials={selectedOption?.initials}
            size="w-5 h-5"
            textSize="text-[9px]"
          />
          <span
            className={`truncate ${
              selectedOption ? "text-foreground font-semibold text-[13px]" : "text-muted-foreground"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.code && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-muted/60 text-muted-foreground border border-border/40 shrink-0">
              {selectedOption.code}
            </span>
          )}
          {selectedOption?.badge && (
            <span className="shrink-0">{renderDropdownBadge(selectedOption.badge, selectedOption.badgeVariant)}</span>
          )}
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
                const isSelected =
                  String(opt.value) === String(value) ||
                  Boolean(
                    value &&
                      opt.value &&
                      String(opt.value).toLowerCase() ===
                        String(value).toLowerCase(),
                  );
                const hasRichLayout = Boolean(opt.sublabel || opt.badge || opt.code || opt.avatarUrl || opt.initials);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => {
                      if (!opt.disabled) handleSelect(opt.value);
                    }}
                    className={`custom-dropdown-item ${
                      isSelected ? "active" : ""
                    } ${opt.disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0 flex-1">
                      <DropdownAvatar
                        src={opt.avatarUrl}
                        initials={opt.initials}
                        size="w-8 h-8"
                        textSize="text-[11px]"
                      />
                      {!opt.avatarUrl && !opt.initials && opt.icon && (
                        <span className="shrink-0">{opt.icon}</span>
                      )}

                      {hasRichLayout ? (
                        <div className="flex flex-col min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <span className="truncate font-semibold text-foreground text-[13px]">
                              {opt.label}
                            </span>
                            {opt.code && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-muted/60 text-muted-foreground border border-border/40 shrink-0">
                                {opt.code}
                              </span>
                            )}
                            {opt.badge && renderDropdownBadge(opt.badge, opt.badgeVariant)}
                          </div>
                          {opt.sublabel && (
                            <span className="text-[11.5px] text-muted-foreground/80 font-medium truncate leading-tight mt-0.5">
                              {opt.sublabel}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="truncate">{opt.label}</span>
                      )}
                    </div>

                    {isSelected && (
                      <Check size={14} className="shrink-0 text-primary ml-2" />
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
