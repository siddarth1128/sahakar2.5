const Booking = require("../models/Booking");
const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * @desc    Get customer dashboard stats
 * @route   GET /api/customer/stats
 * @access  Private (Customer)
 */
exports.getCustomerStats = async (req, res) => {
  try {
    const customerId = req.user.id;

    // Get all bookings for this customer
    const allBookings = await Booking.find({ customerId });

    // Calculate stats
    const stats = {
      totalBookings: allBookings.length,
      completed: allBookings.filter((b) => b.status === "completed").length,
      active: allBookings.filter(
        (b) =>
          b.status === "pending" ||
          b.status === "accepted" ||
          b.status === "confirmed" ||
          b.status === "in_progress",
      ).length,
      cancelled: allBookings.filter((b) => b.status === "cancelled").length,
      pending: allBookings.filter((b) => b.status === "pending").length,
    };

    // Calculate average rating given by customer
    const completedWithRatings = allBookings.filter(
      (b) => b.status === "completed" && b.rating && b.rating.overall,
    );

    const avgRating =
      completedWithRatings.length > 0
        ? completedWithRatings.reduce((acc, b) => acc + b.rating.overall, 0) /
          completedWithRatings.length
        : 0;

    // Calculate total spent
    const totalSpent = allBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.pricing?.totalPrice || 0), 0);

    // Get most used service
    const serviceCounts = {};
    allBookings.forEach((b) => {
      if (b.serviceType) {
        serviceCounts[b.serviceType] =
          (serviceCounts[b.serviceType] || 0) + 1;
      }
    });

    const mostUsedService = Object.keys(serviceCounts).length
      ? Object.keys(serviceCounts).reduce((a, b) =>
          serviceCounts[a] > serviceCounts[b] ? a : b,
        )
      : null;

    // Get recent bookings (last 5)
    const recentBookings = await Booking.find({ customerId })
      .populate(
        "technician",
        "firstName lastName avatar technicianDetails",
      )
      .populate("technicianId", "firstName lastName avatar technicianDetails")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          ...stats,
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          mostUsedService,
        },
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Get customer stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching customer stats",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get customer dashboard
 * @route   GET /api/customer/dashboard
 * @access  Private (Customer)
 */
