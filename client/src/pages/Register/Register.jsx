import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Row, Col, Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, resetAuthState } from "../../store/slices/authSlice";
import "./Register.css";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isSuccess || user) {
      navigate("/");
    }
    return () => {
      dispatch(resetAuthState());
    };
  }, [isSuccess, user, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    let formErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) formErrors.firstName = "Required";
    if (!formData.lastName.trim()) formErrors.lastName = "Required";

    if (!formData.email) {
      formErrors.email = "Required";
    } else if (!emailRegex.test(formData.email)) {
      formErrors.email = "Invalid email";
    }

    if (!formData.password) {
      formErrors.password = "Required";
    } else if (formData.password.length < 6) {
      formErrors.password = "Min 6 chars";
    }

    if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = "Mismatch";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const { firstName, lastName, email, password } = formData;
      dispatch(registerUser({ firstName, lastName, email, password }));
    }
  };

  return (
    <section className="register-page-section">
      <Container fluid className="register-container m-0 p-0">
        <Row className="register-row g-0">
          {/* Brand Panel - Hidden on small displays */}
          <Col
            lg={6}
            className="register-brand-side d-none d-lg-flex align-items-center justify-content-center"
          >
            <div className="tech-grid-overlay"></div>
            <div className="text-center px-5 z-1" style={{ maxWidth: "500px" }}>
              <h1
                className="login-title"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                TECH_ELITE
              </h1>
              <p
                className="mt-2"
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)",
                }}
              >
                Join our elite network.
              </p>
            </div>
          </Col>

          {/* Form Panel - Zero Scroll Layout */}
          <Col xs={12} lg={6} className="register-form-side">
            <div className="register-form-wrapper">
              <header className="text-center mb-2">
                <h2 className="register-subtitle m-0">Create Account</h2>
              </header>

              {isError && (
                <Alert
                  variant="danger"
                  className="border-0 text-white d-flex align-items-center rounded-3 py-2 px-3 mb-2"
                  style={{ backgroundColor: "var(--color-error-container)" }}
                >
                  <span
                    className="material-symbols-outlined me-2 flex-shrink-0"
                    style={{ color: "var(--color-error)", fontSize: "18px" }}
                  >
                    error
                  </span>
                  <span
                    style={{
                      color: "var(--color-on-error-container)",
                      fontSize: "12px",
                    }}
                  >
                    {message}
                  </span>
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate className="w-100">
                <div className="name-row mb-2">
                  <Form.Group controlId="formFirstName" className="flex-grow-1">
                    <Form.Label className="custom-label text-uppercase mb-1">
                      First Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      placeholder="John"
                      className="custom-input rounded-3"
                      value={formData.firstName}
                      onChange={handleChange}
                      isInvalid={!!errors.firstName}
                    />
                    <Form.Control.Feedback
                      type="invalid"
                      className="custom-feedback"
                    >
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group controlId="formLastName" className="flex-grow-1">
                    <Form.Label className="custom-label text-uppercase mb-1">
                      Last Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      className="custom-input rounded-3"
                      value={formData.lastName}
                      onChange={handleChange}
                      isInvalid={!!errors.lastName}
                    />
                    <Form.Control.Feedback
                      type="invalid"
                      className="custom-feedback"
                    >
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <Form.Group className="mb-2" controlId="formEmail">
                  <Form.Label className="custom-label text-uppercase mb-1">
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="john@tech-elite.io"
                    className="custom-input rounded-3"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    className="custom-feedback"
                  >
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-2" controlId="formPassword">
                  <Form.Label className="custom-label text-uppercase mb-1">
                    Password
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      className="custom-input rounded-3 pe-5"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                    />
                    <button
                      type="button"
                      className="position-absolute top-50 end-0 translate-middle-y bg-transparent border-0 pe-3 password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span
                        className="material-symbols-outlined d-block"
                        style={{ fontSize: "18px" }}
                      >
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                    <Form.Control.Feedback
                      type="invalid"
                      className="custom-feedback"
                    >
                      {errors.password}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <Form.Label className="custom-label text-uppercase mb-1">
                    Confirm Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="custom-input rounded-3"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    className="custom-feedback"
                  >
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-submit-elite w-100 rounded-3 py-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    ></div>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </Form>

              <footer className="text-center mt-2">
                <p className="footer-navigation-text m-0">
                  Already have an elite account?{" "}
                  <Link to="/login" className="login-redirect-link">
                    Sign in
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
