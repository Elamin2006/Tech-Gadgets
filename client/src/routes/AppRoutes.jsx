import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react"; 
import { useDispatch } from "react-redux"; 
import { fetchCart } from "../store/slices/cartSlice"; 

import Home from "../pages/Home.jsx";
import Login from "../pages/Login/Login.jsx";
import Cart from "../pages/Cart.jsx";
import Navbar from "../components/Navbar/Navbar.jsx";
import Register from "../pages/Register/Register";

import ProtectedRoutes from "./ProtectedRoutes.jsx";
import Shop from "../pages/Shop/Shop";

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
        <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/shop" element={<Shop />} />

                <Route element={<ProtectedRoutes />}>
                    <Route path="/cart" element={<Cart />} />
                </Route>

                <Route path="*" element={<h2 style={{ textAlign: "center", marginTop: "50px" }}>404 - Page Not Found </h2>} />
            </Routes>
        </Router>
  )
}
