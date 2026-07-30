import React, { useState, useMemo, useCallback } from "react";
import useUsers from "./hooks/useUsers";
import useDebounce from "../../../hooks/useDebounce";
import UserTable from "./components/UserTable/UserTable";
import UserDetailsModal from "./components/UserDetailsModal/UserDetailsModal";
import Modal from "../../../components/common/Modal/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog/ConfirmDialog";
import Loader from "../../../components/common/Loader/Loader";
import Button from "../../../components/common/Button/Button";
import { toast } from "react-toastify";
import "./UserManagement.css";

// Tab Filters corresponding to system roles & states
const ROLE_TABS = [
  { id: "all", label: "ALL" },
  { id: "user", label: "USERS" },
  { id: "admin", label: "ADMINS" },
  { id: "suspended", label: "SUSPENDED" },
];

export default function UserManagement() {
  const {
    users = [],
    loading,
    error,
    refresh,
    updateUserRole,
    toggleUserBan,
    deleteUser,
    getUserDetails,
  } = useUsers();

  // Search filter and tab selection
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Detail Modal State
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Delete Dialog State
  const [userToDelete, setUserToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Filtered users list — depends on debounced query, not raw keystrokes
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 1. Tab Filter
      if (activeTab === "user" && user.role !== "user") return false;
      if (activeTab === "admin" && user.role !== "admin") return false;
      if (activeTab === "suspended" && !user.isBanned) return false;

      // 2. Search Filter — User ID, name, or email
      const search = debouncedSearchQuery.toLowerCase().trim();
      if (!search) return true;

      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const idMatch = user._id?.toLowerCase().includes(search);
      const nameMatch = fullName.includes(search);
      const emailMatch = user.email?.toLowerCase().includes(search);

      return idMatch || nameMatch || emailMatch;
    });
  }, [users, activeTab, debouncedSearchQuery]);

  // Metrics aggregates
  const metrics = useMemo(() => {
    const total = users.length;
    const adminCount = users.filter((u) => u.role === "admin").length;
    const userCount = users.filter((u) => u.role === "user").length;
    const suspendedCount = users.filter((u) => u.isBanned).length;

    return { total, adminCount, userCount, suspendedCount };
  }, [users]);

  // Handler for viewing user breakdown modal
  const handleViewDetails = useCallback((user) => {
    setSelectedUserId(user._id);
    setIsDetailOpen(true);
  }, []);

  // Direct status update handler
  const handleToggleBanStatus = useCallback(
    async (user) => {
      try {
        await toggleUserBan(user._id, user.isBanned);
        toast.success(
          user.isBanned
            ? `User "${user.email}" reactivated.`
            : `User "${user.email}" suspended.`
        );
      } catch (err) {
        toast.error(err.message || "Failed to update user status.");
      }
    },
    [toggleUserBan]
  );

  // Inline role modification handler
  const handleInlineRoleChange = useCallback(
    async (userId, newRole) => {
      try {
        await updateUserRole(userId, newRole);
        toast.success("User role updated successfully.");
      } catch (err) {
        toast.error(err.message || "Failed to update user role.");
      }
    },
    [updateUserRole]
  );

  // Delete confirmation handlers
  const handleDeleteClick = useCallback((user) => {
    setUserToDelete(user);
    setIsConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleteSubmitting(true);
    try {
      await deleteUser(userToDelete._id);
      toast.success("User account deleted permanently.");
      setIsConfirmOpen(false);
      setUserToDelete(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete user account.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="user-management-loading">
        <Loader message="Loading user directory..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management-error" role="alert">
        <span className="material-symbols-outlined error-icon">error</span>
        <h3 className="error-title">Error Loading User Directory</h3>
        <p className="error-desc">{error}</p>
        <Button variant="outline" onClick={refresh} icon="refresh">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="user-management-view">
      {/* Header Block */}
      <div className="user-view-header">
        <div className="title-area">
          <h2 className="users-title">User Account Governance</h2>
          <span className="users-subtitle">
            Manage system access privileges, account statuses, and profiles
          </span>
        </div>
        <Button
          variant="outline"
          onClick={refresh}
          icon="refresh"
          aria-label="Refresh user list"
        >
          Refresh Directory
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="users-metrics-grid font-mono">
        <div className="metric-card">
          <span className="metric-label">Total Accounts</span>
          <span className="metric-value">{metrics.total}</span>
          <span className="metric-tag">Registered accounts</span>
        </div>
        <div className="metric-card highlight-users">
          <span className="metric-label">Standard Users</span>
          <span className="metric-value text-highlight">
            {metrics.userCount}
          </span>
          <span className="metric-tag">Role: User</span>
        </div>
        <div className="metric-card highlight-admins">
          <span className="metric-label">Administrators</span>
          <span className="metric-value text-blue">
            {metrics.adminCount}
          </span>
          <span className="metric-tag">Role: Admin</span>
        </div>
        <div className="metric-card highlight-suspended">
          <span className="metric-label">Suspended</span>
          <span className="metric-value text-red">
            {metrics.suspendedCount}
          </span>
          <span className="metric-tag">Banned access</span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="users-control-panel">
        <div className="tab-row font-mono" role="tablist" aria-label="User Filter Options">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="search-box-wrapper">
          <span className="material-symbols-outlined search-field-icon" aria-hidden="true">
            search
          </span>
          <input
            type="text"
            className="users-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by User ID, name, or email..."
            aria-label="Search user accounts"
          />
        </div>
      </div>

      {/* User Table Component */}
      <UserTable
        users={filteredUsers}
        onViewDetails={handleViewDetails}
        onToggleBan={handleToggleBanStatus}
        onDeleteUser={handleDeleteClick}
        onRoleChange={handleInlineRoleChange}
      />

      {/* User Details Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedUserId(null);
        }}
        title="User Profile Details"
        size="lg"
      >
        <UserDetailsModal
          userId={selectedUserId}
          fetchUserDetailsFn={getUserDetails}
          onUpdateRole={updateUserRole}
          onToggleBan={toggleUserBan}
          toast={toast}
        />
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${userToDelete?.email}"? This action cannot be undone.`}
        confirmLabel="Delete User"
        loading={deleteSubmitting}
      />
    </div>
  );
}