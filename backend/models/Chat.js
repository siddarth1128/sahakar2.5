const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    // Chat participants
    participants: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      userType: {
        type: String,
        enum: ["customer", "technician", "admin"],
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    }],

    // Related booking (optional)
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    // Chat type
    type: {
      type: String,
      enum: ["booking", "general", "support", "dispute"],
      default: "general",
    },

    // Chat status
    status: {
      type: String,
      enum: ["active", "closed", "archived"],
      default: "active",
    },

    // Chat subject/title
    subject: {
      type: String,
      maxlength: 200,
    },

    // Messages array (embedded for performance)
    messages: [{
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      senderType: {
        type: String,
        enum: ["customer", "technician", "admin"],
        required: true,
      },
      content: {
        type: String,
        required: true,
        maxlength: 1000,
      },
      messageType: {
        type: String,
        enum: ["text", "image", "file", "location", "system"],
        default: "text",
      },
      // File attachments
      attachments: [{
        filename: String,
        url: String,
        fileSize: Number,
        mimeType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      }],
      // Location data
      location: {
        latitude: Number,
        longitude: Number,
        address: String,
      },
      // Message status
      isRead: {
        type: Boolean,
        default: false,
      },
      readBy: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      }],
      // Edit history
      isEdited: {
        type: Boolean,
        default: false,
      },
      editedAt: Date,
      originalContent: String,
      // Moderation
      isDeleted: {
        type: Boolean,
        default: false,
      },
      deletedAt: Date,
      deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      // Timestamp
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],

    // Chat metadata
    lastMessage: {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      content: String,
      timestamp: Date,
    },

    // Unread count for each participant
    unreadCounts: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      count: {
        type: Number,
        default: 0,
      },
    }],

    // Chat settings
    settings: {
      isMuted: {
        type: Boolean,
        default: false,
      },
      muteNotifications: {
        type: Boolean,
        default: false,
      },
      allowFileUploads: {
        type: Boolean,
        default: true,
      },
      maxFileSize: {
        type: Number,
        default: 5242880, // 5MB
      },
    },

    // Admin moderation
    isModerated: {
      type: Boolean,
      default: false,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: Date,
    moderationReason: String,

    // Pinned messages
    pinnedMessages: [{
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      pinnedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      pinnedAt: {
        type: Date,
        default: Date.now,
      },
    }],

    // Chat statistics
    stats: {
      totalMessages: {
        type: Number,
        default: 0,
      },
      totalParticipants: {
        type: Number,
        default: 2,
      },
      lastActivity: {
        type: Date,
        default: Date.now,
      },
    },

    // Auto-close settings
    autoCloseAfter: {
      type: Number, // days of inactivity
      default: 30,
    },
    scheduledCloseDate: Date,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
chatSchema.index({ participants: 1 });
chatSchema.index({ bookingId: 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ status: 1 });
chatSchema.index({ "lastMessage.timestamp": -1 });
chatSchema.index({ createdAt: -1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ "participants.userId": 1, status: 1 });

// Virtual for participant count
chatSchema.virtual("participantCount").get(function () {
  return this.participants.length;
});

// Virtual for unread message count for a specific user
chatSchema.virtual("unreadCount").get(function (userId) {
  const unreadCount = this.unreadCounts.find(uc => uc.userId.toString() === userId.toString());
  return unreadCount ? unreadCount.count : 0;
});

// Pre-save middleware to update last message and stats
chatSchema.pre("save", function (next) {
  if (this.isModified("messages")) {
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage && !lastMessage.isDeleted) {
      this.lastMessage = {
        senderId: lastMessage.senderId,
        content: lastMessage.content,
        timestamp: lastMessage.timestamp,
      };
    }

    this.stats.totalMessages = this.messages.filter(m => !m.isDeleted).length;
    this.stats.lastActivity = new Date();
  }

  this.updatedAt = new Date();
  next();
});

// Static method to find chats for a user
chatSchema.statics.findUserChats = function (userId, options = {}) {
  const { type, status = "active", limit = 20, skip = 0 } = options;

  let query = {
    "participants.userId": userId,
    status: status,
  };

  if (type) {
    query.type = type;
  }

  return this.find(query)
    .populate("participants.userId", "firstName lastName avatar userType")
    .populate("bookingId", "serviceType status date")
    .sort({ "lastMessage.timestamp": -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to create or get existing chat
chatSchema.statics.findOrCreateChat = async function (participants, bookingId = null, type = "booking") {
  // Check if chat already exists between these participants
  const existingChat = await this.findOne({
    "participants.userId": { $all: participants.map(p => p.userId) },
    ...(bookingId && { bookingId }),
    status: { $in: ["active", "closed"] },
  });

  if (existingChat) {
    return existingChat;
  }

  // Create new chat
  const chat = new this({
    participants,
    bookingId,
    type,
    subject: type === "booking" ? "Booking Discussion" : "General Chat",
  });

  return await chat.save();
};

// Instance method to add a message
chatSchema.methods.addMessage = function (senderId, content, options = {}) {
  const message = {
    senderId,
    senderType: options.senderType || "customer",
    content,
    messageType: options.messageType || "text",
    timestamp: new Date(),
  };

  // Add attachments if provided
  if (options.attachments) {
    message.attachments = options.attachments;
  }

  // Add location if provided
  if (options.location) {
    message.location = options.location;
  }

  this.messages.push(message);

  // Update unread counts for other participants
  this.participants.forEach(participant => {
    if (participant.userId.toString() !== senderId.toString()) {
      const unreadIndex = this.unreadCounts.findIndex(uc => uc.userId.toString() === participant.userId.toString());
      if (unreadIndex >= 0) {
        this.unreadCounts[unreadIndex].count += 1;
      } else {
        this.unreadCounts.push({
          userId: participant.userId,
          count: 1,
        });
      }
    }
  });

  return this.save();
};

// Instance method to mark messages as read
chatSchema.methods.markAsRead = function (userId) {
  const unreadIndex = this.unreadCounts.findIndex(uc => uc.userId.toString() === userId.toString());
  if (unreadIndex >= 0) {
    this.unreadCounts[unreadIndex].count = 0;
  }

  // Mark individual messages as read
  this.messages.forEach(message => {
    if (message.senderId.toString() !== userId.toString() && !message.isRead) {
      message.isRead = true;
      message.readBy.push({
        userId,
        readAt: new Date(),
      });
    }
  });

  return this.save();
};

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
