const Review = require("../models/Review");
const Booking = require("../models/Booking");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const {
    bookingId,
    revieweeId,
    reviewerType,
    overall,
    punctuality,
    quality,
    communication,
    professionalism,
    valueForMoney,
    title,
    comment,
  } = req.body;

  // Validate required fields
  if (!bookingId || !revieweeId || !overall || !comment) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  // Check if booking exists and belongs to the user
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  // Check if user is authorized to review this booking
  if (reviewerType === "customer" && booking.customerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to review this booking",
    });
  }

  if (reviewerType === "technician" && booking.technicianId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to review this booking",
    });
  }

  // Check if booking is completed
  if (booking.status !== "completed") {
    return res.status(400).json({
      success: false,
      message: "Can only review completed bookings",
    });
  }

  // Check if review already exists for this booking
  const existingReview = await Review.findOne({
    bookingId,
    reviewerId: req.user._id,
    reviewerType,
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: "You have already reviewed this booking",
    });
  }

  // Create review
  const review = await Review.create({
    bookingId,
    reviewerId: req.user._id,
    revieweeId,
    reviewerType,
    overall,
    punctuality,
    quality,
    communication,
    professionalism,
    valueForMoney,
    title,
    comment,
    isVerified: true, // Auto-verify if booking is completed
  });

  // Update reviewee's stats
  await updateUserReviewStats(revieweeId);

  // Populate review before sending response
  const populatedReview = await Review.findById(review._id)
    .populate("reviewerId", "firstName lastName avatar")
    .populate("revieweeId", "firstName lastName avatar")
    .populate("bookingId", "serviceType createdAt");

  res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: { review: populatedReview },
  });
});

// @desc    Get reviews for a user (technician)
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, status = "active" } = req.query;

  const reviews = await Review.find({
    revieweeId: userId,
    status,
    isPublic: true,
  })
    .populate("reviewerId", "firstName lastName avatar")
    .populate("bookingId", "serviceType createdAt")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({
    revieweeId: userId,
    status,
    isPublic: true,
  });

  // Get average ratings
  const averageRatings = await Review.getAverageRating(userId);

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      averageRatings,
    },
  });
});

// @desc    Get my reviews (as reviewer)
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const reviews = await Review.find({
    reviewerId: req.user._id,
  })
    .populate("revieweeId", "firstName lastName avatar")
    .populate("bookingId", "serviceType createdAt")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({
    reviewerId: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get reviews I received
// @route   GET /api/reviews/received
// @access  Private
const getReceivedReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const reviews = await Review.find({
    revieweeId: req.user._id,
    status: "active",
  })
    .populate("reviewerId", "firstName lastName avatar")
    .populate("bookingId", "serviceType createdAt")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({
    revieweeId: req.user._id,
    status: "active",
  });

  // Get average ratings
  const averageRatings = await Review.getAverageRating(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      averageRatings,
    },
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  // Check if user owns the review
  if (review.reviewerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this review",
    });
  }

  // Update allowed fields
  const allowedFields = [
    "overall",
    "punctuality",
    "quality",
    "communication",
    "professionalism",
    "valueForMoney",
    "title",
    "comment",
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate("reviewerId", "firstName lastName avatar")
    .populate("revieweeId", "firstName lastName avatar")
    .populate("bookingId", "serviceType createdAt");

  // Update reviewee's stats
  await updateUserReviewStats(review.revieweeId);

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: { review: updatedReview },
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  // Check if user owns the review
  if (review.reviewerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this review",
    });
  }

  // Soft delete - update status instead of removing
  await Review.findByIdAndUpdate(req.params.id, { status: "deleted" });

  // Update reviewee's stats
  await updateUserReviewStats(review.revieweeId);

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

// @desc    Add response to review
// @route   POST /api/reviews/:id/response
// @access  Private
const addReviewResponse = asyncHandler(async (req, res) => {
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({
      success: false,
      message: "Response comment is required",
    });
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  // Check if user is the reviewee (can respond to their reviews)
  if (review.revieweeId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Only the review recipient can respond",
    });
  }

  // Add response
  review.response = {
    comment,
    respondedAt: new Date(),
    respondedBy: req.user._id,
  };

  await review.save();

  const updatedReview = await Review.findById(review._id)
    .populate("reviewerId", "firstName lastName avatar")
    .populate("revieweeId", "firstName lastName avatar")
    .populate("bookingId", "serviceType createdAt")
    .populate("response.respondedBy", "firstName lastName");

  res.status(200).json({
    success: true,
    message: "Response added successfully",
    data: { review: updatedReview },
  });
});

// @desc    Get review by booking ID
// @route   GET /api/reviews/booking/:bookingId
// @access  Private
const getReviewByBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const review = await Review.findOne({
    bookingId,
    reviewerId: req.user._id,
  })
    .populate("revieweeId", "firstName lastName avatar")
    .populate("bookingId", "serviceType createdAt");

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "No review found for this booking",
    });
  }

  res.status(200).json({
    success: true,
    data: { review },
  });
});

// Helper function to update user review statistics
const updateUserReviewStats = async (userId) => {
  try {
    const stats = await Review.getAverageRating(userId);
    
    // Update user's rating and review count
    await User.findByIdAndUpdate(userId, {
      "technicianDetails.rating": stats.averageOverall || 0,
      "technicianDetails.totalReviews": stats.totalReviews || 0,
    });
  } catch (error) {
    console.error("Error updating user review stats:", error);
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getMyReviews,
  getReceivedReviews,
  updateReview,
  deleteReview,
  addReviewResponse,
  getReviewByBooking,
};
