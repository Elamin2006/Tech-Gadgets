import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthService } from "../services/auth.service"; 

export default function ProtectedRoutes({ allowedRoles }) {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  const isAuthenticated = Boolean(user || AuthService.isAuthenticated());

  const userRole = user?.role || localStorage.getItem("userRole") || "user";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}