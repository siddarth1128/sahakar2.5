import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Configure axios defaults
axios.defaults.withCredentials = true;

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check authentication status
   */
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      // Set authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Verify token and get user data
      const response = await axios.get(`${API_URL}/auth/me`);

      if (response.data.success) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
      } else {
        // Invalid token
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP
   */
  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Remove pending data
        localStorage.removeItem("pendingEmail");
        localStorage.removeItem("pendingUserId");

        // Set authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Update state
        setUser(user);
        setIsAuthenticated(true);

        toast.success("Email verified successfully!");
        return { success: true, user };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "OTP verification failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const resendOTP = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/resend-otp`, {
        email,
      });

      if (response.data.success) {
        toast.success(response.data.message || "OTP sent successfully!");
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to resend OTP. Please try again.";
      toast.error(message);
      return { success: false, message };
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, userData);

      if (response.data.success) {
        const { token, user } = response.data.data;

        // User is automatically logged in after registration
        if (token && user) {
          localStorage.setItem("token", token);
          setUser(user);
          setIsAuthenticated(true);

          toast.success("Registration successful! You are now logged in.");
          return {
            success: true,
            user,
            token,
          };
        }

        // Legacy support for Google OAuth flow
        if (response.data.data.requiresGoogleAuth) {
          toast.info("Please complete Google verification to continue.");
          return { success: true, requiresGoogleAuth: true };
        }

        toast.success("Registration successful!");
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      const errorData = error.response?.data;
      const message =
        errorData?.message || "Registration failed. Please try again.";

      // Check if user already exists
      if (errorData?.message?.includes("already exists")) {
        toast.error(
          "An account with this email already exists. Please try logging in instead.",
        );
        return { success: false, message: "User already exists" };
      }

      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Set authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Update state
        setUser(user);
        setIsAuthenticated(true);

        toast.success("Login successful!");
        return { success: true, user };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      const errorData = error.response?.data;
      const message = errorData?.message || "Login failed. Please try again.";

      // Check if verification is required
      if (errorData?.requiresVerification) {
        localStorage.setItem("pendingEmail", email);
        toast.error(message);
        return {
          success: false,
          message,
          requiresVerification: true,
          email: errorData.email,
        };
      }

      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("pendingEmail");
      localStorage.removeItem("pendingUserId");

      // Remove authorization header
      delete axios.defaults.headers.common["Authorization"];

      // Update state
      setUser(null);
      setIsAuthenticated(false);

      toast.success("Logged out successfully");
    }
  };

  /**
   * Forgot password
   */
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Password reset email sent!");
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to send reset email. Please try again.";
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (resetToken, newPassword) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/auth/reset-password/${resetToken}`,
        {
          password: newPassword,
        },
      );

      if (response.data.success) {
        toast.success("Password reset successful! You can now login.");
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Password reset failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update password
   */
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/auth/update-password`, {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        const { token } = response.data.data;

        // Update token
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        toast.success("Password updated successfully!");
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Password update failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      // This would call a profile update endpoint
      // For now, update local state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully!");
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = "Profile update failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    updatePassword,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
