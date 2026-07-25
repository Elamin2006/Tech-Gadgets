import { useState, useEffect, useCallback } from "react";
import { AdminDashboardService } from "../../../../services/admin/dashboard.service";

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [activity, setActivity] = useState({ recentOrders: [], recentUsers: [] });
  const [timeframe, setTimeframe] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Execute parallel requests for maximum speed
      const [statsRes, salesRes, activityRes] = await Promise.all([
        AdminDashboardService.getStatsSummary(),
        AdminDashboardService.getSalesPerformance(timeframe),
        AdminDashboardService.getRecentActivityLog(),
      ]);

      setStats(statsRes.data || null);
      setSales(salesRes.data || []);
      setActivity(activityRes.data || { recentOrders: [], recentUsers: [] });
    } catch (err) {
      setError(err.message || "An unexpected error occurred while loading dashboard metrics.");
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    sales,
    activity,
    timeframe,
    setTimeframe,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};