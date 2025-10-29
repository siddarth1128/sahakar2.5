import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaCog,
  FaArrowLeft,
  FaSpinner,
  FaBell,
  FaLock,
  FaShieldAlt,
  FaLanguage,
  FaMoon,
  FaSun,
  FaCheckCircle,
  FaTimesCircle,
  FaKey,
  FaSignOutAlt,
  FaTrash,
  FaExclamationTriangle,
  FaSave,
  FaEnvelope,
  FaSms,
  FaMobile,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaCreditCard,
  FaUniversity,
} from "react-icons/fa";
import "../styles/TechnicianPages.css";

const TechnicianSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      newBookings: true,
      bookingUpdates: true,
      messages: true,
      promotions: false,
      reminders: true,
      weeklyReport: true,
    },
    privacy: {
      showPhone: true,
      showEmail: false,
      profileVisibility: "public",
      showRating: true,
      showCompletedJobs: true,
    },
    preferences: {
      language: "en",
      theme: "light",
      autoAcceptJobs: false,
      maxDailyJobs: 5,
      serviceRadius: 25,
      workingHours: {
        start: "09:00",
        end: "17:00",
      },
    },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Fetch settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/technician/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.settings) {
          setSettings({ ...settings, ...data.data.settings });
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/technician/settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Settings saved successfully!");
      } else {
        throw new Error(data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Update notification setting
  const handleNotificationToggle = (key) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    });
  };

  // Update privacy setting
  const handlePrivacyToggle = (key) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: !settings.privacy[key],
      },
    });
  };

  // Update preference
  const handlePreferenceChange = (key, value) => {
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value,
      },
    });
  };

  // Update working hours
  const handleWorkingHoursChange = (field, value) => {
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        workingHours: {
          ...settings.preferences.workingHours,
          [field]: value,
        },
      },
    });
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(passwordForm.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordForm.newPassword);
    const hasNumber = /[0-9]/.test(passwordForm.newPassword);
    const hasSpecialChar = /[!@#$%^&*]/.test(passwordForm.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast.error(
        "Password must contain uppercase, lowercase, number, and special character",
      );
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/auth/update-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      } else {
        throw new Error(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        localStorage.clear();
        navigate("/login");
        toast.success("Logged out successfully");
      }
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/users/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Account deleted successfully");
        localStorage.clear();
        navigate("/");
      } else {
        throw new Error(data.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="technician-page-loading">
        <FaSpinner className="spinner" />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="technician-page settings-page">
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
              <FaCog className="header-icon" />
              Settings
            </h1>
            <p className="header-subtitle">Manage your account preferences</p>
          </div>
        </div>
        <button
          className="save-btn"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? <FaSpinner className="spinner" /> : <FaSave />}
          Save Changes
        </button>
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        {/* Notifications */}
        <div className="settings-section">
          <h3>
            <FaBell /> Notification Preferences
          </h3>
          <p className="section-description">
            Choose how you want to be notified about bookings and updates
          </p>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">
                  <FaEnvelope />
                </div>
                <div>
                  <h4>Email Notifications</h4>
                  <p>Receive notifications via email</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={() => handleNotificationToggle("email")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">
                  <FaSms />
                </div>
                <div>
                  <h4>SMS Notifications</h4>
                  <p>Receive notifications via SMS</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={() => handleNotificationToggle("sms")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">
                  <FaMobile />
                </div>
                <div>
                  <h4>Push Notifications</h4>
                  <p>Receive push notifications in browser</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={() => handleNotificationToggle("push")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-divider"></div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>New Booking Requests</h4>
                  <p>Get notified when you receive new booking requests</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.newBookings}
                  onChange={() => handleNotificationToggle("newBookings")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Booking Updates</h4>
                  <p>Get notified about booking status changes</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.bookingUpdates}
                  onChange={() => handleNotificationToggle("bookingUpdates")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Messages</h4>
                  <p>Get notified when you receive messages from customers</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.messages}
                  onChange={() => handleNotificationToggle("messages")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Reminders</h4>
                  <p>Get reminded about upcoming appointments</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.reminders}
                  onChange={() => handleNotificationToggle("reminders")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Weekly Report</h4>
                  <p>Receive weekly summary of your earnings and jobs</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.weeklyReport}
                  onChange={() => handleNotificationToggle("weeklyReport")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Promotions & Updates</h4>
                  <p>Receive promotional offers and platform updates</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.promotions}
                  onChange={() => handleNotificationToggle("promotions")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="settings-section">
          <h3>
            <FaShieldAlt /> Privacy Settings
          </h3>
          <p className="section-description">
            Control what information is visible on your public profile
          </p>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Show Phone Number</h4>
                  <p>Display your phone number on your public profile</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showPhone}
                  onChange={() => handlePrivacyToggle("showPhone")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Show Email Address</h4>
                  <p>Display your email address on your public profile</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showEmail}
                  onChange={() => handlePrivacyToggle("showEmail")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Show Rating</h4>
                  <p>Display your rating and reviews on your profile</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showRating}
                  onChange={() => handlePrivacyToggle("showRating")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Show Completed Jobs</h4>
                  <p>Display number of completed jobs on your profile</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showCompletedJobs}
                  onChange={() => handlePrivacyToggle("showCompletedJobs")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Profile Visibility</h4>
                  <p>Control who can see your profile</p>
                </div>
              </div>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    privacy: {
                      ...settings.privacy,
                      profileVisibility: e.target.value,
                    },
                  })
                }
                className="setting-select"
              >
                <option value="public">Public - Everyone can see</option>
                <option value="customers">Customers Only</option>
                <option value="private">Private - Hidden from search</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <h3>
            <FaCog /> Work Preferences
          </h3>
          <p className="section-description">
            Set your work preferences and availability
          </p>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Language</h4>
                  <p>Choose your preferred language</p>
                </div>
              </div>
              <select
                value={settings.preferences.language}
                onChange={(e) =>
                  handlePreferenceChange("language", e.target.value)
                }
                className="setting-select"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Theme</h4>
                  <p>Choose your display theme</p>
                </div>
              </div>
              <div className="theme-selector">
                <button
                  className={`theme-btn ${
                    settings.preferences.theme === "light" ? "active" : ""
                  }`}
                  onClick={() => handlePreferenceChange("theme", "light")}
                >
                  <FaSun /> Light
                </button>
                <button
                  className={`theme-btn ${
                    settings.preferences.theme === "dark" ? "active" : ""
                  }`}
                  onClick={() => handlePreferenceChange("theme", "dark")}
                >
                  <FaMoon /> Dark
                </button>
              </div>
            </div>

            <div className="setting-divider"></div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Service Radius</h4>
                  <p>Maximum distance you're willing to travel (in miles)</p>
                </div>
              </div>
              <div className="range-control">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={settings.preferences.serviceRadius}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "serviceRadius",
                      parseInt(e.target.value),
                    )
                  }
                  className="range-slider"
                />
                <span className="range-value">
                  {settings.preferences.serviceRadius} miles
                </span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Maximum Daily Jobs</h4>
                  <p>Limit the number of jobs you can accept per day</p>
                </div>
              </div>
              <div className="number-control">
                <button
                  onClick={() =>
                    handlePreferenceChange(
                      "maxDailyJobs",
                      Math.max(1, settings.preferences.maxDailyJobs - 1),
                    )
                  }
                  className="number-btn"
                >
                  -
                </button>
                <span className="number-value">
                  {settings.preferences.maxDailyJobs}
                </span>
                <button
                  onClick={() =>
                    handlePreferenceChange(
                      "maxDailyJobs",
                      Math.min(20, settings.preferences.maxDailyJobs + 1),
                    )
                  }
                  className="number-btn"
                >
                  +
                </button>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Working Hours</h4>
                  <p>Set your typical working hours</p>
                </div>
              </div>
              <div className="time-control">
                <div className="time-input">
                  <label>Start:</label>
                  <input
                    type="time"
                    value={settings.preferences.workingHours.start}
                    onChange={(e) =>
                      handleWorkingHoursChange("start", e.target.value)
                    }
                  />
                </div>
                <span className="time-separator">to</span>
                <div className="time-input">
                  <label>End:</label>
                  <input
                    type="time"
                    value={settings.preferences.workingHours.end}
                    onChange={(e) =>
                      handleWorkingHoursChange("end", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <h4>Auto-Accept Jobs</h4>
                  <p>
                    Automatically accept jobs that match your criteria (use with
                    caution)
                  </p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.preferences.autoAcceptJobs}
                  onChange={() =>
                    handlePreferenceChange(
                      "autoAcceptJobs",
                      !settings.preferences.autoAcceptJobs,
                    )
                  }
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="settings-section">
          <h3>
            <FaLock /> Security
          </h3>
          <p className="section-description">
            Manage your password and security settings
          </p>
          <div className="settings-group">
            {!showPasswordForm ? (
              <button
                className="action-btn change-password-btn"
                onClick={() => setShowPasswordForm(true)}
              >
                <FaKey /> Change Password
              </button>
            ) : (
              <div className="password-form">
                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                      >
                        {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                      >
                        {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <small className="help-text">
                      Must be at least 8 characters with uppercase, lowercase,
                      number, and special character
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                      >
                        {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={saving}
                    >
                      {saving ? <FaSpinner className="spinner" /> : <FaKey />}
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="settings-section danger-zone">
          <h3>
            <FaExclamationTriangle /> Account Actions
          </h3>
          <p className="section-description">Manage your account and session</p>
          <div className="settings-group">
            <div className="action-item">
              <div className="action-info">
                <h4>Logout</h4>
                <p>Sign out from your account on this device</p>
              </div>
              <button className="action-btn logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>

            <div className="action-item danger">
              <div className="action-info">
                <h4>Delete Account</h4>
                <p>
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <button
                className="action-btn delete-btn"
                onClick={() => setShowDeleteModal(true)}
              >
                <FaTrash /> Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="settings-section">
          <h3>
            <FaCreditCard /> Payment Information
          </h3>
          <p className="section-description">Manage how you receive payments</p>
          <div className="settings-group">
            <div className="info-message">
              <FaInfoCircle />
              <p>
                To update your bank account or payment method, please contact
                support or visit your profile page.
              </p>
            </div>
            <button
              className="action-btn"
              onClick={() => navigate("/technician/profile")}
            >
              <FaUniversity /> Update Payment Details
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <FaExclamationTriangle /> Delete Account
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimesCircle />
              </button>
            </div>
            <div className="modal-body">
              <p className="warning-text">
                <strong>Warning:</strong> This action is permanent and cannot be
                undone. All your data, including:
              </p>
              <ul className="warning-list">
                <li>Profile information</li>
                <li>Job history</li>
                <li>Earnings records</li>
                <li>Reviews and ratings</li>
                <li>Messages and notifications</li>
              </ul>
              <p className="warning-text">will be permanently deleted.</p>
              <div className="form-group">
                <label>
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE"
                  className="delete-confirmation-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== "DELETE" || saving}
              >
                {saving ? <FaSpinner className="spinner" /> : <FaTrash />}
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianSettings;
