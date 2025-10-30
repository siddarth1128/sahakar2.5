const express = require("express");
const router = express.Router();
const {
  createReview,
  getUserReviews,
  getMyReviews,
  getReceivedReviews,
  updateReview,
  deleteReview,
  addReviewResponse,
  getReviewByBooking,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

// Public routes
router.get("/user/:userId", getUserReviews); // Get reviews for a specific user (technician)

// Protected routes
router.use(protect); // All routes below require authentication

router.post("/", createReview); // Create a new review
router.get("/my-reviews", getMyReviews); // Get reviews I wrote
router.get("/received", getReceivedReviews); // Get reviews I received
router.get("/booking/:bookingId", getReviewByBooking); // Get review by booking ID
router.put("/:id", updateReview); // Update a review
router.delete("/:id", deleteReview); // Delete a review
router.post("/:id/response", addReviewResponse); // Add response to a review

module.exports = router;
