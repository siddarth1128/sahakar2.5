import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../components/DashboardLayout";

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/reviews/my-reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setReviews(data.data.reviews);
      } else {
        setError(data.message || "Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to fetch reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Review deleted successfully");
        fetchMyReviews(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review. Please try again.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Reviews">
        <div className="dashboard-card">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading your reviews...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="My Reviews">
        <div className="dashboard-card">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={fetchMyReviews} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Reviews">
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-star"></i> Your Reviews
          </h3>
        </div>

        {reviews.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="review-tech-avatar">
                    {review.revieweeId.avatar ? (
                      <img 
                        src={review.revieweeId.avatar} 
                        alt={`${review.revieweeId.firstName} ${review.revieweeId.lastName}`}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {review.revieweeId.firstName?.charAt(0) || 'T'}
                      </div>
                    )}
                  </div>
                  <div className="review-tech-info">
                    <h4 className="review-tech-name">
                      {review.revieweeId.firstName} {review.revieweeId.lastName}
                    </h4>
                    <p className="review-service">
                      {review.bookingId?.serviceType || 'Service'}
                    </p>
                  </div>
                  <div className="review-actions">
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="delete-btn"
                      title="Delete Review"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                
                {review.title && (
                  <h5 className="review-title">{review.title}</h5>
                )}
                
                <div className="review-rating">
                  <div className="overall-rating">
                    <span className="rating-label">Overall:</span>
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star star ${i < review.overall ? "filled" : ""}`}
                      ></i>
                    ))}
                    <span className="rating-value">({review.overall}/5)</span>
                  </div>
                  
                  <div className="detailed-ratings">
                    {review.punctuality && (
                      <div className="rating-item">
                        <span>Punctuality: {review.punctuality}/5</span>
                      </div>
                    )}
                    {review.quality && (
                      <div className="rating-item">
                        <span>Quality: {review.quality}/5</span>
                      </div>
                    )}
                    {review.communication && (
                      <div className="rating-item">
                        <span>Communication: {review.communication}/5</span>
                      </div>
                    )}
                    {review.professionalism && (
                      <div className="rating-item">
                        <span>Professionalism: {review.professionalism}/5</span>
                      </div>
                    )}
                    {review.valueForMoney && (
                      <div className="rating-item">
                        <span>Value: {review.valueForMoney}/5</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="review-text">{review.comment}</div>
                
                {review.response && (
                  <div className="review-response">
                    <div className="response-header">
                      <i className="fas fa-reply"></i>
                      <span>Technician Response:</span>
                    </div>
                    <div className="response-text">{review.response.comment}</div>
                    <div className="response-date">
                      {new Date(review.response.respondedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                <div className="review-footer">
                  <div className="review-date">
                    Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                  {review.isVerified && (
                    <div className="verified-badge">
                      <i className="fas fa-check-circle"></i>
                      Verified
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-star"></i>
            </div>
            <h3>No Reviews Yet</h3>
            <p>You haven't written any reviews yet.</p>
            <p>Complete a booking and share your experience!</p>
            <Link to="/customer/bookings" className="btn-primary">
              View My Bookings
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerReviews;
