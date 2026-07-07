import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchCart } from "../store/slices/cartSlice";
import { ToastContainer } from "react-toastify";

// Layout Wrapper
import MainLayout from "../layouts/MainLayout";

// Views / Pages
import Home from "../pages/Home.jsx";
import Login from "../pages/Login/Login.jsx";
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
