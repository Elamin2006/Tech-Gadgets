import API from "../api";

export const AdminProductService = {
  getAllProducts: async () => {
    try {
      const response = await API.get("/products");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch products" };
    }
  },
  createProduct: async (formData) => {
    try {
      const response = await API.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create product" };
    }
  },

  updateProduct: async (id, formData) => {
    try {
      const response = await API.patch(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update product" };
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await API.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete product" };
    }
  }
};
