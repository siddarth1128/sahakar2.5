import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaBriefcase,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaDollarSign,
  FaCalendarAlt,
  FaUser,
  FaTools,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaArrowLeft,
  FaInfoCircle,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaStar,
  FaComments,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import "../styles/TechnicianPages.css";

const TechnicianAccepted = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [expandedJob, setExpandedJob] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [filter, setFilter] = useState("all"); // all, today, upcoming, overdue
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date"); // date, priority, customer
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Fetch accepted jobs
  const fetchAcceptedJobs = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(
        `${API_URL}/bookings?status=accepted&_t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: 'no-cache',
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch accepted jobs");
      }

      const data = await response.json();
      if (data.success) {
        setAcceptedJobs(data.data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching accepted jobs:", error);
      toast.error("Failed to load accepted jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL, navigate]);

  useEffect(() => {
    fetchAcceptedJobs();
  }, [fetchAcceptedJobs]);

  // Refresh jobs
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAcceptedJobs(true);
    toast.success("Refreshing jobs...");
  };

  // Start job
  const handleStartJob = async (bookingId) => {
    if (!window.confirm("Are you sure you want to start this job?")) {
      return;
    }

    try {
      setProcessingAction(bookingId);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/start`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Job started successfully!");
        await fetchAcceptedJobs(false);
      } else {
        toast.error(data.message || "Failed to start job");
      }
    } catch (error) {
      console.error("Error starting job:", error);
      toast.error("Failed to start job");
    } finally {
      setProcessingAction(null);
    }
  };

  // Complete job
  const handleCompleteJob = async (bookingId) => {
    if (!window.confirm("Mark this job as completed?")) {
      return;
    }

    try {
      setProcessingAction(bookingId);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Job completed successfully!");
        await fetchAcceptedJobs(false);
      } else {
        toast.error(data.message || "Failed to complete job");
      }
    } catch (error) {
      console.error("Error completing job:", error);
      toast.error("Failed to complete job");
    } finally {
      setProcessingAction(null);
    }
  };

  // Cancel job
  const handleCancelJob = async (bookingId) => {
    const reason = window.prompt("Please provide a reason for cancellation:");
    if (!reason) {
      toast.error("Cancellation reason is required");
      return;
    }

    try {
      setProcessingAction(bookingId);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason,
            cancelledBy: "technician"
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Job cancelled successfully");
        fetchAcceptedJobs(true);
      } else {
        toast.error(data.message || "Failed to cancel job");
      }
    } catch (error) {
      console.error("Error cancelling job:", error);
      toast.error("Failed to cancel job");
    } finally {
      setProcessingAction(null);
    }
  };

  // Contact customer
  const handleContactCustomer = (job) => {
    if (job.customer?.phone) {
      window.open(`tel:${job.customer.phone}`, "_self");
    } else {
      toast.error("Customer phone number not available");
    }
  };

  // Get directions
  const handleGetDirections = (job) => {
    if (job.address) {
      const address = `${job.address.street || ""}, ${job.address.city || ""}, ${job.address.state || ""} ${job.address.zipCode || ""}`.trim();
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
      window.open(mapsUrl, "_blank");
    } else {
      toast.error("Address not available");
    }
  };

  // View job details
  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  // Filter and sort jobs
  const getFilteredAndSortedJobs = () => {
    let filtered = [...acceptedJobs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (filter === "today") {
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.scheduledDate);
        return jobDate >= today && jobDate < tomorrow;
      });
    } else if (filter === "upcoming") {
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.scheduledDate);
        return jobDate >= tomorrow;
      });
    } else if (filter === "overdue") {
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.scheduledDate);
        return jobDate < today && job.status !== "completed";
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
      } else if (sortBy === "priority") {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      } else if (sortBy === "customer") {
        const nameA = `${a.customer?.firstName || ""} ${a.customer?.lastName || ""}`;
        const nameB = `${b.customer?.firstName || ""} ${b.customer?.lastName || ""}`;
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return filtered;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Today";
    } else if (date.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: "status-pending",
      accepted: "status-accepted",
      in_progress: "status-in-progress",
      completed: "status-completed",
      cancelled: "status-cancelled",
    };
    return statusMap[status] || "status-pending";
  };

  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    const priorityMap = {
      urgent: "priority-urgent",
      high: "priority-high",
      normal: "priority-normal",
      low: "priority-low",
    };
    return priorityMap[priority] || "priority-normal";
  };

  // Check if job is overdue
  const isJobOverdue = (scheduledDate, status) => {
    if (status === "completed" || status === "cancelled") return false;
    return new Date(scheduledDate) < new Date();
  };

  const filteredJobs = getFilteredAndSortedJobs();

  if (loading) {
    return (
      <div className="technician-page-loading">
        <FaSpinner className="spinner" />
        <p>Loading accepted jobs...</p>
      </div>
    );
  }

  return (
    <div className="technician-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/technician/dashboard")}>
            <FaArrowLeft />
          </button>
          <div className="header-content">
            <h1>
              <FaCheckCircle className="header-icon" />
              Accepted Jobs
            </h1>
            <p className="header-subtitle">
              Manage your accepted and in-progress jobs
            </p>
          </div>
        </div>
        <button
          className={`refresh-btn ${refreshing ? "refreshing" : ""}`}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FaSpinner className={refreshing ? "spinning" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBriefcase />
          </div>
          <div className="stat-content">
            <h3>{acceptedJobs.length}</h3>
            <p>Total Accepted</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon in-progress">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>
              {acceptedJobs.filter((j) => j.status === "in_progress").length}
            </h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon today">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>
              {acceptedJobs.filter((j) => {
                const jobDate = new Date(j.scheduledDate);
                const today = new Date();
                jobDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                return jobDate.getTime() === today.getTime();
              }).length}
            </h3>
            <p>Today's Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon overdue">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <h3>
              {acceptedJobs.filter((j) => isJobOverdue(j.scheduledDate, j.status)).length}
            </h3>
            <p>Overdue</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer, service, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
            >
              <FaTimes />
            </button>
          )}
        </div>

        <button
          className={`filter-toggle ${showFilters ? "active" : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
          Filters
          {showFilters ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="filter-options">
          <div className="filter-group">
            <label>Date Filter:</label>
            <div className="filter-buttons">
              <button
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                All Jobs
              </button>
              <button
                className={filter === "today" ? "active" : ""}
                onClick={() => setFilter("today")}
              >
                Today
              </button>
              <button
                className={filter === "upcoming" ? "active" : ""}
                onClick={() => setFilter("upcoming")}
              >
                Upcoming
              </button>
              <button
                className={filter === "overdue" ? "active" : ""}
                onClick={() => setFilter("overdue")}
              >
                Overdue
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <div className="filter-buttons">
              <button
                className={sortBy === "date" ? "active" : ""}
                onClick={() => setSortBy("date")}
              >
                Date
              </button>
              <button
                className={sortBy === "priority" ? "active" : ""}
                onClick={() => setSortBy("priority")}
              >
                Priority
              </button>
              <button
                className={sortBy === "customer" ? "active" : ""}
                onClick={() => setSortBy("customer")}
              >
                Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="jobs-section">
        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <FaInfoCircle className="empty-icon" />
            <h3>No Accepted Jobs</h3>
            <p>
              {searchTerm || filter !== "all"
                ? "No jobs match your search or filter criteria"
                : "You haven't accepted any jobs yet"}
            </p>
            {(searchTerm || filter !== "all") && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm("");
                  setFilter("all");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="jobs-list">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className={`job-card ${expandedJob === job._id ? "expanded" : ""} ${
                  isJobOverdue(job.scheduledDate, job.status) ? "overdue" : ""
                }`}
              >
                {/* Job Header */}
                <div className="job-header">
                  <div className="job-title">
                    <FaTools className="job-icon" />
                    <div>
                      <h3>{job.serviceType}</h3>
                      <span className="booking-id">#{job.bookingId || job._id.slice(-6)}</span>
                    </div>
                  </div>
                  <div className="job-badges">
                    <span className={`status-badge ${getStatusBadgeClass(job.status)}`}>
                      {job.status.replace("_", " ")}
                    </span>
                    {job.priority && (
                      <span className={`priority-badge ${getPriorityBadgeClass(job.priority)}`}>
                        {job.priority}
                      </span>
                    )}
                    {isJobOverdue(job.scheduledDate, job.status) && (
                      <span className="overdue-badge">
                        <FaExclamationTriangle /> Overdue
                      </span>
                    )}
                  </div>
                </div>

                {/* Job Info */}
                <div className="job-info">
                  <div className="info-row">
                    <FaUser />
                    <span>
                      {job.customer?.firstName} {job.customer?.lastName}
                    </span>
                  </div>
                  <div className="info-row">
                    <FaCalendarAlt />
                    <span>
                      {formatDate(job.scheduledDate)} at {formatTime(job.scheduledDate)}
                    </span>
                  </div>
                  <div className="info-row">
                    <FaMapMarkerAlt />
                    <span>
                      {job.address?.street}, {job.address?.city}
                    </span>
                  </div>
                  <div className="info-row">
                    <FaDollarSign />
                    <span className="price">${job.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedJob === job._id && (
                  <div className="job-details">
                    <div className="details-section">
                      <h4>Customer Contact</h4>
                      <div className="contact-info">
                        <div className="contact-item">
                          <FaPhone />
                          <span>{job.customer?.phone || "N/A"}</span>
                        </div>
                        <div className="contact-item">
                          <FaEnvelope />
                          <span>{job.customer?.email}</span>
                        </div>
                      </div>
                    </div>

                    {job.description && (
                      <div className="details-section">
                        <h4>Job Description</h4>
                        <p>{job.description}</p>
                      </div>
                    )}

                    {job.notes && (
                      <div className="details-section">
                        <h4>Special Notes</h4>
                        <p>{job.notes}</p>
                      </div>
                    )}

                    <div className="details-section">
                      <h4>Full Address</h4>
                      <p>
                        {job.address?.street}<br />
                        {job.address?.city}, {job.address?.state} {job.address?.zipCode}
                      </p>
                    </div>
                  </div>
                )}

                {/* Job Actions */}
                <div className="job-actions">
                  <button
                    className="action-btn expand"
                    onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                  >
                    {expandedJob === job._id ? (
                      <>
                        <FaChevronUp /> Hide Details
                      </>
                    ) : (
                      <>
                        <FaChevronDown /> Show Details
                      </>
                    )}
                  </button>

                  <button
                    className="action-btn contact"
                    onClick={() => handleContactCustomer(job)}
                  >
                    <FaPhone /> Call
                  </button>

                  <button
                    className="action-btn directions"
                    onClick={() => handleGetDirections(job)}
                  >
                    <FaMapMarkerAlt /> Directions
                  </button>

                  {job.status === "accepted" && (
                    <button
                      className="action-btn start"
                      onClick={() => handleStartJob(job._id)}
                      disabled={processingAction === job._id}
                    >
                      {processingAction === job._id ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <>
                          <FaCheck /> Start Job
                        </>
                      )}
                    </button>
                  )}

                  {job.status === "in_progress" && (
                    <button
                      className="action-btn complete"
                      onClick={() => handleCompleteJob(job._id)}
                      disabled={processingAction === job._id}
                    >
                      {processingAction === job._id ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <>
                          <FaCheckCircle /> Complete
                        </>
                      )}
                    </button>
                  )}

                  {(job.status === "accepted" || job.status === "in_progress") && (
                    <button
                      className="action-btn cancel"
                      onClick={() => handleCancelJob(job._id)}
                      disabled={processingAction === job._id}
                    >
                      <FaTimes /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowJobDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Job Details</h2>
              <button
                className="modal-close"
                onClick={() => setShowJobDetails(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <label>Service:</label>
                <p>{selectedJob.serviceType}</p>
              </div>
              <div className="detail-group">
                <label>Customer:</label>
                <p>
                  {selectedJob.customer?.firstName} {selectedJob.customer?.lastName}
                </p>
              </div>
              <div className="detail-group">
                <label>Scheduled:</label>
                <p>
                  {formatDate(selectedJob.scheduledDate)} at{" "}
                  {formatTime(selectedJob.scheduledDate)}
                </p>
              </div>
              <div className="detail-group">
                <label>Price:</label>
                <p>${selectedJob.totalPrice?.toFixed(2)}</p>
              </div>
              <div className="detail-group">
                <label>Status:</label>
                <p>
                  <span className={`status-badge ${getStatusBadgeClass(selectedJob.status)}`}>
                    {selectedJob.status.replace("_", " ")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianAccepted;
