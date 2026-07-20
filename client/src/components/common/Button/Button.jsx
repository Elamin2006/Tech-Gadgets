import React from "react";
import PropTypes from "prop-types";
import "./Button.css";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  icon = null,
  loading = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`app-btn app-btn-${variant} app-btn-${size} ${loading ? "app-btn-loading" : ""} ${className}`}
      {...props}
    >
      {loading && <span className="btn-spinner" aria-hidden="true"></span>}
      {!loading && icon && <span className="material-symbols-outlined btn-icon">{icon}</span>}
      <span className="btn-content">{children}</span>
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary", "outline", "danger", "light"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
};