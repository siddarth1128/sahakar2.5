import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetToken } = useParams();
  const { resetPassword } = useAuth();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if no token
  useEffect(() => {
    if (!resetToken) {
      toast.error('Invalid reset link');
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  // Calculate password strength
  useEffect(() => {
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 8) strength++;
      if (/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)) strength++;
      if (/[0-9]/.test(formData.password)) strength++;
      if (/[^a-zA-Z0-9]/.test(formData.password)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(resetToken, formData.password);

      if (result.success) {
        toast.success('Password reset successful! You can now login.');
        navigate('/login');
      } else {
        toast.error(result.message || 'Password reset failed. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak password';
    if (passwordStrength === 3) return 'Medium strength';
    return 'Strong password';
  };

  const getPasswordStrengthClass = () => {
    if (passwordStrength <= 2) return 'weak';
    if (passwordStrength === 3) return 'medium';
    return 'strong';
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-brand">
          <div className="brand-content">
            <div className="brand-icon">
              <i className="fas fa-lock-open"></i>
            </div>
            <h1 className="brand-title">Reset Password</h1>
            <p className="brand-subtitle">
              Choose a strong password to secure your account. Make sure it's at least 6 characters long.
            </p>
            <div className="brand-features">
              <div className="brand-feature">
                <i className="fas fa-shield-alt"></i>
                <span>Secure & Encrypted</span>
              </div>
              <div className="brand-feature">
                <i className="fas fa-key"></i>
                <span>Strong Password</span>
              </div>
              <div className="brand-feature">
                <i className="fas fa-check-circle"></i>
                <span>Quick & Easy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Reset Form */}
        <div className="auth-form-container">
          <Link to="/login" className="back-button">
            <i className="fas fa-arrow-left"></i>
            Back to Login
          </Link>

          <div className="auth-form-wrapper">
            <div className="form-header">
              <div className="form-logo">
                <i className="fas fa-key"></i>
              </div>
              <h2 className="form-title">Create New Password</h2>
              <p className="form-subtitle">Enter your new password below</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Password Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  <i className="fas fa-lock"></i>
                  New Password
                </label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    autoFocus
                    disabled={loading}
                  />
                  <i className="fas fa-lock input-icon"></i>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
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
                          className={`strength-bar ${bar <= passwordStrength ? `active ${getPasswordStrengthClass()}` : ''}`}
                        ></div>
                      ))}
                    </div>
                    {passwordStrength > 0 && (
                      <div className={`strength-text ${getPasswordStrengthClass()}`}>
                        {getPasswordStrengthText()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  <i className="fas fa-lock"></i>
                  Confirm New Password
                </label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <i className="fas fa-lock input-icon"></i>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Security Tips */}
              <div style={{
                background: '#1a1a1a',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <p style={{ color: '#667eea', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
                  Password Requirements:
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.8' }}>
                  <li>At least 6 characters long</li>
                  <li>Mix of uppercase and lowercase letters (recommended)</li>
                  <li>Include numbers (recommended)</li>
                  <li>Include special characters (recommended)</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-auth"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <i className="fas fa-check-circle"></i>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="divider">
                <span>or</span>
              </div>

              {/* Links */}
              <div className="auth-switch">
                Remember your password?
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

export default ResetPassword;
