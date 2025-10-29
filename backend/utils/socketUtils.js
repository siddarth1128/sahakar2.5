/**
 * Socket.io utility functions for real-time features
 */

// Store for online users
const onlineUsers = new Map();

/**
 * Get Socket.io instance from Express app
 */
const getIO = (req) => {
  return req.app.get("io");
};

/**
 * Emit booking request notification to technician
 */
const emitBookingRequest = (io, technicianId, bookingData) => {
  io.to(`technician_${technicianId}`).emit("booking_request", {
    type: "booking_request",
    bookingId: bookingData._id,
    customerName: bookingData.customerName,
    serviceType: bookingData.serviceType,
    description: bookingData.description,
    location: bookingData.location,
    timestamp: new Date(),
    ...bookingData,
  });
};

/**
 * Emit booking acceptance notification to customer
 */
const emitBookingAccepted = (io, customerId, bookingData) => {
  io.to(`user_${customerId}`).emit("booking_accepted", {
    type: "booking_accepted",
    bookingId: bookingData._id,
    technicianName: bookingData.technicianName,
    estimatedArrival: bookingData.estimatedArrival,
    timestamp: new Date(),
    ...bookingData,
  });
};

/**
 * Emit booking status update to both parties
 */
const emitBookingUpdate = (io, customerId, technicianId, updateData) => {
  io.to(`user_${customerId}`).emit("booking_updated", {
    type: "booking_updated",
    ...updateData,
    timestamp: new Date(),
  });

  io.to(`technician_${technicianId}`).emit("booking_updated", {
    type: "booking_updated",
    ...updateData,
    timestamp: new Date(),
  });
};

/**
 * Emit real-time message in chat
 */
const emitChatMessage = (io, receiverId, messageData) => {
  io.to(`user_${receiverId}`).emit("receive_message", {
    type: "chat_message",
    ...messageData,
    timestamp: new Date(),
  });
};

/**
 * Emit technician location update to customer
 */
const emitLocationUpdate = (io, customerId, locationData) => {
  io.to(`user_${customerId}`).emit("location_update", {
    type: "location_update",
    ...locationData,
    timestamp: new Date(),
  });
};

/**
 * Emit notification to user
 */
const emitNotification = (io, userId, notificationData) => {
  io.to(`user_${userId}`).emit("notification", {
    type: "notification",
    ...notificationData,
    timestamp: new Date(),
  });
};

/**
 * Emit dispute notification to admin
 */
const emitDisputeNotification = (io, disputeData) => {
  io.to("admin").emit("dispute_created", {
    type: "dispute_created",
    ...disputeData,
    timestamp: new Date(),
  });
};

/**
 * Emit admin response to user
 */
const emitAdminResponse = (io, userId, responseData) => {
  io.to(`user_${userId}`).emit("admin_response", {
    type: "admin_response",
    ...responseData,
    timestamp: new Date(),
  });
};

/**
 * Track user online status
 */
const setUserOnline = (userId, socketId) => {
  onlineUsers.set(userId, socketId);
};

const setUserOffline = (userId) => {
  onlineUsers.delete(userId);
};

const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

const getUserSocketId = (userId) => {
  return onlineUsers.get(userId);
};

module.exports = {
  getIO,
  emitBookingRequest,
  emitBookingAccepted,
  emitBookingUpdate,
  emitChatMessage,
  emitLocationUpdate,
  emitNotification,
  emitDisputeNotification,
  emitAdminResponse,
  setUserOnline,
  setUserOffline,
  isUserOnline,
  getUserSocketId,
};
