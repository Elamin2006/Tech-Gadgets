import API from "../api";

export const AdminUserService = {
  getAllUsers: async (params = {}) => {
    try {
      const response = await API.get("/admin/users", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch user list" };
    }
  },

  getUserById: async (id) => {
    try {
      const response = await API.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch user profile" };
    }
  },

  updateUserRole: async (id, role) => {
    try {
      const response = await API.patch(`/admin/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update user privilege" };
    }
  },

  toggleUserBanStatus: async (id, isBanned) => {
    try {
      const response = await API.patch(`/admin/users/${id}/status`, { isBanned });
      return response.data;
    } catch (error) {
      const defaultMsg = isBanned ? "Failed to suspend user" : "Failed to reactivate user";
      throw error.response?.data || { message: defaultMsg };
    }
  },

  deleteUserAccount: async (id) => {
    try {
      const response = await API.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete user account" };
    }
  }
};