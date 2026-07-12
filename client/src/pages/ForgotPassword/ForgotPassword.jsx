import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthService } from "../../services/auth.service";
import { toast } from "react-toastify";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await AuthService.forgotPassword(email);
      toast.success(res.message || "Reset token dispatched safely.");
      
      navigate("/verify-reset-code", { state: { email } });
    } catch (err) {
      toast.error(err.message || "Failed to trigger recovery sequence.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-canvas-container">
      <div className="secure-auth-card">
        <div className="card-crypto-header">
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">ENTER YOUR VERIFIED EMAIL</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-system-form">
          <div className="input-group-block">
            <label htmlFor="recovery-email">Your Email</label>
            <input
              id="recovery-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="secure-system-input"
            />
          </div>

          <button type="submit" className="secure-action-btn" disabled={loading}>
            {loading ? "TRANSMITTING..." : "Send Reset Code"}
          </button>
        </form>

        <div className="auth-card-footer">
          <Link to="/login" className="back-to-system-link">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}