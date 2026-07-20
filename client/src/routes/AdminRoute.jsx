import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export default function AdminRoute() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Fallback check to localStorage 
  const activeUser = user || getStoredUser();
  const token = localStorage.getItem("token");

  if (!token || !activeUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (activeUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
