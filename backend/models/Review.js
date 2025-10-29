const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // Review target
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Reviewer type (customer or technician)
    reviewerType: {
      type: String,
      enum: ["customer", "technician"],
      required: true,
    },

    // Rating scores (1-5)
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
    },
    quality: {
      type: Number,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5,
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5,
    },

    // Review content
    title: {
      type: String,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    // Review verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationMethod: {
      type: String,
      enum: ["booking_completed", "admin_verified", "auto_verified"],
      default: "booking_completed",
    },

    // Response from reviewee
    response: {
      comment: String,
      respondedAt: Date,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Helpful votes
    helpful: {
      count: {
        type: Number,
        default: 0,
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }],
    },

    // Review status
    status: {
      type: String,
      enum: ["active", "hidden", "deleted", "reported"],
      default: "active",
    },

    // Moderation
    isReported: {
      type: Boolean,
      default: false,
    },
    reportedBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reason: String,
      reportedAt: {
        type: Date,
        default: Date.now,
      },
    }],

    // Metadata
    isPublic: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: "en",
    },

    // Admin moderation
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: Date,
    moderationReason: String,

    // Timestamps
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ revieweeId: 1 });
reviewSchema.index({ reviewerType: 1 });
reviewSchema.index({ overall: -1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ isVerified: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ revieweeId: 1, status: 1 });
reviewSchema.index({ bookingId: 1, reviewerType: 1 });

// Virtual for average rating
reviewSchema.virtual("averageRating").get(function () {
  const ratings = [this.overall, this.punctuality, this.quality, this.communication, this.professionalism, this.valueForMoney].filter(r => r);
  if (ratings.length === 0) return this.overall;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Pre-save middleware to set reviewedAt
reviewSchema.pre("save", function (next) {
  if (this.isNew && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  next();
});

// Static method to calculate average rating for a user
reviewSchema.statics.getAverageRating = async function (userId, userType = "technician") {
  const result = await this.aggregate([
    {
      $match: {
        revieweeId: userId,
        reviewerType: userType,
        status: "active",
        isVerified: true,
      },
    },
    {
      $group: {
        _id: null,
        averageOverall: { $avg: "$overall" },
        averagePunctuality: { $avg: "$punctuality" },
        averageQuality: { $avg: "$quality" },
        averageCommunication: { $avg: "$communication" },
        averageProfessionalism: { $avg: "$professionalism" },
        averageValueForMoney: { $avg: "$valueForMoney" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0 ? result[0] : {
    averageOverall: 0,
    averagePunctuality: 0,
    averageQuality: 0,
    averageCommunication: 0,
    averageProfessionalism: 0,
    averageValueForMoney: 0,
    totalReviews: 0,
  };
};

// Static method to get recent reviews
reviewSchema.statics.getRecentReviews = function (userId, limit = 10) {
  return this.find({
    revieweeId: userId,
    status: "active",
    isPublic: true,
  })
    .populate("reviewerId", "firstName lastName avatar")
    .populate("bookingId", "serviceType createdAt")
    .sort({ createdAt: -1 })
    .limit(limit);
};

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
