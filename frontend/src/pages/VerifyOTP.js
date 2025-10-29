import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "../styles/Auth.css";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP, isAuthenticated } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState("");

  // Get email from location state or localStorage
  useEffect(() => {
    const stateEmail = location.state?.email;
    const storedEmail = localStorage.getItem("pendingEmail");

    if (stateEmail) {
      setEmail(stateEmail);
      localStorage.setItem("pendingEmail", stateEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast.error("No email found. Please register first.");
      navigate("/signup");
    }
  }, [location, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearTimeout(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Handle OTP input change
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    setOtp(pastedData);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOTP(email, otp);

      if (result.success) {
        toast.success("Email verified successfully!");
        localStorage.removeItem("pendingEmail");
        navigate("/dashboard");
      } else {
        toast.error(result.message || "Invalid OTP. Please try again.");
        setOtp("");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;

    setResending(true);

    try {
      const result = await resendOTP(email);

      if (result.success) {
        toast.success("New OTP sent to your email!");
        setTimer(60);
        setCanResend(false);
        setOtp("");
      } else {
        toast.error(result.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const maskEmail = (email) => {
    if (!email) return "";
    const [username, domain] = email.split("@");
    const maskedUsername =
      username.charAt(0) +
      "*".repeat(username.length - 2) +
      username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="auth-page">
      <div className="auth-container verify-otp-container">
        {/* Left Side - Branding */}
        <div className="auth-brand">
          <div className="brand-content">
            <div className="brand-icon">
              <i className="fas fa-envelope-open-text"></i>
            </div>
            <h1 className="brand-title">Check Your Email</h1>
            <p className="brand-subtitle">
              We've sent a 6-digit verification code to your email. Please enter
              it below to complete your registration.
            </p>
            <div className="brand-features">
              <div className="brand-feature">
                <i className="fas fa-shield-alt"></i>
                <span>Secure Verification</span>
              </div>
              <div className="brand-feature">
                <i className="fas fa-clock"></i>
                <span>Expires in 10 Minutes</span>
              </div>
              <div className="brand-feature">
                <i className="fas fa-lock"></i>
                <span>Protected Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - OTP Form */}
        <div className="auth-form-container">
          <Link to="/signup" className="back-button">
            <i className="fas fa-arrow-left"></i>
            Back to Signup
          </Link>

          <div className="auth-form-wrapper">
            <div className="form-header">
              <div className="form-logo">
                <i className="fas fa-key"></i>
              </div>
              <h2 className="form-title">Verify Email</h2>
              <p className="form-subtitle">
                Enter the 6-digit code sent to
                <br />
                <strong style={{ color: "#667eea" }}>{maskEmail(email)}</strong>
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* OTP Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="otp">
                  <i className="fas fa-lock"></i>
                  Verification Code
                </label>
                <div className="otp-input-wrapper">
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    className="otp-input"
                    placeholder="000000"
                    value={otp}
                    onChange={handleOtpChange}
                    onPaste={handlePaste}
                    maxLength="6"
                    autoComplete="off"
                    autoFocus
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "1.5rem",
                      fontSize: "2rem",
                      letterSpacing: "1rem",
                      textAlign: "center",
                      background: "#1a1a1a",
                      border: "2px solid #27272a",
                      borderRadius: "12px",
                      color: "#667eea",
                      fontWeight: "700",
                      outline: "none",
                      transition: "all 0.3s ease",
                      fontFamily: "monospace",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(102, 126, 234, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#27272a";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#94a3b8",
                    marginTop: "0.75rem",
                    textAlign: "center",
                  }}
                >
                  <i
                    className="fas fa-info-circle"
                    style={{ marginRight: "0.5rem" }}
                  ></i>
                  Check your email inbox and spam folder
                </p>
              </div>

              {/* Timer and Resend */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "#1a1a1a",
                  borderRadius: "12px",
                  border: "1px solid #27272a",
                }}
              >
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resending}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#667eea",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      fontFamily: "Poppins, sans-serif",
                      textDecoration: "underline",
                    }}
                    onMouseOver={(e) => (e.target.style.color = "#764ba2")}
                    onMouseOut={(e) => (e.target.style.color = "#667eea")}
                  >
                    {resending ? (
                      <>
                        <i
                          className="fas fa-spinner fa-spin"
                          style={{ marginRight: "0.5rem" }}
                        ></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i
                          className="fas fa-redo"
                          style={{ marginRight: "0.5rem" }}
                        ></i>
                        Resend OTP
                      </>
                    )}
                  </button>
                ) : (
                  <p
                    style={{ margin: 0, color: "#94a3b8", fontSize: "0.95rem" }}
                  >
                    <i
                      className="fas fa-clock"
                      style={{ marginRight: "0.5rem" }}
                    ></i>
                    Resend OTP in{" "}
                    <strong style={{ color: "#667eea" }}>
                      {formatTime(timer)}
                    </strong>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-auth"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Verifying...
                  </>
                ) : (
                  <>
                    <span>Verify Email</span>
                    <i className="fas fa-check-circle"></i>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="divider">
                <span>or</span>
              </div>

              {/* Login Link */}
              <div className="auth-switch">
                Already verified?
                <Link to="/login" className="auth-switch-link">
                  Sign in now
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
