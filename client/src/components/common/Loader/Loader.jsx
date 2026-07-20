import React from "react";
import PropTypes from "prop-types";
import "./Loader.css";

export default function Loader({ message = "Loading...", size = "md" }) {
  return (
    <div className={`app-loader-container loader-size-${size}`}>
      <div className="app-spinner"></div>
      {message && <p className="app-loader-text">{message}</p>}
    </div>
  );
}

Loader.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};