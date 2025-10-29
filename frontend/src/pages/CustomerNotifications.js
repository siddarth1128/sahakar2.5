import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Dashboard.css";

const CustomerNotifications = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingUpdates: true,
    promotions: false,
    newsletter: true,
  });

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
    // Add API call to save settings
  };

  return (
    <DashboardLayout title="Notification Settings">
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-bell"></i> Manage Notifications
          </h3>
        </div>

        <div className="settings-section">
          <h4 className="settings-section-title">
            <i className="fas fa-envelope"></i> Email Notifications
          </h4>
          <div className="settings-item">
            <div className="settings-item-info">
              <p className="settings-item-label">Email Notifications</p>
              <p className="settings-item-description">Receive updates via email</p>
            </div>
            <div
              className={`toggle-switch ${settings.emailNotifications ? "active" : ""}`}
              onClick={() => toggleSetting("emailNotifications")}
            ></div>
          </div>
          <div className="settings-item">
            <div className="settings-item-info">
              <p className="settings-item-label">Booking Updates</p>
              <p className="settings-item-description">Get notified about booking status changes</p>
            </div>
            <div
              className={`toggle-switch ${settings.bookingUpdates ? "active" : ""}`}
              onClick={() => toggleSetting("bookingUpdates")}
            ></div>
          </div>
          <div className="settings-item">
            <div className="settings-item-info">
              <p className="settings-item-label">Newsletter</p>
              <p className="settings-item-description">Receive our weekly newsletter</p>
            </div>
            <div
              className={`toggle-switch ${settings.newsletter ? "active" : ""}`}
              onClick={() => toggleSetting("newsletter")}
            ></div>
          </div>
        </div>

        <div className="settings-section" style={{ marginTop: "2rem" }}>
          <h4 className="settings-section-title">
            <i className="fas fa-mobile-alt"></i> Mobile Notifications
          </h4>
          <div className="settings-item">
            <div className="settings-item-info">
              <p className="settings-item-label">SMS Notifications</p>
              <p className="settings-item-description">Receive SMS alerts for important updates</p>
            </div>
            <div
              className={`toggle-switch ${settings.smsNotifications ? "active" : ""}`}
              onClick={() => toggleSetting("smsNotifications")}
            ></div>
          </div>
          <div className="settings-item">
            <div className="settings-item-info">
              <p className="settings-item-label">Push Notifications</p>
              <p className="settings-item-description">Get instant notifications on your device</p>
            </div>
            <div
              className={`toggle-switch ${settings.pushNotifications ? "active" : ""}`}
              onClick={() => toggleSetting("pushNotifications")}
            ></div>
          </div>
        </div>

        <div className="settings-section" style={{ marginTop: "2rem" }}>
          <h4 className="settings-section-title">
            <i className="fas fa-tag"></i> Marketing
          </h4>
          <div className="settings-item">
            <div className="settings-item-info">
              <p className="settings-item-label">Promotional Offers</p>
              <p className="settings-item-description">Receive special offers and discounts</p>
            </div>
            <div
              className={`toggle-switch ${settings.promotions ? "active" : ""}`}
              onClick={() => toggleSetting("promotions")}
            ></div>
          </div>
        </div>

        <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--gray-200)" }}>
          <button className="btn-book" onClick={handleSave}>
            <i className="fas fa-save"></i> Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerNotifications;
