import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6FB]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/*
        On mobile the sidebar is an off-canvas drawer (no space reserved),
        so no left margin there. From lg upward it sits inline, so we push
        content over by the sidebar's current width.
      */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[margin-left] duration-300 ease-in-out ${
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"
        }`}
      >
        <Header />

        <main className="flex-1 overflow-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
