import API from "../api";

export const ProductService = {
  getAllProducts: async (params = {}) => {
    try {
      const response = await API.get("/products", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch products" };
    }
  },

  getProductById: async (id) => {
    try {
      const response = await API.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch product details" };
    }
  }
};