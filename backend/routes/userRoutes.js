const express = require("express");
const router = express.Router();
const {
  getTechnicians,
  getTechnician,
  updateProfile,
  getProfile,
  getUsers,
  getUserById,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// Routes - IMPORTANT: Specific routes must come before parameterized routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/technicians", protect, getTechnicians);
router.get("/technicians/:id", protect, getTechnician);
router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);

module.exports = router;
