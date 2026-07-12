import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthService } from "../../services/auth.service";
import { toast } from "react-toastify";
import "../ForgotPassword/ForgotPassword.css"; // Reusing forms layout
import "./VerifyResetCode.css";

export default function VerifyResetCode() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Automatically retrieve context if forwarded from the forgot-password page
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !resetCode) return toast.error("Missing node parameters.");

    try {
      setLoading(true);
      const res = await AuthService.verifyResetCode(email, resetCode);
      toast.success(res.message || "Code authorization checked successfully.");

      navigate("/reset-password", { state: { email } });
    } catch (err) {
      toast.error(err.message || "Passcode verification failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-canvas-container ">
      <div className="secure-auth-card">
        <div className="card-crypto-header">
          <h2 className="auth-title">Verify Reset Code</h2>
          <p className="auth-subtitle">
            Please enter the verification code sent to your email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-system-form">
          <div className="input-group-block">
            <label htmlFor="verification-email">Your Email</label>
            <input
              id="verification-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="node@domain.com"
              required
              disabled={loading || !!location.state?.email}
              className="secure-system-input target-locked-input"
            />
          </div>

          <div className="input-group-block">
            <label htmlFor="secure-passcode">Inter Reset Code</label>
            <input
              id="secure-passcode"
              type="text"
              placeholder="ENTER CODE"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              required
              disabled={loading}
              className="secure-system-input verification-code-field"
            />
          </div>

          <button
            type="submit"
            className="secure-action-btn"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </div>
    </div>
  );
}
