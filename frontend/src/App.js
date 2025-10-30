import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./styles/App.css";

// Context
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { CustomerStatsProvider } from "./context/CustomerStatsContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import CustomerDashboard from "./pages/CustomerDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import TechnicianAccepted from "./pages/TechnicianAccepted";
import TechnicianRequests from "./pages/TechnicianRequests";
import TechnicianProfile from "./pages/TechnicianProfile";
import TechnicianEarnings from "./pages/TechnicianEarnings";
import TechnicianSettings from "./pages/TechnicianSettings";
import NewAdminDashboard from "./pages/NewAdminDashboard";
import TechniciansList from "./pages/TechniciansList";
import TechnicianPublicProfile from "./pages/TechnicianPublicProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import BookService from "./pages/BookService";
import NotFound from "./pages/NotFound";

// Customer Pages
import CustomerBookings from "./pages/CustomerBookings";
import CustomerHistory from "./pages/CustomerHistory";
import CustomerReviews from "./pages/CustomerReviews";
import InvoicePage from "./pages/InvoicePage";
import BookingDetails from "./pages/BookingDetails";
import CustomerSupport from "./pages/CustomerSupport";
import CustomerNotifications from "./pages/CustomerNotifications";
import CustomerPrivacy from "./pages/CustomerPrivacy";
import CustomerHelp from "./pages/CustomerHelp";

// Components
import LoadingSpinner from "./components/LoadingSpinner";
import ScrollToTop from "./components/ScrollToTop";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminForgotPassword from "./pages/AdminForgotPassword";

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-otp" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.userType)) {
    // Redirect to appropriate dashboard
    if (user.userType === "admin")
      return <Navigate to="/admin/dashboard" replace />;
    if (user.userType === "technician")
      return <Navigate to="/technician/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
};

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user && user.isVerified) {
    // Redirect to role-specific dashboard
    if (user.userType === "admin")
      return <Navigate to="/admin/dashboard" replace />;
    if (user.userType === "technician")
      return <Navigate to="/technician/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
};

/**
 * Main App Component
 */
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SocketProvider>
      <AuthProvider>
        <CustomerStatsProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <ScrollToTop />
            <div className="App">
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#1a1a1a",
                    color: "#fff",
                    padding: "16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
                    border: "1px solid #27272a",
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#fff",
                    },
                    style: {
                      border: "1px solid #10b981",
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fff",
                    },
                    style: {
                      border: "1px solid #ef4444",
                    },
                  },
                  loading: {
                    iconTheme: {
                      primary: "#667eea",
                      secondary: "#fff",
                    },
                  },
                }}
              />

              {/* Routes */}
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />

                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  }
                />

                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:resetToken"
                  element={<ResetPassword />}
                />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/forgot-password"
                  element={<AdminForgotPassword />}
                />

                {/* Role-Based Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/technician/dashboard"
                  element={
                    <ProtectedRoute>
                      <TechnicianDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <NewAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute>
                      <NewAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/admin/technicians"
                  element={
                    <ProtectedRoute>
                      <NewAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/admin/customers"
                  element={
                    <ProtectedRoute>
                      <NewAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/admin/bookings"
                  element={
                    <ProtectedRoute>
                      <NewAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute>
                      <NewAdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/technicians"
                  element={
                    <ProtectedRoute>
                      <TechniciansList />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/technicians/:id"
                  element={
                    <ProtectedRoute>
                      <TechnicianPublicProfile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/book-service"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <BookService />
                    </ProtectedRoute>
                  }
                />

                {/* Customer Sub-Routes */}
                <Route
                  path="/customer/bookings"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerBookings />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/customer/history"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerHistory />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/customer/reviews"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerReviews />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/invoice/:bookingId"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <InvoicePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/booking/details/:bookingId"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <BookingDetails />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/customer/notifications"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerNotifications />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/customer/privacy"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerPrivacy />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/customer/help"
                  element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                      <CustomerHelp />
                    </ProtectedRoute>
                  }
                />

                {/* Technician Sub-Routes */}
                <Route
                  path="/technician/accepted"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianAccepted />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/technician/requests"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianRequests />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/technician/profile"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianProfile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/technician/earnings"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianEarnings />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/technician/settings"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianSettings />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </CustomerStatsProvider>
      </AuthProvider>
    </SocketProvider>
  );
}

export default App;
