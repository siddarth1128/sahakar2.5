const User = require("../models/User");

/**
 * @desc    Get all technicians
 * @route   GET /api/users/technicians
 * @access  Private (Customer, Admin)
 */
exports.getTechnicians = async (req, res) => {
  try {
    const { services, availability, rating, page = 1, limit = 12 } = req.query;

    // Only show verified, active technicians who have signed up
    let query = {
      userType: "technician",
      isActive: true,
      isVerified: true, // Only show verified technicians
    };

    if (services) {
      query["technicianDetails.services"] = {
        $in: services.split(",").map((s) => s.trim()),
        $exists: true,
      };
    }

    if (availability) {
      query["technicianDetails.availability"] = availability;
    }

    if (rating) {
      query["technicianDetails.rating"] = { $gte: parseFloat(rating) };
    }

    const skip = (page - 1) * limit;

    const technicians = await User.find(query)
      .select(
        "firstName lastName email phone avatar technicianDetails address isVerified createdAt",
      )
      .sort({
        isVerified: -1,
        "technicianDetails.rating": -1,
        "technicianDetails.completedJobs": -1,
      })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        technicians,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get technicians error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching technicians",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get single technician profile
 * @route   GET /api/users/technicians/:id
 * @access  Private
 */
exports.getTechnician = async (req, res) => {
  try {
    const technician = await User.findOne({
      _id: req.params.id,
      userType: "technician",
      isActive: true,
    }).select(
      "firstName lastName email phone avatar technicianDetails address",
    );

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        technician,
      },
    });
  } catch (error) {
    console.error("Get technician error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching technician",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      avatar,
      address,
      bio,
      services,
      experience,
      hourlyRate,
      certifications,
    } = req.body;

    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (address) updateData.address = address;
    if (bio !== undefined) updateData.bio = bio;

    // For technicians
    if (req.user.userType === "technician") {
      if (services) updateData["technicianDetails.services"] = services;
      if (experience) updateData["technicianDetails.experience"] = experience;
      if (hourlyRate) updateData["technicianDetails.hourlyRate"] = hourlyRate;
      if (certifications)
        updateData["technicianDetails.certifications"] = certifications;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "firstName lastName email phone avatar technicianDetails address isVerified userType",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
exports.getUsers = async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { userType, page = 1, limit = 10 } = req.query;

    let query = {};

    if (userType) {
      query.userType = userType;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select("-password -secretKey -otp -otpExpire")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
