const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // Basic booking information
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.bookingType === "precision";
      },
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.bookingType === "precision";
      },
    },

    // Booking Type
    bookingType: {
      type: String,
      enum: ["precision", "broadcast"],
      default: "precision",
    },

    // Broadcast Request Fields
    broadcastRequest: {
      isActive: {
        type: Boolean,
        default: false,
      },
      sentTo: [
        {
          technicianId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          sentAt: {
            type: Date,
            default: Date.now,
          },
          viewed: {
            type: Boolean,
            default: false,
          },
          viewedAt: Date,
          status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "auto_rejected"],
            default: "pending",
          },
          rejectionReason: String,
        },
      ],
      acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      acceptedAt: Date,
      expiresAt: Date,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    serviceType: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
    },
    richDescription: {
      type: String, // HTML/Markdown formatted
    },

    // Scheduling
    scheduledDate: {
      type: Date,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    estimatedDuration: {
      type: Number, // in hours
      default: 1,
    },

    // Location information
    location: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: {
          type: Number,
        },
        longitude: {
          type: Number,
        },
      },
      city: String,
      state: String,
      zipCode: String,
      doorNotes: String, // Special instructions for finding the location
    },

    // Status and workflow
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "confirmed",
        "en_route",
        "in_progress",
        "completed",
        "cancelled",
        "rejected",
        "disputed",
        "refunded",
      ],
      default: "pending",
    },

    // Pricing
    pricing: {
      basePrice: {
        type: Number,
        required: true,
      },
      distanceFee: {
        type: Number,
        default: 0,
      },
      urgencyFee: {
        type: Number,
        default: 0,
      },
      additionalCharges: [
        {
          description: String,
          amount: Number,
        },
      ],
      discount: {
        type: Number,
        default: 0,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },

    // Payment information (simplified - no Stripe integration)
    payment: {
      method: {
        type: String,
        enum: ["cash", "upi", "bank_transfer", "wallet"],
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      referenceId: String, // UPI transaction ID or reference number
      paidAt: Date,
    },

    // Media uploads (images and videos)
    media: [
      {
        url: String,
        publicId: String,
        type: {
          type: String,
          enum: ["image", "video"],
          default: "image",
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        category: {
          type: String,
          enum: [
            "problem",
            "before",
            "after",
            "receipt",
            "completion",
            "other",
          ],
          default: "problem",
        },
      },
    ],

    // Voice notes
    voiceNotes: [
      {
        url: String,
        publicId: String,
        duration: Number, // in seconds
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Technician live location tracking
    technicianLocation: {
      current: {
        latitude: Number,
        longitude: Number,
        lastUpdated: Date,
        heading: Number, // direction of travel
        speed: Number, // speed in km/h
        accuracy: Number, // in meters
      },
      history: [
        {
          latitude: Number,
          longitude: Number,
          timestamp: Date,
        },
      ],
      eta: {
        minutes: Number,
        lastCalculated: Date,
      },
    },

    // Recurring booking
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ["weekly", "monthly", "custom"],
      },
      interval: {
        type: Number,
        default: 1,
      }, // every N weeks/months
      endDate: Date,
      occurrences: [
        {
          date: Date,
          completed: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },

    // Photos
    beforePhotos: [String],
    afterPhotos: [String],
    completionNotes: String,

    // Service completion
    completionDetails: {
      completedAt: Date,
      actualDuration: Number, // in hours
      workDescription: String,
      materialsUsed: [
        {
          name: String,
          quantity: Number,
          unit: String,
          cost: Number,
        },
      ],
      technicianNotes: String,
    },

    // Rating and review
    rating: {
      overall: {
        type: Number,
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
      review: String,
      ratedAt: Date,
      ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Loyalty points
    loyaltyPoints: {
      earned: {
        type: Number,
        default: 0,
      },
      redeemed: {
        type: Number,
        default: 0,
      },
    },

    // Chat history
    chatMessages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Dispute handling
    dispute: {
      isDisputed: {
        type: Boolean,
        default: false,
      },
      disputedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      disputeReason: String,
      disputeDescription: String,
      disputeEvidence: [
        {
          type: String, // URLs to evidence images
        },
      ],
      disputedAt: Date,
      adminResolution: {
        resolution: String,
        resolvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        resolvedAt: Date,
        refundAmount: Number,
        notes: String,
      },
    },

    // Additional features
    isEmergency: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    urgencyBadge: {
      type: String,
      enum: ["now", "today", "scheduled", "flexible"],
      default: "scheduled",
    },
    budgetRange: {
      min: Number,
      max: Number,
    },
    specialInstructions: String,

    // AI Generated Summary
    aiSummary: String,

    // Timestamps
    acceptedAt: Date,
    confirmedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,

    // Cancellation/Rejection
    cancellationReason: String,
    cancelledBy: {
      type: String,
      enum: ["customer", "technician", "admin"],
    },

    // Rescheduling
    rescheduledBy: {
      type: String,
      enum: ["customer", "technician", "admin"],
    },
    rescheduleReason: String,

    // Metadata
    source: {
      type: String,
      enum: ["web", "mobile", "phone"],
      default: "web",
    },
    ipAddress: String,
    userAgent: String,

    // Internal notes (admin only)
    internalNotes: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Viewing tracking (for broadcast requests)
    viewedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ technicianId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ "location.coordinates": "2dsphere" });
bookingSchema.index({ serviceType: 1 });
bookingSchema.index({ isEmergency: 1 });
bookingSchema.index({ "dispute.isDisputed": 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ technicianId: 1, status: 1 });
bookingSchema.index({ technicianId: 1, date: 1 });
bookingSchema.index({ bookingType: 1 });
bookingSchema.index({ urgencyBadge: 1 });
bookingSchema.index({ "broadcastRequest.isActive": 1 });
bookingSchema.index({ "broadcastRequest.sentTo.technicianId": 1 });

// Virtual for distance calculation
bookingSchema.virtual("distanceFromTechnician").get(function () {
  // This would be calculated based on technician location
  return this.distance;
});

// Virtual for total earnings for technician
bookingSchema.virtual("technicianEarnings").get(function () {
  if (
    this.status === "completed" &&
    this.payment &&
    this.payment.status === "completed"
  ) {
    return this.pricing.totalPrice * 0.8; // Assuming 80% goes to technician
  }
  return 0;
});

// Pre-save middleware to calculate total price
bookingSchema.pre("save", function (next) {
  if (this.isModified("pricing")) {
    this.pricing.totalPrice =
      this.pricing.basePrice +
      this.pricing.distanceFee +
      this.pricing.urgencyFee +
      this.pricing.additionalCharges.reduce(
        (sum, charge) => sum + charge.amount,
        0,
      ) -
      this.pricing.discount;
  }

  // Set status timestamps
  if (this.isModified("status")) {
    const now = new Date();
    switch (this.status) {
      case "accepted":
        if (!this.confirmedAt) this.confirmedAt = now;
        break;
      case "confirmed":
        if (!this.confirmedAt) this.confirmedAt = now;
        break;
      case "en_route":
        if (!this.startedAt) this.startedAt = now;
        break;
      case "in_progress":
        if (!this.startedAt) this.startedAt = now;
        break;
      case "completed":
        this.completedAt = now;
        break;
      case "cancelled":
        this.cancelledAt = now;
        break;
    }
  }

  // Handle broadcast request expiry
  if (this.bookingType === "broadcast" && this.broadcastRequest.isActive) {
    if (!this.broadcastRequest.expiresAt) {
      this.broadcastRequest.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
  }

  next();
});

// Method to mark booking as viewed by technician
bookingSchema.methods.markAsViewedBy = function (technicianId) {
  const alreadyViewed = this.viewedBy.some(
    (v) => v.userId.toString() === technicianId.toString(),
  );

  if (!alreadyViewed) {
    this.viewedBy.push({
      userId: technicianId,
      viewedAt: new Date(),
    });
  }

  // Update in broadcast request if applicable
  if (this.bookingType === "broadcast" && this.broadcastRequest.sentTo) {
    const techIndex = this.broadcastRequest.sentTo.findIndex(
      (t) => t.technicianId.toString() === technicianId.toString(),
    );

    if (techIndex !== -1) {
      this.broadcastRequest.sentTo[techIndex].viewed = true;
      this.broadcastRequest.sentTo[techIndex].viewedAt = new Date();
    }
  }

  return this.save();
};

// Method to accept broadcast request
bookingSchema.methods.acceptBroadcast = async function (technicianId) {
  if (this.bookingType !== "broadcast") {
    throw new Error("This is not a broadcast request");
  }

  if (this.broadcastRequest.acceptedBy) {
    throw new Error("This request has already been accepted");
  }

  // Set the technician and update status
  this.technicianId = technicianId;
  this.broadcastRequest.acceptedBy = technicianId;
  this.broadcastRequest.acceptedAt = new Date();
  this.broadcastRequest.isActive = false;
  this.status = "accepted";

  // Auto-reject all other technicians
  if (this.broadcastRequest.sentTo) {
    this.broadcastRequest.sentTo.forEach((tech) => {
      if (
        tech.technicianId.toString() !== technicianId.toString() &&
        tech.status === "pending"
      ) {
        tech.status = "auto_rejected";
      }
    });
  }

  return this.save();
};

// Method to update technician location
bookingSchema.methods.updateTechnicianLocation = function (
  latitude,
  longitude,
  extras = {},
) {
  if (!this.technicianLocation) {
    this.technicianLocation = { current: {}, history: [] };
  }

  // Add current location to history
  if (
    this.technicianLocation.current &&
    this.technicianLocation.current.latitude
  ) {
    this.technicianLocation.history.push({
      latitude: this.technicianLocation.current.latitude,
      longitude: this.technicianLocation.current.longitude,
      timestamp: this.technicianLocation.current.lastUpdated || new Date(),
    });

    // Keep only last 50 locations
    if (this.technicianLocation.history.length > 50) {
      this.technicianLocation.history =
        this.technicianLocation.history.slice(-50);
    }
  }

  // Update current location
  this.technicianLocation.current = {
    latitude,
    longitude,
    lastUpdated: new Date(),
    heading: extras.heading || this.technicianLocation.current?.heading,
    speed: extras.speed || this.technicianLocation.current?.speed,
    accuracy: extras.accuracy || this.technicianLocation.current?.accuracy,
  };

  // Update ETA if provided
  if (extras.eta) {
    this.technicianLocation.eta = {
      minutes: extras.eta,
      lastCalculated: new Date(),
    };
  }

  return this.save();
};

// Static method to find nearby technicians
bookingSchema.statics.findNearbyTechnicians = function (
  coordinates,
  maxDistance = 10000,
) {
  return this.find({
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
    status: { $in: ["pending", "confirmed"] },
  });
};

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
