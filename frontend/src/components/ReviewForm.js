import React, { useState } from "react";
import { toast } from "react-toastify";

const ReviewForm = ({ booking, onReviewSubmitted, onCancel }) => {
  const [formData, setFormData] = useState({
    overall: 5,
    punctuality: 5,
    quality: 5,
    communication: 5,
    professionalism: 5,
    valueForMoney: 5,
    title: "",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.comment.trim()) {
      toast.error("Please provide a comment");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking._id,
          revieweeId: booking.technicianId._id,
          reviewerType: "customer",
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Review submitted successfully!");
        onReviewSubmitted(data.data.review);
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ category, value, onChange }) => {
    return (
      <div className="star-rating-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= value ? "filled" : ""}`}
            onClick={() => onChange(category, star)}
          >
            <i className="fas fa-star"></i>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="review-form-modal">
      <div className="review-form-content">
        <div className="review-form-header">
          <h3>Rate Your Experience</h3>
          <button
            type="button"
            className="close-btn"
            onClick={onCancel}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="booking-info">
          <div className="technician-info">
            <div className="tech-avatar">
              {booking.technicianId.avatar ? (
                <img src={booking.technicianId.avatar} alt="Technician" />
              ) : (
                <div className="avatar-placeholder">
                  {booking.technicianId.firstName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="tech-details">
              <h4>{booking.technicianId.firstName} {booking.technicianId.lastName}</h4>
              <p>{booking.serviceType}</p>
              <span className="booking-date">
                {new Date(booking.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-sections">
            <div className="rating-section">
              <label>Overall Rating</label>
              <StarRating
                category="overall"
                value={formData.overall}
                onChange={handleRatingChange}
              />
            </div>

            <div className="rating-section">
              <label>Punctuality</label>
              <StarRating
                category="punctuality"
                value={formData.punctuality}
                onChange={handleRatingChange}
              />
            </div>

            <div className="rating-section">
              <label>Quality of Work</label>
              <StarRating
                category="quality"
                value={formData.quality}
                onChange={handleRatingChange}
              />
            </div>

            <div className="rating-section">
              <label>Communication</label>
              <StarRating
                category="communication"
                value={formData.communication}
                onChange={handleRatingChange}
              />
            </div>

            <div className="rating-section">
              <label>Professionalism</label>
              <StarRating
                category="professionalism"
                value={formData.professionalism}
                onChange={handleRatingChange}
              />
            </div>

            <div className="rating-section">
              <label>Value for Money</label>
              <StarRating
                category="valueForMoney"
                value={formData.valueForMoney}
                onChange={handleRatingChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Review Title (Optional)</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief summary of your experience"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="comment">Your Review *</label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Share your experience with this technician..."
              rows="4"
              maxLength="1000"
              required
            />
            <div className="character-count">
              {formData.comment.length}/1000 characters
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
