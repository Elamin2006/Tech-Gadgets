import React, { useEffect, useState } from "react";
import "./OrderDetailsModal.css";

const OrderDetailsModal = ({
  orderId,
  fetchOrderDetailsFn,
  onUpdateOrder,
  toast,
}) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrderDetails = async () => {
      if (!orderId) return;
      setLoading(true);
      setError(null);

      try {
        const data = await fetchOrderDetailsFn(orderId);
        if (isMounted) {
          // Safely unwrap order whether nested under data or returned directly
          const resolvedOrder = data?.data?.data || data?.data || data;
          setOrder(resolvedOrder);
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg =
            err?.message || "Failed to load order details. Please try again.";
          setError(errorMsg);
          toast?.error?.(errorMsg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrderDetails();

    return () => {
      isMounted = false;
    };
  }, [orderId, fetchOrderDetailsFn, toast]);

  const handleStatusToggle = async (field, value) => {
    if (!orderId || isSubmitting) return;

    setIsSubmitting(true);
    setActionError(null);
    const updatePayload = { [field]: value };

    try {
      const res = await onUpdateOrder(orderId, updatePayload);

      // Check both wrapper formats: { success: true } or { status: "success" }
      const isSuccess =
        res?.success === true ||
        res?.status === "success" ||
        res?.data?.status === "success";

      // Safely extract updated order object
      const updatedOrder =
        res?.data?.data || res?.data || (res?._id ? res : null);

      if (isSuccess || updatedOrder) {
        if (updatedOrder) {
          setOrder((prev) => {
            const nextOrder = prev
              ? { ...prev, ...updatedOrder }
              : updatedOrder;
            if (!nextOrder.userId && prev?.userId)
              nextOrder.userId = prev.userId;
            if (!nextOrder.user && prev?.user) nextOrder.user = prev.user;
            if (!nextOrder.customer && prev?.customer)
              nextOrder.customer = prev.customer;
            return nextOrder;
          });
        } else {
          // Fallback local optimistic update if server returned success without object
          setOrder((prev) => (prev ? { ...prev, [field]: value } : prev));
        }

        const successMsg = `Order ${field} updated successfully`;
        toast?.success?.(successMsg);
      } else {
        const errorMsg =
          res?.error || res?.message || `Failed to update ${field}`;
        setActionError(errorMsg);
        toast?.error?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err?.message || "An unexpected error occurred.";
      setActionError(errorMsg);
      toast?.error?.(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="order-details-state">
        <span className="material-symbols-outlined spin-icon icon-large">
          sync
        </span>
        <p>Loading order invoice...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="order-details-state error-state">
        <span className="material-symbols-outlined icon-large text-danger">
          error
        </span>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!order) return null;

  const customerName =
    order.customerName ||
    order.user?.name ||
    order.userId?.name ||
    order.customer?.name ||
    order.shippingAddress?.name ||
    "Guest";

  const customerEmail =
    order.customerEmail ||
    order.userId?.email ||
    order.user?.email ||
    order.customer?.email ||
    "N/A";

  return (
    <div className="order-details-container">
      {/* Banner for Action Errors */}
      {actionError && (
        <div className="action-error-banner">
          <span className="material-symbols-outlined">warning</span>
          <span>{actionError}</span>
        </div>
      )}

      {/* Invoice Meta Bar */}
      <div className="details-header-card">
        <div>
          <span className="order-id-title">
            Order #{order._id?.substring(order._id.length - 8)}
          </span>
          <span className="order-date-sub">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="status-control-box">
          <label className="status-label">Status:</label>
          <select
            className={`modal-status-select status-${order.status}`}
            value={order.status || "pending"}
            disabled={isSubmitting}
            onChange={(e) => handleStatusToggle("status", e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>

      {/* Detail Cards Grid */}
      <div className="details-grid-3">
        {/* Customer Information */}
        <div className="info-card">
          <div className="card-header-icon">
            <span className="material-symbols-outlined">person</span>
            <strong>Customer Info</strong>
          </div>
          <p className="info-text">Name: {customerName}</p>
          <p className="info-text">Email: {customerEmail}</p>
        </div>

        {/* Shipping Address */}
        <div className="info-card">
          <div className="card-header-icon">
            <span className="material-symbols-outlined">location_on</span>
            <strong>Shipping Address</strong>
          </div>
          <p className="info-text">
            Details: {order.shippingAddress?.details || "N/A"}
          </p>
          <p className="info-text">
            City: {order.shippingAddress?.city || "N/A"}
          </p>
          <p className="info-text">
            Phone: {order.shippingAddress?.phone || "N/A"}
          </p>
        </div>

        {/* Payment & Delivery Controls */}
        <div className="info-card">
          <div className="card-header-icon">
            <span className="material-symbols-outlined">schedule</span>
            <strong>Fulfillment Controls</strong>
          </div>
          <div className="toggle-row">
            <span>Payment:</span>
            <button
              type="button"
              className={`btn-toggle ${order.isPaid ? "active" : ""}`}
              disabled={isSubmitting}
              onClick={() => handleStatusToggle("isPaid", !order.isPaid)}
            >
              {isSubmitting
                ? "Updating..."
                : order.isPaid
                  ? "Paid"
                  : "Mark Paid"}
            </button>
          </div>
          <div className="toggle-row">
            <span>Delivery:</span>
            <button
              type="button"
              className={`btn-toggle ${order.isDelivered ? "active" : ""}`}
              disabled={isSubmitting}
              onClick={() =>
                handleStatusToggle("isDelivered", !order.isDelivered)
              }
            >
              {isSubmitting
                ? "Updating..."
                : order.isDelivered
                  ? "Delivered"
                  : "Mark Delivered"}
            </button>
          </div>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="items-section">
        <h3 className="section-title">
          <span className="material-symbols-outlined">inventory_2</span>
          Ordered Items
        </h3>
        <table className="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th className="text-right">Unit Price</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems?.map((item, index) => {
              const product = item.productId;
              const productName =
                typeof product === "object"
                  ? product?.name || "Product"
                  : `Product ID: ${product}`;
              const productImg =
                typeof product === "object" ? product?.image : null;
              const itemPrice = typeof item.price === "number" ? item.price : 0;
              const itemQuantity =
                typeof item.quantity === "number" ? item.quantity : 0;

              return (
                <tr key={item._id || index}>
                  <td>
                    <div className="item-cell">
                      {productImg && (
                        <img
                          src={productImg}
                          alt={productName}
                          className="item-thumb"
                        />
                      )}
                      <span>{productName}</span>
                    </div>
                  </td>
                  <td className="text-right">${itemPrice.toFixed(2)}</td>
                  <td className="text-right">{itemQuantity}</td>
                  <td className="text-right font-bold">
                    ${(itemPrice * itemQuantity).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Box */}
      <div className="summary-box">
        <div className="summary-row">
          <span>Payment Method:</span>
          <span className="uppercase font-semibold">
            {order.paymentMethod || "cash"}
          </span>
        </div>
        <div className="summary-row total-row">
          <span>Total Order Amount:</span>
          <span>${order.totalOrderPrice?.toFixed(2) || "0.00"}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
