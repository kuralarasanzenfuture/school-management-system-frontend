import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Breadcrumb.css";

/**
 * Generic breadcrumb trail.
 *
 * @param {Array<{ label: string, to?: string }>} items - ordered trail.
 *   Every item except the last should have a `to` path; the last item
 *   renders as plain (non-clickable) text representing the current page.
 * @param {boolean} showHome - whether to prefix the trail with a home icon
 *   linking to "/" (default true).
 *
 * Usage:
 *   <Breadcrumb items={[{ label: "Students", to: "/students" }, { label: "Add Student" }]} />
 */
export default function Breadcrumb({ items = [], showHome = true }) {
    const navigate = useNavigate();

    return (
        <nav aria-label="Breadcrumb" className="bc-nav flex items-center flex-wrap gap-1.5 mb-4">
            {showHome && (
                <>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="bc-link inline-flex items-center gap-1 text-[13px] font-medium transition-colors"
                    >
                        <Home size={13} />
                    </button>
                    {items.length > 0 && (
                        <ChevronRight size={13} className="bc-sep shrink-0" />
                    )}
                </>
            )}

            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <React.Fragment key={`${item.label}-${index}`}>
                        {isLast || !item.to ? (
                            <span className="bc-current text-[13px] font-semibold" aria-current={isLast ? "page" : undefined}>
                                {item.label}
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => navigate(item.to)}
                                className="bc-link text-[13px] font-medium transition-colors"
                            >
                                {item.label}
                            </button>
                        )}
                        {!isLast && <ChevronRight size={13} className="bc-sep shrink-0" />}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}