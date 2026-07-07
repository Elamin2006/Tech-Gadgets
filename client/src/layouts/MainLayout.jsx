import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function MainLayout() {
  return (
    <div className="app-layout-container d-flex flex-column min-vh-100">
      <Navbar />
      
      <main className="flex-grow-1" id="main-content" aria-label="Main Content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}