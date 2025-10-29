import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

// Create Customer Stats Context
const CustomerStatsContext = createContext();

// Custom hook to use customer stats context
export const useCustomerStats = () => {
  const context = useContext(CustomerStatsContext);
  if (!context) {
    throw new Error("useCustomerStats must be used within a CustomerStatsProvider");
  }
  return context;
};

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Customer Stats Provider Component
export const CustomerStatsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    completed: 0,
    active: 0,
    cancelled: 0,
    pending: 0,
    avgRating: 0,
    totalSpent: 0,
    mostUsedService: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  /**
   * Fetch customer stats from API
   */
  const fetchStats = useCallback(async (force = false) => {
    // Only fetch for authenticated customers
    if (!isAuthenticated || user?.userType !== "customer") {
      setLoading(false);
      return;
    }

    // Don't refetch if data is fresh (less than 30 seconds old) unless forced
    const now = Date.now();
    if (!force && lastFetch && (now - lastFetch) < 30000) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/customer/stats`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setLastFetch(now);
      } else {
        throw new Error(data.message || "Failed to fetch stats");
      }
    } catch (err) {
      console.error("Error fetching customer stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, lastFetch]);

  /**
   * Refresh stats (force fetch)
   */
  const refreshStats = useCallback(() => {
    return fetchStats(true);
  }, [fetchStats]);

  /**
   * Update a specific stat locally (optimistic update)
   */
  const updateStat = useCallback((key, value) => {
    setStats((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Increment a stat by 1 (e.g., after creating a booking)
   */
  const incrementStat = useCallback((key) => {
    setStats((prev) => ({
      ...prev,
      [key]: prev[key] + 1,
    }));
  }, []);

  /**
   * Decrement a stat by 1
   */
  const decrementStat = useCallback((key) => {
    setStats((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] - 1),
    }));
  }, []);

  /**
   * Handle booking created
   */
  const onBookingCreated = useCallback(() => {
    incrementStat("totalBookings");
    incrementStat("pending");
    // Fetch fresh data after a short delay
    setTimeout(() => refreshStats(), 1000);
  }, [incrementStat, refreshStats]);

  /**
   * Handle booking completed
   */
  const onBookingCompleted = useCallback(() => {
    incrementStat("completed");
    decrementStat("active");
    // Fetch fresh data to update totalSpent
    setTimeout(() => refreshStats(), 1000);
  }, [incrementStat, decrementStat, refreshStats]);

  /**
   * Handle booking cancelled
   */
  const onBookingCancelled = useCallback(() => {
    incrementStat("cancelled");
    decrementStat("active");
    setTimeout(() => refreshStats(), 1000);
  }, [incrementStat, decrementStat, refreshStats]);

  /**
   * Handle booking accepted (pending -> active)
   */
  const onBookingAccepted = useCallback(() => {
    incrementStat("active");
    decrementStat("pending");
    setTimeout(() => refreshStats(), 1000);
  }, [incrementStat, decrementStat, refreshStats]);

  // Fetch stats when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.userType === "customer") {
      fetchStats();
    } else {
      // Reset stats when user logs out
      setStats({
        totalBookings: 0,
        completed: 0,
        active: 0,
        cancelled: 0,
        pending: 0,
        avgRating: 0,
        totalSpent: 0,
        mostUsedService: null,
      });
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchStats]);

  // Context value
  const value = {
    stats,
    loading,
    error,
    fetchStats,
    refreshStats,
    updateStat,
    incrementStat,
    decrementStat,
    onBookingCreated,
    onBookingCompleted,
    onBookingCancelled,
    onBookingAccepted,
    lastFetch,
  };

  return (
    <CustomerStatsContext.Provider value={value}>
      {children}
    </CustomerStatsContext.Provider>
  );
};

export default CustomerStatsContext;
