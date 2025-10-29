import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Dashboard.css";

const CustomerPrivacy = () => {
  return (
    <DashboardLayout title="Privacy & Security">
      <div className="dashboard-grid">
        <div className="dashboard-card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-shield-alt"></i> Account Security
            </h3>
          </div>
          <div className="settings-section">
            <div className="settings-item">
              <div className="settings-item-info">
                <p className="settings-item-label">Change Password</p>
                <p className="settings-item-description">Update your account password</p>
              </div>
              <button className="btn-action btn-secondary">
                <i className="fas fa-key"></i> Change
              </button>
            </div>
            <div className="settings-item">
              <div className="settings-item-info">
                <p className="settings-item-label">Two-Factor Authentication</p>
                <p className="settings-item-description">Add an extra layer of security</p>
              </div>
              <button className="btn-action btn-primary">
                <i className="fas fa-lock"></i> Enable
              </button>
            </div>
            <div className="settings-item">
              <div className="settings-item-info">
                <p className="settings-item-label">Active Sessions</p>
                <p className="settings-item-description">Manage your login sessions</p>
              </div>
              <button className="btn-action btn-secondary">
                <i className="fas fa-eye"></i> View
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-user-secret"></i> Privacy Settings
            </h3>
          </div>
          <div className="settings-section">
            <div className="settings-item">
              <div className="settings-item-info">
                <p className="settings-item-label">Profile Visibility</p>
                <p className="settings-item-description">Control who can see your profile</p>
              </div>
              <select className="form-select" style={{ width: "auto" }}>
                <option>Everyone</option>
                <option>Technicians Only</option>
                <option>Private</option>
              </select>
            </div>
            <div className="settings-item">
              <div className="settings-item-info">
                <p className="settings-item-label">Location Sharing</p>
                <p className="settings-item-description">Share your location with technicians</p>
              </div>
              <div className="toggle-switch active"></div>
            </div>
            <div className="settings-item">
              <div className="settings-item-info">
                <p className="settings-item-label">Data Download</p>
                <p className="settings-item-description">Download all your data</p>
              </div>
              <button className="btn-action btn-secondary">
                <i className="fas fa-download"></i> Download
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header" style={{ borderBottom: "none", marginBottom: 0 }}>
            <h3 className="card-title" style={{ color: "var(--danger)" }}>
              <i className="fas fa-exclamation-triangle"></i> Danger Zone
            </h3>
          </div>
          <div className="settings-section">
            <div className="settings-item">
              <div className="settings-item-info">
                <p className="settings-item-label" style={{ color: "var(--danger)" }}>Delete Account</p>
                <p className="settings-item-description">Permanently delete your account and all data</p>
              </div>
              <button className="btn-action btn-danger">
                <i className="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerPrivacy;
