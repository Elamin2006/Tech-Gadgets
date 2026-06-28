import React, { useState, useEffect } from "react";
import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice.js";
import "./Navbar.css";

export default function NavBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { cartList, numOfCartItems, totalCartPrice } = useSelector((state) => state.cart) || { cartList: [] };

  const [expanded, setExpanded] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const scrollHandler = () => {
      if (window.scrollY >= 100) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", scrollHandler);
    
    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setExpanded(false);
    navigate("/login");
  };

  return (
    <Navbar
      fixed="top"
      expand="md"
      expanded={expanded}
      onToggle={(isExpanded) => setExpanded(isExpanded)}
      className={isFixed ? "elite-navbar fixed" : "elite-navbar"}
    >
      <Container className="navbar-container">
        
        <Navbar.Brand as={Link} to="/" className="elite-brand">
          <ion-icon name="bag"></ion-icon>
          <span style={{ fontSize: "1.4rem" }}>TECH_ELITE</span>
        </Navbar.Brand>

        <div className="d-flex align-items-center">
          <div className="media-cart">
            <Link
              aria-label="Go to Cart Page"
              to="/cart"
              className="cart-wrapper"
              data-num={cartList.length}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="cart-icon">
                <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 
                0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75
                 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 
                 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 
                 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
              </svg>
            </Link>
          </div>

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggler">
            <span className="toggler-icon-bar"></span>
            <span className="toggler-icon-bar"></span>
            <span className="toggler-icon-bar"></span>
          </Navbar.Toggle>
        </div>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="d-flex flex-grow-1 pe-3 align-items-md-center justify-content-sm-center gap-2">
            
            <Nav className="nav-links d-flex m-auto">
            <Nav.Item>
              <Link aria-label="Go to Home Page" 
              className="elite-nav-link" to="/" 
              onClick={() => setExpanded(false)}
              >
                Home
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link aria-label="Go to Shop Page" 
              className="elite-nav-link" to="/shop" 
              onClick={() => setExpanded(false)}
              >
                Shop
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link aria-label="Go to Shop Page" 
              className="elite-nav-link" to="/shop" 
              onClick={() => setExpanded(false)}
              >
                Cart
              </Link>
            </Nav.Item>
            </Nav>

            <Nav className="d-flex align-items-center  gap-3">
            <Nav.Item className="expanded-cart">
              <Link aria-label="Go to Cart Page" to="/cart" className="cart-wrapper" data-num={cartList.length}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="cart-icon">
                  <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752
                   0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 
                   15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864
                    60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0
                     113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                </svg>
              </Link>
            </Nav.Item>

            {user ? (
              <>
                <Nav.Item className="ms-md-2">
                  <span style={{ color: "var(--color-on-surface-variant)", fontSize: "14px" }}>
                    Hello, <strong style={{ color: "var(--color-primary)" }}>{user.firstName}</strong>
                  </span>
                </Nav.Item>
                <Nav.Item>
                  <Button onClick={handleLogout} className="btn-sm px-3 py-2 rounded-3 btn-logout-elite">
                    Sign Out
                  </Button>
                </Nav.Item>
              </>
            ) : (
              <>
                <Nav.Item className="ms-md-2 d-flex justify-content-sm-center">
                  <Button as={Link} to="/login" variant="link" 
                  className="btn-signin-elite text-decoration-none p-0 pe-md-2" 
                  onClick={() => setExpanded(false)}
                  >
                    Sign In
                  </Button>
                </Nav.Item>
                <Nav.Item>
                  <Button 
                  as={Link} to="/register" 
                  className="px-3 py-2 rounded-3 btn-signup-elite" 
                  onClick={() => setExpanded(false)}
                  >
                    Sign Up
                  </Button>
                </Nav.Item>
              </>
            )}
            </Nav>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}