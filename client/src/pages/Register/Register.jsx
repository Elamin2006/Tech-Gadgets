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
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

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
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        let formErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.firstName.trim()) formErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) formErrors.lastName = "Last name is required";
        
        if (!formData.email) {
            formErrors.email = "Email Address is required";
        } else if (!emailRegex.test(formData.email)) {
            formErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            formErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            formErrors.password = "Password must be at least 6 characters";
        }

        if (formData.password !== formData.confirmPassword) {
            formErrors.confirmPassword = "Passwords do not match";
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
        <section className="register-page-section ">
            <Container fluid className="register-container m-0 p-0 overflow-hidden">
                <Row className="g-0 min-vh-100-custom">
                    
                    <Col lg={6} className="register-brand-side d-none d-lg-flex align-items-center justify-content-center">
                        <div className="tech-grid-overlay"></div>
                        <div className="text-center px-5 z-1" style={{ maxWidth: "500px" }}>
                            <h1 className="login-title" style={{ fontSize: "3.5rem" }}>TECH_ELITE</h1>
                            <p className="mt-3" style={{ color: "var(--color-on-surface-variant)", fontSize: "1.15rem", lineHeight: "1.6" }}>
                                Join our elite network. Create an account to monitor and procure advanced tactical tech hardware.
                            </p>
                        </div>
                    </Col>

                    <Col xs={12} lg={6} className=" form d-flex flex-column align-items-center justify-content-center p-4 p-md-5 position-relative">
                        
                
                        <div className="register-form-wrapper mt-3 mt-md-2 ">
                            <header className="mb-3 text-center">
                                <h2 className="register-subtitle mb-2">Create Account</h2>
                               
                            </header>

                            {isError && (
                                <Alert variant="danger" className="border-0 text-white d-flex align-items-center rounded-3 " 
                                style={{ backgroundColor: "var(--color-error-container)" }}>
                                    <span className="material-symbols-outlined me-2" style={{ color: "var(--color-error)" }}>error</span>
                                    <span style={{ color: "var(--color-on-error-container)", fontSize: "14px" }}>{message}</span>
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit} noValidate>
                                
                                <div className="name-row">
                                    <Form.Group className="mb-1" controlId="formFirstName">
                                        <Form.Label className="custom-label text-uppercase mb-2">First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            placeholder="John"
                                            className="custom-input rounded-3"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            isInvalid={!!errors.firstName}
                                        />
                                        <Form.Control.Feedback type="invalid" style={{ color: "var(--color-error)" }}>
                                            {errors.firstName}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-1" controlId="formLastName">
                                        <Form.Label className="custom-label text-uppercase mb-2">Last Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            placeholder="Doe"
                                            className="custom-input rounded-3"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            isInvalid={!!errors.lastName}
                                        />
                                        <Form.Control.Feedback type="invalid" style={{ color: "var(--color-error)" }}>
                                            {errors.lastName}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>

                                <Form.Group className="mb-1" controlId="formEmail">
                                    <Form.Label className="custom-label text-uppercase mb-2">Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="john@tech-elite.io"
                                        className="custom-input rounded-3"
                                        value={formData.email}
                                        onChange={handleChange}
                                        isInvalid={!!errors.email}
                                    />
                                    <Form.Control.Feedback type="invalid" style={{ color: "var(--color-error)" }}>
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-1" controlId="formPassword">
                                    <Form.Label className="custom-label text-uppercase mb-2">Password</Form.Label>
                                    <div className="position-relative">
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="••••••••"
                                            className="custom-input rounded-3 pr-5"
                                            value={formData.password}
                                            onChange={handleChange}
                                            isInvalid={!!errors.password}
                                        />
                                        <button
                                            type="button"
                                            className="position-absolute top-50 end-0 translate-middle-y bg-transparent border-0 pe-3
                                             password-toggle-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ zIndex: 5 }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: "20px", verticalAlign: "middle" }}>
                                                {showPassword ? "visibility_off" : "visibility"}
                                            </span>
                                        </button>
                                        <Form.Control.Feedback type="invalid" style={{ color: "var(--color-error)" }}>
                                            {errors.password}
                                        </Form.Control.Feedback>
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formConfirmPassword">
                                    <Form.Label className="custom-label text-uppercase mb-2">Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        className="custom-input rounded-3"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        isInvalid={!!errors.confirmPassword}
                                    />
                                    <Form.Control.Feedback type="invalid" style={{ color: "var(--color-error)" }}>
                                        {errors.confirmPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button 
                                    type="submit" 
                                    className="btn-submit-elite w-100 rounded-3 py-3"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="spinner-border spinner-border-sm" role="status"></div>
                                    ) : (
                                        "Sign Up"
                                    )}
                                </Button>
                            </Form>

                            <footer className="text-center mt-2">
                                <p style={{ color: "var(--color-on-surface-variant)", fontSize: "14px" }}>
                                    Already have an elite account? 
                                    <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: "600", textDecoration: "none" }}>
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