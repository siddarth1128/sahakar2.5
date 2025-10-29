const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const connectDatabase = require("./config/database");
const { createServer } = require("http");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config();

// Connect to database
connectDatabase();

// Initialize express app
const app = express();

// Create HTTP server for Socket.io
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

// Security headers
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }),
);

// Sanitize data to prevent MongoDB injection
app.use(mongoSanitize());

// Compress responses
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ============================================
// ROUTES
// ============================================

// Make io accessible in routes
app.set("io", io);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join user to their personal room
  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their personal room`);
  });

  // Join technician to their room for booking requests
  socket.on("join_technician", (technicianId) => {
    socket.join(`technician_${technicianId}`);
    console.log(`🔧 Technician ${technicianId} joined their room`);
  });

  // Handle booking notifications
  socket.on("booking_request", (data) => {
    socket.to(`technician_${data.technicianId}`).emit("booking_request", data);
  });

  // Handle booking acceptance
  socket.on("booking_accepted", (data) => {
    socket.to(`user_${data.customerId}`).emit("booking_accepted", data);
  });

  // Handle booking updates
  socket.on("booking_updated", (data) => {
    socket.to(`user_${data.customerId}`).emit("booking_updated", data);
    socket.to(`technician_${data.technicianId}`).emit("booking_updated", data);
  });

  // Handle real-time chat messages
  socket.on("send_message", (data) => {
    socket.to(`user_${data.receiverId}`).emit("receive_message", data);
  });

  // Handle technician location updates
  socket.on("location_update", (data) => {
    socket.to(`user_${data.customerId}`).emit("location_update", data);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FixItNow API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/technician", require("./routes/technicianRoutes"));
app.use("/api/customer", require("./routes/customerRoutes"));

// 404 handler - must be after all other routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Resource not found";
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  res.status(statusCode).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === "development"
        ? {
            message: err.message,
            stack: err.stack,
          }
        : undefined,
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 FixItNow Server Started Successfully!");
  console.log("=".repeat(60));
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🔌 Socket.io enabled for real-time features`);
  console.log(`🗺️ Google Maps integration ready`);
  console.log(
    `🎯 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`,
  );
  console.log("=".repeat(60) + "\n");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("❌ Unhandled Rejection:", err.message);
  console.error(err);
  // Close server & exit process
  server.close(() => {
    console.log("Server closed due to unhandled rejection");
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  console.error(err);
  // Close server & exit process
  server.close(() => {
    console.log("Server closed due to uncaught exception");
    process.exit(1);
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n👋 SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Process terminated");
    process.exit(0);
  });
});

module.exports = server;
