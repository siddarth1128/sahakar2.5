import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaStar,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaDollarSign,
  FaCheckCircle,
  FaBriefcase,
  FaArrowLeft,
  FaCalendarCheck,
  FaAward,
  FaTools,
  FaCertificate,
} from "react-icons/fa";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/TechnicianPublicProfile.css";

const TechnicianPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchTechnicianProfile();
  }, [id]);

  const fetchTechnicianProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/users/technicians/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch technician profile");
      }

      const data = await response.json();
      if (data.success) {
        setTechnician(data.data.technician);
      } else {
        throw new Error(data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching technician profile:", error);
      toast.error(error.message || "Failed to load technician profile");
      navigate("/technicians");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (technician) {
      const service = technician.technicianDetails?.services?.[0] || "";
      navigate(`/book-service?technician=${technician._id}&service=${service}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading technician profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!technician) {
    return (
      <DashboardLayout title="Not Found">
        <div className="error-container">
          <h2>Technician not found</h2>
          <Link to="/technicians" className="btn-primary">
            Back to Technicians
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const rating = technician.technicianDetails?.rating || 0;
  const reviewCount = technician.technicianDetails?.totalReviews || 0;
  const services = technician.technicianDetails?.services || [];
  const hourlyRate = technician.technicianDetails?.hourlyRate || 0;
  const completedJobs = technician.technicianDetails?.completedJobs || 0;
  const availability = technician.technicianDetails?.availability || "offline";
  const bio = technician.technicianDetails?.bio || "No bio available";
  const certifications = technician.technicianDetails?.certifications || [];

  return (
    <DashboardLayout title={`${technician.firstName} ${technician.lastName}`}>
      <div className="technician-public-profile">
        {/* Header */}
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate("/technicians")}>
            <FaArrowLeft /> Back to Technicians
          </button>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* Cover Section */}
          <div className="profile-cover">
            <div className="cover-gradient"></div>
          </div>

          {/* Main Info */}
          <div className="profile-main">
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                <img
                  src={
                    technician.avatar ||
                    `https://ui-avatars.com/api/?name=${technician.firstName}+${technician.lastName}&background=667eea&color=fff&size=200`
                  }
                  alt={`${technician.firstName} ${technician.lastName}`}
                  className="profile-avatar"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${technician.firstName}+${technician.lastName}&background=667eea&color=fff&size=200`;
                  }}
                />
                {technician.isVerified && (
                  <div className="verified-badge-large">
                    <FaCheckCircle /> Verified
                  </div>
                )}
              </div>

              <div className="profile-info">
                <h1 className="profile-name">
                  {technician.firstName} {technician.lastName}
                </h1>

                {/* Rating */}
                <div className="profile-rating">
                  <div className="stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FaStar
                        key={i}
                        className={i < Math.floor(rating) ? "active" : ""}
                      />
                    ))}
                  </div>
                  <span className="rating-text">
                    {rating > 0 ? rating.toFixed(1) : "New"}
                  </span>
                  {reviewCount > 0 && (
                    <span className="review-count">({reviewCount} reviews)</span>
                  )}
                </div>

                {/* Availability Status */}
                <div className={`availability-badge ${availability}`}>
                  <span className="status-dot"></span>
                  {availability === "available"
                    ? "Available Now"
                    : availability === "busy"
                    ? "Busy"
                    : "Offline"}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="profile-actions">
              <button className="btn-primary btn-large" onClick={handleBookNow}>
                <FaCalendarCheck /> Book Now
              </button>
              <a href={`tel:${technician.phone}`} className="btn-secondary btn-large">
                <FaPhone /> Call
              </a>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-icon">
              <FaBriefcase />
            </div>
            <div className="stat-content">
              <h3>{completedJobs}</h3>
              <p>Jobs Completed</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-content">
              <h3>{rating > 0 ? rating.toFixed(1) : "New"}</h3>
              <p>Rating</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <h3>₹{hourlyRate}</h3>
              <p>Per Hour</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>~15 min</h3>
              <p>Response Time</p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="profile-content">
          {/* About Section */}
          <div className="content-section">
            <h2 className="section-title">
              <FaTools /> About
            </h2>
            <div className="section-card">
              <p className="bio-text">{bio}</p>
            </div>
          </div>

          {/* Services Section */}
          <div className="content-section">
            <h2 className="section-title">
              <FaTools /> Services Offered
            </h2>
            <div className="section-card">
              {services.length > 0 ? (
                <div className="services-grid">
                  {services.map((service, index) => (
                    <div key={index} className="service-tag">
                      <FaCheckCircle /> {service}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No services listed</p>
              )}
            </div>
          </div>

          {/* Certifications Section */}
          {certifications.length > 0 && (
            <div className="content-section">
              <h2 className="section-title">
                <FaCertificate /> Certifications
              </h2>
              <div className="section-card">
                <div className="certifications-list">
                  {certifications.map((cert, index) => (
                    <div key={index} className="certification-item">
                      <FaAward className="cert-icon" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="content-section">
            <h2 className="section-title">
              <FaPhone /> Contact Information
            </h2>
            <div className="section-card">
              <div className="contact-grid">
                {technician.phone && (
                  <div className="contact-item">
                    <FaPhone className="contact-icon" />
                    <div>
                      <p className="contact-label">Phone</p>
                      <a href={`tel:${technician.phone}`} className="contact-value">
                        {technician.phone}
                      </a>
                    </div>
                  </div>
                )}

                {technician.email && (
                  <div className="contact-item">
                    <FaEnvelope className="contact-icon" />
                    <div>
                      <p className="contact-label">Email</p>
                      <a href={`mailto:${technician.email}`} className="contact-value">
                        {technician.email}
                      </a>
                    </div>
                  </div>
                )}

                {technician.address && (
                  <div className="contact-item">
                    <FaMapMarkerAlt className="contact-icon" />
                    <div>
                      <p className="contact-label">Location</p>
                      <p className="contact-value">
                        {technician.address.city}, {technician.address.state}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bottom-cta">
          <div className="cta-content">
            <h3>Ready to book {technician.firstName}?</h3>
            <p>Get professional service at competitive rates</p>
          </div>
          <button className="btn-primary btn-large" onClick={handleBookNow}>
            <FaCalendarCheck /> Book Now
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TechnicianPublicProfile;
