import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
// Adjust this path to wherever sidebarMenu.js actually lives relative to
// this file — this assumes Header/ and Sidebar/ are sibling folders under
// the same layout directory.
import sidebarMenu from "../../sidebar/sidebarMenu.js";
import "../styles/QuickSearchOverlay.css";

/**
 * Global navigation search — opened from the header's search box (or
 * Ctrl/⌘+K). Filters sidebarMenu.js live as you type and lays the results
 * out as a multi-column mega-menu, closing itself on selection, Escape, or
 * a click outside the panel.
 */
export default function QuickSearchOverlay({ isOpen, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [query, setQuery] = useState("");
    const inputRef = useRef(null);
    const panelRef = useRef(null);

    // Autofocus the search field the moment the overlay opens.
    useEffect(() => {
        if (isOpen) {
            // Let the mount/animation start before stealing focus.
            const id = setTimeout(() => inputRef.current?.focus(), 30);
            return () => clearTimeout(id);
        }
        setQuery("");
    }, [isOpen]);

    // Escape closes it.
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

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
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="ql-backdrop fixed inset-0 z-[1300] flex items-start justify-center pt-20 px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={onClose}
                >
                    <motion.div
                        ref={panelRef}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: -12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="ql-panel w-full max-w-5xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        {/* Search field */}
                        <div className="ql-search-row flex items-center gap-3 px-5 py-4 shrink-0">
                            <Search size={18} className="ql-search-icon shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search modules and pages…"
                                className="ql-search-input flex-1 text-[15px] outline-none"
                            />
                            <span className="ql-kbd hidden sm:inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium">
                                Esc
                            </span>
                            <button
                                onClick={onClose}
                                aria-label="Close"
                                className="ql-close-btn w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Results grid */}
                        <div className="overflow-y-auto px-5 py-5">
                            {filteredSections.length === 0 ? (
                                <p className="ql-empty-state text-[13.5px] text-center py-10">
                                    No modules or pages match "{query}".
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-7">
                                    {filteredSections.map((section) => {
                                        const SectionIcon = section.items[0]?.icon;
                                        const active = isSectionActive(section);

                                        return (
                                            <div key={section.label}>
                                                <div
                                                    className={`flex items-center gap-2 pb-2 mb-2.5 text-[12px] font-bold uppercase tracking-wide ${active ? "ql-section-title-active" : "ql-section-title"
                                                        }`}
                                                >
                                                    {SectionIcon && (
                                                        <SectionIcon
                                                            size={13}
                                                            className={active ? "ql-section-icon-active" : "ql-section-icon"}
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
                                                                    className={`w-full text-left text-[13px] transition-colors flex items-center gap-2 ${active ? "ql-item-active" : "ql-item"
                                                                        } ${isCurrent ? "ql-item-current" : ""}`}
                                                                >
                                                                    {isCurrent && (
                                                                        <span className="ql-item-current-dot w-1 h-1 rounded-full shrink-0" />
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

                        <div className="ql-footer px-5 py-2.5 text-[11px] shrink-0">
                            Press <span className="ql-kbd px-1.5 py-0.5 rounded mx-1">Esc</span> to close
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}