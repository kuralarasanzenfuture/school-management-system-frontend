import { useState, useEffect } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import sidebarMenu from "./sidebarMenu";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Sidebar = ({ collapsed, setCollapsed }) => {
  // const [isCollapsed, setIsCollapsed] = useState(() => {
  //   const saved = localStorage.getItem("sidebar-collapsed");
  //   return saved === "true";
  // });

  // useEffect(() => {
  //   localStorage.setItem("sidebar-collapsed", isCollapsed);
  //   const layoutEl = document.querySelector(".layout");
  //   if (layoutEl) {
  //     layoutEl.style.setProperty(
  //       "--sidebar-width",
  //       isCollapsed ? "72px" : "240px",
  //     );
  //   }
  // }, [isCollapsed]);

  const isCollapsed = collapsed;

useEffect(() => {
    localStorage.setItem("sidebar-collapsed", isCollapsed);
}, [isCollapsed]);

  return (
    <aside className={`sidebar-aside ${isCollapsed ? "is-collapsed" : ""}`}>
      {/* Logo area */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <i className="ti ti-school"></i>
          </div>
          {!isCollapsed && (
            <div>
              <div className="sidebar-brand-name">Zenfuture</div>
              <div className="sidebar-brand-sub">School Management</div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(true)}
          >
            <FaChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Toggle button when collapsed (full-width row) */}
      {isCollapsed && (
        <div className="sidebar-toggle-row">
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(false)}
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      )}

      <div className="sidebar-body">
        {sidebarMenu.map((section) => (
          <div className="sidebar-section" key={section.label}>
            {!isCollapsed ? (
              <div className="sidebar-section-label">{section.label}</div>
            ) : (
              <div className="sidebar-section-divider"></div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive ? "is-active" : ""}`
                  }
                >
                  <Icon className="sidebar-nav-icon" />

                  {!isCollapsed && (
                    <>
                      <span className="sidebar-nav-label">{item.name}</span>

                      {item.badge && (
                        <span className="sidebar-nav-badge">{item.badge}</span>
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
      <div className="sidebar-user-wrap">
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">ZF</div>

          {!isCollapsed && (
            <>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">Zenfuture</div>

                <div className="sidebar-user-role">Principal</div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
