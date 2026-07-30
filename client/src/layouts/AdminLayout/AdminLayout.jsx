import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar/AdminSidebar";
import AdminHeader from "./components/AdminHeader/AdminHeader";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className={`admin-shell-container ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      <AdminSidebar isOpen={sidebarOpen} />
      <div className="admin-workspace">
        <AdminHeader onToggleSidebar={handleToggleSidebar} />
        <main className="admin-view-viewport">
          <Outlet />
        </main>
      </div>
    </div>
  );
}