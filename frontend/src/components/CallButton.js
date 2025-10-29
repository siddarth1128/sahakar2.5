import React from 'react';
import { handleCallClick } from '../utils/callUtils';

/**
 * CallButton Component
 * Displays a call button that initiates a phone call using the native dialer
 */
const CallButton = ({
  phoneNumber,
  recipientName,
  size = 'medium',
  variant = 'primary',
  showNumber = true,
  disabled = false,
  className = '',
  onCallStart = null,
  ...props
}) => {

  if (!phoneNumber) {
    return null; // Don't render if no phone number
  }

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    handleCallClick(phoneNumber, recipientName, onCallStart);
  };

  // Size variants
  const sizeClasses = {
    small: 'call-button-small',
    medium: 'call-button-medium',
    large: 'call-button-large'
  };

  // Color variants
  const variantClasses = {
    primary: 'call-button call-primary',
    secondary: 'call-button call-secondary',
    success: 'call-button call-success',
    outline: 'call-button call-outline'
  };

  const baseClasses = 'call-button';

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      title={`Call ${recipientName || 'contact'}`}
      {...props}
    >
      {/* Phone Icon */}
      <svg
        className="call-icon-svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>

      {showNumber && (
        <span className="call-number">
          {phoneNumber.replace(/[\s\-()]/g, '').slice(-10)}
        </span>
      )}
    </button>
  );
};

/**
 * Compact CallIcon component for use in tight spaces
 */
export const CallIcon = ({
  phoneNumber,
  recipientName,
  size = 20,
  className = '',
  onCallStart = null,
  ...props
}) => {
  if (!phoneNumber) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleCallClick(phoneNumber, recipientName, onCallStart);
      }}
      className={`call-icon ${className}`}
      title={`Call ${recipientName || 'contact'}`}
      {...props}
    >
      <svg
        className="call-icon-svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    </button>
  );
};

export default CallButton;
