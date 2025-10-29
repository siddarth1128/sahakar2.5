import React from 'react';
import '../styles/LoadingSpinner.css';

/**
 * LoadingSpinner Component
 * Displays a loading spinner with optional text
 *
 * @param {string} size - Size of spinner: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} text - Optional loading text to display
 * @param {boolean} fullScreen - Whether to display as fullscreen overlay
 * @param {string} color - Color variant: 'primary', 'white', 'secondary'
 */
const LoadingSpinner = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg'
  };

  const colorClasses = {
    primary: 'spinner-primary',
    white: 'spinner-white',
    secondary: 'spinner-secondary'
  };

  const spinnerClass = `spinner ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.primary} ${className}`;

  if (fullScreen) {
    return (
      <div className="loading-spinner-overlay">
        <div className="loading-spinner-container">
          <div className="loading-icon">
            <i className="fas fa-tools"></i>
          </div>
          <div className={spinnerClass}></div>
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-spinner-inline">
      <div className={spinnerClass}></div>
      {text && <p className="loading-text-inline">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
