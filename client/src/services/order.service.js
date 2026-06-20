import API from "./api";

export const OrderService = {
    
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

    getOrderById: async (orderId) => {
        try {
            const response = await API.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch order details" };
        }
    },

    updateOrderStatus: async (orderId, updateData) => {
        try {
            const response = await API.patch(`/orders/${orderId}`, updateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update order status" };
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