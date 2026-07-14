import React from "react";
import { Link } from "react-router-dom";
import "./AdminHeader.css";

export default function AdminHeader() {
  return (
    <header className="admin-top-header">
      <div className="sys-status">
        
      </div>
      <Link to="/" className="storefront-return-link">
        <span>VIEW_STOREFRONT</span>
        <span className="material-symbols-outlined">open_in_new</span>
      </Link>
    </header>
  );
}