import React from "react";
import { Link } from "react-router-dom";
import "./AdminHeader.css";

export default function AdminHeader() {
  return (
    <header className="admin-top-header">
      <div className="sys-status">
        <span className="status-indicator-dot"></span>
        <span className="status-indicator-text">ALL_SYSTEMS_OPERATIONAL</span>
      </div>
      <Link to="/" className="storefront-return-link">
        <span>VIEW_STOREFRONT</span>
        <span className="material-symbols-outlined">open_in_new</span>
      </Link>
    </header>
  );
}