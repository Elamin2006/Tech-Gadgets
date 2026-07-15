import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../../store/slices/authSlice";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand-header">
        <span className="tech-logo">TECH_</span>
        <span className="tech-logo-highlight">ELITE_ADMIN</span>
      </div>

      <nav className="admin-nav-menu">
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>SYSTEM_STATS</span>
        </NavLink>
        <NavLink 
          to="/admin/users" 
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">group</span>
          <span>USER_NODES</span>
        </NavLink>
        <NavLink 
          to="/admin/products" 
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">inventory</span>
          <span>INVENTORY</span>
        </NavLink>
        <NavLink 
          to="/admin/orders" 
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          <span>ORDER_LOGS</span>
        </NavLink>
      </nav>

      <div className="admin-profile-footer">
        <div className="admin-meta">
          <span className="meta-role">ADMINISTRATOR</span>
          <span className="meta-email">{user?.email || "sys.admin@elite.io"}</span>
        </div>
        <button onClick={handleLogout} className="admin-logout-btn" title="Terminate Session">
          <span className="material-symbols-outlined">power_settings_new</span>
        </button>
      </div>
    </aside>
  );
}