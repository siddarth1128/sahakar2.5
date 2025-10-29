import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketConnection = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      upgrade: true,
    });

    socketConnection.on('connect', () => {
      console.log('🔌 Connected to server:', socketConnection.id);
      setIsConnected(true);
    });

    socketConnection.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
    });

    setSocket(socketConnection);

    // Cleanup on unmount
    return () => {
      socketConnection.close();
      setIsConnected(false);
    };
  }, []);

  // Join user to their personal room
  const joinUserRoom = (userId) => {
    if (socket && isConnected) {
      socket.emit('join', userId);
    }
  };

  // Join technician to their room for booking requests
  const joinTechnicianRoom = (technicianId) => {
    if (socket && isConnected) {
      socket.emit('join_technician', technicianId);
    }
  };

  // Listen for booking requests (for technicians)
  const onBookingRequest = (callback) => {
    if (socket) {
      socket.on('booking_request', callback);
      return () => socket.off('booking_request', callback);
    }
  };

  // Listen for booking acceptance (for customers)
  const onBookingAccepted = (callback) => {
    if (socket) {
      socket.on('booking_accepted', callback);
      return () => socket.off('booking_accepted', callback);
    }
  };

  // Listen for booking updates (for both parties)
  const onBookingUpdate = (callback) => {
    if (socket) {
      socket.on('booking_updated', callback);
      return () => socket.off('booking_updated', callback);
    }
  };

  // Listen for chat messages
  const onChatMessage = (callback) => {
    if (socket) {
      socket.on('receive_message', callback);
      return () => socket.off('receive_message', callback);
    }
  };

  // Listen for location updates
  const onLocationUpdate = (callback) => {
    if (socket) {
      socket.on('location_update', callback);
      return () => socket.off('location_update', callback);
    }
  };

  // Listen for notifications
  const onNotification = (callback) => {
    if (socket) {
      socket.on('notification', callback);
      return () => socket.off('notification', callback);
    }
  };

  // Listen for dispute notifications (admin)
  const onDisputeNotification = (callback) => {
    if (socket) {
      socket.on('dispute_created', callback);
      return () => socket.off('dispute_created', callback);
    }
  };

  // Listen for admin responses
  const onAdminResponse = (callback) => {
    if (socket) {
      socket.on('admin_response', callback);
      return () => socket.off('admin_response', callback);
    }
  };

  // Send chat message
  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('send_message', messageData);
    }
  };

  // Send location update
  const sendLocationUpdate = (locationData) => {
    if (socket && isConnected) {
      socket.emit('location_update', locationData);
    }
  };

  // Send notification
  const sendNotification = (notificationData) => {
    if (socket && isConnected) {
      socket.emit('notification', notificationData);
    }
  };

  const value = {
    socket,
    isConnected,
    joinUserRoom,
    joinTechnicianRoom,
    onBookingRequest,
    onBookingAccepted,
    onBookingUpdate,
    onChatMessage,
    onLocationUpdate,
    onNotification,
    onDisputeNotification,
    onAdminResponse,
    sendMessage,
    sendLocationUpdate,
    sendNotification,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
