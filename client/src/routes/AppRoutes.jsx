import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCart } from "../store/slices/cartSlice";
import { ToastContainer } from "react-toastify";

import Home from "../pages/Home.jsx";
import Login from "../pages/Login/Login.jsx";
import Cart from "../pages/Cart/Cart.jsx";
import Navbar from "../components/Navbar/Navbar.jsx";
import Register from "../pages/Register/Register";

import ProtectedRoutes from "./ProtectedRoutes.jsx";
import Shop from "../pages/Shop/Shop";
import Product from "../pages/Product/Product.jsx";

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
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="elite-toast"
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shop" element={<Shop />} />
        <Route  path="/product/:id" element= {<Product/>}/>
        <Route element={<ProtectedRoutes />}>
          <Route path="/cart" element={<Cart />} />
        </Route>

        <Route
          path="*"
          element={
            <h2 style={{ textAlign: "center", marginTop: "50px" }}>
              404 - Page Not Found{" "}
            </h2>
          }
        />
      </Routes>
    </Router>
  );
}
