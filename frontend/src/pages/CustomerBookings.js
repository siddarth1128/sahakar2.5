import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCustomerStats } from "../context/CustomerStatsContext";
import DashboardLayout from "../components/DashboardLayout";
import ReviewForm from "../components/ReviewForm";
import "../styles/Dashboard.css";

const CustomerBookings = () => {
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useCustomerStats();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [existingReviews, setExistingReviews] = useState({});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/bookings", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        const bookingsData = data.data.bookings || [];
        setBookings(bookingsData);
        
        // Check for existing reviews for completed bookings
        await checkExistingReviews(bookingsData);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingReviews = async (bookings) => {
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    const token = localStorage.getItem("token");
    const reviews = {};

    for (const booking of bookings.filter(b => b.status === "completed")) {
      try {
        const response = await fetch(`${API_URL}/reviews/booking/${booking._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            reviews[booking._id] = data.data.review;
          }
        }
      } catch (error) {
        // Review doesn't exist, which is fine
        console.log(`No review found for booking ${booking._id}`);
      }
    }
    
    setExistingReviews(reviews);
  };

  const handleRateService = (booking) => {
    console.log("Rate Service clicked for booking:", booking._id);
    
    // Check if review already exists
    if (existingReviews[booking._id]) {
      toast.info("You have already reviewed this service");
      return;
    }
    
    setSelectedBookingForReview(booking);
  };

  const handleReviewSubmitted = (review) => {
    setExistingReviews(prev => ({
      ...prev,
      [selectedBookingForReview._id]: review
    }));
    setSelectedBookingForReview(null);
    toast.success("Review submitted successfully!");
  };

  const handleCancelReview = () => {
    setSelectedBookingForReview(null);
  };

  const handleCancelBooking = async (booking) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel the booking for ${booking.serviceType}?`,
    );
    if (!confirmed) return;

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/bookings/${booking._id}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to cancel booking");
      }

      toast.success("Booking cancelled successfully");

      setBookings((prev) =>
        prev.map((item) =>
          item._id === booking._id ? { ...item, status: "cancelled" } : item,
        ),
      );
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.message || "Failed to cancel booking. Please try again.");
    }
  };

  const handleBookAgain = (booking) => {
    toast.success("Redirecting to booking page...");

    const bookingData = {
      serviceType: booking.serviceType,
      address: booking.address,
      description: booking.description,
    };

    localStorage.setItem("rebookingData", JSON.stringify(bookingData));
    navigate("/book-service");
  };

  const handleViewInvoice = (booking) => {
    navigate(`/invoice/${booking._id}`);
  };

  const handleViewDetails = (booking) => {
    navigate(`/booking/details/${booking._id}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      confirmed: "info",
      "in-progress": "primary",
      completed: "success",
      cancelled: "danger",
    };
    return colors[status] || "secondary";
  };

  const filteredBookings = bookings
    .filter((booking) => {
      if (filter === "all") return true;
      return booking.status === filter;
    })
    .filter((booking) =>
      booking.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  return (
    <DashboardLayout title="My Bookings">
      {/* Stats Overview */}
      <div className="dashboard-grid" style={{ marginBottom: "2rem" }}>
        <div className="dashboard-card">
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
        </div>

        <div className="dashboard-card">
          <div className="stat-item">
            <div className="stat-icon orange">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-details">
              <p className="stat-value">
                {statsLoading ? "..." : stats.pending}
              </p>
              <p className="stat-label">Pending</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="stat-item">
            <div className="stat-icon purple">
              <i className="fas fa-spinner"></i>
            </div>
            <div className="stat-details">
              <p className="stat-value">
                {statsLoading ? "..." : stats.active}
              </p>
              <p className="stat-label">Active</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
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
        </div>
      </div>

      {/* Filters and Search */}
      <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              className={`chip ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
              style={{
                background: filter === "all" ? "var(--primary)" : "",
                color: filter === "all" ? "var(--white)" : "",
              }}
            >
              All
            </button>
            <button
              className={`chip ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
              style={{
                background: filter === "pending" ? "var(--warning)" : "",
                color: filter === "pending" ? "var(--white)" : "",
              }}
            >
              Pending
            </button>
            <button
              className={`chip ${filter === "confirmed" ? "active" : ""}`}
              onClick={() => setFilter("confirmed")}
              style={{
                background: filter === "confirmed" ? "var(--info)" : "",
                color: filter === "confirmed" ? "var(--white)" : "",
              }}
            >
              Confirmed
            </button>
            <button
              className={`chip ${filter === "in-progress" ? "active" : ""}`}
              onClick={() => setFilter("in-progress")}
              style={{
                background: filter === "in-progress" ? "var(--primary)" : "",
                color: filter === "in-progress" ? "var(--white)" : "",
              }}
            >
              In Progress
            </button>
            <button
              className={`chip ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
              style={{
                background: filter === "completed" ? "var(--success)" : "",
                color: filter === "completed" ? "var(--white)" : "",
              }}
            >
              Completed
            </button>
          </div>

          <div className="search-bar" style={{ maxWidth: "300px" }}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search services..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-list"></i> Bookings
          </h3>
          <Link to="/book-service" className="btn-book">
            <i className="fas fa-plus"></i> New Booking
          </Link>
        </div>

        {loading ? (
          <div className="loading-container" style={{ padding: "3rem" }}>
            <div className="spinner-large"></div>
            <p>Loading bookings...</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-icon">
                    <i className="fas fa-tools"></i>
                  </div>
                  <div className="booking-info">
                    <h4 className="booking-title">{booking.serviceType}</h4>
                    <p className="booking-subtitle">
                      {booking.technician?.firstName}{" "}
                      {booking.technician?.lastName}
                    </p>
                  </div>
                  <span
                    className={`activity-status status-${booking.status}`}
                    style={{
                      background: `rgba(var(--${getStatusColor(booking.status)}-rgb, 0, 85, 255), 0.1)`,
                    }}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="booking-detail-item">
                    <i className="fas fa-calendar"></i>
                    <span>
                      {new Date(booking.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="booking-detail-item">
                    <i className="fas fa-clock"></i>
                    <span>{booking.time || "Not specified"}</span>
                  </div>
                  <div className="booking-detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{booking.address || "Address not specified"}</span>
                  </div>
                </div>

                {booking.description && (
                  <div className="booking-description">
                    <p>{booking.description}</p>
                  </div>
                )}

                <div className="booking-actions">
                  {booking.status === "pending" && (
                    <>
                      <button 
                        className="btn-action btn-secondary"
                        onClick={() => toast.info("Edit booking feature coming soon!")}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        className="btn-action btn-danger"
                        onClick={() => handleCancelBooking(booking)}
                      >
                        <i className="fas fa-times"></i> Cancel
                      </button>
                    </>
                  )}
                  {booking.status === "confirmed" && (
                    <>
                      <button 
                        className="btn-action btn-primary"
                        onClick={() => toast.info("Tracking feature coming soon!")}
                      >
                        <i className="fas fa-map-marked-alt"></i> Track
                      </button>
                      <button 
                        className="btn-action btn-secondary"
                        onClick={() => toast.info("Chat feature coming soon!")}
                      >
                        <i className="fas fa-comments"></i> Chat
                      </button>
                      <button 
                        className="btn-action btn-secondary"
                        onClick={() => toast.info("Call feature coming soon!")}
                      >
                        <i className="fas fa-phone"></i> Call
                      </button>
                    </>
                  )}
                  {booking.status === "in-progress" && (
                    <>
                      <button 
                        className="btn-action btn-primary"
                        onClick={() => toast.info("Live tracking feature coming soon!")}
                      >
                        <i className="fas fa-map-marked-alt"></i> Live Track
                      </button>
                      <button 
                        className="btn-action btn-secondary"
                        onClick={() => toast.info("Chat feature coming soon!")}
                      >
                        <i className="fas fa-comments"></i> Chat
                      </button>
                      <button 
                        className="btn-action btn-secondary"
                        onClick={() => toast.info("Photo upload feature coming soon!")}
                      >
                        <i className="fas fa-camera"></i> Add Photo
                      </button>
                    </>
                  )}
                  {booking.status === "completed" && (
                    <>
                      <button 
                        className={`btn-action ${existingReviews[booking._id] ? 'btn-success' : 'btn-primary'}`}
                        onClick={() => handleRateService(booking)}
                        style={{ backgroundColor: existingReviews[booking._id] ? '#00cc88' : '#0055ff', color: 'white' }}
                      >
                        <i className={`fas ${existingReviews[booking._id] ? 'fa-check' : 'fa-star'}`}></i> 
                        {existingReviews[booking._id] ? 'Reviewed' : 'Rate Service'}
                      </button>
                      <button 
                        className="btn-action btn-secondary" 
                        style={{ backgroundColor: '#4b5563', color: 'white' }}
                        onClick={() => handleBookAgain(booking)}
                      >
                        <i className="fas fa-redo"></i> Book Again
                      </button>
                      <button 
                        className="btn-action btn-secondary" 
                        style={{ backgroundColor: '#4b5563', color: 'white' }}
                        onClick={() => handleViewInvoice(booking)}
                      >
                        <i className="fas fa-file-invoice"></i> Invoice
                      </button>
                    </>
                  )}
                  {/* Debug info - remove after testing */}
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Status: {booking.status} | ID: {booking._id?.substring(0, 8)}...
                  </div>
                  <button 
                    className="btn-action btn-secondary"
                    onClick={() => handleViewDetails(booking)}
                    style={{ backgroundColor: '#4b5563', color: 'white' }}
                  >
                    <i className="fas fa-eye"></i> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <p>No bookings found</p>
            <Link to="/book-service" className="btn-book">
              <i className="fas fa-plus"></i> Create Your First Booking
            </Link>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {selectedBookingForReview && (
        <ReviewForm
          booking={selectedBookingForReview}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={handleCancelReview}
        />
      )}
    </DashboardLayout>
  );
};

export default CustomerBookings;
