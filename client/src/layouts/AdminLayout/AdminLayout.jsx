import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar/AdminSidebar";
import AdminHeader from "./components/AdminHeader/AdminHeader";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`admin-shell-container ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      <AdminSidebar isOpen={sidebarOpen} />
      <div className="admin-workspace">
        <AdminHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="admin-view-viewport">
          <Outlet />
        </main>
      </div>
    </div>
  );
}