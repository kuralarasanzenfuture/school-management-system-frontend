import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaBars, FaTimes } from "react-icons/fa";
import sidebarMenu from "./sidebarMenu";
import SidebarSection from "./SidebarSection";

/**
 * App sidebar.
 *
 * `collapsed` / `setCollapsed` are owned by the parent (layout) component,
 * not by Sidebar itself — that's what lets other parts of the layout (e.g.
 * the page content width) react to the collapsed state too.
 *
 * Two independent "open" states:
 *  - `collapsed` (prop): desktop-only — icon rail vs full-width sidebar.
 *  - `mobileOpen` (local): small-screen-only — the sidebar is an off-canvas
 *    drawer there, always full width when open, and collapse doesn't apply.
 */
const Sidebar = ({ collapsed, setCollapsed }) => {
  const isCollapsed = collapsed;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persist the collapsed preference so it survives a page refresh.
  //
  // NOTE: this only *writes* the value. Reading it back has to happen where
  // `collapsed` state is first created (the parent layout component), e.g.:
  //   const [collapsed, setCollapsed] = useState(
  //     () => localStorage.getItem("sidebar-collapsed") === "true"
  //   );
  // Without that read-back, the sidebar will always reset to expanded on
  // reload even though this effect is saving the preference correctly.
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", isCollapsed);
  }, [isCollapsed]);

  // If the window is resized back up to desktop width while the mobile
  // drawer happens to be open, close it — otherwise it'd stay open
  // underneath the desktop rail.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMobileDrawer = () => setMobileOpen(false);

  return (
    <>
      {/* ── Mobile: floating button that opens the drawer ── */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-3 left-3 z-[1100] w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600"
      >
        <FaBars size={15} />
      </button>

      {/* ── Mobile: dimmed backdrop behind the open drawer ── */}
      {mobileOpen && (
        <div
          onClick={closeMobileDrawer}
          className="lg:hidden fixed inset-0 z-[1099] bg-black/40 backdrop-blur-[1px] animate-[fadeIn_0.2s_ease]"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen flex flex-col z-[1100]
          bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]
          transition-all duration-300 ease-in-out overflow-hidden

          ${isCollapsed ? "lg:w-[72px]" : "lg:w-[240px]"}
          w-[240px]

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>

        {/* ── Header: logo + collapse/close controls ── */}
        <div
          className={`h-[76px] px-4 flex items-center justify-between border-b border-[var(--sidebar-divider)] shrink-0 ${
            isCollapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--sidebar-logo-grad)] text-white flex items-center justify-center text-xl shrink-0">
              <i className="ti ti-school"></i>
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className={isCollapsed ? "lg:hidden" : ""}>
                <div className="text-[var(--sidebar-text-strong)] text-[16px] font-bold leading-tight">
                  Zenfuture
                </div>
                <div className="text-[var(--sidebar-text-faint)] text-[12px]">
                  School Management
                </div>
              </div>
            )}
          </div>

          {/* Desktop: collapse the rail down to icons only */}
          {!isCollapsed && (
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="hidden lg:flex w-8 h-8 rounded-lg bg-[var(--sidebar-control-bg)] hover:bg-[var(--sidebar-control-bg-hover)] text-[var(--sidebar-text)] items-center justify-center transition-colors duration-200"
            >
              <FaChevronLeft size={13} />
            </button>
          )}

          {/* Mobile: close the drawer */}
          <button
            onClick={closeMobileDrawer}
            aria-label="Close menu"
            className="lg:hidden w-8 h-8 rounded-lg bg-[var(--sidebar-control-bg)] hover:bg-[var(--sidebar-control-bg-hover)] text-[var(--sidebar-text)] flex items-center justify-center transition-colors duration-200"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* ── Desktop-only: re-expand button, shown only while collapsed ── */}
        {isCollapsed && (
          <div className="hidden lg:block p-3 shrink-0">
            <button
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="w-full h-8 rounded-lg bg-[var(--sidebar-control-bg)] hover:bg-[var(--sidebar-control-bg-hover)] text-[var(--sidebar-text)] flex items-center justify-center transition-colors duration-200"
            >
              <FaChevronRight size={13} />
            </button>
          </div>
        )}

        {/* ── Scrollable menu body ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2.5 [scrollbar-width:thin] [scrollbar-color:#6f7ba6_transparent]">
          {sidebarMenu.map((section) => (
            <SidebarSection
              key={section.label}
              section={section}
              isCollapsed={isCollapsed}
              mobileOpen={mobileOpen}
              onNavigate={closeMobileDrawer}
            />
          ))}
        </div>

        {/* ── Footer: current user card ── */}
        <div className="shrink-0 p-3 border-t border-[var(--sidebar-divider)]">
          <div
            className={`flex items-center gap-2.5 bg-[var(--sidebar-card-bg)] rounded-xl p-2.5 ${
              isCollapsed ? "lg:justify-center" : ""
            }`}
          >
            <div className="w-[38px] h-[38px] rounded-full bg-[var(--sidebar-avatar-grad)] text-white flex items-center justify-center font-bold shrink-0">
              ZF
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div
                className={`flex-1 overflow-hidden ${isCollapsed ? "lg:hidden" : ""}`}
              >
                <div className="text-[var(--sidebar-text-strong)] text-[14px] font-semibold truncate">
                  Zenfuture
                </div>
                <div className="text-[var(--sidebar-text-faint)] text-[12px] truncate">
                  Principal
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
