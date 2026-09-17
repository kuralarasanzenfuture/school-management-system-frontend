import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Check, User, X, RotateCcw } from "lucide-react";
import "../styles/SearchableSelect.css";

/** Highlights the first matching substring of `text` against `query`. */
function highlightMatch(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="ss-highlight">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </>
    );
}

/** Small circular avatar: photo if avatarUrl is set, else initials, else a generic icon. */
function Avatar({ avatarUrl, initials, size = 26 }) {
    return (
        <span
            className="ss-avatar shrink-0 rounded-full flex items-center justify-center overflow-hidden font-bold"
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : initials ? (
                initials
            ) : (
                <User size={size * 0.55} />
            )}
        </span>
    );
}

/**
 * A searchable, single-select combobox: type to filter options, matching
 * letters are highlighted inline. Drop-in replacement for a plain
 * <select> where the option list is long enough that typing a few
 * letters beats scrolling (e.g. picking one student/employee out of
 * hundreds). Optionally shows a photo/initials avatar per option (and in
 * the trigger once something's selected) when options include
 * avatarUrl/initials.
 *
 * @param {Array<{value: string|number, label: string, sublabel?: string, avatarUrl?: string, initials?: string}>} options
 * @param {string|number} value - the selected option's value
 * @param {(value: string|number) => void} onChange
 * @param {string} placeholder - shown when nothing is selected
 * @param {boolean} disabled
 * @param {boolean} loading
 * @param {string} loadingText
 * @param {boolean} hasError - applies the error border style
 * @param {boolean} showAvatars - set true if options carry avatarUrl/initials
 * @param {boolean} clearable - shows an X button to clear selection
 */
export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select…",
    disabled = false,
    loading = false,
    loadingText = "Loading…",
    hasError = false,
    showAvatars = false,
    clearable = true,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const selected = useMemo(
        () => options.find((o) => String(o.value) === String(value)) || null,
        [options, value],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter(
            (o) =>
                o.label.toLowerCase().includes(q) ||
                (o.sublabel || "").toLowerCase().includes(q),
        );
    }, [options, query]);

    // Close on outside click.
    useEffect(() => {
        const onClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    useEffect(() => {
        setActiveIndex(0);
    }, [query, open]);

    const openDropdown = () => {
        if (disabled) return;
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
    };

    const selectOption = (option) => {
        onChange(option.value);
        setOpen(false);
        setQuery("");
    };

    const handleKeyDown = (e) => {
        if (!open) {
            if (e.key === "ArrowDown" || e.key === "Enter") {
                e.preventDefault();
                openDropdown();
            }
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filtered[activeIndex]) selectOption(filtered[activeIndex]);
        } else if (e.key === "Escape") {
            setOpen(false);
            setQuery("");
        }
    };

    return (
        <div className="ss-combo relative w-full sm:w-auto" ref={containerRef}>
            <button
                type="button"
                onClick={openDropdown}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={`ss-trigger w-full rounded-lg px-3.5 py-2.5 sm:py-2.5 text-[14px] flex items-center gap-2 transition-all duration-200 ${hasError ? "ss-trigger-error" : ""
                    }`}
            >
                {showAvatars && selected && (
                    <Avatar avatarUrl={selected.avatarUrl} initials={selected.initials} />
                )}
                <span
                    className={`flex-1 min-w-0 text-left truncate ${selected ? "ss-trigger-value" : "ss-trigger-placeholder"
                        }`}
                >
                    {selected ? selected.label : loading ? loadingText : placeholder}
                </span>
                {clearable && selected && !disabled && (
                    <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange("");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                onChange("");
                            }
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full cursor-pointer transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                        title="Clear selection"
                    >
                        <X size={14} />
                    </span>
                )}
                <ChevronDown size={15} className="ss-trigger-icon shrink-0" />
            </button>

            {open && (
                <div className="ss-panel absolute z-20 w-full sm:min-w-[260px] mt-1.5 rounded-lg overflow-hidden">
                    <div className="ss-search-wrap flex items-center gap-2 px-3 py-2.5 sm:py-2">
                        <Search size={14} className="ss-search-icon shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type to search…"
                            className="ss-search-input w-full text-[14px] sm:text-[13.5px]"
                        />
                    </div>

                    <div className="ss-options max-h-64 sm:max-h-56 overflow-y-auto" role="listbox">
                        {clearable && selected && !loading && (
                            <div
                                role="option"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    selectOption({ value: "", label: placeholder });
                                }}
                                className="flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors"
                            >
                                <RotateCcw size={12} />
                                <span>Clear / All employees</span>
                            </div>
                        )}
                        {loading ? (
                            <div className="ss-empty px-3.5 py-3 text-[13px]">{loadingText}</div>
                        ) : filtered.length === 0 ? (
                            <div className="ss-empty px-3.5 py-3 text-[13px]">No matches</div>
                        ) : (
                            filtered.map((option, index) => {
                                const isSelected =
                                    selected && String(selected.value) === String(option.value);
                                const isActive = index === activeIndex;
                                return (
                                    <div
                                        key={option.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onMouseDown={(e) => {
                                            // mousedown (not click) so this fires before the
                                            // outside-click handler treats it as a blur
                                            e.preventDefault();
                                            selectOption(option);
                                        }}
                                        className={`ss-option flex items-center gap-2.5 px-3.5 py-3 sm:py-2.5 text-[13.5px] cursor-pointer ${isActive ? "ss-option-active" : ""
                                            }`}
                                    >
                                        {showAvatars && (
                                            <Avatar avatarUrl={option.avatarUrl} initials={option.initials} />
                                        )}
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="ss-option-label truncate">
                                                {highlightMatch(option.label, query)}
                                            </span>
                                            {option.sublabel && (
                                                <span className="ss-option-sublabel text-[11.5px] truncate">
                                                    {highlightMatch(option.sublabel, query)}
                                                </span>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <Check size={14} className="ss-option-check shrink-0" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}