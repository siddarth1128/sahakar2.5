import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCustomerStats } from "../context/CustomerStatsContext";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Dashboard.css";

const CustomerHistory = () => {
  const { stats, loading: statsLoading } = useCustomerStats();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/customer/history",
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setHistory(data.data.history || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history
    .filter((item) => {
      if (filter === "all") return true;
      return item.status === filter;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.date) - new Date(a.date);
      } else {
        return new Date(a.date) - new Date(b.date);
      }
    });

  return (
    <DashboardLayout title="Booking History">
      {/* Stats Overview */}
      <div className="dashboard-grid" style={{ marginBottom: "2rem" }}>
        <div className="dashboard-card">
          <div className="stat-item">
            <div className="stat-icon purple">
              <i className="fas fa-history"></i>
            </div>
            <div className="stat-details">
              <p className="stat-value">
                {statsLoading ? "..." : stats.completed + stats.cancelled}
              </p>
              <p className="stat-label">Total Services</p>
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
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="stat-details">
              <p className="stat-value">
                {statsLoading ? "..." : stats.cancelled}
              </p>
              <p className="stat-label">Cancelled</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="stat-item">
            <div className="stat-icon blue">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="stat-details">
              <p className="stat-value">
                {statsLoading ? "..." : `$${stats.totalSpent.toFixed(2)}`}
              </p>
              <p className="stat-label">Total Spent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              className="chip"
              onClick={() => setFilter("all")}
              style={{
                background: filter === "all" ? "var(--primary)" : "",
                color: filter === "all" ? "var(--white)" : "",
              }}
            >
              All
            </button>
            <button
              className="chip"
              onClick={() => setFilter("completed")}
              style={{
                background: filter === "completed" ? "var(--success)" : "",
                color: filter === "completed" ? "var(--white)" : "",
              }}
            >
              Completed
            </button>
            <button
              className="chip"
              onClick={() => setFilter("cancelled")}
              style={{
                background: filter === "cancelled" ? "var(--danger)" : "",
                color: filter === "cancelled" ? "var(--white)" : "",
              }}
            >
              Cancelled
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--gray-600)" }}>
              Sort by:
            </span>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: "auto", padding: "0.5rem 1rem" }}
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-calendar-alt"></i> Timeline
          </h3>
          <Link to="/book-service" className="btn-book">
            <i className="fas fa-plus"></i> New Booking
          </Link>
        </div>

        {loading ? (
          <div className="loading-container" style={{ padding: "3rem" }}>
            <div className="spinner-large"></div>
            <p>Loading history...</p>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="timeline">
            {filteredHistory.map((item, index) => (
              <div key={item._id} className="timeline-item">
                <div
                  className={`timeline-dot ${item.status === "completed" ? "completed" : "cancelled"}`}
                ></div>
                <div className="timeline-content">
                  <div className="timeline-date">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 className="timeline-title">{item.serviceType}</h4>
                      <p className="timeline-description">
                        Technician: {item.technician?.firstName}{" "}
                        {item.technician?.lastName}
                      </p>
                      {item.description && (
                        <p
                          className="timeline-description"
                          style={{ marginTop: "0.5rem" }}
                        >
                          {item.description}
                        </p>
                      )}
                      {item.amount && item.status === "completed" && (
                        <p
                          style={{
                            fontWeight: 600,
                            color: "var(--success)",
                            marginTop: "0.5rem",
                          }}
                        >
                          Amount: ${item.amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <span
                      className={`activity-status status-${item.status}`}
                      style={{ flexShrink: 0 }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div
                    className="booking-actions"
                    style={{
                      marginTop: "1rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--gray-100)",
                    }}
                  >
                    {item.status === "completed" && (
                      <>
                        <button className="btn-action btn-secondary">
                          <i className="fas fa-star"></i> Rate Service
                        </button>
                        <button className="btn-action btn-secondary">
                          <i className="fas fa-redo"></i> Book Again
                        </button>
                        <button className="btn-action btn-secondary">
                          <i className="fas fa-download"></i> Invoice
                        </button>
                      </>
                    )}
                    <button className="btn-action btn-secondary">
                      <i className="fas fa-eye"></i> View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-history"></i>
            <p>No booking history yet</p>
            <Link to="/book-service" className="btn-book">
              <i className="fas fa-plus"></i> Create Your First Booking
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerHistory;
