import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaInbox,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaDollarSign,
  FaCalendarAlt,
  FaTools,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaArrowLeft,
  FaInfoCircle,
  FaExclamationCircle,
  FaSearch,
  FaFilter,
  FaBell,
  FaTimesCircle,
  FaStar,
} from "react-icons/fa";
import "../styles/TechnicianPages.css";

const TechnicianRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Fetch pending requests
  const fetchPendingRequests = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_URL}/bookings?status=pending&_t=${timestamp}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: 'no-cache', // Force fresh data
        });

        if (!response.ok) {
          throw new Error("Failed to fetch pending requests");
        }

        const data = await response.json();
        if (data.success) {
          setPendingRequests(data.data.bookings || []);
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        toast.error("Failed to load pending requests");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [API_URL, navigate],
  );

  useEffect(() => {
    fetchPendingRequests();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPendingRequests(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchPendingRequests]);

  // Refresh requests
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingRequests(true);
    toast.success("Refreshing requests...");
  };

  // Accept request
  const handleAcceptRequest = async (bookingId) => {
    if (!window.confirm("Do you want to accept this booking request?")) {
      return;
    }

    try {
      setProcessingAction(bookingId);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/bookings/${bookingId}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Request accepted successfully!");
        // Force immediate refresh
        await fetchPendingRequests(false);
        // Show notification to customer
        sendNotification(bookingId, "accepted");
      } else {
        toast.error(data.message || "Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    } finally {
      setProcessingAction(null);
    }
  };

  // Show reject modal
  const handleShowRejectModal = (booking) => {
    setRequestToReject(booking);
    setShowRejectModal(true);
    setRejectionReason("");
  };

  // Reject request
  const handleRejectRequest = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessingAction(requestToReject._id);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/bookings/${requestToReject._id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: rejectionReason,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Request rejected");
        setShowRejectModal(false);
        setRequestToReject(null);
        setRejectionReason("");
        // Force immediate refresh
        await fetchPendingRequests(false);
        // Send notification to customer
        sendNotification(requestToReject._id, "rejected");
      } else {
        toast.error(data.message || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    } finally {
      setProcessingAction(null);
    }
  };

  // Send notification to customer
  const sendNotification = async (bookingId, action) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          type: `booking_${action}`,
          message: `Your booking request has been ${action}`,
        }),
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Contact customer
  const handleContactCustomer = (booking) => {
    if (booking.customer?.phone) {
      window.open(`tel:${booking.customer.phone}`, "_self");
    } else {
      toast.error("Customer phone number not available");
    }
  };

  // Get directions
  const handleGetDirections = (booking) => {
    if (booking.address) {
      const address =
        `${booking.address.street || ""}, ${booking.address.city || ""}, ${booking.address.state || ""} ${booking.address.zipCode || ""}`.trim();
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
      window.open(mapsUrl, "_blank");
    } else {
      toast.error("Address not available");
    }
  };

  // Filter and sort requests
  const getFilteredAndSortedRequests = () => {
    let filtered = [...pendingRequests];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.customer?.firstName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          req.customer?.lastName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          req.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((req) => req.bookingType === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "scheduledDate") {
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
      } else if (sortBy === "price") {
        return (b.totalPrice || 0) - (a.totalPrice || 0);
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

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Get booking type badge class
  const getBookingTypeBadgeClass = (type) => {
    return type === "precision" ? "booking-precision" : "booking-broadcast";
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

  const filteredRequests = getFilteredAndSortedRequests();

  if (loading) {
    return (
      <div className="technician-page-loading">
        <FaSpinner className="spinner" />
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="technician-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button
            className="back-btn"
            onClick={() => navigate("/technician/dashboard")}
          >
            <FaArrowLeft />
          </button>
          <div className="header-content">
            <h1>
              <FaInbox className="header-icon" />
              Booking Requests
            </h1>
            <p className="header-subtitle">
              Review and respond to customer booking requests
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
            <FaInbox />
          </div>
          <div className="stat-content">
            <h3>{pendingRequests.length}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon precision">
            <FaUser />
          </div>
          <div className="stat-content">
            <h3>
              {
                pendingRequests.filter((r) => r.bookingType === "precision")
                  .length
              }
            </h3>
            <p>Direct Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon broadcast">
            <FaBell />
          </div>
          <div className="stat-content">
            <h3>
              {
                pendingRequests.filter((r) => r.bookingType === "broadcast")
                  .length
              }
            </h3>
            <p>Broadcast Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon urgent">
            <FaExclamationCircle />
          </div>
          <div className="stat-content">
            <h3>
              {
                pendingRequests.filter(
                  (r) => r.priority === "urgent" || r.priority === "high",
                ).length
              }
            </h3>
            <p>Urgent</p>
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
            <button className="clear-search" onClick={() => setSearchTerm("")}>
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
            <label>Booking Type:</label>
            <div className="filter-buttons">
              <button
                className={filterType === "all" ? "active" : ""}
                onClick={() => setFilterType("all")}
              >
                All Requests
              </button>
              <button
                className={filterType === "precision" ? "active" : ""}
                onClick={() => setFilterType("precision")}
              >
                Direct
              </button>
              <button
                className={filterType === "broadcast" ? "active" : ""}
                onClick={() => setFilterType("broadcast")}
              >
                Broadcast
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
                Newest First
              </button>
              <button
                className={sortBy === "scheduledDate" ? "active" : ""}
                onClick={() => setSortBy("scheduledDate")}
              >
                Scheduled Date
              </button>
              <button
                className={sortBy === "price" ? "active" : ""}
                onClick={() => setSortBy("price")}
              >
                Price
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

      {/* Requests List */}
      <div className="requests-section">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <FaInfoCircle className="empty-icon" />
            <h3>No Pending Requests</h3>
            <p>
              {searchTerm || filterType !== "all"
                ? "No requests match your search or filter criteria"
                : "You don't have any pending booking requests at the moment"}
            </p>
            {(searchTerm || filterType !== "all") && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="requests-list">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className={`request-card ${expandedRequest === request._id ? "expanded" : ""}`}
              >
                {/* Request Header */}
                <div className="request-header">
                  <div className="request-title">
                    <FaTools className="request-icon" />
                    <div>
                      <h3>{request.serviceType}</h3>
                      <div className="request-meta">
                        <span className="booking-id">
                          #{request.bookingId || request._id.slice(-6)}
                        </span>
                        <span className="time-ago">
                          <FaClock /> {formatTimeAgo(request.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="request-badges">
                    <span
                      className={`booking-type-badge ${getBookingTypeBadgeClass(request.bookingType)}`}
                    >
                      {request.bookingType === "precision"
                        ? "Direct"
                        : "Broadcast"}
                    </span>
                    {request.priority && (
                      <span
                        className={`priority-badge ${getPriorityBadgeClass(request.priority)}`}
                      >
                        {request.priority}
                      </span>
                    )}
                  </div>
                </div>

                {/* Request Info */}
                <div className="request-info">
                  <div className="info-row">
                    <FaUser />
                    <span>
                      {request.customer?.firstName} {request.customer?.lastName}
                    </span>
                  </div>
                  <div className="info-row">
                    <FaCalendarAlt />
                    <span>
                      {formatDate(request.scheduledDate)} at{" "}
                      {formatTime(request.scheduledDate)}
                    </span>
                  </div>
                  <div className="info-row">
                    <FaMapMarkerAlt />
                    <span>
                      {request.address?.street}, {request.address?.city}
                    </span>
                  </div>
                  <div className="info-row">
                    <FaDollarSign />
                    <span className="price">
                      ${request.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRequest === request._id && (
                  <div className="request-details">
                    <div className="details-section">
                      <h4>Customer Contact</h4>
                      <div className="contact-info">
                        <div className="contact-item">
                          <FaPhone />
                          <span>{request.customer?.phone || "N/A"}</span>
                        </div>
                        <div className="contact-item">
                          <FaEnvelope />
                          <span>{request.customer?.email}</span>
                        </div>
                      </div>
                    </div>

                    {request.description && (
                      <div className="details-section">
                        <h4>Service Description</h4>
                        <p>{request.description}</p>
                      </div>
                    )}

                    {request.notes && (
                      <div className="details-section">
                        <h4>Customer Notes</h4>
                        <p>{request.notes}</p>
                      </div>
                    )}

                    <div className="details-section">
                      <h4>Full Address</h4>
                      <p>
                        {request.address?.street}
                        <br />
                        {request.address?.city}, {request.address?.state}{" "}
                        {request.address?.zipCode}
                      </p>
                    </div>

                    {request.customer?.rating && (
                      <div className="details-section">
                        <h4>Customer Rating</h4>
                        <div className="customer-rating">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < Math.floor(request.customer.rating)
                                  ? "star-filled"
                                  : "star-empty"
                              }
                            />
                          ))}
                          <span className="rating-value">
                            {request.customer.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Request Actions */}
                <div className="request-actions">
                  <button
                    className="action-btn expand"
                    onClick={() =>
                      setExpandedRequest(
                        expandedRequest === request._id ? null : request._id,
                      )
                    }
                  >
                    {expandedRequest === request._id ? (
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
                    onClick={() => handleContactCustomer(request)}
                  >
                    <FaPhone /> Call
                  </button>

                  <button
                    className="action-btn directions"
                    onClick={() => handleGetDirections(request)}
                  >
                    <FaMapMarkerAlt /> Directions
                  </button>

                  <button
                    className="action-btn accept"
                    onClick={() => handleAcceptRequest(request._id)}
                    disabled={processingAction === request._id}
                  >
                    {processingAction === request._id ? (
                      <FaSpinner className="spinner" />
                    ) : (
                      <>
                        <FaCheck /> Accept
                      </>
                    )}
                  </button>

                  <button
                    className="action-btn reject"
                    onClick={() => handleShowRejectModal(request)}
                    disabled={processingAction === request._id}
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && requestToReject && (
        <div
          className="modal-overlay"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="modal-content reject-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Reject Booking Request</h2>
              <button
                className="modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Please provide a reason for rejecting this booking request. This
                will be shared with the customer.
              </p>
              <div className="form-group">
                <label>Reason for Rejection *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="E.g., Not available at the requested time, Outside service area, etc."
                  rows="4"
                  required
                />
              </div>
              <div className="quick-reasons">
                <label>Quick Reasons:</label>
                <div className="quick-reason-buttons">
                  <button
                    onClick={() =>
                      setRejectionReason("Not available at the requested time")
                    }
                  >
                    Not Available
                  </button>
                  <button
                    onClick={() =>
                      setRejectionReason("Outside my service area")
                    }
                  >
                    Outside Area
                  </button>
                  <button
                    onClick={() =>
                      setRejectionReason("Schedule is fully booked")
                    }
                  >
                    Fully Booked
                  </button>
                  <button
                    onClick={() => setRejectionReason("Service not offered")}
                  >
                    Service Not Offered
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleRejectRequest}
                disabled={!rejectionReason.trim() || processingAction}
              >
                {processingAction ? (
                  <FaSpinner className="spinner" />
                ) : (
                  <>
                    <FaTimesCircle /> Reject Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianRequests;
