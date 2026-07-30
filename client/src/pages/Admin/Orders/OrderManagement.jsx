import React, { useState, useMemo, useCallback } from "react";
import useOrders from "./hooks/useAdminOrders";
import useDebounce from "../../../hooks/useDebounce";
import OrderTable from "./components/OrderTable/OrderTable";
import OrderDetailsModal from "./components/OrderDetailsModal/OrderDetailsModal";
import Modal from "../../../components/common/Modal/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog/ConfirmDialog";
import Loader from "../../../components/common/Loader/Loader";
import Button from "../../../components/common/Button/Button";
import { toast } from "react-toastify";
import "./OrderManagement.css";

// Aligned with backend Mongoose Enum: ["pending", "completed", "canceled"]
const STATUS_TABS = [
  { id: "all", label: "ALL" },
  { id: "pending", label: "PENDING" },
  { id: "completed", label: "COMPLETED" },
  { id: "canceled", label: "CANCELED" },
];

export default function OrderManagement() {
  const {
    orders = [],
    loading,
    error,
    refresh,
    updateOrderStatus,
    getOrderDetails,
    deleteOrder,
  } = useOrders();

  // Search filter and tab selection
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Detail Modal State
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Delete Dialog State
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Filtered orders list — depends on debounced query, not raw keystrokes
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Tab Filter
      const orderStatus = order.status?.toLowerCase() || "pending";
      if (activeTab !== "all" && orderStatus !== activeTab) {
        return false;
      }

      // 2. Search Filter — Order ID, customer name/email, phone, or city
      const search = debouncedSearchQuery.toLowerCase().trim();
      if (!search) return true;

      const customerObj = order.userId || order.user; // Handles populated backend object
      const idMatch = order._id?.toLowerCase().includes(search);
      const nameMatch = customerObj?.name?.toLowerCase().includes(search);
      const emailMatch = customerObj?.email?.toLowerCase().includes(search);
      const phoneMatch = order.shippingAddress?.phone?.toLowerCase().includes(search);
      const cityMatch = order.shippingAddress?.city?.toLowerCase().includes(search);

      return idMatch || nameMatch || emailMatch || phoneMatch || cityMatch;
    });
  }, [orders, activeTab, debouncedSearchQuery]);

  // Metric aggregates
  const metrics = useMemo(() => {
    const total = orders.length;

    const revenue = orders
      .filter((o) => o.status?.toLowerCase() !== "canceled")
      .reduce((acc, curr) => acc + (curr.totalOrderPrice || 0), 0);

    const pendingCount = orders.filter(
      (o) => o.status?.toLowerCase() === "pending"
    ).length;

    return { total, revenue, pendingCount };
  }, [orders]);

  // Handler for viewing order breakdown modal
  const handleViewDetails = useCallback((order) => {
    setSelectedOrderId(order._id);
    setIsDetailOpen(true);
  }, []);

  
  const handleStatusChange = useCallback(
    (orderId, updatePayload) => updateOrderStatus(orderId, updatePayload),
    [updateOrderStatus]
  );

  // Delete confirmation handlers
  const handleDeleteClick = useCallback((order) => {
    setOrderToDelete(order);
    setIsConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    setDeleteSubmitting(true);
    try {
      await deleteOrder(orderToDelete._id);
      toast.success("Order deleted successfully.");
      setIsConfirmOpen(false);
      setOrderToDelete(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete order.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="order-management-loading">
        <Loader message="Loading orders..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-management-error" role="alert">
        <span className="material-symbols-outlined error-icon">error</span>
        <h3 className="error-title">Error Loading Orders</h3>
        <p className="error-desc">{error}</p>
        <Button variant="outline" onClick={refresh} icon="refresh">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="order-management-view">
      {/* Header Block */}
      <div className="order-view-header">
        <div className="title-area">
          <h2 className="orders-title">Order Management</h2>
          <span className="orders-subtitle">
            Track and manage customer order fulfillment
          </span>
        </div>
        <Button variant="outline" onClick={refresh} icon="refresh" aria-label="Refresh order list">
          Refresh Orders
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="orders-metrics-grid font-mono">
        <div className="metric-card">
          <span className="metric-label">Total Orders</span>
          <span className="metric-value">{metrics.total}</span>
          <span className="metric-tag">All-time orders</span>
        </div>
        <div className="metric-card highlight-revenue">
          <span className="metric-label">Total Revenue</span>
          <span className="metric-value text-highlight">
            ${metrics.revenue.toFixed(2)}
          </span>
          <span className="metric-tag">Excludes canceled</span>
        </div>
        <div className="metric-card highlight-pending">
          <span className="metric-label">Pending Orders</span>
          <span className="metric-value text-yellow">{metrics.pendingCount}</span>
          <span className="metric-tag">Awaiting processing</span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="orders-control-panel">
        <div className="tab-row font-mono" role="tablist" aria-label="Order Status Filters">
          {STATUS_TABS.map((tab) => (
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
            className="orders-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, customer, email, phone, city..."
            aria-label="Search orders"
          />
        </div>
      </div>

      {/* Table Section */}
      <OrderTable
        orders={filteredOrders}
        onViewDetails={handleViewDetails}
        onEditStatus={handleViewDetails}
        onDeleteOrder={handleDeleteClick}
      />

      {/* View Breakdown Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrderId(null);
        }}
        title="Order Details"
        size="lg"
      >
        <OrderDetailsModal
          orderId={selectedOrderId}
          fetchOrderDetailsFn={getOrderDetails}
          onUpdateOrder={handleStatusChange}
          toast={toast}
        />
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setOrderToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Order"
        message={`Are you sure you want to delete Order "${orderToDelete?._id}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteSubmitting}
      />
    </div>
  );
}
