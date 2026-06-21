import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoutes() {
  
  const { user } = useSelector((state) => state.auth);

    return user ? <Outlet /> : <Navigate to="/login" replace />;
  
}
