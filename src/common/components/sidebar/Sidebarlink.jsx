import { NavLink } from "react-router-dom";

/**
 * One clickable row in the sidebar (e.g. "Dashboard", "Students").
 *
 * Behaviour by state:
 *  - Expanded (desktop) or mobile drawer open → icon + label + optional badge.
 *  - Collapsed (desktop)                      → icon only, and hovering
 *    reveals a small floating tooltip with the item's name so people can
 *    still tell what each icon means.
 *
 * The active route gets the gradient/"selected" styling automatically via
 * NavLink's `isActive` — no manual URL comparison needed.
 */
export default function SidebarLink({
  item,
  isCollapsed,
  mobileOpen,
  onNavigate,
}) {
  const Icon = item.icon;
  const showLabel = !isCollapsed || mobileOpen;

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      // When the label is hidden (collapsed + desktop), screen readers still
      // need to know what this button does.
      aria-label={showLabel ? undefined : item.name}
      className={({ isActive }) =>
        `group relative flex items-center gap-3.5 px-3.5 py-[11px] rounded-[10px] mb-1.5 text-[var(--sidebar-text)] no-underline transition-all duration-200 ${
          isCollapsed ? "lg:justify-center lg:px-3" : ""
        } ${
          isActive
            ? "bg-[var(--sidebar-active-grad)] text-white shadow-[var(--sidebar-active-shadow)]"
            : "hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-strong)]"
        }`
      }
    >
      <Icon className="min-w-[22px] text-[20px]" />

      {showLabel && (
        <>
          <span
            className={`flex-1 whitespace-nowrap ${isCollapsed ? "lg:hidden" : ""}`}
          >
            {item.name}
          </span>
          {item.badge && (
            <span
              className={`px-2 py-[3px] rounded-full bg-[var(--sidebar-badge-bg)] text-[var(--sidebar-badge-text)] text-[10px] font-bold ${
                isCollapsed ? "lg:hidden" : ""
              }`}
            >
              {item.badge}
            </span>
          )}
        </>
      )}

      {/* Collapsed-only tooltip. Pure CSS (group-hover), so there's no extra
          JS state or mouseEnter/mouseLeave handlers to manage. */}
      {isCollapsed && (
        <span
          role="tooltip"
          className="hidden lg:block absolute left-full top-1/2 z-[1200] ml-3
                     -translate-y-1/2 -translate-x-1 whitespace-nowrap
                     rounded-md bg-slate-900 px-2.5 py-1.5 text-[12.5px]
                     font-medium text-white shadow-lg
                     opacity-0 invisible pointer-events-none
                     transition-all duration-150
                     group-hover:opacity-100 group-hover:visible group-hover:translate-x-0"
        >
          {item.name}
        </span>
      )}
    </NavLink>
  );
}
