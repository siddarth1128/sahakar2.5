import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { initiateGoogleLogin } from "../utils/googleAuth";
import "../styles/Auth.css";

const Signup = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Calculate password strength
  useEffect(() => {
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 8) strength++;
      if (/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password))
        strength++;
      if (/[0-9]/.test(formData.password)) strength++;
      if (/[^a-zA-Z0-9]/.test(formData.password)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (
      formData.phone &&
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
        formData.phone,
      )
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.userType) {
      newErrors.userType = "Please select your role";
    }

    if (!formData.terms) {
      newErrors.terms = "You must accept the terms and conditions";
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
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        userType: formData.userType || "customer",
      });

      if (result.success) {
        // User is automatically logged in after registration
        // Navigate to dashboard based on user type
        const userType = formData.userType || "customer";
        if (userType === "admin") {
          navigate("/admin/dashboard");
        } else if (userType === "technician") {
          navigate("/technician/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Weak password";
    if (passwordStrength === 3) return "Medium strength";
    return "Strong password";
  };

  const getPasswordStrengthClass = () => {
    if (passwordStrength <= 2) return "weak";
    if (passwordStrength === 3) return "medium";
    return "strong";
  };

  // Handle Google OAuth signup
  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      const response = await initiateGoogleLogin();

      // Redirect to Google OAuth URL
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error("Failed to initiate Google signup. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-brand">
          <div className="brand-content">
            <div className="brand-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <h1 className="brand-title">Join FixItNow</h1>
            <p className="brand-subtitle">
              Create your account and get instant access to quality home
              services from verified professionals
            </p>
            <div className="brand-features">
              <div className="brand-feature">
                <i className="fas fa-check-circle"></i>
                <span>Easy Sign Up</span>
              </div>
              <div className="brand-feature">
                <i className="fas fa-check-circle"></i>
                <span>Instant Booking</span>
              </div>
              <div className="brand-feature">
                <i className="fas fa-check-circle"></i>
                <span>Secure & Safe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="auth-form-container">
          <Link to="/" className="back-button">
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </Link>

          <div className="auth-form-wrapper">
            <div className="form-header">
              <div className="form-logo">
                <i className="fas fa-user-plus"></i>
              </div>
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Sign up to start booking services</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Name Fields Row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="firstName">
                    First Name
                  </label>
                  <div className="input-wrapper">
                    <i className="fas fa-user input-icon"></i>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className={`form-input ${errors.firstName ? "error" : ""}`}
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                      disabled={loading}
                    />
                  </div>
                  {errors.firstName && (
                    <span className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.firstName}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lastName">
                    Last Name
                  </label>
                  <div className="input-wrapper">
                    <i className="fas fa-user input-icon"></i>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className={`form-input ${errors.lastName ? "error" : ""}`}
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                      disabled={loading}
                    />
                  </div>
                  {errors.lastName && (
                    <span className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.lastName}
                    </span>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <div className="input-wrapper">
                  <i className="fas fa-envelope input-icon"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Phone Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number
                </label>
                <div className="input-wrapper">
                  <i className="fas fa-phone input-icon"></i>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-input ${errors.phone ? "error" : ""}`}
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    disabled={loading}
                  />
                </div>
                {errors.phone && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* User Type Selection */}
              <div className="form-group">
                <label className="form-label" htmlFor="userType">
                  <i className="fas fa-user-tag"></i>I want to join as
                </label>
                <div className="user-type-selection">
                  <label className="user-type-option">
                    <input
                      type="radio"
                      name="userType"
                      value="customer"
                      checked={formData.userType === "customer"}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <div className="option-content">
                      <i className="fas fa-user"></i>
                      <span>Customer</span>
                      <small>Book services from technicians</small>
                    </div>
                  </label>
                  <label className="user-type-option">
                    <input
                      type="radio"
                      name="userType"
                      value="technician"
                      checked={formData.userType === "technician"}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <div className="option-content">
                      <i className="fas fa-wrench"></i>
                      <span>Technician</span>
                      <small>Provide services to customers</small>
                    </div>
                  </label>
                </div>
                {errors.userType && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.userType}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <div className="input-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <i
                      className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                    ></i>
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.password}
                  </span>
                )}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`strength-bar ${bar <= passwordStrength ? `active ${getPasswordStrengthClass()}` : ""}`}
                        ></div>
                      ))}
                    </div>
                    {passwordStrength > 0 && (
                      <div
                        className={`strength-text ${getPasswordStrengthClass()}`}
                      >
                        {getPasswordStrengthText()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-input ${
                      errors.confirmPassword ? "error" : ""
                    }`}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    <i
                      className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                    ></i>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="form-group">
                <label className="checkbox-label terms-label">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>
                    I agree to the{" "}
                    <a
                      href="https://example.com/terms"
                      className="link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://example.com/privacy"
                      className="link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.terms && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.terms}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="divider">
                <span>or</span>
              </div>

              {/* Google Signup Button */}
              <button
                type="button"
                className="btn-google"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="google-icon" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="auth-switch">
                Already have an account?
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

export default Signup;
