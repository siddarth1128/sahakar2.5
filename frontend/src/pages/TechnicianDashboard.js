import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaBriefcase,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaDollarSign,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaChartLine,
  FaStar,
  FaMapMarkerAlt,
  FaPhone,
  FaCamera,
  FaTimes,
  FaCheck,
  FaBars,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "../styles/TechnicianDashboard.css";

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState("jobs");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [availability, setAvailability] = useState("available");
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  // Helper function to get base URL without /api suffix
  const getBaseUrl = () => {
    return (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
      /\/api$/,
      "",
    );
  };

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, redirecting to login");
        navigate("/login");
        return;
      }

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`${getBaseUrl()}/api/technician/dashboard?_t=${timestamp}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: 'no-cache',
      });

      if (response.status === 401) {
        console.log("Unauthorized, redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
        setAvailability(data.data.technician.availability || "available");
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      if (error.message !== "Failed to fetch dashboard data") {
        toast.error("Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Fetch weekly stats
  const fetchWeeklyStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return; // Don't try to fetch if no token
      }

      const timestamp = new Date().getTime();
      const response = await fetch(`${getBaseUrl()}/api/technician/stats?_t=${timestamp}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: 'no-cache',
      });

      if (response.status === 401) {
        // Token is invalid, will be handled by fetchDashboard
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWeeklyStats(data.data.weeklyStats);
        }
      }
    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  }, []);

  useEffect(() => {
    // Check if token exists before making any API calls
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchDashboard();
    fetchWeeklyStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        fetchDashboard();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboard, fetchWeeklyStats, navigate]);

  // Toggle availability
  const handleAvailabilityToggle = async () => {
    try {
      const newStatus = availability === "available" ? "offline" : "available";
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${getBaseUrl()}/api/technician/availability`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ availability: newStatus }),
        },
      );

      if (response.ok) {
        setAvailability(newStatus);
        toast.success(
          `You are now ${newStatus === "available" ? "online" : "offline"}`,
        );
      }
    } catch (error) {
      console.error("Availability toggle error:", error);
      toast.error("Failed to update availability");
    }
  };

  // Accept job request
  const handleAcceptJob = async (jobId) => {
    setProcessingAction(jobId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${getBaseUrl()}/api/technician/requests/${jobId}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        toast.success("Job accepted successfully!");
        fetchDashboard();
      } else {
        throw new Error("Failed to accept job");
      }
    } catch (error) {
      console.error("Accept job error:", error);
      toast.error("Failed to accept job");
    } finally {
      setProcessingAction(null);
    }
  };

  // Reject job request
  const handleRejectJob = async (jobId) => {
    setProcessingAction(jobId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${getBaseUrl()}/api/technician/requests/${jobId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: "Not available" }),
        },
      );

      if (response.ok) {
        toast.success("Job rejected");
        await fetchDashboard();
      } else {
        throw new Error("Failed to reject job");
      }
    } catch (error) {
      console.error("Reject job error:", error);
      toast.error("Failed to reject job");
    } finally {
      setProcessingAction(null);
    }
  };

  // Mark job as complete
  const handleCompleteJob = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${getBaseUrl()}/api/technician/jobs/${jobId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes: "Job completed successfully",
          }),
        },
      );

      if (response.ok) {
        toast.success("Job marked as complete!");
        fetchDashboard();
      } else {
        throw new Error("Failed to complete job");
      }
    } catch (error) {
      console.error("Complete job error:", error);
      toast.error("Failed to complete job");
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="tech-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const activeJobs = dashboardData?.activeJobs || [];
  const pendingRequests = dashboardData?.pendingRequests || [];
  const upcomingJobs = dashboardData?.upcomingJobs || [];

  return (
    <div className="technician-dashboard">
      {/* Mobile Header */}
      <div className="tech-mobile-header">
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FaBars />
        </button>
        <h1 className="tech-mobile-title">FixIt Dashboard</h1>
        <div className="tech-mobile-user">
          <FaBell className="notification-icon" />
          <span className="notification-badge">{pendingRequests.length}</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`tech-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-brand">FixIt Pro</h2>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "jobs" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("jobs");
              setSidebarOpen(false);
            }}
          >
            <FaBriefcase className="nav-icon" />
            <span>Jobs</span>
          </button>
          <button
            className={`nav-item ${activeTab === "accepted" ? "active" : ""}`}
            onClick={() => {
              navigate("/technician/accepted");
              setSidebarOpen(false);
            }}
          >
            <FaCheckCircle className="nav-icon" />
            <span>Accepted</span>
          </button>
          <button
            className={`nav-item ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => {
              navigate("/technician/requests");
              setSidebarOpen(false);
            }}
          >
            <FaClock className="nav-icon" />
            <span>Requests</span>
            {pendingRequests.length > 0 && (
              <span className="badge">{pendingRequests.length}</span>
            )}
          </button>
          <button
            className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => {
              navigate("/technician/profile");
              setSidebarOpen(false);
            }}
          >
            <FaUser className="nav-icon" />
            <span>Profile</span>
          </button>
          <button
            className={`nav-item ${activeTab === "earnings" ? "active" : ""}`}
            onClick={() => {
              navigate("/technician/earnings");
              setSidebarOpen(false);
            }}
          >
            <FaDollarSign className="nav-icon" />
            <span>Earnings</span>
          </button>
          <button
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => {
              navigate("/technician/settings");
              setSidebarOpen(false);
            }}
          >
            <FaCog className="nav-icon" />
            <span>Settings</span>
          </button>
        </nav>

        <button className="nav-item logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="nav-icon" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="tech-main-content">
        {/* Top Stats Bar */}
        <div className="top-stats-bar">
          <div className="stat-card earnings">
            <div className="stat-icon">
              <FaDollarSign />
            </div>
            <div className="stat-info">
              <h3>₹{stats.weeklyEarnings?.toLocaleString() || 0}</h3>
              <p>This Week</p>
              <span
                className={`stat-change ${stats.earningsChange >= 0 ? "positive" : "negative"}`}
              >
                {stats.earningsChange >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(stats.earningsChange)}%
              </span>
            </div>
          </div>

          <div className="stat-card rating">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-info">
              <h3>{stats.rating?.toFixed(1) || "0.0"} ★</h3>
              <p>Rating</p>
              <span className="stat-detail">
                ({stats.reviewCount || 0} reviews)
              </span>
            </div>
          </div>

          <div className="stat-card jobs">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <h3>{stats.totalJobsCompleted || 0}</h3>
              <p>Jobs Completed</p>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="availability-section">
          <div className="availability-card">
            <div className="availability-status">
              <span className={`status-indicator ${availability}`}></span>
              <span className="status-text">
                {availability === "available"
                  ? "🟢 Available Now"
                  : "🔴 Offline"}
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={availability === "available"}
                onChange={handleAvailabilityToggle}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Active Jobs Section */}
        {activeJobs.length > 0 && (
          <section className="dashboard-section">
            <h2 className="section-title">
              <FaBriefcase /> Live Job - In Progress
            </h2>
            {activeJobs.map((job) => (
              <div key={job._id} className="live-job-card">
                <div className="job-header">
                  <div className="job-icon">🔧</div>
                  <div className="job-info">
                    <h3>{job.title}</h3>
                    <p className="customer-name">
                      {job.customer?.firstName} {job.customer?.lastName}
                    </p>
                  </div>
                </div>
                <div className="job-location">
                  <FaMapMarkerAlt />
                  <span>{job.location?.address}</span>
                </div>
                <div className="job-actions">
                  <button className="btn-secondary">
                    <FaCamera /> Upload Photos
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => handleCompleteJob(job._id)}
                  >
                    <FaCheck /> Mark Complete
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <section className="dashboard-section">
            <h2 className="section-title">
              <FaClock /> Pending Requests ({pendingRequests.length})
            </h2>
            <div className="requests-list">
              {pendingRequests.map((request) => (
                <div key={request._id} className="request-card">
                  <div
                    className="request-header"
                    onClick={() =>
                      setExpandedRequest(
                        expandedRequest === request._id ? null : request._id,
                      )
                    }
                  >
                    <div className="request-icon">🔧</div>
                    <div className="request-info">
                      <h4>{request.title}</h4>
                      <p className="customer-name">
                        {request.customer?.firstName}{" "}
                        {request.customer?.lastName}
                      </p>
                      <div className="request-meta">
                        <span className="price">
                          ₹{request.pricing?.totalPrice}
                        </span>
                        <span className="time">
                          {new Date(request.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <button className="expand-btn">
                      {expandedRequest === request._id ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </button>
                  </div>

                  {expandedRequest === request._id && (
                    <div className="request-details">
                      <p className="description">{request.description}</p>
                      <div className="detail-row">
                        <FaMapMarkerAlt />
                        <span>{request.location?.address}</span>
                      </div>
                      <div className="detail-row">
                        <FaPhone />
                        <span>{request.customer?.phone}</span>
                      </div>
                      <div className="request-actions">
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectJob(request._id)}
                          disabled={processingAction === request._id}
                        >
                          <FaTimes /> Reject
                        </button>
                        <button
                          className="btn-accept"
                          onClick={() => handleAcceptJob(request._id)}
                          disabled={processingAction === request._id}
                        >
                          <FaCheck /> Accept
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Jobs Section */}
        {upcomingJobs.length > 0 && (
          <section className="dashboard-section">
            <h2 className="section-title">
              <FaCheckCircle /> Upcoming Jobs
            </h2>
            <div className="upcoming-jobs-list">
              {upcomingJobs.map((job) => (
                <div key={job._id} className="upcoming-job-card">
                  <div className="job-date">
                    <span className="date-day">
                      {new Date(job.scheduledDate || job.date).getDate()}
                    </span>
                    <span className="date-month">
                      {new Date(job.scheduledDate || job.date).toLocaleString(
                        "default",
                        {
                          month: "short",
                        },
                      )}
                    </span>
                  </div>
                  <div className="job-details">
                    <h4>{job.title}</h4>
                    <p className="customer-name">
                      {job.customer?.firstName} {job.customer?.lastName}
                    </p>
                    <p className="job-price">₹{job.pricing?.totalPrice}</p>
                    <p className="job-location">{job.location?.address}</p>
                  </div>
                  <div className="job-quick-actions">
                    <button className="btn-link">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Earnings Graph */}
        {weeklyStats.length > 0 && (
          <section className="dashboard-section">
            <h2 className="section-title">
              <FaChartLine /> Weekly Earnings
            </h2>
            <div className="earnings-graph">
              <div className="graph-bars">
                {weeklyStats.map((stat, index) => {
                  const maxEarning = Math.max(
                    ...weeklyStats.map((s) => s.earnings),
                  );
                  const height =
                    maxEarning > 0 ? (stat.earnings / maxEarning) * 100 : 0;
                  return (
                    <div key={index} className="bar-wrapper">
                      <div
                        className="bar"
                        style={{ height: `${height}%` }}
                        title={`₹${stat.earnings}`}
                      >
                        <span className="bar-value">
                          {stat.earnings > 0 ? `₹${stat.earnings}` : ""}
                        </span>
                      </div>
                      <span className="bar-label">{stat.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="graph-summary">
                <p>
                  ₹{stats.weeklyEarnings?.toLocaleString() || 0} Total •{" "}
                  {weeklyStats.reduce((sum, s) => sum + s.jobs, 0)} jobs
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {pendingRequests.length === 0 &&
          activeJobs.length === 0 &&
          upcomingJobs.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No active jobs</h3>
              <p>
                {availability === "available"
                  ? "New job requests will appear here"
                  : "Turn on availability to receive job requests"}
              </p>
            </div>
          )}
      </main>

      {/* Floating SOS Button (Mobile) */}
      <button className="floating-sos-btn">
        <span className="sos-icon">🚨</span>
        <span className="sos-text">Emergency</span>
      </button>
    </div>
  );
};

export default TechnicianDashboard;
