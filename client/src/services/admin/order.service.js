import API from "../api";

export const AdminOrderService = {
  getAllOrders: async () => {
    try {
      const response = await API.get("/orders");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch orders" };
    }
  },

 getOrderById: async (orderId) => {
    try {
      const response = await API.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch order details" };
    }
  },

  updateOrderStatus: async (orderId, updatePayload) => {
    try {
      const response = await API.patch(`/orders/${orderId}`, updatePayload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update order" };
    }
  },

  deleteOrderById: async (orderId) => {
    try {
      const response = await API.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete order" };
    }
  }
};