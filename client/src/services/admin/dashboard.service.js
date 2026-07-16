import API from "../api";

export const AdminDashboardService = {
  getStatsSummary: async () => {
    try {
      const response = await API.get("/admin/dashboard/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch dashboard stats" };
    }
  },

  getSalesPerformance: async (timeframe = "monthly") => {
    try {
      const response = await API.get("/admin/dashboard/sales", { params: { timeframe } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch sales performance data" };
    }
  },

  getRecentActivityLog: async () => {
    try {
      const response = await API.get("/admin/dashboard/activity");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch system activity log" };
    }
  }
};