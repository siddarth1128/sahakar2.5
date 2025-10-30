import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaDollarSign,
  FaArrowLeft,
  FaSpinner,
  FaCalendarAlt,
  FaChartLine,
  FaDownload,
  FaFileInvoice,
  FaCheckCircle,
  FaClock,
  FaWallet,
  FaMoneyBillWave,
  FaInfoCircle,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaReceipt,
  FaUser,
  FaTools,
  FaExclamationCircle,
} from "react-icons/fa";
import "../styles/TechnicianPages.css";

const TechnicianEarnings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState("month");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Fetch earnings data
  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/technician/earnings?range=${dateRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch earnings");
      }

      const data = await response.json();
      if (data.success) {
        setEarnings(data.data.summary);
        setTransactions(data.data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  }, [API_URL, navigate, dateRange]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  // Download statement
  const handleDownloadStatement = async () => {
    try {
      toast.loading("Generating statement...");
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/technician/earnings/statement?range=${dateRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `earnings-statement-${dateRange}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.dismiss();
        toast.success("Statement downloaded successfully");
      } else {
        throw new Error("Failed to download statement");
      }
    } catch (error) {
      console.error("Error downloading statement:", error);
      toast.dismiss();
      toast.error("Failed to download statement");
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get date range label
  const getDateRangeLabel = () => {
    const labels = {
      week: "This Week",
      month: "This Month",
      year: "This Year",
      all: "All Time",
    };
    return labels[dateRange] || "Custom";
  };

  // Filter and sort transactions
  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === "amount") {
        return (b.amount || 0) - (a.amount || 0);
      } else if (sortBy === "customer") {
        return (a.customerName || "").localeCompare(b.customerName || "");
      }
      return 0;
    });

    return filtered;
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      completed: "status-completed",
      pending: "status-pending",
      processing: "status-processing",
      failed: "status-failed",
    };
    return statusMap[status] || "status-pending";
  };

  const filteredTransactions = getFilteredTransactions();

  if (loading) {
    return (
      <div className="technician-page-loading">
        <FaSpinner className="spinner" />
        <p>Loading earnings...</p>
      </div>
    );
  }

  return (
    <div className="technician-page earnings-page">
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
              <FaDollarSign className="header-icon" />
              My Earnings
            </h1>
            <p className="header-subtitle">Track your income and transactions</p>
          </div>
        </div>
        <button className="download-btn" onClick={handleDownloadStatement}>
          <FaDownload /> Download Statement
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="date-range-filter">
        <label>
          <FaCalendarAlt /> Period:
        </label>
        <div className="range-buttons">
          <button
            className={dateRange === "week" ? "active" : ""}
            onClick={() => setDateRange("week")}
          >
            This Week
          </button>
          <button
            className={dateRange === "month" ? "active" : ""}
            onClick={() => setDateRange("month")}
          >
            This Month
          </button>
          <button
            className={dateRange === "year" ? "active" : ""}
            onClick={() => setDateRange("year")}
          >
            This Year
          </button>
          <button
            className={dateRange === "all" ? "active" : ""}
            onClick={() => setDateRange("all")}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="stats-summary earnings-summary">
        <div className="stat-card total">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(earnings?.total || 0)}</h3>
            <p>Total Earnings</p>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(earnings?.completed || 0)}</h3>
            <p>Completed Jobs</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(earnings?.pending || 0)}</h3>
            <p>Pending Payment</p>
          </div>
        </div>
        <div className="stat-card available">
          <div className="stat-icon">
            <FaWallet />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(earnings?.available || 0)}</h3>
            <p>Available Balance</p>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="earnings-chart-section">
        <div className="section-header">
          <h3>
            <FaChartLine /> Earnings Trend ({getDateRangeLabel()})
          </h3>
        </div>
        <div className="chart-container">
          <div className="chart-placeholder">
            <FaChartLine className="chart-icon" />
            <h4>Earnings Overview</h4>
            <p>Your earnings trend for {getDateRangeLabel().toLowerCase()}</p>
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="label">Average per job:</span>
                <span className="value">
                  {formatCurrency(
                    earnings?.total && earnings?.jobCount
                      ? earnings.total / earnings.jobCount
                      : 0
                  )}
                </span>
              </div>
              <div className="quick-stat">
                <span className="label">Total jobs:</span>
                <span className="value">{earnings?.jobCount || 0}</span>
              </div>
              <div className="quick-stat">
                <span className="label">Service fee:</span>
                <span className="value">
                  {formatCurrency(earnings?.serviceFee || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="transactions-section">
        <div className="section-header">
          <h3>
            <FaReceipt /> Transaction History
          </h3>
          <button
            className={`filter-toggle ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
            {showFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>

        {showFilters && (
          <div className="filter-options">
            <div className="filter-group">
              <label>Status:</label>
              <div className="filter-buttons">
                <button
                  className={filterStatus === "all" ? "active" : ""}
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </button>
                <button
                  className={filterStatus === "completed" ? "active" : ""}
                  onClick={() => setFilterStatus("completed")}
                >
                  Completed
                </button>
                <button
                  className={filterStatus === "pending" ? "active" : ""}
                  onClick={() => setFilterStatus("pending")}
                >
                  Pending
                </button>
                <button
                  className={filterStatus === "processing" ? "active" : ""}
                  onClick={() => setFilterStatus("processing")}
                >
                  Processing
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <div className="filter-buttons">
                <button
                  className={sortBy === "date" ? "active" : ""}
                  onClick={() => setSortBy("date")}
                >
                  Date
                </button>
                <button
                  className={sortBy === "amount" ? "active" : ""}
                  onClick={() => setSortBy("amount")}
                >
                  Amount
                </button>
                <button
                  className={sortBy === "customer" ? "active" : ""}
                  onClick={() => setSortBy("customer")}
                >
                  Customer
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="transactions-list">
          {filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <FaInfoCircle className="empty-icon" />
              <h3>No Transactions</h3>
              <p>
                {filterStatus !== "all"
                  ? `You don't have any ${filterStatus} transactions for the selected period`
                  : "You don't have any transactions for the selected period"}
              </p>
              {filterStatus !== "all" && (
                <button
                  className="clear-filters-btn"
                  onClick={() => setFilterStatus("all")}
                >
                  Show All Transactions
                </button>
              )}
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className={`transaction-card ${
                  expandedTransaction === transaction._id ? "expanded" : ""
                }`}
              >
                <div className="transaction-header">
                  <div className="transaction-info">
                    <div className="transaction-icon">
                      <FaFileInvoice />
                    </div>
                    <div className="transaction-main">
                      <h4>{transaction.serviceType || "Service"}</h4>
                      <div className="transaction-meta">
                        <span className="transaction-date">
                          <FaCalendarAlt />{" "}
                          {formatDate(transaction.date || transaction.createdAt)}
                        </span>
                        {transaction.customerName && (
                          <span className="transaction-customer">
                            <FaUser /> {transaction.customerName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="transaction-right">
                    <span className="transaction-amount">
                      {formatCurrency(transaction.amount || transaction.netAmount)}
                    </span>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        transaction.status
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>

                {expandedTransaction === transaction._id && (
                  <div className="transaction-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Booking ID:</span>
                        <span className="detail-value">
                          {transaction.bookingId || transaction._id.slice(-8)}
                        </span>
                      </div>
                      {transaction.customerName && (
                        <div className="detail-item">
                          <span className="detail-label">Customer:</span>
                          <span className="detail-value">
                            {transaction.customerName}
                          </span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-label">Service:</span>
                        <span className="detail-value">
                          {transaction.serviceType || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">
                          {formatDate(transaction.date || transaction.createdAt)}{" "}
                          at {formatTime(transaction.date || transaction.createdAt)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Gross Amount:</span>
                        <span className="detail-value">
                          {formatCurrency(transaction.amount || 0)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Service Fee (10%):</span>
                        <span className="detail-value">
                          -{formatCurrency(transaction.serviceFee || 0)}
                        </span>
                      </div>
                      <div className="detail-item highlight">
                        <span className="detail-label">
                          <strong>Net Amount:</strong>
                        </span>
                        <span className="detail-value">
                          <strong>
                            {formatCurrency(
                              transaction.netAmount ||
                                (transaction.amount || 0) -
                                  (transaction.serviceFee || 0)
                            )}
                          </strong>
                        </span>
                      </div>
                      {transaction.payoutDate && (
                        <div className="detail-item">
                          <span className="detail-label">Payout Date:</span>
                          <span className="detail-value">
                            {formatDate(transaction.payoutDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {transaction.description && (
                      <div className="transaction-description">
                        <h5>Description:</h5>
                        <p>{transaction.description}</p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="expand-btn"
                  onClick={() =>
                    setExpandedTransaction(
                      expandedTransaction === transaction._id
                        ? null
                        : transaction._id
                    )
                  }
                >
                  {expandedTransaction === transaction._id ? (
                    <>
                      <FaChevronUp /> Hide Details
                    </>
                  ) : (
                    <>
                      <FaChevronDown /> Show Details
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payout Information */}
      <div className="payout-info-section">
        <h3>
          <FaInfoCircle /> Payout Information
        </h3>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">
              <FaCalendarAlt />
            </div>
            <div className="info-content">
              <h4>Payout Schedule</h4>
              <p>
                Payouts are processed weekly on Mondays for all completed jobs
                from the previous week. Funds typically arrive in 2-3 business
                days via direct deposit.
              </p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <FaWallet />
            </div>
            <div className="info-content">
              <h4>Minimum Payout</h4>
              <p>
                The minimum payout amount is $50. If your balance is below this
                threshold, it will roll over to the next payout period.
              </p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <FaDollarSign />
            </div>
            <div className="info-content">
              <h4>Service Fee</h4>
              <p>
                A 10% service fee is deducted from each completed job to cover
                platform costs, payment processing, and customer support.
              </p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <FaExclamationCircle />
            </div>
            <div className="info-content">
              <h4>Tax Information</h4>
              <p>
                You are responsible for reporting and paying taxes on your
                earnings. Download your statements regularly for tax purposes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={handleDownloadStatement}>
            <FaDownload /> Download Statement
          </button>
          <button
            className="action-btn"
            onClick={() => navigate("/technician/profile")}
          >
            <FaUser /> Update Payment Info
          </button>
          <button
            className="action-btn"
            onClick={() => navigate("/technician/settings")}
          >
            <FaTools /> Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianEarnings;
