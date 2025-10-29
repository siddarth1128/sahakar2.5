const express = require("express");
const router = express.Router();
const {
  register,
  login,
  adminLogin,
  logout,
  forgotPassword,
  adminForgotPassword,
  resetPassword,
  updatePassword,
  getMe,
  googleAuth,
  googleAuthCallback,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/admin/login", authLimiter, adminLogin);
router.post("/admin/forgot-password", authLimiter, adminForgotPassword);
router.put("/reset-password/:resetToken", authLimiter, resetPassword);

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/update-password", protect, updatePassword);

module.exports = router;
