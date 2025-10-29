import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

const DashboardLayout = ({ children, title = "Dashboard" }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsSubmenu, setShowSettingsSubmenu] = useState(false);
  const [notifications] = useState([]);

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

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  const navigationItems = [
    {
      icon: "fas fa-home",
      label: "Dashboard",
      path: "/customer/dashboard",
      active: window.location.pathname === "/customer/dashboard" || window.location.pathname === "/dashboard",
    },
    {
      icon: "fas fa-user",
      label: "Profile",
      path: "/profile",
      active: window.location.pathname === "/profile",
    },
    {
      icon: "fas fa-clipboard-list",
      label: "My Bookings",
      path: "/customer/bookings",
      active: window.location.pathname === "/customer/bookings",
    },
    {
      icon: "fas fa-history",
      label: "History",
      path: "/customer/history",
      active: window.location.pathname === "/customer/history",
    },
    {
      icon: "fas fa-search",
      label: "Find Technician",
      path: "/technicians",
      active: window.location.pathname === "/technicians",
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
            <h1 className="navbar-title">{title}</h1>
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
                      <Link to="/customer/notifications" className="dropdown-item">
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
        <div className="dashboard-content-modern">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
