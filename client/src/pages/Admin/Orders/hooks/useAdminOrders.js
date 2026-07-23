import { useState, useEffect, useCallback } from "react";
import { AdminOrderService } from "../../../../services/admin/order.service";

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminOrderService.getAllOrders();
      setOrders(res?.data || res || []);
    } catch (err) {
      console.error("[useOrders Fetch Error]", err);
      setError(err.message || "Failed to retrieve order logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, updatePayload) => {
    try {
      const res = await AdminOrderService.updateOrderStatus(orderId, updatePayload);
      const updated = res?.data || res;
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                ...updated,
                userId:
                  updated?.userId && typeof updated.userId === "object"
                    ? updated.userId
                    : o.userId,
              }
            : o
        )
      );
      return res;
    } catch (err) {
      console.error("[useOrders Update Status Error]", err);
      throw err;
    }
  }, []);

  const getOrderDetails = useCallback(async (orderId) => {
    try {
      const res = await AdminOrderService.getOrderById(orderId);
      return res?.data || res;
    } catch (err) {
      console.error("[useOrders Get Details Error]", err);
      throw err;
    }
  }, []);

  const deleteOrder = useCallback(async (orderId) => {
    try {
      const res = await AdminOrderService.deleteOrderById(orderId);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      return res;
    } catch (err) {
      console.error("[useOrders Delete Error]", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    updateOrderStatus,
    getOrderDetails,
    deleteOrder,
  };
}
