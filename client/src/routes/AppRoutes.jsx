import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Cart from "../pages/Cart";

import ProtectedRoute from "./ProtectedRoute";
export default function AppRoutes() {
  return (
    <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/cart" element={<Cart />} />
                </Route>

                <Route path="*" element={<h2 style={{ textAlign: "center", marginTop: "50px" }}>404 - Page Not Found 🚫</h2>} />
            </Routes>
        </Router>
  )
}
