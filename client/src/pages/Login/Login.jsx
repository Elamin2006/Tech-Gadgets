import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Row, Col, Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login, resetAuthState } from "../../store/slices/authSlice";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );
  const redirectTo = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (isSuccess || user) {
      if (location.state?.from?.pathname) {
        navigate(location.state.from.pathname, { replace: true });
      } else {
        const defaultRoute = user?.role === "admin" ? "/admin/dashboard" : "/";
        navigate(defaultRoute, { replace: true });
      }
    }
    return () => {
      dispatch(resetAuthState());
    };
  }, [isSuccess, user, navigate, dispatch]);

  const validateForm = () => {
    let formErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      formErrors.email = "Email Address is required";
    } else if (!emailRegex.test(email)) {
      formErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      formErrors.password = "Password is required";
    } else if (password.length < 6) {
      formErrors.password = "Password must be at least 6 characters";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(login({ email, password }));
    }
  };

  return (
    <section className="login-page-section">
      <Container fluid className="login-container m-0 p-0 overflow-hidden">
        <Row className="g-0 min-vh-100">
          <Col
            lg={6}
            className="login-brand-side d-none d-lg-flex align-items-center justify-content-center"
          >
            <div className="tech-grid-overlay"></div>
            <div className="text-center px-5 z-1" style={{ maxWidth: "500px" }}>
              <h1 className="login-title" style={{ fontSize: "3.5rem" }}>
                TECH_ELITE
              </h1>
              <p
                className="mt-3"
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: "1.15rem",
                  lineHeight: "1.6",
                }}
              >
                The intersection of performance and precision. Access your elite
                command center.
              </p>
            </div>
          </Col>

          <Col
            xs={12}
            lg={6}
            className="d-flex flex-column align-items-center 
            justify-content-center  p-md-4 position-relative"
          >
            <div className="position-absolute top-0 start-50 translate-middle-x mt-4 d-lg-none">
              <span className="login-title h2">TECH_ELITE</span>
            </div>

            <div className="login-form-wrapper mt-5 mt-lg-0">
              <header className="mb-4 text-start">
                <h2 className="login-subtitle mb-2">Welcome Back to Login</h2>
                {/* <p
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: "15px",
                  }}
                >
                  Enter your credentials to access your professional workspace.
                </p> */}
              </header>

              {isError && (
                <Alert
                  variant="danger"
                  className="border-0 text-white d-flex align-items-center rounded-3 mb-4"
                  style={{ backgroundColor: "var(--color-error-container)" }}
                >
                  <span
                    className="material-symbols-outlined me-2"
                    style={{ color: "var(--color-error)" }}
                  >
                    error
                  </span>
                  <span
                    style={{
                      color: "var(--color-on-error-container)",
                      fontSize: "14px",
                    }}
                  >
                    {message}
                  </span>
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label className="custom-label text-uppercase mb-2">
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@tech-elite.io"
                    className="custom-input rounded-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    style={{ color: "var(--color-error)" }}
                  >
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="custom-label text-uppercase m-0">
                      Password
                    </Form.Label>
                    <Link
                      to="/forgot-password"
                      style={{
                        color: "var(--color-primary)",
                        fontSize: "12px",
                        fontWeight: "600",
                        textDecoration: "none",
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="custom-input rounded-3 pr-5"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      isInvalid={!!errors.password}
                    />
                    <button
                      type="button"
                      className="position-absolute top-50 end-0 translate-middle-y bg-transparent border-0 pe-3 password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ zIndex: 5 }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "20px", verticalAlign: "middle" }}
                      >
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                    <Form.Control.Feedback
                      type="invalid"
                      style={{ color: "var(--color-error)" }}
                    >
                      {errors.password}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-submit-elite w-100 rounded-3 py-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    ></div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Form>

              <footer className="text-center mt-4">
                <p
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: "14px",
                  }}
                >
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    style={{
                      color: "var(--color-primary)",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    Sign up
                  </Link>
                </p>
              </footer>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
