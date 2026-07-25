import React from "react";
import "./RecentActivity.css";

const RecentActivity = ({ recentOrders = [], recentUsers = [] }) => {
  return (
    <div className="activity-grid">
      {/* Recent Orders Card */}
      <div className="activity-card">
        <div className="activity-header">
          <div className="header-title-box">
            <span className="material-symbols-outlined header-icon text-primary">
              shopping_bag
            </span>
            <h3>Recent Orders</h3>
          </div>
          <span className="activity-badge">{recentOrders.length} Latest</span>
        </div>

        <div className="activity-list">
          {recentOrders.length === 0 ? (
            <p className="no-activity">No recent orders recorded.</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order._id} className="activity-item">
                <div className="item-main">
                  <span className="item-id">
                    #{order._id?.substring(order._id.length - 8)}
                  </span>
                  <span className="item-sub">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="item-meta">
                  <span className="item-amount">
                    ${order.totalOrderPrice?.toFixed(2) || "0.00"}
                  </span>
                  <span className={`status-pill status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Registered Users Card */}
      <div className="activity-card">
        <div className="activity-header">
          <div className="header-title-box">
            <span className="material-symbols-outlined header-icon text-secondary">
              person_add
            </span>
            <h3>New Users</h3>
          </div>
          <span className="activity-badge">{recentUsers.length} Latest</span>
        </div>

        <div className="activity-list">
          {recentUsers.length === 0 ? (
            <p className="no-activity">No new user signups.</p>
          ) : (
            recentUsers.map((user) => (
              <div key={user._id} className="activity-item">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="item-main">
                  <span className="item-id">{user.name || "Anonymous User"}</span>
                  <span className="item-sub">{user.email}</span>
                </div>
                <div className="item-meta">
                  <span className="role-tag">{user.role || "user"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;