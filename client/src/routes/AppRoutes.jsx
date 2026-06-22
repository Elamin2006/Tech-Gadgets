import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "../pages/Home.jsx";
import Login from "../pages/Login/Login.jsx";
import Cart from "../pages/Cart.jsx";
import Navbar from "../components/Navbar/Navbar.jsx";

import ProtectedRoutes from "./ProtectedRoutes.jsx";
export default function AppRoutes() {
  return (
    <Router>
        <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                

                <Route element={<ProtectedRoutes />}>
                    <Route path="/cart" element={<Cart />} />
                </Route>

                <Route path="*" element={<h2 style={{ textAlign: "center", marginTop: "50px" }}>404 - Page Not Found 🚫</h2>} />
            </Routes>
        </Router>
  )
}
