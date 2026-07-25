import React from "react";
import "./StatCard.css";

const StatCard = ({
  title,
  value,
  icon,
  iconName,
  colorTheme = "primary",
  isCurrency = false,
}) => {
  const displayIcon = icon || iconName || "analytics";

  const formattedValue = isCurrency
    ? `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : Number(value || 0).toLocaleString("en-US");

  return (
    <div className="stat-card">
      <div className="stat-card-body">
        <span className="stat-card-title">{title}</span>
        <h3 className="stat-card-value">{formattedValue}</h3>
      </div>
      <div className={`stat-card-icon-wrapper theme-${colorTheme}`}>
        <span className="material-symbols-outlined stat-card-icon">
          {displayIcon}
        </span>
      </div>
    </div>
  );
};

export default StatCard;