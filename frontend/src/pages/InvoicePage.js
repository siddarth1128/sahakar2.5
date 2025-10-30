import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const InvoicePage = () => {
  const { bookingId } = useParams();
  
  return (
    <DashboardLayout title="Invoice">
      <div className="dashboard-card">
        <h2>Invoice for Booking #{bookingId}</h2>
        <p>Invoice functionality coming soon!</p>
        <div className="placeholder-content">
          <p>This page will show:</p>
          <ul>
            <li>Service details</li>
            <li>Pricing breakdown</li>
            <li>Payment information</li>
            <li>Downloadable PDF</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoicePage;
