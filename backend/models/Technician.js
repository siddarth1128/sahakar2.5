const mongoose = require("mongoose");

const technicianSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Professional Information
    services: [
      {
        type: String,
        required: true,
        enum: [
          "Plumbing",
          "Electrical",
          "Carpentry",
          "Painting",
          "AC Repair",
          "Appliance Repair",
          "Cleaning",
          "Pest Control",
          "Gardening",
          "Moving",
          "Other",
        ],
      },
    ],

    specializations: [String], // Specific skills within services

    experience: {
      years: {
        type: Number,
        required: true,
        min: 0,
      },
      description: String,
    },

    // Verification & Documents
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    documents: {
      idProof: {
        url: String,
        type: String, // aadhar, license, passport
        verified: {
          type: Boolean,
          default: false,
        },
      },
      certifications: [
        {
          name: String,
          url: String,
          issuedBy: String,
          issuedDate: Date,
          expiryDate: Date,
          verified: Boolean,
        },
      ],
      policeVerification: {
        url: String,
        verified: Boolean,
        verifiedDate: Date,
      },
    },

    // Ratings & Reviews
    rating: {
      overall: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      punctuality: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      quality: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      communication: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      professionalism: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // Pricing
    pricing: {
      hourlyRate: {
        type: Number,
        required: true,
        min: 0,
      },
      minimumCharge: {
        type: Number,
        default: 0,
      },
      emergencyCharge: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },

    // Availability
    availability: {
      status: {
        type: String,
        enum: ["available", "busy", "offline"],
        default: "offline",
      },
      schedule: {
        monday: { available: Boolean, slots: [String] },
        tuesday: { available: Boolean, slots: [String] },
        wednesday: { available: Boolean, slots: [String] },
        thursday: { available: Boolean, slots: [String] },
        friday: { available: Boolean, slots: [String] },
        saturday: { available: Boolean, slots: [String] },
        sunday: { available: Boolean, slots: [String] },
      },
      instantBooking: {
        type: Boolean,
        default: true,
      },
    },

    // Location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: "India",
      },
    },

    serviceRadius: {
      type: Number,
      default: 10, // in kilometers
      min: 1,
      max: 50,
    },

    // Professional Details
    bio: {
      type: String,
      maxlength: 500,
    },

    languages: [
      {
        type: String,
        default: ["English"],
      },
    ],

    // Statistics
    stats: {
      totalJobs: {
        type: Number,
        default: 0,
      },
      completedJobs: {
        type: Number,
        default: 0,
      },
      cancelledJobs: {
        type: Number,
        default: 0,
      },
      rejectedJobs: {
        type: Number,
        default: 0,
      },
      responseTime: {
        type: Number,
        default: 0, // in minutes
      },
      completionRate: {
        type: Number,
        default: 0, // percentage
      },
      onTimeRate: {
        type: Number,
        default: 0, // percentage
      },
    },

    // Earnings
    earnings: {
      totalEarned: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
      withdrawn: {
        type: Number,
        default: 0,
      },
      lastPayoutDate: Date,
    },

    // Bank Details for Payouts
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String,
      upiId: String,
      verified: {
        type: Boolean,
        default: false,
      },
    },

    // Featured & Premium
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumUntil: Date,

    // Badge System
    badges: [
      {
        type: String,
        enum: [
          "Top Rated",
          "Fast Response",
          "Reliable",
          "5 Star Pro",
          "100+ Jobs",
          "Verified Pro",
          "Emergency Expert",
          "Customer Favorite",
        ],
      },
    ],

    // Safety Features
    backgroundCheckStatus: {
      type: String,
      enum: ["pending", "verified", "failed", "expired"],
      default: "pending",
    },
    backgroundCheckDate: Date,

    insuranceDetails: {
      hasInsurance: {
        type: Boolean,
        default: false,
      },
      provider: String,
      policyNumber: String,
      expiryDate: Date,
    },

    // Account Status
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deactivated", "pending_review"],
      default: "pending_review",
    },
    suspensionReason: String,
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    suspendedAt: Date,

    // Emergency Services
    providesEmergencyService: {
      type: Boolean,
      default: false,
    },
    emergencyAvailability: {
      type: String,
      enum: ["24/7", "weekends", "limited", "none"],
      default: "none",
    },

    // Customer Preferences
    preferredCustomerType: {
      type: String,
      enum: ["all", "residential", "commercial"],
      default: "all",
    },

    // Portfolio
    portfolio: [
      {
        title: String,
        description: String,
        images: [String],
        completedAt: Date,
        category: String,
      },
    ],

    // Equipment & Tools
    hasOwnTools: {
      type: Boolean,
      default: false,
    },
    toolsList: [String],

    // Vehicle for Service
    hasVehicle: {
      type: Boolean,
      default: false,
    },
    vehicleType: String,

    // Referral Stats
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },

    // Last Active
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    // Push Notifications
    pushTokens: [String], // For mobile notifications

    // Preferences
    preferences: {
      autoAcceptJobs: {
        type: Boolean,
        default: false,
      },
      maxDailyJobs: {
        type: Number,
        default: 5,
      },
      notifyNewJobs: {
        type: Boolean,
        default: true,
      },
      notifyMessages: {
        type: Boolean,
        default: true,
      },
      notifyReviews: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
technicianSchema.index({ userId: 1 });
technicianSchema.index({ "location.coordinates": "2dsphere" });
technicianSchema.index({ services: 1 });
technicianSchema.index({ "availability.status": 1 });
technicianSchema.index({ isVerified: 1 });
technicianSchema.index({ "rating.overall": -1 });
technicianSchema.index({ accountStatus: 1 });
technicianSchema.index({ isFeatured: 1 });
technicianSchema.index({ services: 1, "availability.status": 1 });
technicianSchema.index({
  services: 1,
  "location.coordinates": "2dsphere",
  "availability.status": 1
});

// Virtual for completion rate calculation
technicianSchema.virtual("successRate").get(function () {
  if (this.stats.totalJobs === 0) return 0;
  return ((this.stats.completedJobs / this.stats.totalJobs) * 100).toFixed(2);
});

// Generate unique referral code
technicianSchema.methods.generateReferralCode = function () {
  const code = `TECH${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  this.referralCode = code;
  return code;
};

// Update availability status
technicianSchema.methods.updateAvailability = function (status) {
  this.availability.status = status;
  this.lastActiveAt = new Date();
  return this.save();
};

// Calculate average rating
technicianSchema.methods.calculateAverageRating = function () {
  const ratings = [
    this.rating.overall,
    this.rating.punctuality,
    this.rating.quality,
    this.rating.communication,
    this.rating.professionalism,
  ].filter((r) => r > 0);

  if (ratings.length === 0) return 0;
  return (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2);
};

// Static method to find nearby technicians
technicianSchema.statics.findNearby = function (
  coordinates,
  maxDistance,
  service,
  filters = {}
) {
  const query = {
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: coordinates, // [longitude, latitude]
        },
        $maxDistance: maxDistance * 1000, // Convert km to meters
      },
    },
    accountStatus: "active",
    isVerified: true,
    "availability.status": { $in: ["available", "busy"] },
  };

  if (service) {
    query.services = service;
  }

  if (filters.minRating) {
    query["rating.overall"] = { $gte: filters.minRating };
  }

  if (filters.maxPrice) {
    query["pricing.hourlyRate"] = { $lte: filters.maxPrice };
  }

  if (filters.emergency) {
    query.providesEmergencyService = true;
  }

  return this.find(query)
    .populate("userId", "firstName lastName email phone avatar")
    .limit(filters.limit || 20);
};

// Static method to get top rated technicians
technicianSchema.statics.getTopRated = function (service, limit = 10) {
  const query = {
    accountStatus: "active",
    isVerified: true,
    "rating.overall": { $gte: 4 },
    totalReviews: { $gte: 5 },
  };

  if (service) {
    query.services = service;
  }

  return this.find(query)
    .populate("userId", "firstName lastName email phone avatar")
    .sort({ "rating.overall": -1, totalReviews: -1 })
    .limit(limit);
};

// Pre-save middleware
technicianSchema.pre("save", function (next) {
  // Calculate completion rate
  if (this.stats.totalJobs > 0) {
    this.stats.completionRate = (
      (this.stats.completedJobs / this.stats.totalJobs) *
      100
    ).toFixed(2);
  }

  // Update last active
  if (this.isModified("availability.status")) {
    this.lastActiveAt = new Date();
  }

  next();
});

const Technician = mongoose.model("Technician", technicianSchema);

module.exports = Technician;
