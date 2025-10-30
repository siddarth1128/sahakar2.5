import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch booking details
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        if (data.success) {
          setBooking(data.data.booking);
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <DashboardLayout title="Booking Details">
        <div className="dashboard-card">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading booking details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Booking Details">
      <div className="dashboard-card">
        <h2>Booking #{bookingId}</h2>
        {booking ? (
          <div className="booking-details-container">
            <div className="detail-section">
              <h3>Service Information</h3>
              <p><strong>Type:</strong> {booking.serviceType}</p>
              <p><strong>Description:</strong> {booking.description}</p>
            </div>
            
            <div className="detail-section">
              <h3>Scheduling</h3>
              <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {booking.time}</p>
            </div>
            
            <div className="detail-section">
              <h3>Status</h3>
              <p><strong>Current Status:</strong> {booking.status}</p>
            </div>
            
            <div className="detail-section">
              <h3>More Details Coming Soon!</h3>
              <p>This page will show:</p>
              <ul>
                <li>Full technician information</li>
                <li>Service progress timeline</li>
                <li>Chat history</li>
                <li>Attached photos</li>
                <li>Payment details</li>
              </ul>
            </div>
          </div>
        ) : (
          <p>Booking not found</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BookingDetails;
