import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCustomerStats } from "../context/CustomerStatsContext";
import toast from "react-hot-toast";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Dashboard.css";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { stats, loading: statsLoading } = useCustomerStats();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Enhanced state for new features
  const [savedAddresses] = useState([
    {
      id: 1,
      name: "Home",
      address: "2nd Floor, Green Park, Delhi",
      isDefault: true,
    },
    { id: 2, name: "Office", address: "Sector 62, Noida", isDefault: false },
  ]);
  const [preferredTechnicians] = useState([
    { id: 1, name: "Ravi", rating: 4.9, avatar: "/avatar1.jpg" },
    { id: 2, name: "Anil", rating: 4.8, avatar: "/avatar2.jpg" },
    { id: 3, name: "Neha", rating: 5.0, avatar: "/avatar3.jpg" },
  ]);
  const [serviceHistory] = useState([
    { service: "Plumbing", count: 8 },
    { service: "Electrical", count: 5 },
    { service: "AC Service", count: 3 },
    { service: "Carpentry", count: 2 },
  ]);
  const [emergencyContact] = useState({
    name: "Priya Sharma",
    phone: "+91 98765 43211",
  });
  const [expandedAddresses, setExpandedAddresses] = useState({});

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const trustScore = stats.avgRating || 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleAddressExpansion = (id) => {
    setExpandedAddresses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const maxBarHeight = Math.max(...serviceHistory.map((s) => s.count));

  return (
    <DashboardLayout title="My Profile">
      {/* Hero Section */}
      <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div
            className="profile-avatar-large"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              fontWeight: "700",
              color: "white",
              marginBottom: "1.5rem",
              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
              position: "relative",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.innerHTML =
                '<i class="fas fa-camera" style="color: rgba(255,255,255,0.9)"></i>';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.innerHTML =
                user?.firstName?.charAt(0).toUpperCase() || "U";
            }}
          >
            {user?.firstName?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ marginBottom: "0.5rem", fontSize: "2rem" }}>
            {user?.firstName} {user?.lastName}
          </h2>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <span
              className="activity-status status-completed"
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                color: "var(--success)",
                padding: "0.25rem 0.75rem",
                borderRadius: "20px",
                fontSize: "0.875rem",
                fontWeight: "600",
              }}
            >
              <i className="fas fa-check-circle"></i> Phone Verified
            </span>
            <span
              className="activity-status status-completed"
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                color: "var(--success)",
                padding: "0.25rem 0.75rem",
                borderRadius: "20px",
                fontSize: "0.875rem",
                fontWeight: "600",
              }}
            >
              <i className="fas fa-id-card"></i> ID Verified
            </span>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Trust Score: {trustScore} ⭐
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-book"
              style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}
            >
              <i className="fas fa-edit"></i> Edit Profile
            </button>
          )}
        </div>
      </div>

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

        <div className="dashboard-card">
          <div className="stat-item">
            <div className="stat-icon orange">
              <i className="fas fa-star"></i>
            </div>
            <div className="stat-details">
              <p className="stat-value">
                {statsLoading ? "..." : stats.avgRating} ⭐
              </p>
              <p className="stat-label">Avg Rating Given</p>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Info Grid */}
      <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-user-edit"></i> Personal Information
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gap: "1.5rem",
              padding: "1.5rem 0",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-user"></i> Full Name
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  name="firstName"
                  className="form-input"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    background: !isEditing ? "var(--card-bg)" : "",
                    cursor: !isEditing ? "not-allowed" : "text",
                    flex: 1,
                  }}
                />
                <input
                  type="text"
                  name="lastName"
                  className="form-input"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    background: !isEditing ? "var(--card-bg)" : "",
                    cursor: !isEditing ? "not-allowed" : "text",
                    flex: 1,
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <div
                style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={true}
                  style={{
                    background: "var(--card-bg)",
                    cursor: "not-allowed",
                    opacity: "0.7",
                    flex: 1,
                  }}
                />
                <small
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                  }}
                >
                  <i className="fas fa-info-circle"></i> Email cannot be changed
                </small>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-phone"></i> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your phone number"
                style={{
                  background: !isEditing ? "var(--card-bg)" : "",
                  cursor: !isEditing ? "not-allowed" : "text",
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-map-marker-alt"></i> Default Address
              </label>
              <input
                type="text"
                className="form-input"
                value={
                  savedAddresses.find((addr) => addr.isDefault)?.address || ""
                }
                disabled
                style={{
                  background: "var(--card-bg)",
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>

          {isEditing && (
            <div
              className="booking-actions"
              style={{ justifyContent: "flex-start", marginTop: "1rem" }}
            >
              <button
                type="submit"
                className="btn-action btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: user?.firstName || "",
                    lastName: user?.lastName || "",
                    email: user?.email || "",
                    phone: user?.phone || "",
                  });
                }}
                className="btn-action btn-secondary"
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Saved Addresses */}
      <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-map-marker-alt"></i> Saved Addresses
          </h3>
          <button className="btn-book" style={{ padding: "0.5rem 1rem" }}>
            <i className="fas fa-plus"></i> Add New
          </button>
        </div>
        <div style={{ padding: "1rem 0" }}>
          {savedAddresses.map((address) => (
            <div key={address.id} style={{ marginBottom: "0.5rem" }}>
              <button
                onClick={() => toggleAddressExpansion(address.id)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  padding: "1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.3s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div>
                  <i
                    className="fas fa-chevron-down"
                    style={{
                      marginRight: "0.5rem",
                      transform: expandedAddresses[address.id]
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.3s",
                    }}
                  ></i>
                  <strong>{address.name}</strong>
                  {address.isDefault && (
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        color: "var(--primary)",
                        fontSize: "0.8rem",
                      }}
                    >
                      (Default)
                    </span>
                  )}
                </div>
              </button>
              {expandedAddresses[address.id] && (
                <div
                  style={{
                    padding: "0 2rem 1rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <p style={{ marginBottom: "0.5rem" }}>{address.address}</p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn-action btn-secondary"
                      style={{ fontSize: "0.8rem", padding: "0.25rem 0.75rem" }}
                    >
                      Set Default
                    </button>
                    <button
                      className="btn-action btn-secondary"
                      style={{ fontSize: "0.8rem", padding: "0.25rem 0.75rem" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-action btn-danger"
                      style={{ fontSize: "0.8rem", padding: "0.25rem 0.75rem" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preferred Technicians */}
      <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-star"></i> Preferred Technicians
          </h3>
        </div>
        <div
          style={{
            padding: "1rem 0",
            overflowX: "auto",
            display: "flex",
            gap: "1rem",
          }}
        >
          {preferredTechnicians.map((tech) => (
            <div
              key={tech.id}
              style={{
                minWidth: "120px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "var(--primary)",
                  margin: "0 auto 0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.5rem",
                }}
              >
                {tech.name.charAt(0)}
              </div>
              <h4 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                {tech.name}
              </h4>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                }}
              >
                <i className="fas fa-star" style={{ color: "#ffd700" }}></i>
                <span>{tech.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service History Chart */}
      <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-chart-bar"></i> Service History
          </h3>
        </div>
        <div style={{ padding: "1rem 0" }}>
          {serviceHistory.map((service, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div style={{ width: "120px", fontSize: "0.9rem" }}>
                {service.service}
              </div>
              <div
                style={{
                  flex: 1,
                  background: "var(--bg-secondary)",
                  height: "20px",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(service.count / maxBarHeight) * 100}%`,
                    height: "100%",
                    background: "var(--primary)",
                    borderRadius: "10px",
                    transition: "width 0.5s ease",
                  }}
                ></div>
              </div>
              <div
                style={{
                  width: "50px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {service.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-exclamation-triangle"></i> Emergency Contact
          </h3>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>🚨</div>
            <div>
              <h4 style={{ marginBottom: "0.25rem" }}>
                {emergencyContact.name}
              </h4>
              <p style={{ color: "var(--text-secondary)" }}>
                {emergencyContact.phone}
              </p>
            </div>
          </div>
          <div className="booking-actions">
            <button className="btn-action btn-secondary">
              <i className="fas fa-edit"></i> Edit
            </button>
            <button className="btn-action btn-primary">
              <i className="fas fa-phone"></i> Call Now
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          display: "flex",
          gap: "1rem",
        }}
      >
        <button className="btn-book" style={{ padding: "1rem" }}>
          <i className="fas fa-edit"></i> Edit Profile
        </button>
        <button className="btn-book" style={{ padding: "1rem" }}>
          <i className="fas fa-id-card"></i> View ID Proof
        </button>
        <button className="btn-action btn-danger" style={{ padding: "1rem" }}>
          <i className="fas fa-trash"></i> Delete Account
        </button>
      </div>

      {/* Mobile Quick Actions */}
      <div
        style={{
          display: "none",
          "@media (max-width: 768px)": {
            display: "flex",
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "var(--card-bg)",
            padding: "1rem",
            gap: "1rem",
          },
        }}
      >
        <button className="btn-book" style={{ flex: 1 }}>
          Edit Profile
        </button>
        <button className="btn-book" style={{ flex: 1 }}>
          View ID
        </button>
        <button className="btn-action btn-danger" style={{ flex: 1 }}>
          Delete
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
