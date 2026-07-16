import API from "../api";

const OrderService = {
  createCashOrder: async (shippingAddress) => {
    try {
      const response = await API.post("/orders", { shippingAddress });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to place order" };
    }
  },

  getAllOrders: async () => {
    try {
      const response = await API.get("/orders");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch orders" };
    }
  },

  getMyOrders: async () => {
    try {
      const response = await API.get(`/orders/my-orders`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch your orders" };
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await API.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch order details" }
      );
    }
  },
};

export default OrderService;
