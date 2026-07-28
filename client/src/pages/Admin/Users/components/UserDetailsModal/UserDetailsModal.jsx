import React, { useEffect, useState } from "react";
import Loader from "../../../../../components/common/Loader/Loader";
import Button from "../../../../../components/common/Button/Button";
import "./UserDetailsModal.css";

export default function UserDetailsModal({
  userId,
  fetchUserDetailsFn,
  onUpdateRole,
  onToggleBan,
  toast,
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState("user");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    setLoading(true);

    fetchUserDetailsFn(userId)
      .then((res) => {
        if (isMounted && res.success) {
          setUser(res.data);
          setSelectedRole(res.data.role || "user");
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load details");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId, fetchUserDetailsFn]);

  const handleRoleSave = async () => {
    if (selectedRole === user.role) return;
    setSubmitting(true);
    try {
      await onUpdateRole(user._id, selectedRole);
      setUser((prev) => ({ ...prev, role: selectedRole }));
      toast.success("User privilege role updated.");
    } catch (err) {
      toast.error(err.message || "Failed to update role.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBanToggleAction = async () => {
    setSubmitting(true);
    try {
      await onToggleBan(user._id, user.isBanned);
      setUser((prev) => ({ ...prev, isBanned: !prev.isBanned }));
      toast.success(
        user.isBanned ? "User account reactivated." : "User account suspended."
      );
    } catch (err) {
      toast.error(err.message || "Failed to change account status.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="user-details-loading">
        <Loader message="Fetching user details..." size="md" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="user-details-error">
        <span className="material-symbols-outlined error-icon">error</span>
        <p>{error || "User record not found."}</p>
      </div>
    );
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "N/A";

  return (
    <div className="user-details-modal-content">
      {/* Header Profile Section */}
      <div className="user-modal-header">
        <div className="modal-avatar">{fullName.charAt(0).toUpperCase()}</div>
        <div className="modal-header-info">
          <h3>{fullName}</h3>
          <p>{user.email}</p>
          <div className="badges-row">
            <span className={`status-pill ${user.isBanned ? "status-suspended" : "status-active"}`}>
              {user.isBanned ? "Suspended" : "Active Account"}
            </span>
            <span className="role-tag-pill">{user.role}</span>
          </div>
        </div>
      </div>

      <hr className="modal-divider" />

      {/* Profile Field Details Grid */}
      <div className="user-details-grid font-mono">
        <div className="detail-field">
          <label>User ID</label>
          <span>{user._id}</span>
        </div>
        <div className="detail-field">
          <label>First Name</label>
          <span>{user.firstName || "N/A"}</span>
        </div>
        <div className="detail-field">
          <label>Last Name</label>
          <span>{user.lastName || "N/A"}</span>
        </div>
        <div className="detail-field">
          <label>Email Address</label>
          <span>{user.email}</span>
        </div>
        <div className="detail-field">
          <label>Registration Date</label>
          <span>{new Date(user.createdAt).toLocaleString()}</span>
        </div>
        <div className="detail-field">
          <label>Password Verification</label>
          <span>{user.passwordResetVerified ? "Verified Reset" : "Standard Pass"}</span>
        </div>
      </div>

      <hr className="modal-divider" />

      {/* Admin Privilege & Control Actions */}
      <div className="user-modal-actions-box">
        <h4>Administrative Controls</h4>
        <div className="role-control-row">
          <div className="role-select-box">
            <label htmlFor="modal-role-select">Access Privilege:</label>
            <select
              id="modal-role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={submitting}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRoleSave}
            disabled={selectedRole === user.role || submitting}
          >
            Update Role
          </Button>
        </div>

        <div className="status-control-row">
          <p>Account Governance State:</p>
          <Button
            variant={user.isBanned ? "outline" : "danger"}
            size="sm"
            onClick={handleBanToggleAction}
            disabled={submitting}
          >
            {user.isBanned ? "Reactivate Account" : "Suspend Account"}
          </Button>
        </div>
      </div>
    </div>
  );
}