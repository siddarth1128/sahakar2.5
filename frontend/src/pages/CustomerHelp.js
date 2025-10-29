import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const CustomerHelp = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);

  const faqs = [
    {
      question: "How do I book a service?",
      answer:
        "Click on 'Find Technician' or 'Book Service' button, select your desired service, choose a technician, and confirm your booking.",
    },
    {
      question: "How can I track my technician?",
      answer:
        "Once your booking is confirmed, you can track your technician in real-time from the 'My Bookings' page.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, debit cards, and digital wallets including PayPal and Apple Pay.",
    },
    {
      question: "Can I cancel or reschedule my booking?",
      answer:
        "Yes, you can cancel or reschedule your booking up to 2 hours before the scheduled time without any charges.",
    },
    {
      question: "How do I rate a technician?",
      answer:
        "After your service is completed, you'll receive a notification to rate and review the technician's service.",
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer:
        "Contact our customer support team immediately. We offer a satisfaction guarantee and will work to resolve any issues.",
    },
  ];

  return (
    <DashboardLayout title="Help Center">
      <div className="dashboard-grid">
        <div className="dashboard-card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-question-circle"></i> Frequently Asked
              Questions
            </h3>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${activeFAQ === index ? "active" : ""}`}
              >
                <button
                  className="faq-question"
                  onClick={() =>
                    setActiveFAQ(activeFAQ === index ? null : index)
                  }
                >
                  {faq.question}
                  <i className="fas fa-chevron-down"></i>
                </button>
                <div className="faq-answer">
                  <div className="faq-answer-content">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="contact-card" style={{ border: "none", padding: 0 }}>
            <div className="contact-icon">
              <i className="fas fa-headset"></i>
            </div>
            <div className="contact-info">
              <p className="contact-label">24/7 Customer Support</p>
              <Link
                to="/customer/support"
                className="contact-value"
                style={{ color: "var(--primary)" }}
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="contact-card" style={{ border: "none", padding: 0 }}>
            <div className="contact-icon">
              <i className="fas fa-book"></i>
            </div>
            <div className="contact-info">
              <p className="contact-label">User Guide</p>
              <button
                onClick={() => console.log("Open documentation")}
                className="contact-value"
                style={{
                  color: "var(--primary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  font: "inherit",
                }}
              >
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerHelp;
