import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const { user } = useSelector((state) => state.auth);

  // Fallback check to localStorage in case store hydration is in progress
  const activeUser = user || JSON.parse(localStorage.getItem("user") || "null");

  if (!activeUser || activeUser.role !== "admin") {
    // Redirect standard users to unauthorized status or login
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}