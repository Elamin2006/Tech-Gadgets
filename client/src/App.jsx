import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { fetchCart } from "./store/slices/cartSlice";
import { AuthService } from "./services/auth.service";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const isAdmin = user?.role === "admin";
    
    if (AuthService.isAuthenticated() && !isAdmin) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  return (
    <>
      <ToastContainer theme="dark" toastClassName="elite-toast" />
      <AppRoutes />
    </>
  );
}