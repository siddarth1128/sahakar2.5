import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTechnicians: 0,
    totalCustomers: 0,
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userType !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, usersRes, notifRes] = await Promise.all([
        fetch("/api/bookings?page=1&limit=10", { credentials: "include" }),
        fetch("/api/users?page=1&limit=1", { credentials: "include" }), // Just to get total count
        fetch("/api/notifications", { credentials: "include" }),
      ]);

      const bookingsData = await bookingsRes.json();
      const usersData = await usersRes.json();
      const notifData = await notifRes.json();

      if (bookingsData.success) {
        setRecentBookings(bookingsData.data.bookings);
        setStats((prev) => ({
          ...prev,
          totalBookings: bookingsData.data.pagination.total,
          activeBookings: bookingsData.data.bookings.filter(
            (b) => b.status === "confirmed" || b.status === "in-progress",
          ).length,
          completedBookings: bookingsData.data.bookings.filter(
            (b) => b.status === "completed",
          ).length,
        }));
      }
      if (usersData.success) {
        setStats((prev) => ({
          ...prev,
          totalUsers: usersData.data.pagination.total,
          totalCustomers: usersData.data.users.filter(
            (u) => u.userType === "customer",
          ).length,
          totalTechnicians: usersData.data.users.filter(
            (u) => u.userType === "technician",
          ).length,
        }));
      }
      if (notifData.success) setNotifications(notifData.data.notifications);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <div className="container">
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-container">
          <Link to="/" className="logo">
            <i className="fas fa-tools"></i>
            <span>FixItNow</span>
          </Link>

          <div className="nav-actions">
            <Link to="/admin/users" className="nav-link">
              <i className="fas fa-users"></i>
              Users
            </Link>
            <Link to="/admin/bookings" className="nav-link">
              <i className="fas fa-calendar-check"></i>
              Bookings
            </Link>
            <div className="nav-notifications">
              <i className="fas fa-bell"></i>
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </div>
            <button onClick={handleLogout} className="btn-logout">
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1>Admin Dashboard 👑</h1>
            <p>Manage the FixItNow platform</p>
          </div>

          {/* Admin Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-user-friends"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalCustomers}</h3>
                <p>Customers</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-wrench"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalTechnicians}</h3>
                <p>Technicians</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalBookings}</h3>
                <p>Total Bookings</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.activeBookings}</h3>
                <p>Active Bookings</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.completedBookings}</h3>
                <p>Completed</p>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="recent-activity">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <Link to="/admin/bookings" className="btn-link">
                View All
              </Link>
            </div>
            <div className="activity-card">
              {recentBookings.length > 0 ? (
                <div className="bookings-list">
                  {recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="booking-item">
                      <div className="booking-info">
                        <h4>{booking.serviceType}</h4>
                        <p>
                          {booking.customerId?.firstName}{" "}
                          {booking.customerId?.lastName} →{" "}
                          {booking.technicianId?.firstName}{" "}
                          {booking.technicianId?.lastName}
                        </p>
                        <span className={`status status-${booking.status}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="booking-date">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-calendar"></i>
                  <h3>No Bookings Yet</h3>
                  <p>The platform is waiting for first bookings</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Administration</h2>
            <div className="actions-grid">
              <Link to="/admin/users" className="action-card">
                <i className="fas fa-users-cog"></i>
                <h3>Manage Users</h3>
                <p>Add, edit, or remove users</p>
              </Link>

              <Link to="/admin/bookings" className="action-card">
                <i className="fas fa-calendar-check"></i>
                <h3>Manage Bookings</h3>
                <p>Oversee all bookings</p>
              </Link>

              <Link to="/admin/analytics" className="action-card">
                <i className="fas fa-chart-bar"></i>
                <h3>Analytics</h3>
                <p>View platform statistics</p>
              </Link>

              <Link to="/admin/settings" className="action-card">
                <i className="fas fa-cog"></i>
                <h3>Settings</h3>
                <p>Configure platform settings</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
