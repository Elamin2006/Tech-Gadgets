import React from "react";
import Button from "../../../../../components/common/Button/Button";
import "./OrderTable.css";

export default function OrderTable({
  orders = [],
  onViewDetails = () => {},
  onEditStatus = () => {},
  onDeleteOrder = () => {},
}) {
  if (!orders || orders.length === 0) {
    return (
      <div className="dark-table-empty">
        <span className="empty-icon">📦</span>
        <p>No orders found matching your criteria.</p>
      </div>
    );
  }

  // Maps exact backend enum: ["pending", "completed", "canceled"]
  const getStatusClass = (status = "") => {
    switch (status.toLowerCase()) {
      case "completed":
        return "dark-badge-completed";
      case "canceled":
      case "cancelled":
        return "dark-badge-canceled";
      case "pending":
      default:
        return "dark-badge-pending";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCustomerName = (order = {}) => {
    const customer = order.userId || order.user || order.customer || {};
    return (
      order.customerName ||
      customer.name ||
      order.shippingAddress?.name ||
      "System Guest"
    );
  };

  const getCustomerEmail = (order = {}) => {
    const customer = order.userId || order.user || order.customer || {};
    return order.customerEmail || customer.email || "N/A";
  };

  return (
    <div className="dark-order-table-container">
      <table className="dark-order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>City</th>
            <th>Date</th>
            <th>Total Price</th>
            <th>Payment Method</th>
            <th>Paid</th>
            <th>Delivered</th>
            <th>Status</th>
            <th className="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const customerName = getCustomerName(o);
            const customerEmail = getCustomerEmail(o);
            const orderPrice =
              typeof o.totalOrderPrice === "number" ? o.totalOrderPrice : 0;

            return (
              <tr key={o._id} className="dark-table-row">
                {/* Order ID */}
                <td>
                  <button
                    type="button"
                    className="order-id-link font-mono"
                    onClick={() => onViewDetails(o)}
                    title="Click to view full order details"
                  >
                    #{o._id ? o._id.substring(o._id.length - 8) : "N/A"}
                  </button>
                </td>

                {/* Customer Details */}
                <td>
                  <div className="customer-info-box">
                    <span className="customer-name font-mono">
                      {customerName}
                    </span>
                    <span className="customer-email">{customerEmail}</span>
                  </div>
                </td>

                {/* City */}
                <td className="city-cell">
                  {o.shippingAddress?.city || "N/A"}
                </td>

                {/* Date */}
                <td>
                  <span className="font-mono text-muted">
                    {formatDate(o.createdAt)}
                  </span>
                </td>

                {/* Price */}
                <td>
                  <span className="font-mono text-price">
                    ${orderPrice.toFixed(2)}
                  </span>
                </td>

                {/* Payment Method */}
                <td>
                  <span className="payment-method-tag">
                    {o.paymentMethod || "cash"}
                  </span>
                </td>

                {/* Paid Flag */}
                <td>
                  <span
                    className={`dark-pill ${o.isPaid ? "pill-paid" : "pill-unpaid"}`}
                  >
                    <span className="pill-dot"></span>
                    {o.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </td>

                {/* Delivered Flag */}
                <td>
                  <span
                    className={`dark-pill ${o.isDelivered ? "pill-delivered" : "pill-pending"}`}
                  >
                    <span className="pill-dot"></span>
                    {o.isDelivered ? "Yes" : "No"}
                  </span>
                </td>

                {/* Order Status */}
                <td>
                  <span
                    className={`dark-status-badge ${getStatusClass(o.status)}`}
                  >
                    <span className="badge-glow-dot"></span>
                    {(o.status || "pending").toUpperCase()}
                  </span>
                </td>

                {/* Action Buttons */}
                <td>
                  <div className="order-actions-cell">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails && onViewDetails(o)}
                      icon="visibility"
                      title="View Details"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditStatus && onEditStatus(o)}
                      icon="edit_note"
                      title="Change Order Status"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDeleteOrder && onDeleteOrder(o)}
                      icon="delete"
                      title="Delete Order"
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
