const User = require("../models/User");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

/**
 * @desc    Get technician dashboard data
 * @route   GET /api/technician/dashboard
 * @access  Private (Technician)
 */
exports.getTechnicianDashboard = async (req, res) => {
  try {
    const technicianId = req.user.id;

    // Get technician details
    const technician = await User.findById(technicianId).select("-password");

    if (!technician || technician.userType !== "technician") {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    // Get current week's date range
    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay()),
    );
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    // Get stats
    const [
      weeklyEarnings,
      totalJobs,
      activeJobs,
      pendingRequests,
      upcomingJobs,
    ] = await Promise.all([
      // Weekly earnings
      Booking.aggregate([
        {
          $match: {
            technician: new mongoose.Types.ObjectId(technicianId),
            status: "completed",
            completedAt: { $gte: startOfWeek, $lt: endOfWeek },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$pricing.totalPrice" },
            count: { $sum: 1 },
          },
        },
      ]),
      // Total completed jobs
      Booking.countDocuments({
        technician: technicianId,
        status: "completed",
      }),
      // Active jobs (in progress)
      Booking.find({
        technician: technicianId,
        status: "in_progress",
      })
        .populate("customer", "firstName lastName avatar phone")
        .populate("service", "name icon")
        .sort({ scheduledDate: 1 })
        .limit(5),
      // Pending requests (assigned but not accepted)
      Booking.find({
        technician: technicianId,
        status: "pending",
      })
        .populate("customer", "firstName lastName avatar phone")
        .populate("service", "name icon")
        .sort({ createdAt: -1 })
        .limit(10),
      // Upcoming accepted jobs
      Booking.find({
        technician: technicianId,
        status: "accepted",
        scheduledDate: { $gte: new Date() },
      })
        .populate("customer", "firstName lastName avatar phone")
        .populate("service", "name icon")
        .sort({ scheduledDate: 1 })
        .limit(10),
    ]);

    // Calculate previous week earnings for comparison
    const startOfPrevWeek = new Date(startOfWeek);
    startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);
    const endOfPrevWeek = new Date(startOfWeek);

    const prevWeekEarnings = await Booking.aggregate([
      {
        $match: {
          technician: new mongoose.Types.ObjectId(technicianId),
          status: "completed",
          completedAt: { $gte: startOfPrevWeek, $lt: endOfPrevWeek },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$pricing.totalPrice" },
        },
      },
    ]);

    const currentWeekTotal = weeklyEarnings[0]?.total || 0;
    const prevWeekTotal = prevWeekEarnings[0]?.total || 0;
    const earningsChange =
      prevWeekTotal > 0
        ? ((currentWeekTotal - prevWeekTotal) / prevWeekTotal) * 100
        : 0;

    res.status(200).json({
      success: true,
      data: {
        technician: {
          id: technician._id,
          name: `${technician.firstName} ${technician.lastName}`,
          avatar: technician.avatar,
          rating: technician.technicianDetails?.rating || 0,
          reviewCount: technician.technicianDetails?.totalReviews || 0,
          availability: technician.technicianDetails?.availability || "offline",
          services: technician.technicianDetails?.services || [],
        },
        stats: {
          weeklyEarnings: currentWeekTotal,
          earningsChange: Math.round(earningsChange),
          totalJobsCompleted: totalJobs,
          rating: technician.technicianDetails?.rating || 0,
          reviewCount: technician.technicianDetails?.totalReviews || 0,
        },
        activeJobs: activeJobs || [],
        pendingRequests: pendingRequests || [],
        upcomingJobs: upcomingJobs || [],
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get technician stats
 * @route   GET /api/technician/stats
 * @access  Private (Technician)
 */
exports.getTechnicianStats = async (req, res) => {
  try {
    const technicianId = req.user.id;

    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay()),
    );
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const stats = await Booking.aggregate([
      {
        $match: {
          technician: new mongoose.Types.ObjectId(technicianId),
          status: "completed",
          completedAt: { $gte: startOfWeek, $lt: endOfWeek },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$completedAt" },
          earnings: { $sum: "$pricing.totalPrice" },
          jobs: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format for frontend (Mon-Sun)
    const weeklyStats = Array(7)
      .fill(0)
      .map((_, index) => ({
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index],
        earnings: 0,
        jobs: 0,
      }));

    stats.forEach((stat) => {
      const dayIndex = stat._id - 1;
      weeklyStats[dayIndex].earnings = stat.earnings;
      weeklyStats[dayIndex].jobs = stat.jobs;
    });

    res.status(200).json({
      success: true,
      data: {
        weeklyStats,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stats",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get pending job requests
 * @route   GET /api/technician/requests/pending
 * @access  Private (Technician)
 */
exports.getPendingRequests = async (req, res) => {
  try {
    const technicianId = req.user.id;

    const requests = await Booking.find({
      technician: technicianId,
      status: "pending",
    })
      .populate("customer", "firstName lastName avatar phone address")
      .populate("service", "name icon")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        requests,
      },
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending requests",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Accept job request
 * @route   POST /api/technician/requests/:id/accept
 * @access  Private (Technician)
 */
exports.acceptJobRequest = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const bookingId = req.params.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      technician: technicianId,
      status: "pending",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or already processed",
      });
    }

    booking.status = "accepted";
    booking.acceptedAt = new Date();
    await booking.save();

    // Populate for response
    await booking.populate(
      "customer",
      "firstName lastName avatar phone address",
    );
    await booking.populate("service", "name icon");

    res.status(200).json({
      success: true,
      message: "Job accepted successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Accept job error:", error);
    res.status(500).json({
      success: false,
      message: "Error accepting job",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Reject job request
 * @route   POST /api/technician/requests/:id/reject
 * @access  Private (Technician)
 */
exports.rejectJobRequest = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const bookingId = req.params.id;
    const { reason } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      technician: technicianId,
      status: "pending",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or already processed",
      });
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason || "Rejected by technician";
    booking.cancelledBy = "technician";
    booking.cancelledAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Job rejected successfully",
    });
  } catch (error) {
    console.error("Reject job error:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting job",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get active jobs (in progress)
 * @route   GET /api/technician/jobs/active
 * @access  Private (Technician)
 */
exports.getActiveJobs = async (req, res) => {
  try {
    const technicianId = req.user.id;

    const activeJobs = await Booking.find({
      technician: technicianId,
      status: "in_progress",
    })
      .populate("customer", "firstName lastName avatar phone address")
      .populate("service", "name icon")
      .sort({ startedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        jobs: activeJobs,
      },
    });
  } catch (error) {
    console.error("Get active jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching active jobs",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get upcoming jobs
 * @route   GET /api/technician/jobs/upcoming
 * @access  Private (Technician)
 */
exports.getUpcomingJobs = async (req, res) => {
  try {
    const technicianId = req.user.id;

    const upcomingJobs = await Booking.find({
      technician: technicianId,
      status: "accepted",
      scheduledDate: { $gte: new Date() },
    })
      .populate("customer", "firstName lastName avatar phone address")
      .populate("service", "name icon")
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        jobs: upcomingJobs,
      },
    });
  } catch (error) {
    console.error("Get upcoming jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming jobs",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get job details
 * @route   GET /api/technician/jobs/:id
 * @access  Private (Technician)
 */
exports.getJobDetails = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const bookingId = req.params.id;

    const job = await Booking.findOne({
      _id: bookingId,
      technician: technicianId,
    })
      .populate("customer", "firstName lastName avatar phone address email")
      .populate("service", "name icon description basePrice");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        job,
      },
    });
  } catch (error) {
    console.error("Get job details error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching job details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update job status
 * @route   PUT /api/technician/jobs/:id/status
 * @access  Private (Technician)
 */
exports.updateJobStatus = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const bookingId = req.params.id;
    const { status } = req.body;

    const validStatuses = ["accepted", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      technician: technicianId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = status;

    if (status === "in_progress") {
      booking.startedAt = new Date();
    } else if (status === "completed") {
      booking.completedAt = new Date();

      // Update technician's completed jobs count
      await User.findByIdAndUpdate(technicianId, {
        $inc: { "technicianDetails.completedJobs": 1 },
      });
    }

    await booking.save();

    await booking.populate("customer", "firstName lastName avatar phone");
    await booking.populate("service", "name icon");

    res.status(200).json({
      success: true,
      message: "Job status updated successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Update job status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating job status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Complete job with photos
 * @route   POST /api/technician/jobs/:id/complete
 * @access  Private (Technician)
 */
exports.completeJob = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const bookingId = req.params.id;
    const { beforePhotos, afterPhotos, notes } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      technician: technicianId,
      status: "in_progress",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or not in progress",
      });
    }

    booking.status = "completed";
    booking.completedAt = new Date();
    booking.beforePhotos = beforePhotos || [];
    booking.afterPhotos = afterPhotos || [];
    booking.completionNotes = notes || "";

    await booking.save();

    // Update technician's completed jobs count
    await User.findByIdAndUpdate(technicianId, {
      $inc: { "technicianDetails.completedJobs": 1 },
    });

    await booking.populate("customer", "firstName lastName avatar phone");
    await booking.populate("service", "name icon");

    res.status(200).json({
      success: true,
      message: "Job completed successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Complete job error:", error);
    res.status(500).json({
      success: false,
      message: "Error completing job",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Upload job photos
 * @route   POST /api/technician/jobs/:id/photos
 * @access  Private (Technician)
 */
exports.uploadJobPhotos = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const bookingId = req.params.id;
    const { type, photos } = req.body; // type: 'before' or 'after'

    const booking = await Booking.findOne({
      _id: bookingId,
      technician: technicianId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (type === "before") {
      booking.beforePhotos = photos;
    } else if (type === "after") {
      booking.afterPhotos = photos;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid photo type",
      });
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Photos uploaded successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Upload photos error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading photos",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get weekly earnings
 * @route   GET /api/technician/earnings/week
 * @access  Private (Technician)
 */
exports.getEarningsWeek = async (req, res) => {
  try {
    const technicianId = req.user.id;

    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay()),
    );
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const earnings = await Booking.aggregate([
      {
        $match: {
          technician: new mongoose.Types.ObjectId(technicianId),
          status: "completed",
          completedAt: { $gte: startOfWeek, $lt: endOfWeek },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$completedAt" },
          total: { $sum: "$pricing.totalPrice" },
          jobs: { $sum: 1 },
          date: { $first: "$completedAt" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get completed jobs for the week
    const jobs = await Booking.find({
      technician: technicianId,
      status: "completed",
      completedAt: { $gte: startOfWeek, $lt: endOfWeek },
    })
      .populate("customer", "firstName lastName")
      .populate("service", "name")
      .select("pricing.totalPrice completedAt service customer")
      .sort({ completedAt: -1 });

    const totalEarnings = earnings.reduce((sum, day) => sum + day.total, 0);
    const totalJobs = earnings.reduce((sum, day) => sum + day.jobs, 0);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        totalJobs,
        dailyBreakdown: earnings,
        jobs,
      },
    });
  } catch (error) {
    console.error("Get weekly earnings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching earnings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get monthly earnings
 * @route   GET /api/technician/earnings/month
 * @access  Private (Technician)
 */
exports.getEarningsMonth = async (req, res) => {
  try {
    const technicianId = req.user.id;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const earnings = await Booking.aggregate([
      {
        $match: {
          technician: new mongoose.Types.ObjectId(technicianId),
          status: "completed",
          completedAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$completedAt" },
          total: { $sum: "$pricing.totalPrice" },
          jobs: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const totalEarnings = earnings.reduce((sum, day) => sum + day.total, 0);
    const totalJobs = earnings.reduce((sum, day) => sum + day.jobs, 0);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        totalJobs,
        dailyBreakdown: earnings,
      },
    });
  } catch (error) {
    console.error("Get monthly earnings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching earnings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update availability status
 * @route   PUT /api/technician/availability
 * @access  Private (Technician)
 */
exports.updateAvailability = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const { availability } = req.body;

    const validStatuses = ["available", "busy", "offline"];
    if (!validStatuses.includes(availability)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability status",
      });
    }

    const technician = await User.findByIdAndUpdate(
      technicianId,
      { "technicianDetails.availability": availability },
      { new: true, runValidators: true },
    ).select("-password");

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: {
        availability: technician.technicianDetails.availability,
      },
    });
  } catch (error) {
    console.error("Update availability error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating availability",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Reschedule job
 * @route   PUT /api/technician/jobs/:id/reschedule
 * @access  Private (Technician)
 */
exports.rescheduleJob = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const bookingId = req.params.id;
    const { scheduledDate, reason } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date is required",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      technician: technicianId,
      status: { $in: ["accepted", "pending"] },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or cannot be rescheduled",
      });
    }

    booking.scheduledDate = new Date(scheduledDate);
    booking.rescheduledBy = "technician";
    booking.rescheduleReason = reason || "";
    await booking.save();

    await booking.populate("customer", "firstName lastName avatar phone");
    await booking.populate("service", "name icon");

    res.status(200).json({
      success: true,
      message: "Job rescheduled successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    console.error("Reschedule job error:", error);
    res.status(500).json({
      success: false,
      message: "Error rescheduling job",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Cancel job
 * @route   PUT /api/technician/jobs/:id/cancel
 * @access  Private (Technician)
 */
exports.cancelJob = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const bookingId = req.params.id;
    const { reason } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      technician: technicianId,
      status: { $in: ["pending", "accepted"] },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or cannot be cancelled",
      });
    }

    booking.status = "cancelled";
    booking.cancelledBy = "technician";
    booking.cancellationReason = reason || "Cancelled by technician";
    booking.cancelledAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Job cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel job error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling job",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
