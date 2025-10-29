const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const User = require("../models/User");
const {
  emitBookingRequest,
  emitBookingAccepted,
  emitBookingUpdate,
  emitNotification,
} = require("../utils/socketUtils");

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (Customer only)
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      technicianId,
      serviceType,
      description,
      title,
      date,
      time,
      location,
      notes,
      bookingType,
      priority,
      isEmergency,
      urgency,
      pricing,
    } = req.body;

    console.log("Creating booking with data:", {
      technicianId,
      serviceType,
      title,
      date,
      time,
      location,
      pricing,
    });

    // Validate required fields
    if (!serviceType || !description || !date || !time || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
        missing: {
          serviceType: !serviceType,
          description: !description,
          date: !date,
          time: !time,
          location: !location,
        },
      });
    }

    // Validate location has address
    if (!location.address) {
      return res.status(400).json({
        success: false,
        message: "Location address is required",
      });
    }

    // Verify technician exists and is active (if provided for precision booking)
    let technician = null;
    if (technicianId) {
      technician = await User.findOne({
        _id: technicianId,
        userType: "technician",
        isActive: true,
      });

      if (!technician) {
        return res.status(404).json({
          success: false,
          message: "Technician not found or unavailable",
        });
      }
    }

    // Ensure pricing has required fields
    const bookingPricing = pricing || {
      basePrice: 75,
      distanceFee: 0,
      urgencyFee: 0,
      additionalCharges: [],
      discount: 0,
      totalPrice: 75,
    };

    // Make sure pricing has all required fields
    if (!bookingPricing.basePrice) bookingPricing.basePrice = 75;
    if (!bookingPricing.totalPrice) {
      bookingPricing.totalPrice =
        (bookingPricing.basePrice || 75) +
        (bookingPricing.distanceFee || 0) +
        (bookingPricing.urgencyFee || 0) -
        (bookingPricing.discount || 0);
    }

    // Create booking data
    const bookingData = {
      customer: req.user.id,
      customerId: req.user.id,
      serviceType,
      description,
      title: title || `${serviceType} Service`,
      date,
      time,
      location,
      notes: notes || "",
      bookingType: bookingType || (technicianId ? "precision" : "broadcast"),
      priority: priority || "normal",
      isEmergency: isEmergency || false,
      pricing: bookingPricing,
    };

    // Add technician if provided
    if (technicianId) {
      bookingData.technician = technicianId;
      bookingData.technicianId = technicianId;
    }

    console.log("Final booking data:", JSON.stringify(bookingData, null, 2));

    // Create booking
    const booking = await Booking.create(bookingData);

    // Create notification for technician (if precision booking)
    if (technicianId) {
      await Notification.create({
        userId: technicianId,
        type: "info",
        title: "New Booking Request",
        message: `You have a new booking request from ${req.user.firstName} ${req.user.lastName}`,
        relatedId: booking._id,
        relatedModel: "Booking",
      });

      // Emit real-time notification to technician
      const customerInfo = {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        avatar: req.user.avatar,
      };

      emitBookingRequest(req.io, technicianId, {
        _id: booking._id,
        customerName: `${req.user.firstName} ${req.user.lastName}`,
        customerInfo,
        serviceType,
        description,
        date,
        time,
        location,
        notes,
        status: booking.status,
        createdAt: booking.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      message: technicianId
        ? "Booking request sent to technician successfully"
        : "Booking request broadcasted to nearby technicians",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);

    // Log validation errors in detail
    if (error.name === "ValidationError") {
      const validationErrors = {};
      Object.keys(error.errors).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });

      console.error("Validation errors:", validationErrors);

      return res.status(400).json({
        success: false,
        message: "Booking validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all bookings for current user
 * @route   GET /api/bookings
 * @access  Private
 */
exports.getBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};

    if (req.user.userType === "customer") {
      query.customerId = req.user.id;
    } else if (req.user.userType === "technician") {
      query.technicianId = req.user.id;
    } else if (req.user.userType === "admin") {
      // Admin can see all
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate("customerId", "firstName lastName email phone avatar")
      .populate("customer", "firstName lastName email phone avatar")
      .populate(
        "technicianId",
        "firstName lastName email phone avatar technicianDetails",
      )
      .populate(
        "technician",
        "firstName lastName email phone avatar technicianDetails",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customerId", "firstName lastName email phone avatar address")
      .populate("customer", "firstName lastName email phone avatar address")
      .populate(
        "technicianId",
        "firstName lastName email phone avatar technicianDetails",
      )
      .populate(
        "technician",
        "firstName lastName email phone avatar technicianDetails",
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user can access this booking
    const customerIdStr =
      booking.customerId?._id?.toString() || booking.customer?._id?.toString();
    const technicianIdStr =
      booking.technicianId?._id?.toString() ||
      booking.technician?._id?.toString();

    if (req.user.userType === "customer" && customerIdStr !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    if (req.user.userType === "technician" && technicianIdStr !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update booking status
 * @route   PUT /api/bookings/:id/status
 * @access  Private
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !status ||
      ![
        "pending",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check permissions
    const customerIdStr =
      booking.customerId?.toString() || booking.customer?.toString();
    const technicianIdStr =
      booking.technicianId?.toString() || booking.technician?.toString();

    if (req.user.userType === "customer" && customerIdStr !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    if (req.user.userType === "technician" && technicianIdStr !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    booking.status = status;
    await booking.save();

    // Create notification for the other party
    const recipientId =
      req.user.userType === "customer"
        ? booking.technicianId || booking.technician
        : booking.customerId || booking.customer;
    const userName = req.user.firstName + " " + req.user.lastName;

    await Notification.create({
      userId: recipientId,
      type: "info",
      title: "Booking Status Updated",
      message: `Your booking status has been updated to ${status} by ${userName}`,
      relatedId: booking._id,
      relatedModel: "Booking",
    });

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "completed" || booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed or already cancelled booking",
      });
    }

    // Check permissions
    const customerIdStr =
      booking.customerId?.toString() || booking.customer?.toString();
    const technicianIdStr =
      booking.technicianId?.toString() || booking.technician?.toString();

    if (req.user.userType === "customer" && customerIdStr !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    if (req.user.userType === "technician" && technicianIdStr !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    // Create notification for the other party
    const recipientId =
      req.user.userType === "customer"
        ? booking.technicianId || booking.technician
        : booking.customerId || booking.customer;
    const userName = req.user.firstName + " " + req.user.lastName;

    await Notification.create({
      userId: recipientId,
      type: "warning",
      title: "Booking Cancelled",
      message: `Your booking has been cancelled by ${userName}`,
      relatedId: booking._id,
      relatedModel: "Booking",
    });

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Accept booking request (Technician only)
 * @route   PUT /api/bookings/:id/accept
 * @access  Private (Technician)
 */
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is a technician
    if (req.user.userType !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can accept bookings",
      });
    }

    // Check if booking is for this technician or is a broadcast
    const technicianIdStr =
      booking.technicianId?.toString() || booking.technician?.toString();

    if (
      booking.bookingType === "precision" &&
      technicianIdStr !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to accept this booking",
      });
    }

    // Check if booking is already accepted or completed
    if (
      booking.status !== "pending" &&
      booking.status !== "confirmed" &&
      !(
        booking.bookingType === "broadcast" &&
        booking.broadcastRequest?.isActive
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be accepted",
      });
    }

    // Handle broadcast booking acceptance
    if (booking.bookingType === "broadcast") {
      if (booking.broadcastRequest?.acceptedBy) {
        return res.status(400).json({
          success: false,
          message:
            "This booking has already been accepted by another technician",
        });
      }

      // Accept the broadcast request
      await booking.acceptBroadcast(req.user.id);
    } else {
      // Update precision booking status
      booking.status = "accepted";
      booking.acceptedAt = new Date();
      await booking.save();
    }

    // Create notification for customer
    await Notification.create({
      userId: booking.customerId || booking.customer,
      type: "success",
      title: "Booking Accepted",
      message: `Your booking has been accepted by ${req.user.firstName} ${req.user.lastName}`,
      relatedId: booking._id,
      relatedModel: "Booking",
    });

    // Emit real-time notification
    emitBookingAccepted(req.io, booking.customerId || booking.customer, {
      _id: booking._id,
      technicianName: `${req.user.firstName} ${req.user.lastName}`,
      status: booking.status,
      acceptedAt: booking.acceptedAt,
    });

    res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Accept booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error accepting booking",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Reject booking request (Technician only)
 * @route   PUT /api/bookings/:id/reject
 * @access  Private (Technician)
 */
exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is a technician
    if (req.user.userType !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can reject bookings",
      });
    }

    // Check if booking is for this technician or is a broadcast
    const technicianIdStr =
      booking.technicianId?.toString() || booking.technician?.toString();

    if (
      booking.bookingType === "precision" &&
      technicianIdStr !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reject this booking",
      });
    }

    // Check if booking can be rejected
    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be rejected",
      });
    }

    // Handle broadcast booking rejection
    if (
      booking.bookingType === "broadcast" &&
      booking.broadcastRequest?.sentTo
    ) {
      const techIndex = booking.broadcastRequest.sentTo.findIndex(
        (t) => t.technicianId.toString() === req.user.id,
      );

      if (techIndex !== -1) {
        booking.broadcastRequest.sentTo[techIndex].status = "rejected";
        booking.broadcastRequest.sentTo[techIndex].rejectionReason =
          reason || "Not available";
      }
    } else {
      // Update precision booking status
      booking.status = "rejected";
      booking.cancellationReason = reason || "Rejected by technician";
      booking.cancelledBy = "technician";
      booking.cancelledAt = new Date();
    }

    await booking.save();

    // Create notification for customer
    await Notification.create({
      userId: booking.customerId || booking.customer,
      type: "warning",
      title: "Booking Rejected",
      message: `Your booking has been rejected by ${req.user.firstName} ${req.user.lastName}${reason ? `: ${reason}` : ""}`,
      relatedId: booking._id,
      relatedModel: "Booking",
    });

    res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Reject booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting booking",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Start booking (Technician only)
 * @route   PUT /api/bookings/:id/start
 * @access  Private (Technician)
 */
