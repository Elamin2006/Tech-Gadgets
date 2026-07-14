import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Admin/AdminSidebar/AdminSidebar";
import AdminHeader from "../components/Admin/AdminHeader/AdminHeader";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell-container">
      <AdminSidebar />
      <div className="admin-workspace">
        <AdminHeader />
        <main className="admin-view-viewport">
          <Outlet />
        </main>
      </div>
    </div>
  );
}