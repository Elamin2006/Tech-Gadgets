import React from "react";
import Button from "../../../../../components/common/Button/Button";
import "./UserTable.css";

export default function UserTable({
  users = [],
  onViewDetails,
  onToggleBan,
  onDeleteUser,
  onRoleChange,
}) {
  if (users.length === 0) {
    return (
      <div className="user-table-empty">
        <span className="material-symbols-outlined empty-icon">group_off</span>
        <p>No users found matching the selected filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="user-table-wrapper">
      <table className="user-data-table">
        <thead>
          <tr>
            <th>User Account</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined Date</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "N/A";
            const initial = fullName.charAt(0).toUpperCase();

            return (
              <tr key={user._id} className={user.isBanned ? "row-suspended" : ""}>
                <td>
                  <div className="user-identity-cell">
                    <div className="user-avatar">{initial}</div>
                    <div className="identity-info">
                      <span className="user-name">{fullName}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <select
                    className="role-inline-select"
                    value={user.role}
                    onChange={(e) => onRoleChange(user._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>
                  <span
                    className={`status-pill ${
                      user.isBanned ? "status-suspended" : "status-active"
                    }`}
                  >
                    {user.isBanned ? "Suspended" : "Active"}
                  </span>
                </td>

                <td className="date-cell">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </td>

                <td>
                  <div className="actions-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(user)}
                      aria-label="View Details"
                      icon="visibility"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      className={user.isBanned ? "btn-unban" : "btn-ban"}
                      onClick={() => onToggleBan(user)}
                      aria-label={user.isBanned ? "Reactivate User" : "Suspend User"}
                      icon={user.isBanned ? "lock_open" : "block"}
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      className="btn-danger-action"
                      onClick={() => onDeleteUser(user)}
                      aria-label="Delete User"
                      icon="delete"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}