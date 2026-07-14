import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchCart } from "../store/slices/cartSlice";
import { ToastContainer } from "react-toastify";

// Layout Wrapper
import MainLayout from "../layouts/MainLayout";

// Admin Components
import AdminRoute from "./AdminRoute.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";

// Views / Pages
import Home from "../pages/Home.jsx";
import Login from "../pages/Login/Login.jsx";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword.jsx";
import VerifyResetCode from "../pages/VerifyResetCode/VerifyResetCode.jsx";  
import ResetPassword from "../pages/ResetPassword/ResetPassword.jsx";
import Cart from "../pages/Cart/Cart.jsx";
import Register from "../pages/Register/Register";
import Shop from "../pages/Shop/Shop";
import Product from "../pages/Product/Product.jsx";
import Orders from "../pages/Order/Order.jsx";
import ProtectedRoutes from "./ProtectedRoutes.jsx";

export default function AppRoutes() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchCart());
    }
  }, [dispatch]);

  return (
    <Router>
      <ToastContainer theme="dark" toastClassName="elite-toast" />

      <Routes>
        // Main Layout Routes With Navbar / Footer
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />

          // protected routes for authenticated users
          <Route element={<ProtectedRoutes />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
        </Route>

        // Login and Register pages are isolated from the main layout
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-code" element={<VerifyResetCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        // Protected Admin Portal Route Hierarchy
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<h1 style={{ color: "#f0f6fc" }}>OVERVIEW_STATS_PANEL</h1>} />
            <Route path="/admin/users" element={<h1 style={{ color: "#f0f6fc" }}>USER_NODES_LIST</h1>} />
            <Route path="/admin/products" element={<h1 style={{ color: "#f0f6fc" }}>INVENTORY_LOGS</h1>} />
            <Route path="/admin/orders" element={<h1 style={{ color: "#f0f6fc" }}>ORDER_TRANSACTIONS</h1>} />
          </Route>
        </Route>

        // catch all not found routes
        <Route
          path="*"
          element={
            <main className="d-flex align-items-center justify-content-center min-vh-100">
              <h2 className="text-center">404 - Page Not Found</h2>
            </main>
          }
        />
      </Routes>
    </Router>
  );
}
