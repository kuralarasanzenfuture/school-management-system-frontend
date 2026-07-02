import SidebarLink from "./SidebarLink";

/**
 * A labeled group of links, e.g. "School Setup" → School Profile, Classes, ...
 *
 * When collapsed on desktop there's no room for the label, so we show a
 * thin divider line instead — just enough to separate one section's icons
 * from the next.
 */
export default function SidebarSection({
  section,
  isCollapsed,
  mobileOpen,
  onNavigate,
}) {
  const showLabel = !isCollapsed || mobileOpen;

  return (
    <div className="px-3 pb-3">
      {showLabel ? (
        <div
          className={`px-2 py-3 text-[11px] uppercase tracking-wider font-semibold text-[var(--sidebar-text-muted)] ${
            isCollapsed ? "lg:hidden" : ""
          }`}
        >
          {section.label}
        </div>
      ) : (
        <div className="hidden lg:block h-px bg-[var(--sidebar-divider)] mx-1.5 my-3" />
      )}

      {section.items.map((item) => (
        <SidebarLink
          key={item.path}
          item={item}
          isCollapsed={isCollapsed}
          mobileOpen={mobileOpen}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
