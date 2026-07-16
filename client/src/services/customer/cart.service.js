import API from "../api";

export const CartService = {
  getCart: async () => {
    try {
      const response = await API.get("/cart");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to load cart" };
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await API.post("/cart", { productId, quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to add item to cart" };
    }
  },

  removeFromCart: async (itemId) => {
    try {
      const response = await API.delete(`/cart/${itemId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to remove item from cart" }
      );
    }
  },

  updateCartItemQuantity: async (itemId, quantity) => {
    try {
      const response = await API.patch(`/cart/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to update cart item quantity",
        }
      );
    }
  },

  clearCart: async () => {
    try {
      const response = await API.delete("/cart");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to clear cart" };
    }
  },
};
