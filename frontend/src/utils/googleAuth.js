import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Initiate Google OAuth login
 */
export const initiateGoogleLogin = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/google`);
    return response.data;
  } catch (error) {
    console.error('Google login initiation failed:', error);
    throw error;
  }
};

/**
 * Handle Google OAuth callback
 */
export const handleGoogleCallback = async (code) => {
  try {
    const response = await axios.get(`${API_URL}/auth/google/callback?code=${code}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Google callback failed:', error);
    throw error;
  }
};

/**
 * Generate TOTP token (for 2FA)
 */
export const generateTOTP = (secret) => {
  const timeStep = Math.floor(Date.now() / 30000); // 30-second windows

  // Simple HMAC-SHA1 implementation (you might want to use a proper library)
  const crypto = window.crypto || window.msCrypto;

  if (!crypto || !crypto.subtle) {
    console.error('Crypto API not available');
    return null;
  }

  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  ).then(key => {
    return crypto.subtle.sign('HMAC', key, new TextEncoder().encode(timeStep.toString()));
  }).then(signature => {
    const hash = new Uint8Array(signature);
    const offset = hash[hash.length - 1] & 0xf;

    const code = (
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)
    );

    return (code % 1000000).toString().padStart(6, '0');
  }).catch(error => {
    console.error('TOTP generation failed:', error);
    return null;
  });
};

/**
 * Verify TOTP token (for 2FA)
 */
export const verifyTOTP = async (token, userId) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verify-2fa`, {
      token,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error('TOTP verification failed:', error);
    throw error;
  }
};

/**
 * Enable 2FA for user
 */
export const enableTwoFactor = async (userId) => {
  try {
    const response = await axios.post(`${API_URL}/auth/enable-2fa`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error('Enable 2FA failed:', error);
    throw error;
  }
};

/**
 * Disable 2FA for user
 */
export const disableTwoFactor = async (userId, token) => {
  try {
    const response = await axios.post(`${API_URL}/auth/disable-2fa`, {
      userId,
      token,
    });
    return response.data;
  } catch (error) {
    console.error('Disable 2FA failed:', error);
    throw error;
  }
};
