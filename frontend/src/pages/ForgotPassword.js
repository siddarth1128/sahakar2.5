import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      } else {
        toast.error(result.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('An error occurred. Please try again.');
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
              <i className="fas fa-lock"></i>
            </div>
            <h1 className="brand-title">Forgot Password?</h1>
            <p className="brand-subtitle">
              Don't worry! It happens. Enter your email address and we'll send you a link to reset your password.
            </p>
            <div className="brand-features">
              <div className="brand-feature">
                <i className="fas fa-shield-alt"></i>
                <span>Secure Process</span>
              </div>
              <div className="brand-feature">
                <i className="fas fa-envelope"></i>
                <span>Email Verification</span>
              </div>
              <div className="brand-feature">
                <i className="fas fa-clock"></i>
                <span>Quick Recovery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <Link to="/login" className="back-button">
            <i className="fas fa-arrow-left"></i>
            Back to Login
          </Link>

          <div className="auth-form-wrapper">
            {!emailSent ? (
              <>
                <div className="form-header">
                  <div className="form-logo">
                    <i className="fas fa-key"></i>
                  </div>
                  <h2 className="form-title">Reset Password</h2>
                  <p className="form-subtitle">
                    Enter your email and we'll send you instructions to reset your password
                  </p>
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
                        className="form-input"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        autoFocus
                        disabled={loading}
                      />
                      <i className="fas fa-envelope input-icon"></i>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                      <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
                      We'll send a password reset link to this email
                    </p>
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <i className="fas fa-paper-plane"></i>
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

                  <div className="auth-switch" style={{ marginTop: '1rem' }}>
                    Don't have an account?
                    <Link to="/signup" className="auth-switch-link">
                      Sign up
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="form-header">
                  <div className="form-logo" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h2 className="form-title">Check Your Email</h2>
                  <p className="form-subtitle">
                    We've sent a password reset link to
                    <br />
                    <strong style={{ color: '#667eea' }}>{email}</strong>
                  </p>
                </div>

                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    <i className="fas fa-envelope-open-text" style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }}></i>
                    <p style={{ color: '#ffffff', fontSize: '1rem', lineHeight: '1.6' }}>
                      Please check your email inbox and click on the link to reset your password.
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '1rem' }}>
                      The link will expire in 30 minutes.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                      onClick={() => setEmailSent(false)}
                      className="btn-auth"
                      style={{ background: 'transparent', border: '2px solid #27272a', color: '#ffffff' }}
                    >
                      <i className="fas fa-arrow-left"></i>
                      Try Another Email
                    </button>

                    <Link to="/login" className="btn-auth">
                      <i className="fas fa-sign-in-alt"></i>
                      Back to Login
                    </Link>
                  </div>

                  <div style={{ marginTop: '2rem', padding: '1rem', background: '#1a1a1a', borderRadius: '12px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                      <i className="fas fa-question-circle" style={{ marginRight: '0.5rem' }}></i>
                      Didn't receive the email? Check your spam folder or{' '}
                      <button
                        onClick={() => {
                          setEmailSent(false);
                          toast.success('You can resend the email now');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#667eea',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          padding: 0
                        }}
                      >
                        try again
                      </button>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
