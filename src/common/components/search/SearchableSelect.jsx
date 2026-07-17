import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import "./SearchableSelect.css";

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

/**
 * A searchable, single-select combobox: type to filter options, matching
 * letters are highlighted inline. Drop-in replacement for a plain
 * <select> where the option list is long enough that typing a few
 * letters beats scrolling (e.g. picking one student out of hundreds).
 *
 * @param {Array<{value: string|number, label: string, sublabel?: string}>} options
 * @param {string|number} value - the selected option's value
 * @param {(value: string|number) => void} onChange
 * @param {string} placeholder - shown when nothing is selected
 * @param {boolean} disabled
 * @param {boolean} loading
 * @param {string} loadingText
 * @param {boolean} hasError - applies the error border style
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
        <div className="ss-combo relative" ref={containerRef}>
            <button
                type="button"
                onClick={openDropdown}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={`ss-trigger w-full rounded-lg px-3.5 py-2.5 text-[14px] flex items-center justify-between gap-2 transition-all duration-200 ${hasError ? "ss-trigger-error" : ""
                    }`}
            >
                <span className={selected ? "ss-trigger-value" : "ss-trigger-placeholder"}>
                    {selected ? selected.label : loading ? loadingText : placeholder}
                </span>
                <ChevronDown size={15} className="ss-trigger-icon shrink-0" />
            </button>

            {open && (
                <div className="ss-panel absolute z-20 w-full mt-1.5 rounded-lg overflow-hidden">
                    <div className="ss-search-wrap flex items-center gap-2 px-3 py-2">
                        <Search size={14} className="ss-search-icon shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type to search…"
                            className="ss-search-input w-full text-[13.5px]"
                        />
                    </div>

                    <div className="ss-options max-h-56 overflow-y-auto" role="listbox">
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
                                        className={`ss-option flex items-center justify-between gap-2 px-3.5 py-2.5 text-[13.5px] cursor-pointer ${isActive ? "ss-option-active" : ""
                                            }`}
                                    >
                                        <div className="flex flex-col min-w-0">
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