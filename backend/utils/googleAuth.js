const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

// Initialize Google OAuth2 client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Verify Google ID token
 */
const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    console.error("Google token verification failed:", error);
    throw new Error("Invalid Google token");
  }
};

/**
 * Generate Google OAuth URL
 */
const getGoogleAuthURL = () => {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  return authUrl;
};

/**
 * Exchange authorization code for tokens
 */
const getGoogleTokens = async (code) => {
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error("Token exchange failed:", error);
    throw new Error("Failed to exchange authorization code");
  }
};

/**
 * Get user info from Google
 */
const getGoogleUserInfo = async (accessToken) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );
    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error("Failed to get user info:", error);
    throw new Error("Failed to get user information");
  }
};

/**
 * Generate JWT token for authenticated user
 */
const generateAuthToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      googleEmail: user.googleEmail,
      userType: user.userType,
      isVerified: user.isVerified,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

/**
 * Generate 6-digit OTP using Google Authenticator algorithm (TOTP)
 */
const generateTOTP = (secret, timeStep = null) => {
  const crypto = require("crypto");
  const time = timeStep || Math.floor(Date.now() / 30000); // 30-second windows

  const hmac = crypto.createHmac("sha1", secret);
  hmac.update(Buffer.from(time.toString()));
  const digest = hmac.digest("hex");

  // Convert to 6-digit code
  const offset = parseInt(digest.slice(-1), 16);
  const code = parseInt(digest.slice(offset * 2, offset * 2 + 8), 16);
  return (code & 0x7fffffff).toString().slice(-6);
};

/**
 * Verify TOTP token
 */
const verifyTOTP = (token, secret) => {
  if (!secret) return false;

  // Check current and adjacent time windows (to account for clock drift)
  const timeSteps = [
    Math.floor(Date.now() / 30000),     // current
    Math.floor(Date.now() / 30000) - 1, // previous
    Math.floor(Date.now() / 30000) + 1, // next
  ];

  return timeSteps.some(timeStep => {
    const expectedToken = generateTOTP(secret, timeStep);
    return token === expectedToken;
  });
};

module.exports = {
  verifyGoogleToken,
  getGoogleAuthURL,
  getGoogleTokens,
  getGoogleUserInfo,
  generateAuthToken,
  generateTOTP,
  verifyTOTP,
};
