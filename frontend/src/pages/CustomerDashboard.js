import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useCustomerStats } from "../context/CustomerStatsContext";
import "../styles/Dashboard.css";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // Socket will be used for real-time features
  useSocket();
  const { stats, loading: statsLoading } = useCustomerStats();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsSubmenu, setShowSettingsSubmenu] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (user?.userType !== "customer") {
      navigate("/dashboard");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [dashboardRes, notifRes] = await Promise.all([
        fetch("http://localhost:5000/api/customer/dashboard", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5000/api/notifications", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const dashboardData = await dashboardRes.json();
      const notifData = await notifRes.json();

      if (dashboardData.success) {
        const { activeBookings, upcomingBookings } = dashboardData.data;

        // Set active bookings
        setBookings([...activeBookings, ...upcomingBookings]);

        // Find first active booking
        const active = activeBookings.find(
          (b) => b.status === "confirmed" || b.status === "in_progress",
        );
        setActiveBooking(active);
      }

      if (notifData.success) {
        setNotifications(notifData.data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  const handleAISubmit = () => {
    if (aiMessage.trim()) {
      // Navigate to booking with AI message
      navigate("/book-service", { state: { aiMessage } });
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  const navigationItems = [
    {
      icon: "fas fa-home",
      label: "Dashboard",
      path: "/customer/dashboard",
      active: true,
    },
    { icon: "fas fa-user", label: "Profile", path: "/profile", active: false },
    {
      icon: "fas fa-clipboard-list",
      label: "My Bookings",
      path: "/customer/bookings",
      active: false,
    },
    {
      icon: "fas fa-history",
      label: "History",
      path: "/customer/history",
      active: false,
    },
    {
      icon: "fas fa-search",
      label: "Find Technician",
      path: "/technicians",
      active: false,
    },
    {
      icon: "fas fa-cog",
      label: "Settings",
      path: "#",
      active: false,
      hasSubmenu: true,
    },
  ];

  const settingsSubmenu = [
    { icon: "fas fa-user-edit", label: "Edit Profile", path: "/profile" },
    { icon: "fas fa-star", label: "My Reviews", path: "/customer/reviews" },
    {
      icon: "fas fa-headset",
      label: "Customer Care",
      path: "/customer/support",
    },
    {
      icon: "fas fa-bell",
      label: "Notifications",
      path: "/customer/notifications",
    },
    {
      icon: "fas fa-shield-alt",
      label: "Privacy & Security",
      path: "/customer/privacy",
    },
    {
      icon: "fas fa-question-circle",
      label: "Help Center",
      path: "/customer/help",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-modern">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-modern">
      {/* Sidebar */}
      <aside className={`sidebar-modern ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={closeSidebar}>
            <i className="fas fa-tools"></i>
            <span className="sidebar-logo-text">FixItNow</span>
          </Link>
          <button className="sidebar-close" onClick={closeSidebar}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item, index) => (
            <div key={index} className="sidebar-nav-item-wrapper">
              {item.hasSubmenu ? (
                <>
                  <button
                    className={`sidebar-nav-item ${item.active ? "active" : ""}`}
                    onClick={() => setShowSettingsSubmenu(!showSettingsSubmenu)}
                  >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                    <i
                      className={`fas fa-chevron-${showSettingsSubmenu ? "up" : "down"} submenu-arrow`}
                    ></i>
                  </button>
                  {showSettingsSubmenu && (
                    <div className="sidebar-submenu">
                      {settingsSubmenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className="sidebar-submenu-item"
                          onClick={closeSidebar}
                        >
                          <i className={subItem.icon}></i>
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`sidebar-nav-item ${item.active ? "active" : ""}`}
                  onClick={closeSidebar}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Navbar */}
        <nav className="top-navbar">
          <div className="navbar-left">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="navbar-title">Dashboard</h1>
          </div>

          <div className="navbar-center">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search technicians, services..."
                className="search-input"
              />
            </div>
          </div>

          <div className="navbar-right">
            <div className="navbar-actions">
              <div className="navbar-notifications">
                <button
                  className="icon-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <i className="fas fa-bell"></i>
                  {unreadNotifications > 0 && (
                    <span className="notification-badge">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="notifications-dropdown">
                    <div className="dropdown-header">
                      <h3>Notifications</h3>
                      <button className="mark-read">Mark all read</button>
                    </div>
                    <div className="notifications-list">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notif, index) => (
                          <div
                            key={index}
                            className={`notification-item ${!notif.isRead ? "unread" : ""}`}
                          >
                            <div className="notification-icon">
                              <i className="fas fa-info-circle"></i>
                            </div>
                            <div className="notification-content">
                              <p className="notification-title">
                                {notif.title}
                              </p>
                              <p className="notification-message">
                                {notif.message}
                              </p>
                              <span className="notification-time">
                                {new Date(notif.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-notifications">
                          <i className="fas fa-bell-slash"></i>
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="navbar-profile">
                <button
                  className="profile-btn"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="profile-avatar">
                    {user?.firstName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="profile-name">{user?.firstName}</span>
                  <i className="fas fa-chevron-down"></i>
                </button>
                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <div className="profile-avatar-large">
                        {user?.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="profile-dropdown-name">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="profile-dropdown-email">{user?.email}</p>
                      </div>
                    </div>
                    <div className="profile-dropdown-menu">
                      <Link to="/profile" className="dropdown-item">
                        <i className="fas fa-user"></i>
                        View Profile
                      </Link>
                      <Link to="/customer/settings" className="dropdown-item">
                        <i className="fas fa-cog"></i>
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item logout"
                      >
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="dashboard-content-modern">
          {/* Active Booking Banner */}
          {activeBooking && (
            <div className="active-booking-banner">
              <div className="banner-header">
                <div className="banner-icon">
                  <i className="fas fa-tools"></i>
                </div>
                <div className="banner-info">
                  <h3 className="banner-title">
                    {activeBooking.serviceType} – {activeBooking.status}
                  </h3>
                  <p className="banner-subtitle">
                    {activeBooking.technician?.firstName}{" "}
                    {activeBooking.technician?.lastName}
                    <span className="rating">
                      <i className="fas fa-star"></i>
                      {activeBooking.technician?.rating || "4.9"}
                    </span>
                    <span className="distance">
                      <i className="fas fa-map-marker-alt"></i>
                      {activeBooking.distance || "2.1"} km away
                    </span>
                  </p>
                </div>
                <div className="banner-status">
                  <span
                    className={`status-badge status-${activeBooking.status}`}
                  >
                    {activeBooking.status}
                  </span>
                </div>
              </div>
              <div className="banner-actions">
                <button className="btn-action btn-primary">
                  <i className="fas fa-map-marked-alt"></i>
                  Live Map
                </button>
                <button className="btn-action btn-secondary">
                  <i className="fas fa-comments"></i>
                  Chat
                </button>
                <button className="btn-action btn-secondary">
                  <i className="fas fa-phone"></i>
                  Call
                </button>
                <button className="btn-action btn-secondary">
                  <i className="fas fa-camera"></i>
                  Add Photo
                </button>
                <button className="btn-action btn-danger">
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Quick Stats Card */}
            <div className="dashboard-card stats-card">
              <div className="card-header">
                <h3 className="card-title">Quick Stats</h3>
                <Link to="/customer/bookings" className="card-link">
                  View All
                </Link>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon blue">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <div className="stat-details">
                    <p className="stat-value">
                      {statsLoading ? "..." : stats.totalBookings}
                    </p>
                    <p className="stat-label">Total Bookings</p>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon green">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-details">
                    <p className="stat-value">
                      {statsLoading ? "..." : stats.completed}
                    </p>
                    <p className="stat-label">Completed</p>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon purple">
                    <i className="fas fa-hourglass-half"></i>
                  </div>
                  <div className="stat-details">
                    <p className="stat-value">
                      {statsLoading ? "..." : stats.active}
                    </p>
                    <p className="stat-label">Active Jobs</p>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon orange">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="stat-details">
                    <p className="stat-value">
                      {statsLoading ? "..." : stats.avgRating.toFixed(1)}
                    </p>
                    <p className="stat-label">Avg Rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Booking Card */}
            <div className="dashboard-card upcoming-card">
              <div className="card-header">
                <h3 className="card-title">Upcoming</h3>
              </div>
              <div className="card-body">
                {bookings.filter((b) => b.status === "confirmed").length > 0 ? (
                  <div className="upcoming-booking">
                    <div className="upcoming-icon">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="upcoming-details">
                      <p className="upcoming-service">
                        {
                          bookings.find((b) => b.status === "confirmed")
                            ?.serviceType
                        }
                      </p>
                      <p className="upcoming-date">Tomorrow at 3:00 PM</p>
                    </div>
                    <button className="btn-reschedule">Reschedule</button>
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-calendar"></i>
                    <p>No upcoming bookings</p>
                    <Link to="/book-service" className="btn-book">
                      Book a Service
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="dashboard-card quick-actions-card">
              <div className="card-header">
                <h3 className="card-title">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="quick-actions-grid">
                  <Link to="/technicians" className="quick-action-btn">
                    <div className="action-icon">
                      <i className="fas fa-search"></i>
                    </div>
                    <span>Find Technician</span>
                  </Link>
                  <Link to="/book-service" className="quick-action-btn">
                    <div className="action-icon">
                      <i className="fas fa-broadcast-tower"></i>
                    </div>
                    <span>Broadcast Issue</span>
                  </Link>
                  <button className="quick-action-btn emergency">
                    <div className="action-icon">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <span>SOS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="dashboard-card recent-activity-card">
              <div className="card-header">
                <h3 className="card-title">Recent Activity</h3>
                <Link to="/customer/history" className="card-link">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {bookings.length > 0 ? (
                  <div className="activity-list">
                    {bookings.slice(0, 3).map((booking, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          <i className="fas fa-wrench"></i>
                        </div>
                        <div className="activity-details">
                          <p className="activity-title">
                            {booking.serviceType}
                          </p>
                          <p className="activity-date">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`activity-status status-${booking.status}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Assistant Card */}
            <div className="dashboard-card ai-assistant-card">
              <div className="card-header">
                <h3 className="card-title">AI Problem Assistant</h3>
                <div className="ai-badge">
                  <i className="fas fa-robot"></i>
                  <span>Powered by AI</span>
                </div>
              </div>
              <div className="card-body">
                <div className="ai-input-container">
                  <textarea
                    className="ai-input"
                    placeholder="Describe your issue... e.g., 'My kitchen sink is leaking'"
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    rows={3}
                  ></textarea>
                  <div className="ai-actions">
                    <button className="ai-btn voice" onClick={handleVoiceInput}>
                      <i
                        className={`fas fa-microphone ${isRecording ? "recording" : ""}`}
                      ></i>
                    </button>
                    <button className="ai-btn photo">
                      <i className="fas fa-camera"></i>
                    </button>
                    <button
                      className="ai-btn send"
                      onClick={handleAISubmit}
                      disabled={!aiMessage.trim()}
                    >
                      <i className="fas fa-paper-plane"></i>
                      Send to Technicians
                    </button>
                  </div>
                </div>
                <div className="ai-suggestions">
                  <p className="suggestions-label">Quick Issues:</p>
                  <div className="suggestion-chips">
                    <button
                      className="chip"
                      onClick={() => setAiMessage("Leaking pipe in kitchen")}
                    >
                      Leaking Pipe
                    </button>
                    <button
                      className="chip"
                      onClick={() =>
                        setAiMessage("Electrical socket not working")
                      }
                    >
                      Electrical Issue
                    </button>
                    <button
                      className="chip"
                      onClick={() => setAiMessage("AC not cooling properly")}
                    >
                      AC Problem
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips & Recommendations Card */}
            <div className="dashboard-card tips-card">
              <div className="card-header">
                <h3 className="card-title">Tips & Recommendations</h3>
              </div>
              <div className="card-body">
                <div className="tip-item">
                  <div className="tip-icon">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <div className="tip-content">
                    <p className="tip-title">Winter AC Maintenance</p>
                    <p className="tip-description">
                      Schedule your AC servicing before summer arrives
                    </p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">
                    <i className="fas fa-award"></i>
                  </div>
                  <div className="tip-content">
                    <p className="tip-title">Rate Your Last Service</p>
                    <p className="tip-description">
                      Help others by sharing your experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Fixed Bottom Bar - Mobile */}
        <div className="ai-assistant-mobile">
          <button
            className="ai-fab"
            onClick={() =>
              document
                .querySelector(".ai-assistant-card")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <i className="fas fa-robot"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
