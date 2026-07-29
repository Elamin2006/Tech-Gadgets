import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthService } from "../services/auth.service";

export default function AdminRoute() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const activeUser = user || AuthService.getCurrentUser();

  if (!AuthService.isAuthenticated() || !activeUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (activeUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}