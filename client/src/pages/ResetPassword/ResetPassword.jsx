import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthService } from "../../services/auth.service";
import { toast } from "react-toastify";
import "../ForgotPassword/ForgotPassword.css";
import "./ResetPassword.css";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      toast.warn("Session reference lost. Restarting recovery flow.");
      navigate("/forgot-password");
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Password mismatch");
    }

    try {
      setLoading(true);
      const res = await AuthService.resetPassword(email, password);
      toast.success(res.message || "System credentials updated successfully.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.message || "Failed to finalize password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-canvas-container">
      <div className="secure-auth-card">
        <div className="card-crypto-header">
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">
            Reset Your Password for: {email} Account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-system-form">
          <div className="input-group-block">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className="secure-system-input"
            />
          </div>

          <div className="input-group-block">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="secure-system-input"
            />
          </div>

          <button
            type="submit"
            className="secure-action-btn"
            disabled={loading}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
