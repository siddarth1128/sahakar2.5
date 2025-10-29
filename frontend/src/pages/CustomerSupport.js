import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

const CustomerSupport = () => {
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    message: "",
  });
  const [tickets] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Support ticket:", formData);
  };

  return (
    <DashboardLayout title="Customer Support">
      <div className="dashboard-grid">
        <div className="dashboard-card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-headset"></i> Create Support Ticket
            </h3>
          </div>
          <form className="support-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="general">General Inquiry</option>
                <option value="billing">Billing Issue</option>
                <option value="technical">Technical Problem</option>
                <option value="complaint">Complaint</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="form-textarea"
                placeholder="Describe your issue in detail..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn-book">
              <i className="fas fa-paper-plane"></i> Submit Ticket
            </button>
          </form>
        </div>

        <div className="dashboard-card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-ticket-alt"></i> Your Tickets
            </h3>
          </div>
          {tickets.length > 0 ? (
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-item">
                  <div className="ticket-info">
                    <p className="ticket-id">Ticket #{ticket.id}</p>
                    <h4 className="ticket-subject">{ticket.subject}</h4>
                    <p className="ticket-date">{ticket.date}</p>
                  </div>
                  <span className={`ticket-status ${ticket.status}`}>{ticket.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <p>No support tickets</p>
            </div>
          )}
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <i className="fas fa-phone"></i>
          </div>
          <div className="contact-info">
            <p className="contact-label">Phone Support</p>
            <p className="contact-value">+1 (555) 123-4567</p>
          </div>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="contact-info">
            <p className="contact-label">Email Support</p>
            <p className="contact-value">support@fixitnow.com</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerSupport;
