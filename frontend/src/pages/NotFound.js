import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="notfound-page">
      {/* Animated Background */}
      <div className="notfound-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      {/* Content */}
      <div className="notfound-content">
        {/* Logo */}
        <Link to="/" className="notfound-logo">
          <i className="fas fa-tools"></i>
          <span>FixItNow</span>
        </Link>

        {/* 404 Illustration */}
        <div className="notfound-illustration">
          <div className="error-code">404</div>
          <div className="error-icon">
            <i className="fas fa-tools"></i>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
        </div>

        {/* Error Message */}
        <div className="notfound-message">
          <h1>Oops! Page Not Found</h1>
          <p>
            The page you're looking for doesn't exist or has been moved.
            <br />
            Don't worry, let's get you back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="notfound-actions">
          <Link to="/" className="btn-primary">
            <i className="fas fa-home"></i>
            Go to Homepage
          </Link>
          <button onClick={handleGoBack} className="btn-secondary">
            <i className="fas fa-arrow-left"></i>
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="notfound-links">
          <h3>Quick Links</h3>
          <div className="links-grid">
            <Link to="/#services" className="quick-link">
              <i className="fas fa-list"></i>
              <span>Browse Services</span>
            </Link>
            <Link to="/login" className="quick-link">
              <i className="fas fa-sign-in-alt"></i>
              <span>Login</span>
            </Link>
            <Link to="/signup" className="quick-link">
              <i className="fas fa-user-plus"></i>
              <span>Sign Up</span>
            </Link>
            <Link to="/#contact" className="quick-link">
              <i className="fas fa-phone"></i>
              <span>Contact Us</span>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="notfound-footer">
          <p>
            Need help? <Link to="/#contact">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
