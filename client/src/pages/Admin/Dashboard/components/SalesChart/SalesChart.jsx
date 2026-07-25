import React from "react";
import "./SalesChart.css";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const SalesChart = ({ salesData, timeframe, onTimeframeChange }) => {
  // Determine highest revenue value for bar height relative percentages
  const maxRevenue = Math.max(...salesData.map((d) => d.revenue || 0), 100);

  return (
    <div className="sales-chart-card">
      <div className="sales-chart-header">
        <div>
          <h3 className="chart-title">Revenue Overview</h3>
          <p className="chart-subtitle">Aggregated sales performance performance timeline</p>
        </div>

        {/* Timeframe selector */}
        <div className="timeframe-toggle-group">
          <button
            className={`btn-timeframe ${timeframe === "monthly" ? "active" : ""}`}
            onClick={() => onTimeframeChange("monthly")}
          >
            Monthly
          </button>
          <button
            className={`btn-timeframe ${timeframe === "yearly" ? "active" : ""}`}
            onClick={() => onTimeframeChange("yearly")}
          >
            Yearly
          </button>
        </div>
      </div>

      {salesData.length === 0 ? (
        <div className="chart-empty-state">No sales recorded for this period yet.</div>
      ) : (
        <div className="chart-bars-container">
          {salesData.map((item, index) => {
            const label = item._id?.month
              ? `${monthNames[item._id.month - 1]} ${item._id.year}`
              : `Year ${item._id?.year || ""}`;
            const fillPercentage = Math.round(((item.revenue || 0) / maxRevenue) * 100);

            return (
              <div key={index} className="chart-bar-column">
                <div className="bar-wrapper">
                  <div className="bar-tooltip">
                    <span>${item.revenue?.toLocaleString() || 0}</span>
                    <small>{item.orders} orders</small>
                  </div>
                  <div
                    className="bar-fill"
                    style={{ height: `${Math.max(fillPercentage, 6)}%` }}
                  />
                </div>
                <span className="bar-label">{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SalesChart;