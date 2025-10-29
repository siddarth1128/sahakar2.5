const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide your first name"],
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide your last name"],
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    userType: {
      type: String,
      enum: ["customer", "technician", "admin"],
      default: "customer",
    },
    secretKey: {
      type: String,
      select: false, // Only for admin
    },
    avatar: {
      type: String,
      default: "",
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Google Authentication fields
    googleId: {
      type: String,
      sparse: true, // Allow multiple null values
      unique: true,
    },
    googleEmail: {
      type: String,
      sparse: true,
    },
    googleName: String,
    googlePicture: String,
    // Two-factor authentication via Google
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    // Technician specific fields
    technicianDetails: {
      services: [
        {
          type: String,
        },
      ],
      experience: String,
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
      hourlyRate: {
        type: Number,
        default: 0,
      },
      availability: {
        type: String,
        enum: ["available", "busy", "offline"],
        default: "available",
      },
      bio: String,
      certifications: [String],
      completedJobs: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance (email, googleId, googleEmail already have unique/sparse indexes)
userSchema.index({ userType: 1 });
userSchema.index({ isVerified: 1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
    );
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      googleEmail: this.googleEmail,
      userType: this.userType,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
  );
};

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate two-factor secret for Google Authenticator
userSchema.methods.generateTwoFactorSecret = function () {
  const secret = crypto.randomBytes(32).toString("hex");
  this.twoFactorSecret = secret;
  return secret;
};

// Verify two-factor token
userSchema.methods.verifyTwoFactorToken = function (token) {
  if (!this.twoFactorSecret) {
    return false;
  }

  // Simple TOTP verification (you might want to use a proper TOTP library)
  const timeStep = Math.floor(Date.now() / 30000); // 30-second windows
  const expectedToken = this.generateTOTP(this.twoFactorSecret, timeStep);

  return token === expectedToken;
};

// Generate TOTP token (simplified implementation)
userSchema.methods.generateTOTP = function (secret, timeStep) {
  const hmac = crypto.createHmac("sha1", secret);
  hmac.update(Buffer.from(timeStep.toString()));
  const digest = hmac.digest("hex");

  // Convert to 6-digit code
  const offset = parseInt(digest.slice(-1), 16);
  const code = parseInt(digest.slice(offset * 2, offset * 2 + 8), 16);
  return (code & 0x7fffffff).toString().slice(-6);
};

// Generate password reset token
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetToken;
};

// Check if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours

  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = Date.now();
  return this.save({ validateBeforeSave: false });
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.twoFactorSecret;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  delete user.__v;
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
