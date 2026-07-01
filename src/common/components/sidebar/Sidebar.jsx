import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import sidebarMenu from "./sidebarMenu";
import { FaChevronLeft, FaChevronRight, FaBars, FaTimes } from "react-icons/fa";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const isCollapsed = collapsed;
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", isCollapsed);
  }, [isCollapsed]);

  // Close the mobile drawer automatically on route-size changes back to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      {/* Mobile top bar trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-[1100] w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600"
      >
        <FaBars size={15} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
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

        {/* Header */}
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

          {/* Desktop collapse button */}
          {!isCollapsed && (
            <button
              className="hidden lg:flex w-8 h-8 rounded-lg bg-[var(--sidebar-control-bg)] hover:bg-[var(--sidebar-control-bg-hover)] text-[var(--sidebar-text)] items-center justify-center transition-colors duration-200"
              onClick={() => setCollapsed(true)}
            >
              <FaChevronLeft size={13} />
            </button>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg bg-[var(--sidebar-control-bg)] hover:bg-[var(--sidebar-control-bg-hover)] text-[var(--sidebar-text)] flex items-center justify-center transition-colors duration-200"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Toggle row when collapsed (desktop only) */}
        {isCollapsed && (
          <div className="hidden lg:block p-3 shrink-0">
            <button
              className="w-full h-8 rounded-lg bg-[var(--sidebar-control-bg)] hover:bg-[var(--sidebar-control-bg-hover)] text-[var(--sidebar-text)] flex items-center justify-center transition-colors duration-200"
              onClick={() => setCollapsed(false)}
            >
              <FaChevronRight size={13} />
            </button>
          </div>
        )}

        {/* Menu body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2.5 [scrollbar-width:thin] [scrollbar-color:#6f7ba6_transparent]">
          {sidebarMenu.map((section) => (
            <div className="px-3 pb-3" key={section.label}>
              {!isCollapsed || mobileOpen ? (
                <div
                  className={`px-2 py-3 text-[11px] uppercase tracking-wider font-semibold text-[var(--sidebar-text-muted)] ${
                    isCollapsed ? "lg:hidden" : ""
                  }`}
                >
                  {section.label}
                </div>
              ) : (
                <div className="hidden lg:block h-px bg-[var(--sidebar-divider)] mx-1.5 my-3"></div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-3.5 py-[11px] rounded-[10px] mb-1.5 text-[var(--sidebar-text)] no-underline transition-all duration-200 ${
                        isCollapsed ? "lg:justify-center lg:px-3" : ""
                      } ${
                        isActive
                          ? "bg-[var(--sidebar-active-grad)] text-white shadow-[var(--sidebar-active-shadow)]"
                          : "hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-strong)]"
                      }`
                    }
                  >
                    <Icon className="min-w-[22px] text-[20px]" />
                    {(!isCollapsed || mobileOpen) && (
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
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* User card */}
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