exports.getCustomerDashboard = async (req, res) => {
  try {
    const customerId = req.user.id;

    // Get customer details
    const customer = await User.findById(customerId).select("-password");

    if (!customer || customer.userType !== "customer") {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Get active bookings
    const activeBookings = await Booking.find({
      customerId,
      status: {
        $in: ["pending", "accepted", "confirmed", "in_progress"],
      },
    })
      .populate(
        "technician",
        "firstName lastName avatar phone technicianDetails",
      )
      .populate(
        "technicianId",
        "firstName lastName avatar phone technicianDetails",
      )
      .sort({ createdAt: -1 })
      .limit(10);

    // Get upcoming bookings
    const upcomingBookings = await Booking.find({
      customerId,
      status: { $in: ["accepted", "confirmed"] },
      date: { $gte: new Date() },
    })
      .populate("technician", "firstName lastName avatar technicianDetails")
      .populate("technicianId", "firstName lastName avatar technicianDetails")
      .sort({ date: 1 })
      .limit(5);

    // Get completed bookings count
    const completedCount = await Booking.countDocuments({
      customerId,
      status: "completed",
    });

    // Get pending bookings count
    const pendingCount = await Booking.countDocuments({
      customerId,
      status: "pending",
    });

    // Calculate total spent
    const completedBookings = await Booking.find({
      customerId,
      status: "completed",
    }).select("pricing");

    const totalSpent = completedBookings.reduce(
      (sum, b) => sum + (b.pricing?.totalPrice || 0),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone,
          avatar: customer.avatar,
          isVerified: customer.isVerified,
        },
        stats: {
          completedBookings: completedCount,
          pendingBookings: pendingCount,
          activeBookings: activeBookings.length,
          totalSpent: parseFloat(totalSpent.toFixed(2)),
        },
        activeBookings,
        upcomingBookings,
      },
    });
  } catch (error) {
    console.error("Get customer dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get customer service history
 * @route   GET /api/customer/history
 * @access  Private (Customer)
 */
exports.getCustomerHistory = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    let query = {
      customerId,
      status: { $in: ["completed", "cancelled"] },
    };

    if (status && (status === "completed" || status === "cancelled")) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const history = await Booking.find(query)
      .populate("technician", "firstName lastName avatar technicianDetails")
      .populate("technicianId", "firstName lastName avatar technicianDetails")
      .sort({ completedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    // Calculate history stats
    const allHistory = await Booking.find({
      customerId,
      status: { $in: ["completed", "cancelled"] },
    });

    const historyStats = {
      total: allHistory.length,
      completed: allHistory.filter((b) => b.status === "completed").length,
      cancelled: allHistory.filter((b) => b.status === "cancelled").length,
      totalSpent: allHistory
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + (b.pricing?.totalPrice || 0), 0),
    };

    res.status(200).json({
      success: true,
      data: {
        history,
        stats: {
          ...historyStats,
          totalSpent: parseFloat(historyStats.totalSpent.toFixed(2)),
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get customer history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get customer favorite technicians
 * @route   GET /api/customer/favorites
 * @access  Private (Customer)
 */
exports.getFavoriteTechnicians = async (req, res) => {
  try {
    const customerId = req.user.id;

    // Get technicians the customer has booked most
    const technicianBookings = await Booking.aggregate([
      {
        $match: {
          customerId: new mongoose.Types.ObjectId(customerId),
          status: "completed",
          technicianId: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$technicianId",
          bookingCount: { $sum: 1 },
          avgRating: { $avg: "$rating.overall" },
          totalSpent: { $sum: "$pricing.totalPrice" },
        },
      },
      {
        $sort: { bookingCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Populate technician details
    const technicianIds = technicianBookings.map((tb) => tb._id);
    const technicians = await User.find({
      _id: { $in: technicianIds },
    }).select("firstName lastName avatar technicianDetails");

    // Merge data
    const favorites = technicianBookings.map((tb) => {
      const tech = technicians.find(
        (t) => t._id.toString() === tb._id.toString(),
      );
      return {
        technician: tech,
        bookingCount: tb.bookingCount,
        avgRating: tb.avgRating ? parseFloat(tb.avgRating.toFixed(1)) : 0,
        totalSpent: parseFloat(tb.totalSpent.toFixed(2)),
      };
    });

    res.status(200).json({
      success: true,
      data: {
        favorites,
      },
    });
  } catch (error) {
    console.error("Get favorite technicians error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching favorites",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get customer spending analytics
 * @route   GET /api/customer/analytics
 * @access  Private (Customer)
 */
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { period = "month" } = req.query; // month, year

    let startDate;
    const endDate = new Date();

    if (period === "year") {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get completed bookings in period
    const bookings = await Booking.find({
      customerId,
      status: "completed",
      completedAt: { $gte: startDate, $lte: endDate },
    }).sort({ completedAt: 1 });

    // Group by service type
    const byService = {};
    const byMonth = {};

    bookings.forEach((booking) => {
      const serviceType = booking.serviceType || "Other";
      const month = new Date(booking.completedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const amount = booking.pricing?.totalPrice || 0;

      byService[serviceType] = (byService[serviceType] || 0) + amount;
      byMonth[month] = (byMonth[month] || 0) + amount;
    });

    res.status(200).json({
      success: true,
      data: {
        period,
        totalBookings: bookings.length,
        totalSpent: parseFloat(
          bookings
            .reduce((sum, b) => sum + (b.pricing?.totalPrice || 0), 0)
            .toFixed(2),
        ),
        byService,
        byMonth,
      },
    });
  } catch (error) {
    console.error("Get customer analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
