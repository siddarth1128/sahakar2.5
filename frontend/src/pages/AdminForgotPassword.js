import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "../styles/Auth.css";

const AdminForgotPassword = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    secretKey: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.secretKey.trim()) {
      newErrors.secretKey = "Secret key is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      // Use fetch for admin forgot password
      const response = await fetch("/api/auth/admin/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", // For cookies
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Password reset email sent successfully!");
        navigate("/admin/login");
      } else {
        toast.error(
          result.message || "Failed to send reset email. Please try again.",
        );
      }
    } catch (error) {
      console.error("Admin forgot password error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-brand">
          <div className="brand-content">
            <div className="brand-icon">
              <i className="fas fa-key"></i>
            </div>
            <h1 className="brand-title">Reset Admin Password</h1>
            <p className="brand-subtitle">
              Provide your email and secret key to reset your admin password
            </p>
            <div className="brand-features">
              <div className="brand-feature">
                <i className="fas fa-envelope"></i>
                <span>Email Verification</span>
              </div>
              <div className="brand-feature">
                <i className="fas fa-lock"></i>
                <span>Secure Reset</span>
              </div>
              <div className="brand-feature">
                <i className="fas fa-shield-alt"></i>
                <span>Admin Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Forgot Password Form */}
        <div className="auth-form-container">
          <Link to="/admin/login" className="back-button">
            <i className="fas fa-arrow-left"></i>
            Back to Login
          </Link>

          <div className="auth-form-wrapper">
            <div className="form-header">
              <div className="form-logo">
                <i className="fas fa-key"></i>
              </div>
              <h2 className="form-title">Forgot Password</h2>
              <p className="form-subtitle">Enter your admin credentials</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  <i className="fas fa-envelope"></i>
                  Email Address
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="Enter admin email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    disabled={loading}
                  />
                  <i className="fas fa-envelope input-icon"></i>
                </div>
                {errors.email && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Secret Key Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="secretKey">
                  <i className="fas fa-key"></i>
                  Secret Key
                </label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="secretKey"
                    name="secretKey"
                    className={`form-input ${errors.secretKey ? "error" : ""}`}
                    placeholder="Enter secret key"
                    value={formData.secretKey}
                    onChange={handleChange}
                    autoComplete="off"
                    disabled={loading}
                  />
                  <i className="fas fa-key input-icon"></i>
                </div>
                {errors.secretKey && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.secretKey}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending Reset Email...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Send Reset Email
                  </>
                )}
              </button>
            </form>

            {/* Auth Switch */}
            <div className="auth-switch">
              <span>Remember your password?</span>
              <Link to="/admin/login" className="auth-switch-link">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
