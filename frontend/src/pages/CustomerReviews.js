import React from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const CustomerReviews = () => {
  const reviews = [];

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
            {reviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <div className="review-tech-avatar">
                    {review.technician.name.charAt(0)}
                  </div>
                  <div className="review-tech-info">
                    <h4 className="review-tech-name">{review.technician.name}</h4>
                    <p className="review-service">{review.service}</p>
                  </div>
                </div>
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star star ${i < review.rating ? "filled" : ""}`}
                    ></i>
                  ))}
                </div>
                <p className="review-text">{review.comment}</p>
                <span className="review-date">{review.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-star"></i>
            <p>No reviews yet</p>
            <Link to="/customer/history" className="btn-book">
              View Completed Bookings
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerReviews;
