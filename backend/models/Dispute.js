const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema(
  {
    // Dispute identification
    disputeId: {
      type: String,
      unique: true,
      required: true,
    },

    // Related booking
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // Dispute parties
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Dispute initiator
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    initiatorType: {
      type: String,
      enum: ["customer", "technician"],
      required: true,
    },

    // Dispute details
    category: {
      type: String,
      enum: [
        "service_quality",
        "pricing",
        "timing",
        "communication",
        "damage",
        "no_show",
        "incomplete_work",
        "payment_issue",
        "behavior",
        "other"
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Dispute description
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    // Evidence and attachments
    evidence: [{
      type: {
        type: String,
        enum: ["image", "video", "document", "audio"],
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      filename: String,
      description: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],

    // Requested resolution
    requestedResolution: {
      type: {
        type: String,
        enum: ["refund", "partial_refund", "rework", "replacement", "apology", "other"],
        required: true,
      },
      amount: Number, // for refunds
      description: String,
    },

    // Dispute status and workflow
    status: {
      type: String,
      enum: [
        "open",
        "under_review",
        "investigating",
        "mediation",
        "resolved",
        "closed",
        "escalated",
        "cancelled"
      ],
      default: "open",
    },

    // Timeline and deadlines
    deadline: Date,
    escalationDeadline: Date,

    // Admin assignment
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedAt: Date,

    // Communication log
    communication: [{
      type: {
        type: String,
        enum: ["message", "call", "email", "meeting", "document"],
        required: true,
      },
      direction: {
        type: String,
        enum: ["inbound", "outbound"],
        required: true,
      },
      participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      summary: String,
      notes: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      attachments: [{
        url: String,
        filename: String,
        type: String,
      }],
    }],

    // Resolution details
    resolution: {
      decision: {
        type: String,
        enum: [
          "customer_favor",
          "technician_favor",
          "partial_customer",
          "partial_technician",
          "no_action",
          "platform_credit",
          "warning_issued"
        ],
      },
      finalAmount: Number,
      refundAmount: Number,
      compensation: Number,
      explanation: String,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      resolvedAt: Date,
      resolutionNotes: String,
    },

    // Customer satisfaction with resolution
    satisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
      submittedAt: Date,
    },

    // Follow-up actions
    followUpActions: [{
      action: String,
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      dueDate: Date,
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      notes: String,
    }],

    // Internal admin notes
    internalNotes: [{
      note: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      isVisibleToCustomer: {
        type: Boolean,
        default: false,
      },
      isVisibleToTechnician: {
        type: Boolean,
        default: false,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    }],

    // Related disputes
    relatedDisputes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dispute",
    }],

    // Tags for categorization
    tags: [String],

    // Metadata
    source: {
      type: String,
      enum: ["web", "mobile", "phone", "email"],
      default: "web",
    },
    language: {
      type: String,
      default: "en",
    },

    // Timestamps
    createdAt: Date,
    updatedAt: Date,
    firstResponseAt: Date,
    closedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
disputeSchema.index({ bookingId: 1 });
disputeSchema.index({ customerId: 1 });
disputeSchema.index({ technicianId: 1 });
disputeSchema.index({ initiatedBy: 1 });
disputeSchema.index({ category: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ priority: 1 });
disputeSchema.index({ assignedTo: 1 });
disputeSchema.index({ createdAt: -1 });
disputeSchema.index({ deadline: 1 });
disputeSchema.index({ "resolution.resolvedAt": -1 });
disputeSchema.index({ customerId: 1, status: 1 });
disputeSchema.index({ technicianId: 1, status: 1 });

// Pre-save middleware to generate dispute ID
disputeSchema.pre("save", function (next) {
  if (this.isNew && !this.disputeId) {
    this.disputeId = `DIS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Set first response timestamp
  if (this.isModified("status") && this.status !== "open" && !this.firstResponseAt) {
    this.firstResponseAt = new Date();
  }

  // Set closed timestamp
  if (this.isModified("status") && (this.status === "resolved" || this.status === "closed") && !this.closedAt) {
    this.closedAt = new Date();
  }

  next();
});

// Virtual for age of dispute
disputeSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for time to resolution
disputeSchema.virtual("timeToResolution").get(function () {
  if (!this.resolution || !this.resolution.resolvedAt) return null;
  return Math.floor((this.resolution.resolvedAt - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Static method to find disputes by status
disputeSchema.statics.findByStatus = function (status, options = {}) {
  const { limit = 20, skip = 0, sort = { createdAt: -1 } } = options;

  return this.find({ status })
    .populate("customerId", "firstName lastName email avatar")
    .populate("technicianId", "firstName lastName email avatar")
    .populate("assignedTo", "firstName lastName email")
    .populate("bookingId", "serviceType status createdAt")
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get dispute statistics
disputeSchema.statics.getDisputeStats = async function (startDate, endDate) {
  const matchQuery = {};
  if (startDate && endDate) {
    matchQuery.createdAt = { $gte: startDate, $lte: endDate };
  }

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalDisputes: { $sum: 1 },
        openDisputes: {
          $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] }
        },
        resolvedDisputes: {
          $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
        },
        avgResolutionTime: {
          $avg: "$timeToResolution"
        },
        disputesByCategory: {
          $push: "$category"
        },
        totalRefundAmount: {
          $sum: { $ifNull: ["$resolution.refundAmount", 0] }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalDisputes: 0,
    openDisputes: 0,
    resolvedDisputes: 0,
    avgResolutionTime: 0,
    disputesByCategory: [],
    totalRefundAmount: 0,
  };
};

// Instance method to add communication log
disputeSchema.methods.addCommunication = function (type, direction, participant, summary, options = {}) {
  this.communication.push({
    type,
    direction,
    participant,
    summary,
    notes: options.notes,
    timestamp: new Date(),
    attachments: options.attachments || [],
  });

  return this.save();
};

// Instance method to resolve dispute
disputeSchema.methods.resolve = function (decision, explanation, resolvedBy, options = {}) {
  this.status = "resolved";
  this.resolution = {
    decision,
    explanation,
    resolvedBy,
    resolvedAt: new Date(),
    resolutionNotes: options.notes,
    finalAmount: options.finalAmount,
    refundAmount: options.refundAmount,
    compensation: options.compensation,
  };

  return this.save();
};

// Instance method to escalate dispute
disputeSchema.methods.escalate = function (reason, escalatedBy) {
  this.status = "escalated";
  this.internalNotes.push({
    note: `Escalated: ${reason}`,
    addedBy: escalatedBy,
    isVisibleToCustomer: false,
    isVisibleToTechnician: false,
    addedAt: new Date(),
  });

  return this.save();
};

const Dispute = mongoose.model("Dispute", disputeSchema);

module.exports = Dispute;
