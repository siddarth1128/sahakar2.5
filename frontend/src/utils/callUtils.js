/**
 * Utility functions for calling functionality
 */

/**
 * Make a phone call using native dialer
 * @param {string} phoneNumber - The phone number to call
 * @param {string} name - The name of the person being called (optional)
 */
export const makeCall = (phoneNumber, name = '') => {
  if (!phoneNumber) {
    console.error('Phone number is required for calling');
    return false;
  }

  // Clean the phone number (remove spaces, dashes, etc.)
  const cleanNumber = phoneNumber.replace(/[\s\-()]/g, '');

  // Check if the device supports tel: links
  if (typeof window !== 'undefined') {
    // For mobile devices or browsers that support tel:
    const telLink = `tel:${cleanNumber}`;

    // Create a temporary link and click it to initiate the call
    const link = document.createElement('a');
    link.href = telLink;
    link.style.display = 'none';

    // Add the link to the document and click it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  }

  return false;
};

/**
 * Check if calling is supported on the current device
 */
export const isCallSupported = () => {
  return typeof window !== 'undefined' &&
         ('ontouchstart' in window || navigator.maxTouchPoints > 0);
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  const cleaned = phoneNumber.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Format as +XX XXX XXX XXXX for international numbers
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  return phoneNumber;
};

/**
 * Handle call button click with confirmation
 */
export const handleCallClick = (phoneNumber, name, onCallStart = null) => {
  if (!phoneNumber) {
    alert('Phone number not available');
    return;
  }

  const displayName = name || 'this person';
  const formattedNumber = formatPhoneNumber(phoneNumber);

  // Show confirmation dialog
  const confirmed = window.confirm(
    `Call ${displayName} at ${formattedNumber}?`
  );

  if (confirmed) {
    const success = makeCall(phoneNumber, name);
    if (success) {
      console.log(`Calling ${name} at ${phoneNumber}`);
      if (onCallStart) {
        onCallStart(phoneNumber, name);
      }
    } else {
      alert('Unable to initiate call. Please check if your device supports phone calls.');
    }
  }
};
