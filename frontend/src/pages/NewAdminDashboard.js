import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import toast from "react-hot-toast";
import {
  FaUsers,
  FaUserTie,
  FaUserFriends,
  FaClipboardList,
  FaDollarSign,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaCog,
} from "react-icons/fa";

const NewAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTechnicians: 0,
    totalCustomers: 0,
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again");
        return;
      }

      // Fetch all data
      const [usersRes, bookingsRes] = await Promise.all([
        fetch(`${API_URL}/users?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/bookings?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const usersData = await usersRes.json();
      const bookingsData = await bookingsRes.json();

      if (usersData.success) {
        const users = usersData.data.users || [];
        const technicians = users.filter((u) => u.userType === "technician");
        const customers = users.filter((u) => u.userType === "customer");

        setStats((prev) => ({
          ...prev,
          totalUsers: users.length,
          totalTechnicians: technicians.length,
          totalCustomers: customers.length,
        }));
      }

      if (bookingsData.success) {
        const bookings = bookingsData.data.bookings || [];
        const active = bookings.filter(
          (b) => b.status === "confirmed" || b.status === "in-progress" || b.status === "accepted"
        );
        const completed = bookings.filter((b) => b.status === "completed");
        const pending = bookings.filter((b) => b.status === "pending");

        const revenue = completed.reduce(
          (sum, b) => sum + (b.pricing?.totalPrice || 0),
          0
        );

        setStats((prev) => ({
          ...prev,
          totalBookings: bookings.length,
          activeBookings: active.length,
          completedBookings: completed.length,
          pendingBookings: pending.length,
          totalRevenue: revenue,
        }));

        setRecentBookings(bookings.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="admin-dashboard">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
            <Link to="/admin/users" className="stat-link">
              View All →
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon technicians">
              <FaUserTie />
            </div>
            <div className="stat-content">
              <h3>{stats.totalTechnicians}</h3>
              <p>Technicians</p>
            </div>
            <Link to="/admin/technicians" className="stat-link">
              Manage →
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon customers">
              <FaUserFriends />
            </div>
            <div className="stat-content">
              <h3>{stats.totalCustomers}</h3>
              <p>Customers</p>
            </div>
            <Link to="/admin/customers" className="stat-link">
              View All →
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon bookings">
              <FaClipboardList />
            </div>
            <div className="stat-content">
              <h3>{stats.totalBookings}</h3>
              <p>Total Bookings</p>
            </div>
            <Link to="/admin/bookings" className="stat-link">
              Manage →
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon active">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>{stats.activeBookings}</h3>
              <p>Active Bookings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <h3>{stats.completedBookings}</h3>
              <p>Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>{stats.pendingBookings}</h3>
              <p>Pending</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="recent-section">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <Link to="/admin/bookings" className="view-all-btn">
              View All
            </Link>
          </div>

          <div className="bookings-table">
            {recentBookings.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Technician</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>#{booking._id.slice(-6)}</td>
                      <td>
                        {booking.customerId?.firstName || booking.customer?.firstName || "N/A"}{" "}
                        {booking.customerId?.lastName || booking.customer?.lastName || ""}
                      </td>
                      <td>
                        {booking.technicianId?.firstName || booking.technician?.firstName || "Not Assigned"}
                      </td>
                      <td>{booking.serviceType || "N/A"}</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>₹{booking.pricing?.totalPrice || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No bookings yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/users" className="action-card">
              <FaUsers />
              <span>Manage Users</span>
            </Link>
            <Link to="/admin/technicians" className="action-card">
              <FaUserTie />
              <span>Manage Technicians</span>
            </Link>
            <Link to="/admin/bookings" className="action-card">
              <FaClipboardList />
              <span>View Bookings</span>
            </Link>
            <Link to="/admin/settings" className="action-card">
              <FaCog />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewAdminDashboard;
