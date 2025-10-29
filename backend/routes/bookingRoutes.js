const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");
const socketMiddleware = require("../middleware/socketMiddleware");

// Routes
router.post("/", protect, socketMiddleware, createBooking);
router.get("/", protect, getBookings);
router.get("/:id", protect, getBooking);
router.put("/:id/status", protect, socketMiddleware, updateBookingStatus);
router.put("/:id/cancel", protect, socketMiddleware, cancelBooking);
router.put("/:id/accept", protect, socketMiddleware, acceptBooking);
router.put("/:id/reject", protect, socketMiddleware, rejectBooking);
router.put("/:id/start", protect, socketMiddleware, startBooking);
router.put("/:id/complete", protect, socketMiddleware, completeBooking);

module.exports = router;
