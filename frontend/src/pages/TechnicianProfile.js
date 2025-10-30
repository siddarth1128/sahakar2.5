import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTools,
  FaDollarSign,
  FaStar,
  FaCertificate,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaSpinner,
  FaArrowLeft,
  FaCheckCircle,
  FaBriefcase,
  FaClock,
  FaAward,
  FaCalendarAlt,
  FaInfoCircle,
  FaPlus,
} from "react-icons/fa";
import "../styles/TechnicianPages.css";

const TechnicianProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    experience: "",
    hourlyRate: "",
    services: [],
    certifications: [],
    availability: "available",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },
  });
  const [newService, setNewService] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const availableServices = [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "AC Repair",
    "Appliance Repair",
    "Cleaning",
    "Pest Control",
    "Landscaping",
    "Handyman",
    "Roofing",
    "Flooring",
    "Window Repair",
    "Door Installation",
    "Locksmith",
    "General Maintenance",
  ];

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      if (data.success) {
        setProfile(data.data.user);
        setFormData({
          firstName: data.data.user.firstName || "",
          lastName: data.data.user.lastName || "",
          email: data.data.user.email || "",
          phone: data.data.user.phone || "",
          bio: data.data.user.technicianDetails?.bio || "",
          experience: data.data.user.technicianDetails?.experience || "",
          hourlyRate: data.data.user.technicianDetails?.hourlyRate || "",
          services: data.data.user.technicianDetails?.services || [],
          certifications: data.data.user.technicianDetails?.certifications || [],
          availability: data.data.user.technicianDetails?.availability || "available",
          address: {
            street: data.data.user.address?.street || "",
            city: data.data.user.address?.city || "",
            state: data.data.user.address?.state || "",
            zipCode: data.data.user.address?.zipCode || "",
            country: data.data.user.address?.country || "USA",
          },
        });
        setAvatarPreview(data.data.user.avatar || null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Add service
  const handleAddService = () => {
    if (newService && !formData.services.includes(newService)) {
      setFormData({
        ...formData,
        services: [...formData.services, newService],
      });
      setNewService("");
    }
  };

  // Remove service
  const handleRemoveService = (service) => {
    setFormData({
      ...formData,
      services: formData.services.filter((s) => s !== service),
    });
  };

  // Add certification
  const handleAddCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()],
      });
      setNewCertification("");
    }
  };

  // Remove certification
  const handleRemoveCertification = (cert) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c !== cert),
    });
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);

      // Create form data
      const formData = new FormData();
      formData.append("avatar", file);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setAvatarPreview(data.data.avatarUrl);
        toast.success("Avatar uploaded successfully");
        fetchProfile();
      } else {
        throw new Error(data.message || "Failed to upload avatar");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save profile
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("First name and last name are required");
        return;
      }

      if (formData.services.length === 0) {
        toast.error("Please add at least one service");
        return;
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          services: formData.services,
          experience: formData.experience,
          hourlyRate: parseFloat(formData.hourlyRate) || 0,
          certifications: formData.certifications,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Profile updated successfully!");
        setEditMode(false);
        fetchProfile();
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setEditMode(false);
    // Reset form data to original profile
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.technicianDetails?.bio || "",
        experience: profile.technicianDetails?.experience || "",
        hourlyRate: profile.technicianDetails?.hourlyRate || "",
        services: profile.technicianDetails?.services || [],
        certifications: profile.technicianDetails?.certifications || [],
        availability: profile.technicianDetails?.availability || "available",
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          zipCode: profile.address?.zipCode || "",
          country: profile.address?.country || "USA",
        },
      });
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/technician/availability`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availability: status }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, availability: status });
        toast.success(`Status updated to ${status}`);
        fetchProfile();
      } else {
        throw new Error(data.message || "Failed to update availability");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    }
  };

  if (loading) {
    return (
      <div className="technician-page-loading">
        <FaSpinner className="spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="technician-page profile-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/technician/dashboard")}>
            <FaArrowLeft />
          </button>
          <div className="header-content">
            <h1>
              <FaUser className="header-icon" />
              My Profile
            </h1>
            <p className="header-subtitle">Manage your professional information</p>
          </div>
        </div>
        {!editMode ? (
          <button className="edit-btn" onClick={() => setEditMode(true)}>
            <FaEdit /> Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              <FaTimes /> Cancel
            </button>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? <FaSpinner className="spinner" /> : <FaSave />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Stats */}
      <div className="stats-summary profile-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBriefcase />
          </div>
          <div className="stat-content">
            <h3>{profile?.technicianDetails?.completedJobs || 0}</h3>
            <p>Jobs Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rating">
            <FaStar />
          </div>
          <div className="stat-content">
            <h3>{profile?.technicianDetails?.rating?.toFixed(1) || "0.0"}</h3>
            <p>Average Rating</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon reviews">
            <FaAward />
          </div>
          <div className="stat-content">
            <h3>{profile?.technicianDetails?.totalReviews || 0}</h3>
            <p>Total Reviews</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon member">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </h3>
            <p>Member Since</p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Avatar Section */}
        <div className="profile-section avatar-section">
          <div className="avatar-container">
            <div className="avatar-wrapper">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="profile-avatar" />
              ) : (
                <div className="avatar-placeholder">
                  <FaUser />
                </div>
              )}
              {uploadingAvatar && (
                <div className="avatar-loading">
                  <FaSpinner className="spinner" />
                </div>
              )}
            </div>
            {editMode && (
              <div className="avatar-upload">
                <input
                  type="file"
                  id="avatar-input"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="avatar-input" className="upload-btn">
                  <FaCamera /> Change Photo
                </label>
              </div>
            )}
          </div>

          {/* Availability Toggle */}
          <div className="availability-section">
            <h4>Availability Status</h4>
            <div className="availability-toggle">
              <button
                className={`availability-btn ${formData.availability === "available" ? "active" : ""}`}
                onClick={() => !editMode && handleToggleAvailability("available")}
                disabled={editMode}
              >
                <FaCheckCircle /> Available
              </button>
              <button
                className={`availability-btn ${formData.availability === "busy" ? "active" : ""}`}
                onClick={() => !editMode && handleToggleAvailability("busy")}
                disabled={editMode}
              >
                <FaClock /> Busy
              </button>
              <button
                className={`availability-btn ${formData.availability === "offline" ? "active" : ""}`}
                onClick={() => !editMode && handleToggleAvailability("offline")}
                disabled={editMode}
              >
                <FaTimes /> Offline
              </button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="profile-section">
          <h3>
            <FaInfoCircle /> Basic Information
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label>
                First Name <span className="required">*</span>
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p className="form-value">{profile?.firstName}</p>
              )}
            </div>

            <div className="form-group">
              <label>
                Last Name <span className="required">*</span>
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p className="form-value">{profile?.lastName}</p>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaEnvelope /> Email
              </label>
              <p className="form-value disabled">{profile?.email}</p>
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>
                <FaPhone /> Phone Number
              </label>
              {editMode ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                />
              ) : (
                <p className="form-value">{profile?.phone || "Not provided"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="profile-section">
          <h3>
            <FaBriefcase /> Professional Information
          </h3>

          <div className="form-group">
            <label>Bio</label>
            {editMode ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell customers about yourself and your expertise..."
                rows="4"
              />
            ) : (
              <p className="form-value">
                {profile?.technicianDetails?.bio || "No bio provided"}
              </p>
            )}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Experience</label>
              {editMode ? (
                <select name="experience" value={formData.experience} onChange={handleChange}>
                  <option value="">Select experience</option>
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              ) : (
                <p className="form-value">
                  {profile?.technicianDetails?.experience || "Not specified"}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaDollarSign /> Hourly Rate
              </label>
              {editMode ? (
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="50"
                  min="0"
                  step="5"
                />
              ) : (
                <p className="form-value">
                  ${profile?.technicianDetails?.hourlyRate?.toFixed(2) || "0.00"}/hr
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="profile-section">
          <h3>
            <FaTools /> Services Offered <span className="required">*</span>
          </h3>

          {editMode && (
            <div className="add-item-section">
              <select
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                className="add-item-select"
              >
                <option value="">Select a service to add</option>
                {availableServices
                  .filter((service) => !formData.services.includes(service))
                  .map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
              </select>
              <button
                className="add-item-btn"
                onClick={handleAddService}
                disabled={!newService}
              >
                <FaPlus /> Add Service
              </button>
            </div>
          )}

          <div className="items-list services-list">
            {formData.services.length > 0 ? (
              formData.services.map((service) => (
                <div key={service} className="item-chip">
                  <FaTools />
                  <span>{service}</span>
                  {editMode && (
                    <button
                      className="remove-item-btn"
                      onClick={() => handleRemoveService(service)}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="empty-message">
                <FaInfoCircle /> No services added yet. Add at least one service.
              </p>
            )}
          </div>
        </div>

        {/* Certifications */}
        <div className="profile-section">
          <h3>
            <FaCertificate /> Certifications & Licenses
          </h3>

          {editMode && (
            <div className="add-item-section">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="E.g., Licensed Electrician, HVAC Certified"
                className="add-item-input"
                onKeyPress={(e) => e.key === "Enter" && handleAddCertification()}
              />
              <button
                className="add-item-btn"
                onClick={handleAddCertification}
                disabled={!newCertification.trim()}
              >
                <FaPlus /> Add Certification
              </button>
            </div>
          )}

          <div className="items-list certifications-list">
            {formData.certifications.length > 0 ? (
              formData.certifications.map((cert, index) => (
                <div key={index} className="item-chip">
                  <FaCertificate />
                  <span>{cert}</span>
                  {editMode && (
                    <button
                      className="remove-item-btn"
                      onClick={() => handleRemoveCertification(cert)}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="empty-message">
                <FaInfoCircle /> No certifications added yet.
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="profile-section">
          <h3>
            <FaMapMarkerAlt /> Service Address
          </h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Street Address</label>
              {editMode ? (
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                />
              ) : (
                <p className="form-value">{profile?.address?.street || "Not provided"}</p>
              )}
            </div>

            <div className="form-group">
              <label>City</label>
              {editMode ? (
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              ) : (
                <p className="form-value">{profile?.address?.city || "Not provided"}</p>
              )}
            </div>

            <div className="form-group">
              <label>State</label>
              {editMode ? (
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              ) : (
                <p className="form-value">{profile?.address?.state || "Not provided"}</p>
              )}
            </div>

            <div className="form-group">
              <label>ZIP Code</label>
              {editMode ? (
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  placeholder="12345"
                />
              ) : (
                <p className="form-value">{profile?.address?.zipCode || "Not provided"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="profile-section profile-completion">
          <h3>Profile Completion</h3>
          <div className="completion-info">
            <div className="completion-bar">
              <div
                className="completion-progress"
                style={{
                  width: `${calculateProfileCompletion()}%`,
                }}
              />
            </div>
            <span className="completion-percentage">{calculateProfileCompletion()}%</span>
          </div>
          <ul className="completion-checklist">
            <li className={profile?.firstName && profile?.lastName ? "completed" : ""}>
              <FaCheckCircle /> Basic information
            </li>
            <li className={profile?.phone ? "completed" : ""}>
              <FaCheckCircle /> Phone number
            </li>
            <li className={profile?.technicianDetails?.services?.length > 0 ? "completed" : ""}>
              <FaCheckCircle /> Services offered
            </li>
            <li className={profile?.technicianDetails?.hourlyRate > 0 ? "completed" : ""}>
              <FaCheckCircle /> Hourly rate
            </li>
            <li className={profile?.technicianDetails?.bio ? "completed" : ""}>
              <FaCheckCircle /> Professional bio
            </li>
            <li className={profile?.avatar ? "completed" : ""}>
              <FaCheckCircle /> Profile photo
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Calculate profile completion percentage
  function calculateProfileCompletion() {
    let completed = 0;
    const total = 6;

    if (profile?.firstName && profile?.lastName) completed++;
    if (profile?.phone) completed++;
    if (profile?.technicianDetails?.services?.length > 0) completed++;
    if (profile?.technicianDetails?.hourlyRate > 0) completed++;
    if (profile?.technicianDetails?.bio) completed++;
    if (profile?.avatar) completed++;

    return Math.round((completed / total) * 100);
  }
};

export default TechnicianProfile;
