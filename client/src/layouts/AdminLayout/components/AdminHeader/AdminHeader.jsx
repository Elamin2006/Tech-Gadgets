import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../../store/slices/authSlice";
import Button from "../../../../components/common/Button/Button";
import "./AdminHeader.css";

export default function AdminHeader({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <header className="admin-top-header glass-panel">
      <div className="header-left">
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="sys-status">
          <span className="status-indicator-dot"></span>
          <span className="status-indicator-text">All Systems Operational</span>
        </div>
      </div>

      <div className="header-right">
        <button className="notif-bell-btn" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <Link to="/" className="storefront-return-link">
          <span>VIEW STOREFRONT</span>
          <span className="material-symbols-outlined">open_in_new</span>
        </Link>

        <div className="admin-user-menu" ref={menuRef}>
          <button
            className="user-menu-trigger"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="user-avatar-initials">{initials}</span>
            <span className="user-name">{user?.name || "Admin"}</span>
            <span className="material-symbols-outlined dropdown-caret">
              expand_more
            </span>
          </button>

          {menuOpen && (
            <div className="user-dropdown-menu glass-panel">
              <div className="dropdown-user-info">
                <span className="dropdown-user-name">{user?.name || "Admin"}</span>
                <span className="dropdown-user-email">{user?.email}</span>
              </div>
              <div className="dropdown-divider"></div>
              <Button
                variant="outline"
                size="sm"
                icon="logout"
                onClick={handleLogout}
                className="dropdown-logout-btn"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
