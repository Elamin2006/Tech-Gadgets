import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout/AdminLayout.jsx";

// Route Guards
import ProtectedRoutes from "./ProtectedRoutes.jsx";
import AdminRoute from "./AdminRoute.jsx";

// Shared UI (reusing the common)
import Loader from "../components/common/Loader/Loader";

// Lazy-loaded Public & User Views
const Home = lazy(() => import("../pages/Home.jsx"));
const Shop = lazy(() => import("../pages/Shop/Shop.jsx"));
const Product = lazy(() => import("../pages/Product/Product.jsx"));
const Cart = lazy(() => import("../pages/Cart/Cart.jsx"));
const Orders = lazy(() => import("../pages/Order/Order.jsx"));

// Lazy-loaded Auth Views
const Login = lazy(() => import("../pages/Login/Login.jsx"));
const Register = lazy(() => import("../pages/Register/Register.jsx"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword/ForgotPassword.jsx"));
const VerifyResetCode = lazy(() => import("../pages/VerifyResetCode/VerifyResetCode.jsx"));
const ResetPassword = lazy(() => import("../pages/ResetPassword/ResetPassword.jsx"));

// Lazy-loaded Admin Views
const AdminDashboard = lazy(() => import("../pages/Admin/Dashboard/AdminDashboard.jsx"));
const UserManagement = lazy(() => import("../pages/Admin/Users/UserManagement.jsx"));
const CategoryManagement = lazy(() => import("../pages/Admin/Categories/CategoryManagement.jsx"));
const ProductManagement = lazy(() => import("../pages/Admin/Products/ProductManagement.jsx"));
const OrderManagement = lazy(() => import("../pages/Admin/Orders/OrderManagement.jsx"));

// Fallback shown during lazy chunk loading, reuses the common Loader
const PageLoader = () => (
  <div className="d-flex align-items-center justify-content-center min-vh-100">
    <Loader message="Loading page..." size="lg" />
  </div>
);

export default function AppRoutes() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Main Layout Routes (With Navbar / Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<Product />} />

            {/* Protected User Routes */}
            <Route element={<ProtectedRoutes />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
            </Route>
          </Route>

          {/* Standalone Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-code" element={<VerifyResetCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Admin Portal Hierarchy */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route path="/admin/orders" element={<OrderManagement />} />
            </Route>
          </Route>

          {/* Catch-all 404 Route */}
          <Route
            path="*"
            element={
              <main className="d-flex align-items-center justify-content-center min-vh-100">
                <h2 className="text-center">404 - Page Not Found</h2>
              </main>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}