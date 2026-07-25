import React from "react";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import StatCard from "./components/StatCard/StatCard";
import SalesChart from "./components/SalesChart/SalesChart";
import RecentActivity from "./components/RecentActivity/RecentActivity";
// import {
//   FiUsers,
//   FiBox,
//   FiShoppingBag,
//   FiDollarSign,
//   FiRefreshCw,
//   FiAlertCircle,
// } from "react-icons/fi";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const {
    stats,
    sales,
    activity,
    timeframe,
    setTimeframe,
    loading,
    error,
    refetch,
  } = useAdminDashboard();

  if (loading) {
    return (
      <div className="dashboard-loading-state">
        {/* <FiRefreshCw className="spin-icon loading-icon" /> */}
        <p>Gathering system analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error-state">
        {/* <FiAlertCircle className="error-icon" /> */}
        <h3>Failed to load dashboard data</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={refetch}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-view">
      {/* Page Title & Actions */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">System Overview</h1>
          <p className="dashboard-subtitle">
            Real-time business performance analytics and system activities
          </p>
        </div>
        <button className="btn-refresh-dashboard" onClick={refetch}>
          {/* <FiRefreshCw />  */}
          Refresh Data
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
        //   icon={FiUsers}
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts}
        //   icon={FiBox}
          color="purple"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders}
        //   icon={FiShoppingBag}
          color="amber"
        />
        <StatCard
          title="Total Revenue"
          value={stats?.totalRevenue}
        //   icon={FiDollarSign}
          color="green"
          isCurrency={true}
        />
      </div>

      {/* Sales Performance Timeline */}
      <SalesChart
        salesData={sales}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />

      {/* Recent System Activity */}
      <RecentActivity
        recentOrders={activity?.recentOrders}
        recentUsers={activity?.recentUsers}
      />
    </div>
  );
};

export default AdminDashboard;