exports.startBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is the assigned technician
    const technicianIdStr =
      booking.technicianId?.toString() || booking.technician?.toString();

    if (technicianIdStr !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to start this booking",
      });
    }

    // Check if booking is accepted
    if (booking.status !== "accepted" && booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only accepted bookings can be started",
      });
    }

    booking.status = "in_progress";
    booking.startedAt = new Date();
    await booking.save();

    // Create notification for customer
    await Notification.create({
      userId: booking.customerId || booking.customer,
      type: "info",
      title: "Service Started",
      message: `${req.user.firstName} ${req.user.lastName} has started working on your service`,
      relatedId: booking._id,
      relatedModel: "Booking",
    });

    // Emit real-time notification
    emitBookingUpdate(req.io, booking.customerId || booking.customer, {
      _id: booking._id,
      status: booking.status,
      startedAt: booking.startedAt,
    });

    res.status(200).json({
      success: true,
      message: "Booking started successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Start booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error starting booking",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Complete booking (Technician only)
 * @route   PUT /api/bookings/:id/complete
 * @access  Private (Technician)
 */
exports.completeBooking = async (req, res) => {
  try {
    const { notes, workDescription } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is the assigned technician
    const technicianIdStr =
      booking.technicianId?.toString() || booking.technician?.toString();

    if (technicianIdStr !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to complete this booking",
      });
    }

    // Check if booking is in progress
    if (booking.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Only in-progress bookings can be completed",
      });
    }

    booking.status = "completed";
    booking.completedAt = new Date();
    booking.completionNotes = notes || "";

    if (!booking.completionDetails) {
      booking.completionDetails = {};
    }
    booking.completionDetails.completedAt = new Date();
    booking.completionDetails.workDescription = workDescription || notes || "";

    if (booking.startedAt) {
      const duration =
        (booking.completedAt - booking.startedAt) / (1000 * 60 * 60);
      booking.completionDetails.actualDuration = duration;
    }

    await booking.save();

    // Update technician's completed jobs count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { "technicianDetails.completedJobs": 1 },
    });

    // Create notification for customer
    await Notification.create({
      userId: booking.customerId || booking.customer,
      type: "success",
      title: "Service Completed",
      message: `${req.user.firstName} ${req.user.lastName} has completed your service`,
      relatedId: booking._id,
      relatedModel: "Booking",
    });

    // Emit real-time notification
    emitBookingUpdate(req.io, booking.customerId || booking.customer, {
      _id: booking._id,
      status: booking.status,
      completedAt: booking.completedAt,
    });

    res.status(200).json({
      success: true,
      message: "Booking completed successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Complete booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error completing booking",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
