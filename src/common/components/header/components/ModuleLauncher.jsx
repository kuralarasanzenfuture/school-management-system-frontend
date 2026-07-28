import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, Search, X } from "lucide-react";
// Adjust this path to wherever sidebarMenu.js actually lives relative to
// this file — this assumes Header/ and Sidebar/ are sibling folders under
// the same layout directory.
import sidebarMenu from "../../sidebar/sidebarMenu.js";
import "../styles/ModuleLauncher.css";

/**
 * Header icon that opens a small anchored dropdown (not a modal) listing
 * every module/page from sidebarMenu.js, filterable by typing. Same
 * self-contained open/outside-click/Escape pattern as the profile menu —
 * Header.jsx just renders <ModuleLauncher />, no state to wire up.
 */
export default function ModuleLauncher() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const wrapRef = useRef(null);
    const inputRef = useRef(null);

    // Close on outside click.
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Escape closes it; Ctrl/⌘+K opens it from anywhere on the page.
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === "Escape") setOpen(false);
            const isCombo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
            if (isCombo) {
                e.preventDefault();
                setOpen(true);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    // Autofocus the search field on open; reset the query on close.
    useEffect(() => {
        if (open) {
            const id = setTimeout(() => inputRef.current?.focus(), 30);
            return () => clearTimeout(id);
        }
        setQuery("");
    }, [open]);

    const filteredSections = useMemo(() => {
        const term = query.trim().toLowerCase();
        return sidebarMenu
            .map((section) => {
                const items = !term
                    ? section.items
                    : section.items.filter(
                        (item) =>
                            item.name.toLowerCase().includes(term) ||
                            section.label.toLowerCase().includes(term),
                    );
                return { ...section, items };
            })
            .filter((section) => section.items.length > 0);
    }, [query]);

    const isSectionActive = (section) =>
        section.items.some((item) => location.pathname.startsWith(item.path));

    const goTo = (path) => {
        navigate(path);
        setOpen(false);
    };

    return (
        <div ref={wrapRef} className="relative">
            <button
                onClick={() => setOpen((p) => !p)}
                aria-label="Search modules and pages"
                title="Search modules and pages (Ctrl K)"
                className={`ml-trigger w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${open ? "ml-trigger-active" : ""}`}
            >
                <LayoutGrid size={17} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="ml-panel absolute right-0 mt-2 rounded-2xl overflow-hidden flex flex-col z-50"
                    >
                        {/* Search row */}
                        <div className="ml-search-row flex items-center gap-2.5 px-4 py-3 shrink-0">
                            <Search size={15} className="ml-search-icon shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search modules and pages…"
                                className="ml-search-input flex-1 text-[13.5px] outline-none"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    aria-label="Clear search"
                                    className="ml-clear-btn shrink-0"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Results grid */}
                        <div className="overflow-y-auto px-4 py-4">
                            {filteredSections.length === 0 ? (
                                <p className="ml-empty-state text-[13px] text-center py-8">
                                    No modules or pages match "{query}".
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-6">
                                    {filteredSections.map((section) => {
                                        const SectionIcon = section.items[0]?.icon;
                                        const active = isSectionActive(section);

                                        return (
                                            <div key={section.label}>
                                                <div
                                                    className={`flex items-center gap-1.5 pb-1.5 mb-2 text-[11px] font-bold uppercase tracking-wide ${active ? "ml-section-title-active" : "ml-section-title"
                                                        }`}
                                                >
                                                    {SectionIcon && (
                                                        <SectionIcon
                                                            size={12}
                                                            className={active ? "ml-section-icon-active" : "ml-section-icon"}
                                                        />
                                                    )}
                                                    {section.label}
                                                </div>
                                                <ul className="flex flex-col gap-1.5">
                                                    {section.items.map((item) => {
                                                        const isCurrent = location.pathname === item.path;
                                                        return (
                                                            <li key={item.path}>
                                                                <button
                                                                    onClick={() => goTo(item.path)}
                                                                    className={`w-full text-left text-[12.5px] transition-colors flex items-center gap-1.5 ${active ? "ml-item-active" : "ml-item"
                                                                        } ${isCurrent ? "ml-item-current" : ""}`}
                                                                >
                                                                    {isCurrent && (
                                                                        <span className="ml-item-current-dot w-1 h-1 rounded-full shrink-0" />
                                                                    )}
                                                                    {item.name}
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}