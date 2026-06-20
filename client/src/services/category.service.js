import API from "./api";

export const CategoryService = {
    createCategory: async (categoryData) => {
        try {
            const response = await API.post("/categories", categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create category" };
        }
    },

    getAllCategories: async () => {
        try {
            const response = await API.get("/categories");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch categories" };
        }
    },

    getCategoryById: async (categoryId) => {
        try {
            const response = await API.get(`/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch category" };
        }
    },

    deleteCategory: async (categoryId) => {
        try {
            const response = await API.delete(`/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to delete category" };
        }
    }
};