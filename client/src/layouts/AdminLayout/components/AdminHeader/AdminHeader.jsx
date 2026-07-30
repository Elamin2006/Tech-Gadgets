import React, { memo, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../../store/slices/authSlice";
import Button from "../../../../components/common/Button/Button";
import "./AdminHeader.css";

const selectAuthUser = (state) => state.auth.user;


const AdminHeader = memo(function AdminHeader({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);

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

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  const handleToggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  // useMemo: initials computation — only recalculates when user.name changes
  const initials = useMemo(() => {
    if (!user?.name) return "AD";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

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
            onClick={handleToggleMenu}
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
});

export default AdminHeader;